import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRecruiter, getCurrentUser } from '@/lib/authHelper'

// GET - Fetch recruiter profile
export async function GET(request) {
    try {
        // ✅ Use getCurrentUser instead
        const auth = await getCurrentUser(request)

        if (auth.error) {
            return NextResponse.json(
                { error: auth.error },
                { status: auth.status }
            )
        }

        const { user } = auth

        if (user.role !== 'RECRUITER') {
            return NextResponse.json(
                { error: 'Access denied. Recruiter role required' },
                { status: 403 }
            )
        }

        // Try to find recruiter profile
        const recruiter = await prisma.recruiters.findUnique({
            where: { userId: user.id },
            include: { companies: true }
        })

        // ✅ Return null profile if not found (not an error)
        return NextResponse.json({
            success: true,
            profile: recruiter // Can be null
        })

    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch profile' },
            { status: 500 }
        )
    }
}

// POST/PUT - Create or Update recruiter profile
export async function POST(request) {
    try {
        // ✅ Use getCurrentUser instead of requireRecruiter
        // Because recruiter profile might not exist yet on first create
        const auth = await getCurrentUser(request)

        if (auth.error) {
            return NextResponse.json(
                { error: auth.error },
                { status: auth.status }
            )
        }

        const { user } = auth

        // ✅ Check if user role is RECRUITER
        if (user.role !== 'RECRUITER') {
            return NextResponse.json(
                { error: 'Access denied. Recruiter role required' },
                { status: 403 }
            )
        }

        const body = await request.json()

        const {
            // Personal Info
            firstName,
            lastName,
            position,
            phone,
            department,
            bio,
            photoUrl,

            // Company Info
            companyId, // If joining existing company
            companyName,
            companySlug,
            companyLogo,
            tagline,
            description,
            industry,
            companySize,
            foundedYear,

            // Company Contact
            companyEmail,
            companyPhone,
            website,

            // Company Address
            address,
            city,
            province,
            postalCode,

            // Social Media
            linkedinUrl,
            facebookUrl,
            twitterUrl,
            instagramUrl,

            // Additional
            culture,
            benefits
        } = body

        // Check if recruiter profile already exists
        let recruiter = await prisma.recruiters.findUnique({
            where: { userId: user.id },
            include: { companies: true }
        })

        let company

        if (recruiter) {
            // ===== UPDATE EXISTING RECRUITER =====
            
            // Check if company is already verified - block edits
            const existingCompany = await prisma.companies.findUnique({
                where: { id: recruiter.companyId },
                select: { verified: true, status: true }
            })
            
            if (existingCompany?.verified === true) {
                return NextResponse.json(
                    { error: 'Perusahaan sudah terverifikasi. Hubungi admin untuk mengubah data.' },
                    { status: 403 }
                )
            }

            // If companyId provided and different, update company association
            if (companyId && companyId !== recruiter.companyId) {
                company = await prisma.companies.findUnique({
                    where: { id: companyId }
                })

                if (!company) {
                    return NextResponse.json(
                        { error: 'Company not found' },
                        { status: 404 }
                    )
                }
            } else {
                // Update existing company
                // First, get current company to check status
                const currentCompany = await prisma.companies.findUnique({
                    where: { id: recruiter.companyId },
                    select: { status: true }
                })

                // If company was REJECTED, change to PENDING_RESUBMISSION for re-review
                const newStatus = currentCompany?.status === 'REJECTED' 
                    ? 'PENDING_RESUBMISSION' 
                    : currentCompany?.status

                company = await prisma.companies.update({
                    where: { id: recruiter.companyId },
                    data: {
                        name: companyName,
                        slug: companySlug,
                        logo: companyLogo,
                        tagline,
                        description,
                        bio, // Company bio/profile
                        industry,
                        companySize,
                        foundedYear: foundedYear ? parseInt(foundedYear) : null,
                        email: companyEmail,
                        phone: companyPhone,
                        website,
                        address,
                        city,
                        province,
                        postalCode,
                        linkedinUrl,
                        facebookUrl,
                        twitterUrl,
                        instagramUrl,
                        culture,
                        benefits: benefits || [],
                        // Update status if it was REJECTED
                        status: newStatus,
                        // Clear rejection reason when resubmitting
                        rejectionReason: currentCompany?.status === 'REJECTED' ? null : undefined,
                        updatedAt: new Date()
                    }
                })
            }

            // Check if profile is complete for auto-verification
            const isProfileComplete = firstName && lastName && phone && position
            
            // Update recruiter
            recruiter = await prisma.recruiters.update({
                where: { id: recruiter.id },
                data: {
                    firstName,
                    lastName,
                    position,
                    phone,
                    department,
                    photoUrl,
                    companyId: companyId || recruiter.companyId,
                    isVerified: false, // Will be verified by admin
                    updatedAt: new Date()
                },
                include: { companies: true }
            })

        } else {
            // ===== CREATE NEW RECRUITER PROFILE =====

            // Handle company - join existing or create new
            if (companyId) {
                // Join existing company
                company = await prisma.companies.findUnique({
                    where: { id: companyId }
                })

                if (!company) {
                    return NextResponse.json(
                        { error: 'Company not found' },
                        { status: 404 }
                    )
                }
            } else {
                // Create new company
                company = await prisma.companies.create({
                    data: {
                        id: `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        name: companyName,
                        slug: companySlug,
                        logo: companyLogo,
                        tagline,
                        description,
                        bio, // Company bio/profile
                        industry,
                        companySize,
                        foundedYear: foundedYear ? parseInt(foundedYear) : null,
                        email: companyEmail,
                        phone: companyPhone,
                        website,
                        address,
                        city,
                        province,
                        postalCode,
                        linkedinUrl,
                        facebookUrl,
                        twitterUrl,
                        instagramUrl,
                        culture,
                        benefits: benefits || [],
                        status: 'PENDING_VERIFICATION',
                        verified: false,
                        updatedAt: new Date()
                    }
                })
            }

            // Check if profile is complete for auto-verification
            const isProfileComplete = firstName && lastName && phone && position
            
            // Create recruiter profile
            recruiter = await prisma.recruiters.create({
                data: {
                    id: `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    userId: user.id,
                    companyId: company.id,
                    firstName,
                    lastName,
                    position,
                    phone,
                    department,
                    photoUrl,
                    isVerified: false, // Will be verified by admin
                    updatedAt: new Date()
                },
                include: { companies: true }
            })
        }

        return NextResponse.json({
            success: true,
            message: recruiter ? 'Profile updated successfully' : 'Profile created successfully',
            profile: recruiter
        })

    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to save profile' },
            { status: 500 }
        )
    }
}