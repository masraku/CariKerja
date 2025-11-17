'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { MapPin, Briefcase, Users, TrendingUp, Globe, Mail, Phone, Linkedin, Instagram, Facebook, Twitter, Building2, Calendar, Award, CheckCircle, ChevronRight, ChevronLeft, ExternalLink, Heart, HeartOff, Star, DollarSign, Clock, ArrowLeft } from 'lucide-react'

const CompanyDetailPage = () => {
  const params = useParams()
  const router = useRouter()
  const [isFollowing, setIsFollowing] = useState(false)
  const [selectedTab, setSelectedTab] = useState('about')

  // Data dummy perusahaan
  const companiesData = {
    'tech-innovate-indonesia': {
      id: 1,
      name: 'Tech Innovate Indonesia',
      slug: 'tech-innovate-indonesia',
      logo: '🚀',
      tagline: 'Building the Future of Technology',
      industry: 'Teknologi',
      size: '200-500',
      location: 'Jakarta Selatan, DKI Jakarta',
      address: 'Jl. Sudirman No. 123, Setiabudi, Jakarta Selatan 12920',
      founded: '2015',
      employees: '350+',
      activeJobs: 12,
      totalHired: 150,
      rating: 4.8,
      reviews: 234,
      description: 'Tech Innovate Indonesia adalah perusahaan teknologi terkemuka yang berfokus pada pengembangan solusi digital inovatif. Kami berkomitmen untuk menciptakan produk berkualitas tinggi yang memberikan dampak positif bagi masyarakat.',
      culture: 'Kami menghargai kreativitas, kolaborasi, dan inovasi. Lingkungan kerja kami mendukung work-life balance dengan flexible working hours dan remote working options.',
      benefits: [
        'Gaji kompetitif di atas rata-rata industri',
        'BPJS Kesehatan & Ketenagakerjaan',
        'Asuransi kesehatan keluarga',
        'Tunjangan transportasi & makan',
        'Bonus tahunan & performance bonus',
        'Work from home flexibility',
        'Learning & development budget',
        'Laptop & perangkat kerja premium',
        'Team building & company trip',
        'Parental leave hingga 3 bulan',
        'Stock options untuk senior roles',
        'Unlimited coffee & snacks'
      ],
      website: 'https://techinnovate.id',
      email: 'careers@techinnovate.id',
      phone: '+62 21 1234 5678',
      social: {
        linkedin: 'https://linkedin.com/company/techinnovate',
        instagram: 'https://instagram.com/techinnovate',
        facebook: 'https://facebook.com/techinnovate',
        twitter: 'https://twitter.com/techinnovate'
      },
      gallery: ['🏢', '👥', '💻', '🎉', '🌟', '🚀', '📱', '⚡'],
      jobs: [
        { 
          id: 1, 
          title: 'Senior Frontend Developer', 
          type: 'Full Time', 
          salary: 'Rp 15-20 Juta', 
          postedDate: '2024-11-12',
          applicants: 45,
          location: 'Jakarta'
        },
        { 
          id: 2, 
          title: 'Backend Engineer', 
          type: 'Full Time', 
          salary: 'Rp 12-18 Juta', 
          postedDate: '2024-11-11',
          applicants: 32,
          location: 'Jakarta'
        }
      ],
      verified: true,
      teamSize: {
        engineering: 150,
        product: 40,
        design: 30,
        marketing: 25,
        sales: 35,
        hr: 20,
        others: 50
      }
    },
    'creative-studio-co': {
      id: 2,
      name: 'Creative Studio Co',
      slug: 'creative-studio-co',
      logo: '🎨',
      tagline: 'Design Excellence, Creative Solutions',
      industry: 'Desain',
      size: '50-200',
      location: 'Bandung, Jawa Barat',
      address: 'Jl. Dago No. 45, Coblong, Bandung 40135',
      founded: '2018',
      employees: '120+',
      activeJobs: 8,
      totalHired: 85,
      rating: 4.7,
      reviews: 156,
      description: 'Creative Studio Co adalah agensi desain kreatif yang mengkhususkan diri dalam branding, UI/UX design, dan digital marketing.',
      culture: 'Kami adalah tim yang passionate tentang desain dan kreativitas. Lingkungan kerja kami fun, inspiring, dan mendukung eksperimen kreatif.',
      benefits: [
        'Gaji kompetitif + project bonus',
        'BPJS lengkap',
        'Creative workspace & tools',
        'Flexible working hours',
        'Workshop & training rutin',
        'Laptop & design tools subscription'
      ],
      website: 'https://creativestudio.co.id',
      email: 'hello@creativestudio.co.id',
      phone: '+62 22 8765 4321',
      social: {
        linkedin: 'https://linkedin.com/company/creativestudio',
        instagram: 'https://instagram.com/creativestudio',
        facebook: 'https://facebook.com/creativestudio',
        twitter: 'https://twitter.com/creativestudio'
      },
      gallery: ['🎨', '✨', '🖼️', '🎯', '💡', '🌈', '📐', '🖌️'],
      jobs: [
        { 
          id: 4, 
          title: 'UI/UX Designer', 
          type: 'Full Time', 
          salary: 'Rp 10-15 Juta', 
          postedDate: '2024-11-13',
          applicants: 67,
          location: 'Bandung'
        }
      ],
      verified: true,
      teamSize: {
        engineering: 20,
        product: 15,
        design: 50,
        marketing: 15,
        sales: 10,
        hr: 5,
        others: 5
      }
    }
  }

  const company = companiesData[params.slug]

  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🏢</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Perusahaan tidak ditemukan</h2>
          <p className="text-gray-600 mb-6">Perusahaan yang Anda cari tidak tersedia</p>
          <Link
            href="/companies"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Kembali ke Daftar Perusahaan
          </Link>
        </div>
      </div>
    )
  }

  const getTimeSince = (date) => {
    const days = Math.floor((new Date() - new Date(date)) / (1000 * 60 * 60 * 24))
    if (days === 0) return 'Hari ini'
    if (days === 1) return 'Kemarin'
    return `${days} hari yang lalu`
  }

  const tabs = [
    { id: 'about', label: 'Tentang', icon: Building2 },
    { id: 'culture', label: 'Budaya Kerja', icon: Users },
    { id: 'benefits', label: 'Benefits', icon: Award },
    { id: 'jobs', label: `Lowongan (${company.jobs.length})`, icon: Briefcase }
  ]

  const handleFollowClick = () => {
    setIsFollowing(!isFollowing)
  }

  const handleWebsiteClick = (e) => {
    e.preventDefault()
    window.open(company.website, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Kembali</span>
          </button>
        </div>
      </div>

      {/* Company Header */}
      <div className="relative">
        {/* Cover Image */}
        <div className="h-64 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500"></div>
        
        {/* Company Info */}
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl -mt-20 relative z-10 p-8">
            <div className="flex flex-col md:flex-row items-start gap-6">
              {/* Logo */}
              <div className="w-32 h-32 bg-white rounded-2xl shadow-lg flex items-center justify-center text-6xl border-4 border-gray-100 flex-shrink-0">
                {company.logo}
              </div>

              {/* Company Details */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4 gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{company.name}</h1>
                      {company.verified && (
                        <div className="flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                          <CheckCircle className="w-4 h-4" />
                          <span>Verified</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xl text-gray-600 mb-3">{company.tagline}</p>
                    
                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${i < Math.floor(company.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      <span className="text-gray-600 font-medium">
                        {company.rating} ({company.reviews} reviews)
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons - Desktop */}
                  <div className="hidden md:flex gap-3">
                    <button
                      onClick={handleFollowClick}
                      className={`flex items-center gap-2 px-6 py-3 rounded-xl transition font-semibold ${
                        isFollowing
                          ? 'bg-red-100 text-red-600 hover:bg-red-200'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg'
                      }`}
                    >
                      {isFollowing ? (
                        <>
                          <HeartOff className="w-5 h-5" />
                          <span>Berhenti Mengikuti</span>
                        </>
                      ) : (
                        <>
                          <Heart className="w-5 h-5" />
                          <span>Ikuti Perusahaan</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleWebsiteClick}
                      className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-semibold"
                    >
                      <Globe className="w-5 h-5" />
                      <span>Website</span>
                    </button>
                  </div>
                </div>

                {/* Quick Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2 text-gray-700">
                    <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <div>
                      <div className="text-xs text-gray-500">Lokasi</div>
                      <div className="font-semibold text-sm">{company.location}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Users className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <div>
                      <div className="text-xs text-gray-500">Karyawan</div>
                      <div className="font-semibold text-sm">{company.employees}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <div>
                      <div className="text-xs text-gray-500">Didirikan</div>
                      <div className="font-semibold text-sm">{company.founded}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Briefcase className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <div>
                      <div className="text-xs text-gray-500">Lowongan</div>
                      <div className="font-semibold text-sm">{company.activeJobs} aktif</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons - Mobile */}
            <div className="md:hidden flex gap-3 mt-6">
              <button
                onClick={handleFollowClick}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition font-semibold ${
                  isFollowing
                    ? 'bg-red-100 text-red-600'
                    : 'bg-indigo-600 text-white'
                }`}
              >
                {isFollowing ? <HeartOff className="w-5 h-5" /> : <Heart className="w-5 h-5" />}
                <span>{isFollowing ? 'Unfollow' : 'Follow'}</span>
              </button>
              <button
                onClick={handleWebsiteClick}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl transition font-semibold"
              >
                <Globe className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 my-8">
            <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{company.activeJobs}</div>
                  <div className="text-sm text-gray-600">Lowongan Aktif</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{company.employees}</div>
                  <div className="text-sm text-gray-600">Karyawan</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{company.totalHired}</div>
                  <div className="text-sm text-gray-600">Total Hired</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Star className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{company.rating}</div>
                  <div className="text-sm text-gray-600">Rating</div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-2xl shadow-md overflow-hidden mb-8">
            <div className="border-b border-gray-200 overflow-x-auto">
              <div className="flex">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setSelectedTab(tab.id)}
                      className={`flex items-center gap-2 px-6 py-4 font-semibold transition whitespace-nowrap ${
                        selectedTab === tab.id
                          ? 'text-indigo-600 border-b-2 border-indigo-600'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{tab.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-8">
              {selectedTab === 'about' && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Tentang Perusahaan</h3>
                    <p className="text-gray-700 leading-relaxed mb-6">{company.description}</p>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 rounded-xl p-6">
                        <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <Building2 className="w-5 h-5 text-indigo-600" />
                          Informasi Perusahaan
                        </h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Industri:</span>
                            <span className="font-semibold text-gray-900">{company.industry}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Ukuran:</span>
                            <span className="font-semibold text-gray-900">{company.size} karyawan</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Didirikan:</span>
                            <span className="font-semibold text-gray-900">{company.founded}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-6">
                        <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-indigo-600" />
                          Lokasi Kantor
                        </h4>
                        <p className="text-gray-700 leading-relaxed mb-4">
                          {company.address}
                        </p>
                        <Link
                          href={`https://maps.google.com/?q=${encodeURIComponent(company.address)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-700 font-medium text-sm flex items-center gap-1"
                        >
                          <span>Lihat di Google Maps</span>
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Gallery */}
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Galeri Perusahaan</h3>
                    <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
                      {company.gallery.map((item, index) => (
                        <div key={index} className="aspect-square bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center text-4xl md:text-5xl hover:scale-105 transition-transform cursor-pointer shadow-md hover:shadow-xl">
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {selectedTab === 'culture' && (
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Budaya Kerja Kami</h3>
                  <p className="text-gray-700 leading-relaxed mb-8">{company.culture}</p>

                  <h4 className="text-xl font-bold text-gray-900 mb-4">Komposisi Tim</h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    {Object.entries(company.teamSize).map(([dept, count]) => (
                      <div key={dept} className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-700 font-medium capitalize">{dept}</span>
                          <span className="text-indigo-600 font-bold">{count} orang</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full transition-all"
                            style={{ width: `${(count / parseInt(company.employees)) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedTab === 'benefits' && (
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Benefit & Fasilitas</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {company.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-start gap-3 bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl hover:shadow-md transition">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedTab === 'jobs' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-900">Lowongan Aktif ({company.jobs.length})</h3>
                    <Link
                      href={`/jobs?company=${company.name}`}
                      className="text-indigo-600 hover:text-indigo-700 font-medium text-sm flex items-center gap-1"
                    >
                      <span>Lihat Semua</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                  <div className="space-y-4">
                    {company.jobs.map((job) => (
                      <div key={job.id} className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                          <div className="flex-1">
                            <h4 className="text-xl font-bold text-gray-900 mb-3">{job.title}</h4>
                            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Briefcase className="w-4 h-4" />
                                <span>{job.type}</span>
                              </div>
                              <div className="flex items-center gap-1 font-semibold text-green-600">
                                <DollarSign className="w-4 h-4" />
                                <span>{job.salary}</span>
                              </div>
                              <div className="flex items-center gap-1 text-gray-500">
                                <Clock className="w-4 h-4" />
                                <span>{getTimeSince(job.postedDate)}</span>
                              </div>
                            </div>
                          </div>
                          <Link
                            href={`/jobs/${job.id}`}
                            className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition font-semibold text-sm shadow-lg text-center"
                          >
                            Lamar Sekarang
                          </Link>
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

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Tertarik Bergabung dengan {company.name}?
          </h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Lihat semua lowongan yang tersedia dan mulai perjalanan karir Anda
          </p>
          <Link
            href={`/jobs?company=${company.name}`}
            className="inline-flex items-center justify-center gap-2 bg-white text-indigo-600 px-8 py-4 rounded-xl hover:bg-gray-100 transition-all font-bold text-lg shadow-2xl"
          >
            <Briefcase className="w-6 h-6" />
            <span>Lihat Semua Lowongan</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default CompanyDetailPage