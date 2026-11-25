import { NextResponse } from 'next/server'
import { publicLimiter, getIP, rateLimitResponse } from '@/lib/rateLimit'
import { getTopCompanies, clampLimit } from '@/lib/homepage'

export async function GET(request) {
    try {
        // Rate limiting - 100 requests per minute
        const ip = getIP(request)
        const { success, reset } = await publicLimiter.limit(ip)
        if (!success) {
            return rateLimitResponse(reset)
        }

        const { searchParams } = new URL(request.url)
        const limit = clampLimit(searchParams.get('limit'), 8)
        const topCompanies = await getTopCompanies(limit)

        return NextResponse.json({
            success: true,
            data: {
                companies: topCompanies
            }
        })

    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch top companies' },
            { status: 500 }
        )
    }
}
