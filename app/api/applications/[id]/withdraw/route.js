import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export async function PATCH(request, context) {
    try {
        const params = await context.params
        const { id: applicationId } = params

        // Verify authentication
        const cookieStore = await cookies()
        const token = cookieStore.get('token')

        if (!token) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        let decoded
        try {
            decoded = jwt.verify(token.value, JWT_SECRET)
        } catch (jwtError) {
            return NextResponse.json(
                { error: 'Invalid token' },
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
                { error: 'Unauthorized - Jobseeker only' },
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
        console.error('Withdraw application error:', error)
        return NextResponse.json(
            { error: 'Gagal menarik lamaran', details: error.message },
            { status: 500 }
        )
    }
}
