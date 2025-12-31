import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRecruiter } from '@/lib/authHelper'

// GET - Fetch all interviews for recruiter with participants
export async function GET(request) {
    try {
        // Authenticate
        const auth = await requireRecruiter(request)
        if (auth.error) {
            return NextResponse.json({ error: auth.error }, { status: auth.status })
        }

        const { recruiter } = auth

        // Get all interviews for this recruiter
        const interviews = await prisma.interviews.findMany({
            where: {
                recruiterId: recruiter.id
            },
            include: {
                jobs: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                        companies: {
                            select: {
                                id: true,
                                name: true,
                                logo: true
                            }
                        }
                    }
                },
                interview_participants: {
                    include: {
                        applications: {
                            include: {
                                jobseekers: {
                                    select: {
                                        id: true,
                                        firstName: true,
                                        lastName: true,
                                        photo: true,
                                        currentTitle: true,
                                        email: true
                                    }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: {
                scheduledAt: 'desc'
            }
        })

        // Transform data
        const transformedInterviews = interviews.map(interview => ({
            id: interview.id,
            title: interview.title,
            scheduledAt: interview.scheduledAt,
            duration: interview.duration,
            meetingUrl: interview.meetingUrl,
            meetingType: interview.meetingType,
            location: interview.location,
            description: interview.description,
            status: interview.status,
            job: interview.jobs,
            participants: interview.interview_participants.map(p => ({
                id: p.id,
                status: p.status,
                responseMessage: p.responseMessage,
                invitedAt: p.invitedAt,
                respondedAt: p.respondedAt,
                jobseeker: p.applications.jobseekers,
                applicationId: p.applicationId,
                applications: {
                    status: p.applications.status
                }
            }))
        }))

        // Calculate stats
        const stats = {
            total: interviews.length,
            scheduled: interviews.filter(i => i.status === 'SCHEDULED').length,
            completed: interviews.filter(i => i.status === 'COMPLETED').length,
            cancelled: interviews.filter(i => i.status === 'CANCELLED').length,
            rescheduled: interviews.filter(i => i.status === 'RESCHEDULED').length
        }

        return NextResponse.json({
            success: true,
            data: {
                interviews: transformedInterviews,
                stats
            }
        })

    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch interviews', details: error.message },
            { status: 500 }
        )
    }
}
