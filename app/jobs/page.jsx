'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
    Search, MapPin, Briefcase, Building2, Filter, X, 
    Bookmark, BookmarkCheck, Calendar, Users, ChevronLeft, ChevronRight,
    Banknote, CheckCircle, ArrowRight, ArrowLeft
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
    const [showDetail, setShowDetail] = useState(false) // Mobile detail view toggle
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
                // Auto-select first job on desktop
                if (data.data.length > 0 && !selectedJob && window.innerWidth >= 1024) {
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

    const toggleSaveJob = (jobId, e) => {
        e?.stopPropagation()
        e?.preventDefault()
        setSavedJobs(prev => prev.includes(jobId) ? prev.filter(id => id !== jobId) : [...prev, jobId])
    }

    const selectJob = (job) => {
        setSelectedJob(job)
        if (window.innerWidth < 1024) {
            setShowDetail(true)
        }
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

    // Job Card Component
    const JobCard = ({ job, isSelected }) => (
        <div
            onClick={() => selectJob(job)}
            className={`bg-white rounded-xl p-4 cursor-pointer transition border-2 ${
                isSelected
                    ? 'border-blue-500 shadow-md'
                    : 'border-transparent hover:border-slate-200 hover:shadow-sm'
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
                    onClick={(e) => toggleSaveJob(job.id, e)}
                    className={`p-1.5 rounded-lg transition flex-shrink-0 ${
                        savedJobs.includes(job.id) ? 'text-blue-600' : 'text-slate-300 hover:text-slate-400'
                    }`}
                >
                    {savedJobs.includes(job.id) ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                </button>
            </div>
        </div>
    )

    // Job Detail Component
    const JobDetail = ({ job }) => (
        <div className="h-full overflow-y-auto">
            {/* Header */}
            <div className="p-4 lg:p-6 border-b border-slate-100">
                {/* Mobile Back Button */}
                <button
                    onClick={() => setShowDetail(false)}
                    className="lg:hidden flex items-center gap-2 text-slate-600 mb-4"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Kembali
                </button>

                <div className="flex items-start gap-4">
                    <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {job.logo?.startsWith('http') ? (
                            <img src={job.logo} alt={job.company} className="w-full h-full object-cover" />
                        ) : (
                            <Building2 className="w-7 h-7 text-slate-400" />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-lg lg:text-xl font-bold text-slate-800">{job.title}</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-slate-600 text-sm">{job.company}</span>
                            {job.companyVerified && (
                                <CheckCircle className="w-4 h-4 text-blue-500" />
                            )}
                        </div>
                    </div>
                    <button
                        onClick={(e) => toggleSaveJob(job.id, e)}
                        className={`p-2.5 rounded-xl transition hidden lg:flex ${
                            savedJobs.includes(job.id)
                                ? 'bg-blue-100 text-blue-600'
                                : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                        }`}
                    >
                        {savedJobs.includes(job.id) ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
                    </button>
                </div>

                {/* Quick Info */}
                <div className="flex flex-wrap gap-2 mt-4">
                    <span className={`px-3 py-1.5 text-xs lg:text-sm font-medium rounded-lg ${getJobTypeBadgeClass(job.type)}`}>
                        {formatJobType(job.type)}
                    </span>
                    <span className="px-3 py-1.5 text-xs lg:text-sm bg-slate-100 text-slate-600 rounded-lg flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        {job.location}
                    </span>
                    {job.remote && (
                        <span className="px-3 py-1.5 text-xs lg:text-sm bg-emerald-100 text-emerald-700 rounded-lg">
                            Remote
                        </span>
                    )}
                    {job.salary && (
                        <span className="px-3 py-1.5 text-xs lg:text-sm bg-emerald-50 text-emerald-700 rounded-lg flex items-center gap-1.5 font-medium">
                            <Banknote className="w-3.5 h-3.5" />
                            {job.salary}
                        </span>
                    )}
                </div>

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-3 lg:gap-4 mt-4 text-xs lg:text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {getTimeSince(job.postedDate)}
                    </span>
                    <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {job.applicants || 0} pelamar
                    </span>
                    {job.experience && (
                        <span className="flex items-center gap-1">
                            <Briefcase className="w-4 h-4" />
                            {job.experience}
                        </span>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-5">
                    <Link
                        href={`/jobs/${job.slug}`}
                        className="flex-1 flex items-center justify-center gap-2 px-4 lg:px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition text-sm lg:text-base"
                    >
                        Lamar Sekarang
                        <ArrowRight className="w-4 h-4 lg:w-5 lg:h-5" />
                    </Link>
                    <button
                        onClick={(e) => toggleSaveJob(job.id, e)}
                        className={`lg:hidden px-4 py-3 rounded-xl transition ${
                            savedJobs.includes(job.id)
                                ? 'bg-blue-100 text-blue-600'
                                : 'bg-slate-100 text-slate-600'
                        }`}
                    >
                        {savedJobs.includes(job.id) ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 lg:p-6">
                {/* Description */}
                {job.description && (
                    <div className="mb-6">
                        <h2 className="text-base lg:text-lg font-semibold text-slate-800 mb-3">Deskripsi Pekerjaan</h2>
                        <div className="text-sm lg:text-base text-slate-600 leading-relaxed whitespace-pre-line">
                            {job.description}
                        </div>
                    </div>
                )}

                {/* Requirements */}
                {job.requirements && (
                    <div className="mb-6">
                        <h2 className="text-base lg:text-lg font-semibold text-slate-800 mb-3">Persyaratan</h2>
                        <div className="text-sm lg:text-base text-slate-600 leading-relaxed whitespace-pre-line">
                            {job.requirements}
                        </div>
                    </div>
                )}

                {/* Benefits */}
                {job.benefits?.length > 0 && (
                    <div className="mb-6">
                        <h2 className="text-base lg:text-lg font-semibold text-slate-800 mb-3">Benefit</h2>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                            {job.benefits.map((benefit, i) => (
                                <div key={i} className="flex items-center gap-2 p-3 bg-emerald-50 rounded-lg">
                                    <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                                    <span className="text-sm text-slate-700">{benefit}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Skills */}
                {job.skills?.length > 0 && (
                    <div>
                        <h2 className="text-base lg:text-lg font-semibold text-slate-800 mb-3">Skills</h2>
                        <div className="flex flex-wrap gap-2">
                            {job.skills.map((skill, i) => (
                                <span key={i} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Top Filter Bar */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 lg:px-6 py-3 lg:py-4">
                    <div className="flex flex-col lg:flex-row gap-3 lg:gap-4">
                        {/* Search */}
                        <div className="flex-1 flex gap-2 lg:gap-3">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 lg:left-4 top-1/2 -translate-y-1/2 w-4 lg:w-5 h-4 lg:h-5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Cari posisi, skill..."
                                    className="w-full pl-10 lg:pl-12 pr-3 lg:pr-4 py-2.5 lg:py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800 placeholder-slate-400 text-sm lg:text-base"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <button
                                onClick={() => setShowFilters(true)}
                                className="lg:hidden px-4 py-2.5 rounded-xl bg-slate-100 text-slate-600 flex items-center gap-2"
                            >
                                <Filter className="w-4 h-4" />
                                {activeFiltersCount > 0 && (
                                    <span className="w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                                        {activeFiltersCount}
                                    </span>
                                )}
                            </button>
                        </div>

                        {/* Desktop Filter Buttons */}
                        <div className="hidden lg:flex items-center gap-2 flex-wrap">
                            {/* Location */}
                            <div className="w-40 relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Lokasi..."
                                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-800 placeholder-slate-400 text-sm"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                />
                            </div>

                            {/* Job Type Filters */}
                            {jobTypes.slice(0, 3).map(type => (
                                <button
                                    key={type}
                                    onClick={() => handleFilterChange('jobType', type)}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
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
                                className="px-3 py-2 rounded-lg text-sm font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition flex items-center gap-2"
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
                                className="px-3 py-2.5 bg-slate-100 border-0 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-blue-500"
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

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4">
                {/* Mobile: Single column, Desktop: Split view */}
                <div className="lg:flex lg:gap-4" style={{ minHeight: 'calc(100vh - 160px)' }}>
                    
                    {/* Job List - Full width on mobile, left panel on desktop */}
                    <div className={`lg:w-96 lg:flex-shrink-0 ${showDetail ? 'hidden lg:block' : 'block'}`}>
                        <div className="text-sm text-slate-500 mb-3">
                            {pagination.totalCount.toLocaleString()} lowongan ditemukan
                        </div>

                        <div className="lg:h-[calc(100vh-200px)] lg:overflow-y-auto lg:pr-2">
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
                                        <JobCard key={job.id} job={job} isSelected={selectedJob?.id === job.id} />
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
                    </div>

                    {/* Job Detail - Full screen on mobile, right panel on desktop */}
                    <div className={`flex-1 ${showDetail ? 'block' : 'hidden lg:block'}`}>
                        <div className="bg-white rounded-2xl border border-slate-200 lg:h-[calc(100vh-200px)] overflow-hidden">
                            {selectedJob ? (
                                <JobDetail job={selectedJob} />
                            ) : (
                                <div className="h-full flex items-center justify-center p-8">
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
            </div>

            {/* Mobile Filter Modal */}
            {showFilters && (
                <div className="fixed inset-0 z-50">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowFilters(false)}></div>
                    <div className="absolute inset-y-0 right-0 w-full max-w-sm bg-white shadow-2xl overflow-y-auto">
                        <div className="p-5">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-slate-800">Filter</h3>
                                <button onClick={() => setShowFilters(false)} className="p-2 rounded-xl hover:bg-slate-100">
                                    <X className="w-5 h-5 text-slate-500" />
                                </button>
                            </div>

                            {/* Location */}
                            <div className="mb-6">
                                <h4 className="text-sm font-semibold text-slate-800 mb-3">Lokasi</h4>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Cari lokasi..."
                                        className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                    />
                                </div>
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
                                            <span className="text-slate-600 text-sm">{formatJobType(type)}</span>
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
                                            <span className="text-slate-600 text-sm">{level}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Sort */}
                            <div className="mb-8">
                                <h4 className="text-sm font-semibold text-slate-800 mb-3">Urutkan</h4>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700"
                                >
                                    <option value="latest">Terbaru</option>
                                    <option value="salary">Gaji Tertinggi</option>
                                    <option value="popular">Terpopuler</option>
                                </select>
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