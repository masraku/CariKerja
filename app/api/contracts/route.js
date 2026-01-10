import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRecruiter } from '@/lib/authHelper'
import { serializeBigInt } from '@/lib/utils'

// GET /api/contracts - Get contract registrations for recruiter's company
export async function GET(request) {
  try {
    const auth = await requireRecruiter(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { recruiter } = auth

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const whereClause = {
      companyId: recruiter.companyId
    }

    if (status && status !== 'all') {
      whereClause.status = status
    }

    const contracts = await prisma.contract_registrations.findMany({
      where: whereClause,
      include: {
        recruiters: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        companies: {
          select: {
            id: true,
            name: true,
            logo: true
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
                phone: true
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Get stats
    const stats = await prisma.contract_registrations.groupBy({
      by: ['status'],
      where: {
        companyId: recruiter.companyId
      },
      _count: true
    })

    // Get total workers registered
    const totalWorkersRegistered = await prisma.contract_workers.count({
      where: {
        contract_registration: {
          companyId: recruiter.companyId,
          status: 'APPROVED'
        }
      }
    })

    const statsFormatted = {
      total: contracts.length,
      pending: stats.find(s => s.status === 'PENDING')?._count || 0,
      approved: stats.find(s => s.status === 'APPROVED')?._count || 0,
      rejected: stats.find(s => s.status === 'REJECTED')?._count || 0,
      totalWorkers: totalWorkersRegistered
    }

    return NextResponse.json({
      success: true,
      contracts: serializeBigInt(contracts),
      stats: statsFormatted
    })

  } catch (error) {
    console.error('Error fetching contracts:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch contracts',
      details: error.message 
    }, { status: 500 })
  }
}

// POST /api/contracts - Create new contract registration
export async function POST(request) {
  try {
    const auth = await requireRecruiter(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { recruiter } = auth
    const body = await request.json()
    const { workers, recruiterDocUrl } = body

    if (!workers || !Array.isArray(workers) || workers.length === 0) {
      return NextResponse.json({ 
        error: 'At least one worker is required' 
      }, { status: 400 })
    }

    // Validate each worker
    for (const worker of workers) {
      if (!worker.applicationId || !worker.jobseekerId || !worker.jobTitle || 
          !worker.startDate || !worker.endDate || !worker.salary) {
        return NextResponse.json({ 
          error: 'Missing required fields for worker' 
        }, { status: 400 })
      }

      // Check if application belongs to recruiter's company and is ACCEPTED
      const application = await prisma.applications.findUnique({
        where: { id: worker.applicationId },
        include: {
          jobs: {
            select: {
              companyId: true
            }
          }
        }
      })

      if (!application) {
        return NextResponse.json({ 
          error: `Application ${worker.applicationId} not found` 
        }, { status: 404 })
      }

      if (application.jobs.companyId !== recruiter.companyId) {
        return NextResponse.json({ 
          error: 'Application does not belong to your company' 
        }, { status: 403 })
      }

      if (application.status !== 'ACCEPTED') {
        return NextResponse.json({ 
          error: 'Application must be ACCEPTED before contract registration' 
        }, { status: 400 })
      }

      // Check if worker is already in a pending or approved contract
      const existingWorker = await prisma.contract_workers.findFirst({
        where: {
          applicationId: worker.applicationId,
          contract_registration: {
            status: {
              in: ['PENDING', 'APPROVED']
            }
          }
        }
      })

      if (existingWorker) {
        return NextResponse.json({ 
          error: 'Worker already has a pending or approved contract registration' 
        }, { status: 400 })
      }
    }

    // Create contract registration with workers
    const contract = await prisma.contract_registrations.create({
      data: {
        recruiterId: recruiter.id,
        companyId: recruiter.companyId,
        recruiterDocUrl: recruiterDocUrl || null,
        workers: {
          create: workers.map(w => ({
            applicationId: w.applicationId,
            jobseekerId: w.jobseekerId,
            jobTitle: w.jobTitle,
            startDate: new Date(w.startDate),
            endDate: new Date(w.endDate),
            salary: BigInt(w.salary),
            attachmentUrl: w.attachmentUrl || null,
            notes: w.notes || null
          }))
        }
      },
      include: {
        workers: {
          include: {
            jobseekers: {
              select: {
                id: true,
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
      message: 'Contract registration submitted successfully',
      contract: serializeBigInt(contract)
    })

  } catch (error) {
    console.error('Error creating contract registration:', error)
    return NextResponse.json({ 
      error: 'Failed to create contract registration',
      details: error.message 
    }, { status: 500 })
  }
}
