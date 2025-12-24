import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/authHelper'

export async function POST(request) {
  try {
    // ✅ Use getCurrentUser instead of requireRecruiter
    const auth = await getCurrentUser(request)
    
    if (auth.error) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      )
    }

    const { user } = auth

    // Check if user is recruiter
    if (user.role !== 'RECRUITER') {
      return NextResponse.json(
        { error: 'Access denied. Recruiter role required' },
        { status: 403 }
      )
    }

    // Get recruiter profile
    const recruiter = await prisma.recruiters.findUnique({
      where: { userId: user.id },
      include: { companies: true }
    })

    if (!recruiter) {
      return NextResponse.json(
        { error: 'Recruiter profile not found. Please complete your profile first.' },
        { status: 404 }
      )
    }

    if (!recruiter.companyId) {
      return NextResponse.json(
        { error: 'Company not found. Please complete your company profile first.' },
        { status: 404 }
      )
    }

    // ✅ Check if COMPANY is verified (not recruiter)
    if (!recruiter.companies?.verified) {
      return NextResponse.json(
        { error: 'Perusahaan Anda belum diverifikasi oleh admin. Silakan tunggu verifikasi untuk dapat memposting lowongan.' },
        { status: 403 }
      )
    }

    const body = await request.json()

    const {
      // Basic Info
      title,
      description,
      requirements,
      responsibilities,
      
      // Job Details
      jobType,
      level,
      category,
      
      // Location
      location,
      city,
      province,
      isRemote,
      
      // Salary
      salaryMin,
      salaryMax,
      salaryType,
      showSalary,
      
      // Work Schedule
      workingDays,
      holidays,
      isShift,
      shiftCount,
      isDisabilityFriendly,
      
      // Requirements
      minExperience,
      maxExperience,
      educationLevel,
      
      // Additional
      benefits,
      numberOfPositions,
      applicationDeadline,
      
      // Photo
      photo,
      
      // Skills
      skills
    } = body

    // Validate required fields
    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      )
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      + '-' + Date.now()

    // Prepare benefits array
    const allBenefits = [...(benefits || [])]
    if (workingDays) {
      allBenefits.push(`Hari Kerja: ${workingDays}`)
    }
    if (holidays) {
      allBenefits.push(`Hari Libur: ${holidays}`)
    }

    // Create job - set isActive to false for admin validation
    const job = await prisma.jobs.create({
      data: {
        companyId: recruiter.companyId,
        recruiterId: recruiter.id,
        
        title,
        slug,
        description,
        requirements: requirements || '',
        responsibilities: responsibilities || '',
        
        jobType,
        level: level || 'MID_LEVEL',
        category: category || 'Other',
        
        location: location || '',
        city: city || '',
        province: province || '',
        isRemote: isRemote || false,
        
        salaryMin: salaryMin ? parseInt(salaryMin) : null,
        salaryMax: salaryMax ? parseInt(salaryMax) : null,
        salaryType: salaryType || 'monthly',
        showSalary: showSalary !== false,
        
        benefits: allBenefits,
        numberOfPositions: numberOfPositions ? parseInt(numberOfPositions) : 1,
        
        minExperience: minExperience ? parseInt(minExperience) : null,
        maxExperience: maxExperience ? parseInt(maxExperience) : null,
        educationLevel: educationLevel || null,
        
        applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : null,
        
        photo: photo || null,
        isShift: isShift || false,
        shiftCount: shiftCount ? parseInt(shiftCount) : null,
        isDisabilityFriendly: isDisabilityFriendly || false,
        
        // Set inactive for admin validation
        isActive: false,
        publishedAt: null
      }
    })

    // Add skills if provided
    if (skills && skills.length > 0) {
      for (const skillName of skills) {
        // Find or create skill
        let skill = await prisma.skills.findFirst({
          where: {
            name: {
              equals: skillName,
              mode: 'insensitive'
            }
          }
        })

        if (!skill) {
          skill = await prisma.skills.create({
            data: { name: skillName }
          })
        }

        // Link skill to job
        await prisma.job_skills.create({
          data: {
            jobId: job.id,
            skillId: skill.id,
            isRequired: true
          }
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Lowongan berhasil diajukan! Menunggu validasi admin sebelum dipublikasikan.',
      job
    })

  } catch (error) {
    console.error('❌ Create job error:', error)
    // Don't expose internal error details to users
    return NextResponse.json(
      { error: 'Gagal membuat lowongan. Silakan coba lagi atau hubungi admin jika masalah berlanjut.' },
      { status: 500 }
    )
  }
}