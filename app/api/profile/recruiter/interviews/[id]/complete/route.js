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

        // Update interview status
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
