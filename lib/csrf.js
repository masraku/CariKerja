import crypto from 'crypto'
import { NextResponse } from 'next/server'

// Generate a cryptographically secure CSRF token
export function generateCSRFToken() {
  return crypto.randomBytes(32).toString('hex')
}

// Validate CSRF token from request
// Compares cookie token with header token (Double Submit Cookie pattern)
export function validateCSRFToken(request) {
  const cookieToken = request.cookies.get('csrf_token')?.value
  const headerToken = request.headers.get('X-CSRF-Token')
  
  // Both tokens must exist
  if (!cookieToken || !headerToken) {
    return false
  }
  
  // Tokens must be same length for timing-safe comparison
  if (cookieToken.length !== headerToken.length) {
    return false
  }
  
  try {
    // Tokens must match (timing-safe comparison)
    return crypto.timingSafeEqual(
      Buffer.from(cookieToken),
      Buffer.from(headerToken)
    )
  } catch (error) {
    return false
  }
}

// Helper to return CSRF error response
export function csrfErrorResponse() {
  return NextResponse.json(
    { error: 'Invalid CSRF token. Please refresh the page and try again.' },
    { status: 403 }
  )
}

// Helper to check if request method requires CSRF validation
export function requiresCSRFValidation(method) {
  return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase())
}
