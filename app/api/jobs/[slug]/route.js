import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export async function GET(request, context) {
  try {
    const params = await context.params
    const { slug } = params

    // Check if user is authenticated - also check Authorization header
    let userId = null
    let userRole = null
    try {
      // First try cookies
      const cookieStore = await cookies()
      const cookieToken = cookieStore.get('token')
      
      // Also check Authorization header (for API calls from frontend)
      const authHeader = request.headers.get('authorization')
      const headerToken = authHeader?.replace('Bearer ', '')
      
      const token = cookieToken?.value || headerToken
      
      if (token) {
        const decoded = jwt.verify(token, JWT_SECRET)
        userId = decoded.userId
        userRole = decoded.role
      }
    } catch (error) {
      // Not authenticated, continue without user info
    }

    // Check if slug is actually an ID (numeric)
    const isNumericId = /^\d+$/.test(slug)
    
    // For authenticated recruiters, allow viewing any job (even inactive)
    // For public access, only show active published jobs
    const isRecruiter = userRole === 'RECRUITER'
    
    // Fetch job by slug or ID with all related data
    const job = await prisma.jobs.findFirst({
      where: isNumericId 
        ? { 
            id: parseInt(slug)
          }
        : isRecruiter
          ? { slug } // Recruiter can see any job by slug
          : { 
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
      gallery: job.companies.gallery || [], // Fallback to company gallery if job gallery empty? Wait, schema has job gallery now. Let's use job gallery.
      // Correction: job model has gallery now.
      gallery: job.gallery || [],
      photo: job.photo,
      workingDays: job.workingDays,
      holidays: job.holidays,
      isShift: job.isShift,
      shiftCount: job.shiftCount,
      isDisabilityFriendly: job.isDisabilityFriendly,
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
