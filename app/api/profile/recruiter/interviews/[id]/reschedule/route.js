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
    const interview = await prisma.interview.findUnique({
      where: { id },
      include: {
        participants: {
          include: {
            application: {
              include: {
                jobseeker: {
                  include: {
                    user: {
                      select: {
                        email: true
                      }
                    }
                  }
                },
                job: {
                  select: {
                    title: true,
                    company: {
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
        job: {
          select: {
            title: true,
            company: {
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
    const updatedInterview = await prisma.interview.update({
      where: { id },
      data: {
        scheduledAt: new Date(scheduledAt),
        duration: duration || interview.duration,
        meetingUrl: meetingUrl || interview.meetingUrl,
        description: description || interview.description,
        status: 'RESCHEDULED'
      },
      include: {
        participants: {
          include: {
            application: {
              include: {
                jobseeker: true,
                job: true
              }
            }
          }
        },
        job: {
          include: {
            company: true
          }
        }
      }
    })

    // Send reschedule notification to all participants
    const emailPromises = interview.participants.map(async (participant) => {
      try {
        await sendRescheduleNotification({
          to: participant.application.jobseeker.user.email,
          candidateName: `${participant.application.jobseeker.firstName} ${participant.application.jobseeker.lastName}`,
          jobTitle: interview.job.title,
          companyName: interview.job.company.name,
          oldScheduledAt: oldScheduledAt,
          newScheduledAt: new Date(scheduledAt),
          duration: duration || interview.duration,
          meetingUrl: meetingUrl || interview.meetingUrl,
          description: description || interview.description,
          interviewId: id
        })
      } catch (emailError) {
        console.error(`Failed to send reschedule email to ${participant.application.jobseeker.user.email}:`, emailError)
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
          participantCount: updatedInterview.participants.length
        }
      }
    })

  } catch (error) {
    console.error('❌ Reschedule interview error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to reschedule interview',
        details: error.message
      },
      { status: 500 }
    )
  }
}
