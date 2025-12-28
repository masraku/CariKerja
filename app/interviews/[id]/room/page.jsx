'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Swal from 'sweetalert2'
import {
    Video,
    Clock,
    Calendar,
    Building2,
    User,
    AlertCircle,
    CheckCircle,
    Loader2,
    ArrowLeft,
    ExternalLink
} from 'lucide-react'

export default function InterviewRoomPage() {
    const params = useParams()
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [interview, setInterview] = useState(null)
    const [timing, setTiming] = useState(null)
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    })

    useEffect(() => {
        loadInterviewRoom()
    }, [])

    // Countdown timer
    useEffect(() => {
        if (!timing) return

        const timer = setInterval(() => {
            const now = new Date()
            const scheduled = new Date(timing.scheduledAt)
            const diff = scheduled - now

            if (diff <= 0) {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
            } else {
                const days = Math.floor(diff / (1000 * 60 * 60 * 24))
                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
                const seconds = Math.floor((diff % (1000 * 60)) / 1000)
                setTimeLeft({ days, hours, minutes, seconds })
            }
        }, 1000)

        return () => clearInterval(timer)
    }, [timing])

    const loadInterviewRoom = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem('token')

            const response = await fetch(`/api/interviews/${params.id}/room`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            const data = await response.json()

            if (data.success) {
                setInterview(data.data.interview)
                setTiming(data.data.timing)
            } else {
                throw new Error(data.error)
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Gagal',
                text: error.message || 'Gagal memuat interview room'
            }).then(() => {
                router.push('/profile/jobseeker/interviews')
            })
        } finally {
            setLoading(false)
        }
    }

    const handleJoinMeeting = () => {
        if (!timing?.canAccess) {
            Swal.fire({
                icon: 'warning',
                title: 'Belum Waktunya',
                text: 'Anda bisa join 15 menit sebelum jadwal interview'
            })
            return
        }

        // Open Google Meet in new tab
        window.open(interview.meetingUrl, '_blank')

        // Optional: Mark as completed after joining
        Swal.fire({
            title: 'Selamat Interview!',
            text: 'Apakah interview sudah selesai?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Ya, Selesai',
            cancelButtonText: 'Belum',
            showDenyButton: false
        }).then((result) => {
            if (result.isConfirmed) {
                markAsCompleted()
            }
        })
    }

    const markAsCompleted = async () => {
        try {
            const token = localStorage.getItem('token')

            await fetch(`/api/interviews/${params.id}/room`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ action: 'mark_completed' })
            })

            Swal.fire({
                icon: 'success',
                title: 'Terima Kasih!',
                text: 'Interview telah ditandai selesai. Semoga berhasil!',
                timer: 2000
            }).then(() => {
                router.push('/profile/jobseeker/interviews')
            })
        } catch (error) {
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

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
                <div className="text-center">
                    <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">Memuat interview room...</p>
                </div>
            </div>
        )
    }

    if (!interview || !timing) {
        return null
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Back Button */}
                <Link href="/profile/jobseeker/interviews">
                    <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition mb-6">
                        <ArrowLeft className="w-5 h-5" />
                        Kembali ke Interview Saya
                    </button>
                </Link>

                {/* Main Card */}
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-[#03587f] to-[#024666] text-white p-8">
                        <div className="flex items-center gap-3 mb-4">
                            <Video className="w-8 h-8" />
                            <h1 className="text-3xl font-bold">Interview Room</h1>
                        </div>
                        <p className="text-blue-100">Bersiaplah untuk interview Anda</p>
                    </div>

                    {/* Content */}
                    <div className="p-8">
                        {/* Interview Details */}
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">{interview.title}</h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                    <Calendar className="w-6 h-6 text-blue-600" />
                                    <div>
                                        <p className="text-sm text-gray-600">Tanggal</p>
                                        <p className="font-semibold text-gray-900">{formatDate(interview.scheduledAt)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                    <Clock className="w-6 h-6 text-blue-600" />
                                    <div>
                                        <p className="text-sm text-gray-600">Waktu</p>
                                        <p className="font-semibold text-gray-900">{formatTime(interview.scheduledAt)} WIB</p>
                                    </div>
                                </div>
                            </div>

                            {interview.description && (
                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                                    <p className="text-sm font-semibold text-blue-900 mb-2">📝 Catatan dari Rekruter:</p>
                                    <p className="text-gray-700">{interview.description}</p>
                                </div>
                            )}
                        </div>

                        {/* Countdown Timer */}
                        {!timing.canAccess && !timing.isPast && (
                            <div className="mb-8">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">
                                    ⏰ Interview Dimulai Dalam
                                </h3>
                                <div className="grid grid-cols-4 gap-4 mb-4">
                                    {[
                                        { label: 'Hari', value: timeLeft.days },
                                        { label: 'Jam', value: timeLeft.hours },
                                        { label: 'Menit', value: timeLeft.minutes },
                                        { label: 'Detik', value: timeLeft.seconds }
                                    ].map((item) => (
                                        <div key={item.label} className="bg-gradient-to-br from-[#03587f] to-[#024666] rounded-2xl p-6 text-center">
                                            <div className="text-4xl font-bold text-white mb-2">
                                                {item.value.toString().padStart(2, '0')}
                                            </div>
                                            <div className="text-blue-100 text-sm">{item.label}</div>
                                        </div>
                                    ))}
                                </div>
                                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                                    <p className="text-yellow-800 text-center">
                                        <AlertCircle className="w-5 h-5 inline mr-2" />
                                        Anda dapat bergabung 15 menit sebelum waktu yang ditentukan
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Access Granted */}
                        {timing.canAccess && !timing.isPast && (
                            <div className="mb-8">
                                <div className="bg-green-50 border-2 border-green-400 rounded-2xl p-6 text-center mb-6">
                                    <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                                    <h3 className="text-2xl font-bold text-green-900 mb-2">
                                        Siap untuk Interview!
                                    </h3>
                                    <p className="text-green-700">
                                        Anda sudah bisa bergabung ke meeting sekarang
                                    </p>
                                </div>

                                <button
                                    onClick={handleJoinMeeting}
                                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-6 rounded-2xl hover:from-green-700 hover:to-emerald-700 transition font-bold text-xl shadow-2xl flex items-center justify-center gap-3 animate-pulse"
                                >
                                    <Video className="w-8 h-8" />
                                    Join Google Meet Sekarang
                                    <ExternalLink className="w-6 h-6" />
                                </button>

                                <div className="mt-6 bg-blue-50 rounded-xl p-4">
                                    <p className="text-sm text-blue-900 font-semibold mb-2">💡 Tips Interview:</p>
                                    <ul className="text-sm text-blue-800 space-y-1">
                                        <li>✓ Pastikan webcam dan microphone berfungsi</li>
                                        <li>✓ Cari ruangan yang tenang dan pencahayaan baik</li>
                                        <li>✓ Siapkan CV dan dokumen pendukung</li>
                                        <li>✓ Bersikap profesional dan percaya diri</li>
                                    </ul>
                                </div>
                            </div>
                        )}

                        {/* Past Interview */}
                        {timing.isPast && (
                            <div className="bg-gray-50 border border-gray-300 rounded-2xl p-8 text-center">
                                <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    Interview Telah Berakhir
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    Waktu interview sudah lewat lebih dari 1 jam
                                </p>
                                <Link href="/profile/jobseeker/interviews">
                                    <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
                                        Lihat Interview Lainnya
                                    </button>
                                </Link>
                            </div>
                        )}

                        {/* Meeting Link (always visible for reference) */}
                        <div className="mt-6 border-t pt-6">
                            <p className="text-sm text-gray-600 mb-2">Link Google Meet:</p>
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={interview.meetingUrl}
                                    readOnly
                                    className="flex-1 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
                                />
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(interview.meetingUrl)
                                        Swal.fire({
                                            icon: 'success',
                                            title: 'Tersalin!',
                                            text: 'Link berhasil disalin',
                                            timer: 1500,
                                            showConfirmButton: false
                                        })
                                    }}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                                >
                                    Copy
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
