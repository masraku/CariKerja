// app/api/profile/recruiter/jobs/[slug]/schedule-interview/route.js

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function POST(request, { params }) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    const { slug } = await params
    const body = await request.json()
    const { applicationIds, interviewDate, interviewTime, duration, notes, meetingLink, title } = body

    console.log('📅 Scheduling interview for:', { slug, applicationIds })

    // Verify job ownership and get recruiter
    const job = await prisma.jobs.findUnique({
      where: { slug },
      include: {
        companies: {
          include: {
            recruiters: {
              where: { userId: decoded.userId }
            }
          }
        }
      }
    })

    if (!job || job.companies.recruiters.length === 0) {
      return NextResponse.json(
        { error: 'Job not found or unauthorized' },
        { status: 404 }
      )
    }

    const recruiter = job.companies.recruiters[0]

    // Combine date and time
    const interviewDateTime = new Date(`${interviewDate}T${interviewTime}`)
    
    console.log('📅 Interview scheduled for:', interviewDateTime)

    // Update all selected applications
    const updatePromises = applicationIds.map(async (appId) => {
      // First update application status
      const application = await prisma.applications.update({
        where: { id: appId },
        data: {
          status: 'INTERVIEW_SCHEDULED',
          interviewDate: interviewDateTime // ✅ Update interviewDate field
        },
        include: {
          jobseekers: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      })

      // Then create interview record
      const interview = await prisma.interviews.create({
        data: {
          recruiterId: recruiter.id,
          jobId: job.id,
          title: title || `Interview for ${job.title}`,
          scheduledAt: interviewDateTime,
          duration: parseInt(duration) || 60,
          meetingType: 'GOOGLE_MEET', // ✅ Fixed: use meetingType instead of interviewType
          meetingUrl: meetingLink,
          description: notes,
          status: 'SCHEDULED'
        }
      })

      return {
        application,
        interview
      }
    })

    const results = await Promise.all(updatePromises)

    console.log(`✅ Successfully scheduled interview for ${results.length} candidates`)

    // TODO: Send email notifications to candidates
    // You can add email service integration here

    return NextResponse.json({
      success: true,
      message: `Interview scheduled for ${results.length} candidates`,
      results
    })

  } catch (error) {
    console.error('❌ Schedule interview error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to schedule interview',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

// GET - Fetch applications for scheduling
export async function GET(request, { params }) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    const { slug } = await params
    const { searchParams } = new URL(request.url)
    const applicationIds = searchParams.get('applications')?.split(',') || []

    console.log('📋 Fetching applications for scheduling:', applicationIds)

    // Verify job ownership
    const job = await prisma.jobs.findUnique({
      where: { slug },
      include: {
        companies: {
          include: {
            recruiters: {
              where: { userId: decoded.userId }
            }
          }
        }
      }
    })

    if (!job || job.companies.recruiters.length === 0) {
      return NextResponse.json(
        { error: 'Job not found or unauthorized' },
        { status: 404 }
      )
    }

    // Get applications
    const applications = await prisma.applications.findMany({
      where: {
        id: { in: applicationIds },
        jobId: job.id
      },
      include: {
        jobseekers: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            photo: true,
            currentTitle: true
          }
        }
      }
    })

    console.log(`✅ Found ${applications.length} applications`)

    return NextResponse.json({
      success: true,
      jobs: {
        id: job.id,
        slug: job.slug,
        title: job.title,
        company: job.companies.name
      },
      applications
    })

  } catch (error) {
    console.error('❌ Get applications error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    )
  }
}