import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/authHelper'
import { createErrorResponse } from '@/lib/errorHandler'

export async function GET(request, { params }) {
    try {
        const auth = await requireAdmin(request)

        if (auth.error) {
            return NextResponse.json(
                { error: auth.error },
                { status: auth.status }
            )
        }

        const { id } = await params

        const company = await prisma.companies.findUnique({
            where: { id },
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
            }
        })

        if (!company) {
            return NextResponse.json({ error: 'Company not found' }, { status: 404 })
        }

        const recruiter = company.recruiters[0]

        return NextResponse.json({
            success: true,
            data: {
                company: {
                    id: company.id,
                    name: company.name,
                    slug: company.slug,
                    logo: company.logo,
                    tagline: company.tagline,
                    description: company.description,
                    industry: company.industry,
                    address: company.address,
                    city: company.city,
                    province: company.province,
                    postalCode: company.postalCode,
                    companySize: company.companySize,
                    foundedYear: company.foundedYear,
                    email: company.email,
                    phone: company.phone,
                    website: company.website,
                    linkedinUrl: company.linkedinUrl,
                    facebookUrl: company.facebookUrl,
                    instagramUrl: company.instagramUrl,
                    twitterUrl: company.twitterUrl,
                    culture: company.culture,
                    benefits: company.benefits,
                    gallery: company.gallery,
                    bio: company.bio,
                    npwp: company.npwp,
                    aktaPendirian: company.aktaPendirian,
                    siup: company.siup,
                    domisili: company.domisili,
                    verified: company.verified,
                    verifiedAt: company.verifiedAt,
                    rejectionReason: company.rejectionReason,
                    status: company.status,
                    totalEmployees: company.totalEmployees,
                    jobsCount: company._count.jobs,
                    recruiterName: recruiter ? `${recruiter.firstName} ${recruiter.lastName}` : null,
                    recruiterEmail: recruiter?.users?.email || null,
                    recruiterPhone: recruiter?.phone || null,
                    recruiterPosition: recruiter?.position || null,
                    recruiterFirstName: recruiter?.firstName || null,
                    recruiterLastName: recruiter?.lastName || null,
                    createdAt: company.createdAt,
                    updatedAt: company.updatedAt
                }
            }
        })
    } catch (error) {
        return NextResponse.json(
            createErrorResponse('Gagal mengambil detail company', error),
            { status: 500 }
        )
    }
}
