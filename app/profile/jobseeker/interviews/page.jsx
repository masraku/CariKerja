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
    Bell
} from 'lucide-react'

export default function JobseekerInterviewsPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [interviews, setInterviews] = useState([])
    const [pending, setPending] = useState([])
    const [responded, setResponded] = useState([])
    const [stats, setStats] = useState(null)

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
            console.error('Load interviews error:', error)
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

        const result = await Swal.fire({
            title: isAccept ? 'Terima Interview?' : 'Tolak Interview?',
            text: isAccept 
                ? 'Anda akan mengkonfirmasi kehadiran untuk interview ini'
                : 'Anda yakin ingin menolak interview ini?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: isAccept ? 'Ya, Saya Akan Hadir' : 'Ya, Tolak',
            cancelButtonText: 'Batal',
            confirmButtonColor: isAccept ? '#10b981' : '#ef4444',
            input: isAccept ? null : 'textarea',
            inputPlaceholder: isAccept ? null : 'Alasan menolak (opsional)',
            inputAttributes: isAccept ? null : {
                maxLength: 500
            }
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
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil!',
                    text: isAccept 
                        ? 'Konfirmasi kehadiran berhasil. Recruiter akan menerima notifikasi.'
                        : 'Interview berhasil ditolak',
                    timer: 2000,
                    showConfirmButton: false
                })
                loadInterviews()
            } else {
                const data = await response.json()
                throw new Error(data.error)
            }
        } catch (error) {
            console.error('Respond error:', error)
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

                {/* Stats */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm">Total Interview</p>
                                    <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                                </div>
                                <Calendar className="w-10 h-10 text-blue-600" />
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl shadow-sm p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-yellow-700 text-sm font-medium">Menunggu Respon</p>
                                    <p className="text-3xl font-bold text-yellow-900">{stats.pending}</p>
                                </div>
                                <Bell className="w-10 h-10 text-yellow-600" />
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl shadow-sm p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-green-700 text-sm font-medium">Dikonfirmasi</p>
                                    <p className="text-3xl font-bold text-green-900">{stats.accepted}</p>
                                </div>
                                <CheckCircle className="w-10 h-10 text-green-600" />
                            </div>
                        </div>
                        <div className="bg-gray-100 rounded-xl shadow-sm p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm">Ditolak</p>
                                    <p className="text-3xl font-bold text-gray-900">{stats.declined}</p>
                                </div>
                                <XCircle className="w-10 h-10 text-gray-400" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Pending Invitations */}
                {pending.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Bell className="w-6 h-6 text-yellow-600" />
                            Undangan Pending ({pending.length})
                        </h2>
                        <div className="space-y-4">
                            {pending.map((interview) => (
                                <div key={interview.participantId} className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-2xl p-6 shadow-lg">
                                    <div className="flex flex-col md:flex-row gap-6">
                                        {/* Company Logo */}
                                        <div className="flex-shrink-0">
                                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-3xl overflow-hidden">
                                                {interview.job.company.logo ? (
                                                    <img src={interview.job.company.logo} alt={interview.job.company.name} className="w-full h-full object-cover" />
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
                                                        {interview.job.title}
                                                    </h3>
                                                    <div className="flex items-center gap-2 text-gray-700">
                                                        <Building2 className="w-4 h-4" />
                                                        <span className="font-semibold">{interview.job.company.name}</span>
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

                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => handleRespond(interview.participantId, 'ACCEPTED')}
                                                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 transition font-semibold shadow-lg flex items-center justify-center gap-2"
                                                >
                                                    <CheckCircle className="w-5 h-5" />
                                                    Saya Akan Hadir
                                                </button>
                                                <button
                                                    onClick={() => handleRespond(interview.participantId, 'DECLINED')}
                                                    className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition font-semibold shadow-lg flex items-center justify-center gap-2"
                                                >
                                                    <XCircle className="w-5 h-5" />
                                                    Maaf, Saya Tidak Bisa
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Confirmed/Upcoming Interviews */}
                {responded.filter(i => i.status === 'ACCEPTED').length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Interview Terkonfirmasi</h2>
                        <div className="space-y-4">
                            {responded.filter(i => i.status === 'ACCEPTED').map((interview) => (
                                <div key={interview.participantId} className="bg-white rounded-2xl shadow-lg p-6 border-2 border-green-200">
                                    <div className="flex flex-col md:flex-row gap-6">
                                        <div className="flex-shrink-0">
                                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-3xl overflow-hidden">
                                                {interview.job.company.logo ? (
                                                    <img src={interview.job.company.logo} alt={interview.job.company.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    '🏢'
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <h3 className="text-xl font-bold text-gray-900 mb-1">{interview.job.title}</h3>
                                                    <div className="flex items-center gap-2 text-gray-700">
                                                        <Building2 className="w-4 h-4" />
                                                        <span className="font-semibold">{interview.job.company.name}</span>
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
                                                    <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition font-semibold shadow-lg flex items-center justify-center gap-2">
                                                        <Video className="w-5 h-5" />
                                                        Join Interview Sekarang
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

                {/* No Interviews */}
                {interviews.length === 0 && (
                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                        <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Belum Ada Interview</h3>
                        <p className="text-gray-600 mb-6">
                           Anda belum memiliki jadwal interview. Terus lamar pekerjaan untuk mendapatkan interview!
                        </p>
                        <Link href="/jobs">
                            <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition font-semibold">
                                Cari Lowongan
                            </button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}
