import { NextResponse } from 'next/server'
import { validateBody } from '@/lib/validations'
import { registerJobseekerSchema } from '@/lib/validations/auth'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/password'
import { v4 as uuidv4 } from 'uuid'
import { authLimiter, getIP, rateLimitResponse } from '@/lib/rateLimit'

export async function POST(request) {
  try {
    // Rate limiting - 5 requests per 15 minutes
    const ip = getIP(request)
    const { success, reset } = await authLimiter.limit(ip)
    if (!success) {
      return rateLimitResponse(reset)
    }

    const validation = await validateBody(request, registerJobseekerSchema)
    if (!validation.success) {
      return validation.response
    }
    const { name, email, password, phone } = validation.data

    // Cek apakah email sudah terdaftar
    const existingUser = await prisma.users.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar' },
        { status: 400 }
      )
    }

    // Hash password using Argon2
    const hashedPassword = await hashPassword(password)

    // Split nama untuk firstName dan lastName
    const nameParts = name.trim().split(' ')
    const firstName = nameParts[0]
    const lastName = nameParts.slice(1).join(' ') || ''

    const now = new Date()

    // Buat user dan jobseeker profile
    const user = await prisma.users.create({
      data: {
        id: uuidv4(),
        email,
        password: hashedPassword,
        role: 'JOBSEEKER',
        emailVerified: false,
        updatedAt: now,
        jobseekers: {
          create: {
            id: uuidv4(),
            firstName,
            lastName,
            phone,
            profileCompleted: false,
            profileCompleteness: 0,
            updatedAt: now
          }
        }
      },
      include: {
        jobseekers: true
      }
    })

    // Hapus password dari response
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(
      {
        message: 'Registrasi berhasil',
        user: userWithoutPassword
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof NextResponse) {
      return error
    }
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan saat registrasi' },
      { status: 500 }
    )
  }
}