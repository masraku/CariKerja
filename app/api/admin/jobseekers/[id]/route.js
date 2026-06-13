import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/authHelper'

export async function GET(request, { params }) {
    try {
        const auth = await requireAdmin(request)

        if (auth.error) {
            return NextResponse.json(
                { error: auth.error },
                { status: auth.status }
            )
        }

        const { id } = await params

        const jobseeker = await prisma.jobseekers.findUnique({
            where: { id },
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
                                jobTitle: true,
                                startDate: true,
                                endDate: true,
                                salary: true,
                                terminatedAt: true,
                                contract_registration: {
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
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                }
            }
        })

        if (!jobseeker) {
            return NextResponse.json({ error: 'Jobseeker not found' }, { status: 404 })
        }

        let activeWorkerData = null
        const activeContractApp = jobseeker.applications.find(app => {
            if (app.contract_workers && app.contract_workers.length > 0) {
                const activeWorker = app.contract_workers.find(cw => cw.status === 'ACTIVE')
                if (activeWorker) {
                    activeWorkerData = {
                        ...activeWorker,
                        jobTitle: activeWorker.jobTitle || app.jobs?.title,
                        companyName: activeWorker.contract_registration?.companies?.name
                    }
                    return true
                }
            }
            return false
        })

        const acceptedApplications = jobseeker.applications.filter(app => app.status === 'ACCEPTED')
        const rejectedApplications = jobseeker.applications.filter(app => app.status === 'REJECTED')
        const pendingApplications = jobseeker.applications.filter(app =>
            ['PENDING', 'REVIEWING', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'INTERVIEW_COMPLETED'].includes(app.status)
        )

        let employmentStatus = 'ACTIVE'
        let acceptedJob = null
        let currentJob = null

        if (activeContractApp && activeWorkerData) {
            employmentStatus = 'EMPLOYED'
            acceptedJob = {
                title: activeContractApp.jobs?.title,
                company: activeContractApp.jobs?.companies?.name,
                acceptedAt: activeContractApp.updatedAt
            }
            currentJob = {
                position: activeWorkerData.jobTitle,
                company: activeWorkerData.companyName,
                startDate: activeWorkerData.startDate,
                endDate: activeWorkerData.endDate,
                salary: activeWorkerData.salary ? Number(activeWorkerData.salary) : null
            }
        } else if (rejectedApplications.length > 0 && pendingApplications.length === 0 && acceptedApplications.length === 0) {
            employmentStatus = 'REJECTED'
        }

        return NextResponse.json({
            success: true,
            data: {
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
                idNumber: jobseeker.idNumber,
                dateOfBirth: jobseeker.dateOfBirth,
                gender: jobseeker.gender,
                religion: jobseeker.religion,
                maritalStatus: jobseeker.maritalStatus,
                nationality: jobseeker.nationality,
                lastEducationLevel: jobseeker.lastEducationLevel,
                lastEducationInstitution: jobseeker.lastEducationInstitution,
                lastEducationMajor: jobseeker.lastEducationMajor,
                graduationYear: jobseeker.graduationYear,
                cvUrl: jobseeker.cvUrl,
                ktpUrl: jobseeker.ktpUrl,
                ak1Url: jobseeker.ak1Url,
                ijazahUrl: jobseeker.ijazahUrl,
                sertifikatUrl: jobseeker.sertifikatUrl,
                suratPengalamanUrl: jobseeker.suratPengalamanUrl,
                summary: jobseeker.summary,
                isEmployed: !!activeContractApp,
                isLookingForJob: !activeContractApp,
                employedCompany: currentJob?.company || jobseeker.employedCompany,
                employedAt: currentJob?.startDate || jobseeker.employedAt,
                employmentStatus,
                acceptedJob,
                currentJob,
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
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch jobseeker' },
            { status: 500 }
        )
    }
}
