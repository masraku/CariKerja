import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request) {
    try {
        const authHeader = request.headers.get('authorization')
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Tidak memiliki akses' }, { status: 401 })
        }

        const token = authHeader.split(' ')[1]
        const decoded = verifyToken(token)

        if (!decoded) {
            return NextResponse.json({ error: 'Token tidak valid' }, { status: 401 })
        }

        const body = await request.json()
        const {
            title,
            date,
            time,
            duration,
            meetingType,
            meetingUrl,
            location,
            description,
            notes,
            jobId,
            applicationIds
        } = body

        // Validate required fields
        if (!title || !date || !time || !jobId || !applicationIds || applicationIds.length === 0) {
            return NextResponse.json({ 
                error: 'Field yang wajib diisi tidak lengkap' 
            }, { status: 400 })
        }

        // Get the recruiter
        const user = await prisma.users.findUnique({
            where: { id: decoded.userId },
            include: {
                recruiters: true
            }
        })

        if (!user || !user.recruiters) {
            return NextResponse.json({ error: 'Rekruter tidak ditemukan' }, { status: 404 })
        }

        // Verify job belongs to recruiter's company
        const job = await prisma.jobs.findFirst({
            where: {
                id: jobId,
                companyId: user.recruiters.companyId
            }
        })

        if (!job) {
            return NextResponse.json({ 
                error: 'Lowongan tidak ditemukan atau tidak diizinkan' 
            }, { status: 404 })
        }

        // Verify all applications are for this job and belong to recruiter
        const applications = await prisma.applications.findMany({
            where: {
                id: { in: applicationIds },
                jobId: jobId
            }
        })

        if (applications.length !== applicationIds.length) {
            return NextResponse.json({ 
                error: 'Beberapa lamaran tidak ditemukan atau bukan milik lowongan ini' 
            }, { status: 400 })
        }

        // Create combined datetime
        const scheduledAt = new Date(`${date}T${time}:00`)

        // Create interview
        const interview = await prisma.interviews.create({
            data: {
                id: uuidv4(),
                recruiterId: user.recruiters.id,
                jobId: jobId,
                title: title,
                scheduledAt: scheduledAt,
                duration: parseInt(duration) || 60,
                meetingType: meetingType || 'GOOGLE_MEET',
                meetingUrl: meetingUrl || null,
                location: location || null,
                description: description || null,
                notes: notes || null,
                status: 'SCHEDULED',
                updatedAt: new Date()
            }
        })

        // Create interview participants for each application
        const participantPromises = applicationIds.map(appId => 
            prisma.interview_participants.create({
                data: {
                    id: uuidv4(),
                    interviewId: interview.id,
                    applicationId: appId,
                    status: 'PENDING',
                    updatedAt: new Date()
                }
            })
        )

        // Update application statuses to INTERVIEW_SCHEDULED
        const statusUpdatePromises = applicationIds.map(appId =>
            prisma.applications.update({
                where: { id: appId },
                data: { 
                    status: 'INTERVIEW_SCHEDULED',
                    interviewDate: scheduledAt,
                    updatedAt: new Date()
                }
            })
        )

        await Promise.all([...participantPromises, ...statusUpdatePromises])

        // Fetch the complete interview with participants
        const completeInterview = await prisma.interviews.findUnique({
            where: { id: interview.id },
            include: {
                interview_participants: {
                    include: {
                        applications: {
                            include: {
                                jobseekers: {
                                    select: {
                                        id: true,
                                        firstName: true,
                                        lastName: true,
                                        email: true,
                                        phone: true
                                    }
                                }
                            }
                        }
                    }
                },
                jobs: {
                    select: {
                        id: true,
                        title: true,
                        slug: true
                    }
                }
            }
        })

        // TODO: Send email notifications to candidates
        // This would integrate with your email service

        return NextResponse.json({
            success: true,
            interview: completeInterview,
            message: `Interview dijadwalkan untuk ${applicationIds.length} kandidat`
        })

    } catch (error) {
        return NextResponse.json({ 
            error: 'Gagal menjadwalkan interview',
            details: error.message 
        }, { status: 500 })
    }
}
