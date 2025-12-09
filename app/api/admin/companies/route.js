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

        // Full query with all fields needed for detail view
        const companies = await prisma.companies.findMany({
            where: whereClause,
            select: {
                id: true,
                name: true,
                slug: true,
                logo: true,
                tagline: true,
                description: true,
                industry: true,
                address: true,
                city: true,
                province: true,
                postalCode: true,
                companySize: true,
                foundedYear: true,
                email: true,
                phone: true,
                website: true,
                linkedinUrl: true,
                facebookUrl: true,
                instagramUrl: true,
                twitterUrl: true,
                culture: true,
                benefits: true,
                gallery: true,
                bio: true,
                npwp: true,
                aktaPendirian: true,
                siup: true,
                domisili: true,
                verified: true,
                verifiedAt: true,
                rejectionReason: true,
                status: true,
                totalEmployees: true,
                createdAt: true,
                updatedAt: true,
                recruiters: {
                    take: 1,
                    select: {
                        firstName: true,
                        lastName: true,
                        phone: true,
                        position: true,
                        users: { select: { email: true } }
                    }
                },
                _count: { select: { jobs: true } }
            },
            orderBy: { createdAt: 'desc' },
            take: 50
        })

        // Transform data with all fields
        const data = companies.map(c => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            logo: c.logo,
            tagline: c.tagline,
            description: c.description,
            industry: c.industry,
            address: c.address,
            city: c.city,
            province: c.province,
            postalCode: c.postalCode,
            companySize: c.companySize,
            foundedYear: c.foundedYear,
            email: c.email,
            phone: c.phone,
            website: c.website,
            linkedinUrl: c.linkedinUrl,
            facebookUrl: c.facebookUrl,
            instagramUrl: c.instagramUrl,
            twitterUrl: c.twitterUrl,
            culture: c.culture,
            benefits: c.benefits,
            gallery: c.gallery,
            bio: c.bio,
            npwp: c.npwp,
            aktaPendirian: c.aktaPendirian,
            siup: c.siup,
            domisili: c.domisili,
            verified: c.verified,
            verifiedAt: c.verifiedAt,
            rejectionReason: c.rejectionReason,
            status: c.status,
            totalEmployees: c.totalEmployees,
            jobsCount: c._count.jobs,
            recruiterName: c.recruiters[0] ? `${c.recruiters[0].firstName} ${c.recruiters[0].lastName}` : null,
            recruiterEmail: c.recruiters[0]?.users?.email || null,
            recruiterPhone: c.recruiters[0]?.phone || null,
            recruiterPosition: c.recruiters[0]?.position || null,
            recruiterFirstName: c.recruiters[0]?.firstName || null,
            recruiterLastName: c.recruiters[0]?.lastName || null,
            createdAt: c.createdAt,
            updatedAt: c.updatedAt
        }))

        return NextResponse.json({
            success: true,
            data: { companies: data, count: data.length }
        })

    } catch (error) {
        console.error('Admin companies error:', error.message)
        return NextResponse.json(
            { error: 'Failed to fetch companies', details: error.message },
            { status: 500 }
        )
    }
}
