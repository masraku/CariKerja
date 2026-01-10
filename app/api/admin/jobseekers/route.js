import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/authHelper'

export async function GET(request) {
    try {
        // Authenticate admin
        const auth = await requireAdmin(request)
        
        if (auth.error) {
            return NextResponse.json(
                { error: auth.error },
                { status: auth.status }
            )
        }

        const { searchParams } = new URL(request.url)
        const statusFilter = searchParams.get('status') || 'all' // all, employed, rejected, active

        // Get all jobseekers with their applications - sorted by newest registration first
        const jobseekers = await prisma.jobseekers.findMany({
            include: {
                users: {
                    select: {
                        id: true,
                        email: true,
                        createdAt: true
                    }
                },
                applications: {
                    include: {
                        jobs: {
                            select: {
                                title: true,
                                companies: {
                                    select: {
                                        name: true
                                    }
                                }
                            }
                        },
                        contract_workers: {
                            select: {
                                id: true,
                                status: true,
                                terminatedAt: true
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'  // Newest registered first
            }
        })

        // Transform and calculate employment status
        const jobseekersWithStatus = jobseekers.map(jobseeker => {
            // Check for active contract workers (not terminated/completed)
            // contract_workers is an array, so we need to check if any worker is ACTIVE
            const activeContractWorker = jobseeker.applications.find(app => 
                app.contract_workers && 
                app.contract_workers.length > 0 &&
                app.contract_workers.some(cw => cw.status === 'ACTIVE')
            )
            
            const acceptedApplications = jobseeker.applications.filter(app => app.status === 'ACCEPTED')
            const rejectedApplications = jobseeker.applications.filter(app => app.status === 'REJECTED')
            const pendingApplications = jobseeker.applications.filter(app => 
                ['PENDING', 'REVIEWING', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'INTERVIEW_COMPLETED'].includes(app.status)
            )

            let employmentStatus = 'ACTIVE'
            let acceptedJob = null

            // Only mark as EMPLOYED if has active contract worker
            if (activeContractWorker) {
                employmentStatus = 'EMPLOYED'
                acceptedJob = {
                    title: activeContractWorker.jobs?.title,
                    company: activeContractWorker.jobs?.companies?.name,
                    acceptedAt: activeContractWorker.updatedAt
                }
            } else if (rejectedApplications.length > 0 && pendingApplications.length === 0 && acceptedApplications.length === 0) {
                employmentStatus = 'REJECTED'
            }

            return {
                id: jobseeker.id,
                userId: jobseeker.userId,
                firstName: jobseeker.firstName,
                lastName: jobseeker.lastName,
                photo: jobseeker.photo,
                currentTitle: jobseeker.currentTitle,
                email: jobseeker.users.email,
                phone: jobseeker.phone,
                city: jobseeker.city,
                province: jobseeker.province,
                address: jobseeker.address,
                postalCode: jobseeker.postalCode,
                kecamatan: jobseeker.kecamatan,
                kelurahan: jobseeker.kelurahan,
                // Personal info
                idNumber: jobseeker.idNumber,
                dateOfBirth: jobseeker.dateOfBirth,
                gender: jobseeker.gender,
                religion: jobseeker.religion,
                maritalStatus: jobseeker.maritalStatus,
                nationality: jobseeker.nationality,
                // Education
                lastEducationLevel: jobseeker.lastEducationLevel,
                lastEducationInstitution: jobseeker.lastEducationInstitution,
                lastEducationMajor: jobseeker.lastEducationMajor,
                graduationYear: jobseeker.graduationYear,
                // Documents
                cvUrl: jobseeker.cvUrl,
                ktpUrl: jobseeker.ktpUrl,
                ak1Url: jobseeker.ak1Url,
                ijazahUrl: jobseeker.ijazahUrl,
                sertifikatUrl: jobseeker.sertifikatUrl,
                suratPengalamanUrl: jobseeker.suratPengalamanUrl,
                // Summary
                summary: jobseeker.summary,
                // Status - isEmployed based on active contract worker, not database field
                // If no active contract, jobseeker is considered looking for job
                isEmployed: !!activeContractWorker,
                isLookingForJob: !activeContractWorker,
                employedCompany: jobseeker.employedCompany,
                employedAt: jobseeker.employedAt,
                employmentStatus,
                acceptedJob,
                profileCompleted: jobseeker.profileCompleted,
                profileCompleteness: jobseeker.profileCompleteness,
                lastApplicationDate: jobseeker.applications[0]?.createdAt || null,
                totalApplications: jobseeker.applications.length,
                acceptedCount: acceptedApplications.length,
                rejectedCount: rejectedApplications.length,
                pendingCount: pendingApplications.length,
                joinedAt: jobseeker.users.createdAt,
                createdAt: jobseeker.createdAt
            }
        })

        // Filter by employment status if specified
        let filteredJobseekers = jobseekersWithStatus
        if (statusFilter !== 'all') {
            filteredJobseekers = jobseekersWithStatus.filter(js => 
                js.employmentStatus.toLowerCase() === statusFilter.toLowerCase()
            )
        }

        return NextResponse.json({
            success: true,
            data: {
                jobseekers: filteredJobseekers,
                count: filteredJobseekers.length
            }
        })

    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch jobseekers' },
            { status: 500 }
        )
    }
}
