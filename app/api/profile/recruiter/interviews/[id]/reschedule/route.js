import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRecruiter } from '@/lib/authHelper'
import { sendRescheduleNotification } from '@/lib/email/sendRescheduleNotification'
import { v4 as uuidv4 } from 'uuid'

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

    // Check if rescheduling a specific participant
    const { participantId } = body

    if (participantId) {
      // 1. Verify participant belongs to this interview
      const participant = interview.interview_participants.find(p => p.id === participantId)
      if (!participant) {
        return NextResponse.json(
          { error: 'Participant not found in this interview' },
          { status: 404 }
        )
      }

      // 2. Create NEW interview for this participant
      const newInterview = await prisma.interviews.create({
        data: {
          id: uuidv4(),
          recruiterId: interview.recruiterId,
          jobId: interview.jobId,
          title: `${interview.title} (Reschedule)`,
          scheduledAt: new Date(scheduledAt),
          duration: duration || interview.duration,
          meetingType: interview.meetingType, // Inherit type
          meetingUrl: meetingUrl || interview.meetingUrl,
          location: interview.location,
          description: description || interview.description,
          status: 'SCHEDULED',
          updatedAt: new Date()
        }
      })

      // 3. Move participant to new interview & Reset status
      await prisma.interview_participants.update({
        where: { id: participantId },
        data: {
          interviewId: newInterview.id,
          status: 'PENDING',
          responseMessage: null,
          respondedAt: null
        }
      })

      // 4. Send notification only to this participant
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
          interviewId: newInterview.id
        })
      } catch (emailError) {
        console.error("Failed to send reschedule email", emailError)
      }

      return NextResponse.json({
        success: true,
        message: 'Individual interview rescheduled successfully',
        data: {
          interview: newInterview
        }
      })
    }

    // Default: Update entire interview (group reschedule)
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
        interview_participants: true
      }
    })

    // Reset all participants status to PENDING
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
