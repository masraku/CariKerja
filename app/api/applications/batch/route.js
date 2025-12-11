import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// GET /api/applications/batch?ids=id1,id2,id3
// Fetch multiple applications by their IDs
export async function GET(request) {
    try {
        const authHeader = request.headers.get('authorization')
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const token = authHeader.split(' ')[1]
        const decoded = verifyToken(token)

        if (!decoded) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const idsParam = searchParams.get('ids')

        if (!idsParam) {
            return NextResponse.json({ error: 'Missing ids parameter' }, { status: 400 })
        }

        const ids = idsParam.split(',').filter(id => id.trim())

        if (ids.length === 0) {
            return NextResponse.json({ error: 'No valid IDs provided' }, { status: 400 })
        }

        // Fetch the user to check role
        const user = await prisma.users.findUnique({
            where: { id: decoded.userId },
            include: {
                recruiters: true
            }
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Build the query - recruiters can only see applications for their jobs
        let whereClause = {
            id: { in: ids }
        }

        // If recruiter, filter by their jobs
        if (user.role === 'RECRUITER' && user.recruiters) {
            whereClause = {
                ...whereClause,
                jobs: {
                    companyId: user.recruiters.companyId
                }
            }
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
            resume: app.resume,
            jobseeker: {
                id: app.jobseekers.id,
                firstName: app.jobseekers.firstName,
                lastName: app.jobseekers.lastName,
                email: app.jobseekers.email || app.jobseekers.users?.email,
                phone: app.jobseekers.phone,
                photo: app.jobseekers.photo,
                currentTitle: app.jobseekers.currentTitle,
                skills: app.jobseekers.skills || [],
                education: app.jobseekers.educations?.[0] || null,
                experience: app.jobseekers.experiences?.[0] || null
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
        console.error('Batch applications error:', error)
        return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 })
    }
}
