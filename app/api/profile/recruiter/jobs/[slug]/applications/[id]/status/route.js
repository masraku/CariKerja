// app/api/profile/recruiter/jobs/[slug]/applications/[id]/status/route.js

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/authHelper'
import { validateCSRFToken, csrfErrorResponse } from '@/lib/csrf'
import {
  RECRUITER_APPLICATION_STATUSES,
  canRecruiterSetApplicationStatus,
  getInvalidRecruiterStatusMessage
} from '@/lib/applications/statusTransitions'

export async function PATCH(request, { params }) {
  try {
    if (!validateCSRFToken(request)) {
      return csrfErrorResponse()
    }

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

    if (!RECRUITER_APPLICATION_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: 'Status lamaran tidak valid untuk recruiter' },
        { status: 400 }
      )
    }

    // Get application and verify ownership
    const application = await prisma.applications.findUnique({
      where: { id },
      include: {
        jobs: {
          include: {
            recruiters: true
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
    const recruiter = await prisma.recruiters.findUnique({
      where: { userId: user.id }
    })

    if (!recruiter || application.jobs.recruiterId !== recruiter.id) {
      return NextResponse.json(
        { error: 'Access denied. You can only update applications for your own jobs' },
        { status: 403 }
      )
    }

    if (!canRecruiterSetApplicationStatus(application.status, status)) {
      return NextResponse.json(
        { error: getInvalidRecruiterStatusMessage(application.status, status) },
        { status: 400 }
      )
    }

    const updatedApplication = await prisma.applications.update({
      where: { id },
      data: {
        status,
        recruiterNotes: notes || application.recruiterNotes, // ✅ Fixed field name
        reviewedAt: new Date()
      },
      include: {
        jobseekers: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            photo: true,
            currentTitle: true
          }
        },
        jobs: {
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
    return NextResponse.json(
      { error: 'Failed to update application status' },
      { status: 500 }
    )
  }
}
