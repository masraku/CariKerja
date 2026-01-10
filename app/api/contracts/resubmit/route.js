import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRecruiter } from '@/lib/authHelper'

// POST /api/contracts/resubmit - Resubmit a rejected contract
export async function POST(request) {
  try {
    const auth = await requireRecruiter(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { recruiter } = auth
    const body = await request.json()
    const { contractId } = body

    if (!contractId) {
      return NextResponse.json({ error: 'Contract ID diperlukan' }, { status: 400 })
    }

    // Get the rejected contract
    const contract = await prisma.contract_registrations.findUnique({
      where: { id: contractId },
      include: {
        workers: {
          include: {
            applications: true
          }
        }
      }
    })

    if (!contract) {
      return NextResponse.json({ error: 'Kontrak tidak ditemukan' }, { status: 404 })
    }

    // Verify ownership
    if (contract.companyId !== recruiter.companyId) {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 })
    }

    // Check if contract is rejected
    if (contract.status !== 'REJECTED') {
      return NextResponse.json({ error: 'Hanya kontrak yang ditolak yang bisa di-resubmit' }, { status: 400 })
    }

    // Delete the contract workers and contract registration
    // The applications will be back to "ACCEPTED" status and available for new contract registration
    await prisma.$transaction(async (tx) => {
      // Delete contract workers
      await tx.contract_workers.deleteMany({
        where: { contractRegistrationId: contractId }
      })

      // Delete the contract registration
      await tx.contract_registrations.delete({
        where: { id: contractId }
      })

      // Update applications back to ACCEPTED status
      const applicationIds = contract.workers.map(w => w.applicationId)
      await tx.applications.updateMany({
        where: { id: { in: applicationIds } },
        data: { status: 'ACCEPTED' }
      })
    })

    return NextResponse.json({
      success: true,
      message: 'Kontrak berhasil di-reset. Silahkan daftarkan ulang pekerja.'
    })

  } catch (error) {
    console.error('Error resubmitting contract:', error)
    return NextResponse.json({ 
      error: 'Gagal melakukan resubmit',
      details: error.message 
    }, { status: 500 })
  }
}
