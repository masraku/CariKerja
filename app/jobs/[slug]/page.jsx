'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Swal from 'sweetalert2'
import { 
  MapPin, Briefcase, DollarSign, Clock, Building2, Star, 
  Calendar, Users, BookmarkCheck, Bookmark, Share2, 
  ArrowLeft, CheckCircle, AlertCircle, Loader2,
  Award, GraduationCap, Target, Globe
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
        credentials: 'include'
      })
      const data = await response.json()

      if (data.success) {
        setJob(data.data)
        
        if (data.data.hasApplied) {
          setHasApplied(true)
          setExistingApplication(data.data.existingApplication)
        } else {
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

    router.push(`/jobs/${slug}/apply`)
  }

  const [isSharing, setIsSharing] = useState(false)

  const handleShare = async () => {
    if (isSharing) return
    
    if (navigator.share) {
      try {
        setIsSharing(true)
        await navigator.share({
          title: job.title,
          text: `${job.title} at ${job.company.name}`,
          url: window.location.href
        })
      } catch (error) {
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

  const isDeadlineExpired = () => {
    if (!job?.applicationDeadline) return false
    return new Date(job.applicationDeadline) < new Date()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Memuat detail lowongan...</p>
        </div>
      </div>
    )
  }

  if (!job) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link href="/jobs" className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors mb-6 group">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Kembali ke Daftar Lowongan</span>
        </Link>

        <div className="max-w-4xl mx-auto">
          {/* Main Card */}
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100">
            {/* Header Section */}
            <div className="p-8 border-b border-slate-100 bg-gradient-to-b from-white to-slate-50/50">
              <div className="flex flex-col md:flex-row items-start gap-6 mb-8">
                {/* Company Logo */}
                <div className="w-24 h-24 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0 p-2">
                  {job.company.logo ? (
                    <img src={job.company.logo} alt={job.company.name} className="w-full h-full object-contain" />
                  ) : (
                    <Building2 className="w-12 h-12 text-slate-300" />
                  )}
                </div>

                {/* Job Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
                    <div>
                      <h1 className="text-3xl font-bold text-slate-900 mb-2 leading-tight">{job.title}</h1>
                      <Link href={`/companies/${job.company.slug}`} className="inline-flex items-center gap-2 text-lg text-slate-600 hover:text-blue-600 transition-colors group">
                        <Building2 className="w-5 h-5 text-slate-400 group-hover:text-blue-500" />
                        <span className="font-medium">{job.company.name}</span>
                      </Link>
                    </div>

                    {job.isFeatured && (
                      <span className="px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-full text-sm font-bold flex items-center gap-2 shadow-lg shadow-orange-500/20">
                        <Star className="w-4 h-4 fill-white" />
                        Featured
                      </span>
                    )}
                  </div>

                  {/* Quick Info Tags */}
                  <div className="flex flex-wrap gap-3 mt-4">
                    <span className="px-4 py-2 bg-slate-50 text-slate-700 rounded-xl text-sm font-medium flex items-center gap-2 border border-slate-100">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      {job.city}
                    </span>
                    <span className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-sm font-medium flex items-center gap-2 border border-blue-100">
                      <Briefcase className="w-4 h-4" />
                      {formatJobType(job.jobType)}
                    </span>
                    <span className="px-4 py-2 bg-green-50 text-green-700 rounded-xl text-sm font-medium flex items-center gap-2 border border-green-100">
                      <DollarSign className="w-4 h-4" />
                      {formatSalary()}
                    </span>
                    {job.isRemote && (
                      <span className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-medium flex items-center gap-2 border border-emerald-100">
                        <Globe className="w-4 h-4" />
                        Remote
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-100">
                {isDeadlineExpired() ? (
                  <button disabled className="flex-1 px-8 py-4 bg-slate-100 text-slate-400 font-bold rounded-xl cursor-not-allowed flex items-center justify-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Lowongan Ditutup
                  </button>
                ) : hasApplied ? (
                  <div className="flex-1 px-8 py-4 bg-green-50 text-green-700 font-bold rounded-xl border border-green-100 flex items-center justify-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Sudah Melamar
                    <span className="text-sm font-normal ml-1 text-green-600">
                      ({new Date(existingApplication.appliedAt).toLocaleDateString('id-ID')})
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={handleApply}
                    className="flex-1 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 hover:-translate-y-0.5 flex items-center justify-center gap-2"
                  >
                    Lamar Sekarang
                    <ArrowLeft className="w-5 h-5 rotate-180" />
                  </button>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={toggleSave}
                    className={`px-6 py-4 rounded-xl font-medium transition-all border flex items-center gap-2 ${
                      saved
                        ? 'bg-blue-50 text-blue-600 border-blue-100'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {saved ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
                    <span className="hidden sm:inline">{saved ? 'Disimpan' : 'Simpan'}</span>
                  </button>
                  
                  <button
                    onClick={handleShare}
                    className="px-6 py-4 rounded-xl font-medium bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 transition-all flex items-center gap-2"
                  >
                    <Share2 className="w-5 h-5" />
                    <span className="hidden sm:inline">Share</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-8 space-y-10">
              {/* Description */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  Deskripsi Pekerjaan
                </h2>
                <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: job.description }} />
              </section>

              {/* Requirements */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
                    <Target className="w-5 h-5" />
                  </div>
                  Kualifikasi
                </h2>
                <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: job.requirements }} />
              </section>

              {/* Benefits */}
              {job.benefits && job.benefits.length > 0 && (
                <section>
                  <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                      <Award className="w-5 h-5" />
                    </div>
                    Benefit
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {job.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-slate-700 font-medium">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Additional Info */}
              <section className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-8 border-t border-slate-100">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-400 shadow-sm">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Diposting</p>
                    <p className="text-slate-900 font-medium">{getTimeSince(job.createdAt)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-400 shadow-sm">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Batas Lamaran</p>
                    <p className="text-slate-900 font-medium">
                      {job.applicationDeadline ? new Date(job.applicationDeadline).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'long', year: 'numeric'
                      }) : 'Tidak ada batas'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-400 shadow-sm">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Pelamar</p>
                    <p className="text-slate-900 font-medium">{job.applicantsCount || 0} orang</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-400 shadow-sm">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Pengalaman</p>
                    <p className="text-slate-900 font-medium">Min. {job.experienceLevel} tahun</p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
