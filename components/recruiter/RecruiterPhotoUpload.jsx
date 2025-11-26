'use client'
import { useState, useRef } from 'react'
import { Upload, User, Loader2, X } from 'lucide-react'

export default function RecruiterPhotoUpload({ currentPhoto, recruiterId, onPhotoUpdate }) {
    const [uploading, setUploading] = useState(false)
    const [preview, setPreview] = useState(currentPhoto)
    const fileInputRef = useRef(null)

    const handleFileSelect = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file')
            return
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('File size must be less than 5MB')
            return
        }

        // Show preview immediately
        const reader = new FileReader()
        reader.onloadend = () => {
            setPreview(reader.result)
        }
        reader.readAsDataURL(file)

        // Upload to server
        await uploadPhoto(file)
    }

    const uploadPhoto = async (file) => {
        setUploading(true)
        try {
            const token = localStorage.getItem('token')
            const formData = new FormData()
            formData.append('file', file)
            formData.append('type', 'recruiter-photo')

            const response = await fetch('/api/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            })

            const data = await response.json()

            if (data.success) {
                setPreview(data.url)
                if (onPhotoUpdate) {
                    onPhotoUpdate(data.url)
                }
            } else {
                throw new Error(data.error || 'Upload failed')
            }
        } catch (error) {
            console.error('Upload error:', error)
            alert(error.message || 'Failed to upload photo')
            setPreview(currentPhoto) // Revert preview
        } finally {
            setUploading(false)
        }
    }

    const removePhoto = () => {
        setPreview(null)
        if (onPhotoUpdate) {
            onPhotoUpdate(null)
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    return (
        <div className="flex flex-col items-center gap-4">
            {/* Photo Preview */}
            <div className="relative">
                {preview ? (
                    <div className="relative group">
                        <img
                            src={preview}
                            alt="Profile"
                            className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                        />
                        {!uploading && (
                            <button
                                onClick={removePhoto}
                                className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition flex items-center justify-center shadow-lg"
                                type="button"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center border-4 border-white shadow-lg">
                        <User className="w-16 h-16 text-gray-400" />
                    </div>
                )}
                
                {/* Loading Overlay */}
                {uploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                )}
            </div>

            {/* Upload Button */}
            <div>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    disabled={uploading}
                    className="hidden"
                    id="photo-upload"
                />
                <label
                    htmlFor="photo-upload"
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition cursor-pointer ${
                        uploading
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                >
                    <Upload className="w-4 h-4" />
                    {uploading ? 'Uploading...' : preview ? 'Change Photo' : 'Upload Photo'}
                </label>
            </div>

            <p className="text-xs text-gray-500 text-center">
                JPG, PNG or GIF. Max size 5MB.
            </p>
        </div>
    )
}
