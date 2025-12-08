'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Swal from 'sweetalert2'
import { 
  MapPin, Briefcase, DollarSign, Clock, Building2, Star, 
  Calendar, Users, BookmarkCheck, Bookmark, Share2, 
  ArrowLeft, CheckCircle, AlertCircle, Loader2, TrendingUp,
  Award, GraduationCap, Target
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function JobDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const slug = params.slug

  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)
  const [applying, setApplying] = useState(false)
  const [hasApplied, setHasApplied] = useState(false)
  const [existingApplication, setExistingApplication] = useState(null)

  useEffect(() => {
    if (slug) {
      fetchJobDetail()
    }
  }, [slug])

  useEffect(() => {
    if (job) {
      const savedJobs = JSON.parse(localStorage.getItem('savedJobs') || '[]')
      setSaved(savedJobs.includes(job.id))
    }
  }, [job])

  const fetchJobDetail = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/jobs/${slug}`, {
        credentials: 'include' // Important for auth
      })
      const data = await response.json()

      if (data.success) {
        setJob(data.data)
        
        // Set application status directly from API response
        if (data.data.hasApplied) {
          console.log('✅ User has already applied to this job')
          setHasApplied(true)
          setExistingApplication(data.data.existingApplication)
        } else {
          console.log('ℹ️ User has not applied to this job yet')
          setHasApplied(false)
          setExistingApplication(null)
        }
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Job Not Found',
          text: 'Lowongan tidak ditemukan',
          confirmButtonColor: '#2563EB'
        }).then(() => {
          router.push('/jobs')
        })
      }
    } catch (error) {
      console.error('Error fetching job:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Gagal memuat detail lowongan',
        confirmButtonColor: '#2563EB'
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleSave = () => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      Swal.fire({
        icon: 'info',
        title: 'Login Required',
        text: 'Silakan login terlebih dahulu untuk menyimpan lowongan',
        showCancelButton: true,
        confirmButtonText: 'Login',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#2563EB'
      }).then((result) => {
        if (result.isConfirmed) {
          router.push('/login?redirect=/jobs/' + slug)
        }
      })
      return
    }

    const savedJobs = JSON.parse(localStorage.getItem('savedJobs') || '[]')
    
    if (saved) {
      const updated = savedJobs.filter(id => id !== job.id)
      localStorage.setItem('savedJobs', JSON.stringify(updated))
      setSaved(false)
      Swal.fire({
        icon: 'success',
        title: 'Dihapus',
        text: 'Lowongan dihapus dari simpanan',
        timer: 1500,
        showConfirmButton: false
      })
    } else {
      savedJobs.push(job.id)
      localStorage.setItem('savedJobs', JSON.stringify(savedJobs))
      setSaved(true)
      Swal.fire({
        icon: 'success',
        title: 'Disimpan',
        text: 'Lowongan berhasil disimpan',
        timer: 1500,
        showConfirmButton: false
      })
    }
  }

  const handleApply = async () => {
    if (!isAuthenticated) {
      Swal.fire({
        icon: 'info',
        title: 'Login Required',
        text: 'Silakan login terlebih dahulu untuk melamar pekerjaan',
        showCancelButton: true,
        confirmButtonText: 'Login',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#2563EB'
      }).then((result) => {
        if (result.isConfirmed) {
          router.push('/login?redirect=/jobs/' + slug)
        }
      })
      return
    }

    if (user?.role !== 'JOBSEEKER') {
      Swal.fire({
        icon: 'error',
        title: 'Akses Ditolak',
        text: 'Hanya jobseeker yang dapat melamar pekerjaan',
        confirmButtonColor: '#2563EB'
      })
      return
    }

    // Redirect to application page
    router.push(`/jobs/${slug}/apply`)
  }

  const [isSharing, setIsSharing] = useState(false)

  const handleShare = async () => {
    if (isSharing) return // Prevent multiple share attempts
    
    if (navigator.share) {
      try {
        setIsSharing(true)
        await navigator.share({
          title: job.title,
          text: `${job.title} at ${job.company.name}`,
          url: window.location.href
        })
      } catch (error) {
        // Ignore AbortError (user cancel) and InvalidStateError (share already in progress)
        if (error.name !== 'AbortError' && error.name !== 'InvalidStateError') {
          console.error('Share failed:', error)
        }
      } finally {
        setIsSharing(false)
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      Swal.fire({
        icon: 'success',
        title: 'Link Copied!',
        text: 'Link lowongan berhasil disalin',
        timer: 1500,
        showConfirmButton: false
      })
    }
  }

  const formatJobType = (type) => {
    const typeMap = {
      'FULL_TIME': 'Full Time',
      'PART_TIME': 'Part Time',
      'CONTRACT': 'Contract',
      'FREELANCE': 'Freelance',
      'INTERNSHIP': 'Internship'
    }
    return typeMap[type] || type
  }

  const formatSalary = () => {
    if (!job.showSalary || !job.salaryMin || !job.salaryMax) {
      return 'Negotiable'
    }
    return `Rp ${job.salaryMin.toLocaleString('id-ID')} - ${job.salaryMax.toLocaleString('id-ID')}`
  }

  const getTimeSince = (date) => {
    const days = Math.floor((new Date() - new Date(date)) / (1000 * 60 * 60 * 24))
    if (days === 0) return 'Hari ini'
    if (days === 1) return 'Kemarin'
    return `${days} hari yang lalu`
  }

  // Check if deadline has expired
  const isDeadlineExpired = () => {
    if (!job?.applicationDeadline) return false
    return new Date(job.applicationDeadline) < new Date()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Memuat detail lowongan...</p>
        </div>
      </div>
    )
  }

  if (!job) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <Link href="/jobs" className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition">
            <ArrowLeft className="w-5 h-5" />
            <span>Kembali ke Daftar Lowongan</span>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* Job Header Card */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
              <div className="flex items-start gap-6 mb-6">
                {/* Company Logo */}
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-4xl flex-shrink-0 overflow-hidden">
                  {job.company.logo ? (
                    <img src={job.company.logo} alt={job.company.name} className="w-full h-full object-cover" />
                  ) : (
                    '🏢'
                  )}
                </div>

                {/* Job Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
                      <Link href={`/companies/${job.company.slug}`}>
                        <div className="flex items-center gap-2 text-lg text-gray-700 hover:text-blue-600 transition cursor-pointer">
                          <Building2 className="w-5 h-5" />
                          <span className="font-semibold">{job.company.name}</span>
                        </div>
                      </Link>
                      {job.company.tagline && (
                        <p className="text-gray-600 mt-1">{job.company.tagline}</p>
                      )}
                    </div>

                    {/* Featured Badge */}
                    {job.isFeatured && (
                      <span className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full text-sm font-semibold flex items-center gap-2 animate-pulse">
                        <Star className="w-4 h-4 fill-white" />
                        Featured
                      </span>
                    )}
                  </div>

                  {/* Quick Info Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="text-xs text-gray-500">Lokasi</div>
                        <div className="font-semibold text-gray-900">{job.city}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Briefcase className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="text-xs text-gray-500">Tipe</div>
                        <div className="font-semibold text-gray-900">{formatJobType(job.jobType)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="text-xs text-gray-500">Pengalaman</div>
                        <div className="font-semibold text-gray-900">
                          {job.minExperience 
                            ? `${job.minExperience}${job.maxExperience ? `-${job.maxExperience}` : '+'} tahun`
                            : 'Any level'
                          }
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <DollarSign className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="text-xs text-gray-500">Gaji</div>
                        <div className="font-semibold text-green-600">{formatSalary()}</div>
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      {job.category}
                    </span>
                    {job.isRemote && (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        Remote
                      </span>
                    )}
                    {job.level && (
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                        {job.level}
                      </span>
                    )}
                    {job.educationLevel && (
                      <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium flex items-center gap-1">
                        <GraduationCap className="w-3 h-3" />
                        {job.educationLevel}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t border-gray-200">
                {isDeadlineExpired() ? (
                  // Show expired message if deadline passed
                  <div className="flex-1 bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200 py-4 px-6 rounded-xl">
                    <div className="flex items-center justify-center gap-2 text-gray-500 font-semibold">
                      <AlertCircle className="w-5 h-5" />
                      Lowongan Ditutup - Deadline Sudah Lewat
                    </div>
                  </div>
                ) : hasApplied ? (
                  // Show application status if already applied
                  <div className="flex-1 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 py-4 px-6 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 text-green-700 font-semibold mb-1">
                          <CheckCircle className="w-5 h-5" />
                          Sudah Melamar
                        </div>
                        <p className="text-sm text-green-600">
                          Status: <span className="font-medium">{existingApplication?.status || 'PENDING'}</span>
                        </p>
                      </div>
                      <Link href="/profile/jobseeker/applications">
                        <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-semibold">
                          Lihat Status
                        </button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  // Show apply button if not applied yet
                  <button
                    onClick={handleApply}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition font-semibold text-lg shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    <Target className="w-5 h-5" />
                    Lamar Sekarang
                  </button>
                )}
                <button
                  onClick={toggleSave}
                  className={`px-6 py-4 rounded-xl transition font-semibold ${
                    saved
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {saved ? <BookmarkCheck className="w-6 h-6" /> : <Bookmark className="w-6 h-6" />}
                </button>
                <button
                  onClick={handleShare}
                  className="px-6 py-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-semibold"
                >
                  <Share2 className="w-6 h-6" />
                </button>
              </div>

              {/* Stats */}
              <div className="flex justify-around mt-6 pt-6 border-t border-gray-200 text-center">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{job.applicationCount}</div>
                  <div className="text-sm text-gray-500">Pelamar</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{job.viewCount}</div>
                  <div className="text-sm text-gray-500">Dilihat</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{job.numberOfPositions}</div>
                  <div className="text-sm text-gray-500">Posisi</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{getTimeSince(job.publishedAt)}</div>
                  <div className="text-sm text-gray-500">Posted</div>
                </div>
              </div>
            </div>

            {/* Job Description */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Briefcase className="w-6 h-6 text-blue-600" />
                Deskripsi Pekerjaan
              </h2>
              <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                {job.description}
              </div>
            </div>

            {/* Requirements */}
            {job.requirements && (
              <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                  Persyaratan
                </h2>
                <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {job.requirements}
                </div>
              </div>
            )}

            {/* Responsibilities */}
            {job.responsibilities && (
              <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Award className="w-6 h-6 text-blue-600" />
                  Tanggung Jawab
                </h2>
                <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {job.responsibilities}
                </div>
              </div>
            )}

            {/* Skills Required */}
            {job.skills && job.skills.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Skills Required</h2>
                <div className="flex flex-wrap gap-3">
                  {job.skills.map((skill, index) => (
                    <span
                      key={index}
                      className={`px-4 py-2 rounded-full text-sm font-medium ${
                        skill.isRequired
                          ? 'bg-blue-600 text-white'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {skill.name}
                      {skill.isRequired && ' *'}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-3">* Required skill</p>
              </div>
            )}

            {/* Benefits */}
            {job.benefits && job.benefits.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Star className="w-6 h-6 text-yellow-500" />
                  Benefit & Fasilitas
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {job.benefits.map((benefit, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg"
                    >
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700 font-medium">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:w-96 flex-shrink-0">
            {/* Company Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 sticky top-4">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Tentang Perusahaan</h3>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-3xl overflow-hidden">
                  {job.company.logo ? (
                    <img src={job.company.logo} alt={job.company.name} className="w-full h-full object-cover" />
                  ) : (
                    '🏢'
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{job.company.name}</h4>
                  <p className="text-sm text-gray-500">{job.company.industry}</p>
                </div>
              </div>

              {job.company.description && (
                <p className="text-gray-700 text-sm mb-4 line-clamp-4">
                  {job.company.description}
                </p>
              )}

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>{job.company.city}, {job.company.province}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span>{job.company.companySize} karyawan</span>
                </div>
                {job.company.rating > 0 && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span>{job.company.rating.toFixed(1)} ({job.company.totalReviews} reviews)</span>
                  </div>
                )}
              </div>

              <Link href={`/companies/${job.company.slug}`}>
                <button className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition font-semibold">
                  Lihat Profil Perusahaan
                </button>
              </Link>
            </div>

            {/* Deadline Alert */}
            {job.applicationDeadline && (
              <div className={`border-2 rounded-xl p-4 mb-6 ${
                isDeadlineExpired() 
                  ? 'bg-gradient-to-r from-gray-100 to-gray-200 border-gray-300'
                  : 'bg-gradient-to-r from-red-50 to-orange-50 border-red-200'
              }`}>
                <div className="flex items-start gap-3">
                  <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                    isDeadlineExpired() ? 'text-gray-500' : 'text-red-600'
                  }`} />
                  <div>
                    <h4 className={`font-bold mb-1 ${
                      isDeadlineExpired() ? 'text-gray-700' : 'text-red-900'
                    }`}>
                      {isDeadlineExpired() ? 'Lowongan Sudah Ditutup' : 'Deadline Lamaran'}
                    </h4>
                    <p className={`text-sm ${
                      isDeadlineExpired() ? 'text-gray-600' : 'text-red-700'
                    }`}>
                      {new Date(job.applicationDeadline).toLocaleDateString('id-ID', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}