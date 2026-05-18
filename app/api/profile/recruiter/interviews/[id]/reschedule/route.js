import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { prisma } from '@/lib/prisma'
import { createErrorResponse } from '@/lib/errorHandler'
import { requireRecruiter } from '@/lib/authHelper'
import { sendRescheduleNotification } from '@/lib/email/sendRescheduleNotification'
import { validateBody } from '@/lib/validations'
import { recruiterRescheduleSchema } from '@/lib/validations/profile'

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
    
    // Validate body
    const validation = await validateBody(request, recruiterRescheduleSchema)
    if (!validation.success) {
      return validation.response
    }
    const { scheduledAt, duration, meetingType, meetingUrl, location, description, participantId } = validation.data
    const parsedScheduledAt = new Date(scheduledAt)
    const normalizedMeetingType = meetingType || 'ONLINE'
    const parsedDuration = parseInt(duration) || 60

    if (Number.isNaN(parsedScheduledAt.getTime())) {
      return NextResponse.json(
        { error: 'Jadwal interview tidak valid' },
        { status: 400 }
      )
    }

    if (parsedScheduledAt < new Date()) {
      return NextResponse.json(
        { error: 'Jadwal interview tidak boleh berada di masa lalu' },
        { status: 400 }
      )
    }

    if (normalizedMeetingType === 'ONLINE' && !meetingUrl) {
      return NextResponse.json(
        { error: 'Link meeting wajib diisi untuk interview online' },
        { status: 400 }
      )
    }

    if (normalizedMeetingType === 'IN_PERSON' && !location) {
      return NextResponse.json(
        { error: 'Lokasi wajib diisi untuk interview tatap muka' },
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
          id: randomUUID(),
          recruiterId: interview.recruiterId,
          jobId: interview.jobId,
          title: `${interview.title} (Reschedule)`,
          scheduledAt: parsedScheduledAt,
          duration: parsedDuration,
          meetingType: normalizedMeetingType,
          meetingUrl: normalizedMeetingType === 'ONLINE' ? meetingUrl : null,
          location: normalizedMeetingType === 'IN_PERSON' ? location : null,
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
          respondedAt: null,
          updatedAt: new Date()
        }
      })

      await prisma.applications.update({
        where: { id: participant.applicationId },
        data: {
          status: 'INTERVIEW_SCHEDULED',
          interviewDate: parsedScheduledAt,
          updatedAt: new Date()
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
          newScheduledAt: parsedScheduledAt,
          duration: parsedDuration,
          meetingType: normalizedMeetingType,
          meetingUrl: normalizedMeetingType === 'ONLINE' ? meetingUrl : null,
          location: normalizedMeetingType === 'IN_PERSON' ? location : null,
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
        scheduledAt: parsedScheduledAt,
        duration: parsedDuration,
        meetingType: normalizedMeetingType,
        meetingUrl: normalizedMeetingType === 'ONLINE' ? meetingUrl : null,
        location: normalizedMeetingType === 'IN_PERSON' ? location : null,
        description: description || interview.description,
        status: 'SCHEDULED',
        updatedAt: new Date()
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
        respondedAt: null,
        updatedAt: new Date()
      }
    })

    await prisma.applications.updateMany({
      where: {
        id: { in: interview.interview_participants.map(participant => participant.applicationId) }
      },
      data: {
        status: 'INTERVIEW_SCHEDULED',
        interviewDate: parsedScheduledAt,
        updatedAt: new Date()
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
          newScheduledAt: parsedScheduledAt,
          duration: parsedDuration,
          meetingType: normalizedMeetingType,
          meetingUrl: normalizedMeetingType === 'ONLINE' ? meetingUrl : null,
          location: normalizedMeetingType === 'IN_PERSON' ? location : null,
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
          meetingType: updatedInterview.meetingType,
          meetingUrl: updatedInterview.meetingUrl,
          location: updatedInterview.location,
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
        ...createErrorResponse('Terjadi kesalahan', error)
      },
      { status: 500 }
    )
  }
}
