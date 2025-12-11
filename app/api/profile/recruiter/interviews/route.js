import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRecruiter } from '@/lib/authHelper'
import { sendInterviewInvitation } from '@/lib/email/sendInterviewInvitation'

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
        const { applicationIds, jobId, scheduledAt, duration, meetingUrl, description } = body

        // Support both single and multiple application IDs  
        const appIds = Array.isArray(applicationIds) ? applicationIds : [applicationIds || body.applicationId]

        // Validate required fields
        if (!appIds.length || !jobId || !scheduledAt || !meetingUrl) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Get all applications details
        const applications = await prisma.applications.findMany({
            where: { 
                id: { in: appIds },
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

        // Get job title from first application (all should be same job)
        const jobTitle = applications[0].jobs.title
        const companyName = applications[0].jobs.companies.name

        // Check for existing active interviews for these applications
        const existingParticipants = await prisma.interview_participants.findMany({
            where: {
                applicationId: { in: appIds },
                interviews: {
                    status: { in: ['SCHEDULED', 'RESCHEDULED'] } // Only check active interviews
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
                recruiterId: recruiter.id,
                jobId: jobId,
                title: `Interview - ${jobTitle}${applications.length > 1 ? ` (${applications.length} kandidat)` : ''}`,
                scheduledAt: new Date(scheduledAt),
                duration: duration || 60,
                meetingType: 'GOOGLE_MEET',
                meetingUrl: meetingUrl,
                description: description || '',
                status: 'SCHEDULED'
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
                        interviewId: interview.id,
                        applicationId: application.id,
                        status: 'PENDING' // Waiting for jobseeker response
                    }
                })
            )

            // Update application status
            participantPromises.push(
                prisma.applications.update({
                    where: { id: application.id },
                    data: { status: 'INTERVIEW_SCHEDULED' }
                })
            )

            // Send email invitation
            emailPromises.push(
                sendInterviewInvitation({
                    to: application.jobseekers.users.email,
                    jobseekerName: `${application.jobseekers.firstName} ${application.jobseekers.lastName}`,
                    jobTitle: jobTitle,
                    companyName: companyName,
                    scheduledAt: scheduledAt,
                    duration: duration || 60,
                    meetingUrl: meetingUrl,
                    description: description,
                    interviewId: interview.id
                }).catch(error => {
                    console.error(`Failed to send email to ${application.jobseekers.users.email}:`, error)
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
            console.log(`📧 Email results: ${successful} sent, ${failed} failed`)
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
        console.error('Create interview error:', error)
        return NextResponse.json(
            { error: 'Failed to schedule interview', details: error.message },
            { status: 500 }
        )
    }
}
