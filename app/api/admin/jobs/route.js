import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

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
        const jobType = searchParams.get('jobType') || 'all'
        const kecamatan = searchParams.get('kecamatan') || 'all'
        const scope = searchParams.get('scope') || 'all'
        const sort = searchParams.get('sort') || 'newest'

        // Build where clause
        let where = {}

        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { companies: { name: { contains: search, mode: 'insensitive' } } },
                { city: { contains: search, mode: 'insensitive' } },
                { location: { contains: search, mode: 'insensitive' } }
            ]
        }

        if (status === 'active') {
            where.status = 'ACTIVE'
        } else if (status === 'pending') {
            where.status = 'PENDING'
        } else if (status === 'rejected') {
            where.status = 'REJECTED'
        } else if (status === 'inactive' || status === 'closed') {
            where.status = 'CLOSED'
        }

        if (jobType !== 'all') {
            where.jobType = jobType
        }

        // Filter by kecamatan (search in location field)
        if (kecamatan !== 'all') {
            where.location = {
                contains: kecamatan,
                mode: 'insensitive'
            }
        }

        // Filter by scope (domestic / international)
        if (scope === 'domestic') {
            where.jobScope = 'DOMESTIC'
        } else if (scope === 'international') {
            where.jobScope = 'INTERNATIONAL'
        }

        // Determine sort order
        let orderBy = {}
        switch (sort) {
            case 'oldest':
                orderBy = { createdAt: 'asc' }
                break
            case 'deadline_asc':
                orderBy = { applicationDeadline: 'asc' }
                break
            case 'deadline_desc':
                orderBy = { applicationDeadline: 'desc' }
                break
            case 'newest':
            default:
                orderBy = { createdAt: 'desc' }
        }

        // Get jobs with related data
        const jobs = await prisma.jobs.findMany({
            where,
            include: {
                companies: {
                    select: {
                        name: true,
                        logo: true,
                        verified: true
                    }
                },
                recruiters: {
                    select: {
                        firstName: true,
                        lastName: true,
                        users: {
                            select: {
                                email: true
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        applications: true
                    }
                }
            },
            orderBy
        })

        // Get stats
        const totalJobs = await prisma.jobs.count()
        const activeJobs = await prisma.jobs.count({ where: { status: 'ACTIVE' } })
        const pendingJobs = await prisma.jobs.count({ where: { status: 'PENDING' } })
        const rejectedJobs = await prisma.jobs.count({ where: { status: 'REJECTED' } })
        const totalApplications = await prisma.applications.count()

        // JobType stats
        const fullTimeJobs = await prisma.jobs.count({ where: { jobType: 'FULL_TIME' } })
        const partTimeJobs = await prisma.jobs.count({ where: { jobType: 'PART_TIME' } })

        // Transform jobs data
        const transformedJobs = jobs.map(job => ({
            id: job.id,
            title: job.title,
            slug: job.slug,
            company: {
                name: job.companies?.name || 'Unknown',
                logo: job.companies?.logo,
                verified: job.companies?.verified || false
            },
            recruiter: {
                name: job.recruiters ? `${job.recruiters.firstName || ''} ${job.recruiters.lastName || ''}`.trim() || 'Unknown' : 'Unknown',
                email: job.recruiters?.users?.email
            },
            jobType: job.jobType,
            level: job.level,
            city: job.city,
            province: job.province,
            isRemote: job.isRemote,
            status: job.status,
            isActive: job.isActive, // Deprecated, keeping for temporary backward compat
            isFeatured: job.isFeatured,
            salaryMin: job.salaryMin,
            salaryMax: job.salaryMax,
            showSalary: job.showSalary,
            applicationCount: job._count.applications,
            viewCount: job.viewCount,
            numberOfPositions: job.numberOfPositions,
            applicationDeadline: job.applicationDeadline,
            createdAt: job.createdAt,
            publishedAt: job.publishedAt
        }))

        return NextResponse.json({
            success: true,
            stats: {
                total: totalJobs,
                active: activeJobs,
                pending: pendingJobs,
                rejected: rejectedJobs,
                totalApplications,
                byType: {
                    fullTime: fullTimeJobs,
                    partTime: partTimeJobs
                }
            },
            jobs: transformedJobs
        })

    } catch (error) {
        console.error('Error fetching admin jobs:', error)
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        )
    }
}

export async function PATCH(request) {
    try {
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
        const { jobId, status, rejectionReason } = body

        if (!jobId || !status) {
            return NextResponse.json({ error: 'Job ID and status are required' }, { status: 400 })
        }

        const updateData = {
            status,
            rejectionReason: status === 'REJECTED' ? rejectionReason : null,
            isActive: status === 'ACTIVE', // Sync legacy field
            updatedAt: new Date()
        }

        if (status === 'ACTIVE' && !updateData.publishedAt) {
            updateData.publishedAt = new Date()
        }
        
        // Handle rejection reason if implementing a reason field later? 
        // Currently Schema doesn't have rejectionReason on jobs, only companies.
        // Can add 'adminNotes' later if needed.

        const updatedJob = await prisma.jobs.update({
            where: { id: jobId },
            data: updateData
        })

        return NextResponse.json({
            success: true,
            data: updatedJob
        })

    } catch (error) {
        console.error('Error updating job status:', error)
        return NextResponse.json(
            { error: 'Failed to update job status', details: error.message },
            { status: 500 }
        )
    }
}
