import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createErrorResponse } from '@/lib/errorHandler'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { validateCSRFToken, csrfErrorResponse } from '@/lib/csrf'
import { validateBody } from '@/lib/validations'
import { applyJobSchema } from '@/lib/validations/profile'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export async function POST(request, context) {
  try {
    // CSRF validation
    if (!validateCSRFToken(request)) {
      return csrfErrorResponse()
    }

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

    // Check if already applied TO THIS SPECIFIC JOB and still in progress
    // Using findFirst with explicit conditions to ensure per-job checking
    console.log(`[APPLY DEBUG] Checking for existing application:`, {
      jobId: job.id,
      jobTitle: job.title,
      jobSlug: job.slug,
      jobseekerId: user.jobseekers.id
    })
    
    const existingApplication = await prisma.applications.findFirst({
      where: {
        AND: [
          { jobId: job.id },
          { jobseekerId: user.jobseekers.id }
        ]
      }
    })
    
    console.log(`[APPLY DEBUG] Existing application found:`, existingApplication ? {
      id: existingApplication.id,
      jobId: existingApplication.jobId,
      status: existingApplication.status
    } : 'None')

    if (existingApplication) {
      // Define completed statuses
      const completedStatuses = ['REJECTED', 'WITHDRAWN', 'ACCEPTED']
      const isInProgress = !completedStatuses.includes(existingApplication.status)
      
      if (isInProgress) {
        return NextResponse.json(
          { 
            error: 'Lamaran Anda masih dalam proses seleksi',
            message: `Anda sudah melamar ke lowongan "${job.title}" dan masih dalam tahap ${existingApplication.status}. Silakan tunggu hasil seleksi sebelum melamar kembali.`,
            applicationId: existingApplication.id,
            status: existingApplication.status,
            appliedAt: existingApplication.appliedAt,
            jobTitle: job.title,
            jobSlug: job.slug
          },
          { status: 400 }
        )
      } else if (existingApplication.status === 'ACCEPTED') {
        return NextResponse.json(
          { 
            error: 'Anda sudah diterima di lowongan ini',
            message: `Anda sudah diterima bekerja untuk posisi "${job.title}".`,
          },
          { status: 400 }
        )
      }
      // If REJECTED or WITHDRAWN, they can apply again (allow re-apply)
    }

    // Validate request body
    const validation = await validateBody(request, applyJobSchema)
    if (!validation.success) {
      return validation.response
    }
    const { coverLetter, expectedSalary, availableDate, notes } = validation.data
    const resumeUrl = user.jobseekers.cvUrl
    const portfolioUrl = user.jobseekers.portfolioUrl

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
        ...createErrorResponse('Terjadi kesalahan', error) 
      },
      { status: 500 }
    )
  }
}
