import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRecruiter } from '@/lib/authHelper'

// GET /api/contracts/accepted-applicants - Get accepted applicants for contract registration
export async function GET(request) {
  try {
    const auth = await requireRecruiter(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { recruiter } = auth

    // Get accepted applicants that haven't been registered in a contract yet
    const acceptedApplicants = await prisma.applications.findMany({
      where: {
        status: 'ACCEPTED',
        jobs: {
          companyId: recruiter.companyId
        },
        // Exclude those already in pending or approved contracts
        NOT: {
          contract_workers: {
            some: {
              contract_registration: {
                status: {
                  in: ['PENDING', 'APPROVED']
                }
              }
            }
          }
        }
      },
      include: {
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
      orderBy: {
        respondedAt: 'desc'
      }
    })

    // Get PENDING contract registrations as batches (not individual workers)
    const pendingContracts = await prisma.contract_registrations.findMany({
      where: {
        companyId: recruiter.companyId,
        status: 'PENDING'
      },
      include: {
        workers: {
          include: {
            jobseekers: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                photo: true,
                email: true,
                phone: true
              }
            },
            applications: {
              include: {
                jobs: {
                  select: {
                    id: true,
                    title: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Get APPROVED contract registrations as batches
    const approvedContracts = await prisma.contract_registrations.findMany({
      where: {
        companyId: recruiter.companyId,
        status: 'APPROVED'
      },
      select: {
          id: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          adminResponseDocUrl: true,
          workers: {
            include: {
                jobseekers: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    photo: true,
                    email: true,
                    phone: true
                }
                },
                applications: {
                include: {
                    jobs: {
                    select: {
                        id: true,
                        title: true
                    }
                    }
                }
                }
            }
          }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Convert BigInt to string for JSON serialization
    const pendingContractsJSON = JSON.parse(JSON.stringify(pendingContracts, (_, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ))

    const approvedContractsJSON = JSON.parse(JSON.stringify(approvedContracts, (_, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ))

    // Count total workers
    const totalPendingWorkers = pendingContracts.reduce((sum, c) => sum + c.workers.length, 0)
    const totalApprovedWorkers = approvedContracts.reduce((sum, c) => sum + c.workers.length, 0)

    return NextResponse.json({
      success: true,
      acceptedApplicants,
      pendingContracts: pendingContractsJSON,
      approvedContracts: approvedContractsJSON,
      stats: {
        totalAccepted: acceptedApplicants.length,
        totalPendingContracts: pendingContracts.length,
        totalPendingWorkers,
        totalApprovedContracts: approvedContracts.length,
        totalApprovedWorkers
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
