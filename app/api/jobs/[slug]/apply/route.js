import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export async function POST(request, context) {
  try {
    const params = await context.params
    const { slug } = params

    // Verify authentication
    const cookieStore = await cookies()
    const token = cookieStore.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Tidak memiliki akses - Silakan login terlebih dahulu' },
        { status: 401 }
      )
    }

    let decoded
    try {
      decoded = jwt.verify(token.value, JWT_SECRET)
    } catch (jwtError) {
      return NextResponse.json(
        { error: 'Token tidak valid' },
        { status: 401 }
      )
    }

    const userId = decoded.userId

    // Get user and check role
    const user = await prisma.users.findUnique({
      where: { id: userId },
      include: { jobseekers: true }
    })

    if (!user || user.role !== 'JOBSEEKER') {
      return NextResponse.json(
        { error: 'Hanya pencari kerja yang dapat melamar pekerjaan' },
        { status: 403 }
      )
    }

    if (!user.jobseekers) {
      return NextResponse.json(
        { error: 'Silakan lengkapi profil Anda terlebih dahulu' },
        { status: 400 }
      )
    }

    // Get job
    const job = await prisma.jobs.findFirst({
      where: { slug }
    })

    if (!job) {
      return NextResponse.json(
        { error: 'Lowongan tidak ditemukan' },
        { status: 404 }
      )
    }

    // Check if job is still active
    if (!job.isActive) {
      return NextResponse.json(
        { error: 'Lowongan sudah ditutup' },
        { status: 400 }
      )
    }

    // Check if already applied and still in progress
    const existingApplication = await prisma.applications.findUnique({
      where: {
        jobId_jobseekerId: {
          jobId: job.id,
          jobseekerId: user.jobseekers.id
        }
      }
    })

    if (existingApplication) {
      // Define completed statuses
      const completedStatuses = ['REJECTED', 'WITHDRAWN', 'ACCEPTED']
      const isInProgress = !completedStatuses.includes(existingApplication.status)
      
      if (isInProgress) {
        return NextResponse.json(
          { 
            error: 'Lamaran Anda masih dalam proses seleksi',
            message: `Anda sudah melamar ke lowongan ini dan masih dalam tahap ${existingApplication.status}. Silakan tunggu hasil seleksi sebelum melamar kembali.`,
            applicationId: existingApplication.id,
            status: existingApplication.status,
            appliedAt: existingApplication.appliedAt
          },
          { status: 400 }
        )
      } else if (existingApplication.status === 'ACCEPTED') {
        return NextResponse.json(
          { 
            error: 'Anda sudah diterima di lowongan ini',
            message: 'Anda sudah diterima bekerja untuk posisi ini.',
          },
          { status: 400 }
        )
      }
      // If REJECTED or WITHDRAWN, they can apply again (allow re-apply)
    }

    // Get request body
    const body = await request.json()
    const { coverLetter, resumeUrl, portfolioUrl } = body

    // Create application
    const application = await prisma.applications.create({
      data: {
        id: `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        jobId: job.id,
        jobseekerId: user.jobseekers.id,
        coverLetter,
        resumeUrl: resumeUrl || user.jobseekers.cvUrl,
        portfolioUrl,
        status: 'PENDING',
        updatedAt: new Date()
      },
      include: {
        jobs: {
          include: {
            companies: true
          }
        }
      }
    })

    // Increment application count
    await prisma.jobs.update({
      where: { id: job.id },
      data: { applicationCount: { increment: 1 } }
    })

    return NextResponse.json({
      success: true,
      message: 'Lamaran berhasil dikirim',
      application
    })

  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Gagal mengirim lamaran',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
