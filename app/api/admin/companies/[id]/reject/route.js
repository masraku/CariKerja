import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/authHelper'

export async function PATCH(request, context) {
    try {
        const params = await context.params
        const { id } = params

        // Authenticate admin
        const auth = await requireAdmin(request)
        
        if (auth.error) {
            return NextResponse.json(
                { error: auth.error },
                { status: auth.status }
            )
        }

        const { admin } = auth
        const body = await request.json()
        const { reason } = body

        if (!reason) {
            return NextResponse.json(
                { error: 'Rejection reason is required' },
                { status: 400 }
            )
        }

        // Get company
        const company = await prisma.companies.findUnique({
            where: { id }
        })

        if (!company) {
            return NextResponse.json(
                { error: 'Company not found' },
                { status: 404 }
            )
        }

        // Update company - mark as rejected
        const updatedCompany = await prisma.companies.update({
            where: { id },
            data: {
                verified: false,
                verifiedAt: null,
                verifiedBy: null,
                rejectedAt: new Date(),
                rejectionReason: reason,
                status: 'SUSPENDED'
            }
        })

        // Log admin action
        await prisma.auditLog.create({
            data: {
                userId: admin.id,
                action: 'REJECT_COMPANY',
                targetType: 'COMPANY',
                targetId: id,
                changes: {
                    companyName: company.name,
                    reason
                }
            }
        })

        // TODO: Send rejection email to recruiter
        console.log(`❌ Company ${company.name} rejected by admin ${admin.email}`)

        return NextResponse.json({
            success: true,
            message: 'Company rejected',
            data: {
                company: updatedCompany
            }
        })

    } catch (error) {
        console.error('❌ Reject company error:', error)
        return NextResponse.json(
            { error: 'Failed to reject company' },
            { status: 500 }
        )
    }
}
