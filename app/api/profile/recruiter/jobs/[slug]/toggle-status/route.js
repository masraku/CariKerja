
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

    console.log('🔄 Toggling job status:', slug)

    // Verify job ownership
    const job = await prisma.job.findUnique({
      where: { slug },
      include: {
        company: {
          include: {
            recruiters: {
              where: { userId: decoded.userId }
            }
          }
        }
      }
    })

    if (!job || job.company.recruiters.length === 0) {
      return NextResponse.json(
        { error: 'Job not found or unauthorized' },
        { status: 404 }
      )
    }

    // Toggle status
    const updatedJob = await prisma.job.update({
      where: { slug },
      data: {
        isActive: !job.isActive
      }
    })

    console.log(`✅ Job status changed to: ${updatedJob.isActive ? 'active' : 'inactive'}`)

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