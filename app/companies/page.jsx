'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, MapPin, Briefcase, Users, CheckCircle, Heart, HeartOff, Filter, Building2, Loader2, TrendingUp, Star, ArrowRight } from 'lucide-react'

const CompaniesPage = () => {
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [followedCompanies, setFollowedCompanies] = useState([])
  const [selectedIndustry, setSelectedIndustry] = useState('all')
  const [selectedSize, setSelectedSize] = useState('all')
  const [industries, setIndustries] = useState(['all'])
  const companySizes = ['all', '1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']

  useEffect(() => { loadCompanies() }, [selectedIndustry, selectedSize])
  useEffect(() => {
    const timer = setTimeout(() => { if (searchQuery || searchQuery === '') loadCompanies() }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const loadCompanies = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchQuery) params.append('search', searchQuery)
      if (selectedIndustry !== 'all') params.append('industry', selectedIndustry)
      if (selectedSize !== 'all') params.append('size', selectedSize)

      const response = await fetch(`/api/companies?${params.toString()}`)
      const data = await response.json()
      if (response.ok) {
        setCompanies(data.companies)
        const uniqueIndustries = ['all', ...new Set(
          data.companies.map(c => c.industry).filter(i => i && i !== 'Belum dilengkapi')
        )]
        setIndustries(uniqueIndustries)
      }
    } catch (error) {
      console.error('Load companies error:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleFollow = (companyId) => {
    setFollowedCompanies(prev => prev.includes(companyId) ? prev.filter(id => id !== companyId) : [...prev, companyId])
  }

  const totalActiveJobs = companies.reduce((sum, c) => sum + c.activeJobs, 0)

  if (loading && companies.length === 0) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
        <div style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #a855f7 100%)', padding: 'clamp(60px, 10%, 100px) 5%', textAlign: 'center' }}>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 700, color: 'white', marginBottom: '16px' }}>
            Jelajahi Perusahaan Terbaik
          </h1>
          <Loader2 size={48} style={{ color: 'white', margin: '40px auto' }} />
          <p style={{ color: 'rgba(255,255,255,0.9)' }}>Memuat data perusahaan...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Hero Section - Same gradient as About page */}
      <div style={{
        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #a855f7 100%)',
        padding: 'clamp(60px, 10%, 100px) 5%',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          {/* Badge */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.15)', padding: '10px 20px', borderRadius: '100px' }}>
              <TrendingUp size={16} style={{ color: 'white' }} />
              <span style={{ color: 'white', fontSize: '14px', fontWeight: 500 }}>Top Companies in Indonesia</span>
            </div>
          </div>

          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 700, color: 'white', textAlign: 'center', marginBottom: '16px' }}>
            Jelajahi Perusahaan Terbaik
          </h1>
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.9)', marginBottom: '40px', fontSize: 'clamp(14px, 2vw, 18px)', maxWidth: '600px', margin: '0 auto 40px' }}>
            Temukan perusahaan impianmu dan bergabunglah dengan tim luar biasa
          </p>

          {/* Search Box */}
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <div style={{ background: 'white', borderRadius: '16px', padding: '6px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
              <div style={{ position: 'relative' }}>
                <Search size={22} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                <input
                  type="text"
                  placeholder="Cari nama perusahaan atau industri..."
                  style={{ width: '100%', padding: '16px 16px 16px 56px', border: 'none', borderRadius: '12px', fontSize: '16px', outline: 'none', color: '#111827' }}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Stats Cards - Same style as About page */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px', maxWidth: '600px', margin: '48px auto 0' }}>
            {[
              { value: companies.length, label: 'Perusahaan', icon: Building2, color: '#3b82f6' },
              { value: totalActiveJobs, label: 'Lowongan Aktif', icon: Briefcase, color: '#8b5cf6' },
              { value: followedCompanies.length, label: 'Diikuti', icon: Heart, color: '#f59e0b' }
            ].map((stat, i) => {
              const Icon = stat.icon
              return (
                <div key={i} style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', borderRadius: '16px', padding: '24px 16px', textAlign: 'center' }}>
                  <div style={{ width: '48px', height: '48px', background: stat.color, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                    <Icon size={24} color="white" />
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: 'white', marginBottom: '4px' }}>{stat.value}</div>
                  <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)' }}>{stat.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div style={{ background: '#f8fafc', padding: '40px 5%', minHeight: '60vh' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          {/* Filter Bar */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: 'clamp(16px, 3%, 24px)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
            marginBottom: '32px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#111827', fontWeight: 600 }}>
              <Filter size={20} />
              <span>Filter:</span>
            </div>

            <select value={selectedIndustry} onChange={(e) => setSelectedIndustry(e.target.value)} style={{ padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: '10px', fontSize: '14px', outline: 'none', color: '#111827', background: 'white', cursor: 'pointer' }}>
              <option value="all">Semua Industri</option>
              {industries.filter(i => i !== 'all').map(ind => <option key={ind} value={ind}>{ind}</option>)}
            </select>

            <select value={selectedSize} onChange={(e) => setSelectedSize(e.target.value)} style={{ padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: '10px', fontSize: '14px', outline: 'none', color: '#111827', background: 'white', cursor: 'pointer' }}>
              <option value="all">Semua Ukuran</option>
              {companySizes.filter(s => s !== 'all').map(size => <option key={size} value={size}>{size} karyawan</option>)}
            </select>

            {(selectedIndustry !== 'all' || selectedSize !== 'all') && (
              <button onClick={() => { setSelectedIndustry('all'); setSelectedSize('all') }} style={{ background: 'none', border: 'none', color: '#4f46e5', fontSize: '14px', cursor: 'pointer', fontWeight: 600, marginLeft: 'auto' }}>
                Reset Filter
              </button>
            )}
          </div>

          {/* Companies Grid */}
          {companies.length === 0 ? (
            <div style={{ background: 'white', borderRadius: '20px', padding: '80px 40px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
              <Building2 size={64} style={{ color: '#c4b5fd', marginBottom: '24px' }} />
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>Tidak ada perusahaan ditemukan</h3>
              <p style={{ color: '#6b7280', marginBottom: '24px' }}>Coba ubah filter pencarian Anda</p>
              <button onClick={() => { setSearchQuery(''); setSelectedIndustry('all'); setSelectedSize('all') }} style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: 'white', padding: '14px 28px', borderRadius: '12px', border: 'none', fontWeight: 600, cursor: 'pointer' }}>
                Reset Filter
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
              {companies.map(company => (
                <div key={company.id} style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9' }}>
                  {/* Card Header - Same gradient */}
                  <div style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', height: '100px', position: 'relative' }}>
                    <div style={{ position: 'absolute', bottom: '-32px', left: '24px', width: '80px', height: '80px', background: 'white', borderRadius: '16px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '4px solid white' }}>
                      {company.logo ? <img src={company.logo} alt={company.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Building2 size={32} color="#4f46e5" />}
                    </div>
                    {company.verified && (
                      <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)', padding: '6px 12px', borderRadius: '100px', display: 'flex', alignItems: 'center', gap: '6px', color: 'white', fontSize: '12px' }}>
                        <CheckCircle size={14} /><span>Verified</span>
                      </div>
                    )}
                  </div>

                  {/* Card Body */}
                  <div style={{ padding: '48px 24px 24px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>{company.name}</h3>
                    {company.tagline && <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '16px' }}>{company.tagline}</p>}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#4b5563' }}>
                        <MapPin size={16} color="#9ca3af" /><span>{company.location}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#4b5563' }}>
                        <Users size={16} color="#9ca3af" /><span>{company.companySize} karyawan</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#4b5563' }}>
                        <Briefcase size={16} color="#9ca3af" /><span>{company.activeJobs} lowongan aktif</span>
                      </div>
                    </div>

                    {company.industry && company.industry !== 'Belum dilengkapi' && (
                      <div style={{ marginBottom: '16px' }}>
                        <span style={{ display: 'inline-block', padding: '6px 14px', background: '#eef2ff', color: '#4f46e5', borderRadius: '100px', fontSize: '12px', fontWeight: 500 }}>{company.industry}</span>
                      </div>
                    )}

                    {company.rating > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                        <div style={{ display: 'flex' }}>{[...Array(5)].map((_, i) => <Star key={i} size={16} fill={i < Math.floor(company.rating) ? '#fbbf24' : '#e5e7eb'} color={i < Math.floor(company.rating) ? '#fbbf24' : '#e5e7eb'} />)}</div>
                        <span style={{ fontSize: '13px', color: '#6b7280' }}>{company.rating} ({company.reviews} reviews)</span>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '12px' }}>
                      <Link href={`/companies/${company.slug}`} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: 'white', padding: '14px 24px', borderRadius: '12px', textDecoration: 'none', fontWeight: 600, fontSize: '14px' }}>
                        Lihat Profil<ArrowRight size={18} />
                      </Link>
                      <button onClick={() => toggleFollow(company.id)} style={{ padding: '14px', background: followedCompanies.includes(company.id) ? '#fee2e2' : '#f3f4f6', color: followedCompanies.includes(company.id) ? '#dc2626' : '#6b7280', border: 'none', borderRadius: '12px', cursor: 'pointer' }}>
                        {followedCompanies.includes(company.id) ? <HeartOff size={20} /> : <Heart size={20} />}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CompaniesPage