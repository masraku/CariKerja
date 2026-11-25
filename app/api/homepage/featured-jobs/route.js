import { NextResponse } from 'next/server'
import { publicLimiter, getIP, rateLimitResponse } from '@/lib/rateLimit'
import { getFeaturedJobs, clampLimit } from '@/lib/homepage'

export async function GET(request) {
    try {
        // Rate limiting - 100 requests per minute
        const ip = getIP(request)
        const { success, reset } = await publicLimiter.limit(ip)
        if (!success) {
            return rateLimitResponse(reset)
        }

        const { searchParams } = new URL(request.url)
        const limit = clampLimit(searchParams.get('limit'), 6)
        const featuredJobs = await getFeaturedJobs(limit)

        return NextResponse.json({
            success: true,
            data: {
                jobs: featuredJobs
            }
        }, {
            headers: {
                'Cache-Control': 'no-store, max-age=0'
            }
        })

    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch featured jobs' },
            { status: 500 }
        )
    }
}
