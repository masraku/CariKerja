import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireJobseeker } from '@/lib/authHelper'

// PATCH - Respond to interview (Accept/Decline/Request Reschedule)
export async function PATCH(request, context) {
    try {
        // Authenticate
        const auth = await requireJobseeker(request)
        if (auth.error) {
            return NextResponse.json({ error: auth.error }, { status: auth.status })
        }

        const { jobseeker } = auth
        const params = await context.params
        const { id: participantId } = params
        const body = await request.json()
        const { status, message } = body // status: ACCEPTED, DECLINED, or RESCHEDULE_REQUESTED

        // Validate status
        if (!['ACCEPTED', 'DECLINED', 'RESCHEDULE_REQUESTED'].includes(status)) {
            return NextResponse.json(
                { error: 'Invalid status. Must be ACCEPTED, DECLINED, or RESCHEDULE_REQUESTED' },
                { status: 400 }
            )
        }

        // Validate reschedule must have message
        if (status === 'RESCHEDULE_REQUESTED' && (!message || message.trim().length < 10)) {
            return NextResponse.json(
                { error: 'Reschedule request must include a reason (min 10 characters)' },
                { status: 400 }
            )
        }

        // Get participant with interview details
        const participant = await prisma.interview_participants.findUnique({
            where: { id: participantId },
            include: {
                interviews: {
                    include: {
                        recruiters: {
                            include: {
                                users: true
                            }
                        }
                    }
                },
                applications: {
                    include: {
                        jobseekers: true,
                        jobs: {
                            include: {
                                companies: true
                            }
                        }
                    }
                }
            }
        })

        if (!participant) {
            return NextResponse.json(
                { error: 'Interview participant not found' },
                { status: 404 }
            )
        }

        // Verify ownership
        if (participant.applications.jobseekerId !== jobseeker.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 403 }
            )
        }

        // Check if already responded
        if (participant.status !== 'PENDING') {
            return NextResponse.json(
                { error: `You have already ${participant.status.toLowerCase()} this interview` },
                { status: 400 }
            )
        }

        // Update participant status
        const updated = await prisma.interview_participants.update({
            where: { id: participantId },
            data: {
                status: status,
                responseMessage: message || null,
                respondedAt: new Date()
            }
        })

        // TODO: Send email to recruiter

        let responseMessage = ''
        if (status === 'ACCEPTED') {
            responseMessage = 'Interview accepted successfully'
        } else if (status === 'DECLINED') {
            responseMessage = 'Interview declined successfully'
        } else if (status === 'RESCHEDULE_REQUESTED') {
            responseMessage = 'Reschedule request sent successfully'
        }

        return NextResponse.json({
            success: true,
            data: {
                participant: updated,
                message: responseMessage
            }
        })

    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to respond to interview', details: error.message },
            { status: 500 }
        )
    }
}
