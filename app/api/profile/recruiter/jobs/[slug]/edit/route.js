//app/api/profile/recruiter/jobs/[slug]/edit/route.js

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'

export async function GET(request, { params }) {
  try {
    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
    const { slug } = await params

    // Get job with ownership verification
    const job = await prisma.jobs.findUnique({
      where: { slug },
      include: {
        companies: {
          include: {
            recruiters: {
              where: { userId: decoded.userId }
            }
          }
        },
        job_skills: {
            include: {
                skills: true
            }
        }
      }
    })

    if (!job || job.companies.recruiters.length === 0) {
      return NextResponse.json(
        { error: 'Job not found or unauthorized' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      job: {
        ...job,
        skills: job.job_skills?.map(js => js.skills.name) || []
      }
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to load job' },
      { status: 500 }
    )
  }
}
