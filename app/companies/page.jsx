'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
    Search, MapPin, Briefcase, Users, CheckCircle, Heart, HeartOff, 
    Filter, Building2, Star, ArrowRight, Globe, Calendar
} from 'lucide-react'

const CompaniesPage = () => {
    const [companies, setCompanies] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [followedCompanies, setFollowedCompanies] = useState([])
    const [selectedIndustry, setSelectedIndustry] = useState('all')
    const [selectedSize, setSelectedSize] = useState('all')
    const [industries, setIndustries] = useState(['all'])
    const companySizes = ['all', '1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']

    useEffect(() => { loadCompanies() }, [selectedIndustry, selectedSize])
    useEffect(() => {
        const timer = setTimeout(() => { if (searchQuery || searchQuery === '') loadCompanies() }, 500)
        return () => clearTimeout(timer)
    }, [searchQuery])

    useEffect(() => {
        const saved = localStorage.getItem('followedCompanies')
        if (saved) setFollowedCompanies(JSON.parse(saved))
    }, [])

    useEffect(() => {
        localStorage.setItem('followedCompanies', JSON.stringify(followedCompanies))
    }, [followedCompanies])

    const loadCompanies = async () => {
        try {
            setLoading(true)
            const params = new URLSearchParams()
            if (searchQuery) params.append('search', searchQuery)
            if (selectedIndustry !== 'all') params.append('industry', selectedIndustry)
            if (selectedSize !== 'all') params.append('size', selectedSize)

            const response = await fetch(`/api/companies?${params.toString()}`)
            const data = await response.json()
            if (response.ok) {
                setCompanies(data.companies)
                const uniqueIndustries = ['all', ...new Set(
                    data.companies.map(c => c.industry).filter(i => i && i !== 'Belum dilengkapi')
                )]
                setIndustries(uniqueIndustries)
            }
        } catch (error) {
            console.error('Load companies error:', error)
        } finally {
            setLoading(false)
        }
    }

    const toggleFollow = (companyId) => {
        setFollowedCompanies(prev => prev.includes(companyId) ? prev.filter(id => id !== companyId) : [...prev, companyId])
    }

    const totalActiveJobs = companies.reduce((sum, c) => sum + c.activeJobs, 0)
    const hasFilters = selectedIndustry !== 'all' || selectedSize !== 'all'

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-4 lg:px-8 py-12 lg:py-16">
                <div className="max-w-5xl mx-auto text-center">
                    <h1 className="text-3xl lg:text-4xl font-bold text-white mb-3">
                        Jelajahi Perusahaan Terbaik
                    </h1>
                    <p className="text-slate-300 mb-8">
                        Temukan perusahaan impianmu dan bergabunglah dengan tim luar biasa
                    </p>

                    {/* Search Box */}
                    <div className="bg-white rounded-2xl p-4 lg:p-6 shadow-2xl shadow-slate-900/20 max-w-2xl mx-auto">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Cari nama perusahaan atau industri..."
                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-800 placeholder-slate-400"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="flex justify-center gap-8 lg:gap-12 mt-8">
                        <div className="text-center">
                            <div className="text-2xl lg:text-3xl font-bold text-white">{companies.length}</div>
                            <div className="text-sm text-slate-400">Perusahaan</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl lg:text-3xl font-bold text-emerald-400">{totalActiveJobs}</div>
                            <div className="text-sm text-slate-400">Lowongan Aktif</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl lg:text-3xl font-bold text-pink-400">{followedCompanies.length}</div>
                            <div className="text-sm text-slate-400">Diikuti</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
                {/* Filter Bar */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 mb-6">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2 text-slate-700 font-medium">
                            <Filter className="w-5 h-5" />
                            <span>Filter:</span>
                        </div>

                        <select
                            value={selectedIndustry}
                            onChange={(e) => setSelectedIndustry(e.target.value)}
                            className="px-4 py-2.5 bg-slate-50 border-0 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">Semua Industri</option>
                            {industries.filter(i => i !== 'all').map(ind => (
                                <option key={ind} value={ind}>{ind}</option>
                            ))}
                        </select>

                        <select
                            value={selectedSize}
                            onChange={(e) => setSelectedSize(e.target.value)}
                            className="px-4 py-2.5 bg-slate-50 border-0 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">Semua Ukuran</option>
                            {companySizes.filter(s => s !== 'all').map(size => (
                                <option key={size} value={size}>{size} karyawan</option>
                            ))}
                        </select>

                        {hasFilters && (
                            <button
                                onClick={() => { setSelectedIndustry('all'); setSelectedSize('all') }}
                                className="ml-auto text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                                Reset Filter
                            </button>
                        )}
                    </div>
                </div>

                {/* Results Count */}
                <div className="mb-4">
                    <p className="text-sm text-slate-500">
                        Menampilkan <span className="font-semibold text-slate-700">{companies.length}</span> perusahaan
                    </p>
                </div>

                {/* Loading Skeleton */}
                {loading ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-pulse">
                                <div className="h-24 bg-slate-200"></div>
                                <div className="p-5 pt-12">
                                    <div className="h-5 bg-slate-200 rounded w-2/3 mb-2"></div>
                                    <div className="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
                                    <div className="space-y-2 mb-4">
                                        <div className="h-3 bg-slate-200 rounded w-full"></div>
                                        <div className="h-3 bg-slate-200 rounded w-3/4"></div>
                                    </div>
                                    <div className="h-10 bg-slate-200 rounded-xl"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : companies.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-16 text-center">
                        <Building2 className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-800 mb-2">Tidak ada perusahaan ditemukan</h3>
                        <p className="text-slate-500 mb-6">Coba ubah filter pencarian Anda</p>
                        <button
                            onClick={() => { setSearchQuery(''); setSelectedIndustry('all'); setSelectedSize('all') }}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition"
                        >
                            Reset Filter
                        </button>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {companies.map(company => (
                            <div key={company.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg hover:border-blue-100 transition group">
                                {/* Card Header */}
                                <div className="h-24 bg-gradient-to-r from-slate-700 to-slate-600 relative">
                                    {/* Logo */}
                                    <div className="absolute -bottom-8 left-5 w-16 h-16 bg-white rounded-xl shadow-lg border-4 border-white flex items-center justify-center overflow-hidden">
                                        {company.logo ? (
                                            <img src={company.logo} alt={company.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <Building2 className="w-8 h-8 text-slate-400" />
                                        )}
                                    </div>
                                    {/* Verified Badge */}
                                    {company.verified && (
                                        <div className="absolute top-3 right-3 px-2.5 py-1 bg-white/20 backdrop-blur-sm rounded-full flex items-center gap-1.5 text-white text-xs">
                                            <CheckCircle className="w-3.5 h-3.5" />
                                            <span>Verified</span>
                                        </div>
                                    )}
                                </div>

                                {/* Card Body */}
                                <div className="p-5 pt-12">
                                    <h3 className="text-lg font-semibold text-slate-800 group-hover:text-blue-600 transition truncate">
                                        {company.name}
                                    </h3>
                                    {company.tagline && (
                                        <p className="text-sm text-slate-500 truncate mt-0.5">{company.tagline}</p>
                                    )}

                                    {/* Info */}
                                    <div className="space-y-2 mt-4 mb-4">
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                            <span className="truncate">{company.location}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <Users className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                            <span>{company.companySize} karyawan</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <Briefcase className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                            <span className="text-blue-600 font-medium">{company.activeJobs} lowongan aktif</span>
                                        </div>
                                    </div>

                                    {/* Industry Badge */}
                                    {company.industry && company.industry !== 'Belum dilengkapi' && (
                                        <div className="mb-4">
                                            <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                                                {company.industry}
                                            </span>
                                        </div>
                                    )}

                                    {/* Rating */}
                                    {company.rating > 0 && (
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="flex">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`w-4 h-4 ${i < Math.floor(company.rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`}
                                                    />
                                                ))}
                                            </div>
                                            <span className="text-sm text-slate-500">
                                                {company.rating} ({company.reviews} reviews)
                                            </span>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex gap-3">
                                        <Link
                                            href={`/companies/${company.slug}`}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition"
                                        >
                                            Lihat Profil
                                            <ArrowRight className="w-4 h-4" />
                                        </Link>
                                        <button
                                            onClick={() => toggleFollow(company.id)}
                                            className={`p-2.5 rounded-xl transition ${
                                                followedCompanies.includes(company.id)
                                                    ? 'bg-pink-100 text-pink-600'
                                                    : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                            }`}
                                        >
                                            {followedCompanies.includes(company.id) ? (
                                                <Heart className="w-5 h-5 fill-current" />
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