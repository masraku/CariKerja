import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export async function POST(request) {
  try {
    const body = await request.json()
    const { email, password, role } = body

    // Validasi input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email dan password wajib diisi' },
        { status: 400 }
      )
    }

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
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
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

    if (user.role === 'RECRUITER' && recruiter) {
      userData.company = recruiter.companies
    }

    const response = NextResponse.json(
      {
        message: 'Login berhasil',
        user: userData,
        token
      },
      { status: 200 }
    )

    // Set cookie untuk token (1 hour)
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 // 1 hour
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat login' },
      { status: 500 }
    )
  }
}