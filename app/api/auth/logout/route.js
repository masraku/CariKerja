import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createAuditLog, AuditAction } from '@/lib/audit'
import { getCurrentUser } from '@/lib/authHelper'

export async function POST(request) {
  try {
    // Try to get user for audit logging (ignore errors if token expired)
    const { user } = await getCurrentUser(request)

    if (user) {
      await createAuditLog({
        action: AuditAction.LOGOUT,
        userId: user.id,
        userRole: user.role,
        targetType: 'user',
        targetId: user.id,
        request
      })
    }

    const response = NextResponse.json(
      { message: 'Logout successful' },
      { status: 200 }
    )

    // Clear cookies
    const cookieStore = await cookies()
    
    // Clean token cookie
    response.cookies.set('token', '', {
      httpOnly: true,
      expires: new Date(0),
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    })

    // Clean CSRF token cookie
    response.cookies.set('csrf_token', '', {
      httpOnly: false,
      expires: new Date(0),
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    })

    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    )
  }
}