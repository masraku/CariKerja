//app/api/profile/recruiter/jobs/[slug]/applications/my-applications/route.js
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireJobseeker } from '@/lib/authHelper'

// GET - Fetch all applications for logged-in jobseeker
export async function GET(request) {
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

    // Get query params for filtering
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const sortBy = searchParams.get('sortBy') || 'appliedAt'
    const order = searchParams.get('order') || 'desc'

    // Build where clause
    const whereClause = {
      jobseekerId: jobseeker.id
    }

    if (status && status !== 'ALL') {
      whereClause.status = status
    }

    // Fetch applications with job and company details
    const applications = await prisma.application.findMany({
      where: whereClause,
      include: {
        job: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                logo: true,
                city: true,
                industry: true
              }
            },
            recruiter: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        }
      },
      orderBy: {
        [sortBy]: order
      }
    })

    // Get statistics
    const stats = await prisma.application.groupBy({
      by: ['status'],
      where: { jobseekerId: jobseeker.id },
      _count: true
    })

    const statusCounts = {
      PENDING: 0,
      REVIEWING: 0,
      SHORTLISTED: 0,
      INTERVIEW_SCHEDULED: 0,
      INTERVIEW_COMPLETED: 0,
      ACCEPTED: 0,
      REJECTED: 0,
      WITHDRAWN: 0
    }

    stats.forEach(stat => {
      statusCounts[stat.status] = stat._count
    })

    return NextResponse.json({
      success: true,
      data: {
        applications,
        stats: statusCounts,
        total: applications.length
      }
    })

  } catch (error) {
    console.error('❌ Error fetching applications:', error)
    console.error('Error stack:', error.stack)
    return NextResponse.json(
      { 
        error: 'Failed to fetch applications',
        details: error.message,
        type: error.constructor.name
      },
      { status: 500 }
    )
  }
}