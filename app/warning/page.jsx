'use client'
import { useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, CheckCircle, XCircle, Shield, FileText, Users, Briefcase, AlertCircle, ChevronDown, ChevronUp, Info, Ban, Award, Eye, ExternalLink } from 'lucide-react'

const WarningPage = () => {
  const [activeTab, setActiveTab] = useState('jobseeker')
  const [expandedFaq, setExpandedFaq] = useState(null)

  const jobseekerRules = {
    requirements: [
      {
        title: 'Profil Lengkap & Valid',
        description: 'Pastikan semua informasi pribadi yang Anda berikan adalah benar dan dapat diverifikasi',
        items: [
          'Nama lengkap sesuai KTP',
          'Nomor telepon aktif yang dapat dihubungi',
          'Email aktif untuk komunikasi',
          'Alamat domisili yang jelas'
        ]
      },
      {
        title: 'CV/Resume Profesional',
        description: 'CV yang Anda upload harus memenuhi standar profesional',
        items: [
          'Format PDF dengan ukuran maksimal 5MB',
          'Informasi pengalaman kerja yang detail dan jelas',
          'Pendidikan formal yang relevan',
          'Skill yang sesuai dengan posisi yang dilamar',
          'Tidak boleh ada informasi palsu atau dilebih-lebihkan'
        ]
      },
      {
        title: 'Dokumen Pendukung',
        description: 'Siapkan dokumen pendukung yang mungkin diperlukan',
        items: [
          'Ijazah terakhir (scan)',
          'Transkrip nilai',
          'Sertifikat pelatihan/keahlian (jika ada)',
          'Portofolio untuk posisi kreatif',
          'Surat referensi dari perusahaan sebelumnya'
        ]
      }
    ],
    prohibited: [
      {
        icon: Ban,
        title: 'Informasi Palsu',
        description: 'Memberikan data diri, pengalaman kerja, atau pendidikan yang tidak sesuai fakta'
      },
      {
        icon: Ban,
        title: 'Melamar Sembarangan',
        description: 'Melamar ke posisi yang tidak sesuai dengan kualifikasi atau minat Anda'
      },
      {
        icon: Ban,
        title: 'Spam Aplikasi',
        description: 'Mengirim lamaran berulang kali untuk posisi yang sama dalam waktu singkat'
      },
      {
        icon: Ban,
        title: 'Tidak Profesional',
        description: 'Menggunakan email atau foto profil yang tidak profesional'
      },
      {
        icon: Ban,
        title: 'Plagiarisme CV',
        description: 'Menyalin CV orang lain atau menggunakan template yang sama persis'
      },
      {
        icon: Ban,
        title: 'Ghosting Interview',
        description: 'Tidak hadir pada jadwal interview tanpa pemberitahuan sebelumnya'
      }
    ],
    tips: [
      'Baca deskripsi lowongan dengan teliti sebelum melamar',
      'Sesuaikan CV dan cover letter dengan posisi yang dilamar',
      'Jawab pertanyaan screening dengan jujur dan lengkap',
      'Siapkan diri dengan baik sebelum interview',
      'Follow up secara profesional setelah melamar',
      'Update profil Anda secara berkala',
      'Jaga komunikasi yang baik dengan recruiter',
      'Berikan notifikasi jika berubah pikiran atau sudah diterima di tempat lain'
    ]
  }

  const recruiterRules = {
    requirements: [
      {
        title: 'Profil Perusahaan Lengkap',
        description: 'Informasi perusahaan harus jelas dan dapat diverifikasi',
        items: [
          'Nama perusahaan resmi sesuai akta pendirian',
          'Alamat kantor yang jelas dan valid',
          'Nomor telepon kantor yang dapat dihubungi',
          'Email perusahaan dengan domain resmi',
          'Website perusahaan (jika ada)',
          'Bidang usaha/industri yang jelas'
        ]
      },
      {
        title: 'Deskripsi Lowongan yang Jelas',
        description: 'Setiap lowongan harus memiliki informasi yang lengkap dan transparan',
        items: [
          'Judul posisi yang spesifik dan jelas',
          'Job description yang detail',
          'Kualifikasi dan requirements yang realistis',
          'Rentang gaji yang jujur (tidak perlu exact, bisa range)',
          'Benefit dan fasilitas yang ditawarkan',
          'Lokasi kerja yang spesifik',
          'Tipe pekerjaan (Full-time, Part-time, Contract, dll)',
          'Proses seleksi dan timeline rekrutmen'
        ]
      },
      {
        title: 'Dokumen Legalitas',
        description: 'Perusahaan harus dapat menunjukkan legalitas usaha',
        items: [
          'NPWP Perusahaan',
          'Akta Pendirian Perusahaan',
          'SIUP/NIB (Nomor Induk Berusaha)',
          'Domisili Usaha',
          'Surat Keterangan Terdaftar (jika perusahaan besar)'
        ]
      }
    ],
    prohibited: [
      {
        icon: Ban,
        title: 'Lowongan Palsu',
        description: 'Membuat lowongan kerja yang tidak benar-benar ada atau fiktif'
      },
      {
        icon: Ban,
        title: 'Informasi Menyesatkan',
        description: 'Memberikan informasi gaji, benefit, atau kondisi kerja yang tidak sesuai kenyataan'
      },
      {
        icon: Ban,
        title: 'Diskriminasi',
        description: 'Melakukan diskriminasi berdasarkan ras, agama, gender, atau latar belakang'
      },
      {
        icon: Ban,
        title: 'Meminta Uang',
        description: 'Meminta biaya pendaftaran, training, atau deposit dalam bentuk apapun'
      },
      {
        icon: Ban,
        title: 'Penyalahgunaan Data',
        description: 'Menggunakan data kandidat untuk tujuan di luar proses rekrutmen'
      },
      {
        icon: Ban,
        title: 'MLM/Skema Piramida',
        description: 'Menawarkan skema bisnis MLM atau investasi yang berkedok lowongan kerja'
      },
      {
        icon: Ban,
        title: 'Ghosting Kandidat',
        description: 'Tidak memberikan feedback atau update status lamaran kepada kandidat'
      },
      {
        icon: Ban,
        title: 'Perusahaan Bodong',
        description: 'Menggunakan nama perusahaan fiktif atau tidak terdaftar secara resmi'
      }
    ],
    tips: [
      'Tulis deskripsi pekerjaan yang jelas dan menarik',
      'Berikan informasi gaji yang transparan',
      'Respon lamaran kandidat dalam waktu yang wajar (max 2 minggu)',
      'Lakukan interview sesuai jadwal yang telah ditentukan',
      'Berikan feedback kepada kandidat yang tidak lolos',
      'Jaga kerahasiaan data pribadi kandidat',
      'Update status lowongan secara berkala',
      'Bersikap profesional dalam setiap komunikasi',
      'Jelaskan proses seleksi dengan detail di awal'
    ]
  }

  const consequences = {
    jobseeker: [
      'Akun dapat di-suspend sementara atau permanen',
      'Lamaran akan otomatis ditolak oleh sistem',
      'Blacklist dari perusahaan-perusahaan tertentu',
      'Kehilangan akses ke fitur premium (jika ada)',
      'Laporan ke pihak berwenang jika terbukti melakukan penipuan'
    ],
    recruiter: [
      'Lowongan akan dihapus dari platform',
      'Akun perusahaan di-suspend atau banned permanen',
      'Tidak dapat posting lowongan baru',
      'Blacklist dari database perusahaan terverifikasi',
      'Laporan ke Disnaker dan pihak berwenang terkait',
      'Tuntutan hukum jika terbukti melakukan penipuan atau penyalahgunaan data'
    ]
  }

  const faqs = [
    {
      question: 'Apakah ada biaya untuk menggunakan platform ini?',
      answer: 'Tidak ada biaya apapun untuk jobseeker. Platform ini 100% gratis untuk pencari kerja. Untuk recruiter, kami menyediakan paket gratis dengan fitur terbatas dan paket berbayar dengan fitur premium.'
    },
    {
      question: 'Bagaimana cara melaporkan lowongan atau perusahaan yang mencurigakan?',
      answer: 'Anda dapat melaporkan melalui tombol "Laporkan" yang ada di setiap halaman lowongan, atau hubungi tim support kami melalui email support@jobseeker.id dengan menyertakan bukti dan detail lengkap.'
    },
    {
      question: 'Berapa lama proses verifikasi perusahaan?',
      answer: 'Proses verifikasi perusahaan biasanya memakan waktu 2-5 hari kerja. Kami akan melakukan pengecekan legalitas dokumen dan validasi informasi perusahaan.'
    },
    {
      question: 'Apakah data pribadi saya aman?',
      answer: 'Ya, kami sangat menjaga kerahasiaan data Anda. Data hanya dapat diakses oleh recruiter yang Anda lamar, dan kami tidak akan membagikan data Anda kepada pihak ketiga tanpa izin.'
    },
    {
      question: 'Apa yang harus dilakukan jika diminta transfer uang oleh recruiter?',
      answer: 'JANGAN TRANSFER! Ini adalah red flag penipuan. Segera laporkan kepada kami dan jangan lanjutkan proses apapun dengan recruiter tersebut. Perusahaan legitimate tidak akan meminta uang dalam proses rekrutmen.'
    },
    {
      question: 'Bolehkah melamar ke banyak posisi sekaligus?',
      answer: 'Ya, Anda boleh melamar ke berbagai posisi, namun pastikan Anda benar-benar memenuhi kualifikasi dan serius dengan setiap lamaran. Quality over quantity.'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 pt-20"> {/* Fixed header padding */}
      <div className="container mx-auto px-4 pb-12">
        {/* New Integrated Alert Banner */}
        <div className="mt-6 mb-8 bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl shadow-sm flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5 animate-pulse" />
          <div>
             <h3 className="font-bold text-amber-800">PENTING!</h3>
             <p className="text-amber-700 text-sm mt-1">
               Mohon baca halaman ini dengan teliti sebelum menggunakan platform. 
               Pelanggaran terhadap syarat dan ketentuan dapat berakibat pada sanksi tegas.
             </p>
          </div>
        </div>

        {/* Hero Section - Card Style matching LandingPage */}
        <div className="relative rounded-3xl overflow-hidden bg-blue-600 shadow-xl mb-12">
           <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-900 opacity-90" />
           <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
           
           {/* Decorative elements */}
           <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
           <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl"></div>

           <div className="relative z-10 p-8 md:p-12 lg:p-16 text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl mb-8 border border-white/20 shadow-lg shadow-blue-900/20">
                <Shield className="w-10 h-10 text-white" />
              </div>
              
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
                Syarat & Ketentuan <span className="text-blue-200">Platform</span>
              </h1>
              
              <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed mb-12">
                Panduan lengkap untuk menjaga ekosistem karir yang aman, profesional, dan terpercaya bagi semua pengguna.
              </p>

              <div className="grid md:grid-cols-3 gap-6 text-left">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:bg-white/15 transition-colors">
                  <div className="w-10 h-10 bg-blue-500/30 rounded-xl flex items-center justify-center mb-4">
                     <Eye className="w-5 h-5 text-blue-200" />
                  </div>
                  <h3 className="font-bold text-white text-lg mb-2">Transparansi</h3>
                  <p className="text-sm text-blue-100">Informasi jujur dan akurat dari semua pihak</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:bg-white/15 transition-colors">
                  <div className="w-10 h-10 bg-indigo-500/30 rounded-xl flex items-center justify-center mb-4">
                     <Shield className="w-5 h-5 text-indigo-200" />
                  </div>
                  <h3 className="font-bold text-white text-lg mb-2">Keamanan</h3>
                  <p className="text-sm text-blue-100">Data dan privasi terlindungi dengan baik</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:bg-white/15 transition-colors">
                  <div className="w-10 h-10 bg-purple-500/30 rounded-xl flex items-center justify-center mb-4">
                     <Award className="w-5 h-5 text-purple-200" />
                  </div>
                  <h3 className="font-bold text-white text-lg mb-2">Profesionalisme</h3>
                  <p className="text-sm text-blue-100">Komunikasi dan proses yang profesional</p>
                </div>
              </div>
           </div>
        </div>
        {/* Tab Navigation - Redesigned */}
        <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 mb-8 max-w-2xl mx-auto">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('jobseeker')}
              className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-bold text-sm md:text-base transition-all duration-300 ${
                activeTab === 'jobseeker'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Users className="w-5 h-5" />
              <span>Untuk Jobseeker</span>
            </button>
            <button
              onClick={() => setActiveTab('recruiter')}
              className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-bold text-sm md:text-base transition-all duration-300 ${
                activeTab === 'recruiter'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Briefcase className="w-5 h-5" />
              <span>Untuk Recruiter</span>
            </button>
          </div>
        </div>

        {/* Jobseeker Content */}
        {activeTab === 'jobseeker' && (
          <div className="space-y-8">
            {/* Requirements Section */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Syarat yang Harus Dipenuhi</h2>
              </div>

              <div className="space-y-6">
                {jobseekerRules.requirements.map((req, index) => (
                  <div key={index} className="border-l-4 border-blue-600 bg-blue-50 rounded-r-xl p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{req.title}</h3>
                    <p className="text-gray-700 mb-4">{req.description}</p>
                    <ul className="space-y-2">
                      {req.items.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Prohibited Section */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Yang TIDAK BOLEH Dilakukan</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {jobseekerRules.prohibited.map((item, index) => {
                  const Icon = item.icon
                  return (
                    <div key={index} className="bg-red-50 border-2 border-red-200 rounded-xl p-6 hover:shadow-lg transition">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                          <p className="text-gray-700 text-sm">{item.description}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Tips Section */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg p-8 border-2 border-green-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                  <Info className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Tips Sukses Melamar Kerja</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {jobseekerRules.tips.map((tip, index) => (
                  <div key={index} className="flex items-start gap-3 bg-white rounded-xl p-4 shadow-sm">
                    <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <p className="text-gray-700">{tip}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Kartu AK-1 Section */}
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl shadow-lg p-8 border-2 border-indigo-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Cara Mendapatkan Kartu AK-1</h2>
              </div>

              <div className="bg-white rounded-xl p-6 mb-6">
                <h3 className="font-bold text-gray-900 mb-3 text-lg">Apa itu Kartu AK-1?</h3>
                <p className="text-gray-700 mb-4">
                  Kartu Kuning atau Kartu AK-1 (Antar Kerja) adalah kartu tanda pencari kerja yang dikeluarkan oleh 
                  Dinas Tenaga Kerja (Disnaker). Kartu ini menjadi syarat penting bagi pencari kerja untuk melamar 
                  pekerjaan di instansi pemerintah maupun perusahaan swasta tertentu.
                </p>
                
                <h3 className="font-bold text-gray-900 mb-3 text-lg">Syarat Pembuatan Kartu AK-1:</h3>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Fotokopi KTP yang masih berlaku</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Fotokopi Kartu Keluarga (KK)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Fotokopi ijazah terakhir yang telah dilegalisir</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Pas foto ukuran 3x4 (2 lembar) dengan latar belakang merah</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Surat pengantar dari Kelurahan/Desa (jika diperlukan)</span>
                  </li>
                </ul>

                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
                  <p className="text-indigo-800 font-medium mb-3">
                    📌 Untuk penduduk Kabupaten Cirebon, Anda dapat mendaftar antrian pembuatan Kartu AK-1 secara online melalui:
                  </p>
                  <a
                    href="https://disnaker.cirebonkab.go.id/form_antrian_ak1"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-semibold shadow-lg hover:shadow-xl"
                  >
                    <FileText className="w-5 h-5" />
                    Daftar Antrian Kartu AK-1 Online
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-amber-800">Catatan Penting:</p>
                    <p className="text-amber-700 text-sm mt-1">
                      Kartu AK-1 berlaku selama 2 tahun dan dapat diperpanjang. Pastikan untuk memperbarui kartu Anda 
                      sebelum masa berlaku habis. Pembuatan Kartu AK-1 tidak dipungut biaya (GRATIS).
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Consequences */}
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl shadow-lg p-8 border-2 border-orange-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Konsekuensi Pelanggaran</h2>
              </div>

              <div className="bg-white rounded-xl p-6">
                <p className="text-gray-700 mb-4 font-semibold">
                  Jika Anda melanggar peraturan di atas, konsekuensi yang akan diterima:
                </p>
                <ul className="space-y-3">
                  {consequences.jobseeker.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Recruiter Content */}
        {activeTab === 'recruiter' && (
          <div className="space-y-8">
            {/* Requirements Section */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Syarat yang Harus Dipenuhi</h2>
              </div>

              <div className="space-y-6">
                {recruiterRules.requirements.map((req, index) => (
                  <div key={index} className="border-l-4 border-green-600 bg-green-50 rounded-r-xl p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{req.title}</h3>
                    <p className="text-gray-700 mb-4">{req.description}</p>
                    <ul className="space-y-2">
                      {req.items.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Prohibited Section */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Yang TIDAK BOLEH Dilakukan</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {recruiterRules.prohibited.map((item, index) => {
                  const Icon = item.icon
                  return (
                    <div key={index} className="bg-red-50 border-2 border-red-200 rounded-xl p-6 hover:shadow-lg transition">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                          <p className="text-gray-700 text-sm">{item.description}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Tips Section */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-8 border-2 border-blue-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                  <Info className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Best Practices untuk Recruiter</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {recruiterRules.tips.map((tip, index) => (
                  <div key={index} className="flex items-start gap-3 bg-white rounded-xl p-4 shadow-sm">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <p className="text-gray-700">{tip}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Consequences */}
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl shadow-lg p-8 border-2 border-orange-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Konsekuensi Pelanggaran</h2>
              </div>

              <div className="bg-white rounded-xl p-6">
                <p className="text-gray-700 mb-4 font-semibold">
                  Perusahaan yang melanggar peraturan akan menerima sanksi berikut:
                </p>
                <ul className="space-y-3">
                  {consequences.recruiter.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* FAQ Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mt-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Pertanyaan yang Sering Diajukan</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border-2 border-gray-200 rounded-xl overflow-hidden hover:border-purple-300 transition">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition"
                >
                  <h3 className="font-bold text-gray-900 pr-4">{faq.question}</h3>
                  {expandedFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-purple-600 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  )}
                </button>
                {expandedFaq === index && (
                  <div className="px-6 pb-6 bg-purple-50">
                    <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact Support */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-8 text-white text-center mt-8">
          <h2 className="text-3xl font-bold mb-4">Masih Ada Pertanyaan?</h2>
          <p className="text-xl text-indigo-100 mb-6 max-w-2xl mx-auto">
            Tim support kami siap membantu Anda 24/7
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="mailto:support@jobseeker.id"
              className="inline-flex items-center justify-center gap-2 bg-white text-indigo-600 px-8 py-4 rounded-xl hover:bg-gray-100 transition-all font-bold shadow-lg"
            >
              <FileText className="w-5 h-5" />
              <span>Hubungi Support</span>
            </Link>
            <Link
              href="/help"
              className="inline-flex items-center justify-center gap-2 bg-transparent text-white border-2 border-white px-8 py-4 rounded-xl hover:bg-white hover:text-indigo-600 transition-all font-bold"
            >
              <Info className="w-5 h-5" />
              <span>Pusat Bantuan</span>
            </Link>
          </div>
        </div>

        {/* Agreement */}
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-2xl p-6 mt-8">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-gray-900 mb-2 text-lg">Pernyataan Persetujuan</h3>
              <p className="text-gray-700 leading-relaxed">
                Dengan menggunakan platform ini, Anda menyatakan telah membaca, memahami, dan menyetujui semua syarat dan ketentuan yang berlaku. 
                Anda bertanggung jawab penuh atas setiap tindakan yang dilakukan melalui akun Anda. 
                Platform berhak mengubah syarat dan ketentuan sewaktu-waktu tanpa pemberitahuan terlebih dahulu.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WarningPage