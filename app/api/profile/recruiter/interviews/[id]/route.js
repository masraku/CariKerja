import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRecruiter } from '@/lib/authHelper'

// GET - Fetch interview details for recruiter
export async function GET(request, context) {
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

    // Fetch interview with all details
    const interview = await prisma.interview.findUnique({
      where: { id },
      include: {
        jobs: {
          include: {
            companies: {
              select: {
                id: true,
                name: true,
                logo: true,
                city: true
              }
            }
          }
        },
        participants: {
          include: {
            application: {
              include: {
                jobseekers: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    photo: true,
                    currentTitle: true,
                    city: true,
                    phone: true,
                    user: {
                      select: {
                        email: true
                      }
                    }
                  }
                }
              }
            }
          },
          orderBy: {
            invitedAt: 'asc'
          }
        }
      }
    })

    if (!interview) {
      return NextResponse.json(
        { error: 'Interview not found' },
        { status: 404 }
      )
    }

    // Check ownership
    if (interview.recruiterId !== recruiter.id) {
      return NextResponse.json(
        { error: 'Unauthorized. You can only view your own interviews.' },
        { status: 403 }
      )
    }

    // Transform participants data
    const participants = interview.participants.map(p => ({
      id: p.id,
      status: p.status,
      invitedAt: p.invitedAt,
      respondedAt: p.respondedAt,
      applicationId: p.applicationId,
      candidate: {
        id: p.application.jobseeker.id,
        name: `${p.application.jobseeker.firstName} ${p.application.jobseeker.lastName}`,
        firstName: p.application.jobseeker.firstName,
        lastName: p.application.jobseeker.lastName,
        photo: p.application.jobseeker.photo,
        currentTitle: p.application.jobseeker.currentTitle,
        city: p.application.jobseeker.city,
        phone: p.application.jobseeker.phone,
        email: p.application.jobseeker.user.email
      }
    }))

    // Calculate stats
    const stats = {
      total: participants.length,
      pending: participants.filter(p => p.status === 'PENDING').length,
      accepted: participants.filter(p => p.status === 'ACCEPTED').length,
      declined: participants.filter(p => p.status === 'DECLINED').length,
      completed: participants.filter(p => p.status === 'COMPLETED').length,
      noShow: participants.filter(p => p.status === 'NO_SHOW').length
    }

    return NextResponse.json({
      success: true,
      data: {
        interview: {
          id: interview.id,
          title: interview.title,
          scheduledAt: interview.scheduledAt,
          duration: interview.duration,
          meetingType: interview.meetingType,
          meetingUrl: interview.meetingUrl,
          location: interview.location,
          description: interview.description,
          notes: interview.notes,
          status: interview.status,
          createdAt: interview.createdAt,
          updatedAt: interview.updatedAt
        },
        jobs: {
          id: interview.job.id,
          title: interview.job.title,
          slug: interview.job.slug
        },
        company: interview.job.company,
        participants,
        stats
      }
    })

  } catch (error) {
    console.error('❌ Get interview details error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch interview details',
        details: error.message
      },
      { status: 500 }
    )
  }
}
