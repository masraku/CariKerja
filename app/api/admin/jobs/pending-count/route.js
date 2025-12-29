import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/authHelper'

export async function GET(request) {
    try {
        const auth = await requireAdmin(request)
        
        if (auth.error) {
            return NextResponse.json(
                { error: auth.error },
                { status: auth.status }
            )
        }

        // Count jobs with PENDING status
        const count = await prisma.jobs.count({
            where: {
                status: 'PENDING'
            }
        })

        return NextResponse.json({ count })

    } catch (error) {
        console.error('Error fetching pending jobs count:', error)
        return NextResponse.json(
            { error: 'Failed to fetch count' },
            { status: 500 }
        )
    }
}
