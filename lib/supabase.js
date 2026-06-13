import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Client for Supabase
export const supabase = supabaseUrl && supabasePublishableKey 
  ? createClient(supabaseUrl, supabasePublishableKey)
  : null

// Server-side client for private storage operations when service role is configured.
export const supabaseAdmin = supabaseUrl && (supabaseServiceRoleKey || supabasePublishableKey)
  ? createClient(supabaseUrl, supabaseServiceRoleKey || supabasePublishableKey)
  : null

// Helper function to upload file to Supabase Storage
export async function uploadFileToSupabase(file, bucket, path) {
  if (!supabase) {
    return {
      success: false,
      error: 'Supabase client not configured'
    }
  }

  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${path}-${Date.now()}.${fileExt}`
    const filePath = `${fileName}`

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) throw error

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath)

    return {
      success: true,
      url: publicUrl,
      path: filePath
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}

// Helper to delete file from Supabase
export async function deleteFileFromSupabase(bucket, path) {
  if (!supabase) {
    return {
      success: false,
      error: 'Supabase client not configured'
    }
  }

  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])

    if (error) throw error
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}
