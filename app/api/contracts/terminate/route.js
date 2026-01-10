import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRecruiter } from '@/lib/authHelper'

// POST /api/contracts/terminate - Terminate a contract worker
export async function POST(request) {
  try {
    const auth = await requireRecruiter(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { recruiter } = auth
    const body = await request.json()
    const { workerId, reason } = body

    if (!workerId) {
      return NextResponse.json({ error: 'ID pekerja diperlukan' }, { status: 400 })
    }

    // Get the contract worker and verify ownership
    const worker = await prisma.contract_workers.findUnique({
      where: { id: workerId },
      include: {
        contract_registration: {
          select: {
            companyId: true,
            status: true
          }
        },
        jobseekers: {
          select: {
            id: true,
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

    if (!worker) {
      return NextResponse.json({ error: 'Pekerja tidak ditemukan' }, { status: 404 })
    }

    // Verify this contract belongs to recruiter's company
    if (worker.contract_registration.companyId !== recruiter.companyId) {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 })
    }

    // Check if contract is approved
    if (worker.contract_registration.status !== 'APPROVED') {
      return NextResponse.json({ error: 'Kontrak belum disetujui' }, { status: 400 })
    }

    // Check if already terminated or completed
    if (worker.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Kontrak sudah berakhir' }, { status: 400 })
    }

    // Update contract worker status, application status, and jobseeker employment status
    const [updatedWorker] = await prisma.$transaction([
      // Update contract worker status
      prisma.contract_workers.update({
        where: { id: workerId },
        data: {
          status: 'TERMINATED',
          terminatedAt: new Date(),
          terminationReason: reason || 'Diakhiri oleh recruiter'
        }
      }),
      // Update application status back to allow job seeking
      prisma.applications.update({
        where: { id: worker.applications.id },
        data: {
          status: 'RESIGNED' // Using RESIGNED status to indicate contract ended
        }
      }),
      // Update jobseeker employment status to not employed
      prisma.jobseekers.update({
        where: { id: worker.jobseekers.id },
        data: {
          isEmployed: false,
          isLookingForJob: true
        }
      })
    ])

    return NextResponse.json({
      success: true,
      message: `Kontrak ${worker.jobseekers.firstName} ${worker.jobseekers.lastName} telah diakhiri`
    })

  } catch (error) {
    console.error('Error terminating contract:', error)
    return NextResponse.json({ 
      error: 'Gagal mengakhiri kontrak',
      details: error.message 
    }, { status: 500 })
  }
}
