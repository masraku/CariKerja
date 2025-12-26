// app/api/cron/complete-interviews/route.js
// This API can be called by Vercel Cron or manually to auto-complete interviews
// after 24 hours have passed since the scheduled time

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request) {
  try {
    // Verify cron secret for security (optional)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    // If CRON_SECRET is set, verify it
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    // Find all interviews that:
    // 1. Were scheduled more than 24 hours ago
    // 2. Have participant status as INTERVIEW_SCHEDULED
    const overdueParticipants = await prisma.interview_participants.findMany({
      where: {
        status: 'INTERVIEW_SCHEDULED',
        interviews: {
          scheduledAt: {
            lte: twentyFourHoursAgo
          }
        }
      },
      include: {
        interviews: true,
        applications: true
      }
    })

    let updatedCount = 0

    // Update each participant to INTERVIEW_COMPLETED
    for (const participant of overdueParticipants) {
      await prisma.$transaction([
        // Update participant status
        prisma.interview_participants.update({
          where: { id: participant.id },
          data: { status: 'INTERVIEW_COMPLETED' }
        }),
        // Update application status
        prisma.applications.update({
          where: { id: participant.applicationId },
          data: { status: 'INTERVIEW_COMPLETED' }
        })
      ])
      updatedCount++
    }

    // Also update the interview status if all participants are done
    const interviewIds = [...new Set(overdueParticipants.map(p => p.interviewId))]
    
    for (const interviewId of interviewIds) {
      const remainingScheduled = await prisma.interview_participants.count({
        where: {
          interviewId,
          status: 'INTERVIEW_SCHEDULED'
        }
      })

      if (remainingScheduled === 0) {
        await prisma.interviews.update({
          where: { id: interviewId },
          data: { status: 'COMPLETED' }
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Auto-completed ${updatedCount} interview participants`,
      updatedCount,
      processedInterviews: interviewIds.length,
      timestamp: now.toISOString()
    })

  } catch (error) {
    console.error('❌ Auto-complete interviews error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to auto-complete interviews',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
