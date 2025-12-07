'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
    Building2, CheckCircle, XCircle, MapPin, Users, 
    Globe, Mail, Phone, Calendar, Briefcase, ArrowLeft,
    FileText, Award
} from 'lucide-react'
import Swal from 'sweetalert2'

export default function CompanyDetailPage() {
    const params = useParams()
    const router = useRouter()
    const [company, setCompany] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (params.id) {
            loadCompanyDetail()
        }
    }, [params.id])

    const loadCompanyDetail = async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`/api/admin/companies?status=all`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })

            const data = await response.json()
            if (data.success) {
                const foundCompany = data.data.companies.find(c => c.id === params.id)
                setCompany(foundCompany)
            }
        } catch (error) {
            console.error('Failed to load company:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleVerify = async () => {
        const result = await Swal.fire({
            title: 'Verify Company?',
            html: `<p class="text-gray-600">Verifikasi <strong>${company.name}</strong>?</p>`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Ya, Verifikasi',
            cancelButtonText: 'Batal',
            input: 'textarea',
            inputPlaceholder: 'Catatan (opsional)...',
            allowOutsideClick: false,
            allowEscapeKey: true,
            scrollbarPadding: true,
            stopKeydownPropagation: true,
            focusConfirm: false
        })

        if (result.isConfirmed) {
            try {
                const token = localStorage.getItem('token')
                const response = await fetch(`/api/admin/companies/${company.id}/verify`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ notes: result.value || '' })
                })

                const data = await response.json()

                if (data.success) {
                    await Swal.fire({
                        icon: 'success',
                        title: 'Berhasil!',
                        text: 'Perusahaan telah diverifikasi',
                        timer: 2000
                    })
                    router.push('/admin/companies')
                } else {
                    throw new Error(data.error)
                }
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Gagal',
                    text: error.message
                })
            }
        }
    }

    const handleReject = async () => {
        const result = await Swal.fire({
            title: 'Reject Company?',
            html: `<p class="text-gray-600">Mengapa ditolak?</p>`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Ya, Tolak',
            cancelButtonText: 'Batal',
            input: 'textarea',
            inputPlaceholder: 'Alasan penolakan (wajib)...',
            inputValidator: (value) => {
                if (!value) return 'Alasan harus diisi!'
            },
            allowOutsideClick: false,
            allowEscapeKey: true,
            scrollbarPadding: true,
            stopKeydownPropagation: true,
            focusConfirm: false,
            didOpen: () => {
                // Focus on textarea when modal opens
                const textarea = Swal.getInput()
                if (textarea) textarea.focus()
            }
        })

        if (result.isConfirmed) {
            try {
                const token = localStorage.getItem('token')
                const response = await fetch(`/api/admin/companies/${company.id}/reject`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ reason: result.value })
                })

                const data = await response.json()

                if (data.success) {
                    await Swal.fire({
                        icon: 'success',
                        title: 'Ditolak',
                        text: 'Perusahaan telah ditolak',
                        timer: 2000
                    })
                    router.push('/admin/companies')
                } else {
                    throw new Error(data.error)
                }
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Gagal',
                    text: error.message
                })
            }
        }
    }

    if (loading) {
        return (
            <div className="p-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-64 bg-gray-200 rounded"></div>
                </div>
            </div>
        )
    }

    if (!company) {
        return (
            <div className="p-8">
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                    <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Company not found</p>
                </div>
            </div>
        )
    }

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Companies
                </button>
                <h1 className="text-3xl font-bold text-gray-900">Company Review</h1>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Company Card */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="flex items-start gap-6 mb-6">
                            {company.logo ? (
                                <img src={company.logo} alt={company.name} className="w-24 h-24 rounded-xl object-cover" />
                            ) : (
                                <div className="w-24 h-24 bg-blue-100 rounded-xl flex items-center justify-center">
                                    <Building2 className="w-12 h-12 text-blue-600" />
                                </div>
                            )}
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                                    {company.name}
                                    {company.verified && (
                                        <CheckCircle className="w-6 h-6 text-blue-600 fill-current" />
                                    )}
                                </h2>
                                <p className="text-gray-600 mb-3">{company.tagline || company.industry}</p>
                                
                                {/* Status Badge */}
                                {!company.verified && company.status === 'PENDING_VERIFICATION' && (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                                        Pending Verification
                                    </span>
                                )}
                                {!company.verified && company.status === 'PENDING_RESUBMISSION' && (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                        Resubmission - Needs Review
                                    </span>
                                )}
                                {company.verified && (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                        <CheckCircle className="w-4 h-4" />
                                        Verified Company
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        {company.description && (
                            <div className="mb-6">
                                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                    <FileText className="w-5 h-5" />
                                    About Company
                                </h3>
                                <p className="text-gray-600 leading-relaxed">{company.description}</p>
                            </div>
                        )}

                        {/* Culture */}
                        {company.culture && (
                            <div className="mb-6">
                                <h3 className="font-semibold text-gray-900 mb-2">Company Culture</h3>
                                <p className="text-gray-600 leading-relaxed">{company.culture}</p>
                            </div>
                        )}

                        {/* Benefits */}
                        {company.benefits && company.benefits.length > 0 && (
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <Award className="w-5 h-5" />
                                    Benefits
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {company.benefits.map((benefit, idx) => (
                                        <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                                            {benefit}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    {/* Contact Info */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h3 className="font-semibold text-gray-900 mb-4">Contact Information</h3>
                        <div className="space-y-3 text-sm">
                            {company.email && (
                                <div className="flex items-center gap-3">
                                    <Mail className="w-4 h-4 text-gray-400" />
                                    <a href={`mailto:${company.email}`} className="text-blue-600 hover:underline">
                                        {company.email}
                                    </a>
                                </div>
                            )}
                            {company.phone && (
                                <div className="flex items-center gap-3">
                                    <Phone className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-600">{company.phone}</span>
                                </div>
                            )}
                            {company.website && (
                                <div className="flex items-center gap-3">
                                    <Globe className="w-4 h-4 text-gray-400" />
                                    <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                        {company.website}
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Company Details */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h3 className="font-semibold text-gray-900 mb-4">Company Details</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex items-start gap-3">
                                <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                                <div>
                                    <div className="text-gray-600">{company.city}, {company.province}</div>
                                    {company.address && (
                                        <div className="text-gray-500 text-xs mt-1">{company.address}</div>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Users className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-600">{company.companySize} employees</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Briefcase className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-600">{company.industry}</span>
                            </div>
                            {company.foundedYear && (
                                <div className="flex items-center gap-3">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-600">Founded in {company.foundedYear}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recruiter Info */}
                    {company.recruiterEmail && (
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <h3 className="font-semibold text-gray-900 mb-4">Recruiter Contact</h3>
                            <div className="text-sm">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Mail className="w-4 h-4" />
                                    <span>{company.recruiterEmail}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Stats */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h3 className="font-semibold text-gray-900 mb-4">Statistics</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Active Jobs</span>
                                <span className="font-semibold">{company.jobsCount || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Registered</span>
                                <span className="font-semibold">
                                    {new Date(company.createdAt).toLocaleDateString('id-ID')}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    {!company.verified && (company.status === 'PENDING_VERIFICATION' || company.status === 'PENDING_RESUBMISSION') && (
                        <div className="space-y-3">
                            <button
                                onClick={handleVerify}
                                className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium flex items-center justify-center gap-2"
                            >
                                <CheckCircle className="w-5 h-5" />
                                Verify Company
                            </button>
                            <button
                                onClick={handleReject}
                                className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium flex items-center justify-center gap-2"
                            >
                                <XCircle className="w-5 h-5" />
                                Reject Company
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
