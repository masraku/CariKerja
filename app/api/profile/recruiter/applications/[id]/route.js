import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRecruiter } from '@/lib/authHelper'
import { sendApplicationDecision } from '@/lib/email/sendApplicationDecision'

export async function GET(request, context) {
  try {
    const params = await context.params
    const { id } = params

    // Authenticate user
    const auth = await requireRecruiter(request)
    
    if (auth.error) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      )
    }

    const { recruiter } = auth

    // Fetch application with full details
    const application = await prisma.applications.findFirst({
      where: { 
        id,
        jobs: {
          recruiterId: recruiter.id // Ensure recruiter owns this job
        }
      },
      include: {
        jobs: {
          select: {
            id: true,
            title: true,
            slug: true,
            companies: {
              select: {
                id: true,
                name: true,
                logo: true
              }
            }
          }
        },
        jobseekers: {
          include: {
            workExperiences: {
              orderBy: { startDate: 'desc' }
            },
            educations: {
              orderBy: { startDate: 'desc' }
            },
            certifications: {
              orderBy: { issueDate: 'desc' }
            }
          }
        }
      }
    })

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found or you do not have permission to view it' },
        { status: 404 }
      )
    }

    // Calculate profile completeness
    const jobseeker = application.jobseeker
    let completenessScore = 0
    const fields = [
      jobseeker.firstName,
      jobseeker.lastName,
      jobseeker.email,
      jobseeker.phone,
      jobseeker.city,
      jobseeker.province,
      jobseeker.summary,
      jobseeker.cvUrl,
      jobseeker.currentTitle
    ]
    
    completenessScore = Math.round((fields.filter(f => f).length / fields.length) * 100)

    // Add profile completeness to response
    const responseData = {
      ...application,
      profileCompleteness: completenessScore
    }

    return NextResponse.json({
      success: true,
      application: responseData
    })

  } catch (error) {
    console.error('Error fetching application detail:', error)
    return NextResponse.json(
      { error: 'Failed to fetch application details' },
      { status: 500 }
    )
  }
}

// Update application status
export async function PATCH(request, context) {
  try {
    const params = await context.params
    const { id } = params

    // Authenticate user
    const auth = await requireRecruiter(request)
    
    if (auth.error) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      )
    }

    const { recruiter } = auth

    // Verify application exists and belongs to recruiter's job
    const application = await prisma.applications.findFirst({
      where: {
        id,
        jobs: {
          recruiterId: recruiter.id
        }
      }
    })

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found or you do not have permission to update it' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { status, recruiterNotes } = body

    // Validate interview completion before accepting/rejecting
    if (status === 'ACCEPTED' || status === 'REJECTED') {
      // Simply check if application status is INTERVIEW_COMPLETED
      if (application.status !== 'INTERVIEW_COMPLETED') {
        return NextResponse.json(
          { 
            error: 'Tidak dapat menerima/menolak pelamar',
            message: `Status aplikasi saat ini: ${application.status}. Harap mark interview sebagai complete terlebih dahulu.`
          },
          { status: 400 }
        )
      }
    }

    // Update application
    const updatedApplication = await prisma.applications.update({
      where: { id },
      data: {
        status,
        recruiterNotes,
        reviewedAt: status !== 'PENDING' && !application.reviewedAt ? new Date() : application.reviewedAt
      },
      include: {
        jobs: {
          select: {
            id: true,
            title: true,
            slug: true,
            companies: {
              select: {
                name: true
              }
            }
          }
        },
        jobseekers: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            user: {
              select: {
                email: true
              }
            }
          }
        }
      }
    })

    // Send email notification for final decisions
    if (status === 'ACCEPTED' || status === 'REJECTED') {
      try {
        await sendApplicationDecision({
          to: updatedApplication.jobseeker.user?.email || updatedApplication.jobseeker.email,
          jobseekerName: `${updatedApplication.jobseeker.firstName} ${updatedApplication.jobseeker.lastName}`,
          jobTitle: updatedApplication.job.title,
          companyName: updatedApplication.job.companies.name,
          decision: status,
          message: recruiterNotes || '',
          nextSteps: status === 'ACCEPTED' ? 
            'Tim kami akan segera menghubungi Anda untuk proses selanjutnya. Harap periksa email dan telepon Anda secara berkala.' : 
            ''
        })
        console.log(`📧 Application decision email sent to ${updatedApplication.jobseeker.firstName}`)
      } catch (emailError) {
        console.error('Failed to send decision email:', emailError)
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Application updated successfully',
      application: updatedApplication
    })

  } catch (error) {
    console.error('Error updating application:', error)
    return NextResponse.json(
      { error: 'Failed to update application' },
      { status: 500 }
    )
  }
}
