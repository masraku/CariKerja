import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request) {
  try {
    const body = await request.json()
    const {
      companyName,
      companyEmail,
      contactPersonName,
      contactPersonPhone,   
      password
    } = body

    // ✅ Validasi input dengan field yang benar
    if (!companyName?.trim()) {
      return NextResponse.json(
        { error: 'Nama perusahaan wajib diisi' },
        { status: 400 }
      )
    }

    if (!companyEmail?.trim()) {
      return NextResponse.json(
        { error: 'Email perusahaan wajib diisi' },
        { status: 400 }
      )
    }

    if (!contactPersonName?.trim()) {
      return NextResponse.json(
        { error: 'Nama contact person wajib diisi' },
        { status: 400 }
      )
    }

    if (!contactPersonPhone?.trim()) {
      return NextResponse.json(
        { error: 'Nomor telepon wajib diisi' },
        { status: 400 }
      )
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: 'Password minimal 6 karakter' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(companyEmail)) {
      return NextResponse.json(
        { error: 'Format email tidak valid' },
        { status: 400 }
      )
    }

    // Cek apakah email sudah terdaftar
    const existingUser = await prisma.users.findUnique({
      where: { email: companyEmail.toLowerCase() }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar' },
        { status: 400 }
      )
    }

    // Cek apakah nama perusahaan sudah ada
    const existingCompany = await prisma.companies.findFirst({
      where: { 
        name: {
          equals: companyName,
          mode: 'insensitive' // Case insensitive
        }
      }
    })

    if (existingCompany) {
      return NextResponse.json(
        { error: 'Nama perusahaan sudah terdaftar' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Generate slug dari nama perusahaan
    let slug = companyName
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()

    // Ensure unique slug
    const existingSlug = await prisma.companies.findUnique({
      where: { slug }
    })

    if (existingSlug) {
      slug = `${slug}-${Date.now()}`
    }

    // Split nama contact person
    const nameParts = contactPersonName.trim().split(' ')
    const firstName = nameParts[0]
    const lastName = nameParts.slice(1).join(' ') || ''

    // ✅ Buat company dengan field yang required saja
    const company = await prisma.companies.create({
      data: {
        id: uuidv4(),
        name: companyName,
        slug: slug,
        email: companyEmail.toLowerCase(),
        phone: contactPersonPhone,
        address: '', // Empty - akan diisi saat profile completion
        city: '',
        province: '',
        website: null,
        industry: '',
        companySize: '',
        status: 'PENDING_VERIFICATION',
        verified: false,
        updatedAt: new Date()
      }
    })

    const user = await prisma.users.create({
      data: {
        id: uuidv4(),
        email: companyEmail.toLowerCase(),
        password: hashedPassword,
        role: 'RECRUITER',
        emailVerified: false,
        updatedAt: new Date(),
        recruiters: {
          create: {
            id: uuidv4(),
            firstName,
            lastName,
            position: 'HR Manager', // Default, bisa diupdate saat profile completion
            phone: contactPersonPhone,
            companyId: company.id,
            isVerified: false,
            updatedAt: new Date()
          }
        }
      },
      include: {
        recruiters: {
          include: {
            companies: true
          }
        }
      }
    })

    // Hapus password dari response
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(
      {
        success: true,
        message: 'Registrasi berhasil! Silakan login dan lengkapi profile perusahaan Anda.',
        user: userWithoutPassword
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('❌ Registration error:', error)
    
    // Handle specific Prisma errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Email atau nama perusahaan sudah terdaftar' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        error: 'Terjadi kesalahan saat registrasi',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}