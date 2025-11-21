'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Swal from 'sweetalert2'

export default function RecruiterSignup() {
  const router = useRouter()
  const [form, setForm] = useState({
    companyName: '',
    companyEmail: '',
    contactPerson: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    // ✅ Client-side validation with detailed error messages
    const errors = []

    if (!form.companyName?.trim()) errors.push('Nama Perusahaan')
    if (!form.companyEmail?.trim()) errors.push('Email Perusahaan')
    if (!form.contactPerson?.trim()) errors.push('Nama Contact Person')
    if (!form.phone?.trim()) errors.push('Nomor Telepon')
    if (!form.password?.trim()) errors.push('Password')
    if (!form.confirmPassword?.trim()) errors.push('Konfirmasi Password')

    if (errors.length > 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Field Belum Lengkap',
        html: `
          <p class="text-left mb-2">Field yang masih kosong:</p>
          <ul class="text-left list-disc list-inside">
            ${errors.map(field => `<li>${field}</li>`).join('')}
          </ul>
        `,
        confirmButtonColor: '#2563EB'
      })
      return
    }

    // ✅ Validate phone number format
    const phoneRegex = /^[0-9+\-\s()]+$/
    if (!phoneRegex.test(form.phone)) {
      Swal.fire({
        icon: 'warning',
        title: 'Format Nomor Telepon Salah',
        text: 'Nomor telepon hanya boleh berisi angka, +, -, spasi, atau tanda kurung',
        confirmButtonColor: '#2563EB'
      })
      return
    }

    // ✅ Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(form.companyEmail)) {
      Swal.fire({
        icon: 'warning',
        title: 'Format Email Salah',
        text: 'Silakan masukkan email yang valid',
        confirmButtonColor: '#2563EB'
      })
      return
    }

    // ✅ Check password match
    if (form.password !== form.confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Password Tidak Cocok',
        text: 'Password dan Konfirmasi Password harus sama',
        confirmButtonColor: '#2563EB'
      })
      return
    }

    // ✅ Check password length
    if (form.password.length < 6) {
      Swal.fire({
        icon: 'warning',
        title: 'Password Terlalu Pendek',
        text: 'Password minimal 6 karakter',
        confirmButtonColor: '#2563EB'
      })
      return
    }

    // ✅ Check terms agreement
    if (!form.agreeTerms) {
      Swal.fire({
        icon: 'warning',
        title: 'Syarat dan Ketentuan',
        text: 'Anda harus menyetujui Syarat dan Ketentuan untuk melanjutkan',
        confirmButtonColor: '#2563EB'
      })
      return
    }

    setIsLoading(true)

    try {
      console.log('📤 Sending registration data:', {
        companyName: form.companyName,
        companyEmail: form.companyEmail,
        contactPerson: form.contactPerson,
        phone: form.phone,
        passwordLength: form.password.length
      })

      const response = await fetch('/api/auth/register/recruiter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyName: form.companyName.trim(),
          companyEmail: form.companyEmail.trim().toLowerCase(),
          contactPersonName: form.contactPerson.trim(),
          contactPersonPhone: form.phone.trim(),
          password: form.password
        }),
      })

      const data = await response.json()

      console.log('📥 Response:', {
        status: response.status,
        success: response.ok,
        data
      })

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Registrasi gagal')
      }

      // Success
      await Swal.fire({
        icon: 'success',
        title: 'Registrasi Berhasil!',
        html: `
          <p>Akun recruiter Anda telah dibuat.</p>
          <p class="text-sm text-gray-600 mt-2">Silakan login untuk melanjutkan.</p>
        `,
        confirmButtonColor: '#2563EB'
      })

      router.push('/login?role=recruiter&registered=true')

    } catch (error) {
      console.error('❌ Registration error:', error)

      Swal.fire({
        icon: 'error',
        title: 'Registrasi Gagal',
        html: `
          <p class="text-red-600 font-semibold">${error.message}</p>
          <p class="text-sm text-gray-600 mt-2">Silakan coba lagi atau hubungi admin jika masalah berlanjut.</p>
        `,
        confirmButtonColor: '#2563EB'
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
                className="w-full text-gray-900 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                value={form.companyName}
                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
              />
            </div>

            {/* Email Perusahaan */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Perusahaan <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                placeholder="hr@perusahaan.com"
                className="w-full text-gray-900 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                value={form.companyEmail}
                onChange={(e) => setForm({ ...form, companyEmail: e.target.value })}
              />
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
                className="w-full text-gray-900 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                value={form.contactPerson}
                onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
              />
            </div>

            {/* Nomor Telepon */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nomor Telepon <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                placeholder="+62 812 3456 7890"
                className="w-full text-gray-900 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                pattern="[0-9+\-\s()]+"
                title="Nomor telepon hanya boleh berisi angka, +, -, spasi, atau tanda kurung"
              />
              <p className="text-xs text-gray-500 mt-1">
                Contoh: +62 812 3456 7890 atau 081234567890
              </p>
            </div>
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
                className="w-full text-gray-900 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Konfirmasi Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                placeholder="Masukkan password yang sama"
                className="w-full text-gray-900 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              />
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Setelah registrasi:</p>
                <p>Anda akan diminta melengkapi detail perusahaan seperti alamat, deskripsi, industri, dan informasi lainnya.</p>
              </div>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div>
            <label className="flex items-start">
              <input
                type="checkbox"
                className="mt-1 rounded border-gray-300 text-green-600 focus:ring-green-500"
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