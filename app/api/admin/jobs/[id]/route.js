import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/authHelper'
import { prisma } from '@/lib/prisma'

export async function GET(request, { params }) {
    try {
        const auth = await getCurrentUser(request)
        
        if (auth.error) {
            return NextResponse.json(
                { error: auth.error },
                { status: auth.status }
            )
        }

        const { user } = auth

        // Check admin role
        if (user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized - Admin only' },
                { status: 403 }
            )
        }

        const { id } = await params

        const job = await prisma.jobs.findUnique({
            where: { id },
            include: {
                companies: {
                    select: {
                        id: true,
                        name: true,
                        logo: true,
                        industry: true,
                        verified: true,
                        city: true,
                        province: true
                    }
                },
                recruiters: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        position: true
                    }
                },
                job_skills: {
                    include: {
                        skills: true
                    }
                },
                _count: {
                    select: {
                        applications: true
                    }
                }
            }
        })

        if (!job) {
            return NextResponse.json(
                { error: 'Job not found' },
                { status: 404 }
            )
        }

        // Format response
        const formattedJob = {
            ...job,
            company: job.companies,
            recruiter: job.recruiters,
            skills: job.job_skills?.map(js => js.skills.name) || [],
            gallery: job.gallery || [],
            applicationCount: job._count?.applications || 0
        }

        delete formattedJob.companies
        delete formattedJob.recruiters
        delete formattedJob.job_skills
        delete formattedJob._count

        return NextResponse.json({
            success: true,
            job: formattedJob
        })

    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch job detail' },
            { status: 500 }
        )
    }
}
