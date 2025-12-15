import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
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

        // Optional: Update application respondedAt timestamp
        await prisma.applications.update({
            where: { id },
            data: {
                respondedAt: new Date()
            }
        })

        return NextResponse.json({
            success: true,
            message: 'Selamat! Tawaran telah diterima. Status pencari kerja Anda sekarang: Tidak Aktif'
        })
    } catch (error) {
        console.error('Accept offer error:', error)
        return NextResponse.json({ 
            error: 'Terjadi kesalahan saat menerima tawaran' 
        }, { status: 500 })
    }
}
