import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/authHelper'

// GET /api/applications/batch?ids=id1,id2,id3
// Fetch multiple applications by their IDs
export async function GET(request) {
    try {
        const auth = await getCurrentUser(request)
        if (auth.error) {
            return NextResponse.json({ error: auth.error }, { status: auth.status })
        }

        const { user } = auth

        const { searchParams } = new URL(request.url)
        const idsParam = searchParams.get('ids')

        if (!idsParam) {
            return NextResponse.json({ error: 'Missing ids parameter' }, { status: 400 })
        }

        const ids = idsParam.split(',').map(id => id.trim()).filter(Boolean)

        if (ids.length === 0) {
            return NextResponse.json({ error: 'No valid IDs provided' }, { status: 400 })
        }

        if (ids.length > 50) {
            return NextResponse.json({ error: 'Too many IDs requested' }, { status: 400 })
        }

        let whereClause = {
            id: { in: ids }
        }

        if (user.role === 'RECRUITER') {
            const recruiter = await prisma.recruiters.findUnique({
                where: { userId: user.id },
                select: { companyId: true }
            })

            if (!recruiter) {
                return NextResponse.json({ error: 'Recruiter profile not found' }, { status: 404 })
            }

            whereClause = {
                ...whereClause,
                jobs: {
                    companyId: recruiter.companyId
                }
            }
        } else if (user.role === 'JOBSEEKER') {
            const jobseeker = await prisma.jobseekers.findUnique({
                where: { userId: user.id },
                select: { id: true }
            })

            if (!jobseeker) {
                return NextResponse.json({ error: 'Jobseeker profile not found' }, { status: 404 })
            }

            whereClause = {
                ...whereClause,
                jobseekerId: jobseeker.id
            }
        } else if (user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 })
        }

        const applications = await prisma.applications.findMany({
            where: whereClause,
            include: {
                jobseekers: {
                    include: {
                        users: {
                            select: {
                                id: true,
                                email: true
                            }
                        },
                        educations: {
                            orderBy: { endDate: 'desc' },
                            take: 1
                        },
                        work_experiences: {
                            orderBy: { endDate: 'desc' },
                            take: 1
                        },
                        jobseeker_skills: {
                            include: {
                                skills: true
                            }
                        }
                    }
                },
                jobs: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                        companyId: true,
                        companies: {
                            select: {
                                id: true,
                                name: true,
                                logo: true
                            }
                        }
                    }
                }
            }
        })

        // Format applications for the response
        const formattedApplications = applications.map(app => ({
            id: app.id,
            status: app.status,
            appliedAt: app.appliedAt,
            coverLetter: app.coverLetter,
            resumeUrl: app.resumeUrl,
            jobseeker: {
                id: app.jobseekers.id,
                firstName: app.jobseekers.firstName,
                lastName: app.jobseekers.lastName,
                email: app.jobseekers.email || app.jobseekers.users?.email,
                phone: app.jobseekers.phone,
                photo: app.jobseekers.photo,
                currentTitle: app.jobseekers.currentTitle,
                skills: app.jobseekers.jobseeker_skills?.map(item => item.skills?.name).filter(Boolean) || [],
                education: app.jobseekers.educations?.[0] || null,
                experience: app.jobseekers.work_experiences?.[0] || null
            },
            job: {
                id: app.jobs.id,
                title: app.jobs.title,
                slug: app.jobs.slug,
                company: app.jobs.companies
            }
        }))

        return NextResponse.json({
            applications: formattedApplications,
            count: formattedApplications.length
        })

    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 })
    }
}
