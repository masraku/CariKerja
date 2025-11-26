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
        const { notes } = body

        // Get company
        const company = await prisma.companies.findUnique({
            where: { id },
            include: {
                recruiters: {
                    include: {
                        users: {
                            select: {
                                email: true
                            }
                        }
                    }
                }
            }
        })

        if (!company) {
            return NextResponse.json(
                { error: 'Company not found' },
                { status: 404 }
            )
        }

        // Update company verification
        const updatedCompany = await prisma.companies.update({
            where: { id },
            data: {
                verified: true,
                verifiedAt: new Date(),
                status: 'VERIFIED',
                rejectionReason: null
            }
        })

        // Log admin action
        await prisma.audit_logs.create({
            data: {
                userId: admin.id,
                action: 'VERIFY_COMPANY',
                targetType: 'COMPANY',
                targetId: id,
                changes: {
                    companyName: company.name,
                    notes: notes || null
                }
            }
        })

        // TODO: Send email notification to recruiter
        console.log(`✅ Company ${company.name} verified by admin ${admin.email}`)

        return NextResponse.json({
            success: true,
            message: 'Company verified successfully',
            data: {
                company: updatedCompany
            }
        })

    } catch (error) {
        console.error('❌ Verify company error:', error)
        return NextResponse.json(
            { error: 'Failed to verify company' },
            { status: 500 }
        )
    }
}
