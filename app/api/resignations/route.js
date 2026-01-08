import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRecruiter } from '@/lib/authHelper'

// GET /api/resignations
// Recruiter gets list of resignations for their company
export async function GET(request) {
  try {
    const auth = await requireRecruiter(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { recruiter } = auth

    // Get query params
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // PENDING, APPROVED, REJECTED

    // Build where clause
    const whereClause = {
      applications: {
        jobs: {
          companyId: recruiter.companyId
        }
      }
    }

    if (status && status !== 'all') {
      whereClause.status = status
    }

    // Get resignations
    const resignations = await prisma.resignations.findMany({
      where: whereClause,
      include: {
        applications: {
          include: {
            jobs: {
              select: {
                id: true,
                title: true,
                slug: true
              }
            }
          }
        },
        jobseekers: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            photo: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Get stats
    const stats = await prisma.resignations.groupBy({
      by: ['status'],
      where: {
        applications: {
          jobs: {
            companyId: recruiter.companyId
          }
        }
      },
      _count: true
    })

    const statsFormatted = {
      total: resignations.length,
      pending: stats.find(s => s.status === 'PENDING')?._count || 0,
      approved: stats.find(s => s.status === 'APPROVED')?._count || 0,
      rejected: stats.find(s => s.status === 'REJECTED')?._count || 0
    }

    return NextResponse.json({
      success: true,
      resignations,
      stats: statsFormatted
    })

  } catch (error) {
    console.error('Error fetching resignations:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch resignations',
      details: error.message 
    }, { status: 500 })
  }
}
