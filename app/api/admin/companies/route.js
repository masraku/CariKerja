import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/authHelper'

export async function GET(request) {
    try {
        // Authenticate and check admin role
        const auth = await requireAdmin(request)
        
        if (auth.error) {
            return NextResponse.json(
                { error: auth.error },
                { status: auth.status }
            )
        }

        const { searchParams } = new URL(request.url)
        const statusFilter = searchParams.get('status') || 'pending'

        let whereClause = {}
        
        if (statusFilter === 'pending') {
            whereClause = {
                verified: false,
                status: 'PENDING_VERIFICATION'
            }
        } else if (statusFilter === 'verified') {
            whereClause = {
                verified: true,
                status: 'VERIFIED'
            }
        } else if (statusFilter === 'rejected') {
            whereClause = {
                OR: [
                    { status: 'SUSPENDED' },
                    { status: 'REJECTED' }
                ]
            }
        }

        const companies = await prisma.companies.findMany({
            where: whereClause,
            include: {
                recruiters: {
                    take: 1,
                    include: {
                        users: {
                            select: {
                                email: true
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        jobs: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        // Transform data
        const transformedCompanies = companies.map(company => ({
            id: company.id,
            name: company.name,
            slug: company.slug,
            logo: company.logo,
            industry: company.industry,
            city: company.city,
            province: company.province,
            companySize: company.companySize,
            email: company.email,
            phone: company.phone,
            website: company.website,
            verified: company.verified,
            verifiedAt: company.verifiedAt,
            verifiedBy: company.verifiedBy,
            rejectedAt: company.rejectedAt,
            rejectionReason: company.rejectionReason,
            status: company.status,
            jobsCount: company._count.jobs,
            recruiterEmail: company.recruiters[0]?.users?.email || null,
            createdAt: company.createdAt,
            updatedAt: company.updatedAt
        }))

        return NextResponse.json({
            success: true,
            data: {
                companies: transformedCompanies,
                count: transformedCompanies.length
            }
        })

    } catch (error) {
        console.error('❌ Admin companies error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch companies' },
            { status: 500 }
        )
    }
}
