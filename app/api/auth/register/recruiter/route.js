import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request) {
  try {
    const body = await request.json()
    const {
      companyName,
      companyEmail,
      contactPerson,
      phone,
      password,
      companyAddress,
      companyWebsite
    } = body

    // Validasi input
    if (!companyName || !companyEmail || !contactPerson || !phone || !password || !companyAddress) {
      return NextResponse.json(
        { error: 'Semua field wajib diisi' },
        { status: 400 }
      )
    }

    // Cek apakah email sudah terdaftar
    const existingUser = await prisma.user.findUnique({
      where: { email: companyEmail }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar' },
        { status: 400 }
      )
    }

    // Cek apakah nama perusahaan sudah ada
    const existingCompany = await prisma.company.findFirst({
      where: { name: companyName }
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
    const slug = companyName
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()

    // Split nama contact person
    const nameParts = contactPerson.trim().split(' ')
    const firstName = nameParts[0]
    const lastName = nameParts.slice(1).join(' ') || ''

    // Buat company terlebih dahulu
    const company = await prisma.company.create({
      data: {
        name: companyName,
        slug: slug,
        email: companyEmail,
        phone: phone,
        address: companyAddress,
        city: '', // Akan diisi saat profile completion
        province: '', // Akan diisi saat profile completion
        website: companyWebsite || null,
        industry: '', // Akan diisi saat profile completion
        companySize: '', // Akan diisi saat profile completion
        status: 'PENDING_VERIFICATION',
        verified: false
      }
    })

    // Buat user dan recruiter profile
    const user = await prisma.user.create({
      data: {
        email: companyEmail,
        password: hashedPassword,
        role: 'RECRUITER',
        emailVerified: false,
        recruiter: {
          create: {
            firstName,
            lastName,
            position: 'HR Manager', // Default, bisa diupdate saat profile completion
            phone,
            companyId: company.id,
            isVerified: false
          }
        }
      },
      include: {
        recruiter: {
          include: {
            company: true
          }
        }
      }
    })

    // Hapus password dari response
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(
      {
        message: 'Registrasi berhasil. Akun Anda akan diverifikasi dalam 2-5 hari kerja.',
        user: userWithoutPassword
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat registrasi' },
      { status: 500 }
    )
  }
}