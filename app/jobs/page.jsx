'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, MapPin, Briefcase, DollarSign, Clock, Building2, Filter, X, Star, Bookmark, BookmarkCheck, Calendar, Users, Loader2, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react'

const JobsPage = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [location, setLocation] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedJob, setSelectedJob] = useState(null)
  const [savedJobs, setSavedJobs] = useState([])
  const [sortBy, setSortBy] = useState('latest')
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [jobs, setJobs] = useState([])
  const [isDesktop, setIsDesktop] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1, limit: 10, totalCount: 0, totalPages: 0
  })
  
  const [filters, setFilters] = useState({
    jobType: [], experience: [], salary: '', category: []
  })

  const jobTypes = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'FREELANCE', 'INTERNSHIP']
  const experienceLevels = ['0-1 tahun', '1-3 tahun', '3-5 tahun', '5+ tahun']
  const categories = ['Teknologi', 'Desain', 'Marketing', 'Data', 'Management', 'Sales', 'HR']

  const fetchJobs = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchQuery) params.append('search', searchQuery)
      if (location) params.append('location', location)
      if (filters.jobType.length > 0) params.append('jobType', filters.jobType.join(','))
      if (filters.category.length > 0) params.append('category', filters.category.join(','))
      if (filters.experience.length > 0) params.append('experience', filters.experience.join(','))
      if (sortBy) params.append('sortBy', sortBy)
      params.append('page', currentPage.toString())
      params.append('limit', '10')

      const response = await fetch(`/api/jobs?${params.toString()}`, { credentials: 'include' })
      const data = await response.json()
      if (data.success) {
        setJobs(data.data)
        setPagination(data.pagination)
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
  useEffect(() => {
    const checkWidth = () => setIsDesktop(window.innerWidth >= 1024)
    checkWidth()
    window.addEventListener('resize', checkWidth)
    return () => window.removeEventListener('resize', checkWidth)
  }, [])

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

  // Styles
  const containerStyle = { minHeight: '100vh', background: '#f8fafc' }
  const heroStyle = {
    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
    padding: 'clamp(40px, 8%, 80px) 5%',
    color: 'white'
  }
  const searchBoxStyle = {
    background: 'white',
    borderRadius: '16px',
    padding: 'clamp(16px, 3%, 24px)',
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
    maxWidth: '900px',
    margin: '0 auto'
  }
  const inputStyle = {
    width: '100%',
    padding: '14px 14px 14px 48px',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    fontSize: '15px',
    outline: 'none',
    color: '#111827'
  }
  const buttonStyle = {
    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
    color: 'white',
    padding: '14px 32px',
    borderRadius: '12px',
    border: 'none',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '15px'
  }
  const cardStyle = {
    background: 'white',
    borderRadius: '16px',
    padding: 'clamp(16px, 3%, 24px)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
    marginBottom: '16px',
    border: '1px solid #f1f5f9'
  }
  const badgeStyle = (bg, color) => ({
    display: 'inline-block',
    padding: '6px 12px',
    background: bg,
    color: color,
    borderRadius: '100px',
    fontSize: '12px',
    fontWeight: 500,
    marginRight: '8px',
    marginBottom: '8px'
  })
  const sidebarStyle = {
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
    position: 'sticky',
    top: '100px'
  }
  const filterGroupStyle = { marginBottom: '24px' }
  const filterTitleStyle = { fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '12px' }
  const checkboxLabelStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 0',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#4b5563'
  }

  return (
    <div style={containerStyle}>
      {/* Hero Search */}
      <div style={heroStyle}>
        <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 700, textAlign: 'center', marginBottom: '8px' }}>
          Temukan Pekerjaan Impian
        </h1>
        <p style={{ textAlign: 'center', opacity: 0.9, marginBottom: '32px', fontSize: 'clamp(14px, 2vw, 16px)' }}>
          {pagination.totalCount} lowongan tersedia
        </p>
        
        <div style={searchBoxStyle}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ flex: '1 1 250px', position: 'relative' }}>
              <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input type="text" placeholder="Posisi, skill, perusahaan..." style={inputStyle} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <div style={{ flex: '1 1 200px', position: 'relative' }}>
              <MapPin size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input type="text" placeholder="Lokasi..." style={inputStyle} value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
            <button style={buttonStyle} onClick={() => fetchJobs()}>Cari</button>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', marginTop: '32px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 700 }}>{pagination.totalCount}</div>
            <div style={{ fontSize: '14px', opacity: 0.8 }}>Lowongan</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 700 }}>{savedJobs.length}</div>
            <div style={{ fontSize: '14px', opacity: 0.8 }}>Tersimpan</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ padding: '40px 5%', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
          
          {/* Sidebar Filters - Desktop */}
          {isDesktop && (
            <div style={{ ...sidebarStyle, flex: '0 0 280px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Filter size={20} /> Filter
                </h3>
                {(filters.jobType.length > 0 || filters.category.length > 0) && (
                  <button onClick={clearFilters} style={{ background: 'none', border: 'none', color: '#4f46e5', fontSize: '14px', cursor: 'pointer', fontWeight: 500 }}>Reset</button>
                )}
              </div>

              <div style={filterGroupStyle}>
                <h4 style={filterTitleStyle}>Tipe Pekerjaan</h4>
                {jobTypes.map(type => (
                  <label key={type} style={checkboxLabelStyle}>
                    <input type="checkbox" checked={filters.jobType.includes(type)} onChange={() => handleFilterChange('jobType', type)} style={{ width: '18px', height: '18px', accentColor: '#4f46e5' }} />
                    {formatJobType(type)}
                  </label>
                ))}
              </div>

              <div style={filterGroupStyle}>
                <h4 style={filterTitleStyle}>Pengalaman</h4>
                {experienceLevels.map(level => (
                  <label key={level} style={checkboxLabelStyle}>
                    <input type="checkbox" checked={filters.experience.includes(level)} onChange={() => handleFilterChange('experience', level)} style={{ width: '18px', height: '18px', accentColor: '#4f46e5' }} />
                    {level}
                  </label>
                ))}
              </div>

              <div style={filterGroupStyle}>
                <h4 style={filterTitleStyle}>Kategori</h4>
                {categories.map(cat => (
                  <label key={cat} style={checkboxLabelStyle}>
                    <input type="checkbox" checked={filters.category.includes(cat)} onChange={() => handleFilterChange('category', cat)} style={{ width: '18px', height: '18px', accentColor: '#4f46e5' }} />
                    {cat}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Mobile Filter Button */}
          {!isDesktop && (
            <button onClick={() => setShowFilters(true)} style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 50, background: '#4f46e5', color: 'white', padding: '16px', borderRadius: '50%', border: 'none', boxShadow: '0 8px 24px rgba(79,70,229,0.4)', cursor: 'pointer' }}>
              <Filter size={24} />
            </button>
          )}

          {/* Jobs List */}
          <div style={{ flex: 1, minWidth: '300px' }}>
            {/* Sort Bar */}
            <div style={{ ...cardStyle, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <span style={{ color: '#6b7280', fontSize: '14px' }}>{pagination.totalCount} lowongan ditemukan</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ color: '#6b7280', fontSize: '14px' }}>Urutkan:</span>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ padding: '10px 16px', border: '2px solid #e5e7eb', borderRadius: '10px', fontSize: '14px', color: '#111827', outline: 'none' }}>
                  <option value="latest">Terbaru</option>
                  <option value="salary">Gaji Tertinggi</option>
                  <option value="popular">Terpopuler</option>
                </select>
              </div>
            </div>

            {/* Loading */}
            {loading ? (
              <div style={{ ...cardStyle, textAlign: 'center', padding: '60px' }}>
                <Loader2 size={40} style={{ color: '#4f46e5', margin: '0 auto 16px' }} />
                <p style={{ color: '#6b7280' }}>Memuat lowongan...</p>
              </div>
            ) : jobs.length === 0 ? (
              <div style={{ ...cardStyle, textAlign: 'center', padding: '60px' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>Tidak ada lowongan</h3>
                <p style={{ color: '#6b7280', marginBottom: '24px' }}>Coba ubah filter pencarian Anda</p>
                <button onClick={clearFilters} style={{ ...buttonStyle, padding: '12px 24px' }}>Reset Filter</button>
              </div>
            ) : (
              <>
                {jobs.map((job) => (
                  <div key={job.id} style={cardStyle}>
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                      <div style={{ width: '60px', height: '60px', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0, overflow: 'hidden' }}>
                        {job.logo?.startsWith('http') ? <img src={job.logo} alt={job.company} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span>{job.logo}</span>}
                      </div>
                      <div style={{ flex: 1, minWidth: '200px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                          <div>
                            <Link href={`/jobs/${job.slug}`}><h3 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', marginBottom: '4px', cursor: 'pointer' }}>{job.title}</h3></Link>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6b7280', fontSize: '14px' }}><Building2 size={16} /><span>{job.company}</span></div>
                          </div>
                          <button onClick={() => toggleSaveJob(job.id)} style={{ background: savedJobs.includes(job.id) ? '#eef2ff' : '#f3f4f6', color: savedJobs.includes(job.id) ? '#4f46e5' : '#6b7280', padding: '10px', borderRadius: '10px', border: 'none', cursor: 'pointer' }}>
                            {savedJobs.includes(job.id) ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
                          </button>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '12px', fontSize: '13px', color: '#6b7280' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={14} /> {job.location}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Briefcase size={14} /> {formatJobType(job.type)}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={14} /> {job.experience}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#16a34a', fontWeight: 600 }}><DollarSign size={14} /> {job.salary}</span>
                        </div>
                        <div style={{ marginBottom: '16px' }}>
                          <span style={badgeStyle('#eef2ff', '#4f46e5')}>{job.category}</span>
                          {job.remote && <span style={badgeStyle('#dcfce7', '#16a34a')}>Remote</span>}
                          {job.urgent && <span style={badgeStyle('#fee2e2', '#dc2626')}>Featured</span>}
                          {job.hasApplied && <span style={badgeStyle('#ccfbf1', '#0d9488')}>✓ Sudah Melamar</span>}
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                          <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#9ca3af' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={14} /> {getTimeSince(job.postedDate)}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Users size={14} /> {job.applicants} pelamar</span>
                          </div>
                          <div style={{ display: 'flex', gap: '12px' }}>
                            <button onClick={() => setSelectedJob(job)} style={{ padding: '10px 20px', border: '2px solid #e5e7eb', background: 'white', borderRadius: '10px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', color: '#374151' }}>Detail</button>
                            <Link href={`/jobs/${job.slug}`}><button style={{ ...buttonStyle, padding: '10px 20px', fontSize: '14px' }}>Lamar</button></Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {pagination.totalPages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '32px' }}>
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={!pagination.hasPrevPage} style={{ padding: '10px 16px', border: '2px solid #e5e7eb', background: 'white', borderRadius: '10px', cursor: pagination.hasPrevPage ? 'pointer' : 'not-allowed', opacity: pagination.hasPrevPage ? 1 : 0.5 }}><ChevronLeft size={20} /></button>
                    {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => (
                      <button key={i + 1} onClick={() => setCurrentPage(i + 1)} style={{ padding: '10px 16px', border: '2px solid #e5e7eb', background: currentPage === i + 1 ? '#4f46e5' : 'white', color: currentPage === i + 1 ? 'white' : '#374151', borderRadius: '10px', cursor: 'pointer', fontWeight: 600 }}>{i + 1}</button>
                    ))}
                    <button onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))} disabled={!pagination.hasNextPage} style={{ padding: '10px 16px', border: '2px solid #e5e7eb', background: 'white', borderRadius: '10px', cursor: pagination.hasNextPage ? 'pointer' : 'not-allowed', opacity: pagination.hasNextPage ? 1 : 0.5 }}><ChevronRight size={20} /></button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Job Detail Modal */}
      {selectedJob && (
        <div onClick={() => setSelectedJob(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 100, overflowY: 'auto' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: 'white', borderRadius: '20px', maxWidth: '800px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9', position: 'sticky', top: 0, background: 'white', zIndex: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ width: '60px', height: '60px', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', overflow: 'hidden' }}>
                    {selectedJob.logo?.startsWith('http') ? <img src={selectedJob.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : selectedJob.logo}
                  </div>
                  <div><h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>{selectedJob.title}</h2><p style={{ color: '#6b7280' }}>{selectedJob.company}</p></div>
                </div>
                <button onClick={() => setSelectedJob(null)} style={{ background: '#f3f4f6', border: 'none', padding: '10px', borderRadius: '10px', cursor: 'pointer' }}><X size={20} /></button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginTop: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><MapPin size={18} color="#9ca3af" /><div><div style={{ fontSize: '11px', color: '#9ca3af' }}>Lokasi</div><div style={{ fontWeight: 600, color: '#111827', fontSize: '14px' }}>{selectedJob.location}</div></div></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Briefcase size={18} color="#9ca3af" /><div><div style={{ fontSize: '11px', color: '#9ca3af' }}>Tipe</div><div style={{ fontWeight: 600, color: '#111827', fontSize: '14px' }}>{formatJobType(selectedJob.type)}</div></div></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Clock size={18} color="#9ca3af" /><div><div style={{ fontSize: '11px', color: '#9ca3af' }}>Pengalaman</div><div style={{ fontWeight: 600, color: '#111827', fontSize: '14px' }}>{selectedJob.experience}</div></div></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><DollarSign size={18} color="#9ca3af" /><div><div style={{ fontSize: '11px', color: '#9ca3af' }}>Gaji</div><div style={{ fontWeight: 600, color: '#16a34a', fontSize: '14px' }}>{selectedJob.salary}</div></div></div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <Link href={`/jobs/${selectedJob.slug}`} style={{ flex: 1 }}><button style={{ ...buttonStyle, width: '100%', padding: '14px' }}>Lamar Sekarang</button></Link>
                <button onClick={() => toggleSaveJob(selectedJob.id)} style={{ padding: '14px 24px', background: savedJobs.includes(selectedJob.id) ? '#eef2ff' : '#f3f4f6', color: savedJobs.includes(selectedJob.id) ? '#4f46e5' : '#374151', border: 'none', borderRadius: '12px', fontWeight: 600, cursor: 'pointer' }}>{savedJobs.includes(selectedJob.id) ? 'Tersimpan' : 'Simpan'}</button>
              </div>
            </div>
            <div style={{ padding: '24px' }}>
              {selectedJob.description && <div style={{ marginBottom: '24px' }}><h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', marginBottom: '12px' }}>Deskripsi</h3><p style={{ color: '#4b5563', lineHeight: 1.7, whiteSpace: 'pre-line' }}>{selectedJob.description}</p></div>}
              {selectedJob.requirements && <div style={{ marginBottom: '24px' }}><h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', marginBottom: '12px' }}>Persyaratan</h3><div style={{ color: '#4b5563', lineHeight: 1.7, whiteSpace: 'pre-line' }}>{selectedJob.requirements}</div></div>}
              {selectedJob.benefits?.length > 0 && <div style={{ marginBottom: '24px' }}><h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', marginBottom: '12px' }}>Benefit</h3><div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>{selectedJob.benefits.map((b, i) => <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: '#f0fdf4', borderRadius: '10px' }}><Star size={16} color="#16a34a" fill="#16a34a" /><span style={{ color: '#374151', fontSize: '14px' }}>{b}</span></div>)}</div></div>}
              {selectedJob.skills?.length > 0 && <div><h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', marginBottom: '12px' }}>Skills</h3><div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>{selectedJob.skills.map((s, i) => <span key={i} style={badgeStyle('#eef2ff', '#4f46e5')}>{s}</span>)}</div></div>}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Filter Modal */}
      {showFilters && (
        <div style={{ position: 'fixed', inset: 0, background: 'white', zIndex: 100, overflowY: 'auto', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#111827' }}>Filter</h3>
            <button onClick={() => setShowFilters(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
          </div>
          <div style={filterGroupStyle}><h4 style={filterTitleStyle}>Tipe Pekerjaan</h4>{jobTypes.map(type => <label key={type} style={checkboxLabelStyle}><input type="checkbox" checked={filters.jobType.includes(type)} onChange={() => handleFilterChange('jobType', type)} style={{ width: '20px', height: '20px', accentColor: '#4f46e5' }} />{formatJobType(type)}</label>)}</div>
          <div style={filterGroupStyle}><h4 style={filterTitleStyle}>Pengalaman</h4>{experienceLevels.map(level => <label key={level} style={checkboxLabelStyle}><input type="checkbox" checked={filters.experience.includes(level)} onChange={() => handleFilterChange('experience', level)} style={{ width: '20px', height: '20px', accentColor: '#4f46e5' }} />{level}</label>)}</div>
          <div style={filterGroupStyle}><h4 style={filterTitleStyle}>Kategori</h4>{categories.map(cat => <label key={cat} style={checkboxLabelStyle}><input type="checkbox" checked={filters.category.includes(cat)} onChange={() => handleFilterChange('category', cat)} style={{ width: '20px', height: '20px', accentColor: '#4f46e5' }} />{cat}</label>)}</div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
            <button onClick={clearFilters} style={{ flex: 1, padding: '14px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '12px', fontWeight: 600, cursor: 'pointer' }}>Reset</button>
            <button onClick={() => setShowFilters(false)} style={{ ...buttonStyle, flex: 1, padding: '14px' }}>Terapkan</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default JobsPage