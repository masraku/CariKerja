'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Swal from 'sweetalert2'
import { 
  ArrowLeft, FileText, Upload, Briefcase, Building2, 
  MapPin, DollarSign, Loader2, CheckCircle, AlertCircle,
  Eye, X, ExternalLink
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function ApplyJobPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const slug = params.slug

  const [job, setJob] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [documentModal, setDocumentModal] = useState({ isOpen: false, url: '', title: '' })
  const [formData, setFormData] = useState({
    resumeUrl: '',
    portfolioUrl: ''
  })

  useEffect(() => {
    if (!isAuthenticated) {
      Swal.fire({
        icon: 'info',
        title: 'Login Required',
        text: 'Please login first to apply for this job',
        confirmButtonColor: '#2563EB'
      }).then(() => {
        router.push(`/login?redirect=/jobs/${slug}/apply`)
      })
      return
    }

    if (user?.role !== 'JOBSEEKER') {
      Swal.fire({
        icon: 'error',
        title: 'Access Denied',
        text: 'Only jobseekers can apply for jobs',
        confirmButtonColor: '#2563EB'
      }).then(() => {
        router.push('/jobs')
      })
      return
    }

    fetchJobAndProfile()
  }, [slug, isAuthenticated, user])

  const fetchJobAndProfile = async () => {
    try {
      setLoading(true)

      // Fetch job details
      const jobResponse = await fetch(`/api/jobs/${slug}`)
      const jobData = await jobResponse.json()

      if (!jobData.success) {
        throw new Error('Job not found')
      }

      setJob(jobData.data)

      // Fetch user profile
      const profileResponse = await fetch('/api/profile/jobseeker')
      const profileData = await profileResponse.json()

      if (profileData.success) {
        setProfile(profileData.profile)
        // Pre-fill resume URL from profile
        setFormData(prev => ({
          ...prev,
          resumeUrl: profileData.profile.cvUrl || ''
        }))

        // Check if profile is complete
        if (!profileData.profile.profileCompleted) {
          Swal.fire({
            icon: 'warning',
            title: 'Profile Incomplete',
            text: 'Please complete your profile before applying for jobs',
            showCancelButton: true,
            confirmButtonText: 'Complete Profile',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#2563EB'
          }).then((result) => {
            if (result.isConfirmed) {
              router.push('/profile/jobseeker')
            } else {
              router.push(`/jobs/${slug}`)
            }
          })
        }
      }
    } catch (error) {
      console.error('Error:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load job details',
        confirmButtonColor: '#2563EB'
      }).then(() => {
        router.push('/jobs')
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation
    if (!formData.resumeUrl.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Resume Required',
        text: 'Please provide your resume URL or upload your CV in your profile',
        confirmButtonColor: '#2563EB'
      })
      return
    }

    try {
      setSubmitting(true)

      const response = await fetch(`/api/jobs/${slug}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit application')
      }

      // Success
      Swal.fire({
        icon: 'success',
        title: 'Application Submitted!',
        text: 'Your application has been successfully submitted. Good luck!',
        confirmButtonColor: '#2563EB'
      }).then(() => {
        router.push('/profile/jobseeker/applications')
      })

    } catch (error) {
      console.error('Submit error:', error)
      
      // Check if it's a duplicate application error
      if (error.message.includes('sudah melamar') || error.message.includes('already applied')) {
        Swal.fire({
          icon: 'info',
          title: 'Sudah Pernah Melamar',
          html: `
            <p>Anda sudah pernah melamar ke lowongan ini.</p>
            <p class="mt-2">Silakan cek status aplikasi Anda atau melamar ke lowongan lain.</p>
          `,
          showCancelButton: true,
          confirmButtonText: 'Lihat Status Aplikasi',
          cancelButtonText: 'Cari Lowongan Lain',
          confirmButtonColor: '#2563EB'
        }).then((result) => {
          if (result.isConfirmed) {
            router.push('/profile/jobseeker/applications')
          } else {
            router.push('/jobs')
          }
        })
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Gagal Mengirim Lamaran',
          text: error.message,
          confirmButtonColor: '#2563EB'
        })
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!job || !profile) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <Link href={`/jobs/${slug}`} className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition">
            <ArrowLeft className="w-5 h-5" />
            <span>Kembali ke Detail Lowongan</span>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Job Info Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-3xl overflow-hidden">
                {job.company.logo ? (
                  <img src={job.company.logo} alt={job.company.name} className="w-full h-full object-cover" />
                ) : (
                  '🏢'
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
                <p className="text-gray-600 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  {job.company.name}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span>{job.city}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Briefcase className="w-4 h-4 text-gray-400" />
                <span>{job.jobType}</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold text-green-600">
                <DollarSign className="w-4 h-4" />
                <span>
                  {job.showSalary && job.salaryMin && job.salaryMax
                    ? `Rp ${job.salaryMin.toLocaleString('id-ID')}`
                    : 'Negotiable'
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Application Form */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FileText className="w-6 h-6 text-blue-600" />
              Formulir Lamaran
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Summary */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  Profil Anda
                </h3>
                <div className="text-sm text-gray-700 space-y-1">
                  <p><strong>Nama:</strong> {profile.firstName} {profile.lastName}</p>
                  <p><strong>Email:</strong> {profile.email}</p>
                  <p><strong>Telepon:</strong> {profile.phone}</p>
                  {profile.currentTitle && <p><strong>Posisi Saat Ini:</strong> {profile.currentTitle}</p>}
                </div>
              </div>

              {/* Documents Section */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Dokumen Anda <span className="text-red-500">*</span>
                </label>
                <div className="grid md:grid-cols-3 gap-4">
                  {/* CV */}
                  <div className={`border-2 rounded-xl p-4 ${profile.cvUrl ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700">CV Terbaru</span>
                      {profile.cvUrl && <CheckCircle className="w-5 h-5 text-green-600" />}
                    </div>
                    {profile.cvUrl ? (
                      <div className="space-y-2">
                        <p className="text-xs text-green-700">✓ Sudah diupload</p>
                        <button
                          type="button"
                          onClick={() => setDocumentModal({ isOpen: true, url: profile.cvUrl, title: 'CV Terbaru' })}
                          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 text-white text-xs rounded-lg hover:bg-indigo-700 transition"
                        >
                          <Eye className="w-4 h-4" />
                          Lihat CV
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs text-red-600">Belum diupload</p>
                    )}
                  </div>

                  {/* KTP */}
                  <div className={`border-2 rounded-xl p-4 ${profile.ktpUrl ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700">KTP</span>
                      {profile.ktpUrl && <CheckCircle className="w-5 h-5 text-green-600" />}
                    </div>
                    {profile.ktpUrl ? (
                      <div className="space-y-2">
                        <p className="text-xs text-green-700">✓ Sudah diupload</p>
                        <button
                          type="button"
                          onClick={() => setDocumentModal({ isOpen: true, url: profile.ktpUrl, title: 'KTP' })}
                          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 text-white text-xs rounded-lg hover:bg-indigo-700 transition"
                        >
                          <Eye className="w-4 h-4" />
                          Lihat KTP
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs text-red-600">Belum diupload</p>
                    )}
                  </div>

                  {/* Kartu AK-1 */}
                  <div className={`border-2 rounded-xl p-4 ${profile.ak1Url ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700">Kartu AK-1</span>
                      {profile.ak1Url && <CheckCircle className="w-5 h-5 text-green-600" />}
                    </div>
                    {profile.ak1Url ? (
                      <div className="space-y-2">
                        <p className="text-xs text-green-700">✓ Sudah diupload</p>
                        <button
                          type="button"
                          onClick={() => setDocumentModal({ isOpen: true, url: profile.ak1Url, title: 'Kartu AK-1' })}
                          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 text-white text-xs rounded-lg hover:bg-indigo-700 transition"
                        >
                          <Eye className="w-4 h-4" />
                          Lihat AK-1
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs text-red-600">Belum diupload</p>
                    )}
                  </div>
                </div>
                
                {(!profile.cvUrl || !profile.ktpUrl || !profile.ak1Url) && (
                  <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-xs text-amber-700">
                      <strong>⚠️ Dokumen belum lengkap.</strong>{' '}
                      <Link href="/profile/jobseeker" className="text-amber-800 underline font-semibold hover:text-amber-900">
                        Lengkapi dokumen di profil Anda
                      </Link>
                    </p>
                  </div>
                )}
              </div>

              {/* Portfolio URL (Optional) */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  URL Portfolio <span className="text-gray-400">(Opsional)</span>
                </label>
                <input
                  type="url"
                  name="portfolioUrl"
                  value={formData.portfolioUrl}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://portfolio-anda.com"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Link ke portfolio, GitHub, atau website pribadi Anda
                </p>
              </div>

              {/* Terms */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-gray-700">
                    <p className="font-semibold mb-1">Sebelum Anda melamar:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Pastikan semua informasi sudah benar dan akurat</li>
                      <li>Profil Anda akan dibagikan kepada perusahaan</li>
                      <li>Anda dapat melacak status lamaran di dashboard</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4">
                <Link href={`/jobs/${slug}`} className="flex-1">
                  <button
                    type="button"
                    className="w-full py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-semibold"
                  >
                    Batal
                  </button>
                </Link>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`flex-1 py-4 rounded-xl font-semibold text-white transition flex items-center justify-center gap-2 ${
                    submitting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl'
                  }`}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Mengirim...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      Kirim Lamaran
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Document Preview Modal */}
      {documentModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-bold text-gray-900">Preview: {documentModal.title}</h3>
              <button
                type="button"
                onClick={() => setDocumentModal({ isOpen: false, url: '', title: '' })}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4 h-[70vh] overflow-auto">
              {documentModal.url && (
                <>
                  {documentModal.url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                    <img
                      src={documentModal.url}
                      alt={documentModal.title}
                      className="max-w-full h-auto mx-auto rounded-lg"
                    />
                  ) : (
                    <iframe
                      src={documentModal.url}
                      className="w-full h-full rounded-lg"
                      title={documentModal.title}
                    />
                  )}
                </>
              )}
            </div>
            <div className="flex justify-end gap-3 p-4 border-t bg-gray-50">
              <a
                href={documentModal.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Buka di Tab Baru
              </a>
              <button
                type="button"
                onClick={() => setDocumentModal({ isOpen: false, url: '', title: '' })}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm font-medium"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
