//app/api/profile/recruiter/jobs/[slug]/applications/batch/route.js
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/authHelper'

export async function GET(request) {
  try {
    const auth = await getCurrentUser(request)
    
    if (auth.error) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      )
    }

    const { user } = auth

    if (user.role !== 'RECRUITER') {
      return NextResponse.json(
        { error: 'Access denied. Recruiter role required' },
        { status: 403 }
      )
    }

    // Get recruiter profile
    const recruiter = await prisma.recruiters.findUnique({
      where: { userId: user.id }
    })

    if (!recruiter) {
      return NextResponse.json(
        { error: 'Recruiter profile not found' },
        { status: 404 }
      )
    }

    // Get application IDs from query params
    const { searchParams } = new URL(request.url)
    const idsParam = searchParams.get('ids')

    if (!idsParam) {
      return NextResponse.json(
        { error: 'Missing application IDs' },
        { status: 400 }
      )
    }

    const ids = idsParam.split(',')

    console.log('📋 Fetching applications:', ids)

    // Get applications
    const applications = await prisma.applications.findMany({
      where: {
        id: { in: ids }
      },
      include: {
        jobseekers: {
          include: {
            user: {
              select: {
                email: true
              }
            }
          }
        },
        jobs: {
          include: {
            recruiter: true,
            company: true
          }
        }
      }
    })

    // Verify all applications belong to this recruiter
    const invalidApplications = applications.filter(
      app => app.jobs.recruiterId !== recruiter.id
    )

    if (invalidApplications.length > 0) {
      return NextResponse.json(
        { error: 'Access denied. Some applications do not belong to you' },
        { status: 403 }
      )
    }

    console.log(`✅ Found ${applications.length} applications`)

    return NextResponse.json({
      success: true,
      applications
    })

  } catch (error) {
    console.error('❌ Get batch applications error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    )
  }
}