import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { publicLimiter, getIP, rateLimitResponse } from '@/lib/rateLimit'
import { publicActiveJobWhere } from '@/lib/jobs/publicFilters'

export async function GET(request) {
    try {
        // Rate limiting - 100 requests per minute
        const ip = getIP(request)
        const { success, reset } = await publicLimiter.limit(ip)
        if (!success) {
            return rateLimitResponse(reset)
        }

        const { searchParams } = new URL(request.url)
        const limit = parseInt(searchParams.get('limit') || '6')
        const now = new Date()

        // OPTIMIZED: use select instead of include
        const jobs = await prisma.jobs.findMany({
            where: publicActiveJobWhere(now),
            take: limit,
            orderBy: {
                publishedAt: 'desc'
            },
            select: {
                id: true,
                title: true,
                slug: true,
                location: true,
                jobType: true,
                salaryMin: true,
                salaryMax: true,
                category: true,
                createdAt: true,
                applicationDeadline: true,
                companies: {
                    select: {
                        name: true,
                        logo: true,
                        city: true,
                        industry: true
                    }
                },
                _count: {
                    select: {
                        applications: true
                    }
                }
            }
        })

        // Transform data for frontend
        const featuredJobs = jobs.map(job => ({
            id: job.id,
            title: job.title,
            slug: job.slug,
            companies: job.companies ? {
                name: job.companies.name,
                logo: job.companies.logo,
                city: job.companies.city,
                industry: job.companies.industry
            } : null,
            location: job.location || job.companies?.city || '',
            jobType: job.jobType,
            salaryMin: job.salaryMin,
            salaryMax: job.salaryMax,
            salaryCurrency: 'IDR',
            postedAt: job.createdAt,
            applicationDeadline: job.applicationDeadline,
            applicationCount: job._count.applications,
            applicants: job._count.applications,
            category: job.category
        }))

        return NextResponse.json({
            success: true,
            data: {
                jobs: featuredJobs
            }
        }, {
            headers: {
                'Cache-Control': 'no-store, max-age=0'
            }
        })

    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch featured jobs' },
            { status: 500 }
        )
    }
}
