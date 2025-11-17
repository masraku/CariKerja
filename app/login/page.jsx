'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Swal from 'sweetalert2'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('jobseeker')
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()

  // Handle query alerts
  useEffect(() => {
    const urlRole = searchParams.get('role')
    const action = searchParams.get('action')
    const registered = searchParams.get('registered')

    if (urlRole && ['jobseeker', 'recruiter', 'admin'].includes(urlRole)) {
      setRole(urlRole)
    }

    if (registered === 'success') {
      Swal.fire({
        icon: 'success',
        title: 'Pendaftaran Berhasil',
        text: 'Akun Anda telah berhasil dibuat. Silakan login.',
        confirmButtonColor: '#2563EB'
      })
    }

    if (action === 'register') {
      Swal.fire({
        icon: 'info',
        title: 'Daftar Diperlukan',
        text: 'Silakan daftar terlebih dahulu untuk melanjutkan.',
        confirmButtonColor: '#2563EB'
      })
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

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          role: role.toUpperCase()
        }),
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

      // Success Alert
      await Swal.fire({
        icon: 'success',
        title: 'Berhasil Masuk',
        text: 'Selamat datang kembali!',
        timer: 1500,
        showConfirmButton: false
      })

      // Save Session
      localStorage.setItem('user', JSON.stringify(data.user))
      localStorage.setItem('token', data.token)

      const action = searchParams.get('action')

      // Special flow posting lowongan
      if (action === 'post-job' && role === 'recruiter') {
        router.push('/post-job')
        return
      }

      // Redirect based on role
      if (data.user.role === 'JOBSEEKER') {
        const completed = data.user.jobseeker?.profileCompleted
        router.push(!completed ? '/profile/jobseeker' : '/dashboard/jobseeker')
      } else if (data.user.role === 'RECRUITER') {
        const verified = data.user.company?.verified
        router.push(!verified ? '/profile/recruiter' : '/dashboard/recruiter')
      } else {
        router.push('/dashboard/admin')
      }

    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Login Error',
        text: 'Terjadi kesalahan, silakan coba lagi.',
        confirmButtonColor: '#2563EB'
      })
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const getRoleLabel = (value) => ({
    jobseeker: 'Pencari Kerja',
    recruiter: 'Recruiter',
    admin: 'Administrator',
  }[value])

  const getRoleIcon = (value) => ({
    jobseeker: '👤',
    recruiter: '🏢',
    admin: '⚙️',
  }[value])

  const getRegisterLink = () =>
    role === 'recruiter' ? '/register/recruiter' : '/register/jobseeker'

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Selamat Datang</h2>
          <p className="text-gray-600 mt-2">Masuk ke akun Anda</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-sm font-semibold mb-2">Email</label>
            <input
              type="email"
              required
              className="w-full px-4 py-3 border rounded-lg focus:ring-blue-500"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold mb-2">Password</label>
            <input
              type="password"
              required
              className="w-full px-4 py-3 border rounded-lg focus:ring-blue-500"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-semibold mb-3">Login Sebagai</label>
            <div className="grid grid-cols-3 gap-3">
              {['jobseeker', 'recruiter', 'admin'].map((r) => (
                <label
                  key={r}
                  className={`p-4 border-2 rounded-lg text-center cursor-pointer ${
                    role === r ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <input
                    type="radio"
                    value={r}
                    checked={role === r}
                    onChange={(e) => setRole(e.target.value)}
                    className="sr-only"
                  />
                  <div className="text-2xl">{getRoleIcon(r)}</div>
                  <div className="text-xs font-medium mt-1">
                    {getRoleLabel(r)}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 text-white font-semibold rounded-lg ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isLoading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>

        {/* Register Link */}
        <div className="text-center mt-6">
          <p className="text-sm">
            Belum punya akun?{' '}
            <Link href={getRegisterLink()} className="text-blue-600 font-semibold">
              Daftar sebagai {getRoleLabel(role)}
            </Link>
          </p>
        </div>

        {/* Back */}
        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-gray-500 flex items-center justify-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Kembali ke Beranda
          </Link>
        </div>

      </div>
    </div>
  )
}
