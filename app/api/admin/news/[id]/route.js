import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'
import { validateBody } from '@/lib/validations'
import { updateNewsSchema } from '@/lib/validations/admin'

// Helper to generate slug
function generateSlug(title) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
}

// GET - Get single news by ID
export async function GET(request, { params }) {
    try {
        const token = getTokenFromRequest(request)
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const decoded = verifyToken(token)
        
        if (!decoded || decoded.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params

        const news = await prisma.news.findUnique({
            where: { id }
        })

        if (!news) {
            return NextResponse.json({ error: 'News not found' }, { status: 404 })
        }

        return NextResponse.json({
            success: true,
            news
        })

    } catch (error) {
        console.error('Error fetching news:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// PUT - Update news
export async function PUT(request, { params }) {
    try {
        const token = getTokenFromRequest(request)
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const decoded = verifyToken(token)
        
        if (!decoded || decoded.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params
        
        const validation = await validateBody(request, updateNewsSchema)
        if (!validation.success) {
            return validation.response
        }
        const { title, excerpt, content, image, category, author, status } = validation.data

        // Check if news exists
        const existingNews = await prisma.news.findUnique({
            where: { id }
        })

        if (!existingNews) {
            return NextResponse.json({ error: 'News not found' }, { status: 404 })
        }

        // Prepare update data
        const updateData = {}
        
        if (title && title !== existingNews.title) {
            updateData.title = title
            // Generate new slug if title changed
            let baseSlug = generateSlug(title)
            let slug = baseSlug
            let counter = 1
            while (await prisma.news.findFirst({ 
                where: { slug, id: { not: id } } 
            })) {
                slug = `${baseSlug}-${counter}`
                counter++
            }
            updateData.slug = slug
        }
        
        if (excerpt !== undefined) updateData.excerpt = excerpt
        if (content) updateData.content = content
        if (image !== undefined) updateData.image = image
        if (category) updateData.category = category
        if (author) updateData.author = author
        if (status) {
            updateData.status = status
            // Set publishedAt when publishing
            if (status === 'PUBLISHED' && existingNews.status !== 'PUBLISHED') {
                updateData.publishedAt = new Date()
            }
        }

        const news = await prisma.news.update({
            where: { id },
            data: updateData
        })

        return NextResponse.json({
            success: true,
            message: 'News updated successfully',
            news
        })

    } catch (error) {
        console.error('Error updating news:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// DELETE - Delete news
export async function DELETE(request, { params }) {
    try {
        const token = getTokenFromRequest(request)
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const decoded = verifyToken(token)
        
        if (!decoded || decoded.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params

        // Check if news exists
        const existingNews = await prisma.news.findUnique({
            where: { id }
        })

        if (!existingNews) {
            return NextResponse.json({ error: 'News not found' }, { status: 404 })
        }

        await prisma.news.delete({
            where: { id }
        })

        return NextResponse.json({
            success: true,
            message: 'News deleted successfully'
        })

    } catch (error) {
        console.error('Error deleting news:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
