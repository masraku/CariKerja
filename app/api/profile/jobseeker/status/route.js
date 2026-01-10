import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireJobseeker } from '@/lib/authHelper'

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
        const employedCompanyName = activeContractApp?.jobs?.companies?.name || null

        return NextResponse.json({
            success: true,
            data: {
                id: jobseeker.id,
                // Status is now computed from contract workers
                isEmployed: hasActiveContract,
                isLookingForJob: !hasActiveContract,
                employedAt: hasActiveContract ? new Date() : null,
                employedCompany: employedCompanyName || jobseeker.employedCompany
            }
        })

    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to get status' },
            { status: 500 }
        )
    }
}
