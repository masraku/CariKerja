import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/authHelper'
import { supabaseAdmin } from '@/lib/supabase'
import { prisma } from '@/lib/prisma'
import sharp from 'sharp'

/**
 * Convert image to WebP format
 * Returns original buffer if file is PDF or conversion fails
 */
async function convertToWebP(file) {
    // Skip PDF files - keep original
    if (file.type === 'application/pdf') {
        const buffer = Buffer.from(await file.arrayBuffer())
        return {
            buffer,
            extension: 'pdf',
            contentType: 'application/pdf'
        }
    }

    // Only process image files
    if (!file.type.startsWith('image/')) {
        const buffer = Buffer.from(await file.arrayBuffer())
        const ext = file.name.split('.').pop()
        return {
            buffer,
            extension: ext,
            contentType: file.type
        }
    }

    try {
        const buffer = Buffer.from(await file.arrayBuffer())
        const webpBuffer = await sharp(buffer)
            .webp({ quality: 80 })
            .toBuffer()
        
        return {
            buffer: webpBuffer,
            extension: 'webp',
            contentType: 'image/webp'
        }
    } catch (error) {
        console.error('WebP conversion failed:', error)
        // Fallback to original if conversion fails
        const buffer = Buffer.from(await file.arrayBuffer())
        const ext = file.name.split('.').pop()
        return {
            buffer,
            extension: ext,
            contentType: file.type
        }
    }
}

function getBucketName(type, bucket) {
    // Photo types -> Profile bucket
    if (type === 'recruiter-photo' || type === 'jobseeker-photo' || type === 'company-gallery') {
        return 'Profile'
    }
    
    // Ijazah/Diploma -> Ijazah bucket
    if (bucket?.includes('diploma') || bucket?.includes('ijazah')) {
        return 'Ijazah'
    }
    
    // CV, AK1, Sertifikat, KTP -> Resume bucket
    if (bucket?.includes('cv') || bucket?.includes('ak1') || 
        bucket?.includes('sertifikat') || bucket?.includes('certificate') ||
        bucket?.includes('ktp') || bucket?.includes('resume') || bucket?.includes('resignation')) {
        return 'Resume'
    }
    
    // Job photos -> Lowongan bucket
    if (type === 'job-photo' || bucket?.includes('job') || bucket?.includes('lowongan') || 
        type === 'contract-doc' || type === 'admin-doc') {
        return 'Lowongan'
    }
    
    // Default jobseeker photo -> Profile
    if (bucket?.includes('photo')) {
        return 'Profile'
    }
    
    // Default to Profile for other cases
    return 'Profile'
}

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
        const bucket = formData.get('bucket')
        const companyId = formData.get('companyId')
        const folder = formData.get('folder')

        if (!file) {
            return NextResponse.json(
                { error: 'Tidak ada file yang dipilih' },
                { status: 400 }
            )
        }

        // Validate file type based on bucket/purpose
        const isDocument = bucket?.includes('cv') || 
                          bucket?.includes('diploma') || 
                          bucket?.includes('certificate') ||
                          bucket?.includes('sertifikat') ||
                          bucket?.includes('ijazah') ||
                          bucket?.includes('ktp') ||
                          bucket?.includes('ak1') ||
                          bucket?.includes('resignation') ||
                          bucket?.includes('resume') ||
                          type === 'contract-doc' ||
                          type === 'admin-doc'
        
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
        const targetBucket = getBucketName(type, bucket)

        // ============ RECRUITER PHOTO ============
        if (type === 'recruiter-photo') {
            const recruiter = await prisma.recruiters.findUnique({
                where: { userId: user.id },
                select: { id: true }
            })

            if (!recruiter) {
                return NextResponse.json(
                    { error: 'Profil rekruter tidak ditemukan' },
                    { status: 404 }
                )
            }

            // Convert image to WebP
            const { buffer, extension, contentType } = await convertToWebP(file)
            const fileName = `profile.${extension}`
            const filePath = `recruiter/${recruiter.id}/${fileName}`

            // Delete old photo first (try both webp and old extensions)
            await supabaseAdmin.storage
                .from(targetBucket)
                .remove([filePath, `recruiter/${recruiter.id}/profile.jpg`, `recruiter/${recruiter.id}/profile.png`, `recruiter/${recruiter.id}/profile.jpeg`])
                .catch(() => {})

            // Upload new photo
            const { data, error } = await supabaseAdmin.storage
                .from(targetBucket)
                .upload(filePath, buffer, {
                    cacheControl: '3600',
                    upsert: true,
                    contentType
                })

            if (error) {
                console.error('Upload error:', error)
                return NextResponse.json(
                    { error: `Gagal mengunggah: ${error.message}` },
                    { status: 500 }
                )
            }

            const { data: { publicUrl } } = supabaseAdmin.storage
                .from(targetBucket)
                .getPublicUrl(filePath)

            photoUrl = publicUrl

            await prisma.recruiters.update({
                where: { id: recruiter.id },
                data: { photoUrl }
            })

        // ============ COMPANY GALLERY ============
        } else if (type === 'company-gallery') {
            if (!companyId) {
                return NextResponse.json(
                    { error: 'ID Perusahaan diperlukan' },
                    { status: 400 }
                )
            }

            const recruiter = await prisma.recruiters.findUnique({
                where: { userId: user.id },
                select: { companyId: true }
            })

            if (!recruiter || recruiter.companyId !== companyId) {
                return NextResponse.json(
                    { error: 'Tidak memiliki akses' },
                    { status: 403 }
                )
            }

            const company = await prisma.companies.findUnique({
                where: { id: companyId },
                select: { gallery: true }
            })

            if (company.gallery && company.gallery.length >= 10) {
                return NextResponse.json(
                    { error: 'Maksimal 10 foto yang diizinkan' },
                    { status: 400 }
                )
            }

            // Convert image to WebP
            const { buffer, extension, contentType } = await convertToWebP(file)
            const fileName = `${Date.now()}.${extension}`
            const filePath = `company/${companyId}/gallery/${fileName}`

            const { data, error } = await supabaseAdmin.storage
                .from(targetBucket)
                .upload(filePath, buffer, {
                    cacheControl: '3600',
                    contentType
                })

            if (error) {
                console.error('Upload error:', error)
                return NextResponse.json(
                    { error: `Gagal mengunggah: ${error.message}` },
                    { status: 500 }
                )
            }

            const { data: { publicUrl } } = supabaseAdmin.storage
                .from(targetBucket)
                .getPublicUrl(filePath)

            photoUrl = publicUrl

            await prisma.companies.update({
                where: { id: companyId },
                data: {
                    gallery: {
                        push: photoUrl
                    }
                }
            })

        // ============ JOB PHOTO (Lowongan) ============
        } else if (type === 'job-photo' || folder === 'job-photos' || bucket?.includes('lowongan')) {
            const recruiter = await prisma.recruiters.findUnique({
                where: { userId: user.id },
                select: { id: true, companyId: true }
            })

            if (!recruiter) {
                return NextResponse.json(
                    { error: 'Profil rekruter tidak ditemukan' },
                    { status: 404 }
                )
            }

            // Convert image to WebP
            const { buffer, extension, contentType } = await convertToWebP(file)
            const fileName = `${Date.now()}.${extension}`
            const filePath = `${recruiter.companyId}/${fileName}`

            const { data, error } = await supabaseAdmin.storage
                .from('Lowongan')
                .upload(filePath, buffer, {
                    cacheControl: '3600',
                    upsert: true,
                    contentType
                })

            if (error) {
                console.error('Upload error:', error)
                return NextResponse.json(
                    { error: `Gagal mengunggah: ${error.message}` },
                    { status: 500 }
                )
            }

            const { data: { publicUrl } } = supabaseAdmin.storage
                .from('Lowongan')
                .getPublicUrl(filePath)

            photoUrl = publicUrl

        // ============ JOBSEEKER UPLOADS ============
        } else if (bucket && (
            bucket.includes('photo') || 
            bucket.includes('cv') || 
            bucket.includes('diploma') || 
            bucket.includes('ijazah') ||
            bucket.includes('certificate') ||
            bucket.includes('sertifikat') ||
            bucket.includes('ktp') ||
            bucket.includes('ak1') ||
            bucket.includes('resignation') ||
            bucket.includes('resume')
        )) {
            const jobseeker = await prisma.jobseekers.findUnique({
                where: { userId: user.id },
                select: { id: true }
            })

            if (!jobseeker) {
                return NextResponse.json(
                    { error: 'Profil pencari kerja tidak ditemukan' },
                    { status: 404 }
                )
            }

            // Determine folder and bucket
            let folderName = 'misc'
            let uploadBucket = targetBucket
            
            if (bucket.includes('photo')) {
                folderName = 'photo'
                uploadBucket = 'Profile'
            } else if (bucket.includes('cv') || bucket.includes('resume')) {
                folderName = 'cv'
                uploadBucket = 'Resume'
            } else if (bucket.includes('diploma') || bucket.includes('ijazah')) {
                folderName = 'ijazah'
                uploadBucket = 'Ijazah'
            } else if (bucket.includes('certificate') || bucket.includes('sertifikat')) {
                folderName = 'sertifikat'
                uploadBucket = 'Resume'
            } else if (bucket.includes('ktp')) {
                folderName = 'ktp'
                uploadBucket = 'Resume'
            } else if (bucket.includes('ak1')) {
                folderName = 'ak1'
                uploadBucket = 'Resume'
            } else if (bucket.includes('resignation')) {
                folderName = 'resignation'
                uploadBucket = 'Resume'
            }

            // Convert image to WebP (PDFs will remain unchanged)
            const { buffer, extension, contentType } = await convertToWebP(file)
            const fileName = `${folderName}-${Date.now()}.${extension}`
            const filePath = `jobseeker/${jobseeker.id}/${folderName}/${fileName}`

            const { data, error } = await supabaseAdmin.storage
                .from(uploadBucket)
                .upload(filePath, buffer, {
                    cacheControl: '3600',
                    upsert: true,
                    contentType
                })

            if (error) {
                console.error('Upload error:', error)
                return NextResponse.json(
                    { error: `Gagal mengunggah: ${error.message}` },
                    { status: 500 }
                )
            }

            const { data: { publicUrl } } = supabaseAdmin.storage
                .from(uploadBucket)
                .getPublicUrl(filePath)

            photoUrl = publicUrl

        // ============ GENERIC UPLOAD ============
        } else {
            // Check if user is ADMIN
            if (user.role === 'ADMIN') {
                let uploadFolder = folder || 'admin-uploads'
                let uploadBucket = targetBucket || 'Lowongan' // Default to Lowongan bucket for admin docs
                
                // Convert image to WebP (PDFs will remain unchanged)
                const { buffer, extension, contentType } = await convertToWebP(file)
                const fileName = `${Date.now()}.${extension}`
                const filePath = `${uploadFolder}/${fileName}`

                const { data, error } = await supabaseAdmin.storage
                    .from(uploadBucket)
                    .upload(filePath, buffer, {
                        cacheControl: '3600',
                        upsert: true,
                        contentType
                    })

                if (error) {
                    console.error('Upload error:', error)
                    return NextResponse.json(
                        { error: `Gagal mengunggah: ${error.message}` },
                        { status: 500 }
                    )
                }

                const { data: { publicUrl } } = supabaseAdmin.storage
                    .from(uploadBucket)
                    .getPublicUrl(filePath)

                photoUrl = publicUrl
            } else {
                // Try to find recruiter first
                let recruiter = await prisma.recruiters.findUnique({
                    where: { userId: user.id },
                    select: { id: true, companyId: true }
                })

                let jobseeker = null
                let uploadFolder = folder || 'misc'
                let uploadBucket = targetBucket

                // Convert image to WebP (PDFs will remain unchanged)
                const { buffer, extension, contentType } = await convertToWebP(file)
                let filePath = ''

                if (recruiter) {
                    // Recruiter path
                    const fileName = `${Date.now()}.${extension}`
                    filePath = `${uploadFolder}/${recruiter.companyId || recruiter.id}/${fileName}`
                } else {
                    // Try jobseeker
                    jobseeker = await prisma.jobseekers.findUnique({
                        where: { userId: user.id },
                        select: { id: true }
                    })

                    if (!jobseeker) {
                        return NextResponse.json(
                            { error: 'Profil tidak ditemukan. Silakan lengkapi profil Anda terlebih dahulu.' },
                            { status: 404 }
                        )
                    }

                    // Jobseeker path
                    const fileName = `${Date.now()}.${extension}`
                    filePath = `jobseeker/${jobseeker.id}/${uploadFolder}/${fileName}`
                }

                const { data, error } = await supabaseAdmin.storage
                    .from(uploadBucket)
                    .upload(filePath, buffer, {
                        cacheControl: '3600',
                        upsert: true,
                        contentType
                    })

                if (error) {
                    console.error('Upload error:', error)
                    return NextResponse.json(
                        { error: `Gagal mengunggah: ${error.message}` },
                        { status: 500 }
                    )
                }

                const { data: { publicUrl } } = supabaseAdmin.storage
                    .from(uploadBucket)
                    .getPublicUrl(filePath)

                photoUrl = publicUrl
            }
        }

        return NextResponse.json({
            success: true,
            url: photoUrl,
            bucket: targetBucket,
            message: 'File berhasil diunggah'
        })

    } catch (error) {
        console.error('Upload error:', error)
        return NextResponse.json(
            { error: 'Gagal mengunggah file', details: error.message },
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
        const { photoUrl, companyId, bucket: bucketName } = await request.json()

        if (!photoUrl || !companyId) {
            return NextResponse.json(
                { error: 'URL Foto dan ID Perusahaan diperlukan' },
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
                { error: 'Tidak memiliki akses' },
                { status: 403 }
            )
        }

        // Determine bucket from URL or parameter
        const targetBucket = bucketName || 'Profile'

        // Extract filename from URL
        const urlParts = photoUrl.split('/')
        const fileName = urlParts[urlParts.length - 1]
        const filePath = `company/${companyId}/gallery/${fileName}`

        // Delete from Supabase
        await supabaseAdmin.storage
            .from(targetBucket)
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
            message: 'Foto berhasil dihapus'
        })

    } catch (error) {
        console.error('Delete error:', error)
        return NextResponse.json(
            { error: 'Gagal menghapus foto' },
            { status: 500 }
        )
    }
}