'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
    Search, MapPin, Briefcase, Clock, Building2, Filter, X, 
    Bookmark, BookmarkCheck, Calendar, Users, ChevronLeft, ChevronRight,
    Banknote, Zap, CheckCircle, ArrowRight
} from 'lucide-react'

const JobsPage = () => {
    const [searchQuery, setSearchQuery] = useState('')
    const [location, setLocation] = useState('')
    const [showFilters, setShowFilters] = useState(false)
    const [savedJobs, setSavedJobs] = useState([])
    const [sortBy, setSortBy] = useState('latest')
    const [currentPage, setCurrentPage] = useState(1)
    const [loading, setLoading] = useState(true)
    const [jobs, setJobs] = useState([])
    const [selectedJob, setSelectedJob] = useState(null)
    const [pagination, setPagination] = useState({
        page: 1, limit: 10, totalCount: 0, totalPages: 0
    })
    
    const [filters, setFilters] = useState({
        jobType: [], experience: [], salary: '', category: []
    })

    const jobTypes = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'FREELANCE', 'INTERNSHIP']
    const experienceLevels = ['0-1 tahun', '1-3 tahun', '3-5 tahun', '5+ tahun']

    const fetchJobs = async () => {
        try {
            setLoading(true)
            const params = new URLSearchParams()
            if (searchQuery) params.append('search', searchQuery)
            if (location) params.append('location', location)
            if (filters.jobType.length > 0) params.append('jobType', filters.jobType.join(','))
            if (filters.experience.length > 0) params.append('experience', filters.experience.join(','))
            if (sortBy) params.append('sortBy', sortBy)
            params.append('page', currentPage.toString())
            params.append('limit', '20')

            const response = await fetch(`/api/jobs?${params.toString()}`, { credentials: 'include' })
            const data = await response.json()
            if (data.success) {
                setJobs(data.data)
                setPagination(data.pagination)
                // Auto-select first job
                if (data.data.length > 0 && !selectedJob) {
                    setSelectedJob(data.data[0])
                }
            }
        } catch (error) {
            console.error('Error fetching jobs:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchJobs() }, [searchQuery, location, filters, sortBy, currentPage])
    useEffect(() => {
        const saved = localStorage.getItem('savedJobs')
        if (saved) setSavedJobs(JSON.parse(saved))
    }, [])
    useEffect(() => { localStorage.setItem('savedJobs', JSON.stringify(savedJobs)) }, [savedJobs])

    const handleFilterChange = (type, value) => {
        setFilters(prev => {
            const currentValues = prev[type]
            if (Array.isArray(currentValues)) {
                return currentValues.includes(value)
                    ? { ...prev, [type]: currentValues.filter(v => v !== value) }
                    : { ...prev, [type]: [...currentValues, value] }
            }
            return { ...prev, [type]: value }
        })
        setCurrentPage(1)
    }

    const clearFilters = () => {
        setFilters({ jobType: [], experience: [], salary: '', category: [] })
        setSearchQuery('')
        setLocation('')
        setCurrentPage(1)
    }

    const toggleSaveJob = (jobId) => {
        setSavedJobs(prev => prev.includes(jobId) ? prev.filter(id => id !== jobId) : [...prev, jobId])
    }

    const getTimeSince = (date) => {
        const days = Math.floor((new Date() - new Date(date)) / (1000 * 60 * 60 * 24))
        if (days === 0) return 'Hari ini'
        if (days === 1) return 'Kemarin'
        return `${days} hari lalu`
    }

    const formatJobType = (type) => {
        const map = { 'FULL_TIME': 'Full Time', 'PART_TIME': 'Part Time', 'CONTRACT': 'Contract', 'FREELANCE': 'Freelance', 'INTERNSHIP': 'Internship' }
        return map[type] || type
    }

    const formatSalary = (min, max) => {
        const format = (num) => {
            if (!num) return null
            if (num >= 1000000) return `${(num / 1000000).toFixed(0)} jt`
            if (num >= 1000) return `${(num / 1000).toFixed(0)} rb`
            return num
        }
        if (min && max) return `Rp ${format(min)} - ${format(max)}`
        if (min) return `Rp ${format(min)}+`
        return 'Nego'
    }

    const getJobTypeBadgeClass = (type) => {
        const classes = {
            'FULL_TIME': 'bg-blue-100 text-blue-700',
            'PART_TIME': 'bg-purple-100 text-purple-700',
            'CONTRACT': 'bg-orange-100 text-orange-700',
            'FREELANCE': 'bg-teal-100 text-teal-700',
            'INTERNSHIP': 'bg-pink-100 text-pink-700'
        }
        return classes[type] || 'bg-slate-100 text-slate-700'
    }

    const activeFiltersCount = filters.jobType.length + filters.experience.length

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Top Filter Bar */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4">
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 flex gap-3">
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Posisi, skill, atau perusahaan..."
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800 placeholder-slate-400"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="w-48 relative hidden md:block">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Lokasi..."
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800 placeholder-slate-400"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Filter Buttons */}
                        <div className="flex items-center gap-2 flex-wrap">
                            {/* Job Type Filters */}
                            {jobTypes.slice(0, 3).map(type => (
                                <button
                                    key={type}
                                    onClick={() => handleFilterChange('jobType', type)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                                        filters.jobType.includes(type)
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                >
                                    {formatJobType(type)}
                                </button>
                            ))}
                            
                            {/* More Filters */}
                            <button
                                onClick={() => setShowFilters(true)}
                                className="px-4 py-2 rounded-lg text-sm font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition flex items-center gap-2"
                            >
                                <Filter className="w-4 h-4" />
                                Filter
                                {activeFiltersCount > 0 && (
                                    <span className="w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                                        {activeFiltersCount}
                                    </span>
                                )}
                            </button>

                            {/* Sort */}
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-4 py-2.5 bg-slate-100 border-0 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="latest">Terbaru</option>
                                <option value="salary">Gaji Tertinggi</option>
                                <option value="popular">Terpopuler</option>
                            </select>

                            {activeFiltersCount > 0 && (
                                <button
                                    onClick={clearFilters}
                                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                                >
                                    Reset
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content - Split View */}
            <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4">
                <div className="flex gap-4" style={{ height: 'calc(100vh - 140px)' }}>
                    
                    {/* Left Panel - Job List (Scrollable) */}
                    <div className="w-96 flex-shrink-0 overflow-y-auto pr-2 scrollbar-thin">
                        <div className="text-sm text-slate-500 mb-3">
                            {pagination.totalCount.toLocaleString()} lowongan ditemukan
                        </div>

                        {loading ? (
                            <div className="space-y-3">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className="bg-white rounded-xl p-4 animate-pulse border border-slate-100">
                                        <div className="flex gap-3">
                                            <div className="w-12 h-12 bg-slate-200 rounded-lg flex-shrink-0"></div>
                                            <div className="flex-1">
                                                <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                                                <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : jobs.length === 0 ? (
                            <div className="bg-white rounded-xl p-8 text-center border border-slate-100">
                                <Briefcase className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                                <h3 className="font-semibold text-slate-800 mb-1">Tidak ada lowongan</h3>
                                <p className="text-sm text-slate-500">Coba ubah filter pencarian</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {jobs.map((job) => (
                                    <div
                                        key={job.id}
                                        onClick={() => setSelectedJob(job)}
                                        className={`bg-white rounded-xl p-4 cursor-pointer transition border-2 ${
                                            selectedJob?.id === job.id
                                                ? 'border-blue-500 shadow-md'
                                                : 'border-transparent hover:border-slate-200'
                                        }`}
                                    >
                                        <div className="flex gap-3">
                                            <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                                                {job.logo?.startsWith('http') ? (
                                                    <img src={job.logo} alt={job.company} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Building2 className="w-6 h-6 text-slate-400" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-slate-800 text-sm truncate">
                                                    {job.title}
                                                </h3>
                                                <div className="flex items-center gap-1 text-slate-500 text-xs mt-0.5">
                                                    <span className="truncate">{job.company}</span>
                                                    {job.companyVerified && (
                                                        <CheckCircle className="w-3 h-3 text-blue-500 flex-shrink-0" />
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="w-3 h-3" />
                                                        {job.location}
                                                    </span>
                                                    <span>•</span>
                                                    <span>{getTimeSince(job.postedDate)}</span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); toggleSaveJob(job.id) }}
                                                className={`p-1.5 rounded-lg transition flex-shrink-0 ${
                                                    savedJobs.includes(job.id) ? 'text-blue-600' : 'text-slate-300 hover:text-slate-400'
                                                }`}
                                            >
                                                {savedJobs.includes(job.id) ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {/* Pagination */}
                                {pagination.totalPages > 1 && (
                                    <div className="flex items-center justify-center gap-2 py-4">
                                        <button
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            disabled={!pagination.hasPrevPage}
                                            className="p-2 rounded-lg border border-slate-200 bg-white disabled:opacity-50"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </button>
                                        <span className="text-sm text-slate-600">
                                            {currentPage} / {pagination.totalPages}
                                        </span>
                                        <button
                                            onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
                                            disabled={!pagination.hasNextPage}
                                            className="p-2 rounded-lg border border-slate-200 bg-white disabled:opacity-50"
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right Panel - Job Detail */}
                    <div className="flex-1 bg-white rounded-2xl border border-slate-200 overflow-hidden">
                        {selectedJob ? (
                            <div className="h-full overflow-y-auto">
                                {/* Header */}
                                <div className="p-6 border-b border-slate-100">
                                    <div className="flex items-start gap-4">
                                        <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                                            {selectedJob.logo?.startsWith('http') ? (
                                                <img src={selectedJob.logo} alt={selectedJob.company} className="w-full h-full object-cover" />
                                            ) : (
                                                <Building2 className="w-8 h-8 text-slate-400" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h1 className="text-xl font-bold text-slate-800">{selectedJob.title}</h1>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-slate-600">{selectedJob.company}</span>
                                                {selectedJob.companyVerified && (
                                                    <CheckCircle className="w-4 h-4 text-blue-500" />
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => toggleSaveJob(selectedJob.id)}
                                            className={`p-2.5 rounded-xl transition ${
                                                savedJobs.includes(selectedJob.id)
                                                    ? 'bg-blue-100 text-blue-600'
                                                    : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                            }`}
                                        >
                                            {savedJobs.includes(selectedJob.id) ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
                                        </button>
                                    </div>

                                    {/* Quick Info */}
                                    <div className="flex flex-wrap gap-3 mt-4">
                                        <span className={`px-3 py-1.5 text-sm font-medium rounded-lg ${getJobTypeBadgeClass(selectedJob.type)}`}>
                                            {formatJobType(selectedJob.type)}
                                        </span>
                                        <span className="px-3 py-1.5 text-sm bg-slate-100 text-slate-600 rounded-lg flex items-center gap-1.5">
                                            <MapPin className="w-4 h-4" />
                                            {selectedJob.location}
                                        </span>
                                        {selectedJob.remote && (
                                            <span className="px-3 py-1.5 text-sm bg-emerald-100 text-emerald-700 rounded-lg">
                                                Remote
                                            </span>
                                        )}
                                        {selectedJob.salary && (
                                            <span className="px-3 py-1.5 text-sm bg-emerald-50 text-emerald-700 rounded-lg flex items-center gap-1.5 font-medium">
                                                <Banknote className="w-4 h-4" />
                                                {selectedJob.salary}
                                            </span>
                                        )}
                                    </div>

                                    {/* Meta Info */}
                                    <div className="flex items-center gap-4 mt-4 text-sm text-slate-500">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            {getTimeSince(selectedJob.postedDate)}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Users className="w-4 h-4" />
                                            {selectedJob.applicants || 0} pelamar
                                        </span>
                                        {selectedJob.experience && (
                                            <span className="flex items-center gap-1">
                                                <Briefcase className="w-4 h-4" />
                                                {selectedJob.experience}
                                            </span>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-3 mt-6">
                                        <Link
                                            href={`/jobs/${selectedJob.slug}`}
                                            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition"
                                        >
                                            Lamar Sekarang
                                            <ArrowRight className="w-5 h-5" />
                                        </Link>
                                        <Link
                                            href={`/jobs/${selectedJob.slug}`}
                                            className="px-6 py-3 border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition"
                                        >
                                            Detail Lengkap
                                        </Link>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6">
                                    {/* Description */}
                                    {selectedJob.description && (
                                        <div className="mb-6">
                                            <h2 className="text-lg font-semibold text-slate-800 mb-3">Deskripsi Pekerjaan</h2>
                                            <div className="text-slate-600 leading-relaxed whitespace-pre-line">
                                                {selectedJob.description}
                                            </div>
                                        </div>
                                    )}

                                    {/* Requirements */}
                                    {selectedJob.requirements && (
                                        <div className="mb-6">
                                            <h2 className="text-lg font-semibold text-slate-800 mb-3">Persyaratan</h2>
                                            <div className="text-slate-600 leading-relaxed whitespace-pre-line">
                                                {selectedJob.requirements}
                                            </div>
                                        </div>
                                    )}

                                    {/* Benefits */}
                                    {selectedJob.benefits?.length > 0 && (
                                        <div className="mb-6">
                                            <h2 className="text-lg font-semibold text-slate-800 mb-3">Benefit</h2>
                                            <div className="grid grid-cols-2 gap-2">
                                                {selectedJob.benefits.map((benefit, i) => (
                                                    <div key={i} className="flex items-center gap-2 p-3 bg-emerald-50 rounded-lg">
                                                        <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                                                        <span className="text-sm text-slate-700">{benefit}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Skills */}
                                    {selectedJob.skills?.length > 0 && (
                                        <div>
                                            <h2 className="text-lg font-semibold text-slate-800 mb-3">Skills</h2>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedJob.skills.map((skill, i) => (
                                                    <span key={i} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center">
                                <div className="text-center">
                                    <Briefcase className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-slate-800 mb-1">Pilih Lowongan</h3>
                                    <p className="text-slate-500">Klik lowongan di sebelah kiri untuk melihat detail</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Filter Modal */}
            {showFilters && (
                <div className="fixed inset-0 z-50">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowFilters(false)}></div>
                    <div className="absolute inset-y-0 right-0 w-full max-w-sm bg-white shadow-2xl overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-slate-800">Filter</h3>
                                <button onClick={() => setShowFilters(false)} className="p-2 rounded-xl hover:bg-slate-100">
                                    <X className="w-5 h-5 text-slate-500" />
                                </button>
                            </div>

                            {/* Job Type */}
                            <div className="mb-6">
                                <h4 className="text-sm font-semibold text-slate-800 mb-3">Tipe Pekerjaan</h4>
                                <div className="space-y-2">
                                    {jobTypes.map(type => (
                                        <label key={type} className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={filters.jobType.includes(type)}
                                                onChange={() => handleFilterChange('jobType', type)}
                                                className="w-5 h-5 rounded border-slate-300 text-blue-600"
                                            />
                                            <span className="text-slate-600">{formatJobType(type)}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Experience */}
                            <div className="mb-8">
                                <h4 className="text-sm font-semibold text-slate-800 mb-3">Pengalaman</h4>
                                <div className="space-y-2">
                                    {experienceLevels.map(level => (
                                        <label key={level} className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={filters.experience.includes(level)}
                                                onChange={() => handleFilterChange('experience', level)}
                                                className="w-5 h-5 rounded border-slate-300 text-blue-600"
                                            />
                                            <span className="text-slate-600">{level}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    onClick={clearFilters}
                                    className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition"
                                >
                                    Reset
                                </button>
                                <button
                                    onClick={() => setShowFilters(false)}
                                    className="flex-1 px-4 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition"
                                >
                                    Terapkan
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default JobsPage