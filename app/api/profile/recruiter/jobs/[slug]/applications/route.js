//app/api/profile/recruiter/jobs/[slug]/applications/route.js
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(request, { params }) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    const { slug } = await params

    // Find job by slug and verify recruiter owns it
    const job = await prisma.jobs.findUnique({
      where: { slug },
      include: {
        companies: {
          include: {
            recruiters: {
              where: { userId: decoded.userId }
            }
          }
        },
        job_skills: {
          include: {
            skills: true
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

    // Get all applications with jobseeker details (excluding WITHDRAWN)
    const applications = await prisma.applications.findMany({
      where: { 
        jobId: job.id,
        status: {
          not: 'WITHDRAWN' // Don't show withdrawn applications to recruiter
        }
      },
      include: {
        jobseekers: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            photo: true,
            currentTitle: true,
            summary: true,
            city: true,
            province: true,
            cvUrl: true,
            ktpUrl: true,
            ak1Url: true,
            ijazahUrl: true,
            sertifikatUrl: true,
            suratPengalamanUrl: true,
            profileCompleteness: true, // Use stored value from database
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
        // Include interview participant to get interview details including meeting URL
        interview_participants: {
          include: {
            interviews: {
              select: {
                id: true,
                title: true,
                scheduledAt: true,
                duration: true,
                meetingUrl: true,
                meetingType: true,
                location: true,
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

    // Process applications with jobseeker data
    const applicationsWithCompleteness = applications.map(app => {
      const jobseeker = app.jobseekers

      // Use profileCompleteness from database (already calculated when jobseeker saves profile)
      const completenessPercentage = jobseeker.profileCompleteness || 0

      // Extract skill names from jobseeker_skills
      const skills = jobseeker.jobseeker_skills?.map(js => js.skills?.name).filter(Boolean) || []

      // Get interview data if exists
      const participant = app.interview_participants?.[0]
      const interview = participant?.interviews || null
      const participantStatus = participant?.status || null
      const rescheduleReason = participant?.responseMessage || null

      return {
        ...app,
        jobseekers: {
          ...jobseeker,
          skills // Add extracted skills array for easier access
        },
        interview, // Add interview data
        participantStatus,
        rescheduleReason,
        profileCompleteness: completenessPercentage,
        hasCV: !!jobseeker.cvUrl,
        hasExperience: jobseeker.work_experiences?.length > 0,
        hasEducation: jobseeker.educations?.length > 0,
        skillsCount: skills.length
      }
    })

    // Group by status
    const stats = {
      total: applications.length,
      pending: applications.filter(a => a.status === 'PENDING').length,
      reviewing: applications.filter(a => a.status === 'REVIEWING').length,
      shortlisted: applications.filter(a => a.status === 'SHORTLISTED').length,
      interview: applications.filter(a => a.status === 'INTERVIEW_SCHEDULED').length,
      interviewCompleted: applications.filter(a => a.status === 'INTERVIEW_COMPLETED').length,
      accepted: applications.filter(a => a.status === 'ACCEPTED').length,
      rejected: applications.filter(a => a.status === 'REJECTED').length,
      withdrawn: applications.filter(a => a.status === 'WITHDRAWN').length,
      profileComplete: applicationsWithCompleteness.filter(a => a.profileCompleteness >= 80).length
    }

    // Extract job skills names
    const jobSkills = job.job_skills?.map(js => js.skills?.name).filter(Boolean) || []

    return NextResponse.json({
      success: true,
      job: {
        id: job.id,
        slug: job.slug,
        title: job.title,
        location: job.location,
        jobType: job.jobType,
        level: job.level,
        description: job.description,
        requirements: job.requirements,
        skills: jobSkills,
        companyAddress: job.companies?.address,
        companyCity: job.companies?.city,
        companyProvince: job.companies?.province
      },
      applications: applicationsWithCompleteness,
      stats
    })

  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Failed to fetch applications',
        details: error.message 
      },
      { status: 500 }
    )
  }
}