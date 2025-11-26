'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, CheckCircle, XCircle, Clock, Search } from 'lucide-react'
import Swal from 'sweetalert2'

export default function AdminCompaniesPage() {
    const router = useRouter()
    const [companies, setCompanies] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('pending') // pending, verified, rejected
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        loadCompanies()
    }, [filter])

    const loadCompanies = async () => {
        setLoading(true)
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`/api/admin/companies?status=${filter}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })

            const data = await response.json()
            if (data.success) {
                setCompanies(data.data.companies)
            }
        } catch (error) {
            console.error('Failed to load companies:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleVerify = async (companyId, companyName) => {
        const result = await Swal.fire({
            title: 'Verify Company?',
            text: `Apakah Anda yakin ingin memverifikasi ${companyName}?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Ya, Verifikasi',
            cancelButtonText: 'Batal',
            input: 'textarea',
            inputPlaceholder: 'Catatan (opsional)...',
            inputAttributes: {
                'aria-label': 'Notes'
            }
        })

        if (result.isConfirmed) {
            try {
                const token = localStorage.getItem('token')
                const response = await fetch(`/api/admin/companies/${companyId}/verify`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ notes: result.value || '' })
                })

                const data = await response.json()

                if (data.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Berhasil Diverifikasi!',
                        text: `${companyName} telah diverifikasi`,
                        timer: 2000
                    })
                    loadCompanies()
                } else {
                    throw new Error(data.error)
                }
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Gagal',
                    text: error.message || 'Gagal memverifikasi perusahaan'
                })
            }
        }
    }

    const handleReject = async (companyId, companyName) => {
        const result = await Swal.fire({
            title: 'Reject Company?',
            text: `Mengapa ${companyName} ditolak?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Ya, Tolak',
            cancelButtonText: 'Batal',
            input: 'textarea',
            inputPlaceholder: 'Alasan penolakan (wajib)...',
            inputAttributes: {
                'aria-label': 'Rejection reason'
            },
            inputValidator: (value) => {
                if (!value) {
                    return 'Alasan penolakan harus diisi!'
                }
            }
        })

        if (result.isConfirmed) {
            try {
                const token = localStorage.getItem('token')
                const response = await fetch(`/api/admin/companies/${companyId}/reject`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ reason: result.value })
                })

                const data = await response.json()

                if (data.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Perusahaan Ditolak',
                        text: `${companyName} telah ditolak`,
                        timer: 2000
                    })
                    loadCompanies()
                } else {
                    throw new Error(data.error)
                }
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Gagal',
                    text: error.message || 'Gagal menolak perusahaan'
                })
            }
        }
    }

    const filteredCompanies = companies.filter(company =>
        company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.city.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Company Verification</h1>
                <p className="text-gray-600">Review dan verifikasi perusahaan yang mendaftar</p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    {/* Status Tabs */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setFilter('pending')}
                            className={`px-4 py-2 rounded-lg font-medium transition ${
                                filter === 'pending'
                                    ? 'bg-orange-100 text-orange-700'
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            <Clock className="w-4 h-4 inline mr-1" />
                            Pending
                        </button>
                        <button
                            onClick={() => setFilter('verified')}
                            className={`px-4 py-2 rounded-lg font-medium transition ${
                                filter === 'verified'
                                    ? 'bg-green-100 text-green-700'
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            <CheckCircle className="w-4 h-4 inline mr-1" />
                            Verified
                        </button>
                        <button
                            onClick={() => setFilter('rejected')}
                            className={`px-4 py-2 rounded-lg font-medium transition ${
                                filter === 'rejected'
                                    ? 'bg-red-100 text-red-700'
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            <XCircle className="w-4 h-4 inline mr-1" />
                            Rejected
                        </button>
                    </div>

                    {/* Search */}
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search companies..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>
            </div>

            {/* Companies Grid */}
            {loading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="bg-white rounded-xl h-64 animate-pulse border border-gray-200"></div>
                    ))}
                </div>
            ) : filteredCompanies.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                    <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No companies found</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCompanies.map(company => (
                        <div 
                            key={company.id} 
                            className={`bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition ${
                                filter === 'pending' ? 'cursor-pointer' : ''
                            }`}
                            onClick={() => filter === 'pending' && router.push(`/admin/companies/${company.id}`)}
                        >
                            {/* Company Header */}
                            <div className="flex items-start gap-4 mb-4">
                                {company.logo ? (
                                    <img src={company.logo} alt={company.name} className="w-16 h-16 rounded-lg object-cover" />
                                ) : (
                                    <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <Building2 className="w-8 h-8 text-blue-600" />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <h3 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                                        {company.name}
                                        {company.verified && (
                                            <CheckCircle className="w-5 h-5 text-blue-600 fill-current" />
                                        )}
                                    </h3>
                                    <p className="text-sm text-gray-600">{company.industry}</p>
                                </div>
                            </div>

                            {/* Company Info */}
                            <div className="space-y-2 mb-4 text-sm">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <span className="font-medium">Lokasi:</span>
                                    <span>{company.city}, {company.province}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <span className="font-medium">Ukuran:</span>
                                    <span>{company.companySize}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <span className="font-medium">Lowongan:</span>
                                    <span>{company.jobsCount} jobs</span>
                                </div>
                                {company.recruiterEmail && (
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <span className="font-medium">Email:</span>
                                        <span className="text-xs">{company.recruiterEmail}</span>
                                    </div>
                                )}
                            </div>

                            {/* Status Badge */}
                            <div className="mb-4">
                                {filter === 'pending' && (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                                        <Clock className="w-4 h-4" />
                                        Pending Verification
                                    </span>
                                )}
                                {filter === 'verified' && company.verifiedAt && (
                                    <span className="text-xs text-gray-500">
                                        Verified: {new Date(company.verifiedAt).toLocaleDateString('id-ID')}
                                    </span>
                                )}
                                {filter === 'rejected' && company.rejectionReason && (
                                    <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                                        <strong>Alasan:</strong> {company.rejectionReason}
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            {filter === 'pending' && (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleVerify(company.id, company.name)}
                                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium text-sm flex items-center justify-center gap-1"
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                        Verify
                                    </button>
                                    <button
                                        onClick={() => handleReject(company.id, company.name)}
                                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium text-sm flex items-center justify-center gap-1"
                                    >
                                        <XCircle className="w-4 h-4" />
                                        Reject
                                    </button>
                                </div>
                            )}

                            {filter === 'verified' && (
                                <a
                                    href={`/companies/${company.slug || company.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block text-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition font-medium text-sm"
                                >
                                    View Profile →
                                </a>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Results Count */}
            {!loading && (
                <div className="mt-6 text-center text-gray-600">
                    Showing {filteredCompanies.length} of {companies.length} companies
                </div>
            )}
        </div>
    )
}
