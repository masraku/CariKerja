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
    const application = await prisma.application.findUnique({
      where: { 
        id,
        jobseekerId: jobseeker.id // Ensure user owns this application
      },
      include: {
        job: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                logo: true,
                city: true,
                province: true,
                industry: true
              }
            },
            recruiter: {
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
        interviewParticipants: {
          include: {
            interview: {
              select: {
                id: true,
                scheduledAt: true,
                status: true
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

    return NextResponse.json({
      success: true,
      data: {
        ...application,
        interview: application.interviewParticipants?.[0]?.interview || null
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
