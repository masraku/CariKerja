'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Swal from 'sweetalert2'
import {
    ArrowLeft,
    Building2,
    MapPin,
    Calendar,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    FileText,
    ExternalLink,
    Video,
    Mail,
    Phone,
    Briefcase,
    GraduationCap,
    Star,
    TrendingUp,
    MessageSquare,
    Send,
    User,
    Eye
} from 'lucide-react'

export default function ApplicationDetailPage() {
    const router = useRouter()
    const params = useParams()
    const [loading, setLoading] = useState(true)
    const [application, setApplication] = useState(null)
    const [interview, setInterview] = useState(null)

    useEffect(() => {
        if (params.id) {
            loadApplicationDetail()
        }
    }, [params.id])

    const loadApplicationDetail = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem('token')

            const response = await fetch(`/api/profile/jobseeker/applications/${params.id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok) {
                const data = await response.json()
                // API returns data in data field
                const appData = data.data || data.application
                setApplication(appData)
                
                // If has interview from the response
                if (appData.interview) {
                    loadInterviewDetail(appData.id)
                } else if (appData.status === 'INTERVIEW_SCHEDULED' || 
                    appData.status === 'INTERVIEW_COMPLETED') {
                    loadInterviewDetail(appData.id)
                }
            } else {
                throw new Error('Failed to load application')
            }
        } catch (error) {
            console.error('Load error:', error)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Gagal memuat detail lamaran'
            })
        } finally {
            setLoading(false)
        }
    }

    const loadInterviewDetail = async (applicationId) => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`/api/profile/jobseeker/applications/${applicationId}/interview`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok) {
                const data = await response.json()
                setInterview(data.interview)
            }
        } catch (error) {
            console.error('Load interview error:', error)
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

    const getStatusConfig = (status) => {
        const configs = {
            PENDING: {
                label: 'Menunggu Review',
                color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
                bgGradient: 'from-yellow-50 to-orange-50',
                icon: Clock,
                iconColor: 'text-yellow-600',
                description: 'Lamaran Anda sedang dalam antrian untuk ditinjau oleh tim rekrutmen.',
                tips: ['Pastikan profil Anda lengkap', 'Periksa email secara berkala', 'Siapkan dokumen pendukung']
            },
            REVIEWING: {
                label: 'Sedang Ditinjau',
                color: 'bg-blue-100 text-blue-800 border-blue-300',
                bgGradient: 'from-blue-50 to-indigo-50',
                icon: Eye,
                iconColor: 'text-blue-600',
                description: 'Tim rekrutmen sedang meninjau lamaran dan profil Anda.',
                tips: ['Lamaran Anda sedang diproses', 'Pastikan nomor telepon aktif', 'Cek spam folder email']
            },
            SHORTLISTED: {
                label: 'Masuk Shortlist',
                color: 'bg-purple-100 text-purple-800 border-purple-300',
                bgGradient: 'from-purple-50 to-pink-50',
                icon: Star,
                iconColor: 'text-purple-600',
                description: 'Selamat! Anda masuk dalam daftar kandidat terpilih.',
                tips: ['Persiapkan diri untuk interview', 'Pelajari tentang perusahaan', 'Siapkan pertanyaan']
            },
            INTERVIEW_SCHEDULED: {
                label: 'Interview Dijadwalkan',
                color: 'bg-indigo-100 text-indigo-800 border-indigo-300',
                bgGradient: 'from-indigo-50 to-blue-50',
                icon: Video,
                iconColor: 'text-indigo-600',
                description: 'Interview telah dijadwalkan! Periksa detail di bawah ini.',
                tips: ['Pastikan koneksi internet stabil', 'Test kamera dan mikrofon', 'Siapkan tempat yang tenang']
            },
            INTERVIEW_COMPLETED: {
                label: 'Interview Selesai',
                color: 'bg-teal-100 text-teal-800 border-teal-300',
                bgGradient: 'from-teal-50 to-cyan-50',
                icon: CheckCircle,
                iconColor: 'text-teal-600',
                description: 'Interview telah selesai. Tunggu hasil dari recruiter.',
                tips: ['Kirim email terima kasih', 'Tetap pantau email', 'Persiapkan untuk tahap selanjutnya']
            },
            ACCEPTED: {
                label: 'Diterima! 🎉',
                color: 'bg-green-100 text-green-800 border-green-300',
                bgGradient: 'from-green-50 to-emerald-50',
                icon: CheckCircle,
                iconColor: 'text-green-600',
                description: 'Selamat! Anda diterima untuk posisi ini!',
                tips: ['Segera hubungi recruiter', 'Siapkan dokumen yang diperlukan', 'Diskusikan tanggal mulai kerja']
            },
            REJECTED: {
                label: 'Tidak Lolos',
                color: 'bg-red-100 text-red-800 border-red-300',
                bgGradient: 'from-red-50 to-pink-50',
                icon: XCircle,
                iconColor: 'text-red-600',
                description: 'Maaf, lamaran Anda tidak dapat dilanjutkan untuk posisi ini.',
                tips: ['Jangan menyerah!', 'Coba posisi lain', 'Tingkatkan skill Anda']
            },
            WITHDRAWN: {
                label: 'Ditarik',
                color: 'bg-gray-100 text-gray-800 border-gray-300',
                bgGradient: 'from-gray-50 to-slate-50',
                icon: AlertCircle,
                iconColor: 'text-gray-600',
                description: 'Lamaran telah ditarik.',
                tips: []
            }
        }
        return configs[status] || configs.PENDING
    }

    const getTimelineSteps = () => {
        const steps = [
            { key: 'applied', label: 'Lamaran Dikirim', date: application?.appliedAt, completed: true },
            { key: 'reviewing', label: 'Ditinjau', date: application?.reviewedAt, completed: ['REVIEWING', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'INTERVIEW_COMPLETED', 'ACCEPTED', 'REJECTED'].includes(application?.status) },
            { key: 'interview', label: 'Interview', date: interview?.scheduledAt, completed: ['INTERVIEW_SCHEDULED', 'INTERVIEW_COMPLETED', 'ACCEPTED'].includes(application?.status) },
            { key: 'result', label: 'Hasil', date: application?.status === 'ACCEPTED' || application?.status === 'REJECTED' ? new Date() : null, completed: ['ACCEPTED', 'REJECTED'].includes(application?.status) }
        ]
        return steps
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Memuat detail lamaran...</p>
                </div>
            </div>
        )
    }

    if (!application) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Lamaran Tidak Ditemukan</h2>
                    <Link href="/profile/jobseeker/applications">
                        <button className="text-blue-600 hover:underline">
                            Kembali ke Daftar Lamaran
                        </button>
                    </Link>
                </div>
            </div>
        )
    }

    const statusConfig = getStatusConfig(application.status)
    const StatusIcon = statusConfig.icon
    const timelineSteps = getTimelineSteps()

    return (
        <div className={`min-h-screen bg-gradient-to-br ${statusConfig.bgGradient} py-8`}>
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Back Button */}
                <Link href="/profile/jobseeker/applications">
                    <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition mb-6">
                        <ArrowLeft className="w-5 h-5" />
                        Kembali ke Daftar Lamaran
                    </button>
                </Link>

                {/* Main Status Card */}
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-6">
                    {/* Status Header */}
                    <div className={`bg-gradient-to-r ${statusConfig.bgGradient} p-8 border-b`}>
                        <div className="flex items-center gap-6">
                            {/* Company Logo */}
                            <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center overflow-hidden">
                                {application.jobs?.companies?.logo ? (
                                    <img 
                                        src={application.jobs.companies.logo} 
                                        alt={application.jobs.companies.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <Building2 className="w-10 h-10 text-gray-400" />
                                )}
                            </div>

                            <div className="flex-1">
                                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                                    {application.jobs?.title}
                                </h1>
                                <p className="text-lg text-gray-700 mb-2">
                                    {application.jobs?.companies?.name}
                                </p>
                                <div className="flex items-center gap-4 text-gray-600">
                                    <span className="flex items-center gap-1">
                                        <MapPin className="w-4 h-4" />
                                        {application.jobs?.location || application.jobs?.city}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        Dilamar {formatDate(application.appliedAt)}
                                    </span>
                                </div>
                            </div>

                            {/* Status Badge */}
                            <div className={`px-6 py-3 rounded-2xl border-2 ${statusConfig.color} flex items-center gap-2`}>
                                <StatusIcon className={`w-6 h-6 ${statusConfig.iconColor}`} />
                                <span className="font-bold text-lg">{statusConfig.label}</span>
                            </div>
                        </div>
                    </div>

                    {/* Status Description */}
                    <div className="p-6 bg-white">
                        <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${statusConfig.color}`}>
                                <StatusIcon className={`w-6 h-6 ${statusConfig.iconColor}`} />
                            </div>
                            <div className="flex-1">
                                <p className="text-gray-700 text-lg">{statusConfig.description}</p>
                                
                                {/* Tips */}
                                {statusConfig.tips.length > 0 && (
                                    <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                                        <p className="font-semibold text-gray-800 mb-2">💡 Tips:</p>
                                        <ul className="space-y-1">
                                            {statusConfig.tips.map((tip, index) => (
                                                <li key={index} className="text-gray-600 flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                                                    {tip}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Interview Card - Show if interview scheduled */}
                {interview && (application.status === 'INTERVIEW_SCHEDULED' || application.status === 'INTERVIEW_COMPLETED') && (
                    <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-6">
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Video className="w-6 h-6" />
                                Detail Interview
                            </h2>
                        </div>
                        <div className="p-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <p className="text-gray-500 text-sm mb-1">Judul Interview</p>
                                    <p className="text-lg font-semibold text-gray-900">{interview.title}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm mb-1">Tipe Meeting</p>
                                    <p className="text-lg font-semibold text-gray-900">{interview.meetingType}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm mb-1">Tanggal & Waktu</p>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {formatDate(interview.scheduledAt)} - {formatTime(interview.scheduledAt)} WIB
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm mb-1">Durasi</p>
                                    <p className="text-lg font-semibold text-gray-900">{interview.duration} menit</p>
                                </div>
                            </div>

                            {interview.description && (
                                <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                                    <p className="text-gray-500 text-sm mb-1">Catatan dari Recruiter</p>
                                    <p className="text-gray-800">{interview.description}</p>
                                </div>
                            )}

                            {/* Join Meeting Button */}
                            {application.status === 'INTERVIEW_SCHEDULED' && interview.meetingUrl && (
                                <div className="mt-6">
                                    <a 
                                        href={interview.meetingUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="block"
                                    >
                                        <button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-2xl font-bold text-lg hover:from-green-700 hover:to-emerald-700 transition shadow-lg flex items-center justify-center gap-3">
                                            <Video className="w-6 h-6" />
                                            Masuk Room Interview
                                            <ExternalLink className="w-5 h-5" />
                                        </button>
                                    </a>
                                    <p className="text-center text-gray-500 text-sm mt-2">
                                        Klik untuk bergabung ke Google Meet
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Timeline */}
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-6">
                    <div className="p-6 border-b">
                        <h2 className="text-xl font-bold text-gray-900">Timeline Lamaran</h2>
                    </div>
                    <div className="p-6">
                        <div className="relative">
                            {timelineSteps.map((step, index) => (
                                <div key={step.key} className="flex items-start gap-4 mb-6 last:mb-0">
                                    {/* Line */}
                                    <div className="relative">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                            step.completed 
                                                ? 'bg-green-500 text-white' 
                                                : 'bg-gray-200 text-gray-400'
                                        }`}>
                                            {step.completed ? (
                                                <CheckCircle className="w-5 h-5" />
                                            ) : (
                                                <span className="text-sm font-bold">{index + 1}</span>
                                            )}
                                        </div>
                                        {index < timelineSteps.length - 1 && (
                                            <div className={`absolute top-10 left-1/2 w-0.5 h-12 -translate-x-1/2 ${
                                                step.completed ? 'bg-green-500' : 'bg-gray-200'
                                            }`}></div>
                                        )}
                                    </div>
                                    
                                    {/* Content */}
                                    <div className="flex-1 pb-6">
                                        <p className={`font-semibold ${step.completed ? 'text-gray-900' : 'text-gray-400'}`}>
                                            {step.label}
                                        </p>
                                        {step.date && step.completed && (
                                            <p className="text-sm text-gray-500">
                                                {formatDate(step.date)}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Application Details */}
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-6">
                    <div className="p-6 border-b">
                        <h2 className="text-xl font-bold text-gray-900">Detail Lamaran</h2>
                    </div>
                    <div className="p-6 space-y-6">
                        {/* Cover Letter */}
                        {application.coverLetter && (
                            <div>
                                <p className="text-gray-500 text-sm mb-2 flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4" />
                                    Cover Letter
                                </p>
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <p className="text-gray-700 whitespace-pre-wrap">{application.coverLetter}</p>
                                </div>
                            </div>
                        )}

                        {/* Resume */}
                        {application.jobseekers?.cvUrl && (
                            <div>
                                <p className="text-gray-500 text-sm mb-2 flex items-center gap-2">
                                    <FileText className="w-4 h-4" />
                                    CV / Resume
                                </p>
                                <a 
                                    href={application.jobseekers.cvUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition"
                                >
                                    <FileText className="w-5 h-5" />
                                    Lihat CV
                                    <ExternalLink className="w-4 h-4" />
                                </a>
                            </div>
                        )}

                        {/* Recruiter Notes */}
                        {application.recruiterNotes && (
                            <div>
                                <p className="text-gray-500 text-sm mb-2 flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    Catatan dari Recruiter
                                </p>
                                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                                    <p className="text-blue-800">{application.recruiterNotes}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Job Details */}
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                    <div className="p-6 border-b">
                        <h2 className="text-xl font-bold text-gray-900">Tentang Lowongan</h2>
                    </div>
                    <div className="p-6">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                <Briefcase className="w-5 h-5 text-gray-500" />
                                <div>
                                    <p className="text-xs text-gray-500">Tipe Pekerjaan</p>
                                    <p className="font-semibold text-gray-900">{application.jobs?.jobType}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                <TrendingUp className="w-5 h-5 text-gray-500" />
                                <div>
                                    <p className="text-xs text-gray-500">Level</p>
                                    <p className="font-semibold text-gray-900">{application.jobs?.level}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                <MapPin className="w-5 h-5 text-gray-500" />
                                <div>
                                    <p className="text-xs text-gray-500">Lokasi</p>
                                    <p className="font-semibold text-gray-900">{application.jobs?.location || `${application.jobs?.city}, ${application.jobs?.province}`}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                <Building2 className="w-5 h-5 text-gray-500" />
                                <div>
                                    <p className="text-xs text-gray-500">Perusahaan</p>
                                    <p className="font-semibold text-gray-900">{application.jobs?.companies?.name}</p>
                                </div>
                            </div>
                        </div>

                        <Link href={`/jobs/${application.jobs?.slug}`}>
                            <button className="w-full mt-6 py-3 border-2 border-blue-600 text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition flex items-center justify-center gap-2">
                                <Eye className="w-5 h-5" />
                                Lihat Detail Lowongan
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
