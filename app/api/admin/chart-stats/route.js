import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(request) {
    try {
        // Verify admin
        const authHeader = request.headers.get('authorization')
        if (!authHeader) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const token = authHeader.replace('Bearer ', '')
        const decoded = verifyToken(token)
        
        if (!decoded || decoded.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get current date and calculate 6 months ago
        const now = new Date()
        const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)

        // Run all queries in parallel for better performance
        const [
            // Monthly jobs using groupBy for efficiency
            jobs,
            // Employment stats
            totalJobseekers,
            employedCount,
            lookingCount,
            // New stats
            verifiedCompanies,
            activeJobs,
            pendingJobs
        ] = await Promise.all([
            // Get jobs for last 6 months
            prisma.jobs.findMany({
                where: {
                    createdAt: { gte: sixMonthsAgo }
                },
                select: { createdAt: true }
            }),
            // Jobseeker Stats
            prisma.jobseekers.count(),
            prisma.jobseekers.count({ where: { isEmployed: true } }),
            prisma.jobseekers.count({ where: { isLookingForJob: true } }),
            
            // New Dashboard Stats
            prisma.companies.count({ where: { status: 'VERIFIED' } }),
            prisma.jobs.count({ where: { status: 'ACTIVE' } }),
            prisma.jobs.count({ where: { status: 'PENDING' } })
        ])

        // Group jobs by month
        const monthlyJobs = {}
        const months = []
        
        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
            const monthName = date.toLocaleDateString('id-ID', { month: 'short' })
            months.push({ key: monthKey, name: monthName })
            monthlyJobs[monthKey] = 0
        }

        jobs.forEach(job => {
            const date = new Date(job.createdAt)
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
            if (monthlyJobs.hasOwnProperty(monthKey)) {
                monthlyJobs[monthKey]++
            }
        })

        const monthlyJobsData = months.map(m => ({
            month: m.name,
            count: monthlyJobs[m.key]
        }))

        return NextResponse.json({
            success: true,
            data: {
                monthlyJobs: monthlyJobsData,
                employment: {
                    employed: employedCount,
                    unemployed: totalJobseekers - employedCount
                },
                looking: {
                    looking: lookingCount,
                    notLooking: totalJobseekers - lookingCount
                },
                totalJobseekers,
                totalJobs: jobs.length,
                verifiedCompanies,
                activeJobs,
                pendingJobs
            }
        })

    } catch (error) {
        console.error('❌ Admin chart stats error:', error.message)
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 })
    }
}
