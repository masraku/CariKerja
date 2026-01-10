import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Combined daily tasks cron job
// Runs at 1 AM daily
export async function GET(request) {
  try {
    // Verify cron secret (optional, for security)
    const authHeader = request.headers.get('authorization')
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      // Allow in development or if no secret is set
      if (process.env.NODE_ENV === 'production' && process.env.CRON_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const results = {
      completedInterviews: 0,
      completedContracts: 0,
      expiredJobs: 0
    }

    // Task 1: Complete past interviews
    const now = new Date()
    const completedInterviews = await prisma.interviews.updateMany({
      where: {
        scheduledAt: { lt: now },
        status: { in: ['SCHEDULED', 'CONFIRMED'] }
      },
      data: {
        status: 'COMPLETED',
        updatedAt: now
      }
    })
    results.completedInterviews = completedInterviews.count

    // Also update related applications
    const pastInterviews = await prisma.interviews.findMany({
      where: {
        scheduledAt: { lt: now },
        status: 'COMPLETED'
      },
      select: { applicationId: true }
    })

    if (pastInterviews.length > 0) {
      await prisma.applications.updateMany({
        where: {
          id: { in: pastInterviews.map(i => i.applicationId) },
          status: 'INTERVIEW_SCHEDULED'
        },
        data: {
          status: 'INTERVIEW_COMPLETED',
          updatedAt: now
        }
      })
    }

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
        deadline: { lt: now }
      },
      data: {
        status: 'EXPIRED',
        updatedAt: now
      }
    })
    results.expiredJobs = expiredJobs.count

    console.log(`Daily tasks completed:`, results)

    return NextResponse.json({
      success: true,
      message: 'Daily tasks completed successfully',
      results,
      executedAt: now.toISOString()
    })

  } catch (error) {
    console.error('Daily tasks cron error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to run daily tasks',
      details: error.message
    }, { status: 500 })
  }
}
