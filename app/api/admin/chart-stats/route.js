import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/authHelper'

export async function GET(request) {
    try {
        // Authenticate admin using consistent helper
        const auth = await requireAdmin(request)
        
        if (auth.error) {
            return NextResponse.json(
                { success: false, error: auth.error },
                { status: auth.status }
            )
        }

        // Get current date and calculate 6 months ago
        const now = new Date()
        const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)

        // Run all queries in parallel for better performance
        const [
            // Monthly jobs using groupBy for efficiency
            jobs,
            // Employment stats using count (much faster than findMany + filter)
            totalJobseekers,
            employedCount,
            lookingCount
        ] = await Promise.all([
            // Get jobs for last 6 months
            prisma.jobs.findMany({
                where: {
                    createdAt: { gte: sixMonthsAgo }
                },
                select: { createdAt: true }
            }),
            // Total jobseekers
            prisma.jobseekers.count(),
            // Employed count
            prisma.jobseekers.count({ where: { isEmployed: true } }),
            // Looking for job count
            prisma.jobseekers.count({ where: { isLookingForJob: true } })
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
                totalJobs: jobs.length
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
