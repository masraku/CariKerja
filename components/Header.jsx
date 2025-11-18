'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const { user, logout, isAuthenticated } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    setIsDropdownOpen(false)
    setIsMenuOpen(false)
  }

  // Get user's display name
  const getUserName = () => {
    if (!user) return 'User'
    
    if (user.role === 'JOBSEEKER' && user.jobseeker) {
      return user.jobseeker.firstName || 'User'
    }
    
    if (user.role === 'RECRUITER' && user.recruiter) {
      return user.recruiter.firstName || 'User'
    }
    
    return user.email?.split('@')[0] || 'User'
  }

  // Get user's full name
  const getUserFullName = () => {
    if (!user) return 'User'
    
    if (user.role === 'JOBSEEKER' && user.jobseeker) {
      return `${user.jobseeker.firstName || ''} ${user.jobseeker.lastName || ''}`.trim()
    }
    
    if (user.role === 'RECRUITER' && user.recruiter) {
      return `${user.recruiter.firstName || ''} ${user.recruiter.lastName || ''}`.trim()
    }
    
    return user.email?.split('@')[0] || 'User'
  }

  // Get user role display
  const getUserRoleDisplay = () => {
    if (!user) return ''
    
    const roleMap = {
      'JOBSEEKER': 'Pencari Kerja',
      'RECRUITER': 'Recruiter',
      'ADMIN': 'Administrator'
    }
    
    return roleMap[user.role] || user.role
  }

  // Get user photo
  const getUserPhoto = () => {
    if (!user) return null
    
    if (user.role === 'JOBSEEKER' && user.jobseeker?.photo) {
      return user.jobseeker.photo
    }
    
    if (user.role === 'RECRUITER' && user.recruiter?.company?.logo) {
      return user.recruiter.company.logo
    }
    
    return null
  }

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
              <span className="text-xl font-bold text-gray-800">JobSeeker</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/jobs" className="text-gray-600 hover:text-blue-600 transition-colors">
              Cari Lowongan
            </Link>
            <Link href="/companies" className="text-gray-600 hover:text-blue-600 transition-colors">
              Perusahaan
            </Link>
            <Link href="/warning" className="text-gray-600 hover:text-blue-600 transition-colors">
              Wajib Baca
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-blue-600 transition-colors">
              Tentang Kami
            </Link>
          </nav>

          {/* Auth Section - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {!isAuthenticated ? (
              <>
                {/* Login Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="text-gray-600 hover:text-blue-600 font-medium transition-colors flex items-center space-x-1"
                  >
                    <span>Masuk</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isDropdownOpen && (
                    <>
                      {/* Overlay untuk close dropdown */}
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setIsDropdownOpen(false)}
                      ></div>
                      
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 border border-gray-100 z-20">
                        <Link
                          href="/login?role=jobseeker"
                          onClick={() => setIsDropdownOpen(false)}
                          className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                        >
                          👤 Pencari Kerja
                        </Link>
                        <Link
                          href="/login?role=recruiter"
                          onClick={() => setIsDropdownOpen(false)}
                          className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                        >
                          🏢 Perusahaan
                        </Link>
                        <hr className="my-2 border-gray-100" />
                        <Link
                          href="/login?role=admin"
                          onClick={() => setIsDropdownOpen(false)}
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                        >
                          ⚙️ Admin
                        </Link>
                      </div>
                    </>
                  )}
                </div>

                {/* Register Button */}
                <Link 
                  href="/register" 
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Daftar
                </Link>

                {/* Post Job Button */}
                <Link 
                  href="/login?role=recruiter&action=post-job" 
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Pasang Lowongan
                </Link>
              </>
            ) : (
              <>
                {/* Greeting & User Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-600 text-sm">Hi,</span>
                      <span className="font-semibold text-gray-900">{getUserName()}</span>
                    </div>
                    
                    {/* Avatar with Photo */}
                    <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold shadow-md overflow-hidden">
                      {getUserPhoto() ? (
                        <img 
                          src={getUserPhoto()} 
                          alt={getUserName()}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        getUserName().charAt(0).toUpperCase()
                      )}
                    </div>

                    <svg 
                      className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isDropdownOpen && (
                    <>
                      {/* Overlay untuk close dropdown */}
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setIsDropdownOpen(false)}
                      ></div>
                      
                      <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl py-2 border border-gray-100 z-20">
                        {/* User Info Header */}
                        <div className="px-4 py-3 border-b border-gray-100">
                          <div className="flex items-center gap-3 mb-2">
                            {/* Avatar in dropdown */}
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md overflow-hidden flex-shrink-0">
                              {getUserPhoto() ? (
                                <img 
                                  src={getUserPhoto()} 
                                  alt={getUserName()}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                getUserName().charAt(0).toUpperCase()
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">{getUserFullName()}</p>
                              <p className="text-xs text-gray-500 truncate">{user.email}</p>
                            </div>
                          </div>
                          <div>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {getUserRoleDisplay()}
                            </span>
                          </div>
                        </div>

                        {/* Menu Items */}
                        <div className="py-1">
                          {/* Dashboard */}
                          <Link
                            href={
                              user.role === 'JOBSEEKER' 
                                ? '/dashboard/jobseeker' 
                                : user.role === 'RECRUITER'
                                ? '/dashboard/recruiter'
                                : '/dashboard'
                            }
                            onClick={() => setIsDropdownOpen(false)}
                            className="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          >
                            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                            Dashboard
                          </Link>

                          {/* Jobseeker: Riwayat Lamaran */}
                          {user.role === 'JOBSEEKER' && (
                            <Link
                              href="/jobseeker/applications"
                              onClick={() => setIsDropdownOpen(false)}
                              className="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            >
                              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              Riwayat Lamaran
                            </Link>
                          )}

                          {/* Recruiter: Pasang Lowongan */}
                          {user.role === 'RECRUITER' && (
                            <Link
                              href="/post-job"
                              onClick={() => setIsDropdownOpen(false)}
                              className="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            >
                              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                              Pasang Lowongan
                            </Link>
                          )}

                          {/* Recruiter: Applicants */}
                          {user.role === 'RECRUITER' && (
                            <Link
                              href="/recruiter/applications"
                              onClick={() => setIsDropdownOpen(false)}
                              className="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            >
                              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                              Pelamar
                            </Link>
                          )}

                          {/* Settings */}
                          <Link
                            href="/settings"
                            onClick={() => setIsDropdownOpen(false)}
                            className="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          >
                            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Pengaturan
                          </Link>
                        </div>

                        {/* Logout */}
                        <div className="border-t border-gray-100 pt-1">
                          <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Keluar
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-100 py-4">
            <nav className="flex flex-col space-y-4">
              <Link href="/jobs" className="text-gray-600 hover:text-blue-600 transition-colors">
                Cari Lowongan
              </Link>
              <Link href="/companies" className="text-gray-600 hover:text-blue-600 transition-colors">
                Perusahaan
              </Link>
              <Link href="/warning" className="text-gray-600 hover:text-blue-600 transition-colors">
                Wajib Baca
              </Link>
              <Link href="/about" className="text-gray-600 hover:text-blue-600 transition-colors">
                Tentang Kami
              </Link>
              <hr className="border-gray-100" />

              {!isAuthenticated ? (
                <>
                  <Link
                    href="/login?role=jobseeker"
                    className="text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    👤 Masuk sebagai Pencari Kerja
                  </Link>
                  <Link
                    href="/login?role=recruiter"
                    className="text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    🏢 Masuk sebagai Perusahaan
                  </Link>
                  <Link 
                    href="/register" 
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium text-center"
                  >
                    Daftar
                  </Link>
                  <Link 
                    href="/login?role=recruiter&action=post-job" 
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium text-center"
                  >
                    Pasang Lowongan
                  </Link>
                </>
              ) : (
                <>
                  {/* Mobile User Info */}
                  <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {/* Avatar with Photo - Mobile */}
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md overflow-hidden flex-shrink-0">
                        {getUserPhoto() ? (
                          <img 
                            src={getUserPhoto()} 
                            alt={getUserName()}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          getUserName().charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Hi, {getUserName()}!</p>
                        <p className="text-sm text-gray-600">{getUserRoleDisplay()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Dashboard */}
                  <Link 
                    href={
                      user.role === 'JOBSEEKER' 
                        ? '/jobseeker/dashboard' 
                        : user.role === 'RECRUITER'
                        ? '/recruiter/dashboard'
                        : '/dashboard'
                    }
                    className="text-gray-700 font-medium hover:text-blue-600 flex items-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    Dashboard
                  </Link>

                  {/* Jobseeker: Riwayat Lamaran */}
                  {user.role === 'JOBSEEKER' && (
                    <Link 
                      href="/jobseeker/applications" 
                      className="text-gray-700 font-medium hover:text-blue-600 flex items-center"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Riwayat Lamaran
                    </Link>
                  )}

                  {/* Recruiter: Pasang Lowongan */}
                  {user.role === 'RECRUITER' && (
                    <Link 
                      href="/post-job" 
                      className="text-gray-700 font-medium hover:text-blue-600 flex items-center"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Pasang Lowongan
                    </Link>
                  )}

                  {/* Recruiter: Pelamar */}
                  {user.role === 'RECRUITER' && (
                    <Link 
                      href="/recruiter/applications" 
                      className="text-gray-700 font-medium hover:text-blue-600 flex items-center"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Pelamar
                    </Link>
                  )}

                  {/* Settings */}
                  <Link 
                    href="/settings" 
                    className="text-gray-700 hover:text-blue-600 flex items-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Pengaturan
                  </Link>

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors font-medium text-center flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Keluar
                  </button>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header