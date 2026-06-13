
//app/api/profile/recruiter/jobs/[slug]/toggle-status/route.js
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'
import { validateCSRFToken, csrfErrorResponse } from '@/lib/csrf'

export async function POST(request, { params }) {
  try {
    if (!validateCSRFToken(request)) {
      return csrfErrorResponse()
    }

    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
    const { slug } = await params
    const body = await request.json().catch(() => ({}))
    const { applicationDeadline } = body

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

    if (job.isActive) {
      if (job.status !== 'ACTIVE') {
        return NextResponse.json(
          { error: 'Status lowongan tidak valid untuk dinonaktifkan' },
          { status: 400 }
        )
      }

      const updatedJob = await prisma.jobs.update({
        where: { slug },
        data: {
          isActive: false,
          status: 'CLOSED'
        }
      })

      return NextResponse.json({
        success: true,
        job: updatedJob,
        message: 'Lowongan berhasil dinonaktifkan'
      })
    }

    if (job.status === 'PENDING') {
      return NextResponse.json(
        { error: 'Lowongan sudah menunggu validasi admin' },
        { status: 400 }
      )
    }

    if (job.status === 'REJECTED') {
      return NextResponse.json(
        { error: 'Lowongan ditolak. Silakan perbaiki lowongan untuk validasi ulang.' },
        { status: 400 }
      )
    }

    if (!['ACTIVE', 'CLOSED'].includes(job.status)) {
      return NextResponse.json(
        { error: 'Lowongan belum dapat diajukan aktif ulang' },
        { status: 400 }
      )
    }

    if (!applicationDeadline) {
      return NextResponse.json(
        { error: 'Tanggal batas akhir lamaran wajib diisi' },
        { status: 400 }
      )
    }

    const deadline = new Date(applicationDeadline)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const deadlineDate = new Date(deadline)
    deadlineDate.setHours(0, 0, 0, 0)

    if (Number.isNaN(deadline.getTime()) || deadlineDate < today) {
      return NextResponse.json(
        { error: 'Tanggal batas akhir lamaran harus hari ini atau setelahnya' },
        { status: 400 }
      )
    }

    const updatedJob = await prisma.jobs.update({
      where: { slug },
      data: {
        isActive: false,
        status: 'PENDING',
        applicationDeadline: deadline,
        rejectionReason: null,
        publishedAt: null
      }
    })

    return NextResponse.json({
      success: true,
      job: updatedJob,
      message: 'Lowongan dikirim ulang untuk validasi admin'
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to toggle job status' },
      { status: 500 }
    )
  }
}
