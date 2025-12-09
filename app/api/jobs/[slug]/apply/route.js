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
        { error: 'Unauthorized - Please login first' },
        { status: 401 }
      )
    }

    let decoded
    try {
      decoded = jwt.verify(token.value, JWT_SECRET)
    } catch (jwtError) {
      return NextResponse.json(
        { error: 'Invalid token' },
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
        { error: 'Only jobseekers can apply for jobs' },
        { status: 403 }
      )
    }

    if (!user.jobseekers) {
      return NextResponse.json(
        { error: 'Please complete your profile first' },
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

    // Check if already applied
    const existingApplication = await prisma.applications.findUnique({
      where: {
        jobId_jobseekerId: {
          jobId: job.id,
          jobseekerId: user.jobseekers.id
        }
      }
    })

    if (existingApplication) {
      return NextResponse.json(
        { 
          error: 'Anda sudah melamar pekerjaan ini',
          message: 'Anda sudah pernah melamar ke lowongan ini. Silakan melamar di lowongan lain atau perusahaan lain.',
          applicationId: existingApplication.id,
          appliedAt: existingApplication.appliedAt
        },
        { status: 400 }
      )
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
      message: 'Application submitted successfully',
      application
    })

  } catch (error) {
    console.error('Submit application error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to submit application',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
