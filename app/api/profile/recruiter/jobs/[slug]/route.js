import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/authHelper'

export async function GET(request, { params }) {
  try {
    const auth = await getCurrentUser(request)
    if (auth.error) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      )
    }

    const { user } = auth
    const { slug } = await params

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
            address: true,
            verified: true
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
        job_skills: {
          include: {
            skills: true
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

    // Verify ownership
    if (job.recruiterId !== recruiter.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Format response like admin API
    const formattedJob = {
      ...job,
      company: job.companies,
      recruiter: job.recruiters,
      skills: job.job_skills?.map(js => js.skills.name) || [],
      applicationCount: job._count?.applications || 0
    }

    delete formattedJob.companies
    delete formattedJob.recruiters
    delete formattedJob.job_skills
    delete formattedJob._count

    return NextResponse.json({
      success: true,
      job: formattedJob
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