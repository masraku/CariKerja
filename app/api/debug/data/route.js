import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Debug endpoint - check data
export async function GET(request) {
    try {
        // Count applications
        const applicationCount = await prisma.applications.count()
        
        // Get all applications
        const applications = await prisma.applications.findMany({
            include: {
                jobseekers: {
                    include: {
                        users: {
                            select: {
                                email: true
                            }
                        }
                    }
                },
                jobs: {
                    select: {
                        title: true,
                        slug: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 10
        })

        // Count interviews
        const interviewCount = await prisma.interviews.count()
        
        // Get all interviews
        const interviews = await prisma.interviews.findMany({
            include: {
                interview_participants: {
                    include: {
                        applications: {
                            include: {
                                jobseekers: {
                                    include: {
                                        users: {
                                            select: {
                                                email: true
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            take: 10
        })

        // Count jobseekers
        const jobseekerCount = await prisma.jobseekers.count()

        return NextResponse.json({
            success: true,
            data: {
                counts: {
                    applications: applicationCount,
                    interviews: interviewCount,
                    jobseekers: jobseekerCount
                },
                applications: applications.map(app => ({
                    id: app.id,
                    status: app.status,
                    jobseeker: app.jobseekers.users.email,
                    job: app.jobs.title,
                    createdAt: app.createdAt
                })),
                interviews: interviews.map(int => ({
                    id: int.id,
                    title: int.title,
                    scheduledAt: int.scheduledAt,
                    participants: int.interview_participants.length,
                    status: int.status
                }))
            }
        })

    } catch (error) {
        console.error('Debug endpoint error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch debug data', details: error.message },
            { status: 500 }
        )
    }
}
