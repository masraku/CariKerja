import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createErrorResponse } from '@/lib/errorHandler'
import { authorizeCronRequest } from '@/lib/cron'

// GET /api/cron/complete-contracts - Auto-complete expired contracts
// This should be called daily by a cron job
export async function GET(request) {
  try {
    const unauthorized = authorizeCronRequest(request)
    if (unauthorized) return unauthorized

    const now = new Date()
    
    // Find all active contract workers whose endDate has passed
    const expiredContracts = await prisma.contract_workers.findMany({
      where: {
        status: 'ACTIVE',
        endDate: {
          lt: now
        },
        contract_registration: {
          status: 'APPROVED'
        }
      },
      include: {
        jobseekers: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        applications: {
          select: {
            id: true
          }
        }
      }
    })

    if (expiredContracts.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Tidak ada kontrak kedaluwarsa',
        completed: 0
      })
    }

    // Update all expired contracts to COMPLETED status
    const updates = expiredContracts.map(async (worker) => {
      return prisma.$transaction([
        // Update contract worker status
        prisma.contract_workers.update({
          where: { id: worker.id },
          data: {
            status: 'COMPLETED',
            terminatedAt: now,
            terminationReason: 'Kontrak berakhir otomatis'
          }
        }),
        // Update application status
        prisma.applications.update({
          where: { id: worker.applications.id },
          data: {
            status: 'RESIGNED' // Using RESIGNED to indicate contract ended
          }
        })
      ])
    })

    await Promise.all(updates)

    const completedNames = expiredContracts.map(w => 
      `${w.jobseekers.firstName} ${w.jobseekers.lastName}`
    )
    return NextResponse.json({
      success: true,
      message: `Menyelesaikan ${expiredContracts.length} kontrak kedaluwarsa`,
      completed: expiredContracts.length,
      workers: completedNames
    })

  } catch (error) {
    console.error('Error completing expired contracts:', error)
    return NextResponse.json({ 
      error: 'Gagal menyelesaikan kontrak kedaluwarsa',
      ...createErrorResponse('Terjadi kesalahan', error) 
    }, { status: 500 })
  }
}
