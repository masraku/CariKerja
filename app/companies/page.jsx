'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Search, MapPin, Briefcase, Users, Globe, CheckCircle, Heart, HeartOff, Filter, TrendingUp, Building2 } from 'lucide-react'

const CompaniesPage = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [followedCompanies, setFollowedCompanies] = useState([])
  const [selectedIndustry, setSelectedIndustry] = useState('all')
  const [selectedSize, setSelectedSize] = useState('all')

  // Data dummy perusahaan
  const companies = [
    {
      id: 1,
      name: 'Tech Innovate Indonesia',
      slug: 'tech-innovate-indonesia',
      logo: '🚀',
      tagline: 'Building the Future of Technology',
      industry: 'Teknologi',
      size: '200-500',
      location: 'Jakarta Selatan, DKI Jakarta',
      employees: '350+',
      activeJobs: 12,
      rating: 4.8,
      reviews: 234,
      verified: true
    },
    {
      id: 2,
      name: 'Creative Studio Co',
      slug: 'creative-studio-co',
      logo: '🎨',
      tagline: 'Design Excellence, Creative Solutions',
      industry: 'Desain',
      size: '50-200',
      location: 'Bandung, Jawa Barat',
      employees: '120+',
      activeJobs: 8,
      rating: 4.7,
      reviews: 156,
      verified: true
    },
    {
      id: 3,
      name: 'DataCore Solutions',
      slug: 'datacore-solutions',
      logo: '💻',
      tagline: 'Data-Driven Innovation',
      industry: 'Teknologi',
      size: '100-200',
      location: 'Jakarta Pusat, DKI Jakarta',
      employees: '180+',
      activeJobs: 10,
      rating: 4.6,
      reviews: 189,
      verified: true
    },
    {
      id: 4,
      name: 'Marketing Pro Agency',
      slug: 'marketing-pro-agency',
      logo: '📈',
      tagline: 'Growth Through Strategic Marketing',
      industry: 'Marketing',
      size: '50-100',
      location: 'Jakarta Selatan, DKI Jakarta',
      employees: '85+',
      activeJobs: 6,
      rating: 4.5,
      reviews: 123,
      verified: true
    },
    {
      id: 5,
      name: 'FinTech Solutions',
      slug: 'fintech-solutions',
      logo: '💰',
      tagline: 'Innovating Financial Technology',
      industry: 'Fintech',
      size: '200-500',
      location: 'Jakarta Pusat, DKI Jakarta',
      employees: '400+',
      activeJobs: 15,
      rating: 4.9,
      reviews: 312,
      verified: true
    },
    {
      id: 6,
      name: 'EduTech Platform',
      slug: 'edutech-platform',
      logo: '📚',
      tagline: 'Transforming Education Through Technology',
      industry: 'Edtech',
      size: '100-200',
      location: 'Tangerang, Banten',
      employees: '150+',
      activeJobs: 9,
      rating: 4.7,
      reviews: 167,
      verified: true
    },
    {
      id: 7,
      name: 'Cloud Systems Inc',
      slug: 'cloud-systems-inc',
      logo: '☁️',
      tagline: 'Cloud Infrastructure Excellence',
      industry: 'Teknologi',
      size: '100-200',
      location: 'Yogyakarta, DIY',
      employees: '130+',
      activeJobs: 7,
      rating: 4.6,
      reviews: 145,
      verified: true
    },
    {
      id: 8,
      name: 'HealthTech Innovations',
      slug: 'healthtech-innovations',
      logo: '🏥',
      tagline: 'Healthcare Technology Solutions',
      industry: 'Healthtech',
      size: '50-100',
      location: 'Surabaya, Jawa Timur',
      employees: '75+',
      activeJobs: 5,
      rating: 4.8,
      reviews: 98,
      verified: true
    },
    {
      id: 9,
      name: 'E-Commerce Giants',
      slug: 'e-commerce-giants',
      logo: '🛒',
      tagline: 'Leading Online Marketplace',
      industry: 'E-commerce',
      size: '500+',
      location: 'Jakarta Barat, DKI Jakarta',
      employees: '800+',
      activeJobs: 25,
      rating: 4.7,
      reviews: 456,
      verified: true
    }
  ]

  const industries = ['all', 'Teknologi', 'Desain', 'Marketing', 'Fintech', 'Edtech', 'Healthtech', 'E-commerce']
  const companySizes = ['all', '1-50', '50-100', '100-200', '200-500', '500+']

  // Filter companies
  const filteredCompanies = companies.filter(company => {
    const matchesSearch = searchQuery === '' || 
      company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.industry.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesIndustry = selectedIndustry === 'all' || company.industry === selectedIndustry
    const matchesSize = selectedSize === 'all' || company.size === selectedSize

    return matchesSearch && matchesIndustry && matchesSize
  })

  const toggleFollow = (companyId) => {
    if (followedCompanies.includes(companyId)) {
      setFollowedCompanies(followedCompanies.filter(id => id !== companyId))
    } else {
      setFollowedCompanies([...followedCompanies, companyId])
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Jelajahi Perusahaan Terbaik</h1>
            <p className="text-xl text-indigo-100 max-w-2xl mx-auto">
              Temukan perusahaan impianmu dan bergabunglah dengan tim yang luar biasa
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
              <input
                type="text"
                placeholder="Cari nama perusahaan atau industri..."
                className="w-full pl-16 pr-6 py-5 text-gray-800 text-lg border-2 border-transparent rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-300 shadow-2xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-12 mt-12">
            <div className="text-center">
              <div className="text-3xl font-bold">{companies.length}+</div>
              <div className="text-indigo-200">Perusahaan</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{companies.reduce((sum, c) => sum + c.activeJobs, 0)}+</div>
              <div className="text-indigo-200">Lowongan Aktif</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{followedCompanies.length}</div>
              <div className="text-indigo-200">Diikuti</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <span className="font-semibold text-gray-900">Filter:</span>
            </div>

            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Semua Industri</option>
              {industries.filter(i => i !== 'all').map((industry) => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>

            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Semua Ukuran</option>
              {companySizes.filter(s => s !== 'all').map((size) => (
                <option key={size} value={size}>{size} karyawan</option>
              ))}
            </select>

            {(selectedIndustry !== 'all' || selectedSize !== 'all') && (
              <button
                onClick={() => {
                  setSelectedIndustry('all')
                  setSelectedSize('all')
                }}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium ml-auto"
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>

        {/* Companies Grid */}
        {filteredCompanies.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">🏢</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Tidak ada perusahaan ditemukan</h3>
            <p className="text-gray-600">Coba ubah filter atau kata kunci pencarian Anda</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCompanies.map((company) => (
              <div
                key={company.id}
                className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-indigo-200"
              >
                {/* Card Header */}
                <div className="relative bg-gradient-to-r from-indigo-500 to-purple-600 h-32">
                  <div className="absolute -bottom-12 left-6">
                    <div className="w-24 h-24 bg-white rounded-2xl shadow-xl flex items-center justify-center text-5xl border-4 border-white group-hover:scale-110 transition-transform">
                      {company.logo}
                    </div>
                  </div>
                  {company.verified && (
                    <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 text-white text-sm">
                      <CheckCircle className="w-4 h-4" />
                      <span>Verified</span>
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className="pt-16 px-6 pb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-indigo-600 transition">
                    {company.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">{company.tagline}</p>

                  {/* Company Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>{company.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span>{company.employees} karyawan</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Briefcase className="w-4 h-4 text-gray-400" />
                      <span>{company.activeJobs} lowongan aktif</span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                      {company.industry}
                    </span>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      {company.size} employees
                    </span>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${i < Math.floor(company.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      {company.rating} ({company.reviews} reviews)
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Link
                      href={`/companies/${company.slug}`}
                      className="flex-1 text-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition font-semibold text-sm shadow-lg hover:shadow-xl"
                    >
                      Lihat Profil
                    </Link>
                    <button
                      onClick={() => toggleFollow(company.id)}
                      className={`px-4 py-3 rounded-xl transition font-semibold text-sm ${
                        followedCompanies.includes(company.id)
                          ? 'bg-red-100 text-red-600 hover:bg-red-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {followedCompanies.includes(company.id) ? (
                        <HeartOff className="w-5 h-5" />
                      ) : (
                        <Heart className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default CompaniesPage