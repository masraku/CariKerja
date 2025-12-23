'use client'
import Link from 'next/link'
import { Users, Building2, ArrowRight, CheckCircle, ArrowLeft } from 'lucide-react'

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
      title: 'Perusahaan',
      icon: Building2,
      color: 'purple',
      gradient: 'from-purple-600 to-pink-600',
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
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-600 to-indigo-900" />
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute top-0 left-0 -ml-20 -mt-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <Link href="/" className="inline-flex items-center gap-2 text-blue-100 hover:text-white mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </Link>
          
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Bergabung dengan JobSeeker
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Pilih peran Anda untuk memulai perjalanan karir atau menemukan talenta terbaik
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {roles.map((role) => {
            const Icon = role.icon
            return (
              <div
                key={role.type}
                className="bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group hover:-translate-y-2 border border-gray-100"
              >
                {/* Card Header */}
                <div className={`bg-gradient-to-r ${role.gradient} p-8 text-white relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-500"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12 transition-transform group-hover:scale-110 duration-500"></div>
                  
                  <div className="relative z-10">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 shadow-lg border border-white/20">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold mb-2">{role.title}</h2>
                    <p className="text-white/90 text-lg">{role.description}</p>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Keuntungan:</h3>
                  <ul className="space-y-4 mb-8">
                    {role.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className={`mt-1 p-1 rounded-full bg-${role.color}-100`}>
                          <CheckCircle className={`w-4 h-4 text-${role.color}-600`} />
                        </div>
                        <span className="text-gray-600 font-medium">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={role.link}
                    className={`w-full flex items-center justify-center gap-2 bg-gradient-to-r ${role.gradient} text-white py-4 rounded-xl hover:shadow-lg hover:shadow-${role.color}-500/30 transition-all duration-300 font-semibold text-lg group`}
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
        <div className="text-center mt-16">
          <div className="inline-block bg-white px-8 py-4 rounded-2xl shadow-lg border border-gray-100">
            <p className="text-gray-600">
              Sudah punya akun?{' '}
              <Link href="/login" className="text-blue-600 hover:text-blue-700 font-bold hover:underline ml-1">
                Masuk di sini
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}