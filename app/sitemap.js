import { prisma } from '@/lib/prisma'

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kerjasimpel.vercel.app'

export default async function sitemap() {
    // Static pages
    const staticPages = [
        {
            url: siteUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${siteUrl}/jobs`,
            lastModified: new Date(),
            changeFrequency: 'hourly',
            priority: 0.9,
        },
        {
            url: `${siteUrl}/companies`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
        },
        {
            url: `${siteUrl}/news`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
        },
        {
            url: `${siteUrl}/about`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.6,
        },
        {
            url: `${siteUrl}/privacy`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.4,
        },
        {
            url: `${siteUrl}/warning`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.4,
        },
    ]

    // Dynamic job pages
    let jobPages = []
    try {
        const jobs = await prisma.jobs.findMany({
            where: { 
                status: 'ACTIVE',
                isActive: true 
            },
            select: { 
                slug: true, 
                updatedAt: true 
            },
            orderBy: { publishedAt: 'desc' },
            take: 1000, // Limit to prevent too large sitemap
        })

        jobPages = jobs.map((job) => ({
            url: `${siteUrl}/jobs/${job.slug}`,
            lastModified: job.updatedAt,
            changeFrequency: 'weekly',
            priority: 0.7,
        }))
    } catch (error) {
        console.error('Failed to fetch jobs for sitemap:', error)
    }

    // Dynamic company pages
    let companyPages = []
    try {
        const companies = await prisma.companies.findMany({
            where: { 
                status: 'VERIFIED' 
            },
            select: { 
                slug: true, 
                updatedAt: true 
            },
            orderBy: { createdAt: 'desc' },
            take: 500,
        })

        companyPages = companies.map((company) => ({
            url: `${siteUrl}/companies/${company.slug}`,
            lastModified: company.updatedAt,
            changeFrequency: 'weekly',
            priority: 0.6,
        }))
    } catch (error) {
        console.error('Failed to fetch companies for sitemap:', error)
    }

    // Dynamic news pages
    let newsPages = []
    try {
        const news = await prisma.news.findMany({
            where: {
                status: 'PUBLISHED',
                publishedAt: { not: null }
            },
            select: {
                slug: true,
                updatedAt: true
            },
            orderBy: { publishedAt: 'desc' },
            take: 1000,
        })

        newsPages = news.map((item) => ({
            url: `${siteUrl}/news/${item.slug}`,
            lastModified: item.updatedAt,
            changeFrequency: 'weekly',
            priority: 0.6,
        }))
    } catch (error) {
        console.error('Failed to fetch news for sitemap:', error)
    }

    return [...staticPages, ...jobPages, ...companyPages, ...newsPages]
}
