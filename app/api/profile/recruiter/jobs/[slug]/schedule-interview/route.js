// app/api/profile/recruiter/jobs/[slug]/schedule-interview/route.js

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createErrorResponse } from '@/lib/errorHandler'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'

export async function POST() {
  return NextResponse.json(
    { error: 'Endpoint lama tidak digunakan. Gunakan /api/profile/recruiter/interviews untuk menjadwalkan interview.' },
    { status: 410 }
  )
}

// GET - Fetch applications for scheduling
export async function GET(request, { params }) {
  try {
    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
    const { slug } = await params
    const { searchParams } = new URL(request.url)
    const applicationIds = searchParams.get('applications')?.split(',') || []

    // Verify job ownership
    const job = await prisma.jobs.findUnique({
      where: { slug },
      include: {
        companies: {
          include: {
            recruiters: {
              where: { userId: decoded.userId }
            }
          }
        }
      }
    })

    if (!job || job.companies.recruiters.length === 0) {
      return NextResponse.json(
        { error: 'Job not found or unauthorized' },
        { status: 404 }
      )
    }

    // Get applications
    const applications = await prisma.applications.findMany({
      where: {
        id: { in: applicationIds },
        jobId: job.id
      },
      include: {
        jobseekers: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            photo: true,
            currentTitle: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      jobs: {
        id: job.id,
        slug: job.slug,
        title: job.title,
        company: job.companies.name
      },
      applications
    })

  } catch (error) {
    return NextResponse.json(
      createErrorResponse('Gagal mengambil applications', error),
      { status: 500 }
    )
  }
}
