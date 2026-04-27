// app/api/profile/recruiter/applications/[applicationId]/route.js

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { validateCSRFToken, csrfErrorResponse } from '@/lib/csrf'

// GET - Fetch single application detail (FOR RECRUITER)
export async function GET(request, { params }) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { id } = await params

    // Get application with full jobseeker details
    const application = await prisma.applications.findUnique({
      where: { id },
      include: {
        jobseekers: {
          include: {
            educations: {
              orderBy: { startDate: 'desc' }
            },
            work_experiences: {
              orderBy: { startDate: 'desc' }
            },
            jobseeker_skills: {
              include: {
                skills: true
              }
            },
            certifications: {
              orderBy: { issueDate: 'desc' }
            }
          }
        },
        jobs: {
          include: {
            companies: {
              include: {
                recruiters: {
                  where: { userId: decoded.userId }
                }
              }
            }
          }
        }
      }
    })

    // Verify recruiter owns this job
    if (!application || application.jobs.companies.recruiters.length === 0) {
      return NextResponse.json(
        { error: 'Application not found or unauthorized' },
        { status: 404 }
      )
    }

    // Calculate profile completeness
    const jobseeker = application.jobseekers
    let completeness = 0
    let totalFields = 13

    if (jobseeker.firstName) completeness++
    if (jobseeker.lastName) completeness++
    if (jobseeker.phone) completeness++
    if (jobseeker.email) completeness++
    if (jobseeker.currentTitle) completeness++
    if (jobseeker.summary) completeness++
    if (jobseeker.cvUrl) completeness++
    if (jobseeker.educations?.length > 0) completeness++
    if (jobseeker.work_experiences?.length > 0) completeness++
    if (jobseeker.jobseeker_skills?.length > 0) completeness++
    if (jobseeker.certifications?.length > 0) completeness++
    if (jobseeker.photo) completeness++
    if (jobseeker.city && jobseeker.province) completeness++

    const completenessPercentage = Math.round((completeness / totalFields) * 100)

    // Extract skill names
    const skills = jobseeker.jobseeker_skills?.map(js => js.skills?.name).filter(Boolean) || []

    // Format response
    const formattedApplication = {
      ...application,
      jobseekers: {
        ...jobseeker,
        skills
      },
      profileCompleteness: completenessPercentage
    }

    return NextResponse.json({
      success: true,
      application: formattedApplication
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch application detail' },
      { status: 500 }
    )
  }
}

// PATCH - Update application status and notes (FOR RECRUITER)
export async function PATCH(request, { params }) {
  try {
    if (!validateCSRFToken(request)) {
      return csrfErrorResponse()
    }

    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { status, recruiterNotes } = body

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

    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    // Verify recruiter owns this job
    const application = await prisma.applications.findUnique({
      where: { id },
      include: {
        jobs: {
          include: {
            companies: {
              include: {
                recruiters: {
                  where: { userId: decoded.userId }
                }
              }
            }
          }
        }
      }
    })

    if (!application || application.jobs.companies.recruiters.length === 0) {
      return NextResponse.json(
        { error: 'Application not found or unauthorized' },
        { status: 404 }
      )
    }

    // Update application
    const updatedApplication = await prisma.applications.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(recruiterNotes !== undefined && { recruiterNotes }),
        reviewedAt: new Date()
      },
      include: {
        jobseekers: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        jobs: {
          select: {
            title: true,
            slug: true
          }
        }
      }
    })

    // TODO: Send notification to jobseeker

    return NextResponse.json({
      success: true,
      application: updatedApplication
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update application' },
      { status: 500 }
    )
  }
}
