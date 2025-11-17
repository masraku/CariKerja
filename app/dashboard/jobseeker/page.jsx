'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

const JobseekerDashboard = () => {
  const router = useRouter()
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkProfile()
  }, [])

  const checkProfile = async () => {
    try {
      const response = await fetch('/api/profile/jobseeker')
      const data = await response.json()

      if (response.ok && data.profile) {
        setProfile(data.profile)
        
        // If profile not completed, redirect to profile form
        if (!data.profile.profileCompleted) {
          router.push('/profile/jobseeker')
        }
      } else {
        // No profile yet, redirect to create profile
        router.push('/profile/jobseeker')
      }
    } catch (error) {
      console.error('Check profile error:', error)
      router.push('/profile/jobseeker')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-2xl font-bold">Dashboard Jobseeker</h1>
          <p className="text-gray-600">Welcome, {profile?.firstName}!</p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <button
            onClick={() => router.push('/profile/jobseeker/view')}
            className="bg-indigo-600 text-white p-6 rounded-lg hover:bg-indigo-700 transition"
          >
            <h3 className="font-bold text-lg mb-2">Lihat Profile</h3>
            <p className="text-sm">Kelengkapan: {profile?.profileCompleteness}%</p>
          </button>

          <button
            onClick={() => router.push('/jobs')}
            className="bg-green-600 text-white p-6 rounded-lg hover:bg-green-700 transition"
          >
            <h3 className="font-bold text-lg mb-2">Cari Lowongan</h3>
            <p className="text-sm">Temukan pekerjaan impian</p>
          </button>

          <button
            onClick={() => router.push('/applications')}
            className="bg-purple-600 text-white p-6 rounded-lg hover:bg-purple-700 transition"
          >
            <h3 className="font-bold text-lg mb-2">Lamaran Saya</h3>
            <p className="text-sm">Lihat status lamaran</p>
          </button>
        </div>
      </div>
    </div>
  )
}

export default JobseekerDashboard