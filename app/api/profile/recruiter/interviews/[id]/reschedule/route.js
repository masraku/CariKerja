import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRecruiter } from '@/lib/authHelper'
import { sendRescheduleNotification } from '@/lib/email/sendRescheduleNotification'

// PATCH - Reschedule interview
export async function PATCH(request, context) {
  try {
    const params = await context.params
    const { id } = params
    
    // Authenticate recruiter
    const auth = await requireRecruiter(request)
    
    if (auth.error) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      )
    }

    const { recruiter } = auth
    
    // Parse request body
    const body = await request.json()
    const { scheduledAt, duration, meetingUrl, description } = body
    
    // Validate required fields
    if (!scheduledAt) {
      return NextResponse.json(
        { error: 'Scheduled date and time are required' },
        { status: 400 }
      )
    }

    // Check if interview exists and belongs to recruiter
    const interview = await prisma.interviews.findUnique({
      where: { id },
      include: {
        interview_participants: {
          include: {
            applications: {
              include: {
                jobseekers: {
                  include: {
                    users: {
                      select: {
                        email: true
                      }
                    }
                  }
                },
                jobs: {
                  select: {
                    title: true,
                    companies: {
                      select: {
                        name: true
                      }
                    }
                  }
                }
              }
            }
          }
        },
        jobs: {
          select: {
            title: true,
            companies: {
              select: {
                name: true
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

    if (interview.recruiterId !== recruiter.id) {
      return NextResponse.json(
        { error: 'Unauthorized. You can only reschedule your own interviews.' },
        { status: 403 }
      )
    }

    // Check if interview is already completed or cancelled
    if (interview.status === 'COMPLETED' || interview.status === 'CANCELLED') {
      return NextResponse.json(
        { error: `Cannot reschedule ${interview.status.toLowerCase()} interview` },
        { status: 400 }
      )
    }

    // Store old schedule for email notification
    const oldScheduledAt = interview.scheduledAt

    // Update interview
    const updatedInterview = await prisma.interviews.update({
      where: { id },
      data: {
        scheduledAt: new Date(scheduledAt),
        duration: duration || interview.duration,
        meetingUrl: meetingUrl || interview.meetingUrl,
        description: description || interview.description,
        status: 'RESCHEDULED'
      },
      include: {
        interview_participants: {
          include: {
            applications: {
              include: {
                jobseekers: true,
                jobs: true
              }
            }
          }
        },
        jobs: {
          include: {
            companies: true
          }
        }
      }
    })

    // Reset all participants status to PENDING so they can confirm the new schedule
    // And clear the reschedule request message
    await prisma.interview_participants.updateMany({
      where: {
        interviewId: id
      },
      data: {
        status: 'PENDING',
        responseMessage: null,
        respondedAt: null
      }
    })

    // Send reschedule notification to all participants
    const emailPromises = interview.interview_participants.map(async (participant) => {
      try {
        await sendRescheduleNotification({
          to: participant.applications.jobseekers.users.email,
          candidateName: `${participant.applications.jobseekers.firstName} ${participant.applications.jobseekers.lastName}`,
          jobTitle: interview.jobs.title,
          companyName: interview.jobs.companies.name,
          oldScheduledAt: oldScheduledAt,
          newScheduledAt: new Date(scheduledAt),
          duration: duration || interview.duration,
          meetingUrl: meetingUrl || interview.meetingUrl,
          description: description || interview.description,
          interviewId: id
        })
      } catch (emailError) {
        // Don't fail the whole request if email fails
      }
    })

    await Promise.all(emailPromises)

    return NextResponse.json({
      success: true,
      message: 'Interview rescheduled successfully',
      data: {
        interview: {
          id: updatedInterview.id,
          title: updatedInterview.title,
          scheduledAt: updatedInterview.scheduledAt,
          duration: updatedInterview.duration,
          meetingUrl: updatedInterview.meetingUrl,
          description: updatedInterview.description,
          status: updatedInterview.status,
          participantCount: updatedInterview.interview_participants.length
        }
      }
    })

  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Failed to reschedule interview',
        details: error.message
      },
      { status: 500 }
    )
  }
}
