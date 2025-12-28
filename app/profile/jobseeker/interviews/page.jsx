'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Swal from 'sweetalert2'
import {
    Calendar,
    Clock,
    MapPin,
    Building2,
    CheckCircle,
    XCircle,
    AlertCircle,
    Loader2,
    Video,
    ArrowLeft,
    Bell,
    RefreshCw,
    ExternalLink
} from 'lucide-react'

export default function JobseekerInterviewsPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [interviews, setInterviews] = useState([])
    const [pending, setPending] = useState([])
    const [responded, setResponded] = useState([])
    const [stats, setStats] = useState(null)
    const [activeFilter, setActiveFilter] = useState('all')

    useEffect(() => {
        loadInterviews()
    }, [])

    const loadInterviews = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem('token')

            const response = await fetch('/api/profile/jobseeker/interviews', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            const data = await response.json()

            if (data.success) {
                setInterviews(data.data.interviews)
                setPending(data.data.pending)
                setResponded(data.data.responded)
                setStats(data.data.stats)
            } else {
                throw new Error(data.error)
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Gagal',
                text: 'Gagal memuat data interview'
            })
        } finally {
            setLoading(false)
        }
    }

    const handleRespond = async (participantId, status) => {
        const isAccept = status === 'ACCEPTED'
        const isReschedule = status === 'RESCHEDULE_REQUESTED'

        let title, text, confirmText, confirmColor, inputConfig
        
        if (isAccept) {
            title = 'Terima Interview?'
            text = 'Anda akan mengkonfirmasi kehadiran untuk interview ini'
            confirmText = 'Ya, Saya Akan Hadir'
            confirmColor = '#10b981'
            inputConfig = {}
        } else if (isReschedule) {
            title = 'Minta Reschedule?'
            text = 'Berikan alasan mengapa Anda meminta jadwal ulang'
            confirmText = 'Kirim Permintaan'
            confirmColor = '#f59e0b'
            inputConfig = {
                input: 'textarea',
                inputPlaceholder: 'Alasan reschedule (wajib diisi)',
                inputAttributes: { maxLength: 500 },
                inputValidator: (value) => {
                    if (!value || value.trim().length < 10) {
                        return 'Alasan harus minimal 10 karakter'
                    }
                }
            }
        } else {
            title = 'Tolak Interview?'
            text = 'Anda yakin ingin menolak interview ini?'
            confirmText = 'Ya, Tolak'
            confirmColor = '#ef4444'
            inputConfig = {
                input: 'textarea',
                inputPlaceholder: 'Alasan menolak (opsional)',
                inputAttributes: { maxLength: 500 }
            }
        }

        const result = await Swal.fire({
            title,
            text,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: confirmText,
            cancelButtonText: 'Batal',
            confirmButtonColor: confirmColor,
            ...inputConfig
        })

        if (!result.isConfirmed) return

        try {
            const token = localStorage.getItem('token')

            const response = await fetch(`/api/profile/jobseeker/interviews/${participantId}/respond`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    status: status,
                    message: result.value || null
                })
            })

            if (response.ok) {
                let successText = ''
                if (isAccept) {
                    successText = 'Konfirmasi kehadiran berhasil. Rekruter akan menerima notifikasi.'
                } else if (isReschedule) {
                    successText = 'Permintaan reschedule telah dikirim. Tunggu konfirmasi dari rekruter.'
                } else {
                    successText = 'Interview berhasil ditolak'
                }

                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil!',
                    text: successText,
                    timer: 2000,
                    showConfirmButton: false
                })
                loadInterviews()
            } else {
                const data = await response.json()
                throw new Error(data.error)
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Gagal',
                text: error.message || 'Gagal merespon interview'
            })
        }
    }

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })
    }

    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getTimeUntil = (scheduledAt) => {
        const now = new Date()
        const scheduled = new Date(scheduledAt)
        const diff = scheduled - now

        if (diff < 0) return 'Sudah lewat'
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        
        if (days > 0) return `${days} hari lagi`
        if (hours > 0) return `${hours} jam lagi`
        return 'Kurang dari 1 jam lagi'
    }

    const canJoinNow = (scheduledAt) => {
        const now = new Date()
        const scheduled = new Date(scheduledAt)
        const diff = scheduled - now
        
        // Can join 15 minutes before
        return diff <= 15 * 60 * 1000 && diff > -60 * 60 * 1000
    }

    // Get filtered interviews based on activeFilter
    const getFilteredInterviews = () => {
        if (activeFilter === 'all') return { pending, responded }
        if (activeFilter === 'pending') return { pending, responded: [] }
        if (activeFilter === 'accepted') return { pending: [], responded: responded.filter(i => i.status === 'ACCEPTED') }
        if (activeFilter === 'declined') return { pending: [], responded: responded.filter(i => i.status === 'DECLINED') }
        if (activeFilter === 'reschedule') return { pending: [], responded: responded.filter(i => i.status === 'RESCHEDULE_REQUESTED') }
        return { pending, responded }
    }

    const filteredData = getFilteredInterviews()

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Memuat interview...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Header */}
                <div className="mb-6">
                    <Link href="/profile/jobseeker/dashboard">
                        <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition mb-4">
                            <ArrowLeft className="w-5 h-5" />
                            Kembali ke Dashboard
                        </button>
                    </Link>
                    
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Interview Saya</h1>
                    <p className="text-gray-600">Kelola jadwal interview dan konfirmasi kehadiran Anda</p>
                </div>

                {/* Stats - Clickable Cards */}
                {stats && (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                        {/* Total */}
                        <button
                            onClick={() => setActiveFilter('all')}
                            className={`rounded-xl shadow-sm p-4 transition-all ${
                                activeFilter === 'all'
                                    ? 'bg-blue-600 text-white ring-2 ring-blue-600 ring-offset-2'
                                    : 'bg-white hover:bg-blue-50 border border-gray-200'
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="text-left">
                                    <p className={`text-xs font-medium ${activeFilter === 'all' ? 'text-blue-100' : 'text-gray-500'}`}>Total</p>
                                    <p className="text-2xl font-bold">{stats.total}</p>
                                </div>
                                <Calendar className={`w-8 h-8 ${activeFilter === 'all' ? 'text-blue-200' : 'text-blue-600'}`} />
                            </div>
                        </button>

                        {/* Pending */}
                        <button
                            onClick={() => setActiveFilter('pending')}
                            className={`rounded-xl shadow-sm p-4 transition-all ${
                                activeFilter === 'pending'
                                    ? 'bg-yellow-500 text-white ring-2 ring-yellow-500 ring-offset-2'
                                    : 'bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 hover:border-yellow-400'
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="text-left">
                                    <p className={`text-xs font-medium ${activeFilter === 'pending' ? 'text-yellow-100' : 'text-yellow-700'}`}>Pending</p>
                                    <p className={`text-2xl font-bold ${activeFilter === 'pending' ? 'text-white' : 'text-yellow-900'}`}>{stats.pending}</p>
                                </div>
                                <Bell className={`w-8 h-8 ${activeFilter === 'pending' ? 'text-yellow-200' : 'text-yellow-600'}`} />
                            </div>
                        </button>

                        {/* Accepted */}
                        <button
                            onClick={() => setActiveFilter('accepted')}
                            className={`rounded-xl shadow-sm p-4 transition-all ${
                                activeFilter === 'accepted'
                                    ? 'bg-green-600 text-white ring-2 ring-green-600 ring-offset-2'
                                    : 'bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 hover:border-green-400'
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="text-left">
                                    <p className={`text-xs font-medium ${activeFilter === 'accepted' ? 'text-green-100' : 'text-green-700'}`}>Dikonfirmasi</p>
                                    <p className={`text-2xl font-bold ${activeFilter === 'accepted' ? 'text-white' : 'text-green-900'}`}>{stats.accepted}</p>
                                </div>
                                <CheckCircle className={`w-8 h-8 ${activeFilter === 'accepted' ? 'text-green-200' : 'text-green-600'}`} />
                            </div>
                        </button>

                        {/* Reschedule Requested */}
                        <button
                            onClick={() => setActiveFilter('reschedule')}
                            className={`rounded-xl shadow-sm p-4 transition-all ${
                                activeFilter === 'reschedule'
                                    ? 'bg-orange-500 text-white ring-2 ring-orange-500 ring-offset-2'
                                    : 'bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 hover:border-orange-400'
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="text-left">
                                    <p className={`text-xs font-medium ${activeFilter === 'reschedule' ? 'text-orange-100' : 'text-orange-700'}`}>Reschedule</p>
                                    <p className={`text-2xl font-bold ${activeFilter === 'reschedule' ? 'text-white' : 'text-orange-900'}`}>{stats.reschedule || 0}</p>
                                </div>
                                <RefreshCw className={`w-8 h-8 ${activeFilter === 'reschedule' ? 'text-orange-200' : 'text-orange-600'}`} />
                            </div>
                        </button>

                        {/* Declined */}
                        <button
                            onClick={() => setActiveFilter('declined')}
                            className={`rounded-xl shadow-sm p-4 transition-all ${
                                activeFilter === 'declined'
                                    ? 'bg-gray-600 text-white ring-2 ring-gray-600 ring-offset-2'
                                    : 'bg-gray-100 border border-gray-200 hover:border-gray-400'
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="text-left">
                                    <p className={`text-xs font-medium ${activeFilter === 'declined' ? 'text-gray-300' : 'text-gray-600'}`}>Ditolak</p>
                                    <p className="text-2xl font-bold">{stats.declined}</p>
                                </div>
                                <XCircle className={`w-8 h-8 ${activeFilter === 'declined' ? 'text-gray-400' : 'text-gray-400'}`} />
                            </div>
                        </button>
                    </div>
                )}

                {/* Pending Invitations */}
                {filteredData.pending.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Bell className="w-6 h-6 text-yellow-600" />
                            Undangan Pending ({filteredData.pending.length})
                        </h2>
                        <div className="space-y-4">
                            {filteredData.pending.map((interview) => (
                                <div key={interview.participantId} className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-2xl p-6 shadow-lg">
                                    <div className="flex flex-col md:flex-row gap-6">
                                        {/* Company Logo */}
                                        <div className="flex-shrink-0">
                                            <div className="w-16 h-16 bg-gradient-to-br from-[#03587f] to-[#024666] rounded-xl flex items-center justify-center text-3xl overflow-hidden">
                                                {interview.jobs?.company?.logo ? (
                                                    <img src={interview.jobs.company.logo} alt={interview.jobs.company.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    '🏢'
                                                )}
                                            </div>
                                        </div>

                                        {/* Interview Details */}
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                                                        {interview.jobs?.title || interview.title}
                                                    </h3>
                                                    <div className="flex items-center gap-2 text-gray-700">
                                                        <Building2 className="w-4 h-4" />
                                                        <span className="font-semibold">{interview.jobs?.company?.name || 'Perusahaan'}</span>
                                                    </div>
                                                </div>
                                                <span className="px-4 py-2 bg-yellow-500 text-white rounded-full text-sm font-bold animate-pulse">
                                                    Butuh Respon!
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                                <div className="flex items-center gap-2 text-gray-700">
                                                    <Calendar className="w-5 h-5 text-gray-500" />
                                                    <span>{formatDate(interview.scheduledAt)}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-700">
                                                    <Clock className="w-5 h-5 text-gray-500" />
                                                    <span>{formatTime(interview.scheduledAt)} WIB ({interview.duration} menit)</span>
                                                </div>
                                            </div>

                                            {interview.description && (
                                                <div className="bg-white bg-opacity-50 p-3 rounded-lg mb-4">
                                                    <p className="text-sm text-gray-700">{interview.description}</p>
                                                </div>
                                            )}

                                            <div className="flex flex-wrap gap-3">
                                                <button
                                                    onClick={() => handleRespond(interview.participantId, 'ACCEPTED')}
                                                    className="flex-1 min-w-[150px] bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 transition font-semibold shadow-lg flex items-center justify-center gap-2"
                                                >
                                                    <CheckCircle className="w-5 h-5" />
                                                    Saya Akan Hadir
                                                </button>
                                                <button
                                                    onClick={() => handleRespond(interview.participantId, 'RESCHEDULE_REQUESTED')}
                                                    className="flex-1 min-w-[150px] bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-3 rounded-lg hover:from-orange-600 hover:to-amber-600 transition font-semibold shadow-lg flex items-center justify-center gap-2"
                                                >
                                                    <RefreshCw className="w-5 h-5" />
                                                    Minta Reschedule
                                                </button>
                                                <button
                                                    onClick={() => handleRespond(interview.participantId, 'DECLINED')}
                                                    className="flex-1 min-w-[150px] bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 transition font-semibold shadow-lg flex items-center justify-center gap-2"
                                                >
                                                    <XCircle className="w-5 h-5" />
                                                    Tidak Bisa
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Reschedule Requested */}
                {filteredData.responded.filter(i => i.status === 'RESCHEDULE_REQUESTED').length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <RefreshCw className="w-6 h-6 text-orange-600" />
                            Menunggu Reschedule ({filteredData.responded.filter(i => i.status === 'RESCHEDULE_REQUESTED').length})
                        </h2>
                        <div className="space-y-4">
                            {filteredData.responded.filter(i => i.status === 'RESCHEDULE_REQUESTED').map((interview) => (
                                <div key={interview.participantId} className="bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-300 rounded-2xl p-6 shadow-lg">
                                    <div className="flex flex-col md:flex-row gap-6">
                                        <div className="flex-shrink-0">
                                            <div className="w-16 h-16 bg-gradient-to-br from-[#03587f] to-[#024666] rounded-xl flex items-center justify-center text-3xl overflow-hidden">
                                                {interview.jobs?.company?.logo ? (
                                                    <img src={interview.jobs.company.logo} alt={interview.jobs.company.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    '🏢'
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <h3 className="text-xl font-bold text-gray-900 mb-1">{interview.jobs?.title || interview.title}</h3>
                                                    <div className="flex items-center gap-2 text-gray-700">
                                                        <Building2 className="w-4 h-4" />
                                                        <span className="font-semibold">{interview.jobs?.company?.name || 'Perusahaan'}</span>
                                                    </div>
                                                </div>
                                                <span className="px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-bold flex items-center gap-1">
                                                    <RefreshCw className="w-4 h-4" />
                                                    Menunggu Reschedule
                                                </span>
                                            </div>

                                            <div className="bg-orange-100 border border-orange-200 rounded-lg p-4">
                                                <p className="text-sm text-orange-800">
                                                    <strong>⏳ Permintaan reschedule telah dikirim</strong><br />
                                                    Tunggu konfirmasi dari rekruter untuk jadwal baru.
                                                </p>
                                                {interview.responseMessage && (
                                                    <p className="text-sm text-orange-700 mt-2">
                                                        <strong>Alasan Anda:</strong> {interview.responseMessage}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Confirmed/Upcoming Interviews */}
                {filteredData.responded.filter(i => i.status === 'ACCEPTED').length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Interview Terkonfirmasi</h2>
                        <div className="space-y-4">
                            {filteredData.responded.filter(i => i.status === 'ACCEPTED').map((interview) => (
                                <div key={interview.participantId} className="bg-white rounded-2xl shadow-lg p-6 border-2 border-green-200">
                                    <div className="flex flex-col md:flex-row gap-6">
                                        <div className="flex-shrink-0">
                                            <div className="w-16 h-16 bg-gradient-to-br from-[#03587f] to-[#024666] rounded-xl flex items-center justify-center text-3xl overflow-hidden">
                                                {interview.jobs?.company?.logo ? (
                                                    <img src={interview.jobs.company.logo} alt={interview.jobs.company.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    '🏢'
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <h3 className="text-xl font-bold text-gray-900 mb-1">{interview.jobs?.title || interview.title}</h3>
                                                    <div className="flex items-center gap-2 text-gray-700">
                                                        <Building2 className="w-4 h-4" />
                                                        <span className="font-semibold">{interview.jobs?.company?.name || 'Perusahaan'}</span>
                                                    </div>
                                                </div>
                                                <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-bold flex items-center gap-1">
                                                    <CheckCircle className="w-4 h-4" />
                                                    Terkonfirmasi
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                                <div className="flex items-center gap-2 text-gray-700">
                                                    <Calendar className="w-5 h-5 text-gray-500" />
                                                    <span>{formatDate(interview.scheduledAt)}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-700">
                                                    <Clock className="w-5 h-5 text-gray-500" />
                                                    <span>{formatTime(interview.scheduledAt)} WIB</span>
                                                </div>
                                            </div>

                                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                                <p className="text-sm text-blue-900 mb-2">
                                                    <strong>⏰ {getTimeUntil(interview.scheduledAt)}</strong>
                                                </p>
                                                {canJoinNow(interview.scheduledAt) && (
                                                    <p className="text-xs text-blue-700">
                                                        ✓ Anda sudah bisa bergabung sekarang
                                                    </p>
                                                )}
                                            </div>

                                            {canJoinNow(interview.scheduledAt) ? (
                                                <a href={interview.meetingUrl} target="_blank" rel="noopener noreferrer">
                                                    <button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 transition font-semibold shadow-lg flex items-center justify-center gap-2">
                                                        <Video className="w-5 h-5" />
                                                        Masuk Room Interview
                                                        <ExternalLink className="w-4 h-4" />
                                                    </button>
                                                </a>
                                            ) : (
                                                <button disabled className="w-full bg-gray-300 text-gray-600 px-6 py-3 rounded-lg cursor-not-allowed font-semibold flex items-center justify-center gap-2">
                                                    <Video className="w-5 h-5" />
                                                    Belum Waktunya (15 menit sebelum)
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Declined Interviews */}
                {filteredData.responded.filter(i => i.status === 'DECLINED').length > 0 && activeFilter === 'declined' && (
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Interview Ditolak</h2>
                        <div className="space-y-4">
                            {filteredData.responded.filter(i => i.status === 'DECLINED').map((interview) => (
                                <div key={interview.participantId} className="bg-gray-100 rounded-2xl p-6 border border-gray-300">
                                    <div className="flex flex-col md:flex-row gap-6">
                                        <div className="flex-shrink-0">
                                            <div className="w-16 h-16 bg-gray-300 rounded-xl flex items-center justify-center text-3xl overflow-hidden grayscale">
                                                {interview.jobs?.company?.logo ? (
                                                    <img src={interview.jobs.company.logo} alt={interview.jobs.company.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    '🏢'
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <h3 className="text-xl font-bold text-gray-600 mb-1">{interview.jobs?.title || interview.title}</h3>
                                                    <div className="flex items-center gap-2 text-gray-500">
                                                        <Building2 className="w-4 h-4" />
                                                        <span>{interview.jobs?.company?.name || 'Perusahaan'}</span>
                                                    </div>
                                                </div>
                                                <span className="px-4 py-2 bg-gray-200 text-gray-600 rounded-full text-sm font-bold flex items-center gap-1">
                                                    <XCircle className="w-4 h-4" />
                                                    Ditolak
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* No Interviews */}
                {interviews.length === 0 && (
                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                        <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Belum Ada Interview</h3>
                        <p className="text-gray-600 mb-6">
                           Anda belum memiliki jadwal interview. Terus lamar pekerjaan untuk mendapatkan interview!
                        </p>
                        <Link href="/jobs">
                            <button className="bg-gradient-to-r from-[#03587f] to-[#024666] text-white px-6 py-3 rounded-lg hover:from-[#024666] hover:to-[#013344] transition font-semibold">
                                Cari Lowongan
                            </button>
                        </Link>
                    </div>
                )}

                {/* No results for filter */}
                {interviews.length > 0 && filteredData.pending.length === 0 && filteredData.responded.length === 0 && (
                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                        <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Tidak Ada Data</h3>
                        <p className="text-gray-600">
                           Tidak ada interview dengan filter yang dipilih.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
