'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
    Search, Briefcase, Building2, Users, TrendingUp,
    MapPin, DollarSign, Clock, ArrowRight, CheckCircle
} from 'lucide-react'

export default function DynamicHomepage() {
    const router = useRouter()
    const [stats, setStats] = useState(null)
    const [featuredJobs, setFeaturedJobs] = useState([])
    const [topCompanies, setTopCompanies] = useState([])
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchKeyword, setSearchKeyword] = useState('')
    const [searchLocation, setSearchLocation] = useState('')

    useEffect(() => {
        loadHomepageData()
    }, [])

    const loadHomepageData = async () => {
        try {
            const [statsRes, jobsRes, companiesRes, categoriesRes] = await Promise.all([
                fetch('/api/homepage/stats'),
                fetch('/api/homepage/featured-jobs?limit=6'),
                fetch('/api/homepage/top-companies?limit=8'),
                fetch('/api/homepage/categories')
            ])

            const [statsData, jobsData, companiesData, categoriesData] = await Promise.all([
                statsRes.json(),
                jobsRes.json(),
                companiesRes.json(),
                categoriesRes.json()
            ])

            if (statsData.success) setStats(statsData.data)
            if (jobsData.success) setFeaturedJobs(jobsData.data.jobs)
            if (companiesData.success) setTopCompanies(companiesData.data.companies)
            if (categoriesData.success) setCategories(categoriesData.data.categories.slice(0, 8))
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
        if (searchLocation) params.set('location', searchLocation)
        router.push(`/jobs?${params.toString()}`)
    }

    const formatSalary = (min, max, currency = 'IDR') => {
        const format = (num) => {
            if (!num) return null
            return new Intl.NumberFormat('id-ID', { 
                notation: 'compact',
                maximumFractionDigits: 1 
            }).format(num)
        }
        
        if (min && max) return `${format(min)} - ${format(max)}`
        if (min) return `${format(min)}+`
        return 'Negotiable'
    }

    const timeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000)
        const intervals = {
            tahun: 31536000,
            bulan: 2592000,
            minggu: 604800,
            hari: 86400,
            jam: 3600,
            menit: 60
        }
        
        for (const [name, seconds_in] of Object.entries(intervals)) {
            const interval = Math.floor(seconds / seconds_in)
            if (interval >= 1) {
                return `${interval} ${name} lalu`
            }
        }
        return 'Baru saja'
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
            {/* Hero Section */}
            <section className="relative py-20 px-4 overflow-hidden">
                {/* Background decoration */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                </div>

                <div className="max-w-7xl mx-auto relative z-10">
                    {/* Hero Content */}
                    <div className="text-center max-w-4xl mx-auto">
                        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                            Temukan Pekerjaan <span className="text-blue-600">Impian Anda</span>
                        </h1>
                        <p className="text-xl text-gray-600 mb-8">
                            Platform terpercaya untuk menghubungkan pencari kerja dengan perusahaan terbaik di Indonesia
                        </p>

                        {/* Search Bar */}
                        <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-xl p-3 flex flex-col md:flex-row gap-3 mb-12">
                            <div className="flex-1 flex items-center px-4 border-r border-gray-200">
                                <Search className="w-5 h-5 text-gray-400 mr-2" />
                                <input
                                    type="text"
                                    placeholder="Cari pekerjaan, posisi, perusahaan..."
                                    value={searchKeyword}
                                    onChange={(e) => setSearchKeyword(e.target.value)}
                                    className="flex-1 py-3 outline-none text-gray-900 placeholder-gray-400"
                                />
                            </div>
                            <div className="flex-1 flex items-center px-4">
                                <MapPin className="w-5 h-5 text-gray-400 mr-2" />
                                <input
                                    type="text"
                                    placeholder="Lokasi..."
                                    value={searchLocation}
                                    onChange={(e) => setSearchLocation(e.target.value)}
                                    className="flex-1 py-3 outline-none text-gray-900 placeholder-gray-400"
                                />
                            </div>
                            <button
                                type="submit"
                                className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium flex items-center justify-center gap-2"
                            >
                                <Search className="w-5 h-5" />
                                Cari Lowongan
                            </button>
                        </form>

                        {/* Stats */}
                        {!loading && stats && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                                <div className="text-center">
                                    <div className="text-4xl font-bold text-blue-600">{stats.totalJobs.toLocaleString()}+</div>
                                    <div className="text-gray-600 mt-1">Lowongan Aktif</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-4xl font-bold text-blue-600">{stats.totalCompanies.toLocaleString()}+</div>
                                    <div className="text-gray-600 mt-1">Perusahaan</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-4xl font-bold text-blue-600">{stats.totalApplications.toLocaleString()}+</div>
                                    <div className="text-gray-600 mt-1">Lamaran</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-4xl font-bold text-green-600">{stats.totalHires.toLocaleString()}+</div>
                                    <div className="text-gray-600 mt-1">Kandidat Diterima</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Featured Jobs Section */}
            <section className="py-20 px-4 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-center mb-12">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">Lowongan Terbaru</h2>
                            <p className="text-gray-600">Peluang karir terbaik menunggu Anda</p>
                        </div>
                        <Link href="/jobs" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
                            Lihat Semua
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>

                    {loading ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1,2,3,4,5,6].map(i => (
                                <div key={i} className="bg-gray-100 rounded-2xl h-64 animate-pulse"></div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {featuredJobs.map(job => (
                                <Link
                                    key={job.id}
                                    href={`/jobs/${job.slug}`}
                                    className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
                                >
                                    <div className="flex items-start gap-4 mb-4">
                                        {job.companies.logo ? (
                                            <img src={job.companies.logo} alt={job.companies.name} className="w-14 h-14 rounded-xl object-cover" />
                                        ) : (
                                            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white text-xl font-bold">
                                                {job.companies.name.charAt(0)}
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <h3 className="font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition">
                                                {job.title}
                                            </h3>
                                            <p className="text-gray-600 text-sm">{job.companies.name}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                                            <MapPin className="w-4 h-4" />
                                            {job.location}
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                                            <Briefcase className="w-4 h-4" />
                                            {job.jobType}
                                        </div>
                                        {(job.salaryMin || job.salaryMax) && (
                                            <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                                                <DollarSign className="w-4 h-4" />
                                                Rp {formatSalary(job.salaryMin, job.salaryMax)}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                        <span className="text-gray-500 text-xs">{timeAgo(job.postedAt)}</span>
                                        <span className="text-blue-600 text-sm font-medium group-hover:underline">
                                            Lihat Detail →
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Job Categories */}
            <section className="py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Jelajahi Berdasarkan Kategori</h2>
                        <p className="text-gray-600">Temukan pekerjaan sesuai bidang Anda</p>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[1,2,3,4,5,6,7,8].map(i => (
                                <div key={i} className="bg-gray-100 rounded-xl h-32 animate-pulse"></div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {categories.map(category => (
                                <Link
                                    key={category.name}
                                    href={`/jobs?category=${encodeURIComponent(category.name)}`}
                                    className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 text-center group"
                                >
                                    <div className="text-4xl mb-3">{category.icon}</div>
                                    <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition">
                                        {category.name}
                                    </h3>
                                    <p className="text-gray-500 text-sm">{category.count} lowongan</p>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Top Companies */}
            <section className="py-20 px-4 bg-gray-50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Perusahaan Terpercaya</h2>
                        <p className="text-gray-600">Bergabunglah dengan perusahaan-perusahaan terbaik</p>
                    </div>

                    {loading ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[1,2,3,4,5,6,7,8].map(i => (
                                <div key={i} className="bg-white rounded-xl h-48 animate-pulse"></div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {topCompanies.map(company => (
                                <Link
                                    key={company.id}
                                    href={`/companies/${company.id}`}
                                    className="bg-white rounded-xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 group"
                                >
                                    <div className="text-center">
                                        {company.logo ? (
                                            <img src={company.logo} alt={company.name} className="w-20 h-20 mx-auto mb-4 rounded-xl object-cover" />
                                        ) : (
                                            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
                                                {company.name.charAt(0)}
                                            </div>
                                        )}
                                        <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition line-clamp-1">
                                            {company.name}
                                        </h3>
                                        <p className="text-gray-600 text-sm mb-3 line-clamp-1">{company.city}</p>
                                        <div className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium">
                                            <Briefcase className="w-4 h-4" />
                                            {company.activeJobsCount} lowongan
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-indigo-700">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12">
                        {/* For Job Seekers */}
                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-white">
                            <Users className="w-12 h-12 mb-4" />
                            <h3 className="text-2xl font-bold mb-3">Untuk Pencari Kerja</h3>
                            <p className="text-white/90 mb-6">
                                Daftar sekarang dan temukan ribuan peluang karir dari perusahaan-perusahaan terbaik di Indonesia.
                            </p>
                            <ul className="space-y-3 mb-6">
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                    <span>Akses ke ribuan lowongan kerja</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                    <span>Buat profil profesional</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                    <span>Lamar dengan satu klik</span>
                                </li>
                            </ul>
                            <Link href="/register/jobseeker" className="inline-block px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-50 transition font-medium">
                                Daftar Sebagai Pencari Kerja
                            </Link>
                        </div>

                        {/* For Recruiters */}
                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-white">
                            <Building2 className="w-12 h-12 mb-4" />
                            <h3 className="text-2xl font-bold mb-3">Untuk Perusahaan</h3>
                            <p className="text-white/90 mb-6">
                                Post lowongan kerja dan temukan kandidat terbaik dengan mudah dan cepat.
                            </p>
                            <ul className="space-y-3 mb-6">
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                    <span>Posting lowongan unlimited</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                    <span>Kelola kandidat dengan mudah</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                    <span>Dashboard analytics lengkap</span>
                                </li>
                            </ul>
                            <Link href="/register/recruiter" className="inline-block px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-50 transition font-medium">
                                Daftar Sebagai Recruiter
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12 px-4">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <Briefcase className="w-6 h-6" />
                        <span className="text-xl font-bold">JobSeeker</span>
                    </div>
                    <p className="text-gray-400 mb-6">Platform pencarian kerja terpercaya di Indonesia</p>
                    <div className="flex justify-center gap-8 text-gray-400 text-sm">
                        <Link href="/about" className="hover:text-white transition">Tentang Kami</Link>
                        <Link href="/companies" className="hover:text-white transition">Perusahaan</Link>
                        <Link href="/jobs" className="hover:text-white transition">Lowongan</Link>
                        <Link href="/contact" className="hover:text-white transition">Kontak</Link>
                    </div>
                    <div className="mt-8 pt-8 border-t border-gray-800 text-gray-500 text-sm">
                        © 2025 JobSeeker. All rights reserved.
                    </div>
                </div>
            </footer>

            <style jsx>{`
                @keyframes blob {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    25% { transform: translate(20px, -50px) scale(1.1); }
                    50% { transform: translate(-20px, 20px) scale(0.9); }
                    75% { transform: translate(50px, 50px) scale(1.05); }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
            `}</style>
        </div>
    )
}