import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/authHelper'

export async function GET(request) {
    try {
        // Authenticate admin
        const auth = await requireAdmin(request)
        
        if (auth.error) {
            return NextResponse.json(
                { error: auth.error },
                { status: auth.status }
            )
        }

        // Get statistics in parallel
        const [
            totalJobseekers,
            totalApplications,
            acceptedApplications,
            rejectedApplications,
            pendingApplications
        ] = await Promise.all([
            prisma.jobseekers.count(),
            prisma.applications.count(),
            prisma.applications.count({ where: { status: 'ACCEPTED' } }),
            prisma.applications.count({ where: { status: 'REJECTED' } }),
            prisma.applications.count({
                where: {
                    status: {
                        in: ['PENDING', 'REVIEWING', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'INTERVIEW_COMPLETED']
                    }
                }
            })
        ])

        // Get jobseekers with at least one accepted application
        const employedJobseekers = await prisma.jobseekers.findMany({
            where: {
                applications: {
                    some: {
                        status: 'ACCEPTED'
                    }
                }
            },
            select: {
                id: true
            }
        })

        // Get jobseekers with only rejected applications (no accepted, has at least one rejected)
        const allJobseekers = await prisma.jobseekers.findMany({
            include: {
                applications: {
                    select: {
                        status: true
                    }
                }
            }
        })

        const rejectedJobseekers = allJobseekers.filter(js => {
            const hasAccepted = js.applications.some(app => app.status === 'ACCEPTED')
            const hasRejected = js.applications.some(app => app.status === 'REJECTED')
            const hasPending = js.applications.some(app => 
                ['PENDING', 'REVIEWING', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'INTERVIEW_COMPLETED'].includes(app.status)
            )
            return !hasAccepted && hasRejected && !hasPending
        })

        const employedCount = employedJobseekers.length
        const rejectedCount = rejectedJobseekers.length
        const activeCount = totalJobseekers - employedCount - rejectedCount

        return NextResponse.json({
            success: true,
            data: {
                totalJobseekers,
                employed: employedCount,
                rejected: rejectedCount,
                active: activeCount,
                totalApplications,
                acceptedApplications,
                rejectedApplications,
                pendingApplications
            }
        })

    } catch (error) {
        console.error('❌ Admin jobseeker stats error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch jobseeker statistics' },
            { status: 500 }
        )
    }
}
