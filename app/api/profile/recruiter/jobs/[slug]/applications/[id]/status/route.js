// app/api/profile/recruiter/jobs/[slug]/applications/[id]/status/route.js

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/authHelper'

export async function PATCH(request, { params }) {
  try {
    const { id } = await params
    
    const auth = await getCurrentUser(request)
    
    if (auth.error) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      )
    }

    const { user } = auth

    if (user.role !== 'RECRUITER') {
      return NextResponse.json(
        { error: 'Access denied. Recruiter role required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { status, notes } = body

    // Valid statuses
    const validStatuses = [
      'PENDING',
      'REVIEWING',
      'SHORTLISTED',
      'INTERVIEW_SCHEDULED',
      'INTERVIEW_COMPLETED',
      'ACCEPTED',
      'REJECTED',
      'WITHDRAWN'
    ]

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    // Get application and verify ownership
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        job: {
          include: {
            recruiter: true
          }
        }
      }
    })

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    // Get recruiter profile
    const recruiter = await prisma.recruiter.findUnique({
      where: { userId: user.id }
    })

    if (!recruiter || application.job.recruiterId !== recruiter.id) {
      return NextResponse.json(
        { error: 'Access denied. You can only update applications for your own jobs' },
        { status: 403 }
      )
    }

    // ✅ FIXED: Use recruiterNotes instead of reviewNotes
    const updatedApplication = await prisma.application.update({
      where: { id },
      data: {
        status,
        recruiterNotes: notes || application.recruiterNotes, // ✅ Fixed field name
        reviewedAt: new Date()
      },
      include: {
        jobseeker: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            photo: true,
            currentTitle: true
          }
        },
        job: {
          select: {
            id: true,
            title: true,
            slug: true
          }
        }
      }
    })

    // TODO: Send notification to jobseeker

    return NextResponse.json({
      success: true,
      message: 'Application status updated',
      application: updatedApplication
    })

  } catch (error) {
    console.error('Update application status error:', error)
    return NextResponse.json(
      { error: 'Failed to update application status' },
      { status: 500 }
    )
  }
}