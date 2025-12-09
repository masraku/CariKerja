'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
    Briefcase, Search, Building2, MapPin, Clock, Eye, Users,
    CheckCircle, XCircle, ExternalLink, Calendar, TrendingUp
} from 'lucide-react'

export default function AdminJobsPage() {
    const [jobs, setJobs] = useState([])
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [jobTypeFilter, setJobTypeFilter] = useState('all')

    useEffect(() => {
        fetchJobs()
    }, [search, statusFilter, jobTypeFilter])

    const fetchJobs = async () => {
        setLoading(true)
        try {
            const token = localStorage.getItem('token')
            const params = new URLSearchParams()
            if (search) params.append('search', search)
            if (statusFilter !== 'all') params.append('status', statusFilter)
            if (jobTypeFilter !== 'all') params.append('jobType', jobTypeFilter)

            const response = await fetch(`/api/admin/jobs?${params.toString()}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await response.json()
            
            if (data.success) {
                setJobs(data.jobs || [])
                setStats(data.stats || null)
            } else {
                setJobs([])
                setStats(null)
            }
        } catch (error) {
            console.error('Error fetching jobs:', error)
            setJobs([])
            setStats(null)
        } finally {
            setLoading(false)
        }
    }

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount)
    }

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        })
    }

    const getJobTypeBadge = (type) => {
        const styles = {
            FULL_TIME: 'bg-blue-100 text-blue-700',
            PART_TIME: 'bg-purple-100 text-purple-700',
            CONTRACT: 'bg-orange-100 text-orange-700',
            INTERNSHIP: 'bg-emerald-100 text-emerald-700'
        }
        const labels = {
            FULL_TIME: 'Full Time',
            PART_TIME: 'Part Time',
            CONTRACT: 'Kontrak',
            INTERNSHIP: 'Magang'
        }
        return (
            <span className={`px-3 py-1 text-xs font-medium rounded-full ${styles[type] || 'bg-slate-100 text-slate-700'}`}>
                {labels[type] || type}
            </span>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            {/* Header - Always visible */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 lg:px-8 py-8">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">Manajemen Lowongan</h1>
                    <p className="text-slate-300 text-sm">Kelola semua lowongan pekerjaan yang terdaftar</p>
                    
                    {/* Quick Stats in Header */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                            <div className="text-3xl font-bold text-white">{stats?.total || 0}</div>
                            <div className="text-slate-300 text-xs mt-1">Total Lowongan</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                            <div className="text-3xl font-bold text-emerald-400">{stats?.active || 0}</div>
                            <div className="text-slate-300 text-xs mt-1">Aktif</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                            <div className="text-3xl font-bold text-amber-400">{stats?.totalApplications || 0}</div>
                            <div className="text-slate-300 text-xs mt-1">Total Lamaran</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                            <div className="text-3xl font-bold text-blue-400">{stats?.byType?.fullTime || 0}</div>
                            <div className="text-slate-300 text-xs mt-1">Full Time</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
                {/* Filters */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 mb-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Cari lowongan, perusahaan, atau lokasi..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-800 placeholder-slate-400"
                            />
                        </div>

                        {/* Status Filter */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setStatusFilter('all')}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                                    statusFilter === 'all' 
                                        ? 'bg-slate-800 text-white' 
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                Semua
                            </button>
                            <button
                                onClick={() => setStatusFilter('active')}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                                    statusFilter === 'active' 
                                        ? 'bg-emerald-500 text-white' 
                                        : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                }`}
                            >
                                Aktif
                            </button>
                            <button
                                onClick={() => setStatusFilter('inactive')}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                                    statusFilter === 'inactive' 
                                        ? 'bg-red-500 text-white' 
                                        : 'bg-red-50 text-red-600 hover:bg-red-100'
                                }`}
                            >
                                Nonaktif
                            </button>
                        </div>

                        {/* Job Type Filter */}
                        <select
                            value={jobTypeFilter}
                            onChange={(e) => setJobTypeFilter(e.target.value)}
                            className="px-4 py-3 bg-slate-50 border-0 rounded-xl text-slate-700 focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">Semua Tipe</option>
                            <option value="FULL_TIME">Full Time</option>
                            <option value="PART_TIME">Part Time</option>
                            <option value="CONTRACT">Kontrak</option>
                            <option value="INTERNSHIP">Magang</option>
                        </select>
                    </div>
                </div>

                {/* Results Count */}
                <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-slate-500">
                        Menampilkan <span className="font-semibold text-slate-700">{loading ? '...' : jobs.length}</span> lowongan
                    </p>
                </div>

                {/* Loading State - Skeleton cards */}
                {loading ? (
                    <div className="grid gap-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 animate-pulse">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-xl bg-slate-200"></div>
                                    <div className="flex-1">
                                        <div className="h-4 bg-slate-200 rounded w-1/3 mb-2"></div>
                                        <div className="h-3 bg-slate-200 rounded w-1/4 mb-2"></div>
                                        <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                                    </div>
                                    <div className="hidden md:flex gap-4">
                                        <div className="h-6 w-20 bg-slate-200 rounded-full"></div>
                                        <div className="h-6 w-16 bg-slate-200 rounded-full"></div>
                                    </div>
                                    <div className="h-10 w-24 bg-slate-200 rounded-xl"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : jobs.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
                        <Briefcase className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-800 mb-2">Tidak ada lowongan</h3>
                        <p className="text-slate-500">Coba ubah filter atau kata kunci pencarian</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {jobs.map((job) => (
                            <div 
                                key={job.id} 
                                className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition group"
                            >
                                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                                    {/* Company Logo & Job Info */}
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                                            {job.company?.logo ? (
                                                <img 
                                                    src={job.company.logo} 
                                                    alt={job.company.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <Building2 className="w-7 h-7 text-slate-400" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-slate-800 group-hover:text-blue-600 transition truncate">
                                                {job.title}
                                            </h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-sm text-slate-600">{job.company?.name}</span>
                                                {job.company?.verified && (
                                                    <CheckCircle className="w-4 h-4 text-blue-500" />
                                                )}
                                            </div>
                                            <div className="flex flex-wrap items-center gap-3 mt-2">
                                                <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                                                    <MapPin className="w-3.5 h-3.5" />
                                                    {job.city}
                                                    {job.isRemote && (
                                                        <span className="ml-1 px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded text-xs">Remote</span>
                                                    )}
                                                </span>
                                                <span className="text-xs text-slate-400">•</span>
                                                <span className="text-xs text-slate-500">{job.level}</span>
                                                <span className="text-xs text-slate-400">•</span>
                                                <span className="text-xs text-slate-500">{job.numberOfPositions} posisi</span>
                                            </div>
                                            {job.showSalary && job.salaryMin && job.salaryMax && (
                                                <p className="text-sm text-emerald-600 font-medium mt-2">
                                                    {formatCurrency(job.salaryMin)} - {formatCurrency(job.salaryMax)}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Stats & Actions */}
                                    <div className="flex items-center gap-6 lg:gap-8">
                                        {/* Job Type Badge */}
                                        <div className="hidden md:block">
                                            {getJobTypeBadge(job.jobType)}
                                        </div>
                                        
                                        {/* Metrics */}
                                        <div className="flex items-center gap-6">
                                            <div className="text-center">
                                                <div className="flex items-center gap-1 text-slate-800 font-semibold">
                                                    <Users className="w-4 h-4 text-purple-500" />
                                                    {job.applicationCount}
                                                </div>
                                                <div className="text-xs text-slate-400">Lamaran</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="flex items-center gap-1 text-slate-800 font-semibold">
                                                    <Eye className="w-4 h-4 text-blue-500" />
                                                    {job.viewCount}
                                                </div>
                                                <div className="text-xs text-slate-400">Views</div>
                                            </div>
                                        </div>

                                        {/* Status */}
                                        <div>
                                            {job.isActive ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                                    Aktif
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                                                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                                                    Nonaktif
                                                </span>
                                            )}
                                        </div>

                                        {/* Date */}
                                        <div className="hidden lg:block text-right">
                                            <div className="text-sm text-slate-600">{formatDate(job.createdAt)}</div>
                                            <div className="text-xs text-slate-400">Dibuat</div>
                                        </div>

                                        {/* Action */}
                                        <Link 
                                            href={`/jobs/${job.slug}`}
                                            target="_blank"
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-xl hover:bg-slate-700 transition"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                            Lihat
                                        </Link>
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
