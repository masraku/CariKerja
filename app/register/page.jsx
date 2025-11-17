'use client'
import Link from 'next/link'
import { Users, Building2, ArrowRight, CheckCircle } from 'lucide-react'

export default function RegisterRolePage() {
  const roles = [
    {
      type: 'jobseeker',
      title: 'Pencari Kerja',
      icon: Users,
      color: 'blue',
      gradient: 'from-blue-600 to-indigo-600',
      description: 'Temukan pekerjaan impian Anda',
      features: [
        'Akses ke ribuan lowongan kerja',
        'Profile builder professional',
        'Notifikasi lowongan sesuai keahlian',
        'Chat langsung dengan recruiter'
      ],
      link: '/register/jobseeker'
    },
    {
      type: 'recruiter',
      title: 'Perusahaan / Recruiter',
      icon: Building2,
      color: 'green',
      gradient: 'from-green-600 to-emerald-600',
      description: 'Rekrut kandidat terbaik',
      features: [
        'Posting lowongan unlimited',
        'Akses database kandidat',
        'Sistem tracking aplikasi',
        'Verifikasi perusahaan gratis'
      ],
      link: '/register/recruiter'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-6 shadow-xl">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Bergabung dengan Platform Kami
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Pilih jenis akun yang sesuai dengan kebutuhan Anda
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {roles.map((role) => {
            const Icon = role.icon
            return (
              <div
                key={role.type}
                className="bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group hover:-translate-y-2"
              >
                {/* Card Header */}
                <div className={`bg-gradient-to-r ${role.gradient} p-8 text-white relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
                  
                  <div className="relative z-10">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold mb-2">{role.title}</h2>
                    <p className="text-white/90 text-lg">{role.description}</p>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Keuntungan:</h3>
                  <ul className="space-y-3 mb-8">
                    {role.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={role.link}
                    className={`w-full flex items-center justify-center gap-2 bg-gradient-to-r ${role.gradient} text-white py-4 rounded-xl hover:shadow-lg transition-all duration-300 font-semibold text-lg group`}
                  >
                    Daftar Sebagai {role.title}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>

        {/* Already Have Account */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            Sudah punya akun?{' '}
            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline">
              Masuk di sini
            </Link>
          </p>
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 inline-flex items-center gap-1">
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