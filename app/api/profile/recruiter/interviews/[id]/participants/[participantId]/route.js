import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
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

        // If rejecting reschedule, also reject the application
        if (rejectReschedule) {
            // Update participant status
            await prisma.interview_participants.update({
                where: { id: participantId },
                data: {
                    status: 'DECLINED'
                }
            })

            // Update application status to REJECTED
            await prisma.applications.update({
                where: { id: participant.applicationId },
                data: {
                    status: 'REJECTED',
                    recruiterNotes: 'Permintaan reschedule ditolak'
                }
            })

            return NextResponse.json({
                success: true,
                message: 'Reschedule rejected and application rejected'
            })
        }

        // Normal status update
        const updatedParticipant = await prisma.interview_participants.update({
            where: { id: participantId },
            data: { status }
        })

        return NextResponse.json({
            success: true,
            data: updatedParticipant
        })

    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to update participant', details: error.message },
            { status: 500 }
        )
    }
}
