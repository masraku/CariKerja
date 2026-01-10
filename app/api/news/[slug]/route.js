import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get single news by slug (public)
export async function GET(request, { params }) {
    try {
        const { slug } = await params

        const news = await prisma.news.findUnique({
            where: { slug }
        })

        if (!news || news.status !== 'PUBLISHED') {
            return NextResponse.json({ error: 'News not found' }, { status: 404 })
        }

        // Increment view count
        await prisma.news.update({
            where: { id: news.id },
            data: { viewCount: { increment: 1 } }
        })

        // Get related news (same category, exclude current)
        const relatedNews = await prisma.news.findMany({
            where: {
                status: 'PUBLISHED',
                category: news.category,
                id: { not: news.id }
            },
            orderBy: { publishedAt: 'desc' },
            take: 3,
            select: {
                id: true,
                title: true,
                slug: true,
                excerpt: true,
                image: true,
                category: true,
                author: true,
                publishedAt: true
            }
        })

        return NextResponse.json({
            success: true,
            news,
            relatedNews
        })

    } catch (error) {
        console.error('Error fetching news:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
