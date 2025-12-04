'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Shield, Target, Eye, Users, Briefcase, TrendingUp, Award, CheckCircle, Heart, Globe, Zap, Building2, UserCheck, FileCheck, Star, ArrowRight, ChevronRight, Mail, Phone, MapPin } from 'lucide-react'

const AboutPage = () => {
  const [activeYear, setActiveYear] = useState(2024)

  const stats = [
    { icon: Users, value: '100K+', label: 'Pencari Kerja Aktif', color: 'from-blue-500 to-cyan-500' },
    { icon: Building2, value: '5K+', label: 'Perusahaan Terdaftar', color: 'from-green-500 to-emerald-500' },
    { icon: Briefcase, value: '50K+', label: 'Lowongan Tersedia', color: 'from-purple-500 to-pink-500' },
    { icon: UserCheck, value: '75K+', label: 'Berhasil Diterima', color: 'from-orange-500 to-red-500' }
  ]

  const features = [
    {
      icon: Shield,
      title: 'Platform Resmi Pemerintah',
      description: 'Dikelola langsung oleh Disnaker dan Kominfo untuk menjamin keamanan dan kredibilitas',
      color: 'blue'
    },
    {
      icon: FileCheck,
      title: 'Verifikasi Perusahaan',
      description: 'Semua perusahaan diverifikasi legalitasnya untuk melindungi pencari kerja',
      color: 'green'
    },
    {
      icon: Globe,
      title: 'Akses Gratis',
      description: '100% gratis untuk pencari kerja tanpa biaya tersembunyi',
      color: 'purple'
    },
    {
      icon: Zap,
      title: 'Proses Cepat',
      description: 'Sistem matching otomatis untuk menemukan kandidat atau lowongan yang tepat',
      color: 'orange'
    },
    {
      icon: Award,
      title: 'Standar Profesional',
      description: 'Menjunjung tinggi standar profesionalitas dalam setiap proses',
      color: 'pink'
    },
    {
      icon: Heart,
      title: 'Dukungan 24/7',
      description: 'Tim support siap membantu Anda kapan saja',
      color: 'indigo'
    }
  ]

  const timeline = [
    {
      year: 2021,
      title: 'Inisiasi Program',
      description: 'Kolaborasi Disnaker dan Kominfo untuk membangun ekosistem digital ketenagakerjaan',
      achievements: [
        'Studi kelayakan platform',
        'Pembentukan tim development',
        'Riset kebutuhan pasar kerja'
      ]
    },
    {
      year: 2022,
      title: 'Pengembangan Platform',
      description: 'Fase development dan testing dengan melibatkan berbagai stakeholder',
      achievements: [
        'Development sistem matching',
        'Testing dengan 100 perusahaan pilot',
        '1,000 pengguna awal',
        'Peluncuran versi beta'
      ]
    },
    {
      year: 2023,
      title: 'Peluncuran Resmi',
      description: 'Platform diluncurkan secara resmi ke seluruh Indonesia',
      achievements: [
        '10,000+ pengguna dalam 3 bulan pertama',
        '500+ perusahaan terverifikasi',
        'Ekspansi ke 20 kota besar',
        '5,000+ lowongan berhasil terisi'
      ]
    },
    {
      year: 2024,
      title: 'Ekspansi & Inovasi',
      description: 'Pengembangan fitur AI dan ekspansi nasional',
      achievements: [
        '100,000+ pengguna aktif',
        'AI-powered job matching',
        'Integrasi dengan 34 provinsi',
        'Partnership dengan 50+ universitas'
      ]
    }
  ]

  const team = [
    {
      name: 'Dinas Ketenagakerjaan',
      role: 'Regulator & Policy Maker',
      logo: '🏛️',
      description: 'Mengawasi kebijakan ketenagakerjaan dan standar operasional platform',
      responsibilities: [
        'Verifikasi dan validasi perusahaan',
        'Penegakan aturan ketenagakerjaan',
        'Monitoring & evaluasi platform',
        'Penanganan pengaduan & sengketa'
      ]
    },
    {
      name: 'Kementerian Komunikasi dan Informatika',
      role: 'Technology & Infrastructure',
      logo: '💻',
      description: 'Mengelola infrastruktur teknologi dan keamanan data platform',
      responsibilities: [
        'Pengembangan sistem & teknologi',
        'Keamanan data dan privasi',
        'Integrasi sistem nasional',
        'Inovasi digital dan AI'
      ]
    }
  ]

  const testimonials = [
    {
      name: 'Rina Kusuma',
      role: 'Frontend Developer',
      company: 'Tech Startup Jakarta',
      image: '👩‍💻',
      text: 'Platform ini sangat membantu saya menemukan pekerjaan impian. Proses verifikasi perusahaan membuat saya merasa aman dan tenang dalam melamar.',
      rating: 5
    },
    {
      name: 'Ahmad Fauzi',
      role: 'HR Manager',
      company: 'Manufacturing Company',
      image: '👨‍💼',
      text: 'Sistem matching yang akurat membantu kami menemukan kandidat berkualitas dengan cepat. Dukungan dari pemerintah membuat platform ini terpercaya.',
      rating: 5
    },
    {
      name: 'Siti Nurhaliza',
      role: 'Fresh Graduate',
      company: 'Marketing Agency',
      image: '👩‍🎓',
      text: 'Sebagai fresh graduate, platform ini sangat membantu. Banyak perusahaan legitimate dan prosesnya transparan. Recommended!',
      rating: 5
    }
  ]

  const partners = [
    { name: 'Tokopedia', logo: '🛍️' },
    { name: 'Gojek', logo: '🏍️' },
    { name: 'Bukalapak', logo: '🛒' },
    { name: 'Traveloka', logo: '✈️' },
    { name: 'Shopee', logo: '🛍️' },
    { name: 'Grab', logo: '🚗' },
    { name: 'Telkom', logo: '📱' },
    { name: 'Bank BRI', logo: '🏦' }
  ]

  const colorSchemes = {
    blue: 'from-blue-500 to-cyan-500',
    green: 'from-green-500 to-emerald-500',
    purple: 'from-purple-500 to-pink-500',
    orange: 'from-orange-500 to-red-500',
    pink: 'from-pink-500 to-rose-500',
    indigo: 'from-indigo-500 to-purple-500'
  }

  return (
    <div className="relative min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 text-white overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Government Badge */}
            <div className="inline-flex items-center gap-4 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full mb-8 border border-white/20">
              <span className="text-2xl">🇮🇩</span>
              <div className="text-left">
                <p className="text-sm text-blue-200">Platform Resmi Pemerintah</p>
                <p className="font-bold">Disnaker & Kominfo RI</p>
              </div>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Membangun Masa Depan
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-cyan-200">
                Ketenagakerjaan Indonesia
              </span>
            </h1>
            
            <p className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed">
              Platform digital terpercaya yang menghubungkan talenta terbaik Indonesia dengan perusahaan-perusahaan berkualitas, 
              didukung penuh oleh Pemerintah Republik Indonesia.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => {
                const Icon = stat.icon
                return (
                  <div key={index} className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition">
                    <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-3xl font-bold mb-2">{stat.value}</div>
                    <div className="text-sm text-blue-200">{stat.label}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Vision & Mission */}
      <div className="relative w-full">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
            {/* Vision */}
            <div className="bg-white rounded-3xl shadow-2xl p-8 hover:shadow-3xl transition-all duration-300 border-t-4 border-blue-600">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6">
                <Eye className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Visi Kami</h2>
              <p className="text-gray-700 text-lg leading-relaxed">
                Menjadi platform ketenagakerjaan digital nomor satu di Indonesia yang terpercaya, 
                transparan, dan inklusif, memfasilitasi terciptanya ekosistem kerja yang sehat dan berkelanjutan 
                untuk seluruh rakyat Indonesia.
              </p>
            </div>

            {/* Mission */}
            <div className="bg-white rounded-3xl shadow-2xl p-8 hover:shadow-3xl transition-all duration-300 border-t-4 border-green-600">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-6">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Misi Kami</h2>
              <ul className="space-y-3">
                {[
                  'Menyediakan akses kerja yang mudah dan merata',
                  'Memastikan keamanan dan transparansi',
                  'Meningkatkan kualitas SDM Indonesia',
                  'Mendorong pertumbuhan ekonomi digital',
                  'Membangun ekosistem kerja yang sehat'
                ].map((mission, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                    <span className="text-gray-700">{mission}</span>
                  </li>
                ))}
              </ul>
            </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gradient-to-br from-gray-100 to-blue-50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wide">Keunggulan Platform</span>
            <h2 className="text-4xl font-bold text-gray-900 mt-2 mb-4">
              Mengapa Memilih Platform Kami?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Platform dengan standar pemerintah untuk keamanan dan kredibilitas maksimal
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 group hover:-translate-y-2"
                >
                  <div className={`w-16 h-16 bg-gradient-to-br ${colorSchemes[feature.color]} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Timeline Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <span className="text-purple-600 font-semibold text-sm uppercase tracking-wide">Perjalanan Kami</span>
          <h2 className="text-4xl font-bold text-gray-900 mt-2 mb-4">
            Milestone & Pencapaian
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Dari ide hingga menjadi platform ketenagakerjaan terbesar di Indonesia
          </p>
        </div>

        {/* Year Selector */}
        <div className="flex justify-center gap-4 mb-12 flex-wrap">
          {timeline.map((item) => (
            <button
              key={item.year}
              onClick={() => setActiveYear(item.year)}
              className={`px-8 py-4 rounded-xl font-bold text-lg transition-all ${
                activeYear === item.year
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-xl scale-105'
                  : 'bg-white text-gray-600 hover:bg-gray-50 shadow-md'
              }`}
            >
              {item.year}
            </button>
          ))}
        </div>

        {/* Timeline Content */}
        <div className="max-w-4xl mx-auto">
          {timeline.map((item) => (
            <div
              key={item.year}
              className={`transition-all duration-500 ${
                activeYear === item.year ? 'block' : 'hidden'
              }`}
            >
              <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
                <div className="flex items-start gap-6 mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                    {item.year}
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-600 text-lg">{item.description}</p>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h4 className="font-bold text-gray-900 mb-4 text-xl">Pencapaian:</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    {item.achievements.map((achievement, index) => (
                      <div key={index} className="flex items-start gap-3 bg-purple-50 p-4 rounded-xl">
                        <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{achievement}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Team Section */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-indigo-600 font-semibold text-sm uppercase tracking-wide">Tim Kami</span>
            <h2 className="text-4xl font-bold text-gray-900 mt-2 mb-4">
              Dikelola oleh Institusi Pemerintah Terpercaya
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Kolaborasi dua kementerian untuk memberikan pelayanan terbaik
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {team.map((member, index) => (
              <div key={index} className="bg-white rounded-3xl shadow-2xl p-8 hover:shadow-3xl transition-all duration-300">
                <div className="text-center mb-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-5xl mx-auto mb-4">
                    {member.logo}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{member.name}</h3>
                  <p className="text-indigo-600 font-semibold">{member.role}</p>
                </div>

                <p className="text-gray-600 text-center mb-6 leading-relaxed">{member.description}</p>

                <div className="border-t border-gray-200 pt-6">
                  <h4 className="font-bold text-gray-900 mb-4">Tanggung Jawab:</h4>
                  <ul className="space-y-3">
                    {member.responsibilities.map((resp, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <ChevronRight className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <span className="text-green-600 font-semibold text-sm uppercase tracking-wide">Testimoni</span>
          <h2 className="text-4xl font-bold text-gray-900 mt-2 mb-4">
            Apa Kata Mereka?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Kisah sukses dari pengguna platform kami
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8">
              <div className="flex items-center gap-2 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                ))}
              </div>

              <p className="text-gray-700 leading-relaxed mb-6 italic">
                "{testimonial.text}"
              </p>

              <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-2xl">
                  {testimonial.image}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                  <p className="text-sm text-gray-500">{testimonial.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Partners */}
      <div className="bg-gradient-to-br from-gray-100 to-indigo-50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wide">Partner Kami</span>
            <h2 className="text-4xl font-bold text-gray-900 mt-2 mb-4">
              Dipercaya oleh Perusahaan Terkemuka
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Lebih dari 5,000+ perusahaan telah bergabung dengan platform kami
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-8 max-w-6xl mx-auto">
            {partners.map((partner, index) => (
              <div key={index} className="flex flex-col items-center group">
                <div className="w-20 h-20 bg-white rounded-2xl shadow-md group-hover:shadow-xl flex items-center justify-center text-4xl mb-3 group-hover:scale-110 transition-all">
                  {partner.logo}
                </div>
                <span className="text-sm text-gray-600 text-center font-medium">{partner.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-700 to-purple-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Siap Memulai Perjalanan Karir Anda?
          </h2>
          <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto">
            Bergabunglah dengan ribuan profesional yang telah menemukan pekerjaan impian mereka
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              href="/register/jobseeker"
              className="inline-flex items-center justify-center gap-2 bg-white text-indigo-600 px-10 py-5 rounded-xl hover:bg-gray-100 transition-all font-bold text-lg shadow-2xl hover:shadow-indigo-500/50 group"
            >
              <Users className="w-6 h-6" />
              <span>Daftar Sebagai Jobseeker</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/register/recruiter"
              className="inline-flex items-center justify-center gap-2 bg-transparent text-white border-2 border-white px-10 py-5 rounded-xl hover:bg-white hover:text-indigo-600 transition-all font-bold text-lg group"
            >
              <Building2 className="w-6 h-6" />
              <span>Daftar Sebagai Recruiter</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="grid md:grid-cols-2">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-12 text-white">
              <h3 className="text-3xl font-bold mb-6">Hubungi Kami</h3>
              <p className="text-indigo-100 mb-8 leading-relaxed">
                Punya pertanyaan atau butuh bantuan? Tim kami siap membantu Anda.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Email</h4>
                    <p className="text-indigo-100">support@jobseeker.id</p>
                    <p className="text-indigo-100">info@jobseeker.id</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Telepon</h4>
                    <p className="text-indigo-100">+62 21 1234 5678</p>
                    <p className="text-indigo-100 text-sm">Senin - Jumat: 08.00 - 17.00 WIB</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Alamat</h4>
                    <p className="text-indigo-100">
                      Gedung Kementerian Kominfo
                      <br />
                      Jl. Medan Merdeka Barat No. 9
                      <br />
                      Jakarta Pusat 10110
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-12 bg-gray-50">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Kirim Pesan</h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nama</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Nama Anda"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Pesan</label>
                  <textarea
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Tulis pesan Anda..."
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition font-semibold shadow-lg hover:shadow-xl"
                >
                  Kirim Pesan
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AboutPage