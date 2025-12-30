import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// PATCH /api/resignations/[id]
// Recruiter approves or rejects a resignation
export async function PATCH(request, { params }) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== 'RECRUITER') {
      return NextResponse.json({ error: 'Only recruiters can process resignations' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { action, recruiterNotes } = body // action: 'approve' or 'reject'

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action. Use "approve" or "reject"' }, { status: 400 })
    }

    // Get recruiter profile
    const recruiter = await prisma.recruiters.findUnique({
      where: { userId: decoded.userId }
    })

    if (!recruiter) {
      return NextResponse.json({ error: 'Recruiter profile not found' }, { status: 404 })
    }

    // Get resignation and verify it belongs to recruiter's company
    const resignation = await prisma.resignations.findUnique({
      where: { id },
      include: {
        applications: {
          include: {
            jobs: true
          }
        }
      }
    })

    if (!resignation) {
      return NextResponse.json({ error: 'Resignation not found' }, { status: 404 })
    }

    if (resignation.applications.jobs.companyId !== recruiter.companyId) {
      return NextResponse.json({ error: 'Not authorized to process this resignation' }, { status: 403 })
    }

    if (resignation.status !== 'PENDING') {
      return NextResponse.json({ 
        error: `Resignation already ${resignation.status.toLowerCase()}` 
      }, { status: 400 })
    }

    const newStatus = action === 'approve' ? 'APPROVED' : 'REJECTED'

    // Update resignation
    const updatedResignation = await prisma.resignations.update({
      where: { id },
      data: {
        status: newStatus,
        processedAt: new Date(),
        processedBy: recruiter.id,
        recruiterNotes: recruiterNotes || null
      }
    })

    // If approved, update application status to RESIGNED and reset jobseeker employment status
    if (action === 'approve') {
      // Update application status
      await prisma.applications.update({
        where: { id: resignation.applicationId },
        data: { 
          status: 'RESIGNED',
          updatedAt: new Date()
        }
      })

      // Reset jobseeker employment status back to looking for job
      await prisma.jobseekers.update({
        where: { id: resignation.jobseekerId },
        data: {
          isEmployed: false,
          isLookingForJob: true,
          employedAt: null,
          employedCompany: null
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: `Resignation ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
      resignation: updatedResignation
    })

  } catch (error) {
    console.error('Error processing resignation:', error)
    return NextResponse.json({ 
      error: 'Failed to process resignation',
      details: error.message 
    }, { status: 500 })
  }
}

// GET /api/resignations/[id]
// Get single resignation detail
export async function GET(request, { params }) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    const { id } = await params

    const resignation = await prisma.resignations.findUnique({
      where: { id },
      include: {
        applications: {
          include: {
            jobs: {
              include: {
                companies: true
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
            phone: true,
            photo: true
          }
        }
      }
    })

    if (!resignation) {
      return NextResponse.json({ error: 'Resignation not found' }, { status: 404 })
    }

    // Verify access - either the jobseeker who submitted or recruiter from company
    if (decoded.role === 'JOBSEEKER') {
      const jobseeker = await prisma.jobseekers.findUnique({
        where: { userId: decoded.userId }
      })
      if (resignation.jobseekerId !== jobseeker?.id) {
        return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
      }
    } else if (decoded.role === 'RECRUITER') {
      const recruiter = await prisma.recruiters.findUnique({
        where: { userId: decoded.userId }
      })
      if (resignation.applications.jobs.companyId !== recruiter?.companyId) {
        return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
      }
    } else {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    return NextResponse.json({
      success: true,
      resignation
    })

  } catch (error) {
    console.error('Error fetching resignation:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch resignation',
      details: error.message 
    }, { status: 500 })
  }
}
