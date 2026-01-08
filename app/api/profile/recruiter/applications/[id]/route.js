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
          companyId: recruiter.companyId // Use company ID instead
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
            work_experiences: {
              orderBy: { startDate: 'desc' }
            },
            educations: {
              orderBy: { startDate: 'desc' }
            },
            certifications: {
              orderBy: { issueDate: 'desc' }
            },
            jobseeker_skills: {
              include: {
                skills: true
              }
            }
          }
        },
        // Include interview data
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
      }
    })

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found or you do not have permission to view it' },
        { status: 404 }
      )
    }

    // Calculate profile completeness
    const jobseeker = application.jobseekers
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

    // Extract skill names from jobseeker_skills
    const skills = jobseeker.jobseeker_skills?.map(js => js.skills?.name).filter(Boolean) || []

    // Get interview data if exists
    const interview = application.interview_participants?.[0]?.interviews || null

    // Add profile completeness and skills to response
    const responseData = {
      ...application,
      jobseekers: {
        ...jobseeker,
        skills
      },
      interview, // Add interview data
      profileCompleteness: completenessScore
    }

    return NextResponse.json({
      success: true,
      application: responseData
    })

  } catch (error) {
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

    // Verify application exists and belongs to recruiter's company
    const application = await prisma.applications.findFirst({
      where: {
        id,
        jobs: {
          companyId: recruiter.companyId
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

    // Validate interview completion before accepting (REJECTED can be done from any status)
    if (status === 'ACCEPTED') {
      // Simply check if application status is INTERVIEW_COMPLETED
      if (application.status !== 'INTERVIEW_COMPLETED') {
        return NextResponse.json(
          { 
            error: 'Tidak dapat menerima pelamar',
            message: `Status aplikasi saat ini: ${application.status}. Harap selesaikan interview terlebih dahulu sebelum menerima kandidat.`
          },
          { status: 400 }
        )
      }
    }

    // Check exclusive acceptance - jobseeker can only be accepted by one company
    if (status === 'ACCEPTED') {
      // Get jobseekerId from the current application
      const currentApp = await prisma.applications.findUnique({
        where: { id },
        select: { jobseekerId: true }
      })

      // Check if this jobseeker is already accepted AND confirmed somewhere else
      const alreadyAccepted = await prisma.applications.findFirst({
        where: {
          jobseekerId: currentApp.jobseekerId,
          status: 'ACCEPTED',
          confirmedByJobseeker: true, // Only block if jobseeker confirmed the offer
          id: { not: id } // Exclude current application
        },
        include: {
          jobs: {
            include: {
              companies: {
                select: { name: true }
              }
            }
          }
        }
      })

      if (alreadyAccepted) {
        return NextResponse.json(
          { 
            error: 'Kandidat sudah menerima tawaran perusahaan lain',
            message: `Kandidat ini sudah menerima tawaran bekerja di ${alreadyAccepted.jobs.companies.name} untuk posisi ${alreadyAccepted.jobs.title}. Kandidat tidak dapat diterima di lebih dari satu perusahaan.`
          },
          { status: 400 }
        )
      }
    }

    // Update application
    const updateData = {
      status,
      reviewedAt: status !== 'PENDING' && !application.reviewedAt ? new Date() : application.reviewedAt
    }
    
    // Only include recruiterNotes if provided
    if (recruiterNotes !== undefined) {
      updateData.recruiterNotes = recruiterNotes
    }

    // Auto-confirm when ACCEPTED - jobseeker doesn't need to confirm manually
    if (status === 'ACCEPTED') {
      updateData.confirmedByJobseeker = true
      updateData.respondedAt = new Date()
    }

    const updatedApplication = await prisma.applications.update({
      where: { id },
      data: updateData,
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
            users: {
              select: {
                email: true
              }
            }
          }
        }
      }
    })

    // When ACCEPTED, also update jobseeker employment status
    if (status === 'ACCEPTED') {
      await prisma.jobseekers.update({
        where: { id: updatedApplication.jobseekers.id },
        data: {
          isEmployed: true,
          isLookingForJob: false,
          employedAt: new Date(),
          employedCompany: updatedApplication.jobs.companies.name,
          currentTitle: `${updatedApplication.jobs.companies.name} - ${updatedApplication.jobs.title}`
        }
      })
    }

    // Send email notification for final decisions
    if (status === 'ACCEPTED' || status === 'REJECTED') {
      try {
        await sendApplicationDecision({
          to: updatedApplication.jobseekers.users?.email || updatedApplication.jobseekers.email,
          jobseekerName: `${updatedApplication.jobseekers.firstName} ${updatedApplication.jobseekers.lastName}`,
          jobTitle: updatedApplication.jobs.title,
          companyName: updatedApplication.jobs.companies.name,
          decision: status,
          message: recruiterNotes || '',
          nextSteps: status === 'ACCEPTED' ? 
            'Tim kami akan segera menghubungi Anda untuk proses selanjutnya. Harap periksa email dan telepon Anda secara berkala.' : 
            ''
        })
      } catch (emailError) {
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Application updated successfully',
      application: updatedApplication
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update application', details: error.message },
      { status: 500 }
    )
  }
}

// Delete application
export async function DELETE(request, context) {
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

    // Verify application exists and belongs to recruiter's company
    const application = await prisma.applications.findFirst({
      where: {
        id,
        jobs: {
          companyId: recruiter.companyId
        }
      },
      include: {
        jobseekers: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        jobs: {
          select: {
            title: true
          }
        }
      }
    })

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found or you do not have permission to delete it' },
        { status: 404 }
      )
    }

    // Delete related interview participants first
    await prisma.interview_participants.deleteMany({
      where: { applicationId: id }
    })

    // Delete the application
    await prisma.applications.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Lamaran berhasil dihapus'
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete application' },
      { status: 500 }
    )
  }
}
