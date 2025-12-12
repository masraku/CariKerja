'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import {
    ArrowLeft,
    Users,
    Search,
    Filter,
    CheckCircle,
    XCircle,
    Clock,
    Calendar,
    Eye,
    MapPin,
    Briefcase,
    Mail,
    Phone,
    Video,
    CheckSquare,
    Square,
    UserPlus,
    Trash2,
    ExternalLink,
    FileText,
    X
} from 'lucide-react'
import Swal from 'sweetalert2'

export default function JobDetailPage() {
    const router = useRouter()
    const params = useParams()
    const [loading, setLoading] = useState(true)
    const [applications, setApplications] = useState([])
    const [job, setJob] = useState(null)
    const [stats, setStats] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [filteredApplications, setFilteredApplications] = useState([])
    const [currentPage, setCurrentPage] = useState(1)
    const [selectedApplications, setSelectedApplications] = useState([])
    const [selectMode, setSelectMode] = useState(false)
    const [documentModal, setDocumentModal] = useState({ isOpen: false, url: '', title: '' })
    const itemsPerPage = 10

    useEffect(() => {
        loadApplications()
    }, [])

    useEffect(() => {
        filterApplications()
    }, [applications, searchQuery, statusFilter])

    useEffect(() => {
        setCurrentPage(1)
    }, [filteredApplications.length])

    const loadApplications = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem('token')

            const response = await fetch(`/api/profile/recruiter/jobs/${params.slug}/applications`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok) {
                const data = await response.json()
                setApplications(data.applications || [])
                setJob(data.job)
                setStats(data.stats)
            } else {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to load applications')
            }
        } catch (error) {
            console.error('Load applications error:', error)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Failed to load applications'
            })
        } finally {
            setLoading(false)
        }
    }

    const filterApplications = () => {
        let filtered = applications

        if (statusFilter !== 'all') {
            filtered = filtered.filter(app => app.status === statusFilter)
        }

        if (searchQuery) {
            filtered = filtered.filter(app => {
                const fullName = `${app.jobseekers?.firstName || ''} ${app.jobseekers?.lastName || ''}`.toLowerCase()
                const email = app.jobseekers?.email?.toLowerCase() || ''
                const query = searchQuery.toLowerCase()
                return fullName.includes(query) || email.includes(query)
            })
        }

        setFilteredApplications(filtered)
    }

    const getStatusBadge = (status) => {
        const statusConfig = {
            PENDING: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
            REVIEWING: { label: 'Reviewing', color: 'bg-blue-100 text-blue-700', icon: Eye },
            INTERVIEW_SCHEDULED: { label: 'Interview', color: 'bg-indigo-100 text-indigo-700', icon: Calendar },
            INTERVIEW_COMPLETED: { label: 'Selesai Interview', color: 'bg-teal-100 text-teal-700', icon: CheckCircle },
            ACCEPTED: { label: 'Diterima', color: 'bg-green-100 text-green-700', icon: CheckCircle },
            REJECTED: { label: 'Ditolak', color: 'bg-red-100 text-red-700', icon: XCircle }
        }
        const config = statusConfig[status] || statusConfig.PENDING
        const Icon = config.icon
        return (
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
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

    // Toggle select mode
    const toggleSelectMode = () => {
        setSelectMode(!selectMode)
        setSelectedApplications([])
    }

    // Handle checkbox toggle
    const handleSelectApplication = (applicationId) => {
        setSelectedApplications(prev => {
            if (prev.includes(applicationId)) {
                return prev.filter(id => id !== applicationId)
            } else {
                return [...prev, applicationId]
            }
        })
    }

    // Handle invite multiple to interview
    const handleInviteMultipleInterview = () => {
        if (!job?.id) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Data lowongan belum dimuat. Silakan refresh halaman.'
            })
            return
        }

        const selectedApps = filteredApplications.filter(app => selectedApplications.includes(app.id))
        const invalidApps = selectedApps.filter(app => app.status !== 'REVIEWING')
        if (invalidApps.length > 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Status Tidak Valid',
                text: 'Hanya kandidat dengan status "Reviewing" yang bisa diundang interview.',
                confirmButtonColor: '#3b82f6'
            })
            return
        }

        router.push(`/profile/recruiter/dashboard/interview?job=${job.id}&applicants=${selectedApplications.join(',')}`)
    }

    // Handle view application
    const handleViewApplication = async (application) => {
        if (application.status === 'PENDING') {
            try {
                const token = localStorage.getItem('token')
                await fetch(`/api/profile/recruiter/applications/${application.id}`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ status: 'REVIEWING' })
                })
            } catch (error) {
                console.error('Error updating status:', error)
            }
        }
        router.push(`/profile/recruiter/dashboard/jobs/${params.slug}/applications/${application.id}`)
    }

    // Handle invite single to interview
    const handleInviteInterview = (application) => {
        if (!job?.id) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Data lowongan belum dimuat. Silakan refresh halaman.'
            })
            return
        }
        router.push(`/profile/recruiter/dashboard/interview?job=${job.id}&applicants=${application.id}`)
    }

    // Handle accept candidate
    const handleAcceptCandidate = async (application) => {
        if (application.status !== 'INTERVIEW_COMPLETED') {
            Swal.fire({
                icon: 'warning',
                title: 'Belum Bisa Diterima',
                text: 'Kandidat hanya bisa diterima setelah interview selesai.',
                confirmButtonColor: '#3b82f6'
            })
            return
        }

        const result = await Swal.fire({
            title: 'Terima Kandidat?',
            html: `
                <p class="mb-4">Apakah Anda yakin ingin menerima <strong>${application.jobseekers?.firstName} ${application.jobseekers?.lastName}</strong>?</p>
                <textarea 
                    id="accept-message" 
                    class="swal2-input" 
                    placeholder="Pesan untuk kandidat (opsional)"
                    rows="4"
                    style="width: 90%; height: 100px; resize: vertical;"
                ></textarea>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Ya, Terima',
            cancelButtonText: 'Batal',
            confirmButtonColor: '#10b981',
            preConfirm: () => {
                return document.getElementById('accept-message').value
            }
        })

        if (!result.isConfirmed) return

        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`/api/profile/recruiter/applications/${application.id}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    status: 'ACCEPTED',
                    recruiterNotes: result.value || ''
                })
            })

            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'Kandidat Diterima!',
                    text: 'Email notifikasi telah dikirim ke kandidat.',
                    timer: 2000,
                    showConfirmButton: false
                })
                loadApplications()
            }
        } catch (error) {
            console.error('Accept error:', error)
            Swal.fire({
                icon: 'error',
                title: 'Gagal',
                text: 'Gagal menerima kandidat'
            })
        }
    }

    // Handle delete application
    const handleDeleteApplication = async (applicationId, applicantName) => {
        const result = await Swal.fire({
            title: 'Hapus Lamaran?',
            html: `<p>Apakah Anda yakin ingin menghapus lamaran dari <strong>${applicantName}</strong>?</p>`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ya, Hapus',
            cancelButtonText: 'Batal',
            confirmButtonColor: '#ef4444'
        })

        if (!result.isConfirmed) return

        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`/api/profile/recruiter/applications/${applicationId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'Lamaran Dihapus',
                    timer: 1500,
                    showConfirmButton: false
                })
                loadApplications()
            }
        } catch (error) {
            console.error('Delete error:', error)
            Swal.fire({
                icon: 'error',
                title: 'Gagal',
                text: 'Gagal menghapus lamaran'
            })
        }
    }

    const totalPages = Math.max(1, Math.ceil(filteredApplications.length / itemsPerPage))

    const renderApplicationCard = (application) => {
        const skills = application.jobseekers?.skills || []
        const displaySkills = skills.slice(0, 3)
        const remainingSkills = skills.length - 3
        const isSelected = selectedApplications.includes(application.id)
        const canSelect = selectMode && application.status === 'REVIEWING'

        return (
            <div
                key={application.id}
                onClick={() => canSelect && handleSelectApplication(application.id)}
                className={`group bg-white rounded-2xl border p-5 transition-all duration-300 ${
                    isSelected 
                        ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/30' 
                        : 'border-gray-100 hover:shadow-xl hover:border-blue-100'
                } ${canSelect ? 'cursor-pointer' : ''}`}
            >
                {/* Header with Avatar and Status */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                        {/* Checkbox for select mode */}
                        {selectMode && (
                            <div 
                                className={`flex-shrink-0 ${application.status !== 'REVIEWING' ? 'opacity-30' : ''}`}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    if (application.status === 'REVIEWING') {
                                        handleSelectApplication(application.id)
                                    }
                                }}
                            >
                                {isSelected ? (
                                    <CheckSquare className="w-6 h-6 text-indigo-600" />
                                ) : (
                                    <Square className={`w-6 h-6 ${application.status === 'REVIEWING' ? 'text-gray-400 hover:text-indigo-500' : 'text-gray-300'}`} />
                                )}
                            </div>
                        )}
                        <div className="relative">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg font-semibold overflow-hidden">
                                {application.jobseekers?.photo ? (
                                    <img
                                        src={application.jobseekers.photo}
                                        alt={application.jobseekers.firstName}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    application.jobseekers?.firstName?.charAt(0) || 'U'
                                )}
                            </div>
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${application.profileCompleteness >= 80 ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                        </div>
                        <div>
                            <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                {application.jobseekers?.firstName} {application.jobseekers?.lastName}
                            </h3>
                            <p className="text-sm text-gray-500">{application.jobseekers?.currentTitle || 'Job Seeker'}</p>
                        </div>
                    </div>
                    {getStatusBadge(application.status)}
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

                {/* Documents Section */}
                {(application.jobseekers?.cvUrl || application.jobseekers?.ktpUrl || application.jobseekers?.ak1Url) && (
                    <div className="mb-4">
                        <p className="text-xs font-semibold text-gray-600 mb-2">Berkas:</p>
                        <div className="flex flex-wrap gap-2">
                            {application.jobseekers?.cvUrl && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setDocumentModal({ isOpen: true, url: application.jobseekers.cvUrl, title: 'CV' })
                                    }}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-medium hover:bg-indigo-100 transition"
                                >
                                    <FileText className="w-3.5 h-3.5" />
                                    CV
                                </button>
                            )}
                            {application.jobseekers?.ktpUrl && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setDocumentModal({ isOpen: true, url: application.jobseekers.ktpUrl, title: 'KTP' })
                                    }}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-medium hover:bg-green-100 transition"
                                >
                                    <FileText className="w-3.5 h-3.5" />
                                    KTP
                                </button>
                            )}
                            {application.jobseekers?.ak1Url && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setDocumentModal({ isOpen: true, url: application.jobseekers.ak1Url, title: 'Kartu AK-1' })
                                    }}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-orange-50 text-orange-700 rounded-lg text-xs font-medium hover:bg-orange-100 transition"
                                >
                                    <FileText className="w-3.5 h-3.5" />
                                    AK-1
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Contact & Meta Info */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" />
                        <span className="truncate max-w-[150px]">{application.jobseekers?.email}</span>
                    </div>
                    {application.jobseekers?.phone && (
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

                {/* Action Buttons - Dynamic based on status */}
                <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                    {application.status === 'PENDING' ? (
                        <>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleViewApplication(application) }}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition text-sm font-medium"
                            >
                                <Eye className="w-4 h-4" />
                                Lihat
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleDeleteApplication(application.id, `${application.jobseekers?.firstName} ${application.jobseekers?.lastName}`) }}
                                className="flex items-center justify-center px-3 py-2 border border-gray-200 text-gray-500 rounded-xl hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </>
                    ) : application.status === 'REVIEWING' ? (
                        <>
                            <button
                                onClick={(e) => { e.stopPropagation(); router.push(`/profile/recruiter/dashboard/jobs/${params.slug}/applications/${application.id}`) }}
                                className="flex items-center justify-center gap-1.5 px-3 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition text-sm"
                            >
                                <Eye className="w-4 h-4" />
                                Detail
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleInviteInterview(application) }}
                                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition text-sm font-medium"
                            >
                                <Video className="w-4 h-4" />
                                Undang Interview
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleDeleteApplication(application.id, `${application.jobseekers?.firstName} ${application.jobseekers?.lastName}`) }}
                                className="flex items-center justify-center px-3 py-2 border border-gray-200 text-gray-500 rounded-xl hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </>
                    ) : application.status === 'INTERVIEW_SCHEDULED' ? (
                        <>
                            {application.interview?.meetingUrl && (
                                <a
                                    href={application.interview.meetingUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition text-sm font-medium shadow-lg"
                                >
                                    <Video className="w-4 h-4" />
                                    Masuk Interview
                                    <ExternalLink className="w-3 h-3" />
                                </a>
                            )}
                            <button
                                onClick={(e) => { e.stopPropagation(); router.push(`/profile/recruiter/dashboard/jobs/${params.slug}/applications/${application.id}`) }}
                                className="flex items-center justify-center gap-1.5 px-3 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition text-sm"
                            >
                                <Eye className="w-4 h-4" />
                                Detail
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleDeleteApplication(application.id, `${application.jobseekers?.firstName} ${application.jobseekers?.lastName}`) }}
                                className="flex items-center justify-center px-3 py-2 border border-gray-200 text-gray-500 rounded-xl hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </>
                    ) : application.status === 'INTERVIEW_COMPLETED' ? (
                        <>
                            <button
                                onClick={(e) => { e.stopPropagation(); router.push(`/profile/recruiter/dashboard/jobs/${params.slug}/applications/${application.id}`) }}
                                className="flex items-center justify-center gap-1.5 px-3 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition text-sm"
                            >
                                <Eye className="w-4 h-4" />
                                Detail
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleAcceptCandidate(application) }}
                                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition text-sm font-medium"
                            >
                                <CheckCircle className="w-4 h-4" />
                                Terima
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleDeleteApplication(application.id, `${application.jobseekers?.firstName} ${application.jobseekers?.lastName}`) }}
                                className="flex items-center justify-center px-3 py-2 border border-gray-200 text-gray-500 rounded-xl hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </>
                    ) : application.status === 'ACCEPTED' ? (
                        <button
                            onClick={(e) => { e.stopPropagation(); router.push(`/profile/recruiter/dashboard/jobs/${params.slug}/applications/${application.id}`) }}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition text-sm font-medium"
                        >
                            <CheckCircle className="w-4 h-4" />
                            Lihat Detail
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={(e) => { e.stopPropagation(); router.push(`/profile/recruiter/dashboard/jobs/${params.slug}/applications/${application.id}`) }}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition text-sm font-medium"
                            >
                                <Eye className="w-4 h-4" />
                                Lihat Detail
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleDeleteApplication(application.id, `${application.jobseekers?.firstName} ${application.jobseekers?.lastName}`) }}
                                className="flex items-center justify-center px-3 py-2 border border-gray-200 text-gray-500 rounded-xl hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </>
                    )}
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
                        onClick={() => router.push('/profile/recruiter/dashboard/jobs')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Kembali ke Daftar Lowongan
                    </button>

                    {job && (
                        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                {job.title}
                            </h1>
                            <div className="flex flex-wrap items-center gap-4 text-gray-600">
                                <div className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    {job.location}
                                </div>
                                <div className="flex items-center gap-1">
                                    <Briefcase className="w-4 h-4" />
                                    {job.jobType}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Stats Cards - Clickable Filters */}
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
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        >
                            <option value="all">Semua Status</option>
                            <option value="PENDING">Pending</option>
                            <option value="REVIEWING">Reviewing</option>
                            <option value="INTERVIEW_SCHEDULED">Interview</option>
                            <option value="INTERVIEW_COMPLETED">Selesai Interview</option>
                            <option value="ACCEPTED">Diterima</option>
                        </select>

                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cari nama atau email..."
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

                        {/* Select Mode Toggle */}
                        <button
                            onClick={toggleSelectMode}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                                selectMode
                                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                    : 'border border-indigo-300 text-indigo-600 hover:bg-indigo-50'
                            }`}
                        >
                            <UserPlus className="w-4 h-4" />
                            {selectMode ? 'Batal Pilih' : 'Pilih Kandidat'}
                        </button>
                    </div>

                    {/* Selection Info Bar */}
                    {selectMode && (
                        <div className="mt-4 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                            <p className="text-sm text-indigo-700">
                                <span className="font-semibold">Mode Pilih Aktif</span> - Klik checkbox pada kandidat berstatus "Reviewing" untuk memilih beberapa kandidat sekaligus untuk interview bersama.
                                {selectedApplications.length > 0 && (
                                    <span className="ml-2 font-bold">{selectedApplications.length} kandidat terpilih</span>
                                )}
                            </p>
                        </div>
                    )}
                </div>

                {/* Applications List */}
                {filteredApplications.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {searchQuery || statusFilter !== 'all'
                                ? 'Tidak ada pelamar ditemukan'
                                : 'Belum ada pelamar'}
                        </h3>
                        <p className="text-gray-600">
                            {searchQuery || statusFilter !== 'all'
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

                                {totalPages > 1 && (
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
                                )}
                            </>
                        )
                    })()
                )}
            </div>

            {/* Floating Action Bar */}
            {selectedApplications.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
                    <div className="container mx-auto px-4 max-w-7xl">
                        <div className="flex items-center justify-between py-4">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                        <Users className="w-5 h-5 text-indigo-600" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">{selectedApplications.length} Kandidat Terpilih</p>
                                        <p className="text-xs text-gray-500">Siap diundang interview bersama</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setSelectedApplications([])}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleInviteMultipleInterview}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-medium shadow-lg shadow-indigo-500/30"
                                >
                                    <Video className="w-5 h-5" />
                                    Undang Interview Bersama
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Document Preview Modal */}
            {documentModal.isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
                        <div className="flex items-center justify-between p-4 border-b">
                            <h3 className="text-lg font-bold text-gray-900">Preview: {documentModal.title}</h3>
                            <button
                                type="button"
                                onClick={() => setDocumentModal({ isOpen: false, url: '', title: '' })}
                                className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-4 h-[70vh] overflow-auto">
                            {documentModal.url && (
                                <>
                                    {documentModal.url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                        <img
                                            src={documentModal.url}
                                            alt={documentModal.title}
                                            className="max-w-full h-auto mx-auto rounded-lg"
                                        />
                                    ) : (
                                        <iframe
                                            src={documentModal.url}
                                            className="w-full h-full rounded-lg"
                                            title={documentModal.title}
                                        />
                                    )}
                                </>
                            )}
                        </div>
                        <div className="flex justify-end gap-3 p-4 border-t bg-gray-50">
                            <a
                                href={documentModal.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium flex items-center gap-2"
                            >
                                <ExternalLink className="w-4 h-4" />
                                Buka di Tab Baru
                            </a>
                            <button
                                type="button"
                                onClick={() => setDocumentModal({ isOpen: false, url: '', title: '' })}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm font-medium"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
