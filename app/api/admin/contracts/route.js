import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/authHelper'
import { serializeBigInt } from '@/lib/utils'

// GET /api/admin/contracts - Get all contract registrations for admin review
export async function GET(request) {
  try {
    const auth = await requireAdmin(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const whereClause = {}

    if (status && status !== 'all') {
      whereClause.status = status
    }

    const [contracts, total, stats] = await Promise.all([
      prisma.contract_registrations.findMany({
        where: whereClause,
        select: {
          id: true,
          status: true,
          recruiterDocUrl: true,
          adminNotes: true,
          adminResponseDocUrl: true,
          createdAt: true,
          updatedAt: true,
          recruiters: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              position: true,
              phone: true,
              photoUrl: true,
              users: {
                select: {
                  email: true
                }
              }
            }
          },
          companies: {
            select: {
              id: true,
              name: true,
              logo: true,
              industry: true,
              address: true,
              city: true,
              province: true,
              phone: true,
              email: true
            }
          },
          workers: {
            select: {
              id: true,
              jobTitle: true,
              startDate: true,
              endDate: true,
              salary: true,
              notes: true,
              status: true,
              terminatedAt: true,
              terminationReason: true,
              jobseekers: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  photo: true,
                  email: true,
                  phone: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.contract_registrations.count({ where: whereClause }),
      prisma.contract_registrations.groupBy({
        by: ['status'],
        _count: true
      })
    ])

    const statsFormatted = {
      total,
      pending: stats.find(s => s.status === 'PENDING')?._count || 0,
      approved: stats.find(s => s.status === 'APPROVED')?._count || 0,
      rejected: stats.find(s => s.status === 'REJECTED')?._count || 0
    }

    return NextResponse.json({
      success: true,
      contracts: serializeBigInt(contracts),
      stats: statsFormatted,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching contracts for admin:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch contracts',
      details: error.message 
    }, { status: 500 })
  }
}
