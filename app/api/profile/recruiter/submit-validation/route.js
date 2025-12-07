import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/authHelper'

export async function POST(request) {
    try {
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

        // Get recruiter with company
        const recruiter = await prisma.recruiters.findUnique({
            where: { userId: user.id },
            include: { companies: true }
        })

        if (!recruiter) {
            return NextResponse.json(
                { error: 'Recruiter profile not found' },
                { status: 404 }
            )
        }

        if (!recruiter.companyId) {
            return NextResponse.json(
                { error: 'No company associated with this recruiter' },
                { status: 400 }
            )
        }

        const company = recruiter.companies

        // Only reject if company is already verified
        if (company.verified) {
            return NextResponse.json(
                { error: 'Company is already verified' },
                { status: 400 }
            )
        }

        // Allow resubmission even if already pending (just refresh the timestamp)
        // Update company status to PENDING_RESUBMISSION
        await prisma.companies.update({
            where: { id: company.id },
            data: {
                status: 'PENDING_RESUBMISSION',
                rejectionReason: null, // Clear previous rejection reason
                updatedAt: new Date()
            }
        })

        return NextResponse.json({
            success: true,
            message: 'Company submitted for validation'
        })

    } catch (error) {
        console.error('Submit validation error:', error)
        return NextResponse.json(
            { error: 'Failed to submit for validation' },
            { status: 500 }
        )
    }
}
