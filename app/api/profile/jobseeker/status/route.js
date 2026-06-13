import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireJobseeker } from '@/lib/authHelper'
import { validateCSRFToken, csrfErrorResponse } from '@/lib/csrf'

// GET: Get current jobseeker status (computed from contract workers)
export async function GET(request) {
    try {
        const auth = await requireJobseeker(request)
        
        if (auth.error) {
            return NextResponse.json({ error: auth.error }, { status: auth.status })
        }

        const jobseeker = await prisma.jobseekers.findUnique({
            where: { userId: auth.user.id },
            select: {
                id: true,
                isEmployed: true,
                isLookingForJob: true,
                employedAt: true,
                employedCompany: true,
                applications: {
                    select: {
                        contract_workers: {
                            select: {
                                id: true,
                                status: true,
                                jobTitle: true
                            }
                        },
                        jobs: {
                            select: {
                                companies: {
                                    select: {
                                        name: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        })

        if (!jobseeker) {
            return NextResponse.json({ error: 'Jobseeker profile not found' }, { status: 404 })
        }

        // Check for active contract workers to determine employment status
        const activeContractApp = jobseeker.applications?.find(app => 
            app.contract_workers && 
            app.contract_workers.length > 0 &&
            app.contract_workers.some(cw => cw.status === 'ACTIVE')
        )
        
        const hasActiveContract = !!activeContractApp
        const isEmployed = hasActiveContract || jobseeker.isEmployed
        const isLookingForJob = hasActiveContract ? false : (jobseeker.isLookingForJob ?? !isEmployed)
        const employedCompanyName = activeContractApp?.jobs?.companies?.name || null

        return NextResponse.json({
            success: true,
            data: {
                id: jobseeker.id,
                isEmployed,
                isLookingForJob,
                employedAt: isEmployed ? jobseeker.employedAt : null,
                employedCompany: isEmployed ? (employedCompanyName || jobseeker.employedCompany) : null
            }
        })

    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to get status' },
            { status: 500 }
        )
    }
}

export async function PUT(request) {
    try {
        if (!validateCSRFToken(request)) {
            return csrfErrorResponse()
        }

        const auth = await requireJobseeker(request)

        if (auth.error) {
            return NextResponse.json({ error: auth.error }, { status: auth.status })
        }

        const body = await request.json()
        const data = {}

        if (typeof body.isEmployed === 'boolean') {
            data.isEmployed = body.isEmployed
            data.isLookingForJob = typeof body.isLookingForJob === 'boolean'
                ? body.isLookingForJob
                : !body.isEmployed
            data.employedAt = body.isEmployed ? new Date() : null
            data.employedCompany = body.isEmployed ? (body.employedCompany || null) : null
        } else if (typeof body.isLookingForJob === 'boolean') {
            data.isLookingForJob = body.isLookingForJob
        }

        if (Object.keys(data).length === 0) {
            return NextResponse.json({ error: 'Tidak ada status yang diperbarui' }, { status: 400 })
        }

        const jobseeker = await prisma.jobseekers.update({
            where: { userId: auth.user.id },
            data,
            select: {
                id: true,
                isEmployed: true,
                isLookingForJob: true,
                employedAt: true,
                employedCompany: true
            }
        })

        return NextResponse.json({
            success: true,
            data: jobseeker
        })
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to update status' },
            { status: 500 }
        )
    }
}
