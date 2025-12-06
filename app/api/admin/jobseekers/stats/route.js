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
            pendingApplications,
            employedCount,
            lookingForJobCount
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
            }),
            // Count jobseekers who marked themselves as employed
            prisma.jobseekers.count({ where: { isEmployed: true } }),
            // Count jobseekers who are still looking for jobs
            prisma.jobseekers.count({ where: { isLookingForJob: true } })
        ])

        const unemployedCount = totalJobseekers - employedCount
        const notLookingCount = totalJobseekers - lookingForJobCount

        return NextResponse.json({
            success: true,
            data: {
                totalJobseekers,
                employed: employedCount,
                unemployed: unemployedCount,
                lookingForJob: lookingForJobCount,
                notLooking: notLookingCount,
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
