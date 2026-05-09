import { NextResponse } from 'next/server'
import { requireRecruiter } from '@/lib/authHelper'
import { uploadRecruiterPhoto } from '@/lib/supabaseStorage'
import { prisma } from '@/lib/prisma'
import { validateCSRFToken, csrfErrorResponse } from '@/lib/csrf'
import { validateFile } from '@/lib/fileValidation'

export async function POST(request) {
    try {
        if (!validateCSRFToken(request)) {
            return csrfErrorResponse()
        }

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

        const fileBuffer = Buffer.from(await file.arrayBuffer())
        const validation = await validateFile(file, fileBuffer, {
            allowDocuments: false,
            maxSize: 5 * 1024 * 1024
        })

        if (!validation.valid) {
            return NextResponse.json(
                { error: validation.error },
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
        return NextResponse.json(
            { error: 'Failed to upload photo' },
            { status: 500 }
        )
    }
}
