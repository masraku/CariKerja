import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/authHelper'
import { validateCSRFToken, csrfErrorResponse } from '@/lib/csrf'
import { validateBody } from '@/lib/validations'
import { verifyCompanySchema } from '@/lib/validations/admin'
import { createAuditLog, AuditAction } from '@/lib/audit'

export async function PATCH(request, context) {
    try {
        // CSRF validation
        if (!validateCSRFToken(request)) {
            return csrfErrorResponse()
        }

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
        
        const validation = await validateBody(request, verifyCompanySchema)
        if (!validation.success) {
            return validation.response
        }
        const { notes } = validation.data

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
        // Only use fields that exist in the schema
        const updatedCompany = await prisma.companies.update({
            where: { id },
            data: {
                verified: true,
                verifiedAt: new Date(),
                status: 'VERIFIED',
                rejectionReason: null,
                updatedAt: new Date()
            }
        })

        // Audit log
        await createAuditLog({
            action: AuditAction.VERIFY_COMPANY,
            userId: admin.id,
            userRole: 'ADMIN',
            targetType: 'company',
            targetId: id,
            changes: { companyName: company.name, notes },
            request
        })

        return NextResponse.json({
            success: true,
            message: 'Company verified successfully',
            data: {
                company: updatedCompany
            }
        })

    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to verify company' },
            { status: 500 }
        )
    }
}
