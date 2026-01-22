import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { publicLimiter, getIP, rateLimitResponse } from '@/lib/rateLimit'

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

        // Get all active jobs grouped by category
        const jobs = await prisma.jobs.findMany({
            where: {
                isActive: true
            },
            select: {
                category: true
            }
        })

        // Count jobs per category
        const categoryCounts = {}
        jobs.forEach(job => {
            const category = job.category || 'Other'
            categoryCounts[category] = (categoryCounts[category] || 0) + 1
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
