
//app/api/profile/recruiter/jobs/[slug]/toggle-status/route.js
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function POST(request, { params }) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    const { slug } = await params

    // Verify job ownership
    const job = await prisma.jobs.findUnique({
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

    if (!job || job.companies.recruiters.length === 0) {
      return NextResponse.json(
        { error: 'Job not found or unauthorized' },
        { status: 404 }
      )
    }

    // Toggle status
    const updatedJob = await prisma.jobs.update({
      where: { slug },
      data: {
        isActive: !job.isActive
      }
    })

    return NextResponse.json({
      success: true,
      job: updatedJob
    })

  } catch (error) {
    console.error('❌ Toggle status error:', error)
    return NextResponse.json(
      { error: 'Failed to toggle job status' },
      { status: 500 }
    )
  }
}