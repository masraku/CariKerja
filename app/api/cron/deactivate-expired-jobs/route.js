import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorizeCronRequest } from '@/lib/cron'

// Auto-deactivate jobs that have passed their application deadline
// This can be called by a cron job or triggered periodically

export async function POST(request) {
    try {
        const unauthorized = authorizeCronRequest(request)
        if (unauthorized) return unauthorized

        const now = new Date()
        
        // Find and update all active jobs where deadline has passed
        const result = await prisma.jobs.updateMany({
            where: {
                isActive: true,
                applicationDeadline: {
                    lt: now, // deadline is less than (before) current time
                    not: null
                }
            },
            data: {
                isActive: false,
                status: 'CLOSED',
                closedAt: now
            }
        })

        return NextResponse.json({
            success: true,
            message: `Deactivated ${result.count} expired jobs`,
            count: result.count,
            timestamp: now.toISOString()
        })

    } catch (error) {
        console.error('Deactivate expired jobs error:', error)
        return NextResponse.json({
            success: false,
            error: 'Gagal menonaktifkan lowongan kadaluarsa'
        }, { status: 500 })
    }
}

// Also support GET for Vercel Cron.
export async function GET(request) {
    return POST(request)
}
