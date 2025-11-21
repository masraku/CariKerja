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
    Bookmark,
    CheckCircle,
    Award,
    TrendingUp,
    Globe,
    ArrowLeft
} from 'lucide-react'
import Swal from 'sweetalert2'

export default function JobDetailPage() {
    const params = useParams()
    const router = useRouter()
    const { user, isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(true)
    const [job, setJob] = useState(null)
    const [relatedJobs, setRelatedJobs] = useState([])
    const [isApplying, setIsApplying] = useState(false)

    useEffect(() => {
        if (params.slug) {
            loadJobDetails()
        }
    }, [params.slug])

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
                    router.push('/jobs')
                })
            }
        } catch (error) {
            console.error('Load job error:', error)
        } finally {
            setLoading(false)
        }
    }

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
                    <Link href="/dashboard/recruiter" className="text-blue-600 hover:text-blue-700">
                        ← Kembali ke Daftar Lowongan
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Back Button */}
                <Link
                    href="/dashboard/recruiter"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Kembali ke Daftar Lowongan
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

                            {/* Apply Button */}
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
                        </div>

                        {/* Job Description */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">
                                Deskripsi Pekerjaan
                            </h2>
                            <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
                                {job.description}
                            </div>
                        </div>

                        {/* Responsibilities */}
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

                        {/* Requirements */}
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

                        {/* Skills */}
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

                        {/* Benefits */}
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

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Company Info */}
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

                        {/* Job Details */}
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
                                            {job.minExperience} + tahun
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

                        {/* Related Jobs */}
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
            </div>
        </div>
    )
}