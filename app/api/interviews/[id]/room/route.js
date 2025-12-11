import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
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
                { error: 'Interview not found' },
                { status: 404 }
            )
        }

        // Check if jobseeker is participant
        if (interview.interview_participants.length === 0) {
            return NextResponse.json(
                { error: 'You are not a participant in this interview' },
                { status: 403 }
            )
        }

        const participant = interview.interview_participants[0]

        // Check if participant accepted
        if (participant.status !== 'ACCEPTED') {
            return NextResponse.json(
                { error: 'You have not accepted this interview invitation' },
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
                    meetingUrl: interview.meetingUrl,
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
                    status: participant.status,
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
        console.error('Get interview room error:', error)
        return NextResponse.json(
            { error: 'Failed to get interview room', details: error.message },
            { status: 500 }
        )
    }
}

// PATCH - Mark interview as completed (can be called by jobseeker after interview)
export async function PATCH(request, context) {
    try {
        const auth = await requireJobseeker(request)
        if (auth.error) {
            return NextResponse.json({ error: auth.error }, { status: auth.status })
        }

        const { jobseeker } = auth
        const params = await context.params
        const { id: interviewId } = params
        const body = await request.json()
        const { action } = body // action: "mark_completed"

        if (action !== 'mark_completed') {
            return NextResponse.json(
                { error: 'Invalid action' },
                { status: 400 }
            )
        }

        // Verify participant
        const participant = await prisma.interview_participants.findFirst({
            where: {
                interviewId: interviewId,
                applications: {
                    jobseekerId: jobseeker.id
                }
            }
        })

        if (!participant) {
            return NextResponse.json(
                { error: 'Not authorized' },
                { status: 403 }
            )
        }

        // Update participant status to COMPLETED
        await prisma.interview_participants.update({
            where: { id: participant.id },
            data: {
                status: 'COMPLETED'
            }
        })

        return NextResponse.json({
            success: true,
            message: 'Interview marked as completed'
        })

    } catch (error) {
        console.error('Mark interview completed error:', error)
        return NextResponse.json(
            { error: 'Failed to mark interview as completed' },
            { status: 500 }
        )
    }
}
