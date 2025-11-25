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
        const recruiter = await prisma.recruiter.findUnique({
            where: { userId: user.id },
            include: { company: true }
        })

        // ✅ Return null profile if not found (not an error)
        return NextResponse.json({
            success: true,
            profile: recruiter // Can be null
        })

    } catch (error) {
        console.error('Get recruiter profile error:', error)
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
        let recruiter = await prisma.recruiter.findUnique({
            where: { userId: user.id },
            include: { company: true }
        })

        let company

        if (recruiter) {
            // ===== UPDATE EXISTING RECRUITER =====

            // If companyId provided and different, update company association
            if (companyId && companyId !== recruiter.companyId) {
                company = await prisma.company.findUnique({
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
                company = await prisma.company.update({
                    where: { id: recruiter.companyId },
                    data: {
                        name: companyName,
                        slug: companySlug,
                        logo: companyLogo,
                        tagline,
                        description,
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
                        benefits: benefits || []
                    }
                })
            }

            // Check if profile is complete for auto-verification
            const isProfileComplete = firstName && lastName && phone && position
            
            // Update recruiter
            recruiter = await prisma.recruiter.update({
                where: { id: recruiter.id },
                data: {
                    firstName,
                    lastName,
                    position,
                    phone,
                    department,
                    companyId: companyId || recruiter.companyId,
                    isVerified: isProfileComplete // Auto-verify if all basic info is complete
                },
                include: { company: true }
            })

        } else {
            // ===== CREATE NEW RECRUITER PROFILE =====

            // Handle company - join existing or create new
            if (companyId) {
                // Join existing company
                company = await prisma.company.findUnique({
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
                company = await prisma.company.create({
                    data: {
                        name: companyName,
                        slug: companySlug,
                        logo: companyLogo,
                        slug,
                        tagline,
                        description,
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
                        verified: false
                    }
                })
            }

            // Check if profile is complete for auto-verification
            const isProfileComplete = firstName && lastName && phone && position
            
            // Create recruiter profile
            recruiter = await prisma.recruiter.create({
                data: {
                    userId: user.id,
                    companyId: company.id,
                    firstName,
                    lastName,
                    position,
                    phone,
                    department,
                    isVerified: isProfileComplete // Auto-verify if all basic info is complete
                },
                include: { company: true }
            })
        }

        return NextResponse.json({
            success: true,
            message: recruiter ? 'Profile updated successfully' : 'Profile created successfully',
            profile: recruiter
        })

    } catch (error) {
        console.error('Save recruiter profile error:', error)
        return NextResponse.json(
            { error: 'Failed to save profile' },
            { status: 500 }
        )
    }
}