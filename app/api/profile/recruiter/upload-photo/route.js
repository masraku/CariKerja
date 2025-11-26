import { NextResponse } from 'next/server'
import { getCurrentUser, requireRecruiter } from '@/lib/authHelper'
import { uploadRecruiterPhoto } from '@/lib/supabaseStorage'
import { prisma } from '@/lib/prisma'

export async function POST(request) {
    try {
        // Authenticate
        const auth = await requireRecruiter(request)
        
        if (auth.error) {
            return NextResponse.json(
                { error: auth.error },
                { status: auth.status }
            )
        }

        const { recruiter } = auth

        // Get uploaded file
        const formData = await request.formData()
        const file = formData.get('photo')

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            )
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            return NextResponse.json(
                { error: 'File must be an image' },
                { status: 400 }
            )
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json(
                { error: 'File size must be less than 5MB' },
                { status: 400 }
            )
        }

        // Upload to Supabase
        const photoUrl = await uploadRecruiterPhoto(file, recruiter.id)

        // Update database
        const updatedRecruiter = await prisma.recruiters.update({
            where: { id: recruiter.id },
            data: { photoUrl }
        })

        return NextResponse.json({
            success: true,
            photoUrl,
            message: 'Profile photo uploaded successfully'
        })

    } catch (error) {
        console.error('❌ Upload photo error:', error)
        return NextResponse.json(
            { error: 'Failed to upload photo' },
            { status: 500 }
        )
    }
}
