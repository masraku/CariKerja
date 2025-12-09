import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export async function GET(request) {
    try {
        // Verify admin token
        const authHeader = request.headers.get('Authorization')
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const token = authHeader.split(' ')[1]
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        
        if (decoded.role !== 'ADMIN') {
            return NextResponse.json({ success: false, error: 'Admin only' }, { status: 403 })
        }

        // Get current date and calculate 6 months ago
        const now = new Date()
        const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)

        // Get monthly job postings for the last 6 months
        const jobs = await prisma.jobs.findMany({
            where: {
                createdAt: {
                    gte: sixMonthsAgo
                }
            },
            select: {
                createdAt: true
            }
        })

        console.log('Jobs found:', jobs.length)

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

        console.log('Monthly jobs data:', monthlyJobsData)

        // Get employment stats for pie chart - using correct model name: jobseekers
        const jobseekers = await prisma.jobseekers.findMany({
            select: {
                isEmployed: true,
                isLookingForJob: true
            }
        })

        console.log('Jobseekers found:', jobseekers.length)
        console.log('Jobseekers data sample:', jobseekers.slice(0, 3))

        const employmentData = {
            employed: jobseekers.filter(js => js.isEmployed === true).length,
            unemployed: jobseekers.filter(js => js.isEmployed === false || js.isEmployed === null).length
        }

        console.log('Employment data:', employmentData)

        // Get looking for job stats
        const lookingData = {
            looking: jobseekers.filter(js => js.isLookingForJob === true).length,
            notLooking: jobseekers.filter(js => js.isLookingForJob === false || js.isLookingForJob === null).length
        }

        return NextResponse.json({
            success: true,
            data: {
                monthlyJobs: monthlyJobsData,
                employment: employmentData,
                looking: lookingData,
                totalJobseekers: jobseekers.length,
                totalJobs: jobs.length
            }
        })

    } catch (error) {
        console.error('Admin chart stats error:', error)
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 })
    }
}
