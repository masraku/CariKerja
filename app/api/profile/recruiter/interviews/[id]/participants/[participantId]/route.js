import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createErrorResponse } from '@/lib/errorHandler'
import { requireRecruiter } from '@/lib/authHelper'

// PATCH - Update participant status (for reject reschedule)
export async function PATCH(request, context) {
    try {
        const params = await context.params
        const { id: interviewId, participantId } = params
        
        // Authenticate recruiter
        const auth = await requireRecruiter(request)
        
        if (auth.error) {
            return NextResponse.json(
                { error: auth.error },
                { status: auth.status }
            )
        }

        const { recruiter } = auth
        const body = await request.json()
        const { status, rejectReschedule } = body

        // Get interview to verify ownership
        const interview = await prisma.interviews.findUnique({
            where: { id: interviewId }
        })

        if (!interview) {
            return NextResponse.json(
                { error: 'Interview not found' },
                { status: 404 }
            )
        }

        if (interview.recruiterId !== recruiter.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 403 }
            )
        }

        // Get participant
        const participant = await prisma.interview_participants.findUnique({
            where: { id: participantId },
            include: {
                applications: true
            }
        })

        if (!participant || participant.interviewId !== interviewId) {
            return NextResponse.json(
                { error: 'Participant not found' },
                { status: 404 }
            )
        }

        // Rejecting a reschedule request keeps the original interview active.
        if (rejectReschedule) {
            const updatedParticipant = await prisma.interview_participants.update({
                where: { id: participantId },
                data: {
                    status: 'PENDING',
                    responseMessage: null,
                    respondedAt: null,
                    updatedAt: new Date()
                }
            })

            return NextResponse.json({
                success: true,
                message: 'Permintaan reschedule ditolak. Kandidat tetap berada pada jadwal interview semula.',
                data: updatedParticipant
            })
        }

        // Normal status update
        const updatedParticipant = await prisma.interview_participants.update({
            where: { id: participantId },
            data: { status, updatedAt: new Date() }
        })

        return NextResponse.json({
            success: true,
            data: updatedParticipant
        })

    } catch (error) {
        return NextResponse.json(
            createErrorResponse('Gagal memperbarui participant', error),
            { status: 500 }
        )
    }
}
