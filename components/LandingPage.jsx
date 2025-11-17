'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, MapPin, Briefcase, TrendingUp, Users, Building2, Award, ChevronRight, Clock, DollarSign, Star, CheckCircle, ArrowRight } from 'lucide-react'

const LandingPage = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [location, setLocation] = useState('')
  const [currentTestimonial, setCurrentTestimonial] = useState(0)

  const featuredJobs = [
    {
      id: 1,
      title: 'Senior Frontend Developer',
      company: 'Tech Innovate',
      location: 'Jakarta',
      type: 'Full Time',
      salary: 'Rp 15-20 Juta',
      logo: '🚀',
      urgent: true,
      remote: true
    },
    {
      id: 2,
      title: 'Product Manager',
      company: 'Digital Solution',
      location: 'Bandung',
      type: 'Full Time',
      salary: 'Rp 18-25 Juta',
      logo: '💼',
      urgent: false,
      remote: false
    },
    {
      id: 3,
      title: 'UI/UX Designer',
      company: 'Creative Studio',
      location: 'Surabaya',
      type: 'Remote',
      salary: 'Rp 10-15 Juta',
      logo: '🎨',
      urgent: true,
      remote: true
    },
    {
      id: 4,
      title: 'Data Analyst',
      company: 'Data Corp',
      location: 'Yogyakarta',
      type: 'Hybrid',
      salary: 'Rp 12-18 Juta',
      logo: '📊',
      urgent: false,
      remote: false
    },
    {
      id: 5,
      title: 'Backend Engineer',
      company: 'Cloud Systems',
      location: 'Jakarta',
      type: 'Full Time',
      salary: 'Rp 16-22 Juta',
      logo: '⚡',
      urgent: true,
      remote: true
    },
    {
      id: 6,
      title: 'Marketing Manager',
      company: 'Growth Co',
      location: 'Bali',
      type: 'Remote',
      salary: 'Rp 14-20 Juta',
      logo: '📈',
      urgent: false,
      remote: true
    }
  ]

  const categories = [
    { name: 'Teknologi', icon: '💻', count: 2450, gradient: 'from-blue-500 to-cyan-500' },
    { name: 'Marketing', icon: '📈', count: 1820, gradient: 'from-purple-500 to-pink-500' },
    { name: 'Desain', icon: '🎨', count: 1350, gradient: 'from-orange-500 to-red-500' },
    { name: 'Keuangan', icon: '💰', count: 980, gradient: 'from-green-500 to-emerald-500' },
    { name: 'Pendidikan', icon: '📚', count: 760, gradient: 'from-indigo-500 to-purple-500' },
    { name: 'Kesehatan', icon: '🏥', count: 890, gradient: 'from-pink-500 to-rose-500' },
    { name: 'Sales', icon: '🛒', count: 1560, gradient: 'from-yellow-500 to-orange-500' },
    { name: 'HR', icon: '👥', count: 540, gradient: 'from-teal-500 to-cyan-500' }
  ]

  const companies = [
    { name: 'Tokopedia', logo: '🛍️', jobs: 45 },
    { name: 'Gojek', logo: '🏍️', jobs: 32 },
    { name: 'Traveloka', logo: '✈️', jobs: 28 },
    { name: 'Bukalapak', logo: '🛒', jobs: 38 },
    { name: 'Shopee', logo: '🛍️', jobs: 52 },
    { name: 'Grab', logo: '🚗', jobs: 41 }
  ]

  const testimonials = [
    {
      name: 'Ahmad Rizki',
      role: 'Frontend Developer',
      company: 'Tech Innovate',
      image: '👨‍💻',
      rating: 5,
      text: 'Platform yang luar biasa! Saya mendapat pekerjaan impian dalam 2 minggu. Prosesnya sangat mudah dan cepat.'
    },
    {
      name: 'Siti Nurhaliza',
      role: 'Product Designer',
      company: 'Creative Studio',
      image: '👩‍🎨',
      rating: 5,
      text: 'Fitur pencarian yang powerful dan lowongan yang berkualitas. Highly recommended untuk para jobseeker!'
    },
    {
      name: 'Budi Santoso',
      role: 'HR Manager',
      company: 'Digital Corp',
      image: '👨‍💼',
      rating: 5,
      text: 'Sebagai recruiter, platform ini sangat membantu kami menemukan kandidat terbaik dengan cepat dan efisien.'
    }
  ]

  const features = [
    {
      icon: <Search className="w-6 h-6" />,
      title: 'Smart Search',
      description: 'Temukan pekerjaan yang tepat dengan AI-powered search engine'
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Network Profesional',
      description: 'Terhubung dengan ribuan profesional dan perusahaan terkemuka'
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: 'Verifikasi Perusahaan',
      description: 'Semua perusahaan telah terverifikasi untuk keamanan Anda'
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: 'Career Insights',
      description: 'Dapatkan analisis dan tips untuk meningkatkan karir Anda'
    }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section with Animated Background */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-20 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-block mb-4">
              <span className="bg-blue-500/30 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium border border-blue-400/30">
                🎉 Platform #1 untuk Pencari Kerja di Indonesia
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Wujudkan Karir Impian
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-cyan-200">
                Bersama Kami
              </span>
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-8">
              Hubungkan talenta terbaik dengan perusahaan terkemuka. Lebih dari{' '}
              <span className="font-bold text-white">10,000+ lowongan kerja</span> menanti Anda
            </p>

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-6 mb-12">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-300" />
                <span className="text-sm">Terpercaya</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-300" />
                <span className="text-sm">100% Gratis</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-300" />
                <span className="text-sm">Verifikasi Perusahaan</span>
              </div>
            </div>
          </div>

          {/* Enhanced Search Box */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl p-6 backdrop-blur-lg">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative group">
                    <Search className="absolute left-4 top-4 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition" />
                    <input
                      type="text"
                      placeholder="Cari posisi, skill, atau perusahaan..."
                      className="w-full pl-12 pr-4 py-4 text-gray-800 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="relative group">
                    <MapPin className="absolute left-4 top-4 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition" />
                    <input
                      type="text"
                      placeholder="Kota atau remote..."
                      className="w-full pl-12 pr-4 py-4 text-gray-800 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                </div>
                <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                  Cari Sekarang
                </button>
              </div>

              {/* Popular Searches */}
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-sm text-gray-600">Populer:</span>
                {['Frontend Developer', 'UI/UX Designer', 'Product Manager', 'Data Analyst'].map((tag, index) => (
                  <button
                    key={index}
                    className="text-sm text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-full transition"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Stats with Icons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-5xl mx-auto">
            {[
              { icon: <Briefcase className="w-6 h-6" />, number: '10K+', label: 'Lowongan Aktif' },
              { icon: <Building2 className="w-6 h-6" />, number: '5K+', label: 'Perusahaan' },
              { icon: <Users className="w-6 h-6" />, number: '100K+', label: 'Pencari Kerja' },
              { icon: <Award className="w-6 h-6" />, number: '50K+', label: 'Berhasil Hired' }
            ].map((stat, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-center border border-white/20 hover:bg-white/20 transition-all hover:scale-105">
                <div className="flex justify-center mb-3">{stat.icon}</div>
                <div className="text-3xl font-bold mb-1">{stat.number}</div>
                <div className="text-blue-100 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wide">Kenapa Pilih Kami</span>
            <h2 className="text-4xl font-bold text-gray-900 mt-2 mb-4">
              Platform Terlengkap untuk Karir Anda
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Kami menyediakan tools dan fitur terbaik untuk membantu Anda mencapai tujuan karir
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 hover:border-blue-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Job Seekers & Recruiters - Enhanced */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* For Job Seekers */}
            <div className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
              
              <div className="relative z-10">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Users className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">Untuk Pencari Kerja</h2>
                <p className="text-gray-600 mb-6 text-center leading-relaxed">
                  Temukan pekerjaan yang sesuai dengan keahlian dan passion Anda. Upload CV, lamar dengan mudah, dan raih karir impian.
                </p>
                
                <ul className="space-y-3 mb-8">
                  {['Upload CV & Portfolio', 'Apply dengan 1 klik', 'Track aplikasi real-time', 'Career coaching gratis'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-gray-700">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-4 h-4 text-blue-600" />
                      </div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/register/jobseeker" className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all font-semibold shadow-lg hover:shadow-xl group">
                  <span>Mulai Cari Kerja</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* For Recruiters */}
            <div className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
              
              <div className="relative z-10">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Building2 className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">Untuk Perusahaan</h2>
                <p className="text-gray-600 mb-6 text-center leading-relaxed">
                  Posting lowongan, temukan talenta terbaik, dan bangun tim impian Anda. Proses rekrutmen yang efisien dan efektif.
                </p>
                
                <ul className="space-y-3 mb-8">
                  {['Post unlimited jobs', 'AI-powered matching', 'Candidate screening tools', 'Dedicated support'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-gray-700">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/register/recruiter" className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all font-semibold shadow-lg hover:shadow-xl group">
                  <span>Mulai Rekrutmen</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Job Categories - Enhanced */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wide">Jelajahi Kategori</span>
            <h2 className="text-4xl font-bold text-gray-900 mt-2 mb-4">
              Kategori Pekerjaan Populer
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Jelajahi ribuan lowongan berdasarkan minat dan keahlian Anda
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {categories.map((category, index) => (
              <Link 
                key={index} 
                href={`/jobs?category=${category.name}`}
                className="group relative bg-white rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-100 hover:border-transparent overflow-hidden hover:-translate-y-2"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
                
                <div className="relative z-10">
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">{category.icon}</div>
                  <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-indigo-600 transition">
                    {category.name}
                  </h3>
                  <p className="text-gray-500 text-sm mb-3">{category.count} lowongan</p>
                  <div className="flex items-center text-blue-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Lihat Semua</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Jobs - Enhanced */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wide">Lowongan Terbaru</span>
            <h2 className="text-4xl font-bold text-gray-900 mt-2 mb-4">
              Peluang Karir Terbaik Hari Ini
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Dapatkan akses ke lowongan eksklusif dari perusahaan ternama
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto mb-12">
            {featuredJobs.map((job) => (
              <div
                key={job.id}
                className="group bg-white rounded-2xl p-6 border border-gray-100 hover:border-blue-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                      {job.logo}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition">
                        {job.title}
                      </h3>
                      <p className="text-gray-600 text-sm">{job.company}</p>
                    </div>
                  </div>
                  {job.urgent && (
                    <span className="bg-red-100 text-red-600 px-2 py-1 rounded-lg text-xs font-semibold animate-pulse">
                      Urgent
                    </span>
                  )}
                </div>

                {/* Job Details */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>{job.location}</span>
                    {job.remote && (
                      <span className="ml-auto bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-medium">
                        Remote
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>{job.type}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-green-600">
                    <DollarSign className="w-4 h-4" />
                    <span>{job.salary}</span>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="text-xs text-gray-500">2 hari lalu</span>
                  <Link
                    href={`/job/${job.id}`}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-semibold text-sm group"
                  >
                    <span>Detail</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-10 py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold shadow-lg hover:shadow-xl group"
            >
              <span>Lihat Semua Lowongan</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials - New Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wide">Testimonial</span>
            <h2 className="text-4xl font-bold text-gray-900 mt-2 mb-4">
              Apa Kata Mereka?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Ribuan orang telah sukses mendapatkan pekerjaan impian mereka
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
              <div className="flex items-center justify-center mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              
              <p className="text-xl text-gray-700 text-center mb-8 leading-relaxed italic">
                "{testimonials[currentTestimonial].text}"
              </p>
              
              <div className="flex flex-col items-center">
                <div className="text-6xl mb-4">{testimonials[currentTestimonial].image}</div>
                <h4 className="font-bold text-gray-900 text-lg">
                  {testimonials[currentTestimonial].name}
                </h4>
                <p className="text-gray-600">
                  {testimonials[currentTestimonial].role} at {testimonials[currentTestimonial].company}
                </p>
              </div>

              {/* Dots Indicator */}
              <div className="flex justify-center gap-2 mt-8">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentTestimonial ? 'bg-blue-600 w-8' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partner Companies - Enhanced */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wide">Partner Kami</span>
            <h2 className="text-4xl font-bold text-gray-900 mt-2 mb-4">
              Dipercaya oleh Perusahaan Terkemuka
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Bergabunglah dengan ribuan perusahaan yang telah mempercayai platform kami
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 max-w-6xl mx-auto">
            {companies.map((company, index) => (
              <div key={index} className="group flex flex-col items-center">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl shadow-md group-hover:shadow-xl flex items-center justify-center text-4xl mb-3 group-hover:scale-110 transition-all">
                  {company.logo}
                </div>
                <span className="text-sm font-semibold text-gray-700 text-center">{company.name}</span>
                <span className="text-xs text-gray-500">{company.jobs} jobs</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section - New */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Dapatkan Update Lowongan Terbaru
            </h2>
            <p className="text-blue-100 mb-8 text-lg">
              Subscribe newsletter kami dan dapatkan notifikasi lowongan yang sesuai dengan profil Anda
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
              <input
                type="email"
                placeholder="Masukkan email Anda..."
                className="flex-1 px-6 py-4 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-300 text-gray-800"
              />
              <button className="bg-white text-blue-600 px-8 py-4 rounded-xl hover:bg-gray-100 transition-colors font-semibold shadow-lg hover:shadow-xl whitespace-nowrap">
                Subscribe Sekarang
              </button>
            </div>
            
            <p className="text-blue-200 text-sm mt-4">
              🔒 Email Anda aman bersama kami. Tidak ada spam.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section - Enhanced */}
      <section className="py-20 bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Siap Memulai Perjalanan Karir Baru?
          </h2>
          <p className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed">
            Bergabunglah dengan{' '}
            <span className="font-bold text-white">100,000+</span> profesional yang telah menemukan pekerjaan impian mereka di platform kami
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            <Link
              href="/register/jobseeker"
              className="group inline-flex items-center justify-center gap-2 bg-white text-blue-600 px-10 py-5 rounded-xl hover:bg-gray-100 transition-all font-bold text-lg shadow-2xl hover:shadow-blue-500/50 hover:scale-105"
            >
              <Users className="w-6 h-6" />
              <span>Saya Pencari Kerja</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/register/recruiter"
              className="group inline-flex items-center justify-center gap-2 bg-transparent text-white border-2 border-white px-10 py-5 rounded-xl hover:bg-white hover:text-blue-600 transition-all font-bold text-lg hover:scale-105"
            >
              <Building2 className="w-6 h-6" />
              <span>Saya Perusahaan</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-8 text-blue-100">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>100% Gratis untuk Jobseeker</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>Verifikasi Perusahaan</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>Support 24/7</span>
            </div>
          </div>
        </div>
      </section>

      {/* Add custom animations */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animate-fade-in {
          animation: fadeIn 1s ease-in;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}

export default LandingPage