import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request) {
  try {
    const body = await request.json()
    const { name, email, password, phone } = body

    // Validasi input
    if (!name || !email || !password || !phone) {
      return NextResponse.json(
        { error: 'Semua field wajib diisi' },
        { status: 400 }
      )
    }

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

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

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
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan saat registrasi' },
      { status: 500 }
    )
  }
}