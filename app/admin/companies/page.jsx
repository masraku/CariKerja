'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
    Building2, CheckCircle, XCircle, Clock, Search, 
    LayoutGrid, List, MapPin, Users, Briefcase, 
    Mail, Eye, Calendar
} from 'lucide-react'

export default function AdminCompaniesPage() {
    const router = useRouter()
    const [companies, setCompanies] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('pending')
    const [searchQuery, setSearchQuery] = useState('')
    const [viewMode, setViewMode] = useState('grid') // 'grid' or 'table'

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
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    <CheckCircle className="w-3 h-3" />
                    Verified
                </span>
            )
        }
        if (company.status === 'REJECTED') {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                    <XCircle className="w-3 h-3" />
                    Rejected
                </span>
            )
        }
        if (company.status === 'PENDING_RESUBMISSION') {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    <Clock className="w-3 h-3" />
                    Resubmission
                </span>
            )
        }
        return (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                <Clock className="w-3 h-3" />
                Pending
            </span>
        )
    }

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Company Verification</h1>
                <p className="text-gray-600">Review dan verifikasi perusahaan yang mendaftar</p>
            </div>

            {/* Filters & View Toggle */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
                <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
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
                        <button
                            onClick={() => setFilter('resubmission')}
                            className={`px-4 py-2 rounded-lg font-medium transition ${
                                filter === 'resubmission'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            <Clock className="w-4 h-4 inline mr-1" />
                            Resubmission
                        </button>
                    </div>

                    <div className="flex gap-4 items-center">
                        {/* View Toggle */}
                        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-md transition ${
                                    viewMode === 'grid'
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                                title="Grid View"
                            >
                                <LayoutGrid className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('table')}
                                className={`p-2 rounded-md transition ${
                                    viewMode === 'table'
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                                title="Table View"
                            >
                                <List className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Search */}
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cari perusahaan..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Loading State */}
            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white rounded-xl h-24 animate-pulse border border-gray-200"></div>
                    ))}
                </div>
            ) : filteredCompanies.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                    <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">Tidak ada perusahaan ditemukan</p>
                </div>
            ) : viewMode === 'grid' ? (
                /* Grid View */
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCompanies.map(company => (
                        <div 
                            key={company.id} 
                            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition group"
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
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-gray-900 mb-1 flex items-center gap-2 truncate">
                                        {company.name}
                                        {company.verified && (
                                            <CheckCircle className="w-5 h-5 text-blue-600 fill-current flex-shrink-0" />
                                        )}
                                    </h3>
                                    <p className="text-sm text-gray-600 truncate">{company.industry || 'Belum dilengkapi'}</p>
                                </div>
                            </div>

                            {/* Company Info */}
                            <div className="space-y-2 mb-4 text-sm">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                    <span className="truncate">{company.city || 'Belum dilengkapi'}, {company.province || ''}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Users className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                    <span>{company.companySize || 'Belum dilengkapi'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Briefcase className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                    <span>{company.jobsCount || 0} lowongan</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                    <span className="truncate text-xs">{company.recruiterEmail || company.email}</span>
                                </div>
                            </div>

                            {/* Status Badge */}
                            <div className="mb-4">
                                {getStatusBadge(company)}
                                {filter === 'rejected' && company.rejectionReason && (
                                    <p className="text-xs text-red-600 mt-2 line-clamp-2">
                                        Alasan: {company.rejectionReason}
                                    </p>
                                )}
                            </div>

                            {/* Preview Button Only */}
                            <Link
                                href={`/admin/companies/${company.id}`}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm"
                            >
                                <Eye className="w-4 h-4" />
                                Preview Detail
                            </Link>
                        </div>
                    ))}
                </div>
            ) : (
                /* Table View */
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Perusahaan
                                    </th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Industri
                                    </th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Lokasi
                                    </th>
                                    <th className="text-center px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Lowongan
                                    </th>
                                    <th className="text-center px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Terdaftar
                                    </th>
                                    <th className="text-center px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredCompanies.map(company => (
                                    <tr key={company.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {company.logo ? (
                                                    <img src={company.logo} alt={company.name} className="w-10 h-10 rounded-lg object-cover" />
                                                ) : (
                                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                        <Building2 className="w-5 h-5 text-blue-600" />
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-medium text-gray-900 flex items-center gap-1">
                                                        {company.name}
                                                        {company.verified && <CheckCircle className="w-4 h-4 text-blue-600" />}
                                                    </p>
                                                    <p className="text-xs text-gray-500">{company.recruiterEmail || company.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {company.industry || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {company.city || '-'}{company.province ? `, ${company.province}` : ''}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center gap-1 text-sm font-medium text-gray-700">
                                                <Briefcase className="w-4 h-4 text-gray-400" />
                                                {company.jobsCount || 0}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {getStatusBadge(company)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                {company.createdAt ? formatDate(company.createdAt) : '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <Link
                                                href={`/admin/companies/${company.id}`}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-100 transition"
                                            >
                                                <Eye className="w-4 h-4" />
                                                Preview
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Results Count */}
            {!loading && (
                <div className="mt-6 text-center text-gray-600">
                    Menampilkan {filteredCompanies.length} dari {companies.length} perusahaan
                </div>
            )}
        </div>
    )
}
