import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export async function POST(request) {
  try {
    // Verify authentication
    const cookieStore = await cookies()
    const token = cookieStore.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized - No token' },
        { status: 401 }
      )
    }

    let decoded
    try {
      decoded = jwt.verify(token.value, JWT_SECRET)
    } catch (jwtError) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    const userId = decoded.userId

    // Get request body
    const body = await request.json()

    const {
      // Personal Info
      photo,
      firstName,
      lastName,
      dateOfBirth,
      gender,
      religion,
      maritalStatus,
      nationality,
      idNumber,
      
      // Contact Info
      phone,
      email,
      address,
      city,
      province,
      postalCode,
      kecamatan,
      kelurahan,
      
      // Professional Info
      currentTitle,
      summary,
      linkedinUrl,
      githubUrl,
      portfolioUrl,
      websiteUrl,
      cvUrl,
      ktpUrl,
      ak1Url,
      ijazahUrl,
      sertifikatUrl,
      suratPengalamanUrl,
      
      // Education (Simplified)
      lastEducationLevel,
      lastEducationInstitution,
      lastEducationMajor,
      graduationYear,
      
      // Education (Array - legacy)
      educations,
      
      // Work Experience
      experiences,
      
      // Skills
      skills,
      
      // Certifications
      certifications,
      
      // Job Preferences
      desiredJobTitle,
      desiredSalaryMin,
      desiredSalaryMax,
      preferredLocation,
      preferredJobType,
      willingToRelocate,
      availableFrom
    } = body
    
    // Check if user exists and is jobseeker
    const user = await prisma.users.findUnique({
      where: { id: userId },
      include: { jobseekers: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (user.role !== 'JOBSEEKER') {
      return NextResponse.json(
        { error: 'User is not a jobseeker' },
        { status: 403 }
      )
    }

    if (!user.jobseekers) {
      return NextResponse.json(
        { error: 'Jobseeker profile not found' },
        { status: 404 }
      )
    }

    // Calculate profile completeness - Based on simplified 2-step form
    // Step 1: Data Diri (Personal + Address + Contact + Education + Summary)
    // Step 2: Dokumen (CV, KTP, AK1, Ijazah - required; Sertifikat, Surat Pengalaman - optional)
    const totalFields = 12 // Reduced to match actual form fields
    let filledFields = 0
    
    // Personal Info (Step 1)
    if (photo) filledFields++
    if (firstName) filledFields++ // lastName is optional
    if (dateOfBirth) filledFields++
    if (gender) filledFields++
    if (phone) filledFields++
    if (kecamatan && kelurahan) filledFields++ // Cirebon address
    if (lastEducationLevel && lastEducationInstitution) filledFields++ // Simplified education
    
    // Documents (Step 2) - Required documents
    if (cvUrl) filledFields++
    if (ktpUrl) filledFields++
    if (ak1Url) filledFields++
    if (ijazahUrl) filledFields++
    
    // Optional bonus (not counted in total, but can add to percentage)
    let bonusFields = 0
    if (summary) bonusFields++
    if (sertifikatUrl) bonusFields++
    if (suratPengalamanUrl) bonusFields++
    
    const completeness = Math.min(100, Math.round(((filledFields + (bonusFields * 0.5)) / totalFields) * 100))

    // Update jobseeker profile
    const jobseeker = await prisma.jobseekers.update({
      where: { userId: userId },
      data: {
        // Personal Info
        photo,
        firstName,
        lastName,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        gender,
        religion,
        maritalStatus,
        nationality,
        idNumber,
        
        // Contact Info
        phone,
        email,
        address,
        city,
        province,
        postalCode,
        kecamatan,
        kelurahan,
        
        // Professional Info
        currentTitle,
        summary,
        linkedinUrl,
        githubUrl,
        portfolioUrl,
        websiteUrl,
        cvUrl,
        ktpUrl,
        ak1Url,
        ijazahUrl,
        sertifikatUrl,
        suratPengalamanUrl,
        
        // Education (Simplified)
        lastEducationLevel,
        lastEducationInstitution,
        lastEducationMajor,
        graduationYear: graduationYear ? parseInt(graduationYear) : null,
        
        // Job Preferences
        desiredJobTitle,
        desiredSalaryMin: desiredSalaryMin ? parseInt(desiredSalaryMin) : null,
        desiredSalaryMax: desiredSalaryMax ? parseInt(desiredSalaryMax) : null,
        preferredLocation,
        preferredJobType,
        willingToRelocate: willingToRelocate || false,
        availableFrom: availableFrom ? new Date(availableFrom) : null,
        
        // Profile status
        profileCompleted: completeness >= 70,
        profileCompleteness: completeness
      }
    })

    // Handle educations
    if (educations && educations.length > 0) {
      // Filter only valid educations with required fields
      const validEducations = educations.filter(edu => 
        edu.institution && edu.degree && edu.fieldOfStudy && edu.level
      )
      
      await prisma.educations.deleteMany({
        where: { jobseekerId: jobseeker.id }
      })

      if (validEducations.length > 0) {
        await prisma.educations.createMany({
          data: validEducations.map(edu => ({
            id: crypto.randomUUID(),
            jobseekerId: jobseeker.id,
            institution: edu.institution,
            degree: edu.degree,
            fieldOfStudy: edu.fieldOfStudy,
            level: edu.level,
            startDate: edu.startDate ? new Date(edu.startDate + '-01') : null,
            endDate: edu.endDate ? new Date(edu.endDate + '-01') : null,
            gpa: edu.gpa ? parseFloat(edu.gpa) : null,
            isCurrent: edu.isCurrent || false,
            diplomaUrl: edu.diplomaUrl || null,
            updatedAt: new Date()
          }))
        })
      }
    }

    // Handle work experiences
    if (experiences && experiences.length > 0) {
      // Filter only valid experiences with required fields
      const validExperiences = experiences.filter(exp => exp.company && exp.position)
      
      await prisma.work_experiences.deleteMany({
        where: { jobseekerId: jobseeker.id }
      })

      for (const exp of validExperiences) {
        await prisma.work_experiences.create({
          data: {
            id: crypto.randomUUID(),
            jobseekerId: jobseeker.id,
            company: exp.company,
            position: exp.position,
            location: exp.location,
            startDate: exp.startDate ? new Date(exp.startDate + '-01') : null,
            endDate: exp.endDate ? new Date(exp.endDate + '-01') : null,
            isCurrent: exp.isCurrent || false,
            description: exp.description,
            achievements: exp.achievements || [],
            updatedAt: new Date()
          }
        })
      }
    }

    // Handle skills - UPDATED FOR NEW SCHEMA
    if (skills && skills.length > 0 && skills[0]) {
      
      // Delete existing jobseeker skills
      await prisma.jobseeker_skills.deleteMany({
        where: { jobseekerId: jobseeker.id }
      })

      // Create new skills
      for (const skillName of skills.filter(s => s)) {
        // Find or create skill
        let skill = await prisma.skills.findUnique({
          where: { name: skillName }
        })
        
        if (!skill) {
          skill = await prisma.skills.create({
            data: { 
              id: crypto.randomUUID(),
              name: skillName,
              category: 'General' // You can customize this
            }
          })
        }
        
        // Create jobseeker skill relation
        await prisma.jobseeker_skills.create({
          data: {
            id: crypto.randomUUID(),
            jobseekerId: jobseeker.id,
            skillId: skill.id,
            proficiencyLevel: 'INTERMEDIATE',
            yearsOfExperience: 1
          }
        })
      }
    }

    // Handle certifications
    if (certifications && certifications.length > 0) {
      // Filter only valid certifications with required fields
      const validCertifications = certifications.filter(cert => cert.name && cert.issuingOrganization)
      
      await prisma.certifications.deleteMany({
        where: { jobseekerId: jobseeker.id }
      })

      if (validCertifications.length > 0) {
        await prisma.certifications.createMany({
          data: validCertifications.map(cert => ({
            id: crypto.randomUUID(),
            jobseekerId: jobseeker.id,
            name: cert.name,
            issuingOrganization: cert.issuingOrganization,
            issueDate: cert.issueDate ? new Date(cert.issueDate + '-01') : null,
            expiryDate: cert.expiryDate ? new Date(cert.expiryDate + '-01') : null,
            credentialId: cert.credentialId,
            credentialUrl: cert.credentialUrl,
            certificateUrl: cert.certificateUrl || null,
            updatedAt: new Date()
          }))
        })
      }
    }

    // Fetch complete profile - UPDATED INCLUDES
    const completeProfile = await prisma.jobseekers.findUnique({
      where: { id: jobseeker.id },
      include: {
        educations: true,
        work_experiences: true,
        jobseeker_skills: {
          include: {
            skills: true
          }
        },
        certifications: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Profile saved successfully',
      profile: completeProfile,
      completeness: completeness
    })
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Failed to save profile', 
        details: error.message,
        type: error.name
      },
      { status: 500 }
    )
  }
}

export async function GET(request) {
  try {
    // Verify authentication - AWAIT cookies()
    const cookieStore = await cookies()
    const token = cookieStore.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    let decoded
    try {
      decoded = jwt.verify(token.value, JWT_SECRET)
    } catch (jwtError) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    const userId = decoded.userId

    // Fetch profile with all relations - OPTIMIZED with select
    const profile = await prisma.jobseekers.findUnique({
      where: { userId: userId },
      select: {
        id: true,
        userId: true,
        photo: true,
        firstName: true,
        lastName: true,
        dateOfBirth: true,
        gender: true,
        religion: true,
        maritalStatus: true,
        nationality: true,
        idNumber: true,
        phone: true,
        email: true,
        address: true,
        city: true,
        province: true,
        postalCode: true,
        kecamatan: true,
        // Include users to get registration email
        users: {
          select: {
            email: true
          }
        },
        kelurahan: true,
        currentTitle: true,
        summary: true,
        linkedinUrl: true,
        githubUrl: true,
        portfolioUrl: true,
        websiteUrl: true,
        cvUrl: true,
        ktpUrl: true,
        ak1Url: true,
        ijazahUrl: true,
        sertifikatUrl: true,
        suratPengalamanUrl: true,
        lastEducationLevel: true,
        lastEducationInstitution: true,
        lastEducationMajor: true,
        graduationYear: true,
        desiredJobTitle: true,
        desiredSalaryMin: true,
        desiredSalaryMax: true,
        preferredLocation: true,
        preferredJobType: true,
        willingToRelocate: true,
        availableFrom: true,
        profileCompleted: true,
        profileCompleteness: true,
        isEmployed: true,
        isLookingForJob: true,
        hasDisability: true,
        disabilityType: true,
        employedCompany: true,
        createdAt: true,
        updatedAt: true,
        // Include applications with contract workers to check employment status
        applications: {
          select: {
            id: true,
            status: true,
            contract_workers: {
              select: {
                id: true,
                status: true,
                jobTitle: true
              }
            },
            jobs: {
              select: {
                companies: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        },
        educations: {
          orderBy: { startDate: 'desc' },
          select: {
            id: true,
            institution: true,
            degree: true,
            fieldOfStudy: true,
            level: true,
            startDate: true,
            endDate: true,
            isCurrent: true,
            gpa: true,
            diplomaUrl: true
          }
        },
        work_experiences: {
          orderBy: { startDate: 'desc' },
          select: {
            id: true,
            company: true,
            position: true,
            location: true,
            startDate: true,
            endDate: true,
            isCurrent: true,
            description: true,
            achievements: true
          }
        },
        jobseeker_skills: {
          select: {
            id: true,
            proficiencyLevel: true,
            yearsOfExperience: true,
            skills: {
              select: { id: true, name: true }
            }
          }
        },
        certifications: {
          orderBy: { issueDate: 'desc' },
          select: {
            id: true,
            name: true,
            issuingOrganization: true,
            issueDate: true,
            expiryDate: true,
            credentialId: true,
            credentialUrl: true,
            certificateUrl: true
          }
        }
      }
    })

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Check for active contract workers to determine employment status
    const activeContractApp = profile.applications?.find(app => 
      app.contract_workers && 
      app.contract_workers.length > 0 &&
      app.contract_workers.some(cw => cw.status === 'ACTIVE')
    )
    
    const hasActiveContract = !!activeContractApp
    const employedCompanyName = activeContractApp?.jobs?.companies?.name || null

    // Transform jobseekerSkills to simple skills array for frontend
    const transformedProfile = {
      ...profile,
      // Use registration email if jobseeker email is empty
      email: profile.email || profile.users?.email || '',
      // Override isEmployed and isLookingForJob based on active contract
      isEmployed: hasActiveContract,
      isLookingForJob: !hasActiveContract,
      employedCompany: employedCompanyName || profile.employedCompany,
      skills: profile.jobseeker_skills.map(js => ({
        id: js.id,
        name: js.skills.name,
        proficiencyLevel: js.proficiencyLevel,
        yearsOfExperience: js.yearsOfExperience
      }))
    }
    
    // Remove applications and users from response (not needed in frontend)
    delete transformedProfile.applications
    delete transformedProfile.users

    return NextResponse.json({ 
      success: true,
      profile: transformedProfile 
    })
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Failed to get profile',
        details: error.message
      },
      { status: 500 }
    )
  }
}

export async function PATCH(request) {
  try {
    // Verify authentication
    const cookieStore = await cookies()
    const token = cookieStore.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const decoded = jwt.verify(token.value, JWT_SECRET)
    const userId = decoded.userId

    // Get only the fields to update
    const body = await request.json()
    
    // Update only provided fields
    const jobseeker = await prisma.jobseekers.update({
      where: { userId: userId },
      data: body
    })

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      profile: jobseeker
    })
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Failed to update profile',
        details: error.message
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request) {
  try {
    // Verify authentication
    const cookieStore = await cookies()
    const token = cookieStore.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const decoded = jwt.verify(token.value, JWT_SECRET)
    const userId = decoded.userId

    // Get jobseeker
    const jobseeker = await prisma.jobseekers.findUnique({
      where: { userId: userId }
    })

    if (!jobseeker) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Delete all related data (cascade should handle this, but explicit is better)
    await prisma.educations.deleteMany({
      where: { jobseekerId: jobseeker.id }
    })
    
    await prisma.work_experiences.deleteMany({
      where: { jobseekerId: jobseeker.id }
    })
    
    await prisma.jobseeker_skills.deleteMany({
      where: { jobseekerId: jobseeker.id }
    })
    
    await prisma.certifications.deleteMany({
      where: { jobseekerId: jobseeker.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Profile data deleted successfully'
    })
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Failed to delete profile',
        details: error.message
      },
      { status: 500 }
    )
  }
}