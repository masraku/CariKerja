'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
    Building2, CheckCircle, XCircle, Clock, Search, 
    MapPin, Users, Briefcase, Mail, Eye, Calendar
} from 'lucide-react'

export default function AdminCompaniesPage() {
    const router = useRouter()
    const [companies, setCompanies] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('pending')
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

    const filteredCompanies = companies.filter(company =>
        company.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.industry?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.city?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        })
    }

    const getStatusBadge = (company) => {
        if (company.verified) {
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Verified
                </span>
            )
        }
        if (company.status === 'REJECTED') {
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                    <XCircle className="w-3.5 h-3.5" />
                    Ditolak
                </span>
            )
        }
        if (company.status === 'PENDING_RESUBMISSION') {
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                    Resubmisi
                </span>
            )
        }
        return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                Pending
            </span>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            {/* Header - Always visible */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 lg:px-8 py-8">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">Verifikasi Perusahaan</h1>
                    <p className="text-slate-300 text-sm">Review dan verifikasi perusahaan yang mendaftar</p>
                    
                    {/* Status Tabs in Header */}
                    <div className="flex flex-wrap gap-3 mt-6">
                        <button
                            onClick={() => setFilter('pending')}
                            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition ${
                                filter === 'pending'
                                    ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                                    : 'bg-white/10 text-white hover:bg-white/20'
                            }`}
                        >
                            <Clock className="w-4 h-4 inline mr-2" />
                            Pending
                        </button>
                        <button
                            onClick={() => setFilter('resubmission')}
                            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition ${
                                filter === 'resubmission'
                                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                                    : 'bg-white/10 text-white hover:bg-white/20'
                            }`}
                        >
                            <Clock className="w-4 h-4 inline mr-2" />
                            Resubmisi
                        </button>
                        <button
                            onClick={() => setFilter('verified')}
                            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition ${
                                filter === 'verified'
                                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                                    : 'bg-white/10 text-white hover:bg-white/20'
                            }`}
                        >
                            <CheckCircle className="w-4 h-4 inline mr-2" />
                            Verified
                        </button>
                        <button
                            onClick={() => setFilter('rejected')}
                            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition ${
                                filter === 'rejected'
                                    ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                                    : 'bg-white/10 text-white hover:bg-white/20'
                            }`}
                        >
                            <XCircle className="w-4 h-4 inline mr-2" />
                            Ditolak
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
                {/* Search */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 mb-6">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Cari perusahaan, industri, atau lokasi..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-800 placeholder-slate-400"
                        />
                    </div>
                </div>

                {/* Results Count */}
                <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-slate-500">
                        Menampilkan <span className="font-semibold text-slate-700">{loading ? '...' : filteredCompanies.length}</span> perusahaan
                    </p>
                </div>

                {/* Loading State - Inline, not full screen */}
                {loading ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 animate-pulse">
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="w-14 h-14 rounded-xl bg-slate-200"></div>
                                    <div className="flex-1">
                                        <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                                        <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                                    </div>
                                </div>
                                <div className="space-y-2 mb-4">
                                    <div className="h-3 bg-slate-200 rounded w-full"></div>
                                    <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                                </div>
                                <div className="h-10 bg-slate-200 rounded-xl"></div>
                            </div>
                        ))}
                    </div>
                ) : filteredCompanies.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
                        <Building2 className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-800 mb-2">Tidak ada perusahaan</h3>
                        <p className="text-slate-500">Tidak ada perusahaan dengan status ini</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredCompanies.map(company => (
                            <div 
                                key={company.id} 
                                className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 hover:shadow-lg transition group"
                            >
                                {/* Company Header */}
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                                        {company.logo ? (
                                            <img src={company.logo} alt={company.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <Building2 className="w-7 h-7 text-slate-400" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-slate-800 truncate flex items-center gap-2">
                                            {company.name}
                                            {company.verified && (
                                                <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                            )}
                                        </h3>
                                        <p className="text-sm text-slate-500 truncate">{company.industry || 'Belum dilengkapi'}</p>
                                    </div>
                                </div>

                                {/* Company Info */}
                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                        <span className="truncate">{company.city || 'Belum dilengkapi'}{company.province ? `, ${company.province}` : ''}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <Users className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                        <span>{company.companySize || 'Belum dilengkapi'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <Briefcase className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                        <span>{company.jobsCount || 0} lowongan</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                        <span className="truncate text-xs">{company.recruiterEmail || company.email}</span>
                                    </div>
                                </div>

                                {/* Status & Date */}
                                <div className="flex items-center justify-between mb-4">
                                    {getStatusBadge(company)}
                                    <span className="text-xs text-slate-400 flex items-center gap-1">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {formatDate(company.createdAt)}
                                    </span>
                                </div>

                                {/* Rejection Reason */}
                                {filter === 'rejected' && company.rejectionReason && (
                                    <div className="mb-4 p-3 bg-red-50 rounded-xl">
                                        <p className="text-xs text-red-600 line-clamp-2">
                                            <span className="font-medium">Alasan:</span> {company.rejectionReason}
                                        </p>
                                    </div>
                                )}

                                {/* Action Button */}
                                <Link
                                    href={`/admin/companies/${company.id}`}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition font-medium text-sm"
                                >
                                    <Eye className="w-4 h-4" />
                                    Lihat Detail
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
