import { NextResponse } from 'next/server'
import { uploadFileToSupabase } from '@/lib/supabase.js'

export async function POST(request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')
    const bucket = formData.get('bucket')
    const userId = formData.get('userId')

    console.log('📥 Upload Request:')
    console.log('  - Bucket:', bucket)
    console.log('  - File:', file?.name)
    console.log('  - Size:', file?.size)
    console.log('  - User ID:', userId)

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!bucket) {
      return NextResponse.json(
        { error: 'Bucket name required' },
        { status: 400 }
      )
    }

    // Validate file size based on bucket
    const maxSize = {
      'Resume': 5 * 1024 * 1024, // 5MB
      'Sertificate': 2 * 1024 * 1024, // 2MB
      'Ijazah': 2 * 1024 * 1024, // 2MB
      'Profile': 2 * 1024 * 1024 // 2MB
    }

    if (file.size > maxSize[bucket]) {
      return NextResponse.json(
        { error: `File size exceeds ${maxSize[bucket] / (1024 * 1024)}MB limit` },
        { status: 400 }
      )
    }

    // Upload to Supabase
    const path = userId ? `${userId}/${Date.now()}` : `${Date.now()}`
    const result = await uploadFileToSupabase(file, bucket, path)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    console.log('✅ Upload successful:', result.url)

    return NextResponse.json({
      success: true,
      url: result.url,
      path: result.path
    })
  } catch (error) {
    console.error('Upload API error:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}