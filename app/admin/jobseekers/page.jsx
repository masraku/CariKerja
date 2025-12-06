'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
    Users, Search, Filter, UserCheck, UserX, Briefcase, 
    Mail, Phone, MapPin, Calendar, ArrowLeft, Eye,
    ToggleLeft, ToggleRight, Building2
} from 'lucide-react'

export default function AdminJobseekersPage() {
    const router = useRouter()
    const [jobseekers, setJobseekers] = useState([])
    const [filteredJobseekers, setFilteredJobseekers] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [stats, setStats] = useState({
        total: 0,
        employed: 0,
        lookingForJob: 0,
        profileCompleted: 0
    })

    useEffect(() => {
        loadJobseekers()
    }, [])

    useEffect(() => {
        filterJobseekers()
    }, [jobseekers, searchQuery, statusFilter])

    const loadJobseekers = async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch('/api/admin/jobseekers', {
                headers: { 'Authorization': `Bearer ${token}` }
            })

            const data = await response.json()

            if (data.success) {
                setJobseekers(data.data.jobseekers)
                calculateStats(data.data.jobseekers)
            }
        } catch (error) {
            console.error('Failed to load jobseekers:', error)
        } finally {
            setLoading(false)
        }
    }

    const calculateStats = (data) => {
        setStats({
            total: data.length,
            employed: data.filter(js => js.isEmployed).length,
            lookingForJob: data.filter(js => js.isLookingForJob).length,
            profileCompleted: data.filter(js => js.profileCompleted).length
        })
    }

    const filterJobseekers = () => {
        let filtered = [...jobseekers]

        // Apply search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            filtered = filtered.filter(js => 
                js.firstName?.toLowerCase().includes(query) ||
                js.lastName?.toLowerCase().includes(query) ||
                js.email?.toLowerCase().includes(query) ||
                js.city?.toLowerCase().includes(query) ||
                js.currentTitle?.toLowerCase().includes(query)
            )
        }

        // Apply status filter
        if (statusFilter === 'employed') {
            filtered = filtered.filter(js => js.isEmployed)
        } else if (statusFilter === 'unemployed') {
            filtered = filtered.filter(js => !js.isEmployed)
        } else if (statusFilter === 'looking') {
            filtered = filtered.filter(js => js.isLookingForJob)
        } else if (statusFilter === 'not-looking') {
            filtered = filtered.filter(js => !js.isLookingForJob)
        }

        setFilteredJobseekers(filtered)
    }

    const formatDate = (dateString) => {
        if (!dateString) return '-'
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
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

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push('/admin')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Manajemen Jobseekers</h1>
                        <p className="text-gray-600">Monitor semua pencari kerja yang terdaftar</p>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                            <div className="text-gray-600 text-sm">Total Jobseekers</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-green-200 rounded-xl p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <UserCheck className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900">{stats.employed}</div>
                            <div className="text-gray-600 text-sm">Sudah Bekerja</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-yellow-200 rounded-xl p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <Briefcase className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900">{stats.lookingForJob}</div>
                            <div className="text-gray-600 text-sm">Masih Cari Kerja</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-purple-200 rounded-xl p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <UserCheck className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900">{stats.profileCompleted}</div>
                            <div className="text-gray-600 text-sm">Profile Lengkap</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Cari nama, email, kota, atau posisi..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-gray-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                        >
                            <option value="all">Semua Status</option>
                            <option value="employed">Sudah Bekerja</option>
                            <option value="unemployed">Belum Bekerja</option>
                            <option value="looking">Aktif Cari Kerja</option>
                            <option value="not-looking">Tidak Aktif Cari</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Jobseekers Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Jobseeker</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Kontak</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status Kerja</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Cari Kerja</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Lamaran</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Bergabung</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredJobseekers.map((js) => (
                                <tr key={js.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {js.photo ? (
                                                <img 
                                                    src={js.photo} 
                                                    alt={js.firstName}
                                                    className="w-10 h-10 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                                                    {js.firstName?.charAt(0) || 'U'}
                                                </div>
                                            )}
                                            <div>
                                                <div className="font-medium text-gray-900">
                                                    {js.firstName} {js.lastName}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {js.currentTitle || 'No title'}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-1 text-sm text-gray-600">
                                                <Mail className="w-4 h-4" />
                                                <span className="truncate max-w-[180px]">{js.email}</span>
                                            </div>
                                            {js.phone && (
                                                <div className="flex items-center gap-1 text-sm text-gray-600">
                                                    <Phone className="w-4 h-4" />
                                                    <span>{js.phone}</span>
                                                </div>
                                            )}
                                            {js.city && (
                                                <div className="flex items-center gap-1 text-sm text-gray-600">
                                                    <MapPin className="w-4 h-4" />
                                                    <span>{js.city}</span>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {js.isEmployed ? (
                                            <div>
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                                    <UserCheck className="w-3 h-3" />
                                                    Bekerja
                                                </span>
                                                {js.employedCompany && (
                                                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                                        <Building2 className="w-3 h-3" />
                                                        {js.employedCompany}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                                                <UserX className="w-3 h-3" />
                                                Belum Bekerja
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {js.isLookingForJob ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                                <ToggleRight className="w-3 h-3" />
                                                Aktif
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                                                <ToggleLeft className="w-3 h-3" />
                                                Tidak Aktif
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm">
                                            <div className="font-medium text-gray-900">{js.totalApplications} lamaran</div>
                                            <div className="text-xs text-gray-500">
                                                <span className="text-green-600">{js.acceptedCount} diterima</span>
                                                {' • '}
                                                <span className="text-yellow-600">{js.pendingCount} pending</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1 text-sm text-gray-600">
                                            <Calendar className="w-4 h-4" />
                                            {formatDate(js.joinedAt)}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredJobseekers.length === 0 && (
                    <div className="text-center py-12">
                        <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada jobseeker</h3>
                        <p className="text-gray-600">
                            {searchQuery || statusFilter !== 'all' 
                                ? 'Coba ubah filter pencarian'
                                : 'Belum ada pencari kerja yang terdaftar'}
                        </p>
                    </div>
                )}
            </div>

            {/* Showing count */}
            <div className="mt-4 text-sm text-gray-600">
                Menampilkan {filteredJobseekers.length} dari {jobseekers.length} jobseekers
            </div>
        </div>
    )
}
