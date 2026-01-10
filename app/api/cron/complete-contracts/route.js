import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/cron/complete-contracts - Auto-complete expired contracts
// This should be called daily by a cron job
export async function GET(request) {
  try {
    // Verify cron secret (optional, for security)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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
        message: 'No expired contracts found',
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

    console.log(`Auto-completed ${expiredContracts.length} contracts:`, completedNames)

    return NextResponse.json({
      success: true,
      message: `Completed ${expiredContracts.length} expired contracts`,
      completed: expiredContracts.length,
      workers: completedNames
    })

  } catch (error) {
    console.error('Error completing expired contracts:', error)
    return NextResponse.json({ 
      error: 'Failed to complete expired contracts',
      details: error.message 
    }, { status: 500 })
  }
}
