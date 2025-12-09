import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRecruiter } from '@/lib/authHelper'

export async function GET(request) {
  try {
    const auth = await requireRecruiter(request)
    
    if (auth.error) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      )
    }

    const { recruiter } = auth

    if (!recruiter) {
      return NextResponse.json(
        { error: 'Recruiter profile not found' },
        { status: 404 }
      )
    }

    // Get company with full details
    const company = await prisma.companies.findUnique({
      where: { id: recruiter.companyId },
      include: {
        jobs: {
          where: {
            isActive: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 5,
          include: {
            applications: {
              select: {
                id: true,
                status: true
              }
            },
            _count: {
              select: {
                applications: true
              }
            }
          }
        },
        _count: {
          select: {
            jobs: true,
            recruiters: true
          }
        }
      }
    })

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      )
    }

    // Get all jobs for this company (including inactive)
    const allJobs = await prisma.jobs.findMany({
      where: {
        companyId: company.id
      },
      select: {
        id: true,
        isActive: true,
        _count: {
          select: {
            applications: true
          }
        }
      }
    })

    // Get all applications for company's jobs
    const allApplications = await prisma.applications.findMany({
      where: {
        jobs: {
          companyId: company.id
        }
      },
      select: {
        id: true,
        status: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    })

    // Calculate statistics
    const stats = {
      totalJobs: allJobs.length,
      activeJobs: allJobs.filter(job => job.isActive).length,
      totalApplications: allApplications.length,
      
      // Applications by status
      pendingApplications: allApplications.filter(app => app.status === 'PENDING').length,
      reviewingApplications: allApplications.filter(app => app.status === 'REVIEWING').length,
      shortlistedApplications: allApplications.filter(app => app.status === 'SHORTLISTED').length,
      interviewScheduled: allApplications.filter(app => app.status === 'INTERVIEW_SCHEDULED').length,
      accepted: allApplications.filter(app => app.status === 'ACCEPTED').length,
      rejected: allApplications.filter(app => app.status === 'REJECTED').length,

      // New applications (last 7 days)
      newApplicationsThisWeek: allApplications.filter(app => {
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        return new Date(app.createdAt) > weekAgo
      }).length
    }

    // Get recent applications with details
    const recentApplications = await prisma.applications.findMany({
      where: {
        jobs: {
          companyId: company.id
        }
      },
      include: {
        jobseekers: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            photo: true,
            currentTitle: true,
            city: true
          }
        },
        jobs: {
          select: {
            id: true,
            title: true,
            slug: true
          }
        }
      },
      orderBy: {
        appliedAt: 'desc'
      },
      take: 5
    })

    return NextResponse.json({
      success: true,
      data: {
        company,
        recruiter,
        stats,
        recentApplications
      }
    })

  } catch (error) {
    console.error('❌ Get recruiter dashboard error:', error.message)
    console.error('Stack:', error.stack)
    return NextResponse.json(
      { 
        error: 'Failed to fetch dashboard data',
        details: error.message 
      },
      { status: 500 }
    )
  }
}