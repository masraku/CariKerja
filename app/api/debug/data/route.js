import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Debug endpoint - check data
export async function GET(request) {
    try {
        // Count applications
        const applicationCount = await prisma.application.count()
        
        // Get all applications
        const applications = await prisma.application.findMany({
            include: {
                jobseeker: {
                    include: {
                        user: {
                            select: {
                                email: true
                            }
                        }
                    }
                },
                job: {
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
        const interviewCount = await prisma.interview.count()
        
        // Get all interviews
        const interviews = await prisma.interview.findMany({
            include: {
                participants: {
                    include: {
                        application: {
                            include: {
                                jobseeker: {
                                    include: {
                                        user: {
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
        const jobseekerCount = await prisma.jobSeeker.count()

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
                    jobseeker: app.jobseeker.user.email,
                    job: app.job.title,
                    createdAt: app.createdAt
                })),
                interviews: interviews.map(int => ({
                    id: int.id,
                    title: int.title,
                    scheduledAt: int.scheduledAt,
                    participants: int.participants.length,
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
