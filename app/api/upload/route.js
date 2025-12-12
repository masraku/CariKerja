import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/authHelper'
import { uploadFileToSupabase, supabaseAdmin } from '@/lib/supabase'
import { prisma } from '@/lib/prisma'

export async function POST(request) {
    try {
        // Authenticate
        const auth = await getCurrentUser(request)
        
        if (auth.error) {
            return NextResponse.json(
                { error: auth.error },
                { status: auth.status }
            )
        }

        const { user } = auth
        const formData = await request.formData()
        const file = formData.get('file')
        const type = formData.get('type')
        const bucket = formData.get('bucket') // 'jobseeker-photos', 'jobseeker-cv', etc.
        const companyId = formData.get('companyId') // For company gallery uploads

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            )
        }

        // Validate file type based on bucket/purpose
        const isDocument = bucket?.includes('cv') || 
                          bucket?.includes('diploma') || 
                          bucket?.includes('certificate') ||
                          bucket?.includes('documents') ||
                          bucket?.includes('ktp') ||
                          bucket?.includes('ak1')
        
        if (isDocument) {
            // Allow PDF and Images for documents
            if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
                return NextResponse.json(
                    { error: 'File harus berupa gambar (JPG, PNG) atau PDF' },
                    { status: 400 }
                )
            }
        } else {
            // Default to images only (for photos)
            if (!file.type.startsWith('image/')) {
                return NextResponse.json(
                    { error: 'File harus berupa gambar (JPG, PNG)' },
                    { status: 400 }
                )
            }
        }

        // Validate file size (max 2MB for Supabase free tier)
        const maxSize = 2 * 1024 * 1024 // 2MB
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: `Ukuran file terlalu besar (${(file.size / 1024 / 1024).toFixed(2)}MB). Maksimal 2MB.` },
                { status: 400 }
            )
        }

        let photoUrl

        if (type === 'recruiter-photo') {
            // Get recruiter ID
            const recruiter = await prisma.recruiters.findUnique({
                where: { userId: user.id },
                select: { id: true }
            })

            if (!recruiter) {
                return NextResponse.json(
                    { error: 'Recruiter profile not found' },
                    { status: 404 }
                )
            }

            // Upload to Supabase
            const fileExt = file.name.split('.').pop()
            const fileName = `profile.${fileExt}`
            const filePath = `recruiter-photos/${recruiter.id}/${fileName}`

            // Delete old photo first
            await supabaseAdmin.storage
                .from('Profile')
                .remove([filePath])
                .catch(() => {})

            // Upload new photo
            const { data, error } = await supabaseAdmin.storage
                .from('Profile')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: true
                })

            if (error) {
                console.error('Upload error:', error)
                return NextResponse.json(
                    { error: `Failed to upload: ${error.message}` },
                    { status: 500 }
                )
            }

            // Get public URL
            const { data: { publicUrl } } = supabaseAdmin.storage
                .from('Profile')
                .getPublicUrl(filePath)

            photoUrl = publicUrl

            // Update database
            await prisma.recruiters.update({
                where: { id: recruiter.id },
                data: { photoUrl }
            })

        } else if (type === 'company-gallery') {
            if (!companyId) {
                return NextResponse.json(
                    { error: 'Company ID required' },
                    { status: 400 }
                )
            }

            // Verify recruiter has access to this company
            const recruiter = await prisma.recruiters.findUnique({
                where: { userId: user.id },
                select: { companyId: true }
            })

            if (!recruiter || recruiter.companyId !== companyId) {
                return NextResponse.json(
                    { error: 'Unauthorized' },
                    { status: 403 }
                )
            }

            // Check gallery limit
            const company = await prisma.companies.findUnique({
                where: { id: companyId },
                select: { gallery: true }
            })

            if (company.gallery && company.gallery.length >= 10) {
                return NextResponse.json(
                    { error: 'Maximum 10 photos allowed' },
                    { status: 400 }
                )
            }

            // Upload to Supabase
            const fileExt = file.name.split('.').pop()
            const fileName = `${Date.now()}.${fileExt}`
            const filePath = `company-gallery/${companyId}/${fileName}`

            const { data, error } = await supabaseAdmin.storage
                .from('Profile')
                .upload(filePath, file, {
                    cacheControl: '3600'
                })

            if (error) {
                console.error('Upload error:', error)
                return NextResponse.json(
                    { error: `Failed to upload: ${error.message}` },
                    { status: 500 }
                )
            }

            // Get public URL
            const { data: { publicUrl } } = supabaseAdmin.storage
                .from('Profile')
                .getPublicUrl(filePath)

            photoUrl = publicUrl

            // Update database - add to gallery
            await prisma.companies.update({
                where: { id: companyId },
                data: {
                    gallery: {
                        push: photoUrl
                    }
                }
            })

        } else if (bucket && (bucket === 'Profile' || bucket.includes('jobseeker') || bucket.includes('cv') || bucket.includes('diploma') || bucket.includes('certificate') || bucket.includes('photo'))) {
            // Jobseeker Uploads (CV, Diploma, Certificate, Photo)
            
            // Get jobseeker ID
            const jobseeker = await prisma.jobseekers.findUnique({
                where: { userId: user.id },
                select: { id: true }
            })

            if (!jobseeker) {
                return NextResponse.json(
                    { error: 'Jobseeker profile not found' },
                    { status: 404 }
                )
            }

            // Determine folder path
            // bucket example: 'jobseeker-cv', 'jobseeker-diploma', 'jobseeker-photo'
            const folder = bucket.replace('jobseeker-', '')
            const fileExt = file.name.split('.').pop()
            const fileName = `${folder}-${Date.now()}.${fileExt}`
            const filePath = `jobseekers/${jobseeker.id}/${folder}/${fileName}`

            // Upload to Supabase
            const { data, error } = await supabaseAdmin.storage
                .from('Profile')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: true
                })

            if (error) {
                console.error('Upload error:', error)
                return NextResponse.json(
                    { error: `Failed to upload: ${error.message}` },
                    { status: 500 }
                )
            }

            // Get public URL
            const { data: { publicUrl } } = supabaseAdmin.storage
                .from('Profile')
                .getPublicUrl(filePath)

            photoUrl = publicUrl

        } else {
            return NextResponse.json(
                { error: 'Invalid upload type' },
                { status: 400 }
            )
        }

        return NextResponse.json({
            success: true,
            url: photoUrl,
            message: 'File uploaded successfully'
        })

    } catch (error) {
        console.error('❌ Upload error:', error)
        return NextResponse.json(
            { error: 'Failed to upload file' },
            { status: 500 }
        )
    }
}

// DELETE - Remove photo from gallery
export async function DELETE(request) {
    try {
        const auth = await getCurrentUser(request)
        
        if (auth.error) {
            return NextResponse.json(
                { error: auth.error },
                { status: auth.status }
            )
        }

        const { user } = auth
        const { photoUrl, companyId } = await request.json()

        if (!photoUrl || !companyId) {
            return NextResponse.json(
                { error: 'Photo URL and Company ID required' },
                { status: 400 }
            )
        }

        // Verify access
        const recruiter = await prisma.recruiters.findUnique({
            where: { userId: user.id },
            select: { companyId: true }
        })

        if (!recruiter || recruiter.companyId !== companyId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 403 }
            )
        }

        // Extract filename from URL
        const urlParts = photoUrl.split('/')
        const fileName = urlParts[urlParts.length - 1]
        const filePath = `company-gallery/${companyId}/${fileName}`

        // Delete from Supabase
        await supabaseAdmin.storage
            .from('Profile')
            .remove([filePath])

        // Remove from database
        const company = await prisma.companies.findUnique({
            where: { id: companyId },
            select: { gallery: true }
        })

        const newGallery = company.gallery.filter(url => url !== photoUrl)

        await prisma.companies.update({
            where: { id: companyId },
            data: { gallery: newGallery }
        })

        return NextResponse.json({
            success: true,
            message: 'Photo deleted successfully'
        })

    } catch (error) {
        console.error('❌ Delete error:', error)
        return NextResponse.json(
            { error: 'Failed to delete photo' },
            { status: 500 }
        )
    }
}