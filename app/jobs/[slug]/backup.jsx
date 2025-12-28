'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import {
    Briefcase,
    MapPin,
    DollarSign,
    Clock,
    Users,
    Building2,
    Calendar,
    Eye,
    Share2,
    CheckCircle,
    Award,
    TrendingUp,
    Globe,
    ArrowLeft,
    UserCheck,
    Video
} from 'lucide-react'
import Swal from 'sweetalert2'

export default function JobDetailPage() {
    const params = useParams()
    const router = useRouter()
    const { user, isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(true)
    const [job, setJob] = useState(null)
    const [relatedJobs, setRelatedJobs] = useState([])
    const [applicants, setApplicants] = useState([])
    const [selectedApplicants, setSelectedApplicants] = useState([])

    // Check if current user is the recruiter who posted this job
    const isJobOwner = user?.role === 'RECRUITER' && job?.recruiter?.id === user?.recruiter?.id

    useEffect(() => {
        if (params?.slug) {
            loadJobDetails()
        }
    }, [params?.slug])

    // Load applicants if user is recruiter
    useEffect(() => {
        if (job && isJobOwner) {
            loadApplicants()
        }
    }, [job, isJobOwner])

    const loadJobDetails = async () => {
        try {
            setLoading(true)
            const response = await fetch(`/api/jobs/${params.slug}`)

            if (response.ok) {
                const data = await response.json()
                setJob(data.job)
                setRelatedJobs(data.relatedJobs)
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Job Not Found',
                    text: 'Lowongan tidak ditemukan',
                    confirmButtonColor: '#2563EB'
                }).then(() => {
                    router.push(user?.role === 'RECRUITER' ? '/recruiter/dashboard' : '/jobs')
                })
            }
        } catch (error) {
        } finally {
            setLoading(false)
        }
    }

    const loadApplicants = async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`/api/jobs/${params.slug}/applicants`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok) {
                const data = await response.json()
                setApplicants(data.applicants)
            }
        } catch (error) {
        }
    }

    // Helper functions remain the same
    const formatSalary = (min, max, type) => {
        const formatNumber = (num) => {
            return new Intl.NumberFormat('id-ID').format(num)
        }
        if (!min || !max) return 'Negotiable'
        const typeLabel = {
            monthly: '/ bulan',
            yearly: '/ tahun',
            hourly: '/ jam'
        }
        return `Rp ${formatNumber(min)} - Rp ${formatNumber(max)} ${typeLabel[type] || ''}`
    }

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })
    }

    const getTimeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000)
        let interval = seconds / 31536000
        if (interval > 1) return Math.floor(interval) + ' tahun lalu'
        interval = seconds / 2592000
        if (interval > 1) return Math.floor(interval) + ' bulan lalu'
        interval = seconds / 86400
        if (interval > 1) return Math.floor(interval) + ' hari lalu'
        interval = seconds / 3600
        if (interval > 1) return Math.floor(interval) + ' jam lalu'
        interval = seconds / 60
        if (interval > 1) return Math.floor(interval) + ' menit lalu'
        return 'Baru saja'
    }

    const getJobTypeLabel = (type) => {
        const labels = {
            FULL_TIME: 'Full Time',
            PART_TIME: 'Part Time',
            CONTRACT: 'Contract',
            INTERNSHIP: 'Magang'
        }
        return labels[type] || type
    }

    const getLevelLabel = (level) => {
        const labels = {
            ENTRY_LEVEL: 'Entry Level',
            JUNIOR: 'Junior',
            MID_LEVEL: 'Mid Level',
            SENIOR: 'Senior',
            LEAD: 'Lead',
            MANAGER: 'Manager',
            DIRECTOR: 'Director'
        }
        return labels[level] || level
    }

    const getStatusBadge = (status) => {
        const config = {
            PENDING: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
            REVIEWING: { label: 'Reviewing', color: 'bg-blue-100 text-blue-800' },
            SHORTLISTED: { label: 'Shortlisted', color: 'bg-purple-100 text-purple-800' },
            INTERVIEW_SCHEDULED: { label: 'Interview', color: 'bg-indigo-100 text-indigo-800' },
            ACCEPTED: { label: 'Accepted', color: 'bg-green-100 text-green-800' },
            REJECTED: { label: 'Rejected', color: 'bg-red-100 text-red-800' }
        }
        return config[status] || config.PENDING
    }

    const handleApply = async () => {
        if (!isAuthenticated) {
            Swal.fire({
                icon: 'info',
                title: 'Login Required',
                text: 'Silakan login terlebih dahulu untuk melamar',
                confirmButtonColor: '#2563EB'
            }).then(() => {
                router.push('/login?role=jobseeker')
            })
            return
        }

        if (user?.role !== 'JOBSEEKER') {
            Swal.fire({
                icon: 'warning',
                title: 'Access Denied',
                text: 'Hanya jobseeker yang bisa melamar pekerjaan',
                confirmButtonColor: '#2563EB'
            })
            return
        }

        // TODO: Implement apply functionality
        Swal.fire({
            icon: 'info',
            title: 'Coming Soon',
            text: 'Fitur apply akan segera tersedia!',
            confirmButtonColor: '#2563EB'
        })
    }

    const handleSelectApplicant = (applicantId) => {
        setSelectedApplicants(prev => {
            if (prev.includes(applicantId)) {
                return prev.filter(id => id !== applicantId)
            } else {
                return [...prev, applicantId]
            }
        })
    }

    const handleScheduleInterview = () => {
        if (selectedApplicants.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Pilih Pelamar',
                text: 'Silakan pilih minimal 1 pelamar untuk dijadwalkan interview',
                confirmButtonColor: '#2563EB'
            })
            return
        }

        // Redirect to interview scheduling page with selected applicants
        const applicantIds = selectedApplicants.join(',')
        router.push(`/recruiter/interviews/schedule?job=${job.id}&applicants=${applicantIds}`)
    }

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: job.title,
                text: `${job.title} at ${job.company.name}`,
                url: window.location.href
            })
        } else {
            navigator.clipboard.writeText(window.location.href)
            Swal.fire({
                icon: 'success',
                title: 'Link Copied!',
                text: 'Link lowongan telah disalin',
                timer: 1500,
                showConfirmButton: false
            })
        }
    }

    // Determine back URL based on user role
    const getBackUrl = () => {
        if (user?.role === 'RECRUITER') {
            return '/profile/recruiter/dashboard'
        }
        return '/jobs'
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading job details...</p>
                </div>
            </div>
        )
    }

    if (!job) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Job Not Found</h2>
                    <p className="text-gray-600 mb-4">Lowongan yang Anda cari tidak ditemukan</p>
                    <Link href={getBackUrl()} className="text-blue-600 hover:text-blue-700">
                        ← Kembali
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Back Button - Conditional based on role */}
                <Link
                    href={getBackUrl()}
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
                >
                    <ArrowLeft className="w-4 h-4" />
                    {user?.role === 'RECRUITER' ? 'Kembali ke Dashboard' : 'Kembali ke Daftar Lowongan'}
                </Link>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Job Header */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex gap-4 flex-1">
                                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-2xl flex-shrink-0 overflow-hidden">
                                        {job.company.logo ? (
                                            <img
                                                src={job.company.logo}
                                                alt={job.company.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            job.company.name.charAt(0)
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                            {job.title}
                                        </h1>
                                        <Link
                                            href={`/companies/${job.company.slug}`}
                                            className="text-xl text-blue-600 hover:text-blue-700 font-medium"
                                        >
                                            {job.company.name}
                                        </Link>
                                        <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-600">
                                            <div className="flex items-center gap-1">
                                                <MapPin className="w-4 h-4" />
                                                {job.city}, {job.province}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Briefcase className="w-4 h-4" />
                                                {getJobTypeLabel(job.jobType)}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <TrendingUp className="w-4 h-4" />
                                                {getLevelLabel(job.level)}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Eye className="w-4 h-4" />
                                                {job.viewCount} views
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={handleShare}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                                    title="Share"
                                >
                                    <Share2 className="w-5 h-5 text-gray-600" />
                                </button>
                            </div>

                            {/* Salary & Quick Info */}
                            <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t border-gray-200">
                                {job.showSalary && (
                                    <div className="flex-1 min-w-[200px]">
                                        <div className="flex items-center gap-2 text-gray-600 mb-1">
                                            <DollarSign className="w-4 h-4" />
                                            <span className="text-sm">Salary</span>
                                        </div>
                                        <p className="font-semibold text-gray-900">
                                            {formatSalary(job.salaryMin, job.salaryMax, job.salaryType)}
                                        </p>
                                    </div>
                                )}

                                <div className="flex-1 min-w-[200px]">
                                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                                        <Calendar className="w-4 h-4" />
                                        <span className="text-sm">Posted</span>
                                    </div>
                                    <p className="font-semibold text-gray-900">
                                        {getTimeAgo(job.createdAt)}
                                    </p>
                                </div>

                                {job.applicationDeadline && (
                                    <div className="flex-1 min-w-[200px]">
                                        <div className="flex items-center gap-2 text-gray-600 mb-1">
                                            <Clock className="w-4 h-4" />
                                            <span className="text-sm">Deadline</span>
                                        </div>
                                        <p className="font-semibold text-gray-900">
                                            {formatDate(job.applicationDeadline)}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Apply Button - Only for Jobseekers */}
                            {user?.role !== 'RECRUITER' && (
                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <button
                                        onClick={handleApply}
                                        className="w-full py-3 px-6 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle className="w-5 h-5" />
                                        Lamar Sekarang
                                    </button>
                                    <p className="text-center text-sm text-gray-600 mt-2">
                                        {job._count.applications} orang telah melamar
                                    </p>
                                </div>
                            )}

                            {/* Recruiter Stats */}
                            {isJobOwner && (
                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <div className="grid grid-cols-3 gap-4 text-center">
                                        <div className="p-4 bg-blue-50 rounded-lg">
                                            <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                                            <p className="text-2xl font-bold text-gray-900">{job._count.applications}</p>
                                            <p className="text-sm text-gray-600">Total Pelamar</p>
                                        </div>
                                        <div className="p-4 bg-green-50 rounded-lg">
                                            <UserCheck className="w-6 h-6 text-green-600 mx-auto mb-2" />
                                            <p className="text-2xl font-bold text-gray-900">{applicants.length}</p>
                                            <p className="text-sm text-gray-600">Profile Lengkap</p>
                                        </div>
                                        <div className="p-4 bg-purple-50 rounded-lg">
                                            <CheckCircle className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                                            <p className="text-2xl font-bold text-gray-900">{selectedApplicants.length}</p>
                                            <p className="text-sm text-gray-600">Dipilih</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Applicants List - Only for Job Owner */}
                        {isJobOwner && applicants.length > 0 && (
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-bold text-gray-900">
                                        Daftar Pelamar ({applicants.length})
                                    </h2>
                                    {selectedApplicants.length > 0 && (
                                        <button
                                            onClick={handleScheduleInterview}
                                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                        >
                                            <Video className="w-4 h-4" />
                                            Jadwalkan Interview ({selectedApplicants.length})
                                        </button>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    {applicants.map((application) => (
                                        <div
                                            key={application.id}
                                            className={`p-4 border-2 rounded-lg transition ${selectedApplicants.includes(application.id)
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <div className="flex items-start gap-4">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedApplicants.includes(application.id)}
                                                    onChange={() => handleSelectApplicant(application.id)}
                                                    className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                                />

                                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold overflow-hidden flex-shrink-0">
                                                    {application.jobseeker.photo ? (
                                                        <img
                                                            src={application.jobseeker.photo}
                                                            alt={application.jobseeker.firstName}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        application.jobseeker.firstName?.charAt(0) || 'U'
                                                    )}
                                                </div>

                                                <div className="flex-1">
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <h3 className="font-semibold text-gray-900">
                                                                {application.jobseeker.firstName} {application.jobseeker.lastName}
                                                            </h3>
                                                            <p className="text-sm text-gray-600">
                                                                {application.jobseeker.currentTitle || 'Job Seeker'}
                                                            </p>
                                                            {application.jobseeker.city && (
                                                                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                                                    <MapPin className="w-3 h-3" />
                                                                    {application.jobseeker.city}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(application.status).color}`}>
                                                            {getStatusBadge(application.status).label}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-4 mt-3 text-sm">
                                                        {application.jobseeker.resumeUrl && (
                                                            <a
                                                                href={application.jobseeker.resumeUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                                            >
                                                                <FileText className="w-4 h-4" />
                                                                Resume
                                                            </a>
                                                        )}
                                                        <span className="text-gray-500">
                                                            Applied: {getTimeAgo(application.appliedAt)}
                                                        </span>
                                                        <Link
                                                            href={`/recruiter/applicants/${application.id}`}
                                                            className="text-blue-600 hover:text-blue-700"
                                                        >
                                                            Lihat Detail →
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Rest of job details sections - same as before */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">
                                Deskripsi Pekerjaan
                            </h2>
                            <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
                                {job.description}
                            </div>
                        </div>

                        {job.responsibilities && (
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">
                                    Tanggung Jawab
                                </h2>
                                <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
                                    {job.responsibilities}
                                </div>
                            </div>
                        )}

                        {job.requirements && (
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">
                                    Persyaratan
                                </h2>
                                <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
                                    {job.requirements}
                                </div>
                            </div>
                        )}

                        {job.skills.length > 0 && (
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">
                                    Skills Required
                                </h2>
                                <div className="flex flex-wrap gap-2">
                                    {job.skills.map((jobSkill) => (
                                        <span
                                            key={jobSkill.id}
                                            className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-medium"
                                        >
                                            {jobSkill.skill.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {job.benefits.length > 0 && (
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">
                                    Benefits & Fasilitas
                                </h2>
                                <div className="grid md:grid-cols-2 gap-3">
                                    {job.benefits.map((benefit, index) => (
                                        <div key={index} className="flex items-start gap-2">
                                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                            <span className="text-gray-700">{benefit}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar - same as before */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h3 className="font-bold text-gray-900 mb-4">
                                Tentang Perusahaan
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Industri</p>
                                    <p className="font-medium text-gray-900">{job.company.industry}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Ukuran Perusahaan</p>
                                    <p className="font-medium text-gray-900">{job.company.companySize} karyawan</p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Lokasi</p>
                                    <p className="font-medium text-gray-900">
                                        {job.company.city}, {job.company.province}
                                    </p>
                                </div>

                                {job.company.website && (
                                    <div>
                                        <a
                                            href={job.company.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                                        >
                                            <Globe className="w-4 h-4" />
                                            Visit Website
                                        </a>
                                    </div>
                                )}

                                <Link
                                    href={`/companies/${job.company.slug}`}
                                    className="block w-full py-2 px-4 border border-blue-600 text-blue-600 text-center rounded-lg hover:bg-blue-50 transition"
                                >
                                    Lihat Profil Perusahaan
                                </Link>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h3 className="font-bold text-gray-900 mb-4">
                                Detail Lowongan
                            </h3>

                            <div className="space-y-3 text-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Kategori</span>
                                    <span className="font-medium text-gray-900">{job.category}</span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Posisi Dibuka</span>
                                    <span className="font-medium text-gray-900">{job.numberOfPositions}</span>
                                </div>

                                {job.minExperience !== null && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Pengalaman</span>
                                        <span className="font-medium text-gray-900">
                                            {job.minExperience}+ tahun
                                        </span>
                                    </div>
                                )}

                                {job.educationLevel && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Pendidikan</span>
                                        <span className="font-medium text-gray-900">{job.educationLevel}</span>
                                    </div>
                                )}

                                {job.isRemote && (
                                    <div className="pt-3 border-t border-gray-200">
                                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                                            <CheckCircle className="w-4 h-4" />
                                            Remote Friendly
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {relatedJobs.length > 0 && (
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h3 className="font-bold text-gray-900 mb-4">
                                    Lowongan Lainnya
                                </h3>

                                <div className="space-y-4">
                                    {relatedJobs.map((relatedJob) => (
                                        <Link
                                            key={relatedJob.id}
                                            href={`/jobs/${relatedJob.slug}`}
                                            className="block p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition"
                                        >
                                            <h4 className="font-semibold text-gray-900 mb-1">
                                                {relatedJob.title}
                                            </h4>
                                            <p className="text-sm text-gray-600 mb-2">
                                                {relatedJob.city}
                                            </p>
                                            <div className="flex items-center justify-between text-xs text-gray-500">
                                                <span>{getJobTypeLabel(relatedJob.jobType)}</span>
                                                <span>{getTimeAgo(relatedJob.createdAt)}</span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div >
        </div >
    )
}