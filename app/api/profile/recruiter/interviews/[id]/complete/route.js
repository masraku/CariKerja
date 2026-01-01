import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRecruiter } from '@/lib/authHelper'

// PATCH - Mark interview as completed
export async function PATCH(request, context) {
    try {
        const params = await context.params
        const { id } = params

        // Authenticate
        const auth = await requireRecruiter(request)
        if (auth.error) {
            return NextResponse.json({ error: auth.error }, { status: auth.status })
        }

        const { recruiter } = auth

        // Get interview with participants
        const interview = await prisma.interviews.findUnique({
            where: { id },
            include: {
                interview_participants: {
                    include: {
                        applications: {
                            include: {
                                jobseekers: {
                                    include: {
                                        users: true
                                    }
                                }
                            }
                        }
                    }
                },
                jobs: {
                    select: {
                        title: true
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

        // Check ownership
        if (interview.recruiterId !== recruiter.id) {
            return NextResponse.json(
                { error: 'Unauthorized. You can only complete your own interviews.' },
                { status: 403 }
            )
        }

        // Check if already completed
        if (interview.status === 'COMPLETED') {
            return NextResponse.json(
                { error: 'Interview is already marked as completed' },
                { status: 400 }
            )
        }

        // Check if interview time has passed
        const now = new Date()
        const scheduledTime = new Date(interview.scheduledAt)
        if (now < scheduledTime) {
            return NextResponse.json(
                { error: 'Cannot mark interview as completed before scheduled time' },
                { status: 400 }
            )
        }

        // Check if completing for specific participant
        const body = await request.json().catch(() => ({}))
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

            // 2. Update participant status
            await prisma.interview_participants.update({
                where: { id: participantId },
                data: { status: 'COMPLETED' }
            })

            // 3. Update application status
            await prisma.applications.update({
                where: { id: participant.applicationId },
                data: { status: 'INTERVIEW_COMPLETED' }
            })

            // 4. Check if ALL participants are now completed
            const allParticipants = await prisma.interview_participants.findMany({
                where: { interviewId: id }
            })
            const allCompleted = allParticipants.every(p => p.status === 'COMPLETED' || p.status === 'REJECTED' || p.status === 'CANCELLED')

            let interviewUpdated = false
            if (allCompleted) {
                await prisma.interviews.update({
                    where: { id },
                    data: { status: 'COMPLETED' }
                })
                interviewUpdated = true
            }

            return NextResponse.json({
                success: true,
                message: 'Participant interview marked as completed',
                data: {
                    participantId,
                    interviewCompleted: interviewUpdated
                }
            })
        }

        // Default: Update interview status (mark ALL as completed)
        const updatedInterview = await prisma.interviews.update({
            where: { id },
            data: {
                status: 'COMPLETED'
            }
        })

        // Update all participants to COMPLETED status (ACCEPTED and PENDING/Rescheduled)
        await prisma.interview_participants.updateMany({
            where: {
                interviewId: id,
                status: { in: ['ACCEPTED', 'PENDING'] }
            },
            data: {
                status: 'COMPLETED'
            }
        })

        // Update application statuses to INTERVIEW_COMPLETED
        const participantsToUpdate = interview.interview_participants.filter(p => ['ACCEPTED', 'PENDING'].includes(p.status))
        const applicationIds = participantsToUpdate.map(p => p.applicationId)

        await prisma.applications.updateMany({
            where: {
                id: { in: applicationIds }
            },
            data: {
                status: 'INTERVIEW_COMPLETED'
            }
        })

        return NextResponse.json({
            success: true,
            message: 'Interview marked as completed successfully',
            data: {
                interview: updatedInterview,
                participantsUpdated: participantsToUpdate.length,
                applicationsUpdated: applicationIds.length
            }
        })

    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to mark interview as completed', details: error.message },
            { status: 500 }
        )
    }
}
