import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireJobseeker } from '@/lib/authHelper'


// GET - Fetch single application detail
export async function GET(request, { params }) {
  try {
    // Authenticate user
    const auth = await requireJobseeker(request)
    
    if (auth.error) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      )
    }

    const { jobseeker } = auth
    const { id } = await params

    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        job: {
          include: {
            company: true,
            recruiter: {
              select: {
                firstName: true,
                lastName: true,
                position: true
              }
            },
            skills: {
              include: {
                skill: true
              }
            }
          }
        },
        jobseeker: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true
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

    // Verify ownership
    if (application.jobseekerId !== jobseeker.id) {
      return NextResponse.json(
        { error: 'Unauthorized access to this application' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      data: application
    })

  } catch (error) {
    console.error('Error fetching application:', error)
    return NextResponse.json(
      { error: 'Failed to fetch application' },
      { status: 500 }
    )
  }
}