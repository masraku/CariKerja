import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { prisma } from '@/lib/prisma'
import { createErrorResponse } from '@/lib/errorHandler'
import { requireRecruiter } from '@/lib/authHelper'
import { sendInterviewInvitation } from '@/lib/email/sendInterviewInvitation'

function parseScheduledAt({ scheduledAt, date, time }) {
    if (scheduledAt) return new Date(scheduledAt)
    if (date && time) return new Date(`${date}T${time}:00+07:00`)
    return null
}

// POST - Create interview schedule (supports multiple candidates)
export async function POST(request) {
    try {
        // Authenticate
        const auth = await requireRecruiter(request)
        if (auth.error) {
            return NextResponse.json({ error: auth.error }, { status: auth.status })
        }

        const { recruiter } = auth
        const body = await request.json()
        const {
            applicationIds,
            applicationId,
            jobId,
            title,
            scheduledAt,
            date,
            time,
            duration,
            meetingType,
            meetingUrl,
            location,
            description,
            notes
        } = body

        // Support both single and multiple application IDs  
        const rawAppIds = Array.isArray(applicationIds) ? applicationIds : [applicationIds || applicationId]
        const appIds = [...new Set(rawAppIds.filter(Boolean))]
        const normalizedMeetingType = meetingType === 'IN_PERSON' ? 'IN_PERSON' : 'ONLINE'
        const parsedDuration = parseInt(duration) || 60
        const parsedScheduledAt = parseScheduledAt({ scheduledAt, date, time })

        // Validate required fields
        if (!appIds.length || !jobId || !parsedScheduledAt || Number.isNaN(parsedScheduledAt.getTime())) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        if (parsedScheduledAt < new Date()) {
            return NextResponse.json(
                { error: 'Jadwal interview tidak boleh berada di masa lalu' },
                { status: 400 }
            )
        }

        if (normalizedMeetingType === 'ONLINE' && !meetingUrl) {
            return NextResponse.json(
                { error: 'Link meeting wajib diisi untuk interview online' },
                { status: 400 }
            )
        }

        if (normalizedMeetingType === 'IN_PERSON' && !location) {
            return NextResponse.json(
                { error: 'Lokasi wajib diisi untuk interview tatap muka' },
                { status: 400 }
            )
        }

        const job = await prisma.jobs.findFirst({
            where: {
                id: jobId,
                recruiterId: recruiter.id
            },
            include: {
                companies: true
            }
        })

        if (!job) {
            return NextResponse.json(
                { error: 'Lowongan tidak ditemukan atau tidak diizinkan' },
                { status: 404 }
            )
        }

        // Get all applications details
        const applications = await prisma.applications.findMany({
            where: { 
                id: { in: appIds },
                jobId,
                jobs: { recruiterId: recruiter.id } // Security: ensure recruiter owns the job
            },
            include: {
                jobseekers: {
                    include: {
                        users: true
                    }
                },
                jobs: {
                    include: {
                        companies: true
                    }
                }
            }
        })

        if (applications.length === 0) {
            return NextResponse.json(
                { error: 'No valid applications found' },
                { status: 404 }
            )
        }

        if (applications.length !== appIds.length) {
            return NextResponse.json(
                { error: 'Beberapa lamaran tidak ditemukan atau bukan milik lowongan ini' },
                { status: 400 }
            )
        }

        // Get job title from first application (all should be same job)
        const jobTitle = job.title
        const companyName = job.companies.name

        // Check for existing active interviews for these applications
        const existingParticipants = await prisma.interview_participants.findMany({
            where: {
                applicationId: { in: appIds },
                interviews: {
                    status: { in: ['SCHEDULED', 'RESCHEDULED'] } // Include legacy rescheduled rows as active
                }
            },
            include: {
                applications: {
                    include: {
                        jobseekers: true
                    }
                },
                interviews: true
            }
        })

        if (existingParticipants.length > 0) {
            const duplicateNames = existingParticipants.map(p => 
                `${p.applications.jobseekers.firstName} ${p.applications.jobseekers.lastName}`
            ).join(', ')
            
            return NextResponse.json(
                { 
                    error: `Interview already scheduled for: ${duplicateNames}. Please cancel or reschedule the existing interview first.`,
                    duplicates: existingParticipants.map(p => ({
                        candidateName: `${p.applications.jobseekers.firstName} ${p.applications.jobseekers.lastName}`,
                        interviewId: p.interviewId,
                        scheduledAt: p.interviews.scheduledAt
                    }))
                },
                { status: 409 } // Conflict
            )
        }

        // Create single interview for all candidates (group interview)
        const interview = await prisma.interviews.create({
            data: {
                id: randomUUID(),
                recruiterId: recruiter.id,
                jobId: jobId,
                title: title || `Interview - ${jobTitle}${applications.length > 1 ? ` (${applications.length} kandidat)` : ''}`,
                scheduledAt: parsedScheduledAt,
                duration: parsedDuration,
                meetingType: normalizedMeetingType,
                meetingUrl: normalizedMeetingType === 'ONLINE' ? meetingUrl : null,
                location: normalizedMeetingType === 'IN_PERSON' ? location : null,
                description: description || '',
                notes: notes || null,
                status: 'SCHEDULED',
                updatedAt: new Date()
            }
        })

        // Create interview participants and send emails
        const emailPromises = []
        const participantPromises = []

        for (const application of applications) {
            // Create participant
            participantPromises.push(
                prisma.interview_participants.create({
                    data: {
                        id: randomUUID(),
                        interviewId: interview.id,
                        applicationId: application.id,
                        status: 'PENDING', // Waiting for jobseeker response
                        updatedAt: new Date()
                    }
                })
            )

            // Update application status
            participantPromises.push(
                prisma.applications.update({
                    where: { id: application.id },
                    data: {
                        status: 'INTERVIEW_SCHEDULED',
                        interviewDate: parsedScheduledAt,
                        updatedAt: new Date()
                    }
                })
            )

            // Send email invitation
            emailPromises.push(
                sendInterviewInvitation({
                    to: application.jobseekers.users.email,
                    jobseekerName: `${application.jobseekers.firstName} ${application.jobseekers.lastName}`,
                    jobTitle: jobTitle,
                    companyName: companyName,
                    scheduledAt: parsedScheduledAt,
                    duration: parsedDuration,
                    meetingType: normalizedMeetingType,
                    meetingUrl: normalizedMeetingType === 'ONLINE' ? meetingUrl : null,
                    location: normalizedMeetingType === 'IN_PERSON' ? location : null,
                    description: description,
                    interviewId: interview.id
                }).catch(error => {
                    return { success: false, email: application.jobseekers.users.email, error }
                })
            )
        }

        // Wait for all database operations
        await Promise.all(participantPromises)

        // Send all emails (don't wait for these to complete)
        Promise.all(emailPromises).then(results => {
            const successful = results.filter(r => r?.success).length
            const failed = results.filter(r => !r?.success).length
            void successful
            void failed
        })

        return NextResponse.json({
            success: true,
            data: {
                interview,
                candidatesCount: applications.length,
                message: `Interview scheduled for ${applications.length} candidate(s)`
            }
        })

    } catch (error) {
        return NextResponse.json(
            createErrorResponse('Gagal menjadwalkan interview', error),
            { status: 500 }
        )
    }
}
