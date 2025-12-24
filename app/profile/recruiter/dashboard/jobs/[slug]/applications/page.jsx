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
    CreditCard,
    Download,
    X,
    Sparkles,
    Loader2,
    Send,
    Star
} from 'lucide-react'
import Swal from 'sweetalert2'

export default function JobApplicationsPage() {
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
    const [documentModal, setDocumentModal] = useState({ isOpen: false, url: '', title: '', type: '' })
    const [photoModal, setPhotoModal] = useState({ isOpen: false, url: '', name: '' })
    const [aiRecommendations, setAiRecommendations] = useState({})
    const [loadingAI, setLoadingAI] = useState({})
    const [aiFilter, setAiFilter] = useState(false)
    const itemsPerPage = 10

    useEffect(() => {
        loadApplications()
    }, [])

    useEffect(() => {
        filterApplications()
    }, [applications, searchQuery, statusFilter, aiFilter, aiRecommendations])

    useEffect(() => {
        setCurrentPage(1)
    }, [filteredApplications.length])

    // Fetch AI recommendations
    useEffect(() => {
        if (applications.length > 0 && job) {
            applications.forEach(app => {
                if (app.jobseekers?.cvUrl && !aiRecommendations[app.id] && !loadingAI[app.id]) {
                    fetchAIRecommendation(app)
                }
            })
        }
    }, [applications, job])

    const fetchAIRecommendation = async (application) => {
        try {
            setLoadingAI(prev => ({ ...prev, [application.id]: true }))
            
            // Skip if no CV URL
            if (!application.jobseekers?.cvUrl) {
                setAiRecommendations(prev => ({
                    ...prev,
                    [application.id]: {
                        isRecommended: false,
                        score: 0,
                        highlights: [],
                        loaded: true,
                        error: false
                    }
                }))
                return
            }

            const response = await fetch('/api/profile/recruiter/jobs/ai-match', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cv_url: application.jobseekers?.cvUrl,
                    cv_skills: application.jobseekers?.skills || [],
                    job_requirements: {
                        title: job?.title,
                        description: job?.description,
                        requirements: job?.requirements,
                        skills: job?.skills || []
                    }
                })
            })

            const data = await response.json()
            setAiRecommendations(prev => ({
                ...prev,
                [application.id]: {
                    isRecommended: (data.match_score || 0) >= 70,
                    score: data.match_score || 0,
                    highlights: data.highlights || [],
                    loaded: true
                }
            }))
        } catch (error) {
            console.error('AI recommendation error:', error)
            setAiRecommendations(prev => ({
                ...prev,
                [application.id]: {
                    isRecommended: false,
                    score: 0,
                    highlights: [],
                    loaded: true,
                    error: true
                }
            }))
        } finally {
            setLoadingAI(prev => ({ ...prev, [application.id]: false }))
        }
    }

    const loadApplications = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem('token')

            const response = await fetch(`/api/profile/recruiter/jobs/${params.slug}/applications`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })

            if (response.ok) {
                const data = await response.json()
                // Sort by appliedAt (newest first)
                const sortedApps = (data.applications || []).sort((a, b) => 
                    new Date(b.appliedAt) - new Date(a.appliedAt)
                )
                setApplications(sortedApps)
                setJob(data.job)
                setStats(data.stats)
            } else {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to load applications')
            }
        } catch (error) {
            console.error('Load applications error:', error)
            Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'Failed to load applications' })
        } finally {
            setLoading(false)
        }
    }

    const filterApplications = () => {
        let filtered = applications

        if (statusFilter !== 'all') {
            filtered = filtered.filter(app => app.status === statusFilter)
        }

        if (aiFilter) {
            filtered = filtered.filter(app => aiRecommendations[app.id]?.isRecommended)
        }

        if (searchQuery) {
            filtered = filtered.filter(app => {
                const fullName = `${app.jobseekers.firstName} ${app.jobseekers.lastName}`.toLowerCase()
                const email = app.jobseekers.email?.toLowerCase() || ''
                const query = searchQuery.toLowerCase()
                return fullName.includes(query) || email.includes(query)
            })
        }

        setFilteredApplications(filtered)
    }

    // Count AI recommended
    const aiRecommendedCount = Object.values(aiRecommendations).filter(r => r?.isRecommended).length

    const openDocumentModal = (url, title, type) => {
        setDocumentModal({ isOpen: true, url, title, type })
    }

    const openPhotoModal = (url, name) => {
        setPhotoModal({ isOpen: true, url, name })
    }

    const getStatusBadge = (status) => {
        const statusConfig = {
            PENDING: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
            REVIEWING: { label: 'Reviewing', color: 'bg-blue-100 text-blue-700 border-blue-300' },
            SHORTLISTED: { label: 'Shortlisted', color: 'bg-purple-100 text-purple-700 border-purple-300' },
            INTERVIEW_SCHEDULED: { label: 'Interview', color: 'bg-indigo-100 text-indigo-700 border-indigo-300' },
            INTERVIEW_COMPLETED: { label: 'Selesai', color: 'bg-teal-100 text-teal-700 border-teal-300' },
            ACCEPTED: { label: 'Diterima', color: 'bg-green-100 text-green-700 border-green-300' },
            REJECTED: { label: 'Ditolak', color: 'bg-red-100 text-red-700 border-red-300' },
            WITHDRAWN: { label: 'Dibatalkan', color: 'bg-gray-100 text-gray-700 border-gray-300' }
        }
        const config = statusConfig[status] || statusConfig.PENDING
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${config.color}`}>
                {config.label}
            </span>
        )
    }

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        })
    }

    // Selection handlers
    const handleSelectAll = () => {
        const selectableApps = filteredApplications.filter(app => app.status === 'PENDING' || app.status === 'REVIEWING')
        if (selectedApplications.length === selectableApps.length) {
            setSelectedApplications([])
        } else {
            setSelectedApplications(selectableApps.map(app => app.id))
        }
    }

    const handleSelectApplication = (id) => {
        setSelectedApplications(prev => 
            prev.includes(id) ? prev.filter(appId => appId !== id) : [...prev, id]
        )
    }

    // Action handlers
    const handleInviteInterview = (application) => {
        if (!job?.id) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'Data lowongan belum dimuat.' })
            return
        }
        router.push(`/profile/recruiter/dashboard/interview?job=${job.id}&applicants=${application.id}`)
    }

    const handleBulkInvite = () => {
        if (selectedApplications.length === 0) {
            Swal.fire('Info', 'Pilih pelamar terlebih dahulu', 'info')
            return
        }
        if (!job?.id) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'Data lowongan belum dimuat.' })
            return
        }
        router.push(`/profile/recruiter/dashboard/interview?job=${job.id}&applicants=${selectedApplications.join(',')}`)
    }

    const handleReject = async (applicationId, applicantName) => {
        const result = await Swal.fire({
            title: 'Tolak Pelamar?',
            html: `<p>Pelamar <strong>${applicantName}</strong> akan ditolak</p>`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            confirmButtonText: 'Ya, Tolak',
            cancelButtonText: 'Batal'
        })

        if (result.isConfirmed) {
            try {
                const token = localStorage.getItem('token')
                const response = await fetch(`/api/profile/recruiter/applications/${applicationId}`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ status: 'REJECTED' })
                })

                if (response.ok) {
                    await Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Pelamar telah ditolak', timer: 1500, showConfirmButton: false })
                    loadApplications()
                }
            } catch (error) {
                Swal.fire('Error', 'Gagal menolak pelamar', 'error')
            }
        }
    }

    const handleDelete = async (applicationId, applicantName) => {
        const result = await Swal.fire({
            title: 'Hapus Lamaran?',
            html: `<p>Lamaran dari <strong>${applicantName}</strong> akan dihapus</p>`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Ya, Hapus',
            cancelButtonText: 'Batal'
        })

        if (result.isConfirmed) {
            try {
                const token = localStorage.getItem('token')
                const response = await fetch(`/api/profile/recruiter/applications/${applicationId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                })

                if (response.ok) {
                    await Swal.fire({ icon: 'success', title: 'Dihapus', timer: 1500, showConfirmButton: false })
                    loadApplications()
                }
            } catch (error) {
                Swal.fire('Error', 'Gagal menghapus lamaran', 'error')
            }
        }
    }

    const totalPages = Math.max(1, Math.ceil(filteredApplications.length / itemsPerPage))

    const renderApplicationRow = (application) => {
        const isSelected = selectedApplications.includes(application.id)
        const aiRec = aiRecommendations[application.id]
        const isLoadingAI = loadingAI[application.id]
        const canSelect = application.status === 'PENDING' || application.status === 'REVIEWING'
        const fullName = `${application.jobseekers.firstName} ${application.jobseekers.lastName}`

        return (
            <div
                key={application.id}
                className={`bg-white rounded-xl border-2 p-4 transition-all duration-200 ${
                    isSelected ? 'border-blue-500 bg-blue-50/30' : 'border-gray-100 hover:border-gray-200'
                }`}
            >
                <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    {canSelect && (
                        <button onClick={() => handleSelectApplication(application.id)} className="mt-1 flex-shrink-0">
                            {isSelected ? (
                                <CheckSquare className="w-5 h-5 text-blue-600" />
                            ) : (
                                <Square className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                            )}
                        </button>
                    )}

                    {/* Photo */}
                    <button
                        onClick={() => application.jobseekers.photo && openPhotoModal(application.jobseekers.photo, fullName)}
                        className="flex-shrink-0 relative group"
                    >
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-xl font-bold overflow-hidden">
                            {application.jobseekers.photo ? (
                                <img src={application.jobseekers.photo} alt={fullName} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-gray-500">{application.jobseekers.firstName?.charAt(0) || 'U'}</span>
                            )}
                        </div>
                        {application.jobseekers.photo && (
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 rounded-xl flex items-center justify-center transition-opacity">
                                <Eye className="w-5 h-5 text-white" />
                            </div>
                        )}
                    </button>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                                <p className="text-xs text-blue-600 font-medium mb-1">{formatDate(application.appliedAt)}</p>
                                <h3 className="text-lg font-bold text-gray-900">{fullName}</h3>
                                <p className="text-sm text-gray-500">{application.jobseekers.currentTitle || 'Pencari Kerja'}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                {isLoadingAI ? (
                                    <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-medium flex items-center gap-1">
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                        Analyzing...
                                    </span>
                                ) : aiRec?.isRecommended ? (
                                    <span className="px-3 py-1 bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 rounded-full text-xs font-semibold flex items-center gap-1 border border-amber-200">
                                        <Sparkles className="w-3 h-3" />
                                        CV Recommended by AI
                                    </span>
                                ) : null}
                                {getStatusBadge(application.status)}
                            </div>
                        </div>

                        {/* Document Badges */}
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                            <button
                                onClick={() => application.jobseekers.cvUrl && openDocumentModal(application.jobseekers.cvUrl, 'CV', 'pdf')}
                                disabled={!application.jobseekers.cvUrl}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                                    application.jobseekers.cvUrl
                                        ? 'bg-green-100 text-green-700 hover:bg-green-200 cursor-pointer'
                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                }`}
                            >
                                <FileText className="w-3.5 h-3.5" />
                                CV
                            </button>

                            <button
                                onClick={() => application.jobseekers.ktpUrl && openDocumentModal(application.jobseekers.ktpUrl, 'KTP', 'image')}
                                disabled={!application.jobseekers.ktpUrl}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                                    application.jobseekers.ktpUrl
                                        ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 cursor-pointer'
                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                }`}
                            >
                                <CreditCard className="w-3.5 h-3.5" />
                                KTP
                            </button>

                            <button
                                onClick={() => application.jobseekers.ak1Url && openDocumentModal(application.jobseekers.ak1Url, 'AK1', 'pdf')}
                                disabled={!application.jobseekers.ak1Url}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                                    application.jobseekers.ak1Url
                                        ? 'bg-orange-100 text-orange-700 hover:bg-orange-200 cursor-pointer'
                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                }`}
                            >
                                <FileText className="w-3.5 h-3.5" />
                                AK1
                            </button>

                            <button
                                onClick={() => router.push(`/profile/recruiter/dashboard/jobs/${params.slug}/applications/${application.id}`)}
                                className="px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                            >
                                <Eye className="w-3.5 h-3.5" />
                                Detail Informasi
                            </button>
                        </div>

                        {/* Skills */}
                        {application.jobseekers.skills?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                                {application.jobseekers.skills.slice(0, 3).map((skill, idx) => (
                                    <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">
                                        {skill}
                                    </span>
                                ))}
                                {application.jobseekers.skills.length > 3 && (
                                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs">
                                        +{application.jobseekers.skills.length - 3}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2 flex-shrink-0">
                        {/* PENDING/REVIEWING: Show Shortlist button */}
                        {(application.status === 'PENDING' || application.status === 'REVIEWING') && (
                            <>
                                <button
                                    onClick={async () => {
                                        const token = localStorage.getItem('token')
                                        await fetch(`/api/profile/recruiter/applications/${application.id}`, {
                                            method: 'PATCH',
                                            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ status: 'SHORTLISTED' })
                                        })
                                        Swal.fire('Berhasil', 'Pelamar di-shortlist', 'success')
                                        loadApplications()
                                    }}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition flex items-center gap-2"
                                >
                                    <Star className="w-4 h-4" />
                                    Shortlist
                                </button>
                                <button
                                    onClick={() => handleReject(application.id, fullName)}
                                    className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition"
                                >
                                    Tolak
                                </button>
                            </>
                        )}
                        {/* SHORTLISTED: Show Interview button */}
                        {application.status === 'SHORTLISTED' && (
                            <>
                                <button
                                    onClick={() => handleInviteInterview(application)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center gap-2"
                                >
                                    <Send className="w-4 h-4" />
                                    Undang Interview
                                </button>
                                <button
                                    onClick={() => handleReject(application.id, fullName)}
                                    className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition"
                                >
                                    Tolak
                                </button>
                            </>
                        )}
                        {application.status === 'INTERVIEW_SCHEDULED' && application.interview?.meetingUrl && (
                            <a
                                href={application.interview.meetingUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition flex items-center gap-2"
                            >
                                <Video className="w-4 h-4" />
                                Join Interview
                            </a>
                        )}
                        {application.status === 'INTERVIEW_COMPLETED' && (
                            <button
                                onClick={() => router.push(`/profile/recruiter/dashboard/jobs/${params.slug}/applications/${application.id}`)}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition flex items-center gap-2"
                            >
                                <CheckCircle className="w-4 h-4" />
                                Terima Kandidat
                            </button>
                        )}
                        {(application.status === 'ACCEPTED' || application.status === 'REJECTED') && (
                            <button
                                onClick={() => router.push(`/profile/recruiter/dashboard/jobs/${params.slug}/applications/${application.id}`)}
                                className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition flex items-center gap-2"
                            >
                                <Eye className="w-4 h-4" />
                                Lihat Detail
                            </button>
                        )}
                        {application.status === 'REJECTED' && (
                            <button
                                onClick={() => handleDelete(application.id, fullName)}
                                className="p-2 border border-gray-200 text-gray-500 rounded-lg hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
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
                        onClick={() => router.push(`/profile/recruiter/dashboard/jobs/${params.slug}`)}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Kembali ke Detail Lowongan
                    </button>

                    {job && (
                        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
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
                        <button
                            onClick={() => setAiFilter(!aiFilter)}
                            className={`text-left rounded-xl p-4 transition-all ${
                                aiFilter
                                    ? 'bg-gradient-to-br from-amber-500 to-yellow-500 text-white ring-2 ring-amber-500 ring-offset-2'
                                    : 'bg-gradient-to-br from-amber-50 to-yellow-50 hover:from-amber-100 hover:to-yellow-100 border border-amber-200'
                            }`}
                        >
                            <p className={`text-sm mb-1 flex items-center gap-1 ${aiFilter ? 'text-amber-100' : 'text-amber-700'}`}>
                                <Sparkles className="w-3.5 h-3.5" />
                                AI Recommended
                            </p>
                            <p className={`text-3xl font-bold ${aiFilter ? 'text-white' : 'text-amber-900'}`}>{aiRecommendedCount}</p>
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
                            <option value="SHORTLISTED">Shortlisted</option>
                            <option value="INTERVIEW_SCHEDULED">Interview</option>
                            <option value="ACCEPTED">Accepted</option>
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
                    </div>
                </div>

                {/* Bulk Actions */}
                <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            onClick={handleSelectAll}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition flex items-center gap-2"
                        >
                            {selectedApplications.length > 0 ? (
                                <CheckSquare className="w-4 h-4 text-blue-600" />
                            ) : (
                                <Square className="w-4 h-4" />
                            )}
                            Pilih Semua
                        </button>
                        <button
                            onClick={async () => {
                                if (selectedApplications.length === 0) return
                                const result = await Swal.fire({
                                    title: 'Shortlist Pelamar Terpilih?',
                                    text: `${selectedApplications.length} pelamar akan di-shortlist`,
                                    icon: 'question',
                                    showCancelButton: true,
                                    confirmButtonColor: '#7c3aed',
                                    confirmButtonText: 'Ya, Shortlist',
                                    cancelButtonText: 'Batal'
                                })
                                if (result.isConfirmed) {
                                    const token = localStorage.getItem('token')
                                    for (const appId of selectedApplications) {
                                        await fetch(`/api/profile/recruiter/applications/${appId}`, {
                                            method: 'PATCH',
                                            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ status: 'SHORTLISTED' })
                                        })
                                    }
                                    Swal.fire('Berhasil', 'Pelamar telah di-shortlist', 'success')
                                    setSelectedApplications([])
                                    loadApplications()
                                }
                            }}
                            disabled={selectedApplications.length === 0}
                            className={`px-4 py-2 border rounded-lg text-sm font-medium transition flex items-center gap-2 ${
                                selectedApplications.length > 0
                                    ? 'border-purple-300 text-purple-600 hover:bg-purple-50'
                                    : 'border-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                        >
                            <Star className="w-4 h-4" />
                            Shortlist Terpilih
                        </button>
                        <button
                            onClick={async () => {
                                if (selectedApplications.length === 0) return
                                const result = await Swal.fire({
                                    title: 'Tolak Pelamar Terpilih?',
                                    text: `${selectedApplications.length} pelamar akan ditolak`,
                                    icon: 'warning',
                                    showCancelButton: true,
                                    confirmButtonColor: '#dc2626',
                                    confirmButtonText: 'Ya, Tolak',
                                    cancelButtonText: 'Batal'
                                })
                                if (result.isConfirmed) {
                                    const token = localStorage.getItem('token')
                                    for (const appId of selectedApplications) {
                                        await fetch(`/api/profile/recruiter/applications/${appId}`, {
                                            method: 'PATCH',
                                            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ status: 'REJECTED' })
                                        })
                                    }
                                    Swal.fire('Berhasil', 'Pelamar telah ditolak', 'success')
                                    setSelectedApplications([])
                                    loadApplications()
                                }
                            }}
                            disabled={selectedApplications.length === 0}
                            className={`px-4 py-2 border rounded-lg text-sm font-medium transition flex items-center gap-2 ${
                                selectedApplications.length > 0
                                    ? 'border-red-300 text-red-600 hover:bg-red-50'
                                    : 'border-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                        >
                            <Trash2 className="w-4 h-4" />
                            Tolak Terpilih
                        </button>
                        <button
                            onClick={handleBulkInvite}
                            disabled={selectedApplications.length === 0}
                            className={`px-4 py-2 border rounded-lg text-sm font-medium transition flex items-center gap-2 ${
                                selectedApplications.length > 0
                                    ? 'border-blue-300 text-blue-600 hover:bg-blue-50'
                                    : 'border-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                        >
                            <Send className="w-4 h-4" />
                            Undang Interview
                        </button>

                        {selectedApplications.length > 0 && (
                            <span className="text-sm text-gray-500 ml-auto">
                                {selectedApplications.length} pelamar dipilih
                            </span>
                        )}
                    </div>
                </div>

                {/* Applications List */}
                {filteredApplications.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {searchQuery || statusFilter !== 'all' ? 'Tidak ada pelamar ditemukan' : 'Belum ada pelamar'}
                        </h3>
                        <p className="text-gray-600">
                            {searchQuery || statusFilter !== 'all' ? 'Coba ubah filter atau kata kunci pencarian' : 'Tunggu hingga ada kandidat yang melamar'}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="space-y-4">
                            {filteredApplications
                                .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                                .map(app => renderApplicationRow(app))}
                        </div>

                        <div className="flex items-center justify-between mt-6">
                            <div className="text-sm text-gray-600">
                                Menampilkan {Math.min(filteredApplications.length, (currentPage - 1) * itemsPerPage + 1)}-{Math.min(currentPage * itemsPerPage, filteredApplications.length)} dari {filteredApplications.length} pelamar
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className={`px-4 py-2 rounded-lg font-medium ${currentPage === 1 ? 'text-gray-400 bg-gray-100' : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'}`}
                                >
                                    Prev
                                </button>
                                <div className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium">
                                    {currentPage} / {totalPages}
                                </div>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className={`px-4 py-2 rounded-lg font-medium ${currentPage === totalPages ? 'text-gray-400 bg-gray-100' : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'}`}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Document Modal */}
            {documentModal.isOpen && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b">
                            <h3 className="text-lg font-semibold text-gray-900">{documentModal.title}</h3>
                            <div className="flex items-center gap-2">
                                <a href={documentModal.url} download target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-gray-100 rounded-lg transition" title="Download">
                                    <Download className="w-5 h-5 text-gray-600" />
                                </a>
                                <a href={documentModal.url} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-gray-100 rounded-lg transition" title="Buka di tab baru">
                                    <ExternalLink className="w-5 h-5 text-gray-600" />
                                </a>
                                <button onClick={() => setDocumentModal({ isOpen: false, url: '', title: '', type: '' })} className="p-2 hover:bg-gray-100 rounded-lg transition">
                                    <X className="w-5 h-5 text-gray-600" />
                                </button>
                            </div>
                        </div>
                        <div className="p-4 h-[70vh] overflow-auto">
                            {documentModal.type === 'image' ? (
                                <img src={documentModal.url} alt={documentModal.title} className="w-full h-auto rounded-lg" />
                            ) : (
                                <iframe src={`${documentModal.url}#toolbar=1`} className="w-full h-full rounded-lg border" title={documentModal.title} />
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Photo Modal */}
            {photoModal.isOpen && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setPhotoModal({ isOpen: false, url: '', name: '' })}>
                    <div className="relative max-w-2xl w-full" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setPhotoModal({ isOpen: false, url: '', name: '' })} className="absolute -top-12 right-0 p-2 text-white hover:bg-white/20 rounded-lg transition">
                            <X className="w-6 h-6" />
                        </button>
                        <img src={photoModal.url} alt={photoModal.name} className="w-full h-auto rounded-2xl shadow-2xl" />
                        <p className="text-center text-white mt-4 text-lg font-medium">{photoModal.name}</p>
                    </div>
                </div>
            )}
        </div>
    )
}
