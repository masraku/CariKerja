import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get all published news (public)
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url)
        const search = searchParams.get('search') || ''
        const category = searchParams.get('category') || 'all'
        const page = parseInt(searchParams.get('page')) || 1
        const limit = parseInt(searchParams.get('limit')) || 10

        // Build where clause - only published news
        let where = {
            status: 'PUBLISHED'
        }

        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { content: { contains: search, mode: 'insensitive' } },
                { excerpt: { contains: search, mode: 'insensitive' } }
            ]
        }

        if (category !== 'all') {
            where.category = category
        }

        // Get total count
        const total = await prisma.news.count({ where })

        // Get news with pagination
        const news = await prisma.news.findMany({
            where,
            orderBy: { publishedAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
            select: {
                id: true,
                title: true,
                slug: true,
                excerpt: true,
                image: true,
                category: true,
                author: true,
                publishedAt: true,
                viewCount: true
            }
        })

        // Get featured news (most recent published)
        const featuredNews = await prisma.news.findFirst({
            where: { status: 'PUBLISHED' },
            orderBy: { publishedAt: 'desc' }
        })

        // Get unique categories
        const categories = await prisma.news.findMany({
            where: { status: 'PUBLISHED' },
            select: { category: true },
            distinct: ['category']
        })

        return NextResponse.json({
            success: true,
            news,
            featuredNews,
            categories: categories.map(c => c.category),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        })

    } catch (error) {
        console.error('Error fetching news:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
