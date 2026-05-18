import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createErrorResponse } from '@/lib/errorHandler'
import { requireJobseeker } from '@/lib/authHelper'

// GET - Fetch all interviews for jobseeker
export async function GET(request) {
    try {
        // Authenticate
        const auth = await requireJobseeker(request)
        if (auth.error) {
            return NextResponse.json({ error: auth.error }, { status: auth.status })
        }

        const { jobseeker } = auth

        // Get all interview participants for this jobseeker
        const participants = await prisma.interview_participants.findMany({
            where: {
                applications: {
                    jobseekerId: jobseeker.id
                }
            },
            include: {
                interviews: {
                    include: {
                        recruiters: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                position: true
                            }
                        }
                    }
                },
                applications: {
                    include: {
                        jobs: {
                            include: {
                                companies: {
                                    select: {
                                        id: true,
                                        name: true,
                                        logo: true,
                                        city: true
                                    }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: {
                interviews: {
                    scheduledAt: 'asc' // Upcoming first
                }
            }
        })

        // Transform data
        const interviews = participants.map(participant => ({
            id: participant.interviews.id,
            participantId: participant.id,
            title: participant.interviews.title,
            scheduledAt: participant.interviews.scheduledAt,
            duration: participant.interviews.duration,
            meetingType: participant.interviews.meetingType,
            meetingUrl: participant.interviews.meetingUrl,
            location: participant.interviews.location,
            description: participant.interviews.description,
            status: participant.status, // PENDING, ACCEPTED, DECLINED, RESCHEDULE_REQUESTED
            responseMessage: participant.responseMessage,
            interviewStatus: participant.interviews.status,
            invitedAt: participant.invitedAt,
            respondedAt: participant.respondedAt,
            jobs: {
                id: participant.applications.jobs.id,
                title: participant.applications.jobs.title,
                slug: participant.applications.jobs.slug,
                company: participant.applications.jobs.companies
            },
            recruiter: participant.interviews.recruiters,
            applicationId: participant.applications.id,
            applicationStatus: participant.applications.status
        }))

        // Separate into pending and responded
        const pending = interviews.filter(i => i.status === 'PENDING')
        const responded = interviews.filter(i => i.status !== 'PENDING')

        return NextResponse.json({
            success: true,
            data: {
                interviews,
                pending,
                responded,
                stats: {
                    total: interviews.length,
                    pending: pending.length,
                    accepted: interviews.filter(i => i.status === 'ACCEPTED').length,
                    declined: interviews.filter(i => i.status === 'DECLINED').length,
                    reschedule: interviews.filter(i => i.status === 'RESCHEDULE_REQUESTED').length
                }
            }
        })

    } catch (error) {
        return NextResponse.json(
            createErrorResponse('Gagal mengambil interviews', error),
            { status: 500 }
        )
    }
}
