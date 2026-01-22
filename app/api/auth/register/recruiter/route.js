import { NextResponse } from 'next/server'
import { validateBody } from '@/lib/validations'
import { createErrorResponse } from '@/lib/errorHandler'
import { registerRecruiterSchema } from '@/lib/validations/auth'
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

    const validation = await validateBody(request, registerRecruiterSchema)
    if (!validation.success) {
      return validation.response
    }
    const {
      companyName,
      email,
      firstName,
      lastName,
      phone,   
      password,
      position
    } = validation.data

    // Rename variables to match existing logic if needed, or update logic
    const companyEmail = email
    const contactPersonPhone = phone
    const contactPersonName = `${firstName} ${lastName || ''}`.trim()

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

    // Hash password using Argon2
    const hashedPassword = await hashPassword(password)

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

    // Names are already split from schema validation
    // const nameParts = contactPersonName.trim().split(' ')
    // const firstName = nameParts[0]
    // const lastName = nameParts.slice(1).join(' ') || ''

    // ✅ Buat company dengan field yang required saja
    const company = await prisma.companies.create({
      data: {
        id: uuidv4(),
        name: companyName,
        slug: slug,
        email: companyEmail.toLowerCase(),
        phone: contactPersonPhone,
        address: '-', // Placeholder - akan diisi saat profile completion
        city: 'Cirebon', // Default Cirebon
        province: 'Jawa Barat', // Default Jawa Barat
        website: null,
        industry: 'Other', // Default - akan diisi saat profile completion
        companySize: '1-10', // Default - akan diisi saat profile completion
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
    if (error instanceof NextResponse) {
      return error
    }

    console.error('Registration error:', error)
    
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
        ...createErrorResponse('Terjadi kesalahan', error)
      },
      { status: 500 }
    )
  }
}