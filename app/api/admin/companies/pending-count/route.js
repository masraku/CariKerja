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

        // Count companies with PENDING_VERIFICATION or PENDING_RESUBMISSION status
        const count = await prisma.companies.count({
            where: {
                status: {
                    in: ['PENDING_VERIFICATION', 'PENDING_RESUBMISSION']
                }
            }
        })

        return NextResponse.json({ count })

    } catch (error) {
        console.error('Error fetching pending companies count:', error)
        return NextResponse.json(
            { error: 'Failed to fetch count' },
            { status: 500 }
        )
    }
}
