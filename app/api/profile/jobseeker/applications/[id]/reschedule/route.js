import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function POST(request, { params }) {
    try {
        const token = request.headers.get('authorization')?.replace('Bearer ', '')
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const decoded = verifyToken(token)
        const { id } = await params
        const { reason } = await request.json()

        if (!reason || !reason.trim()) {
            return NextResponse.json(
                { error: 'Alasan reschedule wajib diisi' },
                { status: 400 }
            )
        }

        // Get jobseeker
        const jobseeker = await prisma.jobseekers.findUnique({
            where: { userId: decoded.userId },
            select: { id: true, firstName: true, lastName: true, email: true }
        })

        if (!jobseeker) {
            return NextResponse.json(
                { error: 'Jobseeker tidak ditemukan' },
                { status: 404 }
            )
        }

        // Get application and verify ownership
        const application = await prisma.applications.findFirst({
            where: {
                id: id,
                jobseekerId: jobseeker.id
            },
            include: {
                jobs: {
                    include: {
                        companies: true,
                        recruiters: {
                            select: {
                                id: true,
                                userId: true
                            }
                        }
                    }
                }
            }
        })

        if (!application) {
            return NextResponse.json(
                { error: 'Lamaran tidak ditemukan' },
                { status: 404 }
            )
        }

        // Check if application has interview scheduled
        if (application.status !== 'INTERVIEW_SCHEDULED') {
            return NextResponse.json(
                { error: 'Hanya dapat request reschedule untuk interview yang sudah dijadwalkan' },
                { status: 400 }
            )
        }

        // Get recruiter user ID for notification
        const recruiterUserId = application.jobs.recruiters?.userId

        if (!recruiterUserId) {
            return NextResponse.json(
                { error: 'Recruiter tidak ditemukan' },
                { status: 404 }
            )
        }

        // Create notification for recruiter
        await prisma.notifications.create({
            data: {
                id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                userId: recruiterUserId,
                type: 'APPLICATION_UPDATE',
                title: '📅 Request Reschedule Interview',
                message: `${jobseeker.firstName} ${jobseeker.lastName} meminta perubahan jadwal interview untuk posisi ${application.jobs.title}. Alasan: ${reason}`,
                link: `/profile/recruiter/dashboard/interviews`,
                actionUrl: `/profile/recruiter/dashboard/interviews`,
                metadata: {
                    applicationId: application.id,
                    jobTitle: application.jobs.title,
                    jobseekerName: `${jobseeker.firstName} ${jobseeker.lastName}`,
                    reason: reason,
                    type: 'reschedule_request'
                }
            }
        })

        // Find and update interview participant status to RESCHEDULE_REQUESTED
        const participant = await prisma.interview_participants.findFirst({
            where: {
                applicationId: application.id
            }
        })

        if (participant) {
            await prisma.interview_participants.update({
                where: { id: participant.id },
                data: {
                    status: 'RESCHEDULE_REQUESTED',
                    responseMessage: reason,
                    respondedAt: new Date()
                }
            })
        }

        // Update application with reschedule request note
        await prisma.applications.update({
            where: { id: application.id },
            data: {
                recruiterNotes: application.recruiterNotes 
                    ? `${application.recruiterNotes}\n\n[RESCHEDULE REQUEST - ${new Date().toLocaleString('id-ID')}]\n${reason}`
                    : `[RESCHEDULE REQUEST - ${new Date().toLocaleString('id-ID')}]\n${reason}`
            }
        })

        return NextResponse.json({
            success: true,
            message: 'Request reschedule berhasil dikirim'
        })

    } catch (error) {
        return NextResponse.json(
            { error: error.message || 'Gagal mengirim request reschedule' },
            { status: 500 }
        )
    }
}
