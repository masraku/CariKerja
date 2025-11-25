import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function getCurrentUser(request) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { error: 'No token provided', status: 401 }
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix

    // Verify token
    const decoded = verifyToken(token)

    if (!decoded) {
      return { error: 'Invalid or expired token', status: 401 }
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        status: true
      }
    })

    if (!user) {
      return { error: 'User not found', status: 404 }
    }

    if (user.status !== 'ACTIVE') {
      return { error: 'Account is not active', status: 403 }
    }

    return { user }
  } catch (error) {
    console.error('Auth error:', error)
    return { error: 'Authentication failed', status: 500 }
  }
}

export async function requireJobseeker(request) {
  const { user, error, status } = await getCurrentUser(request)

  if (error) {
    return { error, status }
  }

  if (user.role !== 'JOBSEEKER') {
    return { error: 'Access denied. Jobseeker role required', status: 403 }
  }

  // Get jobseeker profile
  const jobseeker = await prisma.jobseeker.findUnique({
    where: { userId: user.id }
  })

  if (!jobseeker) {
    console.error('Jobseeker not found for user:', user.id, user.email)
    
    // Check if there are any jobseekers with same email
    const allJobseekers = await prisma.jobseeker.findMany({
      where: {
        user: {
          email: user.email
        }
      }
    })
    
    console.log('Found jobseekers with same email:', allJobseekers.length)
    
    return { 
      error: 'Jobseeker profile not found. Please complete your profile first.', 
      status: 404,
      debug: {
        userId: user.id,
        email: user.email,
        foundJobseekers: allJobseekers.length
      }
    }
  }

  return { user, jobseeker }
}

export async function requireRecruiter(request) {
  const { user, error, status } = await getCurrentUser(request)

  if (error) {
    return { error, status }
  }

  if (user.role !== 'RECRUITER') {
    return { error: 'Access denied. Recruiter role required', status: 403 }
  }

  // Get recruiter profile (might not exist yet)
  const recruiter = await prisma.recruiter.findUnique({
    where: { userId: user.id },
    include: {
      company: true
    }
  })

  if (!recruiter) {
    return { error: 'Recruiter profile not found', status: 404 }
  }

  return { user, recruiter }
}