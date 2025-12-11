import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(request, { params }) {
    try {
        const { id: applicationId } = await params
        
        const authHeader = request.headers.get('authorization')
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const token = authHeader.substring(7)
        const decoded = await verifyToken(token)
        
        if (!decoded || decoded.role !== 'JOBSEEKER') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get jobseeker profile
        const jobseeker = await prisma.jobseekers.findFirst({
            where: { userId: decoded.userId }
        })

        if (!jobseeker) {
            return NextResponse.json({ error: 'Jobseeker profile not found' }, { status: 404 })
        }

        // Get application to verify ownership
        const application = await prisma.applications.findFirst({
            where: {
                id: applicationId,
                jobseekerId: jobseeker.id
            }
        })

        if (!application) {
            return NextResponse.json({ error: 'Application not found' }, { status: 404 })
        }

        // Get interview participant with interview details
        const participant = await prisma.interview_participants.findFirst({
            where: {
                applicationId: applicationId
            },
            include: {
                interviews: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        scheduledAt: true,
                        duration: true,
                        meetingUrl: true,
                        meetingType: true,
                        location: true,
                        status: true
                    }
                }
            }
        })

        if (!participant || !participant.interviews) {
            return NextResponse.json({ interview: null })
        }

        return NextResponse.json({ 
            interview: participant.interviews,
            participantStatus: participant.status
        })
    } catch (error) {
        console.error('Get application interview error:', error)
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        )
    }
}
