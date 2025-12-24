'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import Swal from 'sweetalert2'
import { Mail, Lock, User, Building2, ArrowRight, Loader2, ArrowLeft, Briefcase } from 'lucide-react'

function LoginContent() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Registration State
  const [registerRole, setRegisterRole] = useState(null)
  const [regForm, setRegForm] = useState({
    name: '', // Jobseeker
    email: '', // Shared (Jobseeker & Recruiter Company Email)
    password: '', // Shared
    confirmPassword: '', // Shared
    phone: '', // Shared (Jobseeker Phone & Recruiter Contact Phone)
    companyName: '', // Recruiter
    contactPerson: '', // Recruiter
    agreeTerms: false
  })
  const [regErrors, setRegErrors] = useState({})

  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, refreshUser, isAuthenticated } = useAuth()

  // Handle query alerts & Auto-open Register
  useEffect(() => {
    const action = searchParams.get('action')
    const registered = searchParams.get('registered')
    const roleParam = searchParams.get('role')

    if (registered === 'success') {
      Swal.fire({
        icon: 'success',
        title: 'Pendaftaran Berhasil',
        text: 'Akun Anda telah berhasil dibuat. Silakan login.',
        confirmButtonColor: '#2563EB'
      })
      setIsSignUp(false)
      setRegisterRole(null)
    }

    if (action === 'register') {
      setIsSignUp(true)
      if (roleParam === 'jobseeker' || roleParam === 'recruiter') {
        setRegisterRole(roleParam)
      }
    }

    if (action === 'post-job') {
      Swal.fire({
        icon: 'info',
        title: 'Login Diperlukan',
        text: 'Silakan login sebagai recruiter untuk memposting pekerjaan.',
        confirmButtonColor: '#2563EB'
      })
    }
  }, [searchParams])

  // Reset form when switching roles or closing panel
  useEffect(() => {
    if (!isSignUp) {
      setRegisterRole(null)
      setRegErrors({})
    }
  }, [isSignUp])

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const userFromContext = JSON.parse(localStorage.getItem('user') || '{}')
      const userRole = userFromContext?.role
      
      if (userRole === 'ADMIN') router.push('/admin')
      else if (userRole === 'RECRUITER') router.push('/profile/recruiter/dashboard')
      else if (userRole === 'JOBSEEKER') router.push('/profile/jobseeker/dashboard')
      else router.push('/')
    }
  }, [isAuthenticated, router])

  const validateRegister = () => {
    const errors = {}
    
    // Common validations
    if (!regForm.password) errors.password = 'Password wajib diisi'
    else if (regForm.password.length < 6) errors.password = 'Minimal 6 karakter'
    
    if (regForm.password !== regForm.confirmPassword) {
      errors.confirmPassword = 'Password tidak cocok'
    }

    if (!regForm.agreeTerms) errors.agreeTerms = 'Anda harus menyetujui S&K'

    // Role specific
    if (registerRole === 'jobseeker') {
      if (!regForm.name?.trim()) errors.name = 'Nama lengkap wajib diisi'
      if (!regForm.email?.trim()) errors.email = 'Email wajib diisi'
      else if (!/\S+@\S+\.\S+/.test(regForm.email)) errors.email = 'Format email tidak valid'
      if (!regForm.phone?.trim()) errors.phone = 'Nomor telepon wajib diisi'
    } 
    else if (registerRole === 'recruiter') {
      if (!regForm.companyName?.trim()) errors.companyName = 'Nama perusahaan wajib diisi'
      if (!regForm.email?.trim()) errors.email = 'Email perusahaan wajib diisi'
      else if (!/\S+@\S+\.\S+/.test(regForm.email)) errors.email = 'Format email tidak valid'
      if (!regForm.contactPerson?.trim()) errors.contactPerson = 'Nama kontak wajib diisi'
      if (!regForm.phone?.trim()) errors.phone = 'Nomor telepon wajib diisi'
    }

    setRegErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleRegisterSubmit = async (e) => {
    e.preventDefault()
    if (!validateRegister()) return

    setIsLoading(true)
    setRegErrors({})

    try {
      const endpoint = registerRole === 'jobseeker' 
        ? '/api/auth/register/jobseeker' 
        : '/api/auth/register/recruiter'

      const payload = registerRole === 'jobseeker' 
        ? {
            name: regForm.name,
            email: regForm.email,
            password: regForm.password,
            phone: regForm.phone
          }
        : {
            companyName: regForm.companyName,
            companyEmail: regForm.email,
            contactPersonName: regForm.contactPerson,
            contactPersonPhone: regForm.phone,
            password: regForm.password
          }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Registrasi gagal')
      }

      Swal.fire({
        icon: 'success',
        title: 'Registrasi Berhasil',
        text: 'Akun Anda telah berhasil dibuat. Silakan login.',
        confirmButtonColor: '#2563EB'
      })

      // Switch to login view
      setIsSignUp(false)
      setRegisterRole(null)
      setEmail(regForm.email) 
      setPassword('')

    } catch (error) {
      console.error('Registration error:', error)
      Swal.fire({
        icon: 'error',
        title: 'Registrasi Gagal',
        text: error.message || 'Terjadi kesalahan saat registrasi.',
        confirmButtonColor: '#2563EB'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        Swal.fire({
          icon: 'error',
          title: 'Login Gagal',
          text: data.error || 'Terjadi kesalahan saat login.',
          confirmButtonColor: '#2563EB'
        })
        return
      }

      await login(data.token, data.user)
      await refreshUser()

      Swal.fire({
        icon: 'success',
        title: 'Berhasil Masuk',
        text: 'Selamat datang kembali!',
        timer: 1500,
        showConfirmButton: false
      })

      const action = searchParams.get('action')
      if (action === 'post-job' && data.user.role === 'RECRUITER') {
        router.push('/profile/recruiter/post-job')
        return
      }

      if (data.user.role === 'JOBSEEKER') router.push('/profile/jobseeker/dashboard')
      else if (data.user.role === 'RECRUITER') router.push('/profile/recruiter/dashboard')
      else if (data.user.role === 'ADMIN') router.push('/admin')
      else router.push('/')
      
      router.refresh()

    } catch (error) {
      console.error(error)
      Swal.fire({
        icon: 'error',
        title: 'Login Error',
        text: 'Terjadi kesalahan, silakan coba lagi.',
        confirmButtonColor: '#2563EB'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex bg-gray-50">
      
       {/* REGISTER FORM CONTAINER (Left Side - Revealed when isSignUp is true) */}
      <div className={`absolute top-0 left-0 w-full lg:w-1/2 h-full flex items-center justify-center p-8 lg:p-12 bg-white transition-all duration-700 ease-in-out z-10 ${isSignUp ? 'opacity-100 z-50' : 'opacity-0 z-0'}`}>
        <div className="w-full max-w-md space-y-8">
            {!registerRole ? (
                // ROLE SELECTION
                <div className="text-center space-y-8">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">Bergabung Sekarang</h2>
                        <p className="text-gray-500 mt-2">Pilih peran yang sesuai untuk mendaftar akun baru</p>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4 w-full">
                        <button onClick={() => setRegisterRole('jobseeker')} className="group relative overflow-hidden rounded-xl border-2 border-gray-100 bg-white p-6 hover:border-blue-500 hover:shadow-xl transition-all duration-300 text-left w-full">
                            <div className="flex items-start justify-between">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <User className="w-6 h-6" />
                                </div>
                                <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 transition-colors" />
                            </div>
                            <h3 className="mt-4 text-lg font-bold text-gray-900">Kandidat</h3>
                            <p className="mt-1 text-sm text-gray-500">Saya ingin mencari pekerjaan impian</p>
                        </button>

                        <button onClick={() => setRegisterRole('recruiter')} className="group relative overflow-hidden rounded-xl border-2 border-gray-100 bg-white p-6 hover:border-purple-500 hover:shadow-xl transition-all duration-300 text-left w-full">
                            <div className="flex items-start justify-between">
                                <div className="p-3 bg-purple-50 text-purple-600 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                    <Building2 className="w-6 h-6" />
                                </div>
                                <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-purple-500 transition-colors" />
                            </div>
                            <h3 className="mt-4 text-lg font-bold text-gray-900">Perusahaan</h3>
                            <p className="mt-1 text-sm text-gray-500">Saya ingin merekrut talenta terbaik</p>
                        </button>
                    </div>

                    <div>
                        <p className="text-sm text-gray-500">
                          Sudah punya akun?{' '}
                          <button 
                            onClick={() => setIsSignUp(false)} 
                            className="font-bold text-blue-600 hover:text-blue-700"
                          >
                            Masuk Sekarang
                          </button>
                        </p>
                    </div>
                </div>
            ) : (
                // REGISTRATION FORM
                <div className="text-left w-full">
                    <button 
                        onClick={() => setRegisterRole(null)} 
                        className="flex items-center text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Kembali
                    </button>
                    
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">
                            {registerRole === 'jobseeker' ? 'Daftar Kandidat' : 'Daftar Perusahaan'}
                        </h2>
                        <p className="text-gray-500 mt-1">
                            {registerRole === 'jobseeker' ? 'Lengkapi data diri Anda' : 'Lengkapi data perusahaan Anda'}
                        </p>
                    </div>

                    <form onSubmit={handleRegisterSubmit} className="space-y-4">
                        {/* JOBSEEKER FIELDS */}
                        {registerRole === 'jobseeker' && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                                    <input
                                        type="text"
                                        value={regForm.name}
                                        onChange={e => setRegForm({...regForm, name: e.target.value})}
                                        className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:outline-none transition-all ${regErrors.name ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'}`}
                                        placeholder="Nama Lengkap"
                                    />
                                    {regErrors.name && <p className="text-red-500 text-xs mt-1">{regErrors.name}</p>}
                                </div>
                            </>
                        )}

                        {/* RECRUITER FIELDS */}
                        {registerRole === 'recruiter' && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Perusahaan</label>
                                    <input
                                        type="text"
                                        value={regForm.companyName}
                                        onChange={e => setRegForm({...regForm, companyName: e.target.value})}
                                        className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:outline-none transition-all ${regErrors.companyName ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-purple-500 focus:ring-purple-200'}`}
                                        placeholder="PT. Perusahaan Anda"
                                    />
                                    {regErrors.companyName && <p className="text-red-500 text-xs mt-1">{regErrors.companyName}</p>}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                     <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kontak</label>
                                        <input
                                            type="text"
                                            value={regForm.contactPerson}
                                            onChange={e => setRegForm({...regForm, contactPerson: e.target.value})}
                                            className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:outline-none transition-all ${regErrors.contactPerson ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-purple-500 focus:ring-purple-200'}`}
                                            placeholder="PIC Name"
                                        />
                                        {regErrors.contactPerson && <p className="text-red-500 text-xs mt-1">{regErrors.contactPerson}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">No. HP Kontak</label>
                                        <input
                                            type="tel"
                                            value={regForm.phone}
                                            onChange={e => setRegForm({...regForm, phone: e.target.value})}
                                            className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:outline-none transition-all ${regErrors.phone ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-purple-500 focus:ring-purple-200'}`}
                                            placeholder="08..."
                                        />
                                        {regErrors.phone && <p className="text-red-500 text-xs mt-1">{regErrors.phone}</p>}
                                    </div>
                                </div>
                            </>
                        )}

                        {/* SHARED FIELDS */}
                        {registerRole === 'jobseeker' && (
                             <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">No. Handphone</label>
                                <input
                                    type="tel"
                                    value={regForm.phone}
                                    onChange={e => setRegForm({...regForm, phone: e.target.value})}
                                    className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:outline-none transition-all ${regErrors.phone ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'}`}
                                    placeholder="08..."
                                />
                                {regErrors.phone && <p className="text-red-500 text-xs mt-1">{regErrors.phone}</p>}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                value={regForm.email}
                                onChange={e => setRegForm({...regForm, email: e.target.value})}
                                className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:outline-none transition-all ${regErrors.email ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'}`}
                                placeholder="email@example.com"
                            />
                            {regErrors.email && <p className="text-red-500 text-xs mt-1">{regErrors.email}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                <input
                                    type="password"
                                    value={regForm.password}
                                    onChange={e => setRegForm({...regForm, password: e.target.value})}
                                    className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:outline-none transition-all ${regErrors.password ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'}`}
                                    placeholder="******"
                                />
                                {regErrors.password && <p className="text-red-500 text-xs mt-1">{regErrors.password}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Konf. Password</label>
                                <input
                                    type="password"
                                    value={regForm.confirmPassword}
                                    onChange={e => setRegForm({...regForm, confirmPassword: e.target.value})}
                                    className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:outline-none transition-all ${regErrors.confirmPassword ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'}`}
                                    placeholder="******"
                                />
                            </div>
                        </div>
                        {regErrors.confirmPassword && <p className="text-red-500 text-xs -mt-2">{regErrors.confirmPassword}</p>}

                        <div className="flex items-start">
                            <input
                                type="checkbox"
                                checked={regForm.agreeTerms}
                                onChange={e => setRegForm({...regForm, agreeTerms: e.target.checked})}
                                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-xs text-gray-600">
                                Saya menyetujui <a href="/warning" className="text-blue-600 hover:underline">Syarat & Ketentuan</a>
                            </span>
                        </div>
                        {regErrors.agreeTerms && <p className="text-red-500 text-xs">{regErrors.agreeTerms}</p>}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-3 rounded-lg font-bold text-white transition-all transform hover:-translate-y-0.5 ${registerRole === 'recruiter' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                        >
                            {isLoading ? 'Memproses...' : 'Daftar Sekarang'}
                        </button>
                    </form>
                </div>
            )}
        </div>
      </div>

      {/* LOGIN FORM CONTAINER (Right Side - Default) */}
      <div className={`flex items-center justify-center p-8 lg:p-12 w-full lg:w-1/2 h-full bg-white absolute top-0 right-0 transition-all duration-700 ease-in-out ${isSignUp ? 'opacity-0 z-0' : 'opacity-100 z-20'}`}>
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-gray-900">Selamat Datang Kembali</h2>
            <p className="mt-2 text-gray-500">Masuk untuk mengakses akun Anda</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white"
                    placeholder="nama@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-500">
                  Ingat saya
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                  Lupa password?
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg hover:shadow-blue-600/20"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  Masuk Sekarang
                  <ArrowRight className="ml-2 w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">
                  Belum punya akun?
                </span>
              </div>
            </div>

            <div className="mt-6 text-center">
               <button 
                onClick={() => setIsSignUp(true)}
                className="inline-flex items-center justify-center w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900 transition-all duration-200"
              >
                Daftar Akun Baru
              </button>
            </div>
          </div>
        </div>
      </div>

       {/* OVERLAY / BLUE PANEL (Moves Left <-> Right) */}
      <div className={`hidden lg:flex absolute top-0 left-0 w-1/2 h-full bg-blue-600 overflow-hidden transition-transform duration-700 ease-in-out z-40 transform ${isSignUp ? 'translate-x-[100%]' : 'translate-x-0'}`}>
         
         {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-900 opacity-90 z-10" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497215728101-856f4ea42174?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')] bg-cover bg-center" />
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-white/10 rounded-full blur-3xl z-10" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl z-10" />

        {/* Content */}
        <div className="relative z-20 flex flex-col justify-between w-full p-12 text-white h-full">
          <div>
            <Link href="/" className="flex items-center gap-3 text-white/90 hover:text-white transition-colors w-fit">
              <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
                <ArrowLeft className="w-5 h-5" />
              </div>
              <span className="font-medium">Kembali ke Beranda</span>
            </Link>
          </div>

          <div className="space-y-6">
            <h1 className="text-5xl font-bold leading-tight">
              Temukan Karir <br/>
              <span className="text-blue-200">Impian Anda</span>
            </h1>
            <p className="text-lg text-blue-100 max-w-md leading-relaxed">
              Bergabunglah dengan ribuan profesional yang telah menemukan kesuksesan karir mereka bersama JobSeeker.
            </p>
          </div>

          <div className="flex items-center gap-4 text-sm text-blue-200">
            <span>© {new Date().getFullYear()} JobSeeker</span>
            <span className="w-1 h-1 bg-blue-400 rounded-full" />
            <span>Privacy Policy</span>
            <span className="w-1 h-1 bg-blue-400 rounded-full" />
            <span>Terms of Service</span>
          </div>
        </div>
      </div>

    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-white mx-auto mb-4"></div>
          <p className="text-white">Memuat halaman...</p>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}