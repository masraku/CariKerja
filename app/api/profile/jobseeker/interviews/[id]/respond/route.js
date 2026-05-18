import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createErrorResponse } from '@/lib/errorHandler'
import { requireJobseeker } from '@/lib/authHelper'
import { validateBody } from '@/lib/validations'
import { interviewRespondSchema } from '@/lib/validations/profile'

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
        const { id } = params
        
        const validation = await validateBody(request, interviewRespondSchema)
        if (!validation.success) {
            return validation.response
        }
        const { status, message } = validation.data

        // Accept both participant id and interview id to keep jobseeker pages consistent.
        const participant = await prisma.interview_participants.findFirst({
            where: {
                OR: [
                    { id },
                    { interviewId: id }
                ],
                applications: {
                    jobseekerId: jobseeker.id
                }
            },
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

        // Check if already responded
        if (participant.status !== 'PENDING') {
            return NextResponse.json(
                { error: `You have already ${participant.status.toLowerCase()} this interview` },
                { status: 400 }
            )
        }

        // Update participant status
        const updated = await prisma.interview_participants.update({
            where: { id: participant.id },
            data: {
                status: status,
                responseMessage: message || null,
                respondedAt: new Date(),
                updatedAt: new Date()
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
            createErrorResponse('Gagal merespons to interview', error),
            { status: 500 }
        )
    }
}
