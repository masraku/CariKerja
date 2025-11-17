import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Client for frontend (with RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin client for backend (bypass RLS)
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRole, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Helper function to upload file to Supabase Storage (using admin client)
export async function uploadFileToSupabase(file, bucket, path) {
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${path}-${Date.now()}.${fileExt}`
    const filePath = `${fileName}`

    // Use admin client to bypass RLS
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) throw error

    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(filePath)

    return {
      success: true,
      url: publicUrl,
      path: filePath
    }
  } catch (error) {
    console.error('Upload error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Helper to delete file from Supabase
export async function deleteFileFromSupabase(bucket, path) {
  try {
    const { error } = await supabaseAdmin.storage
      .from(bucket)
      .remove([path])

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('Delete error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}