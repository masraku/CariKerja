'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
    ArrowLeft,
    Users,
    Search,
    Filter,
    FileText,
    CheckCircle,
    XCircle,
    Clock,
    Calendar,
    Eye,
    MapPin,
    Briefcase,
    Mail,
    Phone,
    Award,
    GraduationCap,
    Star,
    Building2
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

            if (response.ok) {
                const data = await response.json()
                setApplications(data.applications)
                setStats(data.stats)
                setJobs(data.jobs)
            } else {
                throw new Error('Failed to load applications')
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

        // Filter by job
        if (jobFilter !== 'all') {
            filtered = filtered.filter(app => app.job.id === jobFilter)
        }

        // Filter by status
        if (statusFilter !== 'all') {
            filtered = filtered.filter(app => app.status === statusFilter)
        }

        // Search by name or email
        if (searchQuery) {
            filtered = filtered.filter(app => {
                const fullName = `${app.jobseeker.firstName} ${app.jobseeker.lastName}`.toLowerCase()
                const email = app.jobseeker.email?.toLowerCase() || ''
                const jobTitle = app.job.title.toLowerCase()
                const query = searchQuery.toLowerCase()
                return fullName.includes(query) || email.includes(query) || jobTitle.includes(query)
            })
        }

        setFilteredApplications(filtered)
    }

    const getStatusBadge = (status) => {
        const statusConfig = {
            PENDING: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
            REVIEWING: { label: 'Reviewing', color: 'bg-blue-100 text-blue-700', icon: Eye },
            SHORTLISTED: { label: 'Shortlisted', color: 'bg-purple-100 text-purple-700', icon: Star },
            INTERVIEW_SCHEDULED: { label: 'Interview', color: 'bg-indigo-100 text-indigo-700', icon: Calendar },
            ACCEPTED: { label: 'Accepted', color: 'bg-green-100 text-green-700', icon: CheckCircle },
            REJECTED: { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: XCircle }
        }

        const config = statusConfig[status] || statusConfig.PENDING
        const Icon = config.icon

        return (
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
                <Icon className="w-3 h-3" />
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

    const handleQuickAction = async (applicationId, newStatus) => {
        const statusLabels = {
            REVIEWING: 'Review',
            SHORTLISTED: 'Shortlist',
            INTERVIEW_SCHEDULED: 'Schedule Interview',
            ACCEPTED: 'Accept',
            REJECTED: 'Reject'
        }

        // For accept/reject, ask for optional message
        let message = ''
        if (newStatus === 'ACCEPTED' || newStatus === 'REJECTED') {
            const result = await Swal.fire({
                title: `${statusLabels[newStatus]} Candidate?`,
                html: `
                    <p class="mb-4">Apakah Anda yakin ingin ${newStatus === 'ACCEPTED' ? 'menerima' : 'menolak'} kandidat ini?</p>
                    <textarea 
                        id="recruiter-message" 
                        class="swal2-input" 
                        placeholder="${newStatus === 'ACCEPTED' ? 'Pesan untuk kandidat (opsional)\nContoh: Selamat! Silakan hubungi HR kami di...' : 'Feedback untuk kandidat (opsional)\nContoh: Terima kasih atas partisipasi Anda...'}"
                        rows="4"
                        style="width: 90%; height: 100px; resize: vertical;"
                    ></textarea>
                `,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: `Ya, ${statusLabels[newStatus]}`,
                cancelButtonText: 'Batal',
                confirmButtonColor: newStatus === 'ACCEPTED' ? '#10b981' : '#ef4444',
                preConfirm: () => {
                    return document.getElementById('recruiter-message').value
                }
            })

            if (!result.isConfirmed) return
            message = result.value || ''
        } else {
            const result = await Swal.fire({
                title: `${statusLabels[newStatus]} Pelamar?`,
                text: `Ubah status menjadi ${statusLabels[newStatus]}?`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Ya, Ubah',
                cancelButtonText: 'Batal'
            })

            if (!result.isConfirmed) return
        }

        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`/api/profile/recruiter/applications/${applicationId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    status: newStatus,
                    recruiterNotes: message
                })
            })

            const data = await response.json()

            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil!',
                    text: data.message || 'Status berhasil diubah',
                    timer: 2000,
                    showConfirmButton: false
                })
                loadAllApplications()
            } else {
                throw new Error(data.error || 'Failed to update status')
            }
        } catch (error) {
            console.error('Update status error:', error)
            Swal.fire({
                icon: 'error',
                title: 'Gagal',
                text: error.message || 'Gagal mengubah status'
            })
        }
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
                                Kelola semua lamaran dari seluruh lowongan Anda
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                {stats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
                        <div className="bg-white rounded-lg shadow-sm p-4">
                            <p className="text-sm text-gray-600 mb-1">Total</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                        </div>
                        <div className="bg-yellow-50 rounded-lg shadow-sm p-4">
                            <p className="text-sm text-yellow-700 mb-1">Pending</p>
                            <p className="text-3xl font-bold text-yellow-900">{stats.pending}</p>
                        </div>
                        <div className="bg-blue-50 rounded-lg shadow-sm p-4">
                            <p className="text-sm text-blue-700 mb-1">Reviewing</p>
                            <p className="text-3xl font-bold text-blue-900">{stats.reviewing}</p>
                        </div>
                        <div className="bg-purple-50 rounded-lg shadow-sm p-4">
                            <p className="text-sm text-purple-700 mb-1">Shortlisted</p>
                            <p className="text-3xl font-bold text-purple-900">{stats.shortlisted}</p>
                        </div>
                        <div className="bg-indigo-50 rounded-lg shadow-sm p-4">
                            <p className="text-sm text-indigo-700 mb-1">Interview</p>
                            <p className="text-3xl font-bold text-indigo-900">{stats.interview}</p>
                        </div>
                        <div className="bg-green-50 rounded-lg shadow-sm p-4">
                            <p className="text-sm text-green-700 mb-1">Accepted</p>
                            <p className="text-3xl font-bold text-green-900">{stats.accepted}</p>
                        </div>
                        <div className="bg-red-50 rounded-lg shadow-sm p-4">
                            <p className="text-sm text-red-700 mb-1">Rejected</p>
                            <p className="text-3xl font-bold text-red-900">{stats.rejected}</p>
                        </div>
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
                            <option value="SHORTLISTED">Shortlisted</option>
                            <option value="INTERVIEW_SCHEDULED">Interview</option>
                            <option value="ACCEPTED">Accepted</option>
                            <option value="REJECTED">Rejected</option>
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
                    <div className="space-y-4">
                        {filteredApplications.map((application) => (
                            <div
                                key={application.id}
                                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition"
                            >
                                <div className="flex items-start gap-6">
                                    {/* Avatar */}
                                    <div className="flex-shrink-0">
                                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                                            {application.jobseeker.photo ? (
                                                <img
                                                    src={application.jobseeker.photo}
                                                    alt={application.jobseeker.firstName}
                                                    className="w-full h-full object-cover rounded-full"
                                                />
                                            ) : (
                                                application.jobseeker.firstName?.charAt(0) || 'U'
                                            )}
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900 mb-1">
                                                    {application.jobseeker.firstName} {application.jobseeker.lastName}
                                                </h3>
                                                <p className="text-gray-600 mb-2">
                                                    {application.jobseeker.currentTitle || 'Job Seeker'}
                                                </p>
                                                
                                                {/* Job Info */}
                                                <div className="flex items-center gap-2 mb-2 text-sm">
                                                    <Building2 className="w-4 h-4 text-gray-400" />
                                                    <span className="text-gray-700 font-medium">
                                                        Melamar: {application.job.title}
                                                    </span>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                                                    {application.jobseeker.email && (
                                                        <div className="flex items-center gap-1">
                                                            <Mail className="w-4 h-4" />
                                                            {application.jobseeker.email}
                                                        </div>
                                                    )}
                                                    {application.jobseeker.phone && (
                                                        <div className="flex items-center gap-1">
                                                            <Phone className="w-4 h-4" />
                                                            {application.jobseeker.phone}
                                                        </div>
                                                    )}
                                                    {application.jobseeker.city && (
                                                        <div className="flex items-center gap-1">
                                                            <MapPin className="w-4 h-4" />
                                                            {application.jobseeker.city}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {getStatusBadge(application.status)}
                                            </div>
                                        </div>

                                        {/* Quick Stats */}
                                        <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
                                            <div className="flex items-center gap-1 text-gray-600">
                                                <Calendar className="w-4 h-4" />
                                                Applied: {formatDate(application.appliedAt)}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <div className={`w-2 h-2 rounded-full ${application.profileCompleteness >= 80 ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                                                Profile {application.profileCompleteness}%
                                            </div>
                                            {application.hasCV && (
                                                <div className="flex items-center gap-1 text-green-600">
                                                    <FileText className="w-4 h-4" />
                                                    CV Uploaded
                                                </div>
                                            )}
                                            {application.skillsCount > 0 && (
                                                <div className="flex items-center gap-1 text-blue-600">
                                                    <Award className="w-4 h-4" />
                                                    {application.skillsCount} Skills
                                                </div>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-wrap items-center gap-3">
                                            <button
                                                onClick={() => router.push(`/profile/recruiter/dashboard/jobs/${application.job.slug}/applications/${application.id}`)}
                                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                                            >
                                                <Eye className="w-4 h-4" />
                                                Lihat Detail
                                            </button>

                                            {application.status === 'PENDING' && (
                                                <button
                                                    onClick={() => handleQuickAction(application.id, 'REVIEWING')}
                                                    className="flex items-center gap-2 px-4 py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition text-sm"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    Review
                                                </button>
                                            )}

                                            {['PENDING', 'REVIEWING'].includes(application.status) && (
                                                <button
                                                    onClick={() => handleQuickAction(application.id, 'SHORTLISTED')}
                                                    className="flex items-center gap-2 px-4 py-2 border border-purple-300 text-purple-700 rounded-lg hover:bg-purple-50 transition text-sm"
                                                >
                                                    <Star className="w-4 h-4" />
                                                    Shortlist
                                                </button>
                                            )}

                                            {/* View Interview Button */}
                                            {['INTERVIEW_SCHEDULED', 'INTERVIEW_COMPLETED'].includes(application.status) && application.interview && (
                                                <button
                                                    onClick={() => router.push(`/profile/recruiter/interviews/${application.interview.id}`)}
                                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm"
                                                >
                                                    <Calendar className="w-4 h-4" />
                                                    View Interview
                                                </button>
                                            )}

                                            {/* Accept/Reject - hide when interview scheduled */}
                                            {!['ACCEPTED', 'REJECTED', 'INTERVIEW_SCHEDULED'].includes(application.status) && (
                                                <>
                                                    <button
                                                        onClick={() => handleQuickAction(application.id, 'ACCEPTED')}
                                                        disabled={application.status !== 'INTERVIEW_COMPLETED'}
                                                        className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm transition ${
                                                            application.status === 'INTERVIEW_COMPLETED'
                                                                ? 'border-green-300 text-green-700 hover:bg-green-50'
                                                                : 'border-gray-300 text-gray-400 cursor-not-allowed'
                                                        }`}
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                        Accept
                                                    </button>

                                                    <button
                                                        onClick={() => handleQuickAction(application.id, 'REJECTED')}
                                                        className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition text-sm"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                        Reject
                                                    </button>
                                                </>
                                            )}
                                        </div>
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