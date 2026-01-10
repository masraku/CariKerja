import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/authHelper'
import { serializeBigInt } from '@/lib/utils'

// GET /api/admin/contracts/[id] - Get contract registration detail
export async function GET(request, { params }) {
  try {
    const auth = await requireAdmin(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { id } = await params

    const contract = await prisma.contract_registrations.findUnique({
      where: { id },
      include: {
        recruiters: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            position: true,
            phone: true
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
            phone: true,
            email: true
          }
        },
        workers: {
          include: {
            jobseekers: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                photo: true,
                email: true,
                phone: true,
                address: true,
                city: true,
                idNumber: true
              }
            },
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
            }
          }
        }
      }
    })

    if (!contract) {
      return NextResponse.json({ 
        error: 'Contract registration not found' 
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      contract: serializeBigInt(contract)
    })

  } catch (error) {
    console.error('Error fetching contract detail:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch contract detail',
      details: error.message 
    }, { status: 500 })
  }
}

// PATCH /api/admin/contracts/[id] - Approve or reject contract registration
export async function PATCH(request, { params }) {
  try {
    const auth = await requireAdmin(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { id } = await params
    const body = await request.json()
    const { action, adminNotes } = body

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ 
        error: 'Invalid action. Must be "approve" or "reject"' 
      }, { status: 400 })
    }

    const contract = await prisma.contract_registrations.findUnique({
      where: { id }
    })

    if (!contract) {
      return NextResponse.json({ 
        error: 'Contract registration not found' 
      }, { status: 404 })
    }

    if (contract.status !== 'PENDING') {
      return NextResponse.json({ 
        error: 'Contract registration has already been processed' 
      }, { status: 400 })
    }

    const newStatus = action === 'approve' ? 'APPROVED' : 'REJECTED'

    const updatedContract = await prisma.contract_registrations.update({
      where: { id },
      data: {
        status: newStatus,
        adminNotes: adminNotes || null,
        adminResponseDocUrl: body.adminResponseDocUrl || null,
        processedAt: new Date(),
        processedBy: auth.admin.id
      },
      include: {
        companies: {
          select: {
            name: true
          }
        },
        workers: {
          include: {
            jobseekers: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: `Contract registration ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
      contract: serializeBigInt(updatedContract)
    })

  } catch (error) {
    console.error('Error processing contract registration:', error)
    return NextResponse.json({ 
      error: 'Failed to process contract registration',
      details: error.message 
    }, { status: 500 })
  }
}
