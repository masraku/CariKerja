import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireJobseeker } from '@/lib/authHelper'

// PATCH - Respond to interview (Accept/Decline)
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
        const { status, message } = body // status: ACCEPTED or DECLINED

        // Validate status
        if (!['ACCEPTED', 'DECLINED'].includes(status)) {
            return NextResponse.json(
                { error: 'Invalid status. Must be ACCEPTED or DECLINED' },
                { status: 400 }
            )
        }

        // Get participant with interview details
        const participant = await prisma.interviewParticipant.findUnique({
            where: { id: participantId },
            include: {
                interview: {
                    include: {
                        recruiters: {
                            include: {
                                user: true
                            }
                        }
                    }
                },
                application: {
                    include: {
                        jobseeker: true,
                        jobs: {
                            include: {
                                company: true
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
        if (participant.application.jobseekerId !== jobseeker.id) {
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
        const updated = await prisma.interviewParticipant.update({
            where: { id: participantId },
            data: {
                status: status,
                respondedAt: new Date()
            }
        })

        // TODO: Send email to recruiter
        console.log('📧 Should send email to recruiter:', participant.interview.recruiters.user.email)
        console.log('Jobseeker response:', {
            jobseeker: `${participant.application.jobseeker.firstName} ${participant.application.jobseeker.lastName}`,
            status: status,
            interview: participant.interview.title,
            scheduledAt: participant.interview.scheduledAt
        })

        return NextResponse.json({
            success: true,
            data: {
                participant: updated,
                message: `Interview ${status.toLowerCase()} successfully`
            }
        })

    } catch (error) {
        console.error('Respond to interview error:', error)
        return NextResponse.json(
            { error: 'Failed to respond to interview', details: error.message },
            { status: 500 }
        )
    }
}
