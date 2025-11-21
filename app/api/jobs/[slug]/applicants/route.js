import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/authHelper'

export async function GET(request, { params }) {
  try {
    // ✅ Await params first
    const { slug } = await params

    console.log('📋 Fetching applicants for job:', slug)

    // Get current user and verify they're a recruiter
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
    const recruiter = await prisma.recruiter.findUnique({
      where: { userId: user.id }
    })

    if (!recruiter) {
      return NextResponse.json(
        { error: 'Recruiter profile not found' },
        { status: 404 }
      )
    }

    // Get job and verify ownership
    const job = await prisma.job.findUnique({
      where: { slug }
    })

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    // Verify that this recruiter owns this job
    if (job.recruiterId !== recruiter.id) {
      return NextResponse.json(
        { error: 'Access denied. You can only view applicants for your own job postings' },
        { status: 403 }
      )
    }

    console.log('✅ Authorization verified, fetching applicants...')

    // Get all applications for this job with complete jobseeker profiles
    const applications = await prisma.application.findMany({
      where: {
        jobId: job.id
      },
      include: {
        jobseeker: {
          include: {
            user: {
              select: {
                email: true
              }
            },
            skills: {
              include: {
                skill: true
              }
            },
            education: {
              orderBy: {
                startDate: 'desc'
              }
            },
            workExperience: {
              orderBy: {
                startDate: 'desc'
              }
            }
          }
        }
      },
      orderBy: {
        appliedAt: 'desc'
      }
    })

    console.log(`📊 Total applications: ${applications.length}`)

    // Filter applicants with complete profiles
    // Profile is considered complete if they have:
    // 1. Resume/CV URL or
    // 2. At least one work experience or education entry
    const completeApplicants = applications.filter(app => {
      const hasResume = !!app.jobseeker.resumeUrl
      const hasWorkExperience = app.jobseeker.workExperience?.length > 0
      const hasEducation = app.jobseeker.education?.length > 0
      const hasSkills = app.jobseeker.skills?.length > 0
      
      // Profile is complete if they have resume OR (work experience OR education) AND skills
      return hasResume || ((hasWorkExperience || hasEducation) && hasSkills)
    })

    console.log(`✅ Complete profiles: ${completeApplicants.length}`)

    // Calculate profile completeness score for sorting
    const applicantsWithScore = completeApplicants.map(app => {
      let score = 0
      
      // Resume/CV (highest weight)
      if (app.jobseeker.resumeUrl) score += 40
      
      // Work Experience
      if (app.jobseeker.workExperience?.length > 0) {
        score += 20 + (app.jobseeker.workExperience.length * 2) // max +30
      }
      
      // Education
      if (app.jobseeker.education?.length > 0) {
        score += 10 + (app.jobseeker.education.length * 2) // max +20
      }
      
      // Skills
      if (app.jobseeker.skills?.length > 0) {
        score += 10 + (app.jobseeker.skills.length * 1) // max +20
      }
      
      // Profile photo
      if (app.jobseeker.photo) score += 5
      
      // Current title
      if (app.jobseeker.currentTitle) score += 5
      
      // Bio/summary
      if (app.jobseeker.bio) score += 5
      
      // LinkedIn
      if (app.jobseeker.linkedinUrl) score += 5

      return {
        ...app,
        profileScore: Math.min(score, 100) // Cap at 100
      }
    })

    // Sort by profile completeness (highest score first)
    const sortedApplicants = applicantsWithScore.sort((a, b) => b.profileScore - a.profileScore)

    console.log('🎯 Applicants sorted by profile completeness')

    return NextResponse.json({
      success: true,
      total: applications.length,
      complete: sortedApplicants.length,
      applicants: sortedApplicants
    })

  } catch (error) {
    console.error('❌ Get applicants error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch applicants' },
      { status: 500 }
    )
  }
}