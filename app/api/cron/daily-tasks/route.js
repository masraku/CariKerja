import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createErrorResponse } from '@/lib/errorHandler'
import { authorizeCronRequest } from '@/lib/cron'

// Combined daily tasks cron job
// Runs at 1 AM daily
export async function GET(request) {
  try {
    const unauthorized = authorizeCronRequest(request)
    if (unauthorized) return unauthorized

    const results = {
      completedInterviews: 0,
      overdueInterviews: 0,
      completedContracts: 0,
      expiredJobs: 0
    }

    // Task 1: Report overdue interviews. Recruiters complete interviews manually.
    const now = new Date()
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    results.overdueInterviews = await prisma.interviews.count({
      where: {
        scheduledAt: { lte: twentyFourHoursAgo },
        status: 'SCHEDULED'
      }
    })

    // Task 2: Complete expired contracts
    const expiredContracts = await prisma.contract_workers.findMany({
      where: {
        status: 'ACTIVE',
        endDate: { lt: now }
      },
      select: { id: true }
    })

    if (expiredContracts.length > 0) {
      const updatedContracts = await prisma.contract_workers.updateMany({
        where: {
          id: { in: expiredContracts.map(c => c.id) }
        },
        data: {
          status: 'COMPLETED',
          updatedAt: now
        }
      })
      results.completedContracts = updatedContracts.count
    }

    // Task 3: Deactivate expired jobs (optional)
    const expiredJobs = await prisma.jobs.updateMany({
      where: {
        status: 'ACTIVE',
        applicationDeadline: { lt: now, not: null }
      },
      data: {
        status: 'CLOSED',
        isActive: false,
        closedAt: now,
        updatedAt: now
      }
    })
    results.expiredJobs = expiredJobs.count


    return NextResponse.json({
      success: true,
      message: 'Tugas harian berhasil diselesaikan',
      results,
      executedAt: now.toISOString()
    })

  } catch (error) {
    console.error('Daily tasks cron error:', error)
    return NextResponse.json({
      success: false,
      error: 'Gagal menjalankan tugas harian',
      ...createErrorResponse('Terjadi kesalahan', error)
    }, { status: 500 })
  }
}
