import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function POST(request, { params }) {
    try {
        const { id } = await params

        // Verify token
        const authHeader = request.headers.get('authorization')
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const token = authHeader.split(' ')[1]
        const decoded = verifyToken(token)

        if (!decoded || decoded.role !== 'JOBSEEKER') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get jobseeker
        const jobseeker = await prisma.jobseekers.findUnique({
            where: { userId: decoded.userId }
        })

        if (!jobseeker) {
            return NextResponse.json({ error: 'Profil jobseeker tidak ditemukan' }, { status: 404 })
        }

        // Get application
        const application = await prisma.applications.findFirst({
            where: {
                id,
                jobseekerId: jobseeker.id
            },
            include: {
                jobs: {
                    include: {
                        companies: true
                    }
                }
            }
        })

        if (!application) {
            return NextResponse.json({ error: 'Lamaran tidak ditemukan' }, { status: 404 })
        }

        // Check if application is in ACCEPTED status
        if (application.status !== 'ACCEPTED') {
            return NextResponse.json({ 
                error: 'Lamaran harus berstatus "Diterima" untuk dapat menerima tawaran' 
            }, { status: 400 })
        }

        // Check if jobseeker already confirmed another offer
        const existingConfirmed = await prisma.applications.findFirst({
            where: {
                jobseekerId: jobseeker.id,
                confirmedByJobseeker: true,
                id: { not: id }
            },
            include: {
                jobs: {
                    include: { companies: true }
                }
            }
        })

        if (existingConfirmed) {
            return NextResponse.json({ 
                error: 'Anda sudah menerima tawaran lain',
                message: `Anda sudah menerima tawaran dari ${existingConfirmed.jobs.companies.name} untuk posisi ${existingConfirmed.jobs.title}`
            }, { status: 400 })
        }

        // Mark this application as confirmed by jobseeker
        await prisma.applications.update({
            where: { id },
            data: {
                confirmedByJobseeker: true,
                respondedAt: new Date()
            }
        })

        // Auto-withdraw all other pending applications for this jobseeker
        const withdrawnApps = await prisma.applications.updateMany({
            where: {
                jobseekerId: jobseeker.id,
                id: { not: id },
                status: {
                    in: ['PENDING', 'REVIEWING', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'INTERVIEW_COMPLETED']
                }
            },
            data: {
                status: 'WITHDRAWN',
                withdrawnAt: new Date(),
                withdrawReason: 'Otomatis ditarik karena menerima tawaran dari perusahaan lain'
            }
        })

        // Update jobseeker profile - set isLookingForJob to false
        await prisma.jobseekers.update({
            where: { id: jobseeker.id },
            data: {
                isLookingForJob: false,
                isEmployed: true,
                employedAt: new Date(),
                employedCompany: application.jobs?.companies?.name || null
            }
        })

        return NextResponse.json({
            success: true,
            message: `Selamat! Anda telah menerima tawaran dari ${application.jobs?.companies?.name}. ${withdrawnApps.count > 0 ? `${withdrawnApps.count} lamaran lainnya telah ditarik secara otomatis.` : ''}`
        })
    } catch (error) {
        console.error('Accept offer error:', error)
        return NextResponse.json({ 
            error: 'Terjadi kesalahan saat menerima tawaran' 
        }, { status: 500 })
    }
}
