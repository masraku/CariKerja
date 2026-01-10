import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRecruiter } from '@/lib/authHelper'
import { serializeBigInt } from '@/lib/utils'

// GET /api/contracts/accepted-applicants - Get accepted applicants for contract registration
export async function GET(request) {
  try {
    const auth = await requireRecruiter(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { recruiter } = auth

    // Run all queries in parallel for better performance
    const [acceptedApplicants, pendingContracts, approvedContracts, rejectedContracts] = await Promise.all([
      // Get accepted applicants that haven't been registered in a contract yet
      prisma.applications.findMany({
        where: {
          status: 'ACCEPTED',
          jobs: {
            companyId: recruiter.companyId
          },
          NOT: {
            contract_workers: {
              some: {
                contract_registration: {
                  status: { in: ['PENDING', 'APPROVED'] }
                }
              }
            }
          }
        },
        select: {
          id: true,
          jobseekerId: true,
          respondedAt: true,
          jobseekers: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              photo: true,
              email: true,
              phone: true,
              currentTitle: true
            }
          },
          jobs: {
            select: {
              id: true,
              title: true,
              slug: true,
              salaryMin: true,
              salaryMax: true
            }
          }
        },
        orderBy: { respondedAt: 'desc' }
      }),

      // Get PENDING contracts
      prisma.contract_registrations.findMany({
        where: {
          companyId: recruiter.companyId,
          status: 'PENDING'
        },
        select: {
          id: true,
          status: true,
          createdAt: true,
          recruiterDocUrl: true,
          notes: true,
          workers: {
            select: {
              id: true,
              jobTitle: true,
              salary: true,
              startDate: true,
              endDate: true,
              jobseekers: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  photo: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),

      // Get APPROVED contracts
      prisma.contract_registrations.findMany({
        where: {
          companyId: recruiter.companyId,
          status: 'APPROVED'
        },
        select: {
          id: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          adminNotes: true,
          adminResponseDocUrl: true,
          recruiterDocUrl: true,
          notes: true,
          workers: {
            select: {
              id: true,
              jobTitle: true,
              salary: true,
              startDate: true,
              endDate: true,
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
        orderBy: { createdAt: 'desc' }
      }),

      // Get REJECTED contracts
      prisma.contract_registrations.findMany({
        where: {
          companyId: recruiter.companyId,
          status: 'REJECTED'
        },
        select: {
          id: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          adminNotes: true,
          recruiterDocUrl: true,
          notes: true,
          workers: {
            select: {
              id: true,
              jobTitle: true,
              salary: true,
              startDate: true,
              endDate: true,
              applicationId: true,
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
        orderBy: { updatedAt: 'desc' }
      })
    ])

    // Count total workers (only active ones)
    const totalPendingWorkers = pendingContracts.reduce((sum, c) => sum + c.workers.length, 0)
    const totalApprovedWorkers = approvedContracts.reduce((sum, c) => 
      sum + c.workers.filter(w => w.status === 'ACTIVE').length, 0)
    const totalRejectedWorkers = rejectedContracts.reduce((sum, c) => sum + c.workers.length, 0)

    return NextResponse.json({
      success: true,
      acceptedApplicants,
      pendingContracts: serializeBigInt(pendingContracts),
      approvedContracts: serializeBigInt(approvedContracts),
      rejectedContracts: serializeBigInt(rejectedContracts),
      stats: {
        totalAccepted: acceptedApplicants.length,
        totalPendingContracts: pendingContracts.length,
        totalPendingWorkers,
        totalApprovedContracts: approvedContracts.length,
        totalApprovedWorkers,
        totalRejectedContracts: rejectedContracts.length,
        totalRejectedWorkers
      }
    })

  } catch (error) {
    console.error('Error fetching accepted applicants:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch accepted applicants',
      details: error.message 
    }, { status: 500 })
  }
}
