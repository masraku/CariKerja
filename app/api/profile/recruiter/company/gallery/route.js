import { NextResponse } from 'next/server'
import { requireRecruiter } from '@/lib/authHelper'
import { uploadCompanyGalleryPhoto, deleteCompanyGalleryPhoto } from '@/lib/supabaseStorage'
import { prisma } from '@/lib/prisma'

// Upload gallery photo
export async function POST(request) {
    try {
        const auth = await requireRecruiter(request)
        
        if (auth.error) {
            return NextResponse.json(
                { error: auth.error },
                { status: auth.status }
            )
        }

        const { recruiter } = auth

        // Get company
        const company = await prisma.companies.findUnique({
            where: { id: recruiter.companyId },
            select: { id: true, gallery: true }
        })

        if (!company) {
            return NextResponse.json(
                { error: 'Company not found' },
                { status: 404 }
            )
        }

        // Check gallery limit (max 10 photos)
        if (company.gallery && company.gallery.length >= 10) {
            return NextResponse.json(
                { error: 'Maximum 10 photos allowed in gallery' },
                { status: 400 }
            )
        }

        // Get uploaded file
        const formData = await request.formData()
        const file = formData.get('photo')

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            )
        }

        // Validate file
        if (!file.type.startsWith('image/')) {
            return NextResponse.json(
                { error: 'File must be an image' },
                { status: 400 }
            )
        }

        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json(
                { error: 'File size must be less than 5MB' },
                { status: 400 }
            )
        }

        // Upload to Supabase
        const photoUrl = await uploadCompanyGalleryPhoto(file, company.id)

        // Add to company gallery
        const updatedCompany = await prisma.companies.update({
            where: { id: company.id },
            data: {
                gallery: {
                    push: photoUrl
                }
            }
        })

        return NextResponse.json({
            success: true,
            photoUrl,
            gallery: updatedCompany.gallery,
            message: 'Photo added to gallery'
        })

    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to upload photo' },
            { status: 500 }
        )
    }
}

// Delete gallery photo
export async function DELETE(request) {
    try {
        const auth = await requireRecruiter(request)
        
        if (auth.error) {
            return NextResponse.json(
                { error: auth.error },
                { status: auth.status }
            )
        }

        const { recruiter } = auth
        const { photoUrl } = await request.json()

        if (!photoUrl) {
            return NextResponse.json(
                { error: 'Photo URL required' },
                { status: 400 }
            )
        }

        // Get company
        const company = await prisma.companies.findUnique({
            where: { id: recruiter.companyId },
            select: { id: true, gallery: true }
        })

        if (!company) {
            return NextResponse.json(
                { error: 'Company not found' },
                { status: 404 }
            )
        }

        // Check if photo exists in gallery
        if (!company.gallery || !company.gallery.includes(photoUrl)) {
            return NextResponse.json(
                { error: 'Photo not found in gallery' },
                { status: 404 }
            )
        }

        // Delete from Supabase
        await deleteCompanyGalleryPhoto(photoUrl, company.id)

        // Remove from database
        const newGallery = company.gallery.filter(url => url !== photoUrl)
        const updatedCompany = await prisma.companies.update({
            where: { id: company.id },
            data: { gallery: newGallery }
        })

        return NextResponse.json({
            success: true,
            gallery: updatedCompany.gallery,
            message: 'Photo removed from gallery'
        })

    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to delete photo' },
            { status: 500 }
        )
    }
}
