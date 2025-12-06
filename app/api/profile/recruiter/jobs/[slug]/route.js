//app/api/profile/recruiter/jobs/[slug]/route.js
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/authHelper'

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

export async function DELETE(request, { params }) {
  try {
    const { slug } = await params

    // Authenticate user
    const auth = await getCurrentUser(request)
    if (auth.error) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      )
    }

    const { user } = auth

    // Check if user is recruiter
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

    // Find the job
    const job = await prisma.jobs.findUnique({
      where: { slug }
    })

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    // Check if the recruiter owns this job
    if (job.recruiterId !== recruiter.id) {
      return NextResponse.json(
        { error: 'You can only delete your own job postings' },
        { status: 403 }
      )
    }

    // Delete the job (cascade will handle related records)
    await prisma.jobs.delete({
      where: { id: job.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Lowongan berhasil dihapus'
    })

  } catch (error) {
    console.error('Delete job error:', error)
    return NextResponse.json(
      { error: 'Gagal menghapus lowongan. Silakan coba lagi.' },
      { status: 500 }
    )
  }
}