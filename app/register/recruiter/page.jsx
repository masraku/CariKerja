'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RecruiterSignup() {
  const router = useRouter()
  const [form, setForm] = useState({
    companyName: '',
    companyEmail: '',
    contactPerson: '',
    phone: '',
    password: '',
    confirmPassword: '',
    companyAddress: '',
    companyWebsite: '',
    agreeTerms: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const validateForm = () => {
    const newErrors = {}

    if (!form.companyName.trim()) {
      newErrors.companyName = 'Nama perusahaan wajib diisi'
    }

    if (!form.companyEmail.trim()) {
      newErrors.companyEmail = 'Email perusahaan wajib diisi'
    } else if (!/\S+@\S+\.\S+/.test(form.companyEmail)) {
      newErrors.companyEmail = 'Format email tidak valid'
    }

    if (!form.contactPerson.trim()) {
      newErrors.contactPerson = 'Nama contact person wajib diisi'
    }

    if (!form.phone.trim()) {
      newErrors.phone = 'Nomor telepon wajib diisi'
    }

    if (!form.password) {
      newErrors.password = 'Password wajib diisi'
    } else if (form.password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter'
    }

    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Password tidak cocok'
    }

    if (!form.companyAddress.trim()) {
      newErrors.companyAddress = 'Alamat perusahaan wajib diisi'
    }

    if (!form.agreeTerms) {
      newErrors.agreeTerms = 'Anda harus menyetujui syarat dan ketentuan'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      const response = await fetch('/api/auth/register/recruiter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyName: form.companyName,
          companyEmail: form.companyEmail,
          contactPerson: form.contactPerson,
          phone: form.phone,
          password: form.password,
          companyAddress: form.companyAddress,
          companyWebsite: form.companyWebsite || null
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Registrasi gagal')
      }

      // Redirect ke login dengan success message
      router.push('/login?role=recruiter&registered=success')
    } catch (error) {
      console.error('Registration error:', error)
      setErrors({
        submit: error.message || 'Terjadi kesalahan saat registrasi. Silakan coba lagi.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 py-12 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-4">
            <span className="text-3xl">🏢</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Daftar Sebagai Recruiter</h2>
          <p className="text-gray-600 mt-2">Bergabunglah dan temukan kandidat terbaik untuk perusahaan Anda</p>
        </div>

        {/* Error Alert */}
        {errors.submit && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-red-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-800">{errors.submit}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nama Perusahaan */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nama Perusahaan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="PT. Contoh Indonesia"
                className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition ${
                  errors.companyName ? 'border-red-500' : 'border-gray-300'
                }`}
                value={form.companyName}
                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
              />
              {errors.companyName && <p className="text-red-500 text-xs mt-1">{errors.companyName}</p>}
            </div>

            {/* Email Perusahaan */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Perusahaan <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                placeholder="hr@perusahaan.com"
                className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition ${
                  errors.companyEmail ? 'border-red-500' : 'border-gray-300'
                }`}
                value={form.companyEmail}
                onChange={(e) => setForm({ ...form, companyEmail: e.target.value })}
              />
              {errors.companyEmail && <p className="text-red-500 text-xs mt-1">{errors.companyEmail}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nama Contact Person */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nama Contact Person <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Nama lengkap PIC"
                className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition ${
                  errors.contactPerson ? 'border-red-500' : 'border-gray-300'
                }`}
                value={form.contactPerson}
                onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
              />
              {errors.contactPerson && <p className="text-red-500 text-xs mt-1">{errors.contactPerson}</p>}
            </div>

            {/* Nomor Telepon */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nomor Telepon <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                placeholder="021xxxxxxxx"
                className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>
          </div>

          {/* Alamat Perusahaan */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Alamat Perusahaan <span className="text-red-500">*</span>
            </label>
            <textarea
              placeholder="Alamat lengkap perusahaan"
              rows="3"
              className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition ${
                errors.companyAddress ? 'border-red-500' : 'border-gray-300'
              }`}
              value={form.companyAddress}
              onChange={(e) => setForm({ ...form, companyAddress: e.target.value })}
            />
            {errors.companyAddress && <p className="text-red-500 text-xs mt-1">{errors.companyAddress}</p>}
          </div>

          {/* Website Perusahaan (Optional) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Website Perusahaan (Opsional)
            </label>
            <input
              type="url"
              placeholder="https://www.perusahaan.com"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
              value={form.companyWebsite}
              onChange={(e) => setForm({ ...form, companyWebsite: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                placeholder="Minimal 6 karakter"
                className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Konfirmasi Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                placeholder="Masukkan password yang sama"
                className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition ${
                  errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                }`}
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              />
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>
          </div>

          {/* Terms and Conditions */}
          <div>
            <label className="flex items-start">
              <input
                type="checkbox"
                className={`mt-1 rounded border-gray-300 text-green-600 focus:ring-green-500 ${
                  errors.agreeTerms ? 'border-red-500' : ''
                }`}
                checked={form.agreeTerms}
                onChange={(e) => setForm({ ...form, agreeTerms: e.target.checked })}
              />
              <span className="ml-2 text-sm text-gray-600">
                Saya menyetujui{' '}
                <Link href="/terms" className="text-green-600 hover:underline">
                  Syarat dan Ketentuan
                </Link>{' '}
                serta{' '}
                <Link href="/privacy" className="text-green-600 hover:underline">
                  Kebijakan Privasi
                </Link>
              </span>
            </label>
            {errors.agreeTerms && <p className="text-red-500 text-xs mt-1">{errors.agreeTerms}</p>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200 ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 hover:shadow-lg transform hover:-translate-y-0.5'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Memproses...
              </span>
            ) : (
              'Daftar Sekarang'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">atau</span>
          </div>
        </div>

        {/* Login Link */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Sudah punya akun?{' '}
            <Link href="/login?role=recruiter" className="text-green-600 hover:text-green-700 font-semibold hover:underline">
              Masuk di sini
            </Link>
          </p>
        </div>

        {/* Register as Jobseeker */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Ingin mencari pekerjaan?{' '}
            <Link href="/register/jobseeker" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline">
              Daftar sebagai Jobseeker
            </Link>
          </p>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 flex items-center justify-center gap-1">
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