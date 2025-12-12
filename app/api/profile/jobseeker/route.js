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
      console.error('❌ No token found')
      return NextResponse.json(
        { error: 'Unauthorized - No token' },
        { status: 401 }
      )
    }

    let decoded
    try {
      decoded = jwt.verify(token.value, JWT_SECRET)
    } catch (jwtError) {
      console.error('❌ JWT verification failed:', jwtError)
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
      
      // Education
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
      console.error('❌ User not found:', userId)
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (user.role !== 'JOBSEEKER') {
      console.error('❌ User is not a jobseeker, role:', user.role)
      return NextResponse.json(
        { error: 'User is not a jobseeker' },
        { status: 403 }
      )
    }

    if (!user.jobseekers) {
      console.error('❌ Jobseeker profile not found for user:', userId)
      return NextResponse.json(
        { error: 'Jobseeker profile not found' },
        { status: 404 }
      )
    }

    // Calculate profile completeness
    const totalFields = 15
    let filledFields = 0
    
    if (photo) filledFields++
    if (firstName && lastName) filledFields++
    if (dateOfBirth) filledFields++
    if (gender) filledFields++
    if (religion) filledFields++
    if (phone) filledFields++
    if (address && city && province) filledFields++
    if (summary) filledFields++
    if (cvUrl) filledFields++
    if (educations && educations.length > 0) filledFields++
    if (experiences && experiences.length > 0) filledFields++
    if (skills && skills.length > 0) filledFields++
    if (desiredJobTitle) filledFields++
    if (desiredSalaryMin && desiredSalaryMax) filledFields++
    if (preferredJobType) filledFields++
    
    const completeness = Math.round((filledFields / totalFields) * 100)

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
      await prisma.educations.deleteMany({
        where: { jobseekerId: jobseeker.id }
      })

      await prisma.educations.createMany({
        data: educations.map(edu => ({
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

    // Handle work experiences
    if (experiences && experiences.length > 0 && experiences[0].company) {
      await prisma.work_experiences.deleteMany({
        where: { jobseekerId: jobseeker.id }
      })

      for (const exp of experiences) {
        if (exp.company) {
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
    if (certifications && certifications.length > 0 && certifications[0].name) {
      await prisma.certifications.deleteMany({
        where: { jobseekerId: jobseeker.id }
      })

      await prisma.certifications.createMany({
        data: certifications
          .filter(cert => cert.name)
          .map(cert => ({
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
    console.error('💥 Save profile error:', error)
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    
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
      console.error('❌ No token found')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    let decoded
    try {
      decoded = jwt.verify(token.value, JWT_SECRET)
    } catch (jwtError) {
      console.error('❌ JWT verification failed:', jwtError)
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    const userId = decoded.userId

    // Fetch profile with all relations - UPDATED INCLUDES
    const profile = await prisma.jobseekers.findUnique({
      where: { userId: userId },
      include: {
        educations: {
          orderBy: {
            startDate: 'desc'
          }
        },
        work_experiences: {
          orderBy: {
            startDate: 'desc'
          }
        },
        jobseeker_skills: {
          include: {
            skills: true
          }
        },
        certifications: {
          orderBy: {
            issueDate: 'desc'
          }
        }
      }
    })

    if (!profile) {
      console.error('❌ Profile not found for userId:', userId)
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Transform jobseekerSkills to simple skills array for frontend
    const transformedProfile = {
      ...profile,
      skills: profile.jobseeker_skills.map(js => ({
        id: js.id,
        name: js.skills.name,
        proficiencyLevel: js.proficiencyLevel,
        yearsOfExperience: js.yearsOfExperience
      }))
    }

    return NextResponse.json({ 
      success: true,
      profile: transformedProfile 
    })
  } catch (error) {
    console.error('💥 Get profile error:', error)
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    })
    
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
    console.error('💥 Patch profile error:', error)
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
    console.error('💥 Delete profile error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to delete profile',
        details: error.message
      },
      { status: 500 }
    )
  }
}