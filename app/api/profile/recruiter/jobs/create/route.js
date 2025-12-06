import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/authHelper'

export async function POST(request) {
  try {
    console.log('📝 Create job API called')
    
    // ✅ Use getCurrentUser instead of requireRecruiter
    const auth = await getCurrentUser(request)
    
    if (auth.error) {
      console.log('❌ Auth error:', auth.error)
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      )
    }

    const { user } = auth
    console.log('👤 User:', user.email, 'Role:', user.role)

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

    console.log('🏢 Recruiter found:', recruiter ? 'YES' : 'NO')

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

    // ✅ Check if recruiter is verified
    if (!recruiter.isVerified) {
      return NextResponse.json(
        { error: 'Akun Anda belum diverifikasi oleh admin. Silakan tunggu verifikasi untuk dapat memposting lowongan.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    console.log('📋 Job data received:', body.title)

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
      
      // Requirements
      minExperience,
      maxExperience,
      educationLevel,
      
      // Additional
      benefits,
      numberOfPositions,
      applicationDeadline,
      
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

    console.log('🔗 Generated slug:', slug)

    // Prepare benefits array
    const allBenefits = [...(benefits || [])]
    if (workingDays) {
      allBenefits.push(`Hari Kerja: ${workingDays}`)
    }
    if (holidays) {
      allBenefits.push(`Hari Libur: ${holidays}`)
    }

    console.log('💼 Creating job in database...')

    // Create job
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
        
        isActive: true,
        publishedAt: new Date()
      }
    })

    console.log('✅ Job created with ID:', job.id)

    // Add skills if provided
    if (skills && skills.length > 0) {
      console.log('🎯 Adding skills:', skills)
      
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
      
      console.log('✅ Skills added')
    }

    return NextResponse.json({
      success: true,
      message: 'Lowongan berhasil dipublikasikan!',
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