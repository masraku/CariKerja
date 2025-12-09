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
                status: { in: ['PENDING_VERIFICATION', 'PENDING_RESUBMISSION'] }
            }
        } else if (statusFilter === 'resubmission') {
            whereClause = { verified: false, status: 'PENDING_RESUBMISSION' }
        } else if (statusFilter === 'verified') {
            whereClause = { verified: true, status: 'VERIFIED' }
        } else if (statusFilter === 'rejected') {
            whereClause = { status: { in: ['SUSPENDED', 'REJECTED'] } }
        }

        // Single optimized query - minimal fields for listing
        const companies = await prisma.companies.findMany({
            where: whereClause,
            select: {
                id: true,
                name: true,
                slug: true,
                logo: true,
                industry: true,
                city: true,
                verified: true,
                status: true,
                rejectionReason: true,
                createdAt: true,
                recruiters: {
                    take: 1,
                    select: {
                        firstName: true,
                        lastName: true,
                        users: { select: { email: true } }
                    }
                },
                _count: { select: { jobs: true } }
            },
            orderBy: { createdAt: 'desc' },
            take: 20 // Reduced limit for faster response
        })

        // Minimal transform
        const data = companies.map(c => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            logo: c.logo,
            industry: c.industry,
            city: c.city,
            verified: c.verified,
            status: c.status,
            rejectionReason: c.rejectionReason,
            jobsCount: c._count.jobs,
            recruiterName: c.recruiters[0] ? `${c.recruiters[0].firstName} ${c.recruiters[0].lastName}` : null,
            recruiterEmail: c.recruiters[0]?.users?.email || null,
            createdAt: c.createdAt
        }))

        return NextResponse.json({
            success: true,
            data: { companies: data, count: data.length }
        })

    } catch (error) {
        console.error('Admin companies error:', error.message)
        return NextResponse.json(
            { error: 'Failed to fetch companies' },
            { status: 500 }
        )
    }
}
