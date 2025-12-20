'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const { user, logout, isAuthenticated } = useAuth()
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)

    // Detect dark mode
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)')
    setIsDarkMode(darkModeQuery.matches)

    const handleDarkModeChange = (e) => setIsDarkMode(e.matches)
    darkModeQuery.addEventListener('change', handleDarkModeChange)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      darkModeQuery.removeEventListener('change', handleDarkModeChange)
    }
  }, [])

  const handleLogout = () => {
    logout()
    setIsDropdownOpen(false)
    setIsMenuOpen(false)
  }

  const getRecruiter = () => {
    if (user?.recruiter) return user.recruiter
    if (Array.isArray(user?.recruiters) && user.recruiters.length > 0) return user.recruiters[0]
    if (user?.recruiters && typeof user.recruiters === 'object') return user.recruiters
    return null
  }

  const getJobseeker = () => {
    // API /me returns user.jobseeker (singular)
    if (user?.jobseeker) return user.jobseeker
    if (user?.jobseekers && typeof user.jobseekers === 'object') return user.jobseekers
    return null
  }

  const getCompany = (recruiter) => {
    // API stores company at user.company directly
    if (user?.company) return user.company
    if (!recruiter) return null
    if (recruiter.company) return recruiter.company
    if (Array.isArray(recruiter.companies) && recruiter.companies.length > 0) return recruiter.companies[0]
    if (recruiter.companies && typeof recruiter.companies === 'object') return recruiter.companies
    return null
  }

  const getUserName = () => {
    if (!user) return 'User'
    // Try user.name first (from API)
    if (user.name && user.name.trim()) return user.name
    const jobseeker = getJobseeker()
    if (user.role === 'JOBSEEKER' && jobseeker) return jobseeker.firstName || 'User'
    if (user.role === 'RECRUITER') {
      const recruiter = getRecruiter()
      const company = getCompany(recruiter)
      if (company?.name) return company.name
      if (recruiter?.firstName) return recruiter.firstName
    }
    return user.email?.split('@')[0] || 'User'
  }

  const getUserPhoto = () => {
    if (!user) return null
    const jobseeker = getJobseeker()
    if (user.role === 'JOBSEEKER' && jobseeker?.photo) return jobseeker.photo
    if (user.role === 'RECRUITER') {
      // Check company logo first (API stores at user.company)
      if (user.company?.logo) return user.company.logo
      const recruiter = getRecruiter()
      // API returns photo (not photoUrl) in recruiter object
      if (recruiter?.photo) return recruiter.photo
      if (recruiter?.photoUrl) return recruiter.photoUrl
      const company = getCompany(recruiter)
      if (company?.logo) return company.logo
    }
    return null
  }

  const getRoleDisplay = () => {
    const map = { 'JOBSEEKER': 'Pencari Kerja', 'RECRUITER': 'Perusahaan', 'ADMIN': 'Admin' }
    return map[user?.role] || ''
  }

  const getDashboardLink = () => {
    if (user?.role === 'JOBSEEKER') return '/profile/jobseeker/dashboard'
    if (user?.role === 'RECRUITER') return '/profile/recruiter/dashboard'
    return '/'
  }

  // Dynamic colors based on dark mode
  const colors = {
    text: isDarkMode ? '#f9fafb' : '#111827',
    textMuted: isDarkMode ? '#9ca3af' : '#6b7280',
    bg: isDarkMode ? 'rgba(17,24,39,0.95)' : 'rgba(255,255,255,0.95)',
    bgSolid: isDarkMode ? '#111827' : 'white',
    border: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
    borderSolid: isDarkMode ? '#374151' : '#e5e7eb',
    dropdownBg: isDarkMode ? '#1f2937' : 'white',
    dropdownHover: isDarkMode ? '#374151' : '#f9fafb',
    dropdownInfoBg: isDarkMode ? '#111827' : '#fafafa'
  }

  // Styles
  const headerStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    background: scrolled ? colors.bg : 'transparent',
    backdropFilter: scrolled ? 'blur(20px)' : 'none',
    borderBottom: scrolled ? `1px solid ${colors.border}` : 'none',
    transition: 'all 0.3s ease'
  }

  const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 5%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '72px'
  }

  const logoStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    textDecoration: 'none',
    fontWeight: 700,
    fontSize: '1.25rem',
    color: colors.text
  }

  const navStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '32px'
  }

  const navLinkStyle = {
    color: colors.textMuted,
    textDecoration: 'none',
    fontSize: '15px',
    fontWeight: 500,
    transition: 'color 0.2s'
  }

  // Helper function to check if link is active
  const isActive = (path) => {
    if (path === '/') return pathname === '/'
    return pathname.startsWith(path)
  }

  // Style for nav link wrapper with underline indicator
  const getNavLinkWrapperStyle = (path) => ({
    position: 'relative',
    display: 'inline-block',
    paddingBottom: '4px'
  })

  // Active indicator underline
  const getActiveIndicatorStyle = (path) => ({
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '2px',
    background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
    borderRadius: '2px',
    transform: isActive(path) ? 'scaleX(1)' : 'scaleX(0)',
    transformOrigin: 'left',
    transition: 'transform 0.3s ease'
  })

  const buttonPrimary = {
    padding: '10px 20px',
    background: isDarkMode ? '#3b82f6' : '#111827',
    color: 'white',
    borderRadius: '8px',
    border: 'none',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'all 0.2s'
  }

  const buttonSecondary = {
    padding: '10px 20px',
    background: 'transparent',
    color: colors.text,
    borderRadius: '8px',
    border: `1px solid ${colors.borderSolid}`,
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'all 0.2s'
  }

  const avatarStyle = {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: 600,
    overflow: 'hidden',
    cursor: 'pointer'
  }

  const dropdownStyle = {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    right: 0,
    width: '240px',
    background: colors.dropdownBg,
    borderRadius: '12px',
    boxShadow: isDarkMode ? '0 10px 40px rgba(0,0,0,0.4)' : '0 10px 40px rgba(0,0,0,0.12)',
    border: `1px solid ${colors.borderSolid}`,
    overflow: 'hidden',
    zIndex: 200
  }

  const dropdownItemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    color: colors.text,
    textDecoration: 'none',
    fontSize: '14px',
    transition: 'background 0.2s'
  }

  const mobileMenuStyle = {
    position: 'fixed',
    top: '72px',
    left: 0,
    right: 0,
    bottom: 0,
    background: colors.bgSolid,
    padding: '24px 5%',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    zIndex: 99
  }

  const hamburgerStyle = {
    display: 'none',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px'
  }

  return (
    <>
      <header style={headerStyle}>
        <div style={containerStyle}>
          {/* Logo */}
          <Link href="/" style={logoStyle}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5">
              <path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
              <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
            </svg>
            <span>Kerja Yuk!</span>
          </Link>

          {/* Desktop Nav */}
          <nav style={navStyle} className="desktop-nav">
            <div style={getNavLinkWrapperStyle('/jobs')}>
              <Link href="/jobs" style={{ ...navLinkStyle, color: isActive('/jobs') ? '#3b82f6' : colors.textMuted }}
                onMouseOver={(e) => e.target.style.color = isActive('/jobs') ? '#3b82f6' : colors.text}
                onMouseOut={(e) => e.target.style.color = isActive('/jobs') ? '#3b82f6' : colors.textMuted}>
                Lowongan
              </Link>
              <div style={getActiveIndicatorStyle('/jobs')} />
            </div>
            <div style={getNavLinkWrapperStyle('/companies')}>
              <Link href="/companies" style={{ ...navLinkStyle, color: isActive('/companies') ? '#3b82f6' : colors.textMuted }}
                onMouseOver={(e) => e.target.style.color = isActive('/companies') ? '#3b82f6' : colors.text}
                onMouseOut={(e) => e.target.style.color = isActive('/companies') ? '#3b82f6' : colors.textMuted}>
                Perusahaan
              </Link>
              <div style={getActiveIndicatorStyle('/companies')} />
            </div>
            <div style={getNavLinkWrapperStyle('/about')}>
              <Link href="/about" style={{ ...navLinkStyle, color: isActive('/about') ? '#3b82f6' : colors.textMuted }}
                onMouseOver={(e) => e.target.style.color = isActive('/about') ? '#3b82f6' : colors.text}
                onMouseOut={(e) => e.target.style.color = isActive('/about') ? '#3b82f6' : colors.textMuted}>
                Tentang
              </Link>
              <div style={getActiveIndicatorStyle('/about')} />
            </div>
            <div style={getNavLinkWrapperStyle('/warning')}>
              <Link href="/warning" style={{ ...navLinkStyle, color: isActive('/warning') ? '#ef4444' : '#dc2626' }}
                onMouseOver={(e) => e.target.style.color = '#b91c1c'}
                onMouseOut={(e) => e.target.style.color = isActive('/warning') ? '#ef4444' : '#dc2626'}>
                ⚠️ S&K
              </Link>
              <div style={{ ...getActiveIndicatorStyle('/warning'), background: 'linear-gradient(90deg, #ef4444, #dc2626)' }} />
            </div>
            <div style={getNavLinkWrapperStyle('/news')}>
              <Link href="/news" style={{ ...navLinkStyle, color: isActive('/news') ? '#ef4444' : '#dc2626' }}
                onMouseOver={(e) => e.target.style.color = '#b91c1c'}
                onMouseOut={(e) => e.target.style.color = isActive('/news') ? '#ef4444' : '#dc2626'}>
                Berita Terkini
              </Link>
              <div style={{ ...getActiveIndicatorStyle('/news'), background: 'linear-gradient(90deg, #ef4444, #dc2626)' }} />
            </div>
          </nav>

          {/* Auth Section Desktop */}
          <div style={{ ...navStyle, gap: '12px' }} className="desktop-auth">
            {!isAuthenticated ? (
              <>
                <Link href="/login" style={buttonSecondary}
                  onMouseOver={(e) => e.target.style.background = colors.dropdownHover}
                  onMouseOut={(e) => e.target.style.background = 'transparent'}>
                  Masuk
                </Link>
                <Link href="/register" style={buttonPrimary}
                  onMouseOver={(e) => e.target.style.background = isDarkMode ? '#2563eb' : '#374151'}
                  onMouseOut={(e) => e.target.style.background = isDarkMode ? '#3b82f6' : '#111827'}>
                  Daftar
                </Link>
              </>
            ) : (
              <div style={{ position: 'relative' }}>
                <div
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '4px' }}
                >
                  <span style={{ fontSize: '14px', color: colors.textMuted, fontWeight: 500 }}>
                    {getUserName()}
                  </span>
                  <div style={avatarStyle}>
                    {getUserPhoto() ? (
                      <img src={getUserPhoto()} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      getUserName().charAt(0).toUpperCase()
                    )}
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.textMuted} strokeWidth="2"
                    style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </div>

                {isDropdownOpen && (
                  <>
                    <div style={{ position: 'fixed', inset: 0, zIndex: 150 }} onClick={() => setIsDropdownOpen(false)} />
                    <div style={dropdownStyle}>
                      {/* User Info */}
                      <div style={{ padding: '16px', borderBottom: `1px solid ${colors.borderSolid}`, background: colors.dropdownInfoBg }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ ...avatarStyle, width: '44px', height: '44px', fontSize: '16px' }}>
                            {getUserPhoto() ? (
                              <img src={getUserPhoto()} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              getUserName().charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: colors.text, fontSize: '14px' }}>{getUserName()}</div>
                            <div style={{ fontSize: '12px', color: colors.textMuted }}>{getRoleDisplay()}</div>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div style={{ padding: '8px 0' }}>
                        <Link href={getDashboardLink()} onClick={() => setIsDropdownOpen(false)}
                          style={dropdownItemStyle}
                          onMouseOver={(e) => e.currentTarget.style.background = colors.dropdownHover}
                          onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
                            <rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" />
                          </svg>
                          Dashboard
                        </Link>

                        {user?.role === 'JOBSEEKER' && (
                          <Link href="/profile/jobseeker/applications" onClick={() => setIsDropdownOpen(false)}
                            style={dropdownItemStyle}
                            onMouseOver={(e) => e.currentTarget.style.background = colors.dropdownHover}
                            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                              <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
                            </svg>
                            Lamaran Saya
                          </Link>
                        )}

                        {user?.role === 'RECRUITER' && (
                          <>
                            <Link href="/profile/recruiter/post-job" onClick={() => setIsDropdownOpen(false)}
                              style={dropdownItemStyle}
                              onMouseOver={(e) => e.currentTarget.style.background = colors.dropdownHover}
                              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 5v14M5 12h14" />
                              </svg>
                              Pasang Lowongan
                            </Link>
                            <Link href="/recruiter/applications" onClick={() => setIsDropdownOpen(false)}
                              style={dropdownItemStyle}
                              onMouseOver={(e) => e.currentTarget.style.background = colors.dropdownHover}
                              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                                <circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                              </svg>
                              Pelamar
                            </Link>
                          </>
                        )}
                      </div>

                      {/* Logout */}
                      <div style={{ borderTop: `1px solid ${colors.borderSolid}`, padding: '8px 0' }}>
                        <button onClick={handleLogout}
                          style={{ ...dropdownItemStyle, width: '100%', border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer' }}
                          onMouseOver={(e) => e.currentTarget.style.background = '#fef2f2'}
                          onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
                          </svg>
                          Keluar
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            style={hamburgerStyle}
            className="mobile-menu-btn"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={colors.text} strokeWidth="2">
              {isMenuOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <path d="M3 12h18M3 6h18M3 18h18" />
              )}
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div style={mobileMenuStyle} className="mobile-menu">
          <Link href="/jobs" style={{
            ...navLinkStyle,
            padding: '12px 0',
            fontSize: '16px',
            color: isActive('/jobs') ? '#3b82f6' : colors.textMuted,
            borderLeft: isActive('/jobs') ? '3px solid #3b82f6' : '3px solid transparent',
            paddingLeft: '12px',
            marginLeft: '-12px'
          }} onClick={() => setIsMenuOpen(false)}>
            Lowongan
          </Link>
          <Link href="/companies" style={{
            ...navLinkStyle,
            padding: '12px 0',
            fontSize: '16px',
            color: isActive('/companies') ? '#3b82f6' : colors.textMuted,
            borderLeft: isActive('/companies') ? '3px solid #3b82f6' : '3px solid transparent',
            paddingLeft: '12px',
            marginLeft: '-12px'
          }} onClick={() => setIsMenuOpen(false)}>
            Perusahaan
          </Link>
          <Link href="/about" style={{
            ...navLinkStyle,
            padding: '12px 0',
            fontSize: '16px',
            color: isActive('/about') ? '#3b82f6' : colors.textMuted,
            borderLeft: isActive('/about') ? '3px solid #3b82f6' : '3px solid transparent',
            paddingLeft: '12px',
            marginLeft: '-12px'
          }} onClick={() => setIsMenuOpen(false)}>
            Tentang
          </Link>
          <Link href="/warning" style={{
            ...navLinkStyle,
            padding: '12px 0',
            fontSize: '16px',
            color: isActive('/warning') ? '#ef4444' : '#dc2626',
            borderLeft: isActive('/warning') ? '3px solid #ef4444' : '3px solid transparent',
            paddingLeft: '12px',
            marginLeft: '-12px'
          }} onClick={() => setIsMenuOpen(false)}>
            ⚠️ Syarat & Ketentuan
          </Link>
          <Link href="/news" style={{
            ...navLinkStyle,
            padding: '12px 0',
            fontSize: '16px',
            color: isActive('/news') ? '#ef4444' : '#dc2626',
            borderLeft: isActive('/news') ? '3px solid #ef4444' : '3px solid transparent',
            paddingLeft: '12px',
            marginLeft: '-12px'
          }} onClick={() => setIsMenuOpen(false)}>
            Berita Terkini
          </Link>

          <div style={{ height: '1px', background: '#e5e7eb', margin: '12px 0' }} />

          {!isAuthenticated ? (
            <>
              <Link href="/login" style={{ ...buttonSecondary, textAlign: 'center', marginTop: '8px' }} onClick={() => setIsMenuOpen(false)}>
                Masuk
              </Link>
              <Link href="/register" style={{ ...buttonPrimary, textAlign: 'center' }} onClick={() => setIsMenuOpen(false)}>
                Daftar
              </Link>
            </>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 0' }}>
                <div style={avatarStyle}>
                  {getUserPhoto() ? (
                    <img src={getUserPhoto()} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    getUserName().charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: colors.text }}>{getUserName()}</div>
                  <div style={{ fontSize: '13px', color: colors.textMuted }}>{getRoleDisplay()}</div>
                </div>
              </div>

              <Link href={getDashboardLink()} style={{ ...navLinkStyle, padding: '12px 0' }} onClick={() => setIsMenuOpen(false)}>
                Dashboard
              </Link>
              {user?.role === 'JOBSEEKER' && (
                <Link href="/profile/jobseeker/applications" style={{ ...navLinkStyle, padding: '12px 0' }} onClick={() => setIsMenuOpen(false)}>
                  Lamaran Saya
                </Link>
              )}
              {user?.role === 'RECRUITER' && (
                <>
                  <Link href="/profile/recruiter/post-job" style={{ ...navLinkStyle, padding: '12px 0' }} onClick={() => setIsMenuOpen(false)}>
                    Pasang Lowongan
                  </Link>
                  <Link href="/recruiter/applications" style={{ ...navLinkStyle, padding: '12px 0' }} onClick={() => setIsMenuOpen(false)}>
                    Pelamar
                  </Link>
                </>
              )}

              <div style={{ height: '1px', background: colors.borderSolid, margin: '12px 0' }} />

              <button onClick={handleLogout} style={{ ...buttonSecondary, color: '#ef4444', borderColor: '#fecaca', width: '100%' }}>
                Keluar
              </button>
            </>
          )}
        </div>
      )}

      {/* Spacer for fixed header */}
      <div style={{ height: '72px' }} />

      <style jsx>{`
        @media (min-width: 769px) {
          .mobile-menu-btn { display: none !important; }
          .mobile-menu { display: none !important; }
        }
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .desktop-auth { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </>
  )
}

export default Header