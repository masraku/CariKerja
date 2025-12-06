import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireJobseeker } from '@/lib/authHelper'

// PUT: Update jobseeker employment status
export async function PUT(request) {
    try {
        const auth = await requireJobseeker(request)
        
        if (auth.error) {
            return NextResponse.json({ error: auth.error }, { status: auth.status })
        }

        const body = await request.json()
        const { isEmployed, isLookingForJob, employedCompany } = body

        // Get current jobseeker
        const jobseeker = await prisma.jobseekers.findUnique({
            where: { userId: auth.user.id }
        })

        if (!jobseeker) {
            return NextResponse.json({ error: 'Jobseeker profile not found' }, { status: 404 })
        }

        // Prepare update data
        const updateData = {}

        if (typeof isEmployed === 'boolean') {
            updateData.isEmployed = isEmployed
            if (isEmployed) {
                updateData.employedAt = new Date()
                if (employedCompany) {
                    updateData.employedCompany = employedCompany
                }
            } else {
                updateData.employedAt = null
                updateData.employedCompany = null
            }
        }

        if (typeof isLookingForJob === 'boolean') {
            updateData.isLookingForJob = isLookingForJob
        }

        // Update jobseeker
        const updatedJobseeker = await prisma.jobseekers.update({
            where: { id: jobseeker.id },
            data: updateData,
            select: {
                id: true,
                isEmployed: true,
                isLookingForJob: true,
                employedAt: true,
                employedCompany: true
            }
        })

        return NextResponse.json({
            success: true,
            message: 'Status berhasil diupdate',
            data: updatedJobseeker
        })

    } catch (error) {
        console.error('❌ Update jobseeker status error:', error)
        return NextResponse.json(
            { error: 'Failed to update status' },
            { status: 500 }
        )
    }
}

// GET: Get current jobseeker status
export async function GET(request) {
    try {
        const auth = await requireJobseeker(request)
        
        if (auth.error) {
            return NextResponse.json({ error: auth.error }, { status: auth.status })
        }

        const jobseeker = await prisma.jobseekers.findUnique({
            where: { userId: auth.user.id },
            select: {
                id: true,
                isEmployed: true,
                isLookingForJob: true,
                employedAt: true,
                employedCompany: true
            }
        })

        if (!jobseeker) {
            return NextResponse.json({ error: 'Jobseeker profile not found' }, { status: 404 })
        }

        return NextResponse.json({
            success: true,
            data: jobseeker
        })

    } catch (error) {
        console.error('❌ Get jobseeker status error:', error)
        return NextResponse.json(
            { error: 'Failed to get status' },
            { status: 500 }
        )
    }
}
