import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// Helper to generate slug
function generateSlug(title) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
}

// GET - Get all news (admin)
export async function GET(request) {
    try {
        // Verify admin
        const authHeader = request.headers.get('authorization')
        if (!authHeader) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const token = authHeader.replace('Bearer ', '')
        const decoded = verifyToken(token)
        
        if (!decoded || decoded.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get query params
        const { searchParams } = new URL(request.url)
        const search = searchParams.get('search') || ''
        const status = searchParams.get('status') || 'all'
        const category = searchParams.get('category') || 'all'
        const sort = searchParams.get('sort') || 'newest'

        // Build where clause
        let where = {}

        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { content: { contains: search, mode: 'insensitive' } },
                { author: { contains: search, mode: 'insensitive' } }
            ]
        }

        if (status !== 'all') {
            where.status = status.toUpperCase()
        }

        if (category !== 'all') {
            where.category = category
        }

        // Determine sort order
        let orderBy = {}
        switch (sort) {
            case 'oldest':
                orderBy = { createdAt: 'asc' }
                break
            case 'most_viewed':
                orderBy = { viewCount: 'desc' }
                break
            case 'title_asc':
                orderBy = { title: 'asc' }
                break
            case 'newest':
            default:
                orderBy = { createdAt: 'desc' }
        }

        // Get news
        const news = await prisma.news.findMany({
            where,
            orderBy
        })

        // Get stats
        const [total, published, draft, archived] = await Promise.all([
            prisma.news.count(),
            prisma.news.count({ where: { status: 'PUBLISHED' } }),
            prisma.news.count({ where: { status: 'DRAFT' } }),
            prisma.news.count({ where: { status: 'ARCHIVED' } })
        ])

        // Get unique categories
        const categories = await prisma.news.findMany({
            select: { category: true },
            distinct: ['category']
        })

        return NextResponse.json({
            success: true,
            news,
            stats: {
                total,
                published,
                draft,
                archived
            },
            categories: categories.map(c => c.category)
        })

    } catch (error) {
        console.error('Error fetching news:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// POST - Create news
export async function POST(request) {
    try {
        // Verify admin
        const authHeader = request.headers.get('authorization')
        if (!authHeader) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const token = authHeader.replace('Bearer ', '')
        const decoded = verifyToken(token)
        
        if (!decoded || decoded.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { title, excerpt, content, image, category, author, status } = body

        // Validate required fields
        if (!title || !content || !category || !author) {
            return NextResponse.json({ 
                error: 'Title, content, category, and author are required' 
            }, { status: 400 })
        }

        // Generate unique slug
        let baseSlug = generateSlug(title)
        let slug = baseSlug
        let counter = 1

        // Check if slug exists and make it unique
        while (await prisma.news.findUnique({ where: { slug } })) {
            slug = `${baseSlug}-${counter}`
            counter++
        }

        // Create news
        const news = await prisma.news.create({
            data: {
                title,
                slug,
                excerpt: excerpt || null,
                content,
                image: image || null,
                category,
                author,
                status: status || 'DRAFT',
                publishedAt: status === 'PUBLISHED' ? new Date() : null
            }
        })

        return NextResponse.json({
            success: true,
            message: 'News created successfully',
            news
        }, { status: 201 })

    } catch (error) {
        console.error('Error creating news:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
