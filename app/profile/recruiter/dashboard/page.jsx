'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import {
  Briefcase,
  Users,
  FileText,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  MapPin,
  Building2,
  Globe,
  Mail,
  Phone,
  Calendar,
  Edit,
  Plus,
  ArrowRight,
  AlertCircle
} from 'lucide-react'

export default function RecruiterDashboard() {
  const router = useRouter()
  const { user, refreshUser } = useAuth()
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState(null)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/profile/recruiter/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setDashboardData(data.data)
      } else {
        console.error('Failed to load dashboard')
      }
    } catch (error) {
      console.error('Load dashboard error:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const getStatusBadge = (status) => {
    const config = {
      PENDING: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
      REVIEWING: { label: 'Reviewing', color: 'bg-blue-100 text-blue-800' },
      SHORTLISTED: { label: 'Shortlisted', color: 'bg-purple-100 text-purple-800' },
      INTERVIEW_SCHEDULED: { label: 'Interview', color: 'bg-indigo-100 text-indigo-800' },
      INTERVIEW_COMPLETED: { label: 'Interview Done', color: 'bg-cyan-100 text-cyan-800' },
      ACCEPTED: { label: 'Accepted', color: 'bg-green-100 text-green-800' },
      REJECTED: { label: 'Rejected', color: 'bg-red-100 text-red-800' },
      WITHDRAWN: { label: 'Withdrawn', color: 'bg-gray-100 text-gray-800' }
    }
    return config[status] || config.PENDING
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Failed to load dashboard data</p>
        </div>
      </div>
    )
  }

  const { company, recruiter, stats, recentApplications } = dashboardData

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard Recruiter
          </h1>
          <p className="text-gray-600">
            Selamat datang, {recruiter.firstName}! Kelola lowongan dan pelamar Anda
          </p>
        </div>

        {/* Company Profile Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-3xl overflow-hidden">
                {company.logo ? (
                  <img 
                    src={company.logo} 
                    alt={company.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  company.name.charAt(0)
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{company.name}</h2>
                {company.tagline && (
                  <p className="text-gray-600 mb-2">{company.tagline}</p>
                )}
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Building2 className="w-4 h-4" />
                    {company.industry}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {company.city}, {company.province}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {company.companySize} karyawan
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => router.push('/profile/recruiter')}
              className="flex text-gray-900 items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              <Edit className="w-4 h-4" />
              Edit Profile
            </button>
          </div>

          {/* Company Details */}
          <div className="grid md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
            {company.email && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="w-4 h-4" />
                {company.email}
              </div>
            )}
            {company.phone && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4" />
                {company.phone}
              </div>
            )}
            {company.website && (
              <a 
                href={company.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
              >
                <Globe className="w-4 h-4" />
                Website
              </a>
            )}
          </div>

          {/* Verification Status */}
          {!company.verified && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-amber-900 mb-1">
                    Perusahaan Belum Terverifikasi
                  </h4>
                  <p className="text-sm text-amber-800">
                    Akun perusahaan Anda sedang dalam proses verifikasi. Anda masih bisa memposting lowongan, namun untuk fitur premium diperlukan verifikasi terlebih dahulu.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <button
            onClick={() => router.push('/profile/recruiter/post-job')}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition shadow-lg flex items-center justify-between group"
          >
            <div className="text-left">
              <h3 className="font-bold text-lg mb-2">Pasang Lowongan Baru</h3>
              <p className="text-sm text-blue-100">Buat lowongan pekerjaan untuk kandidat terbaik</p>
            </div>
            <Plus className="w-8 h-8 text-white opacity-80 group-hover:opacity-100 transition" />
          </button>

          <button
            onClick={() => router.push('/profile/recruiter/dashboard/applications')}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-lg hover:from-purple-700 hover:to-pink-700 transition shadow-lg flex items-center justify-between group"
          >
            <div className="text-left">
              <h3 className="font-bold text-lg mb-2">Lihat Semua Pelamar</h3>
              <p className="text-sm text-purple-100">Kelola dan review semua lamaran masuk</p>
            </div>
            <Users className="w-8 h-8 text-white opacity-80 group-hover:opacity-100 transition" />
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 text-sm font-medium">Total Lowongan</h3>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalJobs}</p>
            <p className="text-sm text-gray-500 mt-1">{stats.activeJobs} aktif</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 text-sm font-medium">Total Pelamar</h3>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalApplications}</p>
            <p className="text-sm text-gray-500 mt-1">
              {stats.newApplicationsThisWeek} minggu ini
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 text-sm font-medium">Pending Review</h3>
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {stats.pendingApplications + stats.reviewingApplications}
            </p>
            <p className="text-sm text-gray-500 mt-1">Perlu direview</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 text-sm font-medium">Shortlisted</h3>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {stats.shortlistedApplications}
            </p>
            <p className="text-sm text-gray-500 mt-1">Kandidat potensial</p>
          </div>
        </div>

        {/* Recent Jobs */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Lowongan Aktif Terbaru</h2>
            <button
              onClick={() => router.push('/profile/recruiter/dashboard/jobs')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
            >
              Lihat Semua
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {company.jobs.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Belum Ada Lowongan
              </h3>
              <p className="text-gray-600 mb-6">
                Mulai posting lowongan pertama Anda untuk menarik kandidat terbaik
              </p>
              <button
                onClick={() => router.push('/post-job')}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Plus className="w-5 h-5 mr-2" />
                Pasang Lowongan
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {company.jobs.map(job => (
                <div 
                  key={job.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition cursor-pointer"
                  onClick={() => router.push(`/profile/recruiter/dashboard/jobs/${job.slug}`)}
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{job.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {job.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(job.createdAt)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {job.viewCount} views
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-2xl font-bold text-gray-900">
                        {job._count.applications}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">pelamar</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Applications */}
        {recentApplications.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Lamaran Terbaru</h2>
              <button
                onClick={() => router.push('/profile/recruiter/dashboard/applications')}
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
                  onClick={() => router.push(`/recruiter/applications?id=${application.id}`)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold overflow-hidden">
                      {application.jobseekers.photo ? (
                        <img 
                          src={application.jobseekers.photo}
                          alt={application.jobseekers.firstName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        application.jobseekers.firstName?.charAt(0) || 'U'
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {application.jobseekers.firstName} {application.jobseekers.lastName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {application.jobseekers.currentTitle || 'Job Seeker'}
                      </p>
                      <p className="text-xs text-gray-500">
                        Melamar: {application.jobs.title}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(application.status).color}`}>
                      {getStatusBadge(application.status).label}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(application.appliedAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}