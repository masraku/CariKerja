'use client'
import { Suspense } from 'react'
import JobseekerProfileForm from './JobseekerProfileForm'

// Loading component
const ProfileLoading = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Memuat halaman profile...</p>
      </div>
    </div>
  )
}

// Main page component with Suspense boundary
const JobseekerProfilePage = () => {
  return (
    <Suspense fallback={<ProfileLoading />}>
      <JobseekerProfileForm />
    </Suspense>
  )
}

export default JobseekerProfilePage