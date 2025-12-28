import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request) {
    try {
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
                        isActive: true
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
                _count: {
                    select: {
                        jobs: {
                            where: {
                                isActive: true
                            }
                        }
                    }
                }
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
            logo: company.logo,
            description: company.description,
            city: company.city,
            province: company.province,
            industry: company.industry,
            activeJobsCount: company._count.jobs,
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
