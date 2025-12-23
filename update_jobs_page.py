
import os

content = r"""'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
    Search, MapPin, Briefcase, Building2, Filter, X, 
    Bookmark, BookmarkCheck, Calendar, Users, ChevronLeft, ChevronRight,
    Banknote, CheckCircle, ArrowRight, ArrowLeft, Clock, Globe, Sparkles
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

    const getJobTypeBadgeClass = (type) => {
        const classes = {
            'FULL_TIME': 'bg-blue-50 text-blue-700 border-blue-100',
            'PART_TIME': 'bg-purple-50 text-purple-700 border-purple-100',
            'CONTRACT': 'bg-orange-50 text-orange-700 border-orange-100',
            'FREELANCE': 'bg-teal-50 text-teal-700 border-teal-100',
            'INTERNSHIP': 'bg-pink-50 text-pink-700 border-pink-100'
        }
        return classes[type] || 'bg-gray-50 text-gray-700 border-gray-100'
    }

    const activeFiltersCount = filters.jobType.length + filters.experience.length

    // Job Card Component
    const JobCard = ({ job, isSelected }) => (
        <div
            onClick={() => selectJob(job)}
            className={`group relative bg-white rounded-2xl p-5 cursor-pointer transition-all duration-300 border ${
                isSelected
                    ? 'border-blue-500 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500 z-10'
                    : 'border-gray-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-0.5'
            }`}
        >
            <div className="flex gap-4">
                <div className="w-14 h-14 rounded-xl bg-white shadow-sm border border-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                    {job.logo?.startsWith('http') ? (
                        <img src={job.logo} alt={job.company} className="w-full h-full object-cover" />
                    ) : (
                        <Building2 className="w-7 h-7 text-gray-300" />
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className={`font-bold text-base truncate mb-1 transition-colors ${isSelected ? 'text-blue-600' : 'text-gray-900 group-hover:text-blue-600'}`}>
                        {job.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-gray-600 text-sm mb-3">
                        <span className="truncate font-medium">{job.company}</span>
                        {job.companyVerified && (
                            <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">
                            <MapPin className="w-3 h-3" />
                            {job.location}
                        </span>
                        <span className="flex items-center gap-1 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">
                            <Clock className="w-3 h-3" />
                            {getTimeSince(job.postedDate)}
                        </span>
                        {job.salary && (
                            <span className="flex items-center gap-1 bg-green-50 text-green-700 px-2.5 py-1 rounded-lg border border-green-100 font-medium">
                                <Banknote className="w-3 h-3" />
                                {job.salary}
                            </span>
                        )}
                    </div>
                </div>
                <button
                    onClick={(e) => toggleSaveJob(job.id, e)}
                    className={`p-2 rounded-xl transition-all flex-shrink-0 h-fit ${
                        savedJobs.includes(job.id) 
                            ? 'text-blue-600 bg-blue-50' 
                            : 'text-gray-300 hover:text-gray-500 hover:bg-gray-50'
                    }`}
                >
                    {savedJobs.includes(job.id) ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
                </button>
            </div>
        </div>
    )

    // Job Detail Component
    const JobDetail = ({ job }) => (
        <div className="h-full overflow-y-auto custom-scrollbar bg-white">
            {/* Header */}
            <div className="relative">
                {/* Cover Background */}
                <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-10"></div>
                
                <div className="px-6 lg:px-8 pb-6 -mt-12 relative">
                    {/* Mobile Back Button */}
                    <button
                        onClick={() => setShowDetail(false)}
                        className="lg:hidden absolute top-4 left-4 p-2 bg-white rounded-full shadow-md text-gray-600 hover:text-gray-900 transition-colors z-20"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>

                    <div className="flex items-end gap-6 mb-6">
                        <div className="w-24 h-24 rounded-2xl bg-white shadow-xl border-4 border-white flex items-center justify-center overflow-hidden flex-shrink-0">
                            {job.logo?.startsWith('http') ? (
                                <img src={job.logo} alt={job.company} className="w-full h-full object-contain" />
                            ) : (
                                <Building2 className="w-10 h-10 text-gray-300" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0 pb-2">
                            <h1 className="text-2xl font-bold text-gray-900 leading-tight mb-1">{job.title}</h1>
                            <div className="flex items-center gap-2">
                                <span className="text-gray-600 font-medium text-lg">{job.company}</span>
                                {job.companyVerified && (
                                    <CheckCircle className="w-5 h-5 text-blue-500" />
                                )}
                            </div>
                        </div>
                        <button
                            onClick={(e) => toggleSaveJob(job.id, e)}
                            className={`p-3 rounded-xl transition-all hidden lg:flex mb-2 ${
                                savedJobs.includes(job.id)
                                    ? 'bg-blue-50 text-blue-600'
                                    : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                            }`}
                        >
                            {savedJobs.includes(job.id) ? <BookmarkCheck className="w-6 h-6" /> : <Bookmark className="w-6 h-6" />}
                        </button>
                    </div>

                    {/* Quick Info */}
                    <div className="flex flex-wrap gap-3">
                        <span className={`px-4 py-2 text-sm font-medium rounded-xl border ${getJobTypeBadgeClass(job.type)}`}>
                            {formatJobType(job.type)}
                        </span>
                        <span className="px-4 py-2 text-sm bg-gray-50 text-gray-600 rounded-xl flex items-center gap-2 border border-gray-100 font-medium">
                            <MapPin className="w-4 h-4" />
                            {job.location}
                        </span>
                        {job.remote && (
                            <span className="px-4 py-2 text-sm bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100 flex items-center gap-2 font-medium">
                                <Globe className="w-4 h-4" />
                                Remote
                            </span>
                        )}
                        {job.salary && (
                            <span className="px-4 py-2 text-sm bg-blue-50 text-blue-700 rounded-xl flex items-center gap-2 font-medium border border-blue-100">
                                <Banknote className="w-4 h-4" />
                                {job.salary}
                            </span>
                        )}
                    </div>

                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center gap-6 mt-6 pt-6 border-t border-gray-100 text-sm text-gray-500">
                        <span className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Diposting {getTimeSince(job.postedDate)}
                        </span>
                        <span className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            {job.applicants || 0} pelamar
                        </span>
                        {job.experience && (
                            <span className="flex items-center gap-2">
                                <Briefcase className="w-4 h-4" />
                                Min. {job.experience}
                            </span>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 mt-8">
                        <Link
                            href={`/jobs/${job.slug}`}
                            className="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 hover:-translate-y-0.5"
                        >
                            Lamar Sekarang
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                        <button
                            onClick={(e) => toggleSaveJob(job.id, e)}
                            className={`lg:hidden px-6 py-4 rounded-xl transition-all border ${
                                savedJobs.includes(job.id)
                                    ? 'bg-blue-50 text-blue-600 border-blue-100'
                                    : 'bg-white text-gray-600 border-gray-200'
                            }`}
                        >
                            {savedJobs.includes(job.id) ? <BookmarkCheck className="w-6 h-6" /> : <Bookmark className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 lg:p-8 space-y-8 bg-white">
                {/* Description */}
                {job.description && (
                    <section>
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                            Deskripsi Pekerjaan
                        </h3>
                        <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: job.description }} />
                    </section>
                )}

                {/* Requirements */}
                {job.requirements && (
                    <section>
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                            Kualifikasi
                        </h3>
                        <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: job.requirements }} />
                    </section>
                )}

                {/* Benefits */}
                {job.benefits && job.benefits.length > 0 && (
                    <section>
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                            Benefit
                        </h3>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {job.benefits.map((benefit, index) => (
                                <li key={index} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 text-gray-700 hover:bg-blue-50 hover:border-blue-100 transition-colors">
                                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                        <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                                    </div>
                                    <span className="text-sm font-medium">{benefit}</span>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-12">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-[calc(100vh-8rem)]">
                <div className="flex gap-6 h-full">
                    {/* Left Sidebar - Job List */}
                    <div className={`flex-1 flex flex-col h-full ${showDetail ? 'hidden lg:flex' : 'flex'}`}>
                        {/* Search & Filter Header */}
                        <div className="mb-6 space-y-4">
                            <div className="flex gap-3">
                                <div className="flex-1 relative group">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                    <input
                                        type="text"
                                        placeholder="Cari posisi atau perusahaan..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none bg-white shadow-sm hover:border-blue-300"
                                    />
                                </div>
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className={`px-4 py-3.5 rounded-xl border transition-all flex items-center gap-2 font-medium ${
                                        showFilters || activeFiltersCount > 0
                                            ? 'bg-blue-50 border-blue-200 text-blue-600 shadow-sm'
                                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 shadow-sm'
                                    }`}
                                >
                                    <Filter className="w-5 h-5" />
                                    <span className="hidden sm:inline">Filter</span>
                                    {activeFiltersCount > 0 && (
                                        <span className="bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                                            {activeFiltersCount}
                                        </span>
                                    )}
                                </button>
                            </div>

                            {/* Expanded Filters */}
                            {showFilters && (
                                <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-lg shadow-gray-200/50 animate-in slide-in-from-top-2">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-900 mb-3">Tipe Pekerjaan</label>
                                            <div className="flex flex-wrap gap-2">
                                                {jobTypes.map(type => (
                                                    <button
                                                        key={type}
                                                        onClick={() => handleFilterChange('jobType', type)}
                                                        className={`px-3 py-1.5 text-sm rounded-lg border transition-all font-medium ${
                                                            filters.jobType.includes(type)
                                                                ? 'bg-blue-50 border-blue-200 text-blue-600'
                                                                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                                                        }`}
                                                    >
                                                        {formatJobType(type)}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-900 mb-3">Pengalaman</label>
                                            <div className="flex flex-wrap gap-2">
                                                {experienceLevels.map(level => (
                                                    <button
                                                        key={level}
                                                        onClick={() => handleFilterChange('experience', level)}
                                                        className={`px-3 py-1.5 text-sm rounded-lg border transition-all font-medium ${
                                                            filters.experience.includes(level)
                                                                ? 'bg-blue-50 border-blue-200 text-blue-600'
                                                                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                                                        }`}
                                                    >
                                                        {level}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex justify-end mt-4 pt-4 border-t border-gray-100">
                                        <button
                                            onClick={clearFilters}
                                            className="text-sm text-gray-500 hover:text-red-600 transition-colors font-medium flex items-center gap-1"
                                        >
                                            <X className="w-4 h-4" />
                                            Reset Filter
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Job List */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
                            {loading ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 animate-pulse">
                                        <div className="flex gap-4">
                                            <div className="w-14 h-14 bg-gray-100 rounded-xl" />
                                            <div className="flex-1 space-y-2">
                                                <div className="h-4 bg-gray-100 rounded w-3/4" />
                                                <div className="h-3 bg-gray-100 rounded w-1/2" />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : jobs.length > 0 ? (
                                jobs.map(job => (
                                    <JobCard 
                                        key={job.id} 
                                        job={job} 
                                        isSelected={selectedJob?.id === job.id}
                                    />
                                ))
                            ) : (
                                <div className="text-center py-12 bg-white rounded-3xl border border-gray-100 border-dashed">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Search className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900">Tidak ada lowongan ditemukan</h3>
                                    <p className="text-gray-500 mt-1">Coba ubah kata kunci atau filter pencarian Anda</p>
                                    <button
                                        onClick={clearFilters}
                                        className="mt-6 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 font-medium"
                                    >
                                        Reset Filter
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Sidebar - Job Detail (Desktop) */}
                    <div className={`lg:w-[600px] xl:w-[700px] bg-white rounded-3xl border border-gray-200 shadow-2xl shadow-gray-200/50 overflow-hidden flex flex-col ${
                        showDetail ? 'fixed inset-0 z-50 lg:static lg:z-auto' : 'hidden lg:flex'
                    }`}>
                        {selectedJob ? (
                            <JobDetail job={selectedJob} />
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-gray-400 bg-gray-50/50">
                                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-gray-100">
                                    <Sparkles className="w-10 h-10 text-blue-400" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Pilih Lowongan</h3>
                                <p className="max-w-xs mx-auto text-gray-500">Pilih salah satu lowongan dari daftar di samping untuk melihat detail lengkapnya.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default JobsPage
"""

with open('app/jobs/page.jsx', 'w') as f:
    f.write(content)
