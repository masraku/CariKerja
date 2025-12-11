'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
    ArrowLeft,
    Users,
    Search,
    Filter,
    Calendar,
    Eye,
    Mail,
    Phone,
    Briefcase,
    ExternalLink
} from 'lucide-react'
import Swal from 'sweetalert2'

export default function AllApplicationsPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [applications, setApplications] = useState([])
    const [stats, setStats] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [jobFilter, setJobFilter] = useState('all')
    const [jobs, setJobs] = useState([])
    const [filteredApplications, setFilteredApplications] = useState([])
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10

    useEffect(() => {
        loadAllApplications()
    }, [])

    useEffect(() => {
        filterApplications()
    }, [applications, searchQuery, statusFilter, jobFilter])

    const loadAllApplications = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem('token')

            const response = await fetch('/api/profile/recruiter/dashboard/applications', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            const data = await response.json()
            
            if (response.ok) {
                setApplications(data.applications || [])
                setStats(data.stats || null)
                setJobs(data.jobs || [])
            } else {
                throw new Error(data.error || 'Failed to load applications')
            }
        } catch (error) {
            console.error('Load applications error:', error)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to load applications'
            })
        } finally {
            setLoading(false)
        }
    }

    const filterApplications = () => {
        let filtered = applications

        if (jobFilter !== 'all') {
            filtered = filtered.filter(app => app.jobs.id === jobFilter)
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter(app => app.status === statusFilter)
        }

        if (searchQuery) {
            filtered = filtered.filter(app => {
                const fullName = `${app.jobseekers.firstName} ${app.jobseekers.lastName}`.toLowerCase()
                const email = app.jobseekers.email?.toLowerCase() || ''
                const jobTitle = app.jobs.title?.toLowerCase() || ''
                const query = searchQuery.toLowerCase()
                return fullName.includes(query) || email.includes(query) || jobTitle.includes(query)
            })
        }

        setFilteredApplications(filtered)
    }

    const getStatusBadge = (status) => {
        const statusConfig = {
            PENDING: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
            REVIEWING: { label: 'Reviewing', color: 'bg-blue-100 text-blue-700' },
            INTERVIEW_SCHEDULED: { label: 'Interview', color: 'bg-indigo-100 text-indigo-700' },
            INTERVIEW_COMPLETED: { label: 'Selesai Interview', color: 'bg-teal-100 text-teal-700' },
            ACCEPTED: { label: 'Diterima', color: 'bg-green-100 text-green-700' },
            REJECTED: { label: 'Ditolak', color: 'bg-red-100 text-red-700' }
        }
        const config = statusConfig[status] || statusConfig.PENDING
        return (
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
                {config.label}
            </span>
        )
    }

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        })
    }

    const totalPages = Math.max(1, Math.ceil(filteredApplications.length / itemsPerPage))

    useEffect(() => {
        setCurrentPage(1)
    }, [filteredApplications.length])

    const renderApplicationCard = (application) => {
        const skills = application.jobseekers.skills || []
        const displaySkills = skills.slice(0, 3)
        const remainingSkills = skills.length - 3

        return (
            <div
                key={application.id}
                className="group bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-xl hover:border-blue-100 transition-all duration-300"
            >
                {/* Header with Avatar and Status */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg font-semibold overflow-hidden">
                                {application.jobseekers.photo ? (
                                    <img
                                        src={application.jobseekers.photo}
                                        alt={application.jobseekers.firstName}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    application.jobseekers.firstName?.charAt(0) || 'U'
                                )}
                            </div>
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${application.profileCompleteness >= 80 ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                        </div>
                        <div>
                            <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                {application.jobseekers.firstName} {application.jobseekers.lastName}
                            </h3>
                            <p className="text-sm text-gray-500">{application.jobseekers.currentTitle || 'Job Seeker'}</p>
                        </div>
                    </div>
                    {getStatusBadge(application.status)}
                </div>

                {/* Job Applied For */}
                <div className="mb-3 px-3 py-2 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Melamar sebagai</p>
                    <p className="text-sm font-medium text-gray-900">{application.jobs.title}</p>
                </div>

                {/* Skills */}
                {skills.length > 0 && (
                    <div className="mb-4">
                        <div className="flex flex-wrap gap-1.5">
                            {displaySkills.map((skill, index) => (
                                <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">
                                    {skill}
                                </span>
                            ))}
                            {remainingSkills > 0 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-medium">
                                    +{remainingSkills} lainnya
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* Contact & Meta Info */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" />
                        <span className="truncate max-w-[150px]">{application.jobseekers.email}</span>
                    </div>
                    {application.jobseekers.phone && (
                        <div className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5" />
                            {application.jobseekers.phone}
                        </div>
                    )}
                    <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(application.appliedAt)}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                    <button
                        onClick={() => router.push(`/profile/recruiter/dashboard/jobs/${application.jobs.slug}/applications/${application.id}`)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition text-sm font-medium"
                    >
                        <Eye className="w-4 h-4" />
                        Lihat Profil
                    </button>
                    <button
                        onClick={() => router.push(`/profile/recruiter/dashboard/jobs/${application.jobs.slug}/applications`)}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition text-sm"
                        title="Kelola di halaman lowongan"
                    >
                        <ExternalLink className="w-4 h-4" />
                    </button>
                </div>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading applications...</p>
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
                                Semua Pelamar
                            </h1>
                            <p className="text-gray-600">
                                Lihat semua profil pelamar dari seluruh lowongan Anda
                            </p>
                        </div>
                    </div>
                </div>

                {/* Info Banner */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                    <div className="flex items-start gap-3">
                        <Briefcase className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm text-blue-800 font-medium">Halaman ini hanya untuk melihat profil pelamar</p>
                            <p className="text-sm text-blue-700 mt-1">
                                Untuk mengelola proses interview dan menerima kandidat, silakan buka halaman per-lowongan melalui tombol di setiap kartu.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                {stats && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
                        <button
                            onClick={() => setStatusFilter('all')}
                            className={`text-left rounded-xl p-4 transition-all ${
                                statusFilter === 'all'
                                    ? 'bg-gray-900 text-white ring-2 ring-gray-900 ring-offset-2'
                                    : 'bg-white hover:bg-gray-50 border border-gray-200'
                            }`}
                        >
                            <p className={`text-sm mb-1 ${statusFilter === 'all' ? 'text-gray-300' : 'text-gray-600'}`}>Total</p>
                            <p className={`text-3xl font-bold ${statusFilter === 'all' ? 'text-white' : 'text-gray-900'}`}>{stats.total}</p>
                        </button>
                        <button
                            onClick={() => setStatusFilter('PENDING')}
                            className={`text-left rounded-xl p-4 transition-all ${
                                statusFilter === 'PENDING'
                                    ? 'bg-yellow-500 text-white ring-2 ring-yellow-500 ring-offset-2'
                                    : 'bg-yellow-50 hover:bg-yellow-100 border border-yellow-200'
                            }`}
                        >
                            <p className={`text-sm mb-1 ${statusFilter === 'PENDING' ? 'text-yellow-100' : 'text-yellow-700'}`}>Pending</p>
                            <p className={`text-3xl font-bold ${statusFilter === 'PENDING' ? 'text-white' : 'text-yellow-900'}`}>{stats.pending}</p>
                        </button>
                        <button
                            onClick={() => setStatusFilter('REVIEWING')}
                            className={`text-left rounded-xl p-4 transition-all ${
                                statusFilter === 'REVIEWING'
                                    ? 'bg-blue-500 text-white ring-2 ring-blue-500 ring-offset-2'
                                    : 'bg-blue-50 hover:bg-blue-100 border border-blue-200'
                            }`}
                        >
                            <p className={`text-sm mb-1 ${statusFilter === 'REVIEWING' ? 'text-blue-100' : 'text-blue-700'}`}>Reviewing</p>
                            <p className={`text-3xl font-bold ${statusFilter === 'REVIEWING' ? 'text-white' : 'text-blue-900'}`}>{stats.reviewing}</p>
                        </button>
                        <button
                            onClick={() => setStatusFilter('INTERVIEW_SCHEDULED')}
                            className={`text-left rounded-xl p-4 transition-all ${
                                statusFilter === 'INTERVIEW_SCHEDULED'
                                    ? 'bg-indigo-500 text-white ring-2 ring-indigo-500 ring-offset-2'
                                    : 'bg-indigo-50 hover:bg-indigo-100 border border-indigo-200'
                            }`}
                        >
                            <p className={`text-sm mb-1 ${statusFilter === 'INTERVIEW_SCHEDULED' ? 'text-indigo-100' : 'text-indigo-700'}`}>Interview</p>
                            <p className={`text-3xl font-bold ${statusFilter === 'INTERVIEW_SCHEDULED' ? 'text-white' : 'text-indigo-900'}`}>{stats.interview}</p>
                        </button>
                        <button
                            onClick={() => setStatusFilter('ACCEPTED')}
                            className={`text-left rounded-xl p-4 transition-all ${
                                statusFilter === 'ACCEPTED'
                                    ? 'bg-green-500 text-white ring-2 ring-green-500 ring-offset-2'
                                    : 'bg-green-50 hover:bg-green-100 border border-green-200'
                            }`}
                        >
                            <p className={`text-sm mb-1 ${statusFilter === 'ACCEPTED' ? 'text-green-100' : 'text-green-700'}`}>Accepted</p>
                            <p className={`text-3xl font-bold ${statusFilter === 'ACCEPTED' ? 'text-white' : 'text-green-900'}`}>{stats.accepted}</p>
                        </button>
                    </div>
                )}

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex flex-wrap gap-4 items-center">
                        <div className="flex items-center gap-2">
                            <Filter className="w-5 h-5 text-gray-600" />
                            <span className="font-semibold text-gray-900">Filter:</span>
                        </div>

                        <select
                            value={jobFilter}
                            onChange={(e) => setJobFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        >
                            <option value="all">Semua Lowongan</option>
                            {jobs.map(job => (
                                <option key={job.id} value={job.id}>
                                    {job.title}
                                </option>
                            ))}
                        </select>

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        >
                            <option value="all">Semua Status</option>
                            <option value="PENDING">Pending</option>
                            <option value="REVIEWING">Reviewing</option>
                            <option value="INTERVIEW_SCHEDULED">Interview</option>
                            <option value="ACCEPTED">Accepted</option>
                        </select>

                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cari nama, email, atau lowongan..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                            />
                        </div>

                        {(statusFilter !== 'all' || jobFilter !== 'all' || searchQuery) && (
                            <button
                                onClick={() => {
                                    setStatusFilter('all')
                                    setJobFilter('all')
                                    setSearchQuery('')
                                }}
                                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                                Reset Filter
                            </button>
                        )}
                    </div>
                </div>

                {/* Applications List */}
                {filteredApplications.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {searchQuery || statusFilter !== 'all' || jobFilter !== 'all'
                                ? 'Tidak ada pelamar ditemukan'
                                : 'Belum ada pelamar'}
                        </h3>
                        <p className="text-gray-600">
                            {searchQuery || statusFilter !== 'all' || jobFilter !== 'all'
                                ? 'Coba ubah filter atau kata kunci pencarian'
                                : 'Tunggu hingga ada kandidat yang melamar'}
                        </p>
                    </div>
                ) : (
                    (() => {
                        const start = (currentPage - 1) * itemsPerPage
                        const pageItems = filteredApplications.slice(start, start + itemsPerPage)
                        const half = Math.ceil(pageItems.length / 2)
                        const left = pageItems.slice(0, half)
                        const right = pageItems.slice(half)

                        return (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-4">
                                        {left.map((app) => renderApplicationCard(app))}
                                    </div>
                                    <div className="space-y-4">
                                        {right.map((app) => renderApplicationCard(app))}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-4">
                                    <div className="text-sm text-gray-600">
                                        Menampilkan {Math.min(filteredApplications.length, itemsPerPage)} dari {filteredApplications.length} pelamar
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                            className={`px-3 py-1 rounded-md border ${currentPage === 1 ? 'text-gray-400 border-gray-200' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                                        >
                                            Prev
                                        </button>
                                        <div className="px-3 py-1 bg-white border rounded-md text-sm">
                                            {currentPage} / {totalPages}
                                        </div>
                                        <button
                                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                            className={`px-3 py-1 rounded-md border ${currentPage === totalPages ? 'text-gray-400 border-gray-200' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            </>
                        )
                    })()
                )}
            </div>
        </div>
    )
}
