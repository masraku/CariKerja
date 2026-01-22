import { NextResponse } from 'next/server'
import { validateBody } from '@/lib/validations'
import { loginSchema } from '@/lib/validations/auth'
import { prisma } from '@/lib/prisma'
import { verifyPassword, hashPassword, needsRehash } from '@/lib/password'
import jwt from 'jsonwebtoken'
import { authLimiter, getIP, rateLimitResponse } from '@/lib/rateLimit'
import { generateCSRFToken } from '@/lib/csrf'
import { createAuditLog, AuditAction } from '@/lib/audit'
import { createErrorResponse } from '@/lib/errorHandler'

const JWT_SECRET = process.env.JWT_SECRET

export async function POST(request) {
  try {
    // Rate limiting - 5 requests per 15 minutes
    const ip = getIP(request)
    const { success, reset } = await authLimiter.limit(ip)
    if (!success) {
      return rateLimitResponse(reset)
    }

    const validation = await validateBody(request, loginSchema)
    if (!validation.success) {
      return validation.response
    }
    const { email, password, role } = validation.data

    // Cari user berdasarkan email
    const user = await prisma.users.findUnique({
      where: { email },
      include: {
        jobseekers: true,
        recruiters: {
          include: {
            companies: true
          }
        }
      }
    })

    if (!user) {
      await createAuditLog({
        action: AuditAction.LOGIN_FAILED,
        changes: { email, reason: 'User not found' },
        request
      })
      return NextResponse.json(
        { error: 'Email atau password salah' },
        { status: 401 }
      )
    }

    // Cek role
    if (role && user.role !== role.toUpperCase()) {
      return NextResponse.json(
        { error: `Akun ini terdaftar sebagai ${user.role.toLowerCase()}, bukan ${role}` },
        { status: 401 }
      )
    }

    // Cek status akun
    if (user.status === 'SUSPENDED' || user.status === 'BANNED') {
      return NextResponse.json(
        { error: 'Akun Anda telah dinonaktifkan. Hubungi admin untuk informasi lebih lanjut.' },
        { status: 403 }
      )
    }

    // Verifikasi password
    const isPasswordValid = await verifyPassword(password, user.password)
    
    // Auto-migration to Argon2 if legacy hash
    if (isPasswordValid && needsRehash(user.password)) {
      try {
        const newHash = await hashPassword(password)
        await prisma.users.update({
          where: { id: user.id },
          data: { password: newHash }
        })
      } catch (err) {
        console.error('Password migration failed:', err)
      }
    }

    if (!isPasswordValid) {
      await createAuditLog({
        action: AuditAction.LOGIN_FAILED,
        userId: user.id,
        userRole: user.role,
        changes: { email, reason: 'Invalid password' },
        request
      })
      return NextResponse.json(
        { error: 'Email atau password salah' },
        { status: 401 }
      )
    }

    // Update last login
    await prisma.users.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    })

    // Audit log - successful login
    await createAuditLog({
      action: AuditAction.LOGIN,
      userId: user.id,
      userRole: user.role,
      targetType: 'user',
      targetId: user.id,
      request
    })

    // Generate JWT token with 1 hour expiry
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '1h' } // Token expires in 1 hour
    )

    // Hapus password dari response
    const { password: _, ...userWithoutPassword } = user

    // Prepare user data based on role
    const jobseeker = Array.isArray(user.jobseekers) ? user.jobseekers[0] : user.jobseekers
    const recruiter = Array.isArray(user.recruiters) ? user.recruiters[0] : user.recruiters
    
    let userData = {
      ...userWithoutPassword,
      name: user.role === 'JOBSEEKER' 
        ? `${jobseeker?.firstName || ''} ${jobseeker?.lastName || ''}`.trim()
        : `${recruiter?.firstName || ''} ${recruiter?.lastName || ''}`.trim(),
      tokenExpiresAt: Date.now() + (60 * 60 * 1000) // 1 hour from now
    }

    // Add role-specific data
    if (user.role === 'JOBSEEKER' && jobseeker) {
      userData.jobseeker = {
        id: jobseeker.id,
        photo: jobseeker.photo,
        profileCompleted: jobseeker.profileCompleted,
        profileCompleteness: jobseeker.profileCompleteness
      }
    }

    if (user.role === 'RECRUITER' && recruiter) {
      userData.recruiter = {
        id: recruiter.id,
        photo: recruiter.photo,
        isVerified: recruiter.isVerified,
        companyId: recruiter.companyId
      }
      userData.company = recruiter.companies
    }

    // Generate CSRF token
    const csrfToken = generateCSRFToken()

    const response = NextResponse.json(
      {
        message: 'Login berhasil',
        user: userData,
        token,
        csrfToken // Also send in response body for client storage
      },
      { status: 200 }
    )

    // Set cookie untuk auth token (1 hour, httpOnly)
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 // 1 hour
    })

    // Set CSRF token cookie (NOT httpOnly - JS needs to read it)
    response.cookies.set('csrf_token', csrfToken, {
      httpOnly: false, // JS must be able to read this
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 // 1 hour
    })

    return response
  } catch (error) {
    if (error instanceof NextResponse) {
      return error
    }
    console.error('Login error:', error)
    return NextResponse.json(
      createErrorResponse('Terjadi kesalahan saat login', error),
      { status: 500 }
    )
  }
}