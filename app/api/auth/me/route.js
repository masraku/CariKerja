import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(request) {
  try {
    console.log('🔍 /api/auth/me called')
    
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization')
    console.log('🔑 Auth header:', authHeader ? 'EXISTS' : 'MISSING')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No token provided')
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    console.log('🔓 Token extracted, verifying...')
    
    // Verify token
    const decoded = verifyToken(token)
    console.log('✅ Token decoded:', decoded)
    
    if (!decoded) {
      console.log('❌ Invalid token')
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    console.log('📡 Fetching user from database...')
    // Get user from database with profile data
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
                logo: true
              }
            }
          }
        }
      }
    })

    console.log('👤 User found:', user ? 'YES' : 'NO')

    if (!user) {
      console.log('❌ User not found in database')
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (user.status !== 'ACTIVE') {
      console.log('❌ User account not active')
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

    console.log('✅ Returning user data:', userData)
    return NextResponse.json({
      success: true,
      user: userData
    })

  } catch (error) {
    console.error('❌ Get current user error:', error)
    return NextResponse.json(
      { error: 'Failed to get user data' },
      { status: 500 }
    )
  }
}