import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export async function GET(request, context) {
  try {
    const params = await context.params
    const { slug } = params

    console.log('🔍 Fetching job with slug:', slug)

    // Check if user is authenticated
    let userId = null
    let userRole = null
    try {
      const cookieStore = await cookies()
      const token = cookieStore.get('token')
      if (token) {
        const decoded = jwt.verify(token.value, JWT_SECRET)
        userId = decoded.userId
        userRole = decoded.role
      }
    } catch (error) {
      // Not authenticated, continue without user info
    }

    // Fetch job by slug with all related data
    const job = await prisma.jobs.findFirst({
      where: { 
        slug,
        isActive: true,
        publishedAt: { not: null }
      },
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
            city: true,
            province: true,
            website: true,
            benefits: true,
            gallery: true,
            rating: true,
            totalReviews: true
          }
        },
        job_skills: {
          include: {
            skills: true
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
        _count: {
          select: {
            applications: true
          }
        }
      }
    })

    if (!job) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Job not found' 
        },
        { status: 404 }
      )
    }

    // Check if user has already applied (only for jobseekers)
    let hasApplied = false
    let existingApplication = null
    if (userId && userRole === 'JOBSEEKER') {
      const user = await prisma.users.findUnique({
        where: { id: userId },
        include: { jobseekers: true }
      })

      if (user?.jobseekers) {
        existingApplication = await prisma.applications.findUnique({
          where: {
            jobId_jobseekerId: {
              jobId: job.id,
              jobseekerId: user.jobseekers.id
            }
          },
          select: {
            id: true,
            status: true,
            appliedAt: true
          }
        })
        hasApplied = !!existingApplication
      }
    }

    // Increment view count
    await prisma.jobs.update({
      where: { id: job.id },
      data: { viewCount: { increment: 1 } }
    })

    // Transform data for frontend
    const transformedJob = {
      id: job.id,
      slug: job.slug,
      title: job.title,
      description: job.description,
      requirements: job.requirements,
      responsibilities: job.responsibilities,
      category: job.category,
      jobType: job.jobType,
      level: job.level,
      location: job.location,
      city: job.city,
      province: job.province,
      isRemote: job.isRemote,
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
      showSalary: job.showSalary,
      salaryType: job.salaryType,
      benefits: job.benefits,
      numberOfPositions: job.numberOfPositions,
      minExperience: job.minExperience,
      maxExperience: job.maxExperience,
      educationLevel: job.educationLevel,
      applicationDeadline: job.applicationDeadline,
      applicationEmail: job.applicationEmail,
      externalApply: job.externalApply,
      isFeatured: job.isFeatured,
      isPremium: job.isPremium,
      viewCount: job.viewCount,
      applicationCount: job._count.applications,
      publishedAt: job.publishedAt,
      company: job.companies,
      skills: job.job_skills.map(js => ({
        id: js.skills.id,
        name: js.skills.name,
        isRequired: js.isRequired
      })),
      recruiter: job.recruiters,
      hasApplied,
      existingApplication
    }

    console.log('✅ Job loaded, hasApplied:', hasApplied)

    return NextResponse.json({
      success: true,
      data: transformedJob
    })

  } catch (error) {
    console.error('Get job detail error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch job details',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
