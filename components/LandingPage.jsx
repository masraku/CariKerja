'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
    Search, Briefcase, Building2, MapPin, ArrowRight, 
    ChevronRight, Sparkles, Users, CheckCircle, TrendingUp,
    Banknote, Clock
} from 'lucide-react'

export default function LandingPage() {
    const router = useRouter()
    const [stats, setStats] = useState(null)
    const [featuredJobs, setFeaturedJobs] = useState([])
    const [topCompanies, setTopCompanies] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchKeyword, setSearchKeyword] = useState('')

    useEffect(() => {
        loadHomepageData()
    }, [])

    const loadHomepageData = async () => {
        try {
            const [statsRes, jobsRes, companiesRes] = await Promise.all([
                fetch('/api/homepage/stats'),
                fetch('/api/homepage/featured-jobs?limit=6'),
                fetch('/api/homepage/top-companies?limit=6')
            ])

            const [statsData, jobsData, companiesData] = await Promise.all([
                statsRes.json(),
                jobsRes.json(),
                companiesRes.json()
            ])

            if (statsData.success) setStats(statsData.data)
            if (jobsData.success) setFeaturedJobs(jobsData.data.jobs)
            if (companiesData.success) setTopCompanies(companiesData.data.companies)
        } catch (error) {
            console.error('Failed to load homepage data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = (e) => {
        e.preventDefault()
        const params = new URLSearchParams()
        if (searchKeyword) params.set('keyword', searchKeyword)
        router.push(`/jobs?${params.toString()}`)
    }

    const formatSalary = (min, max) => {
        const format = (num) => {
            if (!num) return null
            if (num >= 1000000) return `${(num / 1000000).toFixed(0)}jt`
            if (num >= 1000) return `${(num / 1000).toFixed(0)}rb`
            return num
        }
        if (min && max) return `${format(min)} - ${format(max)}`
        if (min) return `${format(min)}+`
        return 'Nego'
    }

    const formatJobType = (type) => {
        const map = { 'FULL_TIME': 'Full Time', 'PART_TIME': 'Part Time', 'CONTRACT': 'Contract', 'FREELANCE': 'Freelance', 'INTERNSHIP': 'Internship' }
        return map[type] || type
    }

    return (
        <div className="min-h-screen bg-white">
            
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 px-4 lg:px-8 py-20 lg:py-28 overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
                </div>
                
                <div className="max-w-5xl mx-auto relative z-10">
                    {/* Badge */}
                    <div className="flex justify-center mb-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                            <Sparkles className="w-4 h-4 text-blue-400" />
                            <span className="text-sm text-white/90 font-medium">Platform Kerja #1 Indonesia</span>
                        </div>
                    </div>

                    {/* Main Heading */}
                    <h1 className="text-4xl lg:text-6xl font-bold text-center mb-6 text-white">
                        Temukan Karir
                        <br />
                        <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                            Impianmu
                        </span>
                    </h1>

                    <p className="text-lg text-slate-300 text-center mb-10 max-w-xl mx-auto">
                        Ribuan lowongan dari perusahaan terpercaya menunggu Anda
                    </p>

                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-12">
                        <div className="bg-white rounded-2xl p-2 shadow-2xl shadow-black/20 flex flex-col sm:flex-row gap-2">
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Cari pekerjaan, perusahaan..."
                                    value={searchKeyword}
                                    onChange={(e) => setSearchKeyword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-800 placeholder-slate-400"
                                />
                            </div>
                            <button
                                type="submit"
                                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30"
                            >
                                Cari
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </form>

                    {/* Stats */}
                    {!loading && stats && (
                        <div className="flex flex-wrap justify-center gap-8 lg:gap-16">
                            <div className="text-center">
                                <div className="text-3xl lg:text-4xl font-bold text-white">{stats.totalJobs?.toLocaleString() || '0'}+</div>
                                <div className="text-sm text-slate-400">Lowongan</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl lg:text-4xl font-bold text-blue-400">{stats.totalCompanies?.toLocaleString() || '0'}+</div>
                                <div className="text-sm text-slate-400">Perusahaan</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl lg:text-4xl font-bold text-emerald-400">{stats.totalHires?.toLocaleString() || '0'}+</div>
                                <div className="text-sm text-slate-400">Diterima</div>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Featured Jobs Section */}
            <section className="px-4 lg:px-8 py-16 lg:py-20 bg-slate-50">
                <div className="max-w-6xl mx-auto">
                    {/* Section Header */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
                        <div>
                            <h2 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-2">
                                Lowongan Terbaru
                            </h2>
                            <p className="text-slate-500">Peluang terbaik untuk Anda</p>
                        </div>
                        <Link 
                            href="/jobs"
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium rounded-full transition"
                        >
                            Lihat Semua
                            <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {/* Jobs Grid */}
                    {loading ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="bg-white rounded-2xl p-5 animate-pulse">
                                    <div className="w-12 h-12 bg-slate-200 rounded-xl mb-4"></div>
                                    <div className="h-5 bg-slate-200 rounded w-3/4 mb-2"></div>
                                    <div className="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
                                    <div className="flex gap-2">
                                        <div className="h-6 bg-slate-200 rounded-full w-20"></div>
                                        <div className="h-6 bg-slate-200 rounded-full w-24"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {featuredJobs.map(job => (
                                <Link
                                    key={job.id}
                                    href={`/jobs/${job.slug}`}
                                    className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-lg hover:border-blue-100 transition group"
                                >
                                    {/* Company Logo */}
                                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden mb-4">
                                        {job.companies?.logo ? (
                                            <img src={job.companies.logo} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <Building2 className="w-6 h-6 text-slate-400" />
                                        )}
                                    </div>

                                    {/* Job Details */}
                                    <h3 className="text-lg font-semibold text-slate-800 group-hover:text-blue-600 transition mb-1 line-clamp-1">
                                        {job.title}
                                    </h3>
                                    <div className="flex items-center gap-1.5 text-slate-500 text-sm mb-3">
                                        <span>{job.companies?.name}</span>
                                        {job.companies?.verified && (
                                            <CheckCircle className="w-3.5 h-3.5 text-blue-500" />
                                        )}
                                    </div>

                                    {/* Meta */}
                                    <div className="flex flex-wrap gap-2 text-xs mb-3">
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full">
                                            <MapPin className="w-3 h-3" />
                                            {job.location || job.city}
                                        </span>
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full">
                                            <Briefcase className="w-3 h-3" />
                                            {formatJobType(job.jobType)}
                                        </span>
                                    </div>

                                    {/* Salary */}
                                    {(job.salaryMin || job.salaryMax) && (
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-sm font-medium">
                                            <Banknote className="w-4 h-4" />
                                            Rp {formatSalary(job.salaryMin, job.salaryMax)}
                                        </div>
                                    )}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Top Companies Section */}
            <section className="px-4 lg:px-8 py-16 lg:py-20 bg-white">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-2">
                            Perusahaan Terpercaya
                        </h2>
                        <p className="text-slate-500">Bergabung dengan yang terbaik</p>
                    </div>

                    {/* Companies Grid */}
                    {loading ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="bg-slate-50 rounded-2xl p-6 animate-pulse">
                                    <div className="w-14 h-14 bg-slate-200 rounded-xl mx-auto mb-3"></div>
                                    <div className="h-4 bg-slate-200 rounded w-3/4 mx-auto mb-2"></div>
                                    <div className="h-3 bg-slate-200 rounded w-1/2 mx-auto"></div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            {topCompanies.map(company => (
                                <Link
                                    key={company.id}
                                    href={`/companies/${company.slug || company.id}`}
                                    className="bg-slate-50 hover:bg-white rounded-2xl p-6 text-center border-2 border-transparent hover:border-blue-100 hover:shadow-lg transition group"
                                >
                                    <div className="w-14 h-14 rounded-xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden mx-auto mb-3 group-hover:border-blue-200 transition">
                                        {company.logo ? (
                                            <img src={company.logo} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <Building2 className="w-7 h-7 text-slate-400" />
                                        )}
                                    </div>
                                    <h3 className="font-semibold text-slate-800 text-sm mb-1 line-clamp-1">
                                        {company.name}
                                    </h3>
                                    <span className="text-xs text-blue-600 font-medium">
                                        {company.activeJobsCount} lowongan
                                    </span>
                                </Link>
                            ))}
                        </div>
                    )}

                    <div className="text-center mt-10">
                        <Link
                            href="/companies"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition shadow-lg shadow-slate-800/20"
                        >
                            Lihat Semua Perusahaan
                            <ChevronRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="px-4 lg:px-8 py-16 lg:py-20 bg-slate-50">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-2">
                            Cara Kerja
                        </h2>
                        <p className="text-slate-500">Mulai karir baru dalam 3 langkah mudah</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { 
                                icon: Users, 
                                title: 'Buat Profil', 
                                desc: 'Daftar dan lengkapi profil Anda dengan skill dan pengalaman',
                                color: 'bg-blue-500'
                            },
                            { 
                                icon: Search, 
                                title: 'Cari Lowongan', 
                                desc: 'Temukan pekerjaan yang sesuai dengan keahlian Anda',
                                color: 'bg-purple-500'
                            },
                            { 
                                icon: Briefcase, 
                                title: 'Lamar & Diterima', 
                                desc: 'Kirim lamaran dan mulai karir impian Anda',
                                color: 'bg-emerald-500'
                            }
                        ].map((step, i) => {
                            const Icon = step.icon
                            return (
                                <div key={i} className="text-center">
                                    <div className={`w-16 h-16 ${step.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                                        <Icon className="w-8 h-8 text-white" />
                                    </div>
                                    <div className="text-sm text-slate-400 font-medium mb-2">Langkah {i + 1}</div>
                                    <h3 className="text-lg font-semibold text-slate-800 mb-2">{step.title}</h3>
                                    <p className="text-slate-500 text-sm">{step.desc}</p>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="px-4 lg:px-8 py-16 lg:py-20 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-2xl lg:text-3xl font-bold text-white mb-4">
                        Siap Memulai Karir Baru?
                    </h2>
                    <p className="text-slate-300 mb-8 max-w-lg mx-auto">
                        Daftar sekarang dan akses ribuan peluang kerja dari perusahaan terpercaya
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link
                            href="/register/jobseeker"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition shadow-lg shadow-blue-600/30"
                        >
                            Cari Kerja
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                        <Link
                            href="/register/recruiter"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition border border-white/20"
                        >
                            <Building2 className="w-5 h-5" />
                            Pasang Lowongan
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    )
}