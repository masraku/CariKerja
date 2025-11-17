'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import {
    User, Mail, Phone, MapPin, Calendar, Briefcase, GraduationCap,
    Award, FileText, Globe, Linkedin, Github, Edit, Download,
    Star, Target, ExternalLink
} from 'lucide-react'

const ViewProfilePage = () => {
    const router = useRouter()
    const { user } = useAuth()
    const [profile, setProfile] = useState(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        loadProfile()
    }, [])

    const loadProfile = async () => {
        try {
            const response = await fetch('/api/profile/jobseeker')
            const data = await response.json()

            if (response.ok && data.profile) {
                setProfile(data.profile)
            } else {
                router.push('/profile/jobseeker')
            }
        } catch (error) {
            console.error('Load profile error:', error)
            router.push('/profile/jobseeker')
        } finally {
            setIsLoading(false)
        }
    }

    const formatDate = (dateString) => {
        if (!dateString) return '-'
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const formatMonthYear = (dateString) => {
        if (!dateString) return '-'
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long'
        })
    }

    const formatCurrency = (amount) => {
        if (!amount) return '-'
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount)
    }

    const calculateAge = (birthDate) => {
        if (!birthDate) return '-'
        const today = new Date()
        const birth = new Date(birthDate)
        let age = today.getFullYear() - birth.getFullYear()
        const monthDiff = today.getMonth() - birth.getMonth()
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--
        }
        return age
    }

    const getCompletenessColor = (val) => {
        if (val >= 80) return 'text-green-600 bg-green-100'
        if (val >= 50) return 'text-yellow-600 bg-yellow-100'
        return 'text-red-600 bg-red-100'
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Memuat profile...</p>
                </div>
            </div>
        )
    }

    if (!profile) return null

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12">
            <div className="container mx-auto px-4 max-w-6xl">

                {/* HEADER */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                    <div className="flex justify-between items-start">
                        <div className="flex gap-6">

                            {/* PHOTO */}
                            <div className="relative">
                                {profile.photo ? (
                                    <img
                                        src={profile.photo}
                                        alt="Profile"
                                        className="w-32 h-32 rounded-full object-cover border-4 border-indigo-200"
                                    />
                                ) : (
                                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center border-4 border-indigo-200">
                                        <User className="w-16 h-16 text-indigo-400" />
                                    </div>
                                )}

                                <div className={`absolute -bottom-2 -right-2 px-3 py-1 rounded-full text-xs font-bold ${getCompletenessColor(profile.profileCompleteness)}`}>
                                    {profile.profileCompleteness}%
                                </div>
                            </div>

                            {/* BASIC INFO */}
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                    {profile.firstName} {profile.lastName}
                                </h1>

                                {profile.currentTitle && (
                                    <p className="text-xl text-indigo-600 font-semibold mb-3">
                                        {profile.currentTitle}
                                    </p>
                                )}

                                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                    {profile.email && (
                                        <div className="flex items-center gap-2">
                                            <Mail className="w-4 h-4" />
                                            {profile.email}
                                        </div>
                                    )}

                                    {profile.phone && (
                                        <div className="flex items-center gap-2">
                                            <Phone className="w-4 h-4" />
                                            {profile.phone}
                                        </div>
                                    )}

                                    {(profile.city && profile.province) && (
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4" />
                                            {profile.city}, {profile.province}
                                        </div>
                                    )}

                                    {profile.dateOfBirth && (
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            {calculateAge(profile.dateOfBirth)} tahun
                                        </div>
                                    )}
                                </div>

                                {/* SOCIAL LINKS */}
                                {(profile.linkedinUrl ||
                                    profile.githubUrl ||
                                    profile.portfolioUrl ||
                                    profile.websiteUrl) && (
                                        <div className="flex gap-3 mt-4">

                                            {profile.linkedinUrl && (
                                                <a
                                                    href={profile.linkedinUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
                                                >
                                                    <Linkedin className="w-5 h-5" />
                                                </a>
                                            )}

                                            {profile.githubUrl && (
                                                <a
                                                    href={profile.githubUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                                                >
                                                    <Github className="w-5 h-5" />
                                                </a>
                                            )}

                                            {profile.portfolioUrl && (
                                                <a
                                                    href={profile.portfolioUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition"
                                                >
                                                    <Globe className="w-5 h-5" />
                                                </a>
                                            )}

                                            {profile.websiteUrl && (
                                                <a
                                                    href={profile.websiteUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition"
                                                >
                                                    <Globe className="w-5 h-5" />
                                                </a>
                                            )}

                                        </div>
                                    )}
                            </div>
                        </div>

                        {/* EDIT BUTTON */}
                        <button
                            onClick={() => router.push('/profile/jobseeker?mode=edit')}
                            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-semibold shadow-lg hover:shadow-xl"
                        >
                            <Edit className="w-5 h-5" />
                            Edit Profile
                        </button>
                    </div>

                    {/* CV DOWNLOAD */}
                    {profile.cvUrl && (
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <a
                                href={profile.cvUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition font-semibold"
                            >
                                <Download className="w-5 h-5" />
                                Download CV / Resume
                            </a>
                        </div>
                    )}
                </div>

                {/* GRID CONTENT */}
                <div className="grid md:grid-cols-3 gap-8">

                    {/* LEFT SIDE */}
                    <div className="space-y-8">

                        {/* PERSONAL INFO */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <User className="w-6 h-6 text-indigo-600" />
                                Informasi Pribadi
                            </h2>
                            <div className="space-y-3 text-sm">
                                {profile.gender && (
                                    <div>
                                        <p className="text-gray-500">Jenis Kelamin</p>
                                        <p className="font-semibold text-gray-900">{profile.gender}</p>
                                    </div>
                                )}
                                {profile.religion && (
                                    <div>
                                        <p className="text-gray-500">Agama</p>
                                        <p className="font-semibold text-gray-900">{profile.religion}</p>
                                    </div>
                                )}
                                {profile.maritalStatus && (
                                    <div>
                                        <p className="text-gray-500">Status Pernikahan</p>
                                        <p className="font-semibold text-gray-900">{profile.maritalStatus}</p>
                                    </div>
                                )}
                                {profile.nationality && (
                                    <div>
                                        <p className="text-gray-500">Kewarganegaraan</p>
                                        <p className="font-semibold text-gray-900">{profile.nationality}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* JOB PREFERENCES */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Target className="w-6 h-6 text-indigo-600" />
                                Preferensi Pekerjaan
                            </h2>
                            <div className="space-y-3 text-sm">
                                {profile.desiredJobTitle && (
                                    <div>
                                        <p className="text-gray-500">Posisi yang Diinginkan</p>
                                        <p className="font-semibold text-gray-900">{profile.desiredJobTitle}</p>
                                    </div>
                                )}

                                {profile.preferredJobType && (
                                    <div>
                                        <p className="text-gray-500">Tipe Pekerjaan</p>
                                        <p className="font-semibold text-gray-900">{profile.preferredJobType}</p>
                                    </div>
                                )}

                                {(profile.desiredSalaryMin || profile.desiredSalaryMax) && (
                                    <div>
                                        <p className="text-gray-500">Ekspektasi Gaji</p>
                                        <p className="font-semibold text-gray-900">
                                            {formatCurrency(profile.desiredSalaryMin)} - {formatCurrency(profile.desiredSalaryMax)}
                                        </p>
                                    </div>
                                )}

                                {profile.preferredLocation && (
                                    <div>
                                        <p className="text-gray-500">Lokasi Preferensi</p>
                                        <p className="font-semibold text-gray-900">{profile.preferredLocation}</p>
                                    </div>
                                )}

                                <div>
                                    <p className="text-gray-500">Bersedia Relokasi</p>
                                    <p className="font-semibold text-gray-900">
                                        {profile.willingToRelocate ? 'Ya' : 'Tidak'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* SKILLS */}
                        {profile.skills?.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Star className="w-6 h-6 text-indigo-600" />
                                    Skills
                                </h2>
                                <div className="flex flex-wrap gap-2">
                                    {profile.skills.map((skill, index) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium"
                                        >
                                            {skill.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT SIDE */}
                    <div className="md:col-span-2 space-y-8">

                        {/* SUMMARY */}
                        {profile.summary && (
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <FileText className="w-6 h-6 text-indigo-600" />
                                    Ringkasan Profesional
                                </h2>
                                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                    {profile.summary}
                                </p>
                            </div>
                        )}

                        {/* EDUCATION */}
                        {profile.educations?.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <GraduationCap className="w-6 h-6 text-indigo-600" />
                                    Riwayat Pendidikan
                                </h2>
                                <div className="space-y-6">
                                    {profile.educations.map((edu, index) => (
                                        <div key={index} className="border-l-4 border-indigo-600 pl-4">
                                            <h3 className="font-bold text-gray-900">
                                                {edu.degree} - {edu.fieldOfStudy}
                                            </h3>
                                            <p className="text-indigo-600 font-semibold">{edu.institution}</p>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {edu.level} • {formatMonthYear(edu.startDate)} - {edu.isCurrent ? 'Sekarang' : formatMonthYear(edu.endDate)}
                                            </p>

                                            {edu.gpa && (
                                                <p className="text-sm text-gray-600">IPK: {edu.gpa}</p>
                                            )}

                                            {edu.diplomaUrl && (
                                                <a
                                                    href={edu.diplomaUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 mt-2"
                                                >
                                                    <FileText className="w-4 h-4" />
                                                    Lihat Ijazah
                                                </a>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* EXPERIENCE */}
                        {profile.workExperiences?.length > 0 && profile.workExperiences[0].company && (
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Briefcase className="w-6 h-6 text-indigo-600" />
                                    Pengalaman Kerja
                                </h2>
                                <div className="space-y-6">
                                    {profile.workExperiences.map((exp, index) => (
                                        <div key={index} className="border-l-4 border-indigo-600 pl-4">
                                            <h3 className="font-bold text-gray-900">{exp.position}</h3>
                                            <p className="text-indigo-600 font-semibold">{exp.company}</p>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {exp.location} • {formatMonthYear(exp.startDate)} - {exp.isCurrent ? 'Sekarang' : formatMonthYear(exp.endDate)}
                                            </p>

                                            {exp.description && (
                                                <p className="text-gray-700 mt-2">{exp.description}</p>
                                            )}

                                            {exp.achievements?.length > 0 && (
                                                <div className="mt-2">
                                                    <p className="text-sm font-semibold text-gray-700 mb-1">
                                                        Pencapaian:
                                                    </p>
                                                    <ul className="list-disc list-inside space-y-1">
                                                        {exp.achievements.map((ach, idx) => (
                                                            <li key={idx} className="text-sm text-gray-600">
                                                                {ach}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* CERTIFICATIONS */}
                        {profile.certifications?.length > 0 && profile.certifications[0].name && (
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Award className="w-6 h-6 text-indigo-600" />
                                    Sertifikat & Pelatihan
                                </h2>

                                <div className="space-y-4">
                                    {profile.certifications.map((cert, index) => (
                                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                                            <h3 className="font-bold text-gray-900">{cert.name}</h3>
                                            <p className="text-indigo-600">{cert.issuingOrganization}</p>
                                            <p className="text-sm text-gray-600 mt-1">
                                                Terbit: {formatMonthYear(cert.issueDate)}
                                                {cert.expiryDate && ` • Berlaku hingga: ${formatMonthYear(cert.expiryDate)}`}
                                            </p>
                                            {cert.credentialId && (
                                                <p className="text-sm text-gray-600">ID: {cert.credentialId}</p>
                                            )}

                                            <div className="flex gap-3 mt-3">
                                                {cert.credentialUrl && (
                                                    <a
                                                        href={cert.credentialUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700"
                                                    >
                                                        <ExternalLink className="w-4 h-4" />
                                                        Verifikasi
                                                    </a>
                                                )}

                                                {cert.certificateUrl && (
                                                    <a
                                                        href={cert.certificateUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700"
                                                    >
                                                        <FileText className="w-4 h-4" />
                                                        Lihat Sertifikat
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>
                </div>

                {/* BACK BUTTON */}
                <div className="mt-8 text-center">
                    <button
                        onClick={() => router.push('/dashboard/jobseeker')}
                        className="px-8 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition font-semibold"
                    >
                        Kembali ke Dashboard
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ViewProfilePage
