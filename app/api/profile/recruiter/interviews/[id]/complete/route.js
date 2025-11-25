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
        const interview = await prisma.interview.findUnique({
            where: { id },
            include: {
                participants: {
                    include: {
                        application: {
                            include: {
                                jobseeker: {
                                    include: {
                                        user: true
                                    }
                                }
                            }
                        }
                    }
                },
                job: {
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
        const updatedInterview = await prisma.interview.update({
            where: { id },
            data: {
                status: 'COMPLETED'
            }
        })

        // Update all participants to COMPLETED status (only those who were ACCEPTED)
        await prisma.interviewParticipant.updateMany({
            where: {
                interviewId: id,
                status: 'ACCEPTED' // Only update accepted participants
            },
            data: {
                status: 'COMPLETED'
            }
        })

        // Update application statuses to INTERVIEW_COMPLETED
        const acceptedParticipants = interview.participants.filter(p => p.status === 'ACCEPTED')
        const applicationIds = acceptedParticipants.map(p => p.applicationId)

        await prisma.application.updateMany({
            where: {
                id: { in: applicationIds }
            },
            data: {
                status: 'INTERVIEW_COMPLETED'
            }
        })

        console.log(`✅ Interview ${id} marked as COMPLETED`)
        console.log(`📝 Updated ${applicationIds.length} applications to INTERVIEW_COMPLETED`)

        return NextResponse.json({
            success: true,
            message: 'Interview marked as completed successfully',
            data: {
                interview: updatedInterview,
                participantsUpdated: acceptedParticipants.length,
                applicationsUpdated: applicationIds.length
            }
        })

    } catch (error) {
        console.error('❌ Complete interview error:', error)
        return NextResponse.json(
            { error: 'Failed to mark interview as completed', details: error.message },
            { status: 500 }
        )
    }
}
