import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url)
        const limit = parseInt(searchParams.get('limit') || '6')

        const jobs = await prisma.jobs.findMany({
            where: {
                isActive: true
            },
            take: limit,
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                companies: {
                    select: {
                        id: true,
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
            companies: {
                name: job.companies.name,
                logo: job.companies.logo,
                city: job.companies.city,
                industry: job.companies.industry
            },
            location: job.location || job.companies.city,
            jobType: job.jobType,
            salaryMin: job.salaryMin,
            salaryMax: job.salaryMax,
            salaryCurrency: job.salaryCurrency || 'IDR',
            postedAt: job.createdAt,
            applicationCount: job._count.applications,
            category: job.category
        }))

        return NextResponse.json({
            success: true,
            data: {
                jobs: featuredJobs
            }
        })

    } catch (error) {
        console.error('❌ Featured jobs error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch featured jobs' },
            { status: 500 }
        )
    }
}
