import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { publicLimiter, getIP, rateLimitResponse } from '@/lib/rateLimit'

export async function GET(request) {
    try {
        // Rate limiting - 100 requests per minute
        const ip = getIP(request)
        const { success, reset } = await publicLimiter.limit(ip)
        if (!success) {
            return rateLimitResponse(reset)
        }

        const { searchParams } = new URL(request.url)
        const limit = parseInt(searchParams.get('limit') || '8')

        // Get verified companies, sorted by job count
        const companies = await prisma.companies.findMany({
            where: {
                verified: true,
                status: 'VERIFIED'
            },
            take: limit,
            include: {
                jobs: {
                    where: {
                        status: 'ACTIVE',
                        isActive: true,
                        publishedAt: { not: null }
                    },
                    take: 3,
                    orderBy: {
                        createdAt: 'desc'
                    },
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                        location: true,
                        jobType: true
                    }
                },
            },
            orderBy: {
                jobs: {
                    _count: 'desc'
                }
            }
        })

        // Transform data
        const topCompanies = companies.map(company => ({
            id: company.id,
            name: company.name,
            slug: company.slug,
            logo: company.logo,
            description: company.description,
            city: company.city,
            province: company.province,
            industry: company.industry,
            totalJobsCount: company.jobs.length,
            latestJobs: company.jobs
        }))

        return NextResponse.json({
            success: true,
            data: {
                companies: topCompanies
            }
        })

    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch top companies' },
            { status: 500 }
        )
    }
}
