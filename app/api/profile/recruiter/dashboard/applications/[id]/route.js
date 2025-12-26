// app/api/profile/recruiter/applications/[applicationId]/route.js

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// GET - Fetch single application detail (FOR RECRUITER)
export async function GET(request, { params }) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    const { applicationId } = await params

    // Get application with full jobseeker details
    let application = await prisma.applications.findUnique({
      where: { id: applicationId },
      include: {
        jobseekers: {
          include: {
            educations: {
              orderBy: { startDate: 'desc' }
            },
            workExperiences: {
              orderBy: { startDate: 'desc' }
            },
            jobseekerSkills: {
              include: {
                skill: true
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
        },
        // Include interview participants for auto-check
        interview_participants: {
          include: {
            interviews: {
              select: {
                id: true,
                scheduledAt: true,
                status: true
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

    // --- AUTO-CHECK: Update status if 24 hours have passed since interview ---
    if (application.status === 'INTERVIEW_SCHEDULED') {
      const participant = application.interview_participants?.[0]
      const interview = participant?.interviews
      
      if (interview?.scheduledAt) {
        const now = new Date()
        const interviewTime = new Date(interview.scheduledAt)
        const hoursSinceInterview = (now - interviewTime) / (1000 * 60 * 60)
        
        // If 24 hours have passed since interview time
        if (hoursSinceInterview >= 24) {
          console.log(`🔄 [Recruiter] Auto-completing interview for application ${applicationId} (${hoursSinceInterview.toFixed(1)}h since interview)`)
          
          // Update application and participant status
          await prisma.$transaction([
            prisma.applications.update({
              where: { id: application.id },
              data: { status: 'INTERVIEW_COMPLETED' }
            }),
            ...(participant ? [
              prisma.interview_participants.update({
                where: { id: participant.id },
                data: { status: 'INTERVIEW_COMPLETED' }
              })
            ] : [])
          ])
          
          // Update local application object
          application.status = 'INTERVIEW_COMPLETED'
        }
      }
    }
    // --- END AUTO-CHECK ---

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
    if (jobseeker.workExperiences?.length > 0) completeness++
    if (jobseeker.jobseekerSkills?.length > 0) completeness++
    if (jobseeker.certifications?.length > 0) completeness++
    if (jobseeker.photo) completeness++
    if (jobseeker.city && jobseeker.province) completeness++

    const completenessPercentage = Math.round((completeness / totalFields) * 100)

    // Extract skill names
    const skills = jobseeker.jobseekerSkills?.map(js => js.skill?.name).filter(Boolean) || []

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
    console.error('❌ Get application detail error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch application detail' },
      { status: 500 }
    )
  }
}

// PATCH - Update application status and notes (FOR RECRUITER)
export async function PATCH(request, { params }) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    const { applicationId } = await params
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
      where: { id: applicationId },
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
      where: { id: applicationId },
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
    console.error('❌ Update application error:', error)
    return NextResponse.json(
      { error: 'Failed to update application' },
      { status: 500 }
    )
  }
}