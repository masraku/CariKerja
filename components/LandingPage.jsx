'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
    Search, Briefcase, Building2, MapPin, ArrowRight, 
    ChevronRight, Sparkles
} from 'lucide-react'

export default function LandingPage() {
    const router = useRouter()
    const [stats, setStats] = useState(null)
    const [featuredJobs, setFeaturedJobs] = useState([])
    const [topCompanies, setTopCompanies] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchKeyword, setSearchKeyword] = useState('')

    useEffect(() => {
        loadHomepageData()
    }, [])

    const loadHomepageData = async () => {
        try {
            const [statsRes, jobsRes, companiesRes] = await Promise.all([
                fetch('/api/homepage/stats'),
                fetch('/api/homepage/featured-jobs?limit=4'),
                fetch('/api/homepage/top-companies?limit=6')
            ])

            const [statsData, jobsData, companiesData] = await Promise.all([
                statsRes.json(),
                jobsRes.json(),
                companiesRes.json()
            ])

            if (statsData.success) setStats(statsData.data)
            if (jobsData.success) setFeaturedJobs(jobsData.data.jobs)
            if (companiesData.success) setTopCompanies(companiesData.data.companies)
        } catch (error) {
            console.error('Failed to load homepage data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = (e) => {
        e.preventDefault()
        const params = new URLSearchParams()
        if (searchKeyword) params.set('keyword', searchKeyword)
        router.push(`/jobs?${params.toString()}`)
    }

    const formatSalary = (min, max) => {
        const format = (num) => {
            if (!num) return null
            if (num >= 1000000) return `${(num / 1000000).toFixed(0)}jt`
            if (num >= 1000) return `${(num / 1000).toFixed(0)}rb`
            return num
        }
        if (min && max) return `${format(min)} - ${format(max)}`
        if (min) return `${format(min)}+`
        return 'Nego'
    }

    return (
        <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
            
            {/* Hero Section - Clean & Minimal */}
            <section style={{ 
                position: 'relative',
                padding: '10% 5%',
                minHeight: '90vh',
                display: 'flex',
                alignItems: 'center',
                background: 'linear-gradient(135deg, #fafafa 0%, #f0f4ff 100%)'
            }}>
                <div style={{ 
                    width: '100%',
                    maxWidth: '1200px',
                    margin: '0 auto' 
                }}>
                    {/* Badge */}
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 16px',
                        background: 'rgba(59, 130, 246, 0.1)',
                        borderRadius: '100px',
                        marginBottom: '32px'
                    }}>
                        <Sparkles size={16} style={{ color: '#3b82f6' }} />
                        <span style={{ fontSize: '14px', color: '#3b82f6', fontWeight: 500 }}>
                            Platform Kerja #1 Indonesia
                        </span>
                    </div>

                    {/* Main Heading */}
                    <h1 style={{
                        fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
                        fontWeight: 700,
                        lineHeight: 1.1,
                        color: '#111827',
                        marginBottom: '24px',
                        maxWidth: '800px'
                    }}>
                        Temukan Karir
                        <br />
                        <span style={{ color: '#3b82f6' }}>Impianmu</span>
                    </h1>

                    <p style={{
                        fontSize: 'clamp(1rem, 2vw, 1.25rem)',
                        color: '#6b7280',
                        marginBottom: '40px',
                        maxWidth: '500px',
                        lineHeight: 1.6
                    }}>
                        Ribuan lowongan dari perusahaan terpercaya menunggu Anda
                    </p>

                    {/* Search Bar - Simplified */}
                    <form onSubmit={handleSearch} style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '12px',
                        maxWidth: '600px',
                        marginBottom: '48px'
                    }}>
                        <div style={{
                            flex: '1 1 300px',
                            display: 'flex',
                            alignItems: 'center',
                            background: 'white',
                            borderRadius: '12px',
                            padding: '16px 20px',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                            border: '1px solid #e5e7eb'
                        }}>
                            <Search size={20} style={{ color: '#9ca3af', marginRight: '12px' }} />
                            <input
                                type="text"
                                placeholder="Cari pekerjaan..."
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                                style={{
                                    flex: 1,
                                    border: 'none',
                                    outline: 'none',
                                    fontSize: '16px',
                                    color: '#111827',
                                    background: 'transparent'
                                }}
                            />
                        </div>
                        <button
                            type="submit"
                            style={{
                                padding: '16px 32px',
                                background: '#3b82f6',
                                color: 'white',
                                borderRadius: '12px',
                                border: 'none',
                                fontWeight: 600,
                                fontSize: '16px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                            onMouseOver={(e) => e.target.style.background = '#2563eb'}
                            onMouseOut={(e) => e.target.style.background = '#3b82f6'}
                        >
                            Cari
                            <ArrowRight size={18} />
                        </button>
                    </form>

                    {/* Stats - Minimal */}
                    {!loading && stats && (
                        <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '40px'
                        }}>
                            {[
                                { value: stats.totalJobs?.toLocaleString() || '0', label: 'Lowongan' },
                                { value: stats.totalCompanies?.toLocaleString() || '0', label: 'Perusahaan' },
                                { value: stats.totalHires?.toLocaleString() || '0', label: 'Diterima' }
                            ].map((stat, i) => (
                                <div key={i}>
                                    <div style={{ fontSize: '2rem', fontWeight: 700, color: '#111827' }}>
                                        {stat.value}+
                                    </div>
                                    <div style={{ fontSize: '14px', color: '#6b7280' }}>
                                        {stat.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Featured Jobs - Clean Grid */}
            <section style={{
                padding: '8% 5%',
                background: 'white'
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    {/* Section Header */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '40px',
                        flexWrap: 'wrap',
                        gap: '16px'
                    }}>
                        <div>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
                                Lowongan Terbaru
                            </h2>
                            <p style={{ color: '#6b7280' }}>Peluang terbaik untuk Anda</p>
                        </div>
                        <Link href="/jobs" style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            color: '#3b82f6',
                            fontWeight: 500,
                            textDecoration: 'none'
                        }}>
                            Lihat Semua <ChevronRight size={18} />
                        </Link>
                    </div>

                    {/* Jobs Grid */}
                    {loading ? (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                            gap: '20px'
                        }}>
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} style={{
                                    height: '200px',
                                    background: '#f3f4f6',
                                    borderRadius: '16px',
                                    animation: 'pulse 2s infinite'
                                }} />
                            ))}
                        </div>
                    ) : (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                            gap: '20px'
                        }}>
                            {featuredJobs.map(job => (
                                <Link
                                    key={job.id}
                                    href={`/jobs/${job.slug}`}
                                    style={{
                                        display: 'block',
                                        padding: '24px',
                                        background: '#fafafa',
                                        borderRadius: '16px',
                                        textDecoration: 'none',
                                        transition: 'all 0.3s',
                                        border: '1px solid transparent'
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.background = '#fff';
                                        e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.08)';
                                        e.currentTarget.style.transform = 'translateY(-4px)';
                                        e.currentTarget.style.border = '1px solid #e5e7eb';
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.background = '#fafafa';
                                        e.currentTarget.style.boxShadow = 'none';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.border = '1px solid transparent';
                                    }}
                                >
                                    {/* Company Logo */}
                                    <div style={{
                                        width: '48px',
                                        height: '48px',
                                        background: job.companies?.logo ? 'white' : 'linear-gradient(135deg, #3b82f6, #6366f1)',
                                        borderRadius: '12px',
                                        marginBottom: '16px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        overflow: 'hidden'
                                    }}>
                                        {job.companies?.logo ? (
                                            <img src={job.companies.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <span style={{ color: 'white', fontWeight: 700 }}>{job.companies?.name?.charAt(0) || 'C'}</span>
                                        )}
                                    </div>

                                    {/* Job Details */}
                                    <h3 style={{ 
                                        fontSize: '1rem', 
                                        fontWeight: 600, 
                                        color: '#111827',
                                        marginBottom: '6px'
                                    }}>
                                        {job.title}
                                    </h3>
                                    <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '12px' }}>
                                        {job.companies?.name}
                                    </p>

                                    {/* Meta */}
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '13px', color: '#9ca3af' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <MapPin size={14} /> {job.location}
                                        </span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Briefcase size={14} /> {job.jobType}
                                        </span>
                                    </div>

                                    {/* Salary */}
                                    {(job.salaryMin || job.salaryMax) && (
                                        <div style={{
                                            marginTop: '16px',
                                            padding: '8px 12px',
                                            background: 'rgba(16, 185, 129, 0.1)',
                                            borderRadius: '8px',
                                            display: 'inline-block',
                                            fontSize: '13px',
                                            fontWeight: 500,
                                            color: '#059669'
                                        }}>
                                            Rp {formatSalary(job.salaryMin, job.salaryMax)}
                                        </div>
                                    )}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Top Companies - Minimal */}
            <section style={{
                padding: '8% 5%',
                background: '#f9fafb'
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
                            Perusahaan Terpercaya
                        </h2>
                        <p style={{ color: '#6b7280' }}>Bergabung dengan yang terbaik</p>
                    </div>

                    {/* Companies Grid */}
                    {loading ? (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                            gap: '20px'
                        }}>
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} style={{
                                    height: '140px',
                                    background: '#e5e7eb',
                                    borderRadius: '16px'
                                }} />
                            ))}
                        </div>
                    ) : (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                            gap: '20px'
                        }}>
                            {topCompanies.map(company => (
                                <Link
                                    key={company.id}
                                    href={`/companies/${company.id}`}
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        padding: '28px 20px',
                                        background: 'white',
                                        borderRadius: '16px',
                                        textDecoration: 'none',
                                        transition: 'all 0.3s'
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.08)';
                                        e.currentTarget.style.transform = 'translateY(-4px)';
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.boxShadow = 'none';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }}
                                >
                                    <div style={{
                                        width: '56px',
                                        height: '56px',
                                        background: company.logo ? 'white' : 'linear-gradient(135deg, #3b82f6, #6366f1)',
                                        borderRadius: '12px',
                                        marginBottom: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        overflow: 'hidden',
                                        border: company.logo ? '1px solid #e5e7eb' : 'none'
                                    }}>
                                        {company.logo ? (
                                            <img src={company.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <span style={{ color: 'white', fontWeight: 700, fontSize: '1.25rem' }}>{company.name?.charAt(0)}</span>
                                        )}
                                    </div>
                                    <span style={{
                                        fontWeight: 600,
                                        color: '#111827',
                                        fontSize: '14px',
                                        textAlign: 'center',
                                        marginBottom: '4px'
                                    }}>
                                        {company.name?.length > 15 ? company.name.slice(0, 15) + '...' : company.name}
                                    </span>
                                    <span style={{ fontSize: '12px', color: '#3b82f6' }}>
                                        {company.activeJobsCount} lowongan
                                    </span>
                                </Link>
                            ))}
                        </div>
                    )}

                    <div style={{ textAlign: 'center', marginTop: '40px' }}>
                        <Link href="/companies" style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '12px 24px',
                            background: 'white',
                            color: '#111827',
                            borderRadius: '100px',
                            textDecoration: 'none',
                            fontWeight: 500,
                            border: '1px solid #e5e7eb',
                            transition: 'all 0.2s'
                        }}>
                            Lihat Semua Perusahaan <ChevronRight size={18} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* CTA Section - Clean */}
            <section style={{
                padding: '8% 5%',
                background: 'linear-gradient(135deg, #111827 0%, #1f2937 100%)'
            }}>
                <div style={{ 
                    maxWidth: '1000px', 
                    margin: '0 auto',
                    textAlign: 'center'
                }}>
                    <h2 style={{
                        fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
                        fontWeight: 700,
                        color: 'white',
                        marginBottom: '16px'
                    }}>
                        Siap Memulai Karir Baru?
                    </h2>
                    <p style={{
                        color: 'rgba(255,255,255,0.7)',
                        marginBottom: '32px',
                        maxWidth: '500px',
                        margin: '0 auto 32px'
                    }}>
                        Daftar sekarang dan akses ribuan peluang kerja
                    </p>
                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                        gap: '16px'
                    }}>
                        <Link href="/register/jobseeker" style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '14px 28px',
                            background: '#3b82f6',
                            color: 'white',
                            borderRadius: '12px',
                            textDecoration: 'none',
                            fontWeight: 600,
                            transition: 'all 0.2s'
                        }}>
                            Cari Kerja <ArrowRight size={18} />
                        </Link>
                        <Link href="/register/recruiter" style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '14px 28px',
                            background: 'rgba(255,255,255,0.1)',
                            color: 'white',
                            borderRadius: '12px',
                            textDecoration: 'none',
                            fontWeight: 600,
                            border: '1px solid rgba(255,255,255,0.2)',
                            transition: 'all 0.2s'
                        }}>
                            <Building2 size={18} /> Pasang Lowongan
                        </Link>
                    </div>
                </div>
            </section>


            <style jsx>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            `}</style>
        </div>
    )
}