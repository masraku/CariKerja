import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url)
        const limit = parseInt(searchParams.get('limit') || '6')

        // OPTIMIZED: use select instead of include
        const jobs = await prisma.jobs.findMany({
            where: {
                isActive: true
            },
            take: limit,
            orderBy: {
                createdAt: 'desc'
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
            applicationCount: job._count.applications,
            category: job.category
        }))

        // Add cache headers for better performance
        return NextResponse.json({
            success: true,
            data: {
                jobs: featuredJobs
            }
        }, {
            headers: {
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
            }
        })

    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch featured jobs' },
            { status: 500 }
        )
    }
}
