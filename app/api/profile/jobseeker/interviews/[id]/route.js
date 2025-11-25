import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireJobseeker } from '@/lib/authHelper'

// GET - Fetch interview details for jobseeker
export async function GET(request, { params }) {
  try {
    const { id } = params
    
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
    const interview = await prisma.interview.findUnique({
      where: { id },
      include: {
        job: {
          include: {
            company: {
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
        recruiter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            position: true,
            user: {
              select: {
                email: true
              }
            }
          }
        },
        participants: {
          where: {
            application: {
              jobseekerId: jobseeker.id
            }
          },
          include: {
            application: {
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
    if (interview.participants.length === 0) {
      return NextResponse.json(
        { error: 'You are not a participant in this interview' },
        { status: 403 }
      )
    }

    const myParticipation = interview.participants[0]

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
          id: interview.job.id,
          title: interview.job.title,
          slug: interview.job.slug,
          type: interview.job.type,
          level: interview.job.level,
          location: interview.job.location
        },
        company: interview.job.company,
        recruiter: {
          name: `${interview.recruiter.firstName} ${interview.recruiter.lastName}`,
          position: interview.recruiter.position,
          email: interview.recruiter.user.email
        },
        myParticipation: {
          id: myParticipation.id,
          status: myParticipation.status,
          invitedAt: myParticipation.invitedAt,
          respondedAt: myParticipation.respondedAt,
          applicationId: myParticipation.application.id,
          applicationStatus: myParticipation.application.status
        },
        timing: {
          canJoin,
          timeUntilMs: timeUntil,
          isPast: timeUntil < -interview.duration * 60 * 1000
        }
      }
    })

  } catch (error) {
    console.error('❌ Get interview details error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch interview details',
        details: error.message
      },
      { status: 500 }
    )
  }
}
