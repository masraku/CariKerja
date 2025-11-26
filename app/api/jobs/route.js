import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Check if user is authenticated
    let userId = null
    let userRole = null
    let jobseekerId = null
    
    try {
      const cookieStore = await cookies()
      const token = cookieStore.get('token')
      if (token) {
        const decoded = jwt.verify(token.value, JWT_SECRET)
        userId = decoded.userId
        userRole = decoded.role
        
        // Get jobseeker ID if user is jobseeker
        if (userRole === 'JOBSEEKER') {
          const user = await prisma.users.findUnique({
            where: { id: userId },
            include: { jobseeker: true }
          })
          jobseekerId = user?.jobseeker?.id
        }
      }
    } catch (error) {
      // Not authenticated, continue without user info
    }
    
    // Get query parameters
    const search = searchParams.get('search') || ''
    const location = searchParams.get('location') || ''
    const jobType = searchParams.get('jobType') || ''
    const category = searchParams.get('category') || ''
    const experience = searchParams.get('experience') || ''
    const sortBy = searchParams.get('sortBy') || 'latest'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Build where clause
    const where = {
      isActive: true,
      publishedAt: { not: null }
    }

    // Search filter (search in title, description, or company name)
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
        { companies: { name: { contains: search, mode: 'insensitive' } } }
      ]
    }

    // Location filter
    if (location) {
      where.OR = [
        { city: { contains: location, mode: 'insensitive' } },
        { location: { contains: location, mode: 'insensitive' } },
        { province: { contains: location, mode: 'insensitive' } }
      ]
    }

    // Job type filter
    if (jobType) {
      const types = jobType.split(',')
      where.jobType = { in: types }
    }

    // Category filter
    if (category) {
      const categories = category.split(',')
      where.category = { in: categories }
    }

    // Experience filter (simplified - you may need to adjust based on your needs)
    if (experience) {
      const expLevels = experience.split(',')
      // Map experience levels to years
      const minYears = expLevels.map(exp => {
        if (exp === '0-1 tahun') return 0
        if (exp === '1-3 tahun') return 1
        if (exp === '3-5 tahun') return 3
        if (exp === '5+ tahun') return 5
        return 0
      })
      where.minExperience = { in: minYears }
    }

    // Sorting
    let orderBy = {}
    switch (sortBy) {
      case 'latest':
        orderBy = { publishedAt: 'desc' }
        break
      case 'salary':
        orderBy = { salaryMax: 'desc' }
        break
      case 'popular':
        orderBy = { applicationCount: 'desc' }
        break
      default:
        orderBy = { publishedAt: 'desc' }
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Fetch jobs with related data
    const [jobs, totalCount] = await Promise.all([
      prisma.jobs.findMany({
        where,
        include: {
        companies: {
          select: {
            id: true,
            name: true,
            logo: true,
            city: true,
            industry: true
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
      },
      orderBy,
      skip,
      take: limit
    }),
    prisma.jobs.count({ where })
  ])

  // Transform data for frontend
  const transformedJobs = await Promise.all(jobs.map(async (job) => {
    // Check if user has applied to this job
    let hasApplied = false
    if (jobseekerId) {
      const existingApplication = await prisma.applications.findUnique({
        where: {
          jobId_jobseekerId: {
            jobId: job.id,
            jobseekerId: jobseekerId
          }
        },
        select: {
          id: true,
          status: true
        }
      })
      hasApplied = !!existingApplication
    }
    
    return {
      id: job.id,
      slug: job.slug,
      title: job.title,
      company: job.companies.name,
      companyId: job.companies.id,
      logo: job.companies.logo || '🏢',
        location: job.city,
        fullLocation: `${job.city}, ${job.province}`,
        type: job.jobType,
        salary: job.showSalary && job.salaryMin && job.salaryMax
          ? `Rp ${job.salaryMin.toLocaleString('id-ID')} - ${job.salaryMax.toLocaleString('id-ID')}`
          : 'Negotiable',
        experience: job.minExperience 
          ? `${job.minExperience}${job.maxExperience ? `-${job.maxExperience}` : '+'} tahun`
          : 'Any level',
        category: job.category,
        postedDate: job.publishedAt,
        applicants: job._count.applications,
        urgent: job.isFeatured,
        remote: job.isRemote,
        hasApplied, // Add hasApplied flag
        description: job.description,
        requirements: job.requirements,
        responsibilities: job.responsibilities,
        benefits: job.benefits,
        skills: job.job_skills.map(js => js.skills.name),
        educationLevel: job.educationLevel,
        applicationDeadline: job.applicationDeadline
      }
    }))

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return NextResponse.json({
      success: true,
      data: transformedJobs,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    })

  } catch (error) {
    console.error('Get jobs error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch jobs',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
