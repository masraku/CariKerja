import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(request) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    
    // Verify token
    const decoded = verifyToken(token)
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Get user from database with minimal profile data
    const user = await prisma.users.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        jobseekers: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            photo: true,
            currentTitle: true,
            city: true,
            profileCompleted: true,
            profileCompleteness: true
          }
        },
        recruiters: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            position: true,
            photoUrl: true,
            isVerified: true,
            companies: {
              select: {
                id: true,
                name: true,
                logo: true,
                status: true,
                verified: true
              }
            }
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (user.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Account is not active' },
        { status: 403 }
      )
    }

    // Prepare user data in the same format as login
    const jobseeker = Array.isArray(user.jobseekers) ? user.jobseekers[0] : user.jobseekers
    const recruiter = Array.isArray(user.recruiters) ? user.recruiters[0] : user.recruiters
    
    let userData = {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      name: user.role === 'JOBSEEKER' 
        ? `${jobseeker?.firstName || ''} ${jobseeker?.lastName || ''}`.trim()
        : `${recruiter?.firstName || ''} ${recruiter?.lastName || ''}`.trim()
    }

    // Add role-specific data
    if (user.role === 'JOBSEEKER' && jobseeker) {
      userData.jobseeker = {
        id: jobseeker.id,
        photo: jobseeker.photo,
        profileCompleted: jobseeker.profileCompleted,
        profileCompleteness: jobseeker.profileCompleteness,
        firstName: jobseeker.firstName,
        lastName: jobseeker.lastName,
        currentTitle: jobseeker.currentTitle,
        city: jobseeker.city
      }
    }

    if (user.role === 'RECRUITER' && recruiter) {
      userData.recruiter = {
        id: recruiter.id,
        photo: recruiter.photoUrl,
        isVerified: recruiter.isVerified,
        firstName: recruiter.firstName,
        lastName: recruiter.lastName,
        position: recruiter.position
      }
      userData.company = recruiter.companies
    }

    return NextResponse.json({
      success: true,
      user: userData
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get user data' },
      { status: 500 }
    )
  }
}