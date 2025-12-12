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
    const interview = await prisma.interviews.findUnique({
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
        interview_participants: {
          include: {
            applications: {
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
                    users: {
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
    const participants = interview.interview_participants.map(p => ({
      id: p.id,
      status: p.status,
      invitedAt: p.invitedAt,
      respondedAt: p.respondedAt,
      applicationId: p.applicationId,
      candidate: {
        id: p.applications.jobseekers.id,
        name: `${p.applications.jobseekers.firstName} ${p.applications.jobseekers.lastName}`,
        firstName: p.applications.jobseekers.firstName,
        lastName: p.applications.jobseekers.lastName,
        photo: p.applications.jobseekers.photo,
        currentTitle: p.applications.jobseekers.currentTitle,
        city: p.applications.jobseekers.city,
        phone: p.applications.jobseekers.phone,
        email: p.applications.jobseekers.users.email
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
          id: interview.jobs?.id,
          title: interview.jobs?.title,
          slug: interview.jobs?.slug
        },
        company: interview.jobs?.companies,
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

// DELETE - Delete interview and auto-reject applications
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

    // Get interview with participants
    const interview = await prisma.interviews.findUnique({
      where: { id },
      include: {
        interview_participants: {
          include: {
            applications: true
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
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Update all related applications to REJECTED
    const applicationIds = interview.interview_participants.map(p => p.applicationId)
    
    if (applicationIds.length > 0) {
      await prisma.applications.updateMany({
        where: {
          id: { in: applicationIds }
        },
        data: {
          status: 'REJECTED',
          recruiterNotes: 'Interview dibatalkan oleh recruiter'
        }
      })
    }

    // Update interview status to CANCELLED
    await prisma.interviews.update({
      where: { id },
      data: {
        status: 'CANCELLED'
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Interview deleted and applications rejected',
      rejectedCount: applicationIds.length
    })

  } catch (error) {
    console.error('❌ Delete interview error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to delete interview',
        details: error.message
      },
      { status: 500 }
    )
  }
}
