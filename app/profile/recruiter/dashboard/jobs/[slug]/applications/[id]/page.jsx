'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import {
    ArrowLeft,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Briefcase,
    GraduationCap,
    Award,
    FileText,
    Download,
    ExternalLink,
    Linkedin,
    Github,
    Globe,
    Clock,
    CheckCircle,
    XCircle,
    Star,
    Eye,
    Edit2,
    Save
} from 'lucide-react'
import Swal from 'sweetalert2'

export default function ApplicationDetailPage() {
    const router = useRouter()
    const params = useParams()
    const [loading, setLoading] = useState(true)
    const [application, setApplication] = useState(null)
    const [notes, setNotes] = useState('')
    const [savingNotes, setSavingNotes] = useState(false)
    const [selectedStatus, setSelectedStatus] = useState('')

    useEffect(() => {
        loadApplication()
    }, [])

    const loadApplication = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem('token')

            // Use new cleaner API endpoint
            const response = await fetch(`/api/profile/recruiter/applications/${params.id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok) {
                const data = await response.json()
                setApplication(data.application)
                setNotes(data.application.recruiterNotes || '')
                setSelectedStatus(data.application.status)
            } else {
                throw new Error('Failed to load application')
            }
        } catch (error) {
            console.error('Load application error:', error)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to load application'
            })
            router.push(`/profile/recruiter/dashboard/jobs/${params.slug}/applications`)
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateStatus = async () => {
        if (selectedStatus === application.status) {
            Swal.fire({
                icon: 'info',
                title: 'Info',
                text: 'Status belum berubah'
            })
            return
        }

        const result = await Swal.fire({
            title: 'Update Status?',
            text: 'Apakah Anda yakin ingin mengubah status pelamar?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Ya, Update',
            cancelButtonText: 'Batal'
        })

        if (!result.isConfirmed) return

        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`/api/profile/recruiter/applications/${params.id}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    status: selectedStatus,
                    recruiterNotes: notes
                })
            })

            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil!',
                    text: 'Status berhasil diupdate',
                    timer: 2000,
                    showConfirmButton: false
                })
                loadApplication()
            } else {
                throw new Error('Failed to update status')
            }
        } catch (error) {
            console.error('Update status error:', error)
            Swal.fire({
                icon: 'error',
                title: 'Gagal',
                text: 'Gagal mengupdate status'
            })
        }
    }

    const handleSaveNotes = async () => {
        try {
            setSavingNotes(true)
            const token = localStorage.getItem('token')

            const response = await fetch(`/api/profile/recruiter/applications/${params.id}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    status: application.status,
                    recruiterNotes: notes
                })
            })

            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'Tersimpan!',
                    text: 'Catatan berhasil disimpan',
                    timer: 2000,
                    showConfirmButton: false
                })
                loadApplication()
            } else {
                throw new Error('Failed to save notes')
            }
        } catch (error) {
            console.error('Save notes error:', error)
            Swal.fire({
                icon: 'error',
                title: 'Gagal',
                text: 'Gagal menyimpan catatan'
            })
        } finally {
            setSavingNotes(false)
        }
    }

    const formatDate = (date) => {
        if (!date) return '-'
        return new Date(date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })
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
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${config.color}`}>
                <Icon className="w-4 h-4" />
                {config.label}
            </span>
        )
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading application...</p>
                </div>
            </div>
        )
    }

    if (!application) return null

    const jobseeker = application.jobseeker

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => router.push(`/profile/recruiter/dashboard/jobs/${params.slug}/applications`)}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Kembali ke Daftar Pelamar
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Candidate Profile */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Profile Card */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <div className="text-center mb-6">
                                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold mx-auto mb-4">
                                    {jobseeker.photo ? (
                                        <img
                                            src={jobseeker.photo}
                                            alt={jobseeker.firstName}
                                            className="w-full h-full object-cover rounded-full"
                                        />
                                    ) : (
                                        jobseeker.firstName?.charAt(0) || 'U'
                                    )}
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                                    {jobseeker.firstName} {jobseeker.lastName}
                                </h2>
                                <p className="text-gray-600 mb-4">
                                    {jobseeker.currentTitle || 'Job Seeker'}
                                </p>
                                {getStatusBadge(application.status)}
                            </div>

                            {/* Profile Completeness */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-gray-600">Profile Completeness</span>
                                    <span className="text-sm font-semibold text-gray-900">
                                        {application.profileCompleteness}%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full ${application.profileCompleteness >= 80 ? 'bg-green-500' : 'bg-yellow-500'
                                            }`}
                                        style={{ width: `${application.profileCompleteness}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Contact Info */}
                            <div className="space-y-3 mb-6">
                                {jobseeker.email && (
                                    <div className="flex items-center gap-3 text-gray-700">
                                        <Mail className="w-5 h-5 text-gray-400" />
                                        <a href={`mailto:${jobseeker.email}`} className="hover:text-blue-600">
                                            {jobseeker.email}
                                        </a>
                                    </div>
                                )}
                                {jobseeker.phone && (
                                    <div className="flex items-center gap-3 text-gray-700">
                                        <Phone className="w-5 h-5 text-gray-400" />
                                        <a href={`tel:${jobseeker.phone}`} className="hover:text-blue-600">
                                            {jobseeker.phone}
                                        </a>
                                    </div>
                                )}
                                {jobseeker.city && (
                                    <div className="flex items-center gap-3 text-gray-700">
                                        <MapPin className="w-5 h-5 text-gray-400" />
                                        <span>{jobseeker.city}, {jobseeker.province}</span>
                                    </div>
                                )}
                            </div>

                            {/* Social Links */}
                            {(jobseeker.linkedinUrl || jobseeker.githubUrl || jobseeker.portfolioUrl || jobseeker.websiteUrl) && (
                                <div className="border-t pt-6">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Social Links</h3>
                                    <div className="space-y-2">
                                        {jobseeker.linkedinUrl && (
                                            <a
                                                href={jobseeker.linkedinUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                                            >
                                                <Linkedin className="w-4 h-4" />
                                                LinkedIn
                                                <ExternalLink className="w-3 h-3" />
                                            </a>
                                        )}
                                        {jobseeker.githubUrl && (
                                            <a
                                                href={jobseeker.githubUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
                                            >
                                                <Github className="w-4 h-4" />
                                                GitHub
                                                <ExternalLink className="w-3 h-3" />
                                            </a>
                                        )}
                                        {jobseeker.portfolioUrl && (
                                            <a
                                                href={jobseeker.portfolioUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 text-purple-600 hover:text-purple-700"
                                            >
                                                <Globe className="w-4 h-4" />
                                                Portfolio
                                                <ExternalLink className="w-3 h-3" />
                                            </a>
                                        )}
                                        {jobseeker.websiteUrl && (
                                            <a
                                                href={jobseeker.websiteUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700"
                                            >
                                                <Globe className="w-4 h-4" />
                                                Website
                                                <ExternalLink className="w-3 h-3" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* CV Download */}
                            {jobseeker.cvUrl && (
                                <div className="border-t pt-6">
                                    <a
                                        href={jobseeker.cvUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                    >
                                        <Download className="w-5 h-5" />
                                        Download CV
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* Status Update Card */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Status</h3>
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 mb-4"
                            >
                                <option value="PENDING">Pending</option>
                                <option value="REVIEWING">Reviewing</option>
                                <option value="SHORTLISTED">Shortlisted</option>
                                <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
                                <option value="ACCEPTED">Accepted</option>
                                <option value="REJECTED">Rejected</option>
                            </select>
                            <button
                                onClick={handleUpdateStatus}
                                disabled={selectedStatus === application.status}
                                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition ${selectedStatus === application.status
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                    }`}
                            >
                                <Save className="w-5 h-5" />
                                Update Status
                            </button>
                        </div>
                    </div>

                    {/* Right Column - Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Application Info */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Application Info</h3>
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Applied For</p>
                                    <p className="font-semibold text-gray-900">{application.job.title}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Applied Date</p>
                                    <p className="font-semibold text-gray-900">{formatDate(application.appliedAt)}</p>
                                </div>
                                {application.reviewedAt && (
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Reviewed Date</p>
                                        <p className="font-semibold text-gray-900">{formatDate(application.reviewedAt)}</p>
                                    </div>
                                )}
                            </div>

                            {application.coverLetter && (
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-2">Cover Letter</h4>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <p className="text-gray-700 whitespace-pre-wrap">{application.coverLetter}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Professional Summary */}
                        {jobseeker.summary && (
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-4">Professional Summary</h3>
                                <p className="text-gray-700 whitespace-pre-wrap">{jobseeker.summary}</p>
                            </div>
                        )}

                        {/* Skills */}
                        {jobseeker.skills && jobseeker.skills.length > 0 && (
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Award className="w-6 h-6" />
                                    Skills
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {jobseeker.skills.map((skill, index) => (
                                        <span
                                            key={index}
                                            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Work Experience */}
                        {jobseeker.workExperiences && jobseeker.workExperiences.length > 0 && (
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Briefcase className="w-6 h-6" />
                                    Work Experience
                                </h3>
                                <div className="space-y-6">
                                    {jobseeker.workExperiences.map((exp) => (
                                        <div key={exp.id} className="border-l-4 border-blue-500 pl-4">
                                            <h4 className="font-bold text-gray-900">{exp.jobTitle}</h4>
                                            <p className="text-blue-600 mb-2">{exp.company}</p>
                                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                                <Calendar className="w-4 h-4" />
                                                {formatDate(exp.startDate)} - {exp.isCurrentJob ? 'Present' : formatDate(exp.endDate)}
                                            </div>
                                            {exp.description && (
                                                <p className="text-gray-700 whitespace-pre-wrap">{exp.description}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Education */}
                        {jobseeker.educations && jobseeker.educations.length > 0 && (
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <GraduationCap className="w-6 h-6" />
                                    Education
                                </h3>
                                <div className="space-y-6">
                                    {jobseeker.educations.map((edu) => (
                                        <div key={edu.id} className="border-l-4 border-green-500 pl-4">
                                            <h4 className="font-bold text-gray-900">{edu.degree} in {edu.fieldOfStudy}</h4>
                                            <p className="text-green-600 mb-2">{edu.institution}</p>
                                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                                <Calendar className="w-4 h-4" />
                                                {formatDate(edu.startDate)} - {edu.isCurrentlyStudying ? 'Present' : formatDate(edu.endDate)}
                                            </div>
                                            {edu.gpa && (
                                                <p className="text-sm text-gray-700">GPA: {edu.gpa}</p>
                                            )}
                                            {edu.description && (
                                                <p className="text-gray-700 mt-2 whitespace-pre-wrap">{edu.description}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Certifications */}
                        {jobseeker.certifications && jobseeker.certifications.length > 0 && (
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Award className="w-6 h-6" />
                                    Certifications
                                </h3>
                                <div className="space-y-4">
                                    {jobseeker.certifications.map((cert) => (
                                        <div key={cert.id} className="border-l-4 border-purple-500 pl-4">
                                            <h4 className="font-bold text-gray-900">{cert.name}</h4>
                                            <p className="text-purple-600">{cert.issuingOrganization}</p>
                                            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                                                <Calendar className="w-4 h-4" />
                                                Issued: {formatDate(cert.issueDate)}
                                                {cert.expiryDate && ` - Expires: ${formatDate(cert.expiryDate)}`}
                                            </div>
                                            {cert.credentialUrl && (
                                                <a
                                                    href={cert.credentialUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 mt-2"
                                                >
                                                    View Certificate
                                                    <ExternalLink className="w-3 h-3" />
                                                </a>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Recruiter Notes */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Edit2 className="w-6 h-6" />
                                Recruiter Notes
                            </h3>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Add internal notes about this candidate..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 min-h-[120px]"
                            ></textarea>
                            <button
                                onClick={handleSaveNotes}
                                disabled={savingNotes || notes === application.recruiterNotes}
                                className={`mt-4 flex items-center gap-2 px-6 py-3 rounded-lg transition ${savingNotes || notes === application.recruiterNotes
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                    }`}
                            >
                                {savingNotes ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        Save Notes
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}