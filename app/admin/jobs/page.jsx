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
            
            console.log('Admin Jobs API response:', data)
            
            if (data.success) {
                setJobs(data.jobs || [])
                setStats(data.stats || null)
            } else {
                console.error('API returned error:', data.error)
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
            FULL_TIME: 'bg-blue-100 text-blue-800',
            PART_TIME: 'bg-purple-100 text-purple-800',
            CONTRACT: 'bg-orange-100 text-orange-800',
            INTERNSHIP: 'bg-green-100 text-green-800'
        }
        const labels = {
            FULL_TIME: 'Full Time',
            PART_TIME: 'Part Time',
            CONTRACT: 'Kontrak',
            INTERNSHIP: 'Magang'
        }
        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[type] || 'bg-gray-100 text-gray-800'}`}>
                {labels[type] || type}
            </span>
        )
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading jobs...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Manajemen Lowongan</h1>
                <p className="text-gray-600 mt-1">Kelola semua lowongan pekerjaan yang terdaftar</p>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Briefcase className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                                <p className="text-xs text-gray-500">Total Lowongan</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                                <p className="text-xs text-gray-500">Aktif</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-100 rounded-lg">
                                <XCircle className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{stats.inactive}</p>
                                <p className="text-xs text-gray-500">Nonaktif</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Users className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalApplications}</p>
                                <p className="text-xs text-gray-500">Total Lamaran</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <TrendingUp className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{stats.byType?.fullTime || 0}</p>
                                <p className="text-xs text-gray-500">Full Time</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <Clock className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{stats.byType?.internship || 0}</p>
                                <p className="text-xs text-gray-500">Magang</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari judul, perusahaan, atau kota..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                        />
                    </div>

                    {/* Status Filter */}
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    >
                        <option value="all">Semua Status</option>
                        <option value="active">Aktif</option>
                        <option value="inactive">Nonaktif</option>
                    </select>

                    {/* Job Type Filter */}
                    <select
                        value={jobTypeFilter}
                        onChange={(e) => setJobTypeFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    >
                        <option value="all">Semua Tipe</option>
                        <option value="FULL_TIME">Full Time</option>
                        <option value="PART_TIME">Part Time</option>
                        <option value="CONTRACT">Kontrak</option>
                        <option value="INTERNSHIP">Magang</option>
                    </select>
                </div>
            </div>

            {/* Jobs Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Lowongan
                                </th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Perusahaan
                                </th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Tipe
                                </th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Lokasi
                                </th>
                                <th className="text-center px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Lamaran
                                </th>
                                <th className="text-center px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Views
                                </th>
                                <th className="text-center px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Dibuat
                                </th>
                                <th className="text-center px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {jobs.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="px-6 py-12 text-center">
                                        <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500">Tidak ada lowongan ditemukan</p>
                                    </td>
                                </tr>
                            ) : (
                                jobs.map((job) => (
                                    <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium text-gray-900">{job.title}</p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {job.level} • {job.numberOfPositions} posisi
                                                </p>
                                                {job.showSalary && job.salaryMin && job.salaryMax && (
                                                    <p className="text-xs text-green-600 mt-1">
                                                        {formatCurrency(job.salaryMin)} - {formatCurrency(job.salaryMax)}
                                                    </p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {job.company.logo ? (
                                                    <img 
                                                        src={job.company.logo} 
                                                        alt={job.company.name}
                                                        className="w-8 h-8 rounded-lg object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                                                        <Building2 className="w-4 h-4 text-gray-400" />
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{job.company.name}</p>
                                                    {job.company.verified && (
                                                        <span className="text-xs text-blue-600 flex items-center gap-1">
                                                            <CheckCircle className="w-3 h-3" /> Verified
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getJobTypeBadge(job.jobType)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1 text-sm text-gray-600">
                                                <MapPin className="w-4 h-4 text-gray-400" />
                                                <span>{job.city}</span>
                                                {job.isRemote && (
                                                    <span className="ml-1 px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded">
                                                        Remote
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center gap-1 text-sm font-medium text-gray-900">
                                                <Users className="w-4 h-4 text-gray-400" />
                                                {job.applicationCount}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                                                <Eye className="w-4 h-4 text-gray-400" />
                                                {job.viewCount}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {job.isActive ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                                    <CheckCircle className="w-3 h-3" />
                                                    Aktif
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                                                    <XCircle className="w-3 h-3" />
                                                    Nonaktif
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1 text-sm text-gray-600">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                {formatDate(job.createdAt)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <Link 
                                                href={`/jobs/${job.slug}`}
                                                target="_blank"
                                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-100 transition-colors"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                                Lihat
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Summary */}
            <div className="mt-4 text-sm text-gray-500 text-center">
                Menampilkan {jobs.length} lowongan
            </div>
        </div>
    )
}
