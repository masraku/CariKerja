'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
    Briefcase,
    Users,
    Eye,
    Calendar,
    MapPin,
    Plus,
    Edit,
    Trash2,
    Search,
    Filter,
    TrendingUp,
    Clock,
    CheckCircle,
    XCircle,
    ToggleLeft,
    ToggleRight,
    ExternalLink,
    ArrowLeft
} from 'lucide-react'
import Swal from 'sweetalert2'

export default function RecruiterJobsPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [jobs, setJobs] = useState([])
    const [stats, setStats] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')

    useEffect(() => {
        loadJobs()
    }, [statusFilter])

    useEffect(() => {
        // Debounce search
        const timer = setTimeout(() => {
            if (searchQuery !== null) {
                loadJobs()
            }
        }, 500)

        return () => clearTimeout(timer)
    }, [searchQuery])

    const loadJobs = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem('token')

            const params = new URLSearchParams()
            if (statusFilter !== 'all') params.append('status', statusFilter)
            if (searchQuery) params.append('search', searchQuery)

            const response = await fetch(`/api/profile/recruiter/jobs?${params.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok) {
                const data = await response.json()
                setJobs(data.jobs)
                setStats(data.stats)
            } else {
                throw new Error('Failed to load jobs')
            }
        } catch (error) {
            console.error('Load jobs error:', error)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to load jobs'
            })
        } finally {
            setLoading(false)
        }
    }

    const handleToggleStatus = async (slug, currentStatus) => {
        const result = await Swal.fire({
            title: currentStatus ? 'Nonaktifkan Lowongan?' : 'Aktifkan Lowongan?',
            text: currentStatus
                ? 'Lowongan akan disembunyikan dari pencarian'
                : 'Lowongan akan muncul kembali di pencarian',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: currentStatus ? '#ef4444' : '#3b82f6',
            cancelButtonColor: '#6b7280',
            confirmButtonText: currentStatus ? 'Ya, Nonaktifkan' : 'Ya, Aktifkan',
            cancelButtonText: 'Batal'
        })

        if (!result.isConfirmed) return

        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`/api/profile/recruiter/jobs/${slug}/toggle-status`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil!',
                    text: `Lowongan berhasil ${currentStatus ? 'dinonaktifkan' : 'diaktifkan'}`,
                    timer: 2000,
                    showConfirmButton: false
                })
                loadJobs()
            } else {
                throw new Error('Failed to toggle status')
            }
        } catch (error) {
            console.error('Toggle status error:', error)
            Swal.fire({
                icon: 'error',
                title: 'Gagal',
                text: 'Gagal mengubah status lowongan'
            })
        }
    }

    const handleDeleteJob = async (slug, title) => {
        const result = await Swal.fire({
            title: 'Hapus Lowongan?',
            html: `
        <p>Anda yakin ingin menghapus lowongan:</p>
        <p class="font-bold mt-2">${title}</p>
        <p class="text-sm text-gray-600 mt-2">Semua data lamaran akan ikut terhapus dan tidak dapat dikembalikan!</p>
      `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Ya, Hapus',
            cancelButtonText: 'Batal'
        })

        if (!result.isConfirmed) return

        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`/api/profile/recruiter/jobs/${slug}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'Terhapus!',
                    text: 'Lowongan berhasil dihapus',
                    timer: 2000,
                    showConfirmButton: false
                })
                loadJobs()
            } else {
                throw new Error('Failed to delete job')
            }
        } catch (error) {
            console.error('Delete job error:', error)
            Swal.fire({
                icon: 'error',
                title: 'Gagal',
                text: 'Gagal menghapus lowongan'
            })
        }
    }

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        })
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading jobs...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => router.push('/profile/recruiter/dashboard')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Kembali ke Dashboard
                    </button>

                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                Kelola Lowongan
                            </h1>
                            <p className="text-gray-600">
                                Manage semua lowongan pekerjaan yang Anda posting
                            </p>
                        </div>

                        <button
                            onClick={() => router.push('/profile/recruiter/post-job')}
                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-lg"
                        >
                            <Plus className="w-5 h-5" />
                            Lowongan Baru
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                {stats && (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                        <div className="bg-white rounded-lg shadow-sm p-4">
                            <p className="text-sm text-gray-600 mb-1">Total Lowongan</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                        </div>
                        <div className="bg-green-50 rounded-lg shadow-sm p-4">
                            <p className="text-sm text-green-700 mb-1">Aktif</p>
                            <p className="text-3xl font-bold text-green-900">{stats.active}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg shadow-sm p-4">
                            <p className="text-sm text-gray-700 mb-1">Nonaktif</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.inactive}</p>
                        </div>
                        <div className="bg-blue-50 rounded-lg shadow-sm p-4">
                            <p className="text-sm text-blue-700 mb-1">Total Pelamar</p>
                            <p className="text-3xl font-bold text-blue-900">{stats.totalApplications}</p>
                        </div>
                        <div className="bg-purple-50 rounded-lg shadow-sm p-4">
                            <p className="text-sm text-purple-700 mb-1">Total Views</p>
                            <p className="text-3xl font-bold text-purple-900">{stats.totalViews}</p>
                        </div>
                    </div>
                )}

                {/* Filters & Search */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex flex-wrap gap-4 items-center">
                        <div className="flex items-center gap-2">
                            <Filter className="w-5 h-5 text-gray-600" />
                            <span className="font-semibold text-gray-900">Filter:</span>
                        </div>

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        >
                            <option value="all">Semua Status</option>
                            <option value="active">Aktif</option>
                            <option value="inactive">Nonaktif</option>
                        </select>

                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cari judul atau lokasi..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                            />
                        </div>

                        {(statusFilter !== 'all' || searchQuery) && (
                            <button
                                onClick={() => {
                                    setStatusFilter('all')
                                    setSearchQuery('')
                                }}
                                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                                Reset Filter
                            </button>
                        )}
                    </div>
                </div>

                {/* Jobs List */}
                {jobs.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {searchQuery || statusFilter !== 'all'
                                ? 'Tidak ada lowongan ditemukan'
                                : 'Belum ada lowongan'}
                        </h3>
                        <p className="text-gray-600 mb-6">
                            {searchQuery || statusFilter !== 'all'
                                ? 'Coba ubah filter atau kata kunci pencarian'
                                : 'Mulai posting lowongan pertama Anda'}
                        </p>
                        {!searchQuery && statusFilter === 'all' && (
                            <button
                                onClick={() => router.push('/profile/recruiter/post-job')}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                            >
                                <Plus className="w-5 h-5" />
                                Pasang Lowongan
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {jobs.map((job) => (
                            <div
                                key={job.id}
                                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-xl font-bold text-gray-900">
                                                {job.title}
                                            </h3>
                                            {job.isActive ? (
                                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                                                    Inactive
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                                            <div className="flex items-center gap-1">
                                                <MapPin className="w-4 h-4" />
                                                {job.location}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Briefcase className="w-4 h-4" />
                                                {job.jobType}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <TrendingUp className="w-4 h-4" />
                                                {job.level}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                Posted {formatDate(job.createdAt)}
                                            </div>
                                        </div>

                                        {/* Stats */}
                                        <div className="flex flex-wrap items-center gap-6">
                                            <div className="flex items-center gap-2">
                                                <Users className="w-5 h-5 text-blue-600" />
                                                <div>
                                                    <span className="text-2xl font-bold text-gray-900">
                                                        {job.stats.total}
                                                    </span>
                                                    <span className="text-sm text-gray-600 ml-1">pelamar</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Eye className="w-5 h-5 text-purple-600" />
                                                <div>
                                                    <span className="text-2xl font-bold text-gray-900">
                                                        {job.viewCount || 0}
                                                    </span>
                                                    <span className="text-sm text-gray-600 ml-1">views</span>
                                                </div>
                                            </div>

                                            {job.stats.pending > 0 && (
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-5 h-5 text-yellow-600" />
                                                    <div>
                                                        <span className="text-2xl font-bold text-gray-900">
                                                            {job.stats.pending}
                                                        </span>
                                                        <span className="text-sm text-gray-600 ml-1">pending</span>
                                                    </div>
                                                </div>
                                            )}

                                            {job.stats.shortlisted > 0 && (
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                                    <div>
                                                        <span className="text-2xl font-bold text-gray-900">
                                                            {job.stats.shortlisted}
                                                        </span>
                                                        <span className="text-sm text-gray-600 ml-1">shortlisted</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                                    <button
                                        onClick={() => router.push(`/profile/recruiter/dashboard/jobs/${job.slug}/applications`)}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                                    >
                                        <Users className="w-4 h-4" />
                                        Lihat Pelamar
                                    </button>

                                    <button
                                        onClick={() => router.push(`/profile/recruiter/dashboard/jobs/${job.slug}`)}
                                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        Preview
                                    </button>

                                    <button
                                        onClick={() => router.push(`/profile/recruiter/dashboard/jobs/${job.slug}/edit`)}
                                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm"
                                    >
                                        <Edit className="w-4 h-4" />
                                        Edit
                                    </button>

                                    <button
                                        onClick={() => handleToggleStatus(job.slug, job.isActive)}
                                        className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition text-sm ${job.isActive
                                                ? 'border-red-300 text-red-700 hover:bg-red-50'
                                                : 'border-green-300 text-green-700 hover:bg-green-50'
                                            }`}
                                    >
                                        {job.isActive ? (
                                            <>
                                                <ToggleLeft className="w-4 h-4" />
                                                Nonaktifkan
                                            </>
                                        ) : (
                                            <>
                                                <ToggleRight className="w-4 h-4" />
                                                Aktifkan
                                            </>
                                        )}
                                    </button>

                                    <button
                                        onClick={() => handleDeleteJob(job.slug, job.title)}
                                        className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition text-sm ml-auto"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Hapus
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}