import { supabaseAdmin } from './supabase'

/**
 * Upload recruiter profile photo to Supabase Storage
 * @param {File} file - The image file
 * @param {string} recruiterId - Recruiter ID
 * @returns {Promise<string>} Public URL of uploaded photo
 */
export async function uploadRecruiterPhoto(file, recruiterId) {
  const fileExt = file.name.split('.').pop()
  const fileName = `profile.${fileExt}`
  const filePath = `recruiter-photos/${recruiterId}/${fileName}`

  // Delete old photo first (if exists)
  await supabaseAdmin.storage
    .from('Profile')
    .remove([filePath])
    .catch(() => {}) // Ignore error if file doesn't exist

  // Upload new photo using admin client (bypasses RLS)
  const { data, error } = await supabaseAdmin.storage
    .from('Profile')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true
    })

  if (error) {
    console.error('Upload error:', error)
    throw new Error(`Failed to upload photo: ${error.message}`)
  }

  // Get public URL
  const { data: { publicUrl } } = supabaseAdmin.storage
    .from('Profile')
    .getPublicUrl(filePath)

  return publicUrl
}

/**
 * Upload company gallery photo to Supabase Storage
 * @param {File} file - The image file
 * @param {string} companyId - Company ID
 * @returns {Promise<string>} Public URL of uploaded photo
 */
export async function uploadCompanyGalleryPhoto(file, companyId) {
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
    throw new Error(`Failed to upload gallery photo: ${error.message}`)
  }

  // Get public URL
  const { data: { publicUrl } } = supabaseAdmin.storage
    .from('Profile')
    .getPublicUrl(filePath)

  return publicUrl
}

/**
 * Delete company gallery photo from Supabase Storage
 * @param {string} photoUrl - Full public URL of the photo
 * @param {string} companyId - Company ID
 * @returns {Promise<boolean>}
 */
export async function deleteCompanyGalleryPhoto(photoUrl, companyId) {
  try {
    // Extract filename from URL
    const urlParts = photoUrl.split('/')
    const fileName = urlParts[urlParts.length - 1]
    const filePath = `company-gallery/${companyId}/${fileName}`

    const { error } = await supabaseAdmin.storage
      .from('Profile')
      .remove([filePath])

    if (error) {
      console.error('Delete error:', error)
      throw error
    }

    return true
  } catch (error) {
    console.error('Failed to delete photo:', error)
    return false
  }
}
