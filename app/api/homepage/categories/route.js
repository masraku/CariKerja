import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { publicLimiter, getIP, rateLimitResponse } from '@/lib/rateLimit'
import { publicActiveJobWhere } from '@/lib/jobs/publicFilters'

// Category icons mapping
const categoryIcons = {
    'IT': '💻',
    'Technology': '💻',
    'Finance': '💰',
    'Marketing': '📊',
    'Sales': '💼',
    'Design': '🎨',
    'HR': '👥',
    'Engineering': '⚙️',
    'Healthcare': '🏥',
    'Education': '📚',
    'Customer Service': '🎧',
    'Operations': '📦',
    'Legal': '⚖️',
    'Manufacturing': '🏭',
    'Retail': '🏬',
    'Hospitality': '🏨',
    'Construction': '🏗️',
    'Transportation': '🚚',
    'Media': '📰',
    'Other': '📋'
}

export async function GET(request) {
    try {
        // Rate limiting - 100 requests per minute
        const ip = getIP(request)
        const { success, reset } = await publicLimiter.limit(ip)
        if (!success) {
            return rateLimitResponse(reset)
        }

        // Get all currently open public jobs grouped by category
        const grouped = await prisma.jobs.groupBy({
            by: ['category'],
            where: publicActiveJobWhere(new Date()),
            _count: { _all: true }
        })

        // Count jobs per category
        const categoryCounts = {}
        grouped.forEach(row => {
            const category = row.category || 'Other'
            categoryCounts[category] = (categoryCounts[category] || 0) + row._count._all
        })

        // Transform to array and sort by count
        const categories = Object.entries(categoryCounts)
            .map(([name, count]) => ({
                name,
                count,
                icon: categoryIcons[name] || categoryIcons['Other']
            }))
            .sort((a, b) => b.count - a.count)

        return NextResponse.json({
            success: true,
            data: {
                categories
            }
        })

    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch job categories' },
            { status: 500 }
        )
    }
}
