import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createErrorResponse } from '@/lib/errorHandler'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'
import { validateBody } from '@/lib/validations'
import { updateJobSchema } from '@/lib/validations/profile'
import { validateCSRFToken, csrfErrorResponse } from '@/lib/csrf'

export async function PUT(request, { params }) {
  try {
    if (!validateCSRFToken(request)) {
      return csrfErrorResponse()
    }

    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
    const { slug } = await params
    
    const validation = await validateBody(request, updateJobSchema)
    if (!validation.success) {
      return validation.response
    }

    // Verify job ownership
    const existingJob = await prisma.jobs.findUnique({
      where: { slug },
      include: {
        companies: {
          include: {
            recruiters: {
              where: { userId: decoded.userId }
            }
          }
        }
      }
    })

    if (!existingJob || existingJob.companies.recruiters.length === 0) {
      return NextResponse.json(
        { error: 'Job not found or unauthorized' },
        { status: 404 }
      )
    }

    const {
      title,
      description,
      benefits,
      location,
      city,
      province,
      isRemote,
      jobScope,
      jobType,
      educationLevel,
      numberOfPositions,
      applicationDeadline,
      isActive,
      skills,
      photo,
      workingDays,
      holidays,
      isShift,
      shiftCount,
      isDisabilityFriendly,
      disabilityDescription,
      gallery
    } = validation.data

    // Generate new slug if title changed
    let newSlug = slug
    if (title !== existingJob.title) {
      const baseSlug = title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()

      const slugExists = await prisma.jobs.findFirst({
        where: {
          slug: baseSlug,
          id: { not: existingJob.id }
        }
      })

      newSlug = slugExists ? `${baseSlug}-${Date.now()}` : baseSlug
    }

    const isReactivationRequest = isActive === true && !existingJob.isActive

    if (isReactivationRequest) {
      if (!applicationDeadline) {
        return NextResponse.json(
          { error: 'Tanggal batas akhir lamaran wajib diisi' },
          { status: 400 }
        )
      }

      const deadline = new Date(applicationDeadline)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const deadlineDate = new Date(deadline)
      deadlineDate.setHours(0, 0, 0, 0)

      if (Number.isNaN(deadline.getTime()) || deadlineDate < today) {
        return NextResponse.json(
          { error: 'Tanggal batas akhir lamaran harus hari ini atau setelahnya' },
          { status: 400 }
        )
      }
    }

    // Update job and reset status to PENDING for admin re-validation
    const updatedJob = await prisma.jobs.update({
      where: { slug },
      data: {
        title,
        slug: newSlug,
        description,
        benefits: benefits || [],
        location,
        city: city || location,
        province: province || '',
        isRemote: isRemote || false,
        jobScope: jobScope || 'DOMESTIC',
        jobType,
        educationLevel: educationLevel || null,
        numberOfPositions: numberOfPositions ? parseInt(numberOfPositions) : 1,
        applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : null,
        isActive: false, // Set inactive until admin approves
        
        // Reset status to PENDING for admin re-validation
        status: 'PENDING',
        rejectionReason: null, // Clear previous rejection reason
        publishedAt: null, // Clear published date
        
        photo: photo || null,
        workingDays: workingDays || null,
        holidays: holidays || null,
        isShift: isShift || false,
        shiftCount: shiftCount ? parseInt(shiftCount) : null,
        isDisabilityFriendly: isDisabilityFriendly || false,
        disabilityDescription: disabilityDescription || null,
        gallery: gallery || []
      }
    })

    // Update skills if provided
    if (skills && Array.isArray(skills)) {
      // Delete old job_skills
      await prisma.job_skills.deleteMany({
        where: { jobId: existingJob.id }
      })

      // Insert new skills
      for (const skillName of skills) {
        // Find or create skill
        let skill = await prisma.skills.findFirst({
          where: { name: { equals: skillName, mode: 'insensitive' } }
        })

        if (!skill) {
          skill = await prisma.skills.create({
            data: { name: skillName }
          })
        }

        // Create job_skill relation
        await prisma.job_skills.create({
          data: {
            jobId: existingJob.id,
            skillId: skill.id,
            isRequired: true
          }
        })
      }
    }

    return NextResponse.json({
      success: true,
      job: updatedJob,
      message: 'Lowongan berhasil diupdate dan dikirim untuk validasi ulang'
    })

  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Failed to update job',
        ...createErrorResponse('Terjadi kesalahan', error) 
      },
      { status: 500 }
    )
  }
}
