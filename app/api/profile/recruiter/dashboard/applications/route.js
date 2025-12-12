// app/api/profile/recruiter/dashboard/applications/route.js

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)

    // Get recruiter profile
    const recruiter = await prisma.recruiters.findUnique({
      where: { userId: decoded.userId }
    })

    if (!recruiter) {
      return NextResponse.json(
        { error: 'Recruiter profile not found' },
        { status: 404 }
      )
    }

    // Get all applications from all jobs owned by this recruiter's company
    const applications = await prisma.applications.findMany({
      where: {
        jobs: {
          companies: {
            recruiters: {
              some: {
                userId: decoded.userId
              }
            }
          }
        }
      },
      include: {
        jobseekers: {
          include: {
            educations: true,
            work_experiences: true,
            jobseeker_skills: {
              include: {
                skills: true
              }
            },
            certifications: true
          }
        },
        jobs: {
          select: {
            id: true,
            title: true,
            slug: true,
            location: true,
            jobType: true,
            level: true,
            companies: {
              select: {
                name: true,
                logo: true
              }
            }
          }
        },
        // Include interview participants to get interview ID
        interview_participants: {
          include: {
            interviews: {
              select: {
                id: true,
                scheduledAt: true,
                status: true
              }
            }
          }
        }
      },
      orderBy: {
        appliedAt: 'desc'
      }
    })

    // Calculate profile completeness for each applicant
    const applicationsWithCompleteness = applications.map(app => {
      const jobseeker = app.jobseekers
      let completeness = 0
      let totalFields = 13

      if (jobseeker.firstName) completeness++
      if (jobseeker.lastName) completeness++
      if (jobseeker.phone) completeness++
      if (jobseeker.email) completeness++
      if (jobseeker.currentTitle) completeness++
      if (jobseeker.summary) completeness++
      if (jobseeker.cvUrl) completeness++
      if (jobseeker.educations?.length > 0) completeness++
      if (jobseeker.work_experiences?.length > 0) completeness++
      if (jobseeker.jobseeker_skills?.length > 0) completeness++
      if (jobseeker.certifications?.length > 0) completeness++
      if (jobseeker.photo) completeness++
      if (jobseeker.city && jobseeker.province) completeness++

      const completenessPercentage = Math.round((completeness / totalFields) * 100)

      // Extract skill names
      const skills = jobseeker.jobseeker_skills?.map(js => js.skills?.name).filter(Boolean) || []

      // Get interview data if exists
      const interview = app.interview_participants?.[0]?.interviews || null

      return {
        ...app,
        jobseekers: {
          ...jobseeker,
          skills
        },
        interview, // Add interview data
        profileCompleteness: completenessPercentage,
        hasCV: !!jobseeker.cvUrl,
        hasExperience: jobseeker.work_experiences?.length > 0,
        hasEducation: jobseeker.educations?.length > 0,
        skillsCount: skills.length
      }
    })

    // Get all jobs for filter dropdown
    const jobs = await prisma.jobs.findMany({
      where: {
        companies: {
          recruiters: {
            some: {
              userId: decoded.userId
            }
          }
        }
      },
      select: {
        id: true,
        title: true,
        slug: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Calculate stats
    const stats = {
      total: applications.length,
      pending: applications.filter(a => a.status === 'PENDING').length,
      reviewing: applications.filter(a => a.status === 'REVIEWING').length,
      shortlisted: applications.filter(a => a.status === 'SHORTLISTED').length,
      interview: applications.filter(a => a.status === 'INTERVIEW_SCHEDULED').length,
      accepted: applications.filter(a => a.status === 'ACCEPTED').length,
      rejected: applications.filter(a => a.status === 'REJECTED').length
    }

    return NextResponse.json({
      success: true,
      applications: applicationsWithCompleteness,
      jobs,
      stats
    })

  } catch (error) {
    console.error('❌ Get all applications error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch applications',
        details: error.message 
      },
      { status: 500 }
    )
  }
}