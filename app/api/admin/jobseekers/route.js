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

        const { searchParams } = new URL(request.url)
        const statusFilter = searchParams.get('status') || 'all' // all, employed, rejected, active

        // Get all jobseekers with their applications
        const jobseekers = await prisma.jobseekers.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        createdAt: true
                    }
                },
                applications: {
                    include: {
                        jobs: {
                            select: {
                                title: true,
                                companies: {
                                    select: {
                                        name: true
                                    }
                                }
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                }
            }
        })

        // Transform and calculate employment status
        const jobseekersWithStatus = jobseekers.map(jobseeker => {
            const acceptedApplications = jobseeker.applications.filter(app => app.status === 'ACCEPTED')
            const rejectedApplications = jobseeker.applications.filter(app => app.status === 'REJECTED')
            const pendingApplications = jobseeker.applications.filter(app => 
                ['PENDING', 'REVIEWING', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'INTERVIEW_COMPLETED'].includes(app.status)
            )

            let employmentStatus = 'ACTIVE'
            let acceptedJob = null

            if (acceptedApplications.length > 0) {
                employmentStatus = 'EMPLOYED'
                const latestAccepted = acceptedApplications[0]
                acceptedJob = {
                    title: latestAccepted.job.title,
                    company: latestAccepted.job.companies.name,
                    acceptedAt: latestAccepted.updatedAt
                }
            } else if (rejectedApplications.length > 0 && pendingApplications.length === 0) {
                employmentStatus = 'REJECTED'
            }

            return {
                id: jobseeker.id,
                userId: jobseeker.userId,
                firstName: jobseeker.firstName,
                lastName: jobseeker.lastName,
                email: jobseeker.user.email,
                phone: jobseeker.phone,
                city: jobseeker.city,
                province: jobseeker.province,
                employmentStatus,
                acceptedJob,
                lastApplicationDate: jobseeker.applications[0]?.createdAt || null,
                totalApplications: jobseeker.applications.length,
                acceptedCount: acceptedApplications.length,
                rejectedCount: rejectedApplications.length,
                pendingCount: pendingApplications.length,
                joinedAt: jobseeker.user.createdAt
            }
        })

        // Filter by employment status if specified
        let filteredJobseekers = jobseekersWithStatus
        if (statusFilter !== 'all') {
            filteredJobseekers = jobseekersWithStatus.filter(js => 
                js.employmentStatus.toLowerCase() === statusFilter.toLowerCase()
            )
        }

        return NextResponse.json({
            success: true,
            data: {
                jobseekers: filteredJobseekers,
                count: filteredJobseekers.length
            }
        })

    } catch (error) {
        console.error('❌ Admin jobseekers error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch jobseekers' },
            { status: 500 }
        )
    }
}
