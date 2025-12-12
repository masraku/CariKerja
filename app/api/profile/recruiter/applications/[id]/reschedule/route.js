import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRecruiter } from '@/lib/authHelper'

export async function POST(request, context) {
    try {
        const params = await context.params
        const { id } = params

        // Authenticate recruiter
        const auth = await requireRecruiter(request)
        
        if (auth.error) {
            return NextResponse.json(
                { error: auth.error },
                { status: auth.status }
            )
        }

        const { recruiter } = auth
        const { newDateTime, meetingUrl } = await request.json()

        if (!newDateTime) {
            return NextResponse.json(
                { error: 'Tanggal dan waktu baru wajib diisi' },
                { status: 400 }
            )
        }

        // Verify application exists and belongs to recruiter's company
        const application = await prisma.applications.findFirst({
            where: {
                id,
                jobs: {
                    companyId: recruiter.companyId
                }
            },
            include: {
                jobs: {
                    select: {
                        id: true,
                        title: true,
                        slug: true
                    }
                },
                jobseekers: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        userId: true,
                        email: true
                    }
                },
                interview_participants: {
                    include: {
                        interviews: true
                    }
                }
            }
        })

        if (!application) {
            return NextResponse.json(
                { error: 'Lamaran tidak ditemukan atau Anda tidak memiliki akses' },
                { status: 404 }
            )
        }

        if (application.status !== 'INTERVIEW_SCHEDULED') {
            return NextResponse.json(
                { error: 'Hanya dapat reschedule interview yang sudah dijadwalkan' },
                { status: 400 }
            )
        }

        // Get existing interview
        const existingInterview = application.interview_participants?.[0]?.interviews

        if (!existingInterview) {
            return NextResponse.json(
                { error: 'Interview tidak ditemukan' },
                { status: 404 }
            )
        }

        // Update interview schedule
        await prisma.interviews.update({
            where: { id: existingInterview.id },
            data: {
                scheduledAt: new Date(newDateTime),
                meetingUrl: meetingUrl || existingInterview.meetingUrl
            }
        })

        // Clear reschedule request from recruiterNotes
        const updatedNotes = application.recruiterNotes
            ? application.recruiterNotes.replace(/\n?\n?\[RESCHEDULE REQUEST - [^\]]+\]\n[^\[]+/g, '').trim()
            : null

        await prisma.applications.update({
            where: { id: application.id },
            data: {
                recruiterNotes: updatedNotes || null
            }
        })

        // Create notification for jobseeker
        await prisma.notifications.create({
            data: {
                id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                userId: application.jobseekers.userId,
                type: 'INTERVIEW_SCHEDULED',
                title: '📅 Jadwal Interview Diperbarui',
                message: `Jadwal interview untuk posisi ${application.jobs.title} telah diubah ke ${new Date(newDateTime).toLocaleDateString('id-ID', { 
                    weekday: 'long', 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })} WIB`,
                link: `/profile/jobseeker/applications/${application.id}`,
                actionUrl: `/profile/jobseeker/applications/${application.id}`,
                metadata: {
                    applicationId: application.id,
                    jobTitle: application.jobs.title,
                    newScheduledAt: newDateTime,
                    type: 'interview_rescheduled'
                }
            }
        })

        return NextResponse.json({
            success: true,
            message: 'Jadwal interview berhasil diperbarui'
        })

    } catch (error) {
        console.error('Reschedule interview error:', error)
        return NextResponse.json(
            { error: error.message || 'Gagal memperbarui jadwal interview' },
            { status: 500 }
        )
    }
}

// DELETE - Reject reschedule request
export async function DELETE(request, context) {
    try {
        const params = await context.params
        const { id } = params

        // Authenticate recruiter
        const auth = await requireRecruiter(request)
        
        if (auth.error) {
            return NextResponse.json(
                { error: auth.error },
                { status: auth.status }
            )
        }

        const { recruiter } = auth
        const { reason } = await request.json()

        // Verify application exists and belongs to recruiter's company
        const application = await prisma.applications.findFirst({
            where: {
                id,
                jobs: {
                    companyId: recruiter.companyId
                }
            },
            include: {
                jobs: {
                    select: {
                        id: true,
                        title: true,
                        slug: true
                    }
                },
                jobseekers: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        userId: true,
                        email: true
                    }
                },
                interview_participants: {
                    include: {
                        interviews: true
                    }
                }
            }
        })

        if (!application) {
            return NextResponse.json(
                { error: 'Lamaran tidak ditemukan atau Anda tidak memiliki akses' },
                { status: 404 }
            )
        }

        // Get existing interview for date info
        const existingInterview = application.interview_participants?.[0]?.interviews

        // Clear reschedule request from recruiterNotes
        const updatedNotes = application.recruiterNotes
            ? application.recruiterNotes.replace(/\n?\n?\[RESCHEDULE REQUEST - [^\]]+\]\n[^\[]+/g, '').trim()
            : null

        await prisma.applications.update({
            where: { id: application.id },
            data: {
                recruiterNotes: updatedNotes || null
            }
        })

        // Create notification for jobseeker
        const interviewDate = existingInterview?.scheduledAt 
            ? new Date(existingInterview.scheduledAt).toLocaleDateString('id-ID', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
            : 'jadwal yang sudah ditentukan'

        await prisma.notifications.create({
            data: {
                id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                userId: application.jobseekers.userId,
                type: 'APPLICATION_UPDATE',
                title: '❌ Request Reschedule Ditolak',
                message: `Request reschedule interview untuk posisi ${application.jobs.title} tidak dapat diproses. Interview tetap dilaksanakan pada ${interviewDate} WIB.${reason ? ` Alasan: ${reason}` : ''}`,
                link: `/profile/jobseeker/applications/${application.id}`,
                actionUrl: `/profile/jobseeker/applications/${application.id}`,
                metadata: {
                    applicationId: application.id,
                    jobTitle: application.jobs.title,
                    type: 'reschedule_rejected',
                    reason: reason || null
                }
            }
        })

        return NextResponse.json({
            success: true,
            message: 'Request reschedule berhasil ditolak'
        })

    } catch (error) {
        console.error('Reject reschedule error:', error)
        return NextResponse.json(
            { error: error.message || 'Gagal menolak request reschedule' },
            { status: 500 }
        )
    }
}
