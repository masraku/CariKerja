'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import {
  Building2,
  MapPin,
  Users,
  Briefcase,
  Globe,
  Mail,
  Phone,
  Star,
  CheckCircle,
  Calendar,
  TrendingUp,
  Award,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  ArrowLeft,
  ExternalLink
} from 'lucide-react'

export default function CompanyProfilePage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [company, setCompany] = useState(null)
  const [activeTab, setActiveTab] = useState('about')

  useEffect(() => {
    if (params?.slug) {
      loadCompanyProfile()
    }
  }, [params?.slug])

  const loadCompanyProfile = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/companies/${params.slug}`)

      if (response.ok) {
        const data = await response.json()
        setCompany(data.company)
      } else {
        router.push('/companies')
      }
    } catch (error) {
      console.error('Load company error:', error)
    } finally {
      setLoading(false)
    }
  }

  const getJobTypeLabel = (type) => {
    const labels = {
      FULL_TIME: 'Full Time',
      PART_TIME: 'Part Time',
      CONTRACT: 'Contract',
      INTERNSHIP: 'Magang'
    }
    return labels[type] || type
  }

  const getLevelLabel = (level) => {
    const labels = {
      ENTRY_LEVEL: 'Entry Level',
      JUNIOR: 'Junior',
      MID_LEVEL: 'Mid Level',
      SENIOR: 'Senior',
      LEAD: 'Lead',
      MANAGER: 'Manager',
      DIRECTOR: 'Director'
    }
    return labels[level] || level
  }

  const formatSalary = (min, max, type) => {
    const formatNumber = (num) => new Intl.NumberFormat('id-ID').format(num)
    if (!min || !max) return 'Negotiable'

    const typeLabel = {
      monthly: '/ bulan',
      yearly: '/ tahun',
      hourly: '/ jam'
    }

    return `Rp ${formatNumber(min)} - Rp ${formatNumber(max)} ${typeLabel[type] || ''}`
  }

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000)
    let interval = seconds / 31536000
    if (interval > 1) return Math.floor(interval) + ' tahun lalu'
    interval = seconds / 2592000
    if (interval > 1) return Math.floor(interval) + ' bulan lalu'
    interval = seconds / 86400
    if (interval > 1) return Math.floor(interval) + ' hari lalu'
    interval = seconds / 3600
    if (interval > 1) return Math.floor(interval) + ' jam lalu'
    interval = seconds / 60
    if (interval > 1) return Math.floor(interval) + ' menit lalu'
    return 'Baru saja'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading company profile...</p>
        </div>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Company Not Found</h2>
          <p className="text-gray-600 mb-4">Perusahaan yang Anda cari tidak ditemukan</p>
          <Link href="/companies" className="text-blue-600 hover:text-blue-700">
            ← Kembali ke Daftar Perusahaan
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-48"></div>

      <div className="container mx-auto px-4 max-w-7xl">

        <div className="relative -mt-32 mb-6">
          <div className="bg-white rounded-2xl shadow-xl p-8">

            <div className="flex flex-col md:flex-row gap-6">
              
              <div className="flex-shrink-0">
                <div className="w-32 h-32 bg-white rounded-xl shadow-lg overflow-hidden border-4 border-white">
                  {company.logo ? (
                    <img src={company.logo} alt={company.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold">
                      {company.name.charAt(0)}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1">

                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{company.name}</h1>

                    {company.tagline && (
                      <p className="text-lg text-gray-600 mb-3">{company.tagline}</p>
                    )}

                    {company.verified && (
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        <CheckCircle className="w-4 h-4" />
                        Verified Company
                      </div>
                    )}
                  </div>

                  <Link href="/companies" className="text-gray-600 hover:text-gray-900 flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Kembali
                  </Link>
                </div>

                <div className="flex flex-wrap gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-2"><Building2 className="w-4 h-4" />{company.industry}</div>
                  <div className="flex items-center gap-2"><Users className="w-4 h-4" />{company.companySize} karyawan</div>
                  <div className="flex items-center gap-2"><MapPin className="w-4 h-4" />{company.city}, {company.province}</div>
                  <div className="flex items-center gap-2"><Briefcase className="w-4 h-4" />{company._count.jobs} lowongan aktif</div>

                  {company.averageRatings && (
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      {company.averageRatings.overall} ({company._count.reviews} reviews)
                    </div>
                  )}
                </div>

                {/* 🔧 FIXED: Missing <a> */}
                <div className="flex flex-wrap gap-4 mt-4">

                  {company.website && (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition"
                    >
                      <Globe className="w-4 h-4" />
                      Website
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}

                  {company.linkedinUrl && (
                    <a
                      href={company.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                    >
                      <Linkedin className="w-5 h-5" />
                    </a>
                  )}

                  {company.facebookUrl && (
                    <a
                      href={company.facebookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                    >
                      <Facebook className="w-5 h-5" />
                    </a>
                  )}

                  {company.twitterUrl && (
                    <a
                      href={company.twitterUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                    >
                      <Twitter className="w-5 h-5" />
                    </a>
                  )}

                  {company.instagramUrl && (
                    <a
                      href={company.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                    >
                      <Instagram className="w-5 h-5" />
                    </a>
                  )}

                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {[
              { id: 'about', label: 'Tentang', icon: Building2 },
              { id: 'jobs', label: `Lowongan (${company.jobs.length})`, icon: Briefcase },
              { id: 'benefits', label: 'Benefits', icon: Award },
              { id: 'reviews', label: `Reviews (${company._count.reviews})`, icon: Star }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition whitespace-nowrap ${
                  activeTab === tab.id ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 pb-12">

          <div className="lg:col-span-2 space-y-6">

            {activeTab === 'about' && (
              <>
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Tentang Perusahaan</h2>
                  <div className="prose max-w-none text-gray-700 whitespace-pre-line">
                    {company.bio || company.description || 'Belum ada deskripsi perusahaan.'}
                  </div>
                </div>

                {company.culture && (
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Budaya Kerja</h2>
                    <div className="prose max-w-none text-gray-700">{company.culture}</div>
                  </div>
                )}

                {company.gallery?.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Galeri</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {company.gallery.map((image, index) => (
                        <div key={index} className="aspect-video rounded-lg overflow-hidden">
                          <img src={image} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover hover:scale-105 transition" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {activeTab === 'jobs' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Lowongan Kerja Aktif</h2>

                {company.jobs.length === 0 ? (
                  <div className="text-center py-12">
                    <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">Belum ada lowongan aktif</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {company.jobs.map((job) => (
                      <Link
                        key={job.id}
                        href={`/jobs/${job.slug}`}
                        className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg mb-1">{job.title}</h3>

                            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                              <div className="flex items-center gap-1"><MapPin className="w-4 h-4" />{job.city}</div>
                              <div className="flex items-center gap-1"><Briefcase className="w-4 h-4" />{getJobTypeLabel(job.jobType)}</div>
                              <div className="flex items-center gap-1"><TrendingUp className="w-4 h-4" />{getLevelLabel(job.level)}</div>
                            </div>
                          </div>
                        </div>

                        {job.showSalary && job.salaryMin && job.salaryMax && (
                          <p className="text-blue-600 font-semibold mb-2">
                            {formatSalary(job.salaryMin, job.salaryMax, job.salaryType)}
                          </p>
                        )}

                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>{job._count.applications} pelamar</span>
                          <span>Posted {getTimeAgo(job.createdAt)}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'benefits' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Benefits & Fasilitas</h2>

                {company.benefits?.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {company.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{benefit}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">Informasi benefits belum tersedia</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Reviews & Ratings</h2>

                {company.reviews.length === 0 ? (
                  <div className="text-center py-12">
                    <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">Belum ada review</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {company.reviews.map((review) => (
                      <div key={review.id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                            {review.jobseeker?.firstName?.charAt(0) || 'U'}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-semibold text-gray-900">
                                {review.isAnonymous ? 'Anonymous' : review.jobseeker?.firstName}
                              </h4>

                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span className="font-semibold">{review.rating}</span>
                              </div>
                            </div>

                            {review.position && (
                              <p className="text-sm text-gray-600">{review.position}</p>
                            )}
                          </div>
                        </div>

                        <h5 className="font-semibold text-gray-900 mb-2">{review.title}</h5>
                        <p className="text-gray-700 text-sm">{review.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-6">

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4">Detail Perusahaan</h3>

              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-gray-600 mb-1">Industri</p>
                  <p className="font-semibold text-gray-900">{company.industry}</p>
                </div>

                <div>
                  <p className="text-gray-600 mb-1">Ukuran Perusahaan</p>
                  <p className="font-semibold text-gray-900">{company.companySize} karyawan</p>
                </div>

                {company.foundedYear && (
                  <div>
                    <p className="text-gray-600 mb-1">Tahun Didirikan</p>
                    <p className="font-semibold text-gray-900">{company.foundedYear}</p>
                  </div>
                )}

                <div>
                  <p className="text-gray-600 mb-1">Lokasi</p>
                  <p className="font-semibold text-gray-900">
                    {company.address}
                    <br />
                    {company.city}, {company.province}
                  </p>
                </div>

                {/* 🔧 FIXED: Missing <a> */}
                {company.email && (
                  <div>
                    <p className="text-gray-600 mb-1">Email</p>
                    <a
                      href={`mailto:${company.email}`}
                      className="font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <Mail className="w-4 h-4" />
                      {company.email}
                    </a>
                  </div>
                )}

                {/* 🔧 FIXED */}
                {company.phone && (
                  <div>
                    <p className="text-gray-600 mb-1">Telepon</p>
                    <a
                      href={`tel:${company.phone}`}
                      className="font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <Phone className="w-4 h-4" />
                      {company.phone}
                    </a>
                  </div>
                )}

              </div>
            </div>

            {company.averageRatings && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-bold text-gray-900 mb-4">Rating Details</h3>

                <div className="space-y-3">
                  {[
                    { label: 'Work-Life Balance', value: company.averageRatings.workLifeBalance },
                    { label: 'Compensation', value: company.averageRatings.compensation },
                    { label: 'Career Growth', value: company.averageRatings.careerGrowth },
                    { label: 'Management', value: company.averageRatings.management },
                    { label: 'Culture', value: company.averageRatings.culture }
                  ].map((item, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">{item.label}</span>
                        <span className="font-semibold text-gray-900">{item.value}</span>
                      </div>

                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-yellow-400 h-2 rounded-full"
                          style={{ width: `${(item.value / 5) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
