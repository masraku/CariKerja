//app/api/profile/recruiter/jobs/[slug]/update/route.js
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

    console.log('📝 Updating job:', slug)

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
      requirements,
      responsibilities,
      benefits,
      location,
      city,
      province,
      isRemote,
      jobType,
      level,
      industry,
      salaryMin,
      salaryMax,
      salaryType,
      showSalary,
      positions,
      applicationDeadline,
      skills,
      isActive
    } = body

    // Validation
    if (!title || !description || !location || !jobType || !level) {
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

      // Check if slug exists
      const slugExists = await prisma.jobs.findFirst({
        where: {
          slug: baseSlug,
          id: { not: existingJob.id }
        }
      })

      newSlug = slugExists ? `${baseSlug}-${Date.now()}` : baseSlug
    }

    // Update job
    const updatedJob = await prisma.jobs.update({
      where: { slug },
      data: {
        title,
        slug: newSlug,
        description,
        requirements: requirements || null,
        responsibilities: responsibilities || null,
        benefits: benefits || null,
        location,
        city: city || location,
        province: province || '',
        isRemote: isRemote || false,
        jobType,
        level,
        industry: industry || existingJob.companies.industry,
        salaryMin: salaryMin ? parseInt(salaryMin) : null,
        salaryMax: salaryMax ? parseInt(salaryMax) : null,
        salaryType: salaryType || 'monthly',
        showSalary: showSalary || false,
        positions: positions ? parseInt(positions) : 1,
        applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : null,
        skills: skills || [],
        isActive: isActive !== undefined ? isActive : existingJob.isActive
      }
    })

    console.log('✅ Job updated successfully')

    return NextResponse.json({
      success: true,
      job: updatedJob
    })

  } catch (error) {
    console.error('❌ Update job error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to update job',
        details: error.message 
      },
      { status: 500 }
    )
  }
}