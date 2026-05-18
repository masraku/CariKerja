// app/api/cron/complete-interviews/route.js
// This API can be called by Vercel Cron or manually to report overdue interviews.
// Interview completion is intentionally controlled by recruiters.

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createErrorResponse } from '@/lib/errorHandler'
import { authorizeCronRequest } from '@/lib/cron'

export async function GET(request) {
  try {
    const unauthorized = authorizeCronRequest(request)
    if (unauthorized) return unauthorized

    const now = new Date()
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    // Interview completion is controlled by recruiters from the interview room.
    // This cron only reports overdue interviews so it does not move candidates forward automatically.
    const overdueParticipants = await prisma.interview_participants.count({
      where: {
        status: { in: ['PENDING', 'ACCEPTED', 'RESCHEDULE_REQUESTED'] },
        interviews: {
          status: 'SCHEDULED',
          scheduledAt: {
            lte: twentyFourHoursAgo
          }
        },
        applications: {
          status: 'INTERVIEW_SCHEDULED'
        }
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Auto-complete interview dinonaktifkan. Recruiter menyelesaikan interview secara manual.',
      updatedCount: 0,
      overdueParticipants,
      timestamp: now.toISOString()
    })

  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Gagal menyelesaikan interview otomatis',
        ...createErrorResponse('Terjadi kesalahan', error) 
      },
      { status: 500 }
    )
  }
}
