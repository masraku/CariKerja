import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireJobseeker } from '@/lib/authHelper'

// GET - Fetch interview details for jobseeker
export async function GET(request, { params }) {
  try {
    const { id } = await params
    
    // Authenticate jobseeker
    const auth = await requireJobseeker(request)
    
    if (auth.error) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      )
    }

    const { jobseeker } = auth

    // Fetch interview with participant info for this jobseeker
    const interview = await prisma.interviews.findUnique({
      where: { id },
      include: {
        jobs: {
          include: {
            companies: {
              select: {
                id: true,
                name: true,
                logo: true,
                city: true,
                industry: true,
                description: true
              }
            }
          }
        },
        recruiters: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            position: true,
            users: {
              select: {
                email: true
              }
            }
          }
        },
        interview_participants: {
          where: {
            applications: {
              jobseekerId: jobseeker.id
            }
          },
          include: {
            applications: {
              select: {
                id: true,
                status: true
              }
            }
          }
        }
      }
    })

    if (!interview) {
      return NextResponse.json(
        { error: 'Interview not found' },
        { status: 404 }
      )
    }

    // Check if jobseeker is a participant
    if (interview.interview_participants.length === 0) {
      return NextResponse.json(
        { error: 'You are not a participant in this interview' },
        { status: 403 }
      )
    }

    const myParticipation = interview.interview_participants[0]

    // Calculate time until interview
    const now = new Date()
    const scheduledTime = new Date(interview.scheduledAt)
    const timeUntil = scheduledTime - now
    const canJoin = timeUntil <= 15 * 60 * 1000 && timeUntil > -interview.duration * 60 * 1000 // 15 min before to duration after

    return NextResponse.json({
      success: true,
      data: {
        interview: {
          id: interview.id,
          title: interview.title,
          scheduledAt: interview.scheduledAt,
          duration: interview.duration,
          meetingType: interview.meetingType,
          meetingUrl: interview.meetingUrl,
          location: interview.location,
          description: interview.description,
          status: interview.status,
          createdAt: interview.createdAt
        },
        job: {
          id: interview.jobs.id,
          title: interview.jobs.title,
          slug: interview.jobs.slug,
          type: interview.jobs.jobType,
          level: interview.jobs.level,
          location: interview.jobs.location
        },
        company: interview.jobs.companies,
        recruiter: {
          name: `${interview.recruiters.firstName} ${interview.recruiters.lastName}`,
          position: interview.recruiters.position,
          email: interview.recruiters.users.email
        },
        myParticipation: {
          id: myParticipation.id,
          status: myParticipation.status,
          invitedAt: myParticipation.invitedAt,
          respondedAt: myParticipation.respondedAt,
          applicationId: myParticipation.applications.id,
          applicationStatus: myParticipation.applications.status
        },
        timing: {
          canJoin,
          timeUntilMs: timeUntil,
          isPast: timeUntil < -interview.duration * 60 * 1000
        }
      }
    })

  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Failed to fetch interview details',
        details: error.message
      },
      { status: 500 }
    )
  }
}
