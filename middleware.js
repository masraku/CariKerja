import { NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()

const JWT_SECRET = process.env.JWT_SECRET
const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])
const API_RATE_LIMITS = {
  auth: { limit: 20, windowSeconds: 15 * 60 },
  admin: { limit: 180, windowSeconds: 60 },
  mutation: { limit: 60, windowSeconds: 60 },
  read: { limit: 120, windowSeconds: 60 },
}

function getClientIP(request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'anonymous'
}

function getRateLimitScope(pathname, method) {
  if (pathname.startsWith('/api/auth/')) return 'auth'
  if (pathname.startsWith('/api/admin/')) return 'admin'
  if (MUTATING_METHODS.has(method)) return 'mutation'
  return 'read'
}

async function enforceApiRateLimit(request, pathname, decodedToken) {
  if (pathname.startsWith('/api/cron/')) return null

  const scope = getRateLimitScope(pathname, request.method)
  const { limit, windowSeconds } = API_RATE_LIMITS[scope]
  const identity = decodedToken?.userId || getClientIP(request)
  const windowId = Math.floor(Date.now() / (windowSeconds * 1000))
  const key = `ratelimit:${scope}:${identity}:${windowId}`

  try {
    const count = await redis.incr(key)
    if (count === 1) {
      await redis.expire(key, windowSeconds + 5)
    }

    if (count > limit) {
      return NextResponse.json(
        { error: 'Terlalu banyak permintaan. Silakan coba lagi nanti.' },
        {
          status: 429,
          headers: { 'Retry-After': String(windowSeconds) },
        }
      )
    }
  } catch (error) {
    // Fail open so Redis issues do not take the entire application down.
    return null
  }

  return null
}

function isCsrfExempt(pathname) {
  return pathname === '/api/auth/login' ||
    pathname.startsWith('/api/auth/register/') ||
    pathname.startsWith('/api/cron/') ||
    pathname === '/api/health'
}

function hasValidCsrfToken(request) {
  const cookieToken = request.cookies.get('csrf_token')?.value
  const headerToken = request.headers.get('x-csrf-token')

  return Boolean(cookieToken && headerToken && cookieToken === headerToken)
}

function base64UrlToBytes(value) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=')
  const binary = atob(padded)
  return Uint8Array.from(binary, char => char.charCodeAt(0))
}

function decodeBase64UrlJson(value) {
  const bytes = base64UrlToBytes(value)
  const json = new TextDecoder().decode(bytes)
  return JSON.parse(json)
}

async function verifyJwt(token) {
  if (!JWT_SECRET || !token) return null

  try {
    const [encodedHeader, encodedPayload, encodedSignature] = token.split('.')
    if (!encodedHeader || !encodedPayload || !encodedSignature) return null

    const header = decodeBase64UrlJson(encodedHeader)
    if (header.alg !== 'HS256') return null

    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(JWT_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    )

    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      base64UrlToBytes(encodedSignature),
      new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`)
    )

    if (!isValid) return null

    const payload = decodeBase64UrlJson(encodedPayload)
    if (payload.exp && payload.exp < Date.now() / 1000) return null

    return payload
  } catch (error) {
    return null
  }
}

export async function middleware(request) {
  const token = request.cookies.get('token')?.value
  const pathname = request.nextUrl.pathname
  const decodedToken = token ? await verifyJwt(token) : null

  // Public routes yang tidak perlu authentication
  const publicRoutes = [
    '/',
    '/login',
    '/forgot-password',
    '/jobs',
    '/companies',
    '/about',
    '/warning',
    '/terms',
    '/privacy',
    '/news',
    '/maintenance'
  ]

  // --- MAINTENANCE MODE CHECK ---
  if (!pathname.startsWith('/api') && 
      !pathname.startsWith('/_next') && 
      !pathname.includes('favicon.ico') &&
      pathname !== '/maintenance') {
      
    try {
      const isMaintenance = await redis.get('system:maintenance');      
      if (isMaintenance === 'true' || isMaintenance === true || isMaintenance === 1) { // Menangani berbagai kemungkinan tipe data

        // Allow Login page for admins to access
        if (pathname === '/login' || pathname === '/api/auth/login') {
            // Continue to normal flow (will allow login page)
        } else {
            // Check if user is admin based on token
            let isAdmin = false
            if (decodedToken?.role === 'ADMIN') isAdmin = true

            // If not admin, redirect to maintenance
            if (!isAdmin) {
                return NextResponse.redirect(new URL('/maintenance', request.url))
            }
        }
      }
    } catch (e) {
      console.error('Error checking maintenance mode:', e)
    }
  }
  // ------------------------------

  // Check if route is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  )

  // API routes are always accessible (they handle their own auth)
  if (pathname.startsWith('/api')) {
    const rateLimitedResponse = await enforceApiRateLimit(request, pathname, decodedToken)
    if (rateLimitedResponse) return rateLimitedResponse

    if (
      MUTATING_METHODS.has(request.method) &&
      token &&
      !isCsrfExempt(pathname) &&
      !hasValidCsrfToken(request)
    ) {
      return NextResponse.json(
        { error: 'Invalid CSRF token. Please refresh the page and try again.' },
        { status: 403 }
      )
    }

    return NextResponse.next()
  }

  // If public route, allow access
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Protected routes require authentication
  if (!token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  try {
    if (!decodedToken) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      const response = NextResponse.redirect(loginUrl)
      response.cookies.delete('token')
      return response
    }

    const userRole = decodedToken.role

    // Role-based access control
    if ((pathname.startsWith('/admin') || pathname.startsWith('/dashboard/admin')) && userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }

    if (pathname.startsWith('/dashboard/recruiter') && userRole !== 'RECRUITER') {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }

    if (pathname.startsWith('/dashboard/jobseeker') && userRole !== 'JOBSEEKER') {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }

    if (pathname.startsWith('/profile/recruiter') && userRole !== 'RECRUITER') {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }

    if (pathname.startsWith('/profile/jobseeker') && userRole !== 'JOBSEEKER') {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }

    return NextResponse.next()
  } catch (error) {
    // Invalid token
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    const response = NextResponse.redirect(loginUrl)
    response.cookies.delete('token')
    return response
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|assets|favicon.ico).*)',
  ],
}
