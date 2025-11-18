'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import {
  Briefcase,
  FileText,
  CheckCircle,
  Clock,
  TrendingUp,
  MapPin,
  Building2,
  User,
  Edit,
  Search,
  ArrowRight,
  View
} from 'lucide-react'

const JobseekerDashboard = () => {
  const router = useRouter()
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [stats, setStats] = useState({
    totalApplications: 0,
    pending: 0,
    interview: 0,
    accepted: 0
  })
  const [recentJobs, setRecentJobs] = useState([])
  const [recentApplications, setRecentApplications] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkProfile()
  }, [])

  const checkProfile = async () => {
    try {
      const response = await fetch('/api/profile/jobseeker', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      const data = await response.json()

      if (response.ok && data.profile) {
        setProfile(data.profile)

        // If profile not completed, MUST complete profile first
        if (!data.profile.profileCompleted) {
          router.push('/profile/jobseeker')
          return
        }

        // Load dashboard data
        loadDashboardData()
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

  const loadDashboardData = async () => {
    try {
      // Fetch application stats
      const statsResponse = await fetch('/api/applications/my-applications', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      const statsData = await statsResponse.json()

      if (statsData.success) {
        setStats({
          totalApplications: statsData.data.total,
          pending: (statsData.data.stats.PENDING || 0) + (statsData.data.stats.REVIEWING || 0),
          interview: (statsData.data.stats.INTERVIEW_SCHEDULED || 0) + (statsData.data.stats.INTERVIEW_COMPLETED || 0),
          accepted: statsData.data.stats.ACCEPTED || 0
        })

        // Get recent applications (last 3)
        setRecentApplications(statsData.data.applications.slice(0, 3))
      }

      // TODO: Fetch recommended jobs based on profile
      // For now, we'll use dummy data or you can implement later
      setRecentJobs([])

    } catch (error) {
      console.error('Load dashboard data error:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header with Profile Summary */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {profile?.photo ? (
                  <img
                    src={profile.photo}
                    alt={profile.firstName}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  profile?.firstName?.charAt(0) || 'U'
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Selamat Datang, {profile?.firstName}!
                </h1>
                <p className="text-gray-600">{profile?.currentTitle || 'Job Seeker'}</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <MapPin className="w-4 h-4" />
                    {profile?.city || 'Location not set'}
                  </div>
                  <span className="text-gray-300">•</span>
                  <div className="text-sm text-gray-500">
                    Profile: {profile?.profileCompleteness}% lengkap
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => router.push('/profile/jobseeker')}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                <Edit className="w-4 h-4" />
                Edit Profile
              </button>

              <button
                onClick={() => router.push('/profile/jobseeker/view')}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                <View className="w-4 h-4" />
                Lihat Profile
              </button>
            </div>

          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 text-sm font-medium">Total Lamaran</h3>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalApplications}</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 text-sm font-medium">Pending</h3>
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 text-sm font-medium">Interview</h3>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.interview}</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 text-sm font-medium">Diterima</h3>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-green-600">{stats.accepted}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <button
            onClick={() => router.push('/jobs')}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition shadow-lg flex items-center justify-between group"
          >
            <div className="text-left">
              <h3 className="font-bold text-lg mb-2">Cari Lowongan Kerja</h3>
              <p className="text-sm text-blue-100">Temukan pekerjaan impian Anda</p>
            </div>
            <Search className="w-8 h-8 text-white opacity-80 group-hover:opacity-100 transition" />
          </button>

          <button
            onClick={() => router.push('/jobseeker/applications')}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-lg hover:from-purple-700 hover:to-pink-700 transition shadow-lg flex items-center justify-between group"
          >
            <div className="text-left">
              <h3 className="font-bold text-lg mb-2">Riwayat Lamaran</h3>
              <p className="text-sm text-purple-100">Lihat status semua lamaran Anda</p>
            </div>
            <FileText className="w-8 h-8 text-white opacity-80 group-hover:opacity-100 transition" />
          </button>
        </div>

        {/* Recent Applications */}
        {recentApplications.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Lamaran Terbaru</h2>
              <button
                onClick={() => router.push('/jobseeker/applications')}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
              >
                Lihat Semua
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {recentApplications.map(application => (
                <div
                  key={application.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition cursor-pointer"
                  onClick={() => router.push('/jobseeker/applications')}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
                      {application.job.company.logo ? (
                        <img
                          src={application.job.company.logo}
                          alt={application.job.company.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        application.job.company.name.charAt(0)
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{application.job.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Building2 className="w-4 h-4" />
                        {application.job.company.name}
                        <span>•</span>
                        <MapPin className="w-4 h-4" />
                        {application.job.company.city}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${application.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      application.status === 'REVIEWING' ? 'bg-blue-100 text-blue-800' :
                        application.status === 'SHORTLISTED' ? 'bg-purple-100 text-purple-800' :
                          application.status === 'INTERVIEW_SCHEDULED' ? 'bg-indigo-100 text-indigo-800' :
                            application.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                      }`}>
                      {application.status}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(application.appliedAt).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Profile Completion Reminder */}
        {profile?.profileCompleteness < 100 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">
                  Lengkapi Profile Anda
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Profile Anda {profile?.profileCompleteness}% lengkap. Profile yang lengkap meningkatkan peluang Anda dilihat oleh recruiter hingga 3x lipat!
                </p>
                <button
                  onClick={() => router.push('/profile/jobseeker')}
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition text-sm font-medium"
                >
                  Lengkapi Sekarang
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State for No Applications */}
        {recentApplications.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Mulai Perjalanan Karir Anda
            </h3>
            <p className="text-gray-600 mb-6">
              Anda belum melamar pekerjaan apapun. Temukan lowongan yang sesuai dengan keahlian Anda!
            </p>
            <button
              onClick={() => router.push('/jobs')}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Search className="w-5 h-5 mr-2" />
              Jelajahi Lowongan
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default JobseekerDashboard