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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 lg:p-8">
            {/* Header */}
            <div className="max-w-6xl mx-auto mb-8">
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 transition mb-6 group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition" />
                    <span className="text-sm font-medium">Kembali ke Daftar Perusahaan</span>
                </button>
            </div>
                
            {/* Hero Card */}
            <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-8">
                <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-8 py-10">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                        {/* Logo */}
                        <div className="w-20 h-20 rounded-2xl bg-white shadow-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                            {company.logo ? (
                                <img src={company.logo} alt={company.name} className="w-full h-full object-cover" />
                            ) : (
                                <Building2 className="w-10 h-10 text-slate-400" />
                            )}
                        </div>
                        
                        {/* Company Info */}
                        <div className="flex-1">
                            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 flex items-center gap-3">
                                {company.name}
                                {company.verified && <CheckCircle className="w-6 h-6 text-emerald-400" />}
                            </h1>
                            <p className="text-slate-300 text-sm mb-4">{company.tagline || company.industry}</p>
                            
                            {/* Status Badge */}
                            {!company.verified && company.status === 'PENDING_VERIFICATION' && (
                                <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-400/20 text-amber-300 rounded-full text-sm font-medium">
                                    <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                                    Menunggu Verifikasi
                                </span>
                            )}
                            {!company.verified && company.status === 'PENDING_RESUBMISSION' && (
                                <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-400/20 text-blue-300 rounded-full text-sm font-medium">
                                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                                    Resubmisi - Perlu Review
                                </span>
                            )}
                            {company.verified && (
                                <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-400/20 text-emerald-300 rounded-full text-sm font-medium">
                                    <CheckCircle className="w-4 h-4" />
                                    Terverifikasi
                                </span>
                            )}
                        </div>
                        
                        {/* Action Buttons */}
                        {!company.verified && (company.status === 'PENDING_VERIFICATION' || company.status === 'PENDING_RESUBMISSION') && (
                            <div className="flex gap-3">
                                <button
                                    onClick={handleVerify}
                                    className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                                >
                                    <CheckCircle className="w-4 h-4" />
                                    Verifikasi
                                </button>
                                <button
                                    onClick={handleReject}
                                    className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition shadow-lg shadow-red-500/20 flex items-center gap-2"
                                >
                                    <XCircle className="w-4 h-4" />
                                    Tolak
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-100">
                    <div className="p-5 text-center">
                        <div className="text-2xl font-bold text-slate-800">{company.jobsCount || 0}</div>
                        <div className="text-xs text-slate-500 mt-1">Lowongan Aktif</div>
                    </div>
                    <div className="p-5 text-center">
                        <div className="text-2xl font-bold text-slate-800">{company.companySize || '-'}</div>
                        <div className="text-xs text-slate-500 mt-1">Karyawan</div>
                    </div>
                    <div className="p-5 text-center">
                        <div className="text-2xl font-bold text-slate-800">{company.foundedYear || '-'}</div>
                        <div className="text-xs text-slate-500 mt-1">Tahun Berdiri</div>
                    </div>
                    <div className="p-5 text-center">
                        <div className="text-2xl font-bold text-slate-800">{company.gallery?.length || 0}</div>
                        <div className="text-xs text-slate-500 mt-1">Foto Galeri</div>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* About Section */}
                    {company.description && (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-blue-500" />
                                Tentang Perusahaan
                            </h2>
                            <p className="text-slate-600 leading-relaxed">{company.description}</p>
                        </div>
                    )}

                    {/* Culture Section */}
                    {company.culture && (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                <Users className="w-5 h-5 text-purple-500" />
                                Budaya Perusahaan
                            </h2>
                            <p className="text-slate-600 leading-relaxed">{company.culture}</p>
                        </div>
                    )}

                    {/* Benefits Section */}
                    {company.benefits && company.benefits.length > 0 && (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                <Award className="w-5 h-5 text-amber-500" />
                                Benefit Karyawan
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {company.benefits.map((benefit, idx) => (
                                    <span 
                                        key={idx} 
                                        className="px-4 py-2 bg-gradient-to-r from-slate-50 to-slate-100 text-slate-700 rounded-xl text-sm font-medium border border-slate-200"
                                    >
                                        {benefit}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Gallery Section */}
                    {company.gallery && company.gallery.length > 0 && (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Galeri Perusahaan
                                <span className="text-xs text-slate-400 font-normal ml-1">({company.gallery.length} foto)</span>
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {company.gallery.map((photo, idx) => (
                                    <a 
                                        key={idx} 
                                        href={photo} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="aspect-square rounded-xl overflow-hidden bg-slate-100 hover:opacity-90 transition group"
                                    >
                                        <img 
                                            src={photo} 
                                            alt={`Gallery ${idx + 1}`}
                                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                            loading="lazy"
                                        />
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Contact Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                        <h3 className="text-sm font-semibold text-slate-800 mb-4 uppercase tracking-wider">Kontak</h3>
                        <div className="space-y-4">
                            {company.email && (
                                <a href={`mailto:${company.email}`} className="flex items-center gap-3 text-sm text-slate-600 hover:text-blue-600 transition group">
                                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition">
                                        <Mail className="w-4 h-4 text-blue-500" />
                                    </div>
                                    <span className="truncate">{company.email}</span>
                                </a>
                            )}
                            {company.phone && (
                                <div className="flex items-center gap-3 text-sm text-slate-600">
                                    <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                                        <Phone className="w-4 h-4 text-emerald-500" />
                                    </div>
                                    <span>{company.phone}</span>
                                </div>
                            )}
                            {company.website && (
                                <a href={company.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-slate-600 hover:text-blue-600 transition group">
                                    <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center group-hover:bg-purple-100 transition">
                                        <Globe className="w-4 h-4 text-purple-500" />
                                    </div>
                                    <span className="truncate">{company.website.replace('https://', '').replace('http://', '')}</span>
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Location Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                        <h3 className="text-sm font-semibold text-slate-800 mb-4 uppercase tracking-wider">Lokasi</h3>
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                <MapPin className="w-4 h-4 text-rose-500" />
                            </div>
                            <div>
                                <div className="text-sm text-slate-800 font-medium">{company.city}, {company.province}</div>
                                {company.address && (
                                    <div className="text-xs text-slate-500 mt-1">{company.address}</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Industry Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                        <h3 className="text-sm font-semibold text-slate-800 mb-4 uppercase tracking-wider">Industri</h3>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                                <Briefcase className="w-4 h-4 text-amber-500" />
                            </div>
                            <span className="text-sm text-slate-700 font-medium">{company.industry}</span>
                        </div>
                    </div>

                    {/* Timeline Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                        <h3 className="text-sm font-semibold text-slate-800 mb-4 uppercase tracking-wider">Timeline</h3>
                        <div className="space-y-4 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-slate-500">Terdaftar</span>
                                <span className="text-slate-800 font-medium">
                                    {new Date(company.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </span>
                            </div>
                            {company.verifiedAt && (
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-500">Diverifikasi</span>
                                    <span className="text-emerald-600 font-medium">
                                        {new Date(company.verifiedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recruiter Card */}
                    {company.recruiterEmail && (
                        <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl p-6 text-white">
                            <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider opacity-80">Penanggung Jawab</h3>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                                    <Mail className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-sm truncate">{company.recruiterEmail}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
