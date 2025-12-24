import { NextResponse } from 'next/server'

export function middleware(request) {
  const token = request.cookies.get('token')?.value
  const pathname = request.nextUrl.pathname

  // Public routes yang tidak perlu authentication
  const publicRoutes = [
    '/',
    '/login',
    '/login',
    '/forgot-password',
    '/jobs',
    '/companies',
    '/about',
    '/warning',
    '/terms',
    '/privacy'
  ]

  // Check if route is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  )

  // API routes are always accessible (they handle their own auth)
  if (pathname.startsWith('/api')) {
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

  // Simple token validation (just check if exists for now)
  // Detailed validation happens in API routes
  try {
    // Decode JWT manually (since we can't use jsonwebtoken in edge runtime)
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const decoded = JSON.parse(atob(base64))
    
    // Check if token is expired
    if (decoded.exp && decoded.exp < Date.now() / 1000) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      const response = NextResponse.redirect(loginUrl)
      response.cookies.delete('token')
      return response
    }

    const userRole = decoded.role

    // Role-based access control
    if (pathname.startsWith('/dashboard/admin') && userRole !== 'ADMIN') {
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
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}