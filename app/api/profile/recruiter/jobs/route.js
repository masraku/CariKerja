import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'all'
    const search = searchParams.get('search') || ''

    // Get recruiter's company
    const recruiter = await prisma.recruiters.findUnique({
      where: { userId: decoded.userId }
    })

    if (!recruiter) {
      return NextResponse.json(
        { error: 'Recruiter profile not found' },
        { status: 404 }
      )
    }

    // Build where clause
    const where = {
      companyId: recruiter.companyId,
      AND: []
    }

    // Status filter
    if (status === 'active') {
      where.AND.push({ isActive: true })
    } else if (status === 'inactive') {
      where.AND.push({ isActive: false })
    }

    // Search filter
    if (search) {
      where.AND.push({
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { location: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      })
    }

    // Remove empty AND array
    if (where.AND.length === 0) {
      delete where.AND
    }

    // Fetch jobs
    const jobs = await prisma.jobs.findMany({
      where,
      include: {
        _count: {
          select: {
            applications: true
          }
        },
        applications: {
          select: {
            status: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Calculate stats for each job
    const jobsWithStats = jobs.map(job => {
      const applications = job.applications
      const stats = {
        total: applications.length,
        pending: applications.filter(a => a.status === 'PENDING').length,
        reviewing: applications.filter(a => a.status === 'REVIEWING').length,
        shortlisted: applications.filter(a => a.status === 'SHORTLISTED').length,
        interview: applications.filter(a => a.status === 'INTERVIEW_SCHEDULED').length,
        accepted: applications.filter(a => a.status === 'ACCEPTED').length,
        rejected: applications.filter(a => a.status === 'REJECTED').length
      }

      // Remove applications array from response, only keep count
      const { applications: _, ...jobWithoutApplications } = job

      return {
        ...jobWithoutApplications,
        stats
      }
    })

    // Calculate overall stats
    const overallStats = {
      total: jobs.length,
      active: jobs.filter(j => j.isActive).length,
      inactive: jobs.filter(j => !j.isActive).length,
      totalApplications: jobs.reduce((sum, j) => sum + j._count.applications, 0),
      totalViews: jobs.reduce((sum, j) => sum + (j.viewCount || 0), 0)
    }

    return NextResponse.json({
      success: true,
      jobs: jobsWithStats,
      stats: overallStats
    })

  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Failed to fetch jobs',
        details: error.message 
      },
      { status: 500 }
    )
  }
}