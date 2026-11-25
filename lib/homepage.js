// Query data homepage, dipakai bersama oleh API route /api/homepage/* dan
// oleh app/page.jsx (server) agar data sudah ada di HTML pertama.
import { prisma } from '@/lib/prisma'
import { publicActiveJobWhere, openApplicationDeadlineWhere } from '@/lib/jobs/publicFilters'

export function clampLimit(value, fallback, max = 24) {
    const parsed = parseInt(value ?? '', 10)
    if (!Number.isFinite(parsed)) return fallback
    return Math.min(Math.max(parsed, 1), max)
}

export async function getHomepageStats() {
    const [totalJobs, totalCompanies, totalApplications, totalHires] = await Promise.all([
        prisma.jobs.count({ where: publicActiveJobWhere(new Date()) }),
        // Perusahaan yang sudah diverifikasi admin
        prisma.companies.count({ where: { verified: true, status: 'VERIFIED' } }),
        prisma.applications.count(),
        prisma.applications.count({ where: { status: 'ACCEPTED' } }),
    ])

    return { totalJobs, totalCompanies, totalApplications, totalHires }
}

export async function getFeaturedJobs(limit = 6) {
    const jobs = await prisma.jobs.findMany({
        where: publicActiveJobWhere(new Date()),
        take: limit,
        orderBy: { publishedAt: 'desc' },
        select: {
            id: true,
            title: true,
            slug: true,
            location: true,
            jobType: true,
            salaryMin: true,
            salaryMax: true,
            category: true,
            createdAt: true,
            applicationDeadline: true,
            companies: {
                select: { name: true, logo: true, city: true, industry: true },
            },
            _count: { select: { applications: true } },
        },
    })

    return jobs.map(job => ({
        id: job.id,
        title: job.title,
        slug: job.slug,
        companies: job.companies ? {
            name: job.companies.name,
            logo: job.companies.logo,
            city: job.companies.city,
            industry: job.companies.industry,
        } : null,
        location: job.location || job.companies?.city || '',
        jobType: job.jobType,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        salaryCurrency: 'IDR',
        postedAt: job.createdAt,
        applicationDeadline: job.applicationDeadline,
        applicationCount: job._count.applications,
        applicants: job._count.applications,
        category: job.category,
    }))
}

export async function getTopCompanies(limit = 8) {
    const openDeadlineWhere = openApplicationDeadlineWhere(new Date())

    // Perusahaan terverifikasi, diurutkan berdasarkan jumlah lowongan
    const companies = await prisma.companies.findMany({
        where: { verified: true, status: 'VERIFIED' },
        take: limit,
        include: {
            jobs: {
                where: {
                    status: 'ACTIVE',
                    isActive: true,
                    publishedAt: { not: null },
                    ...openDeadlineWhere,
                },
                take: 3,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    location: true,
                    jobType: true,
                    applicationDeadline: true,
                    _count: { select: { applications: true } },
                },
            },
        },
        orderBy: { jobs: { _count: 'desc' } },
    })

    return companies.map(company => ({
        id: company.id,
        name: company.name,
        slug: company.slug,
        logo: company.logo,
        description: company.description,
        city: company.city,
        province: company.province,
        industry: company.industry,
        totalJobsCount: company.jobs.length,
        latestJobs: company.jobs,
    }))
}
