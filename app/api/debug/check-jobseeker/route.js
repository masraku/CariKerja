import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// Debug: Check user, jobseeker, and applications
export async function GET(request) {
    try {
        const authHeader = request.headers.get('authorization')
        if (!authHeader) {
            return NextResponse.json({ error: 'No auth header' }, { status: 401 })
        }

        const token = authHeader.substring(7)
        const decoded = verifyToken(token)

        if (!decoded) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
        }

        // Get user
        const user = await prisma.users.findUnique({
            where: { id: decoded.userId }
        })

        // Get all jobseekers for this user
        const jobseekers = await prisma.jobSeeker.findMany({
            where: { userId: user.id }
        })

        // Get ALL applications (regardless of jobseekerId)
        const allApplications = await prisma.applications.findMany({
            include: {
                jobs: {
                    select: {
                        title: true,
                        slug: true
                    }
                },
                jobseekers: {
                    select: {
                        id: true,
                        userId: true,
                        firstName: true,
                        lastName: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 10
        })

        // Filter applications by user
        const userApplications = allApplications.filter(app => 
            app.jobseeker.userId === user.id
        )

        return NextResponse.json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role
                },
                jobseekers: jobseekers.map(js => ({
                    id: js.id,
                    userId: js.userId,
                    firstName: js.firstName,
                    lastName: js.lastName,
                    createdAt: js.createdAt
                })),
                totalJobseekers: jobseekers.length,
                applications: userApplications.map(app => ({
                    id: app.id,
                    jobseekerId: app.jobseekerId,
                    jobTitle: app.jobs.title,
                    status: app.status,
                    appliedAt: app.appliedAt,
                    jobseekerInfo: app.jobseeker
                })),
                totalApplications: userApplications.length,
                problem: jobseekers.length > 1 ? 'MULTIPLE_JOBSEEKER_RECORDS' : null
            }
        })

    } catch (error) {
        console.error('Debug check error:', error)
        return NextResponse.json(
            { error: 'Failed', details: error.message },
            { status: 500 }
        )
    }
}
