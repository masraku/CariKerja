import { NextResponse } from 'next/server'
import { requireJobseeker } from '@/lib/authHelper'
import { prisma } from '@/lib/prisma'



// PATCH - Withdraw application
export async function PATCH(request, { params }) {
  try {
    // Authenticate user
    const auth = await requireJobseeker(request)
    
    if (auth.error) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      )
    }

    const { jobseeker } = auth
    const { id } = await params

    // Find application
    const application = await prisma.application.findUnique({
      where: { id }
    })

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    // Verify ownership
    if (application.jobseekerId !== jobseeker.id) {
      return NextResponse.json(
        { error: 'Unauthorized access to this application' },
        { status: 403 }
      )
    }

    // Check if already withdrawn/accepted/rejected
    if (['WITHDRAWN', 'ACCEPTED', 'REJECTED'].includes(application.status)) {
      return NextResponse.json(
        { error: 'Cannot withdraw this application' },
        { status: 400 }
      )
    }

    // Update status to WITHDRAWN
    const updatedApplication = await prisma.application.update({
      where: { id },
      data: {
        status: 'WITHDRAWN',
        respondedAt: new Date()
      },
      include: {
        job: {
          include: {
            company: true
          }
        }
      }
    })

    // Update job application count
    await prisma.job.update({
      where: { id: application.jobId },
      data: {
        applicationCount: {
          decrement: 1
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Application withdrawn successfully',
      data: updatedApplication
    })

  } catch (error) {
    console.error('Error withdrawing application:', error)
    return NextResponse.json(
      { error: 'Failed to withdraw application' },
      { status: 500 }
    )
  }
}