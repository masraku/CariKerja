import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createErrorResponse } from '@/lib/errorHandler'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'
import { validateBody } from '@/lib/validations'
import { z } from 'zod'

// Validation schema
const submitResignationSchema = z.object({
  applicationId: z.string().min(1, 'Application ID wajib diisi'),
  reason: z.string().min(10, 'Alasan wajib diisi minimal 10 karakter'),
  letterUrl: z.string().url('URL surat pengunduran diri tidak valid')
})

// POST /api/resignations/submit
// Jobseeker submits a resignation request
export async function POST(request) {
  try {
    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== 'JOBSEEKER') {
      return NextResponse.json({ error: 'Only jobseekers can submit resignations' }, { status: 403 })
    }

    const validation = await validateBody(request, submitResignationSchema)
    if (!validation.success) {
      return validation.response
    }
    const { applicationId, reason, letterUrl } = validation.data

    // Get jobseeker profile
    const jobseeker = await prisma.jobseekers.findUnique({
      where: { userId: decoded.userId }
    })

    if (!jobseeker) {
      return NextResponse.json({ error: 'Jobseeker profile not found' }, { status: 404 })
    }

    // Verify ownership and status
    const application = await prisma.applications.findFirst({
      where: {
        id: applicationId,
        jobseekerId: jobseeker.id,
        status: 'ACCEPTED' // Only accepted applications can resign
      },
      include: {
        jobs: {
          include: {
            companies: true
          }
        }
      }
    })

    if (!application) {
      return NextResponse.json({ 
        error: 'Application not found or not eligible for resignation. Only accepted applications can submit resignation.' 
      }, { status: 400 })
    }

    // Check if resignation already exists
    const existingResignation = await prisma.resignations.findUnique({
      where: { applicationId }
    })

    if (existingResignation) {
      return NextResponse.json({ 
        error: 'Resignation request already submitted for this application',
        resignation: existingResignation
      }, { status: 400 })
    }

    // Create resignation
    const resignation = await prisma.resignations.create({
      data: {
        applicationId,
        jobseekerId: jobseeker.id,
        reason,
        letterUrl
      },
      include: {
        applications: {
          include: {
            jobs: {
              include: {
                companies: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Resignation request submitted successfully',
      resignation
    })

  } catch (error) {
    console.error('Error submitting resignation:', error)
    return NextResponse.json({ 
      error: 'Failed to submit resignation',
      ...createErrorResponse('Terjadi kesalahan', error) 
    }, { status: 500 })
  }
}
