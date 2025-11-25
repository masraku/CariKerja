import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
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
        const participants = await prisma.interviewParticipant.findMany({
            where: {
                application: {
                    jobseekerId: jobseeker.id
                }
            },
            include: {
                interview: {
                    include: {
                        recruiter: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                position: true
                            }
                        }
                    }
                },
                application: {
                    include: {
                        job: {
                            include: {
                                company: {
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
                interview: {
                    scheduledAt: 'asc' // Upcoming first
                }
            }
        })

        // Transform data
        const interviews = participants.map(participant => ({
            id: participant.interview.id,
            participantId: participant.id,
            title: participant.interview.title,
            scheduledAt: participant.interview.scheduledAt,
            duration: participant.interview.duration,
            meetingUrl: participant.interview.meetingUrl,
            description: participant.interview.description,
            status: participant.status, // PENDING, ACCEPTED, DECLINED
            interviewStatus: participant.interview.status,
            invitedAt: participant.invitedAt,
            respondedAt: participant.respondedAt,
            job: {
                id: participant.application.job.id,
                title: participant.application.job.title,
                slug: participant.application.job.slug,
                company: participant.application.job.company
            },
            recruiter: participant.interview.recruiter,
            applicationId: participant.application.id,
            applicationStatus: participant.application.status
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
                    declined: interviews.filter(i => i.status === 'DECLINED').length
                }
            }
        })

    } catch (error) {
        console.error('Get interviews error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch interviews', details: error.message },
            { status: 500 }
        )
    }
}
