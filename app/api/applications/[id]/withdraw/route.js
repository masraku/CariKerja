import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createErrorResponse } from '@/lib/errorHandler'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { validateCSRFToken, csrfErrorResponse } from '@/lib/csrf'

export async function PATCH(request, context) {
    try {
        // CSRF validation
        if (!validateCSRFToken(request)) {
            return csrfErrorResponse()
        }

        const params = await context.params
        const { id: applicationId } = params

        // Verify authentication
        const cookieStore = await cookies()
        const token = cookieStore.get('token')

        if (!token) {
            return NextResponse.json(
                { error: 'Tidak memiliki akses' },
                { status: 401 }
            )
        }

        const decoded = verifyToken(token.value)
        if (!decoded) {
            return NextResponse.json(
                { error: 'Token tidak valid' },
                { status: 401 }
            )
        }

        const userId = decoded.userId

        // Get user and jobseeker
        const user = await prisma.users.findUnique({
            where: { id: userId },
            include: { jobseekers: true }
        })

        if (!user || user.role !== 'JOBSEEKER' || !user.jobseekers) {
            return NextResponse.json(
                { error: 'Tidak memiliki akses - Hanya untuk Pencari Kerja' },
                { status: 403 }
            )
        }

        // Get application
        const application = await prisma.applications.findFirst({
            where: {
                id: applicationId,
                jobseekerId: user.jobseekers.id
            }
        })

        if (!application) {
            return NextResponse.json(
                { error: 'Lamaran tidak ditemukan' },
                { status: 404 }
            )
        }

        // Check if can be withdrawn (only PENDING or REVIEWING)
        if (!['PENDING', 'REVIEWING'].includes(application.status)) {
            return NextResponse.json(
                { error: 'Lamaran sudah tidak bisa ditarik' },
                { status: 400 }
            )
        }

        // Update application status to WITHDRAWN
        const updatedApplication = await prisma.applications.update({
            where: { id: applicationId },
            data: {
                status: 'WITHDRAWN',
                updatedAt: new Date()
            }
        })

        return NextResponse.json({
            success: true,
            message: 'Lamaran berhasil ditarik',
            application: updatedApplication
        })

    } catch (error) {
        return NextResponse.json(
            createErrorResponse('Gagal menarik lamaran', error),
            { status: 500 }
        )
    }
}
