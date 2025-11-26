//app/api/profile/recruiter/jobs/[slug]/route.js
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request, { params }) {
  try {
    const { slug } = await params

    // Get job with all related data
    const job = await prisma.jobs.findUnique({
      where: { slug },
      include: {
        companies: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
            tagline: true,
            description: true,
            industry: true,
            companySize: true,
            website: true,
            city: true,
            province: true,
            address: true
          }
        },
        recruiters: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            position: true
          }
        },
        skills: {
          include: {
            skill: true
          }
        },
        _count: {
          select: {
            applications: true
          }
        }
      }
    })

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    // Check if job is still active
    if (!job.isActive) {
      return NextResponse.json(
        { error: 'This job posting is no longer active' },
        { status: 410 }
      )
    }

    // Increment view count
    await prisma.jobs.update({
      where: { id: job.id },
      data: {
        viewCount: {
          increment: 1
        }
      }
    })

    // Get other jobs from same company (related jobs)
    const relatedJobs = await prisma.jobs.findMany({
      where: {
        companyId: job.companyId,
        isActive: true,
        id: { not: job.id }
      },
      take: 3,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        title: true,
        slug: true,
        location: true,
        city: true,
        jobType: true,
        salaryMin: true,
        salaryMax: true,
        salaryType: true,
        showSalary: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      success: true,
      job,
      relatedJobs
    })

  } catch (error) {
    console.error('Get job by slug error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch job details' },
      { status: 500 }
    )
  }
}