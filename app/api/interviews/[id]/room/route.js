import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createErrorResponse } from '@/lib/errorHandler'
import { requireJobseeker } from '@/lib/authHelper'

// GET - Get interview room details
export async function GET(request, context) {
    try {
        // Authenticate
        const auth = await requireJobseeker(request)
        if (auth.error) {
            return NextResponse.json({ error: auth.error }, { status: auth.status })
        }

        const { jobseeker } = auth
        const params = await context.params
        const { id: interviewId } = params

        // Get interview with participant details
        const interview = await prisma.interviews.findUnique({
            where: { id: interviewId },
            include: {
                interview_participants: {
                    where: {
                        applications: {
                            jobseekerId: jobseeker.id
                        }
                    },
                    include: {
                        applications: {
                            include: {
                                jobs: {
                                    include: {
                                        companies: true
                                    }
                                }
                            }
                        }
                    }
                },
                recruiters: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        position: true
                    }
                }
            }
        })

        if (!interview) {
            return NextResponse.json(
                { error: 'Interview tidak ditemukan' },
                { status: 404 }
            )
        }

        // Check if jobseeker is participant
        if (interview.interview_participants.length === 0) {
            return NextResponse.json(
                { error: 'Anda bukan peserta dalam interview ini' },
                { status: 403 }
            )
        }

        const participant = interview.interview_participants[0]
        const isApprovedReschedule =
            participant.status === 'PENDING' && interview.title.includes('(Reschedule)')

        // Check if participant accepted
        if (participant.status !== 'ACCEPTED' && !isApprovedReschedule) {
            return NextResponse.json(
                { error: 'Anda belum menerima undangan interview ini' },
                { status: 403 }
            )
        }

        // Check timing - can access 15 minutes before
        const now = new Date()
        const scheduledAt = new Date(interview.scheduledAt)
        const diffMs = scheduledAt - now
        const diffMinutes = Math.floor(diffMs / (1000 * 60))

        const canAccess = diffMinutes <= 15 && diffMinutes >= -60 // 15 min before to 1 hour after
        const isPast = diffMinutes < -60

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
                    status: interview.status
                },
                jobs: {
                    id: participant.applications.jobs.id,
                    title: participant.applications.jobs.title,
                    company: participant.applications.jobs.companies
                },
                recruiter: interview.recruiters,
                participant: {
                    id: participant.id,
                    status: isApprovedReschedule ? 'ACCEPTED' : participant.status,
                    invitedAt: participant.invitedAt,
                    respondedAt: participant.respondedAt
                },
                timing: {
                    canAccess,
                    isPast,
                    minutesUntil: diffMinutes,
                    scheduledAt: interview.scheduledAt
                }
            }
        })

    } catch (error) {
        return NextResponse.json(
            createErrorResponse('Gagal memuat ruang interview', error),
            { status: 500 }
        )
    }
}

// PATCH - Jobseeker cannot complete interviews; recruiter controls interview outcomes.
export async function PATCH(request) {
    const auth = await requireJobseeker(request)
    if (auth.error) {
        return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    return NextResponse.json(
        { error: 'Interview hanya dapat ditandai selesai oleh recruiter' },
        { status: 403 }
    )
}
