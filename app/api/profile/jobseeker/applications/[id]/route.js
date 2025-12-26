import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireJobseeker } from '@/lib/authHelper'

export async function GET(request, context) {
  try {
    const params = await context.params
    const { id } = params

    // Authenticate user
    const auth = await requireJobseeker(request)
    
    if (auth.error) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      )
    }

    const { jobseeker } = auth

    // Fetch application with full details
    let application = await prisma.applications.findUnique({
      where: { 
        id,
        jobseekerId: jobseeker.id // Ensure user owns this application
      },
      include: {
        jobs: {
          include: {
            companies: {
              select: {
                id: true,
                name: true,
                logo: true,
                city: true,
                province: true,
                industry: true
              }
            },
            recruiters: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                position: true
              }
            }
          }
        },
        // Include interview participant to get interview ID
        interview_participants: {
          include: {
            interviews: {
              select: {
                id: true,
                scheduledAt: true,
                status: true,
                duration: true,
                title: true,
                description: true,
                meetingType: true,
                meetingUrl: true
              }
            }
          }
        }
      }
    })

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    // --- AUTO-CHECK: Update status if 24 hours have passed since interview ---
    if (application.status === 'INTERVIEW_SCHEDULED') {
      const participant = application.interview_participants?.[0]
      const interview = participant?.interviews
      
      if (interview?.scheduledAt) {
        const now = new Date()
        const interviewTime = new Date(interview.scheduledAt)
        const hoursSinceInterview = (now - interviewTime) / (1000 * 60 * 60)
        
        // If 24 hours have passed since interview time
        if (hoursSinceInterview >= 24) {
          console.log(`🔄 Auto-completing interview for application ${id} (${hoursSinceInterview.toFixed(1)}h since interview)`)
          
          // Update application and participant status
          await prisma.$transaction([
            prisma.applications.update({
              where: { id: application.id },
              data: { status: 'INTERVIEW_COMPLETED' }
            }),
            ...(participant ? [
              prisma.interview_participants.update({
                where: { id: participant.id },
                data: { status: 'INTERVIEW_COMPLETED' }
              })
            ] : [])
          ])
          
          // Refresh application data
          application = await prisma.applications.findUnique({
            where: { id },
            include: {
              jobs: {
                include: {
                  companies: {
                    select: {
                      id: true,
                      name: true,
                      logo: true,
                      city: true,
                      province: true,
                      industry: true
                    }
                  },
                  recruiters: {
                    select: {
                      id: true,
                      firstName: true,
                      lastName: true,
                      position: true
                    }
                  }
                }
              },
              interview_participants: {
                include: {
                  interviews: {
                    select: {
                      id: true,
                      scheduledAt: true,
                      status: true,
                      duration: true,
                      title: true,
                      description: true,
                      meetingType: true,
                      meetingUrl: true
                    }
                  }
                }
              }
            }
          })
        }
      }
    }
    // --- END AUTO-CHECK ---

    return NextResponse.json({
      success: true,
      data: {
        ...application,
        interview: application.interview_participants?.[0]?.interviews || null
      }
    })

  } catch (error) {
    console.error('Error fetching application detail:', error)
    return NextResponse.json(
      { error: 'Failed to fetch application details' },
      { status: 500 }
    )
  }
}
