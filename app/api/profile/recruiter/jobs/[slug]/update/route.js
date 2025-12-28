import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function PUT(request, { params }) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    const { slug } = await params
    const body = await request.json()

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
      skills,
      isActive,
      photo,
      workingDays,
      holidays,
      isShift,
      shiftCount,
      isDisabilityFriendly,
      gallery
    } = body

    // Validation
    if (!title || !description || !location || !jobType) {
      return NextResponse.json(
        { error: 'Please fill all required fields' },
        { status: 400 }
      )
    }

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
        gallery: gallery || []
      }
    })

    return NextResponse.json({
      success: true,
      job: updatedJob,
      message: 'Lowongan berhasil diupdate dan dikirim untuk validasi ulang'
    })

  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Failed to update job',
        details: error.message 
      },
      { status: 500 }
    )
  }
}