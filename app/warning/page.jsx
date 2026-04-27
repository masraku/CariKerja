"use client";
import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Shield,
  FileText,
  Users,
  Briefcase,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Info,
  Ban,
  Award,
  Eye,
  ExternalLink,
} from "lucide-react";

const WarningPage = () => {
  const [activeTab, setActiveTab] = useState("jobseeker");
  const [expandedFaq, setExpandedFaq] = useState(null);

  const jobseekerRules = {
    requirements: [
      {
        title: "Profil Lengkap & Valid",
        description:
          "Pastikan semua informasi pribadi yang Anda berikan adalah benar dan dapat diverifikasi",
        items: [
          "Nama lengkap sesuai KTP",
          "Nomor telepon aktif yang dapat dihubungi",
          "Email aktif untuk komunikasi",
          "Alamat domisili yang jelas",
        ],
      },
      {
        title: "CV/Resume Profesional",
        description: "CV yang Anda upload harus memenuhi standar profesional",
        items: [
          "Format PDF dengan ukuran maksimal 5MB",
          "Informasi pengalaman kerja yang detail dan jelas",
          "Pendidikan formal yang relevan",
          "Skill yang sesuai dengan posisi yang dilamar",
          "Tidak boleh ada informasi palsu atau dilebih-lebihkan",
        ],
      },
      {
        title: "Dokumen Pendukung",
        description: "Siapkan dokumen pendukung yang mungkin diperlukan",
        items: [
          "Ijazah terakhir (scan)",
          "Transkrip nilai",
          "Sertifikat pelatihan/keahlian (jika ada)",
          "Portofolio untuk posisi kreatif",
          "Surat referensi dari perusahaan sebelumnya",
        ],
      },
    ],
    prohibited: [
      {
        icon: Ban,
        title: "Informasi Palsu",
        description:
          "Memberikan data diri, pengalaman kerja, atau pendidikan yang tidak sesuai fakta",
      },
      {
        icon: Ban,
        title: "Melamar Sembarangan",
        description:
          "Melamar ke posisi yang tidak sesuai dengan kualifikasi atau minat Anda",
      },
      {
        icon: Ban,
        title: "Spam Aplikasi",
        description:
          "Mengirim lamaran berulang kali untuk posisi yang sama dalam waktu singkat",
      },
      {
        icon: Ban,
        title: "Tidak Profesional",
        description:
          "Menggunakan email atau foto profil yang tidak profesional",
      },
      {
        icon: Ban,
        title: "Plagiarisme CV",
        description:
          "Menyalin CV orang lain atau menggunakan template yang sama persis",
      },
      {
        icon: Ban,
        title: "Ghosting Interview",
        description:
          "Tidak hadir pada jadwal interview tanpa pemberitahuan sebelumnya",
      },
    ],
    tips: [
      "Baca deskripsi lowongan dengan teliti sebelum melamar",
      "Sesuaikan CV dan cover letter dengan posisi yang dilamar",
      "Jawab pertanyaan screening dengan jujur dan lengkap",
      "Siapkan diri dengan baik sebelum interview",
      "Follow up secara profesional setelah melamar",
      "Update profil Anda secara berkala",
      "Jaga komunikasi yang baik dengan rekruter",
      "Berikan notifikasi jika berubah pikiran atau sudah diterima di tempat lain",
    ],
  };

  const recruiterRules = {
    requirements: [
      {
        title: "Profil Perusahaan Lengkap",
        description: "Informasi perusahaan harus jelas dan dapat diverifikasi",
        items: [
          "Nama perusahaan resmi sesuai akta pendirian",
          "Alamat kantor yang jelas dan valid",
          "Nomor telepon kantor yang dapat dihubungi",
          "Email perusahaan dengan domain resmi",
          "Website perusahaan (jika ada)",
          "Bidang usaha/industri yang jelas",
        ],
      },
      {
        title: "Deskripsi Lowongan yang Jelas",
        description:
          "Setiap lowongan harus memiliki informasi yang lengkap dan transparan",
        items: [
          "Judul posisi yang spesifik dan jelas",
          "Job description yang detail",
          "Kualifikasi dan requirements yang realistis",
          "Rentang gaji yang jujur (tidak perlu exact, bisa range)",
          "Benefit dan fasilitas yang ditawarkan",
          "Lokasi kerja yang spesifik",
          "Tipe pekerjaan (Full-time, Part-time, Contract, dll)",
          "Proses seleksi dan timeline rekrutmen",
        ],
      },
      {
        title: "Dokumen Legalitas",
        description: "Perusahaan harus dapat menunjukkan legalitas usaha",
        items: [
          "NPWP Perusahaan",
          "Akta Pendirian Perusahaan",
          "SIUP/NIB (Nomor Induk Berusaha)",
          "Domisili Usaha",
          "Surat Keterangan Terdaftar (jika perusahaan besar)",
        ],
      },
    ],
    prohibited: [
      {
        icon: Ban,
        title: "Lowongan Palsu",
        description:
          "Membuat lowongan kerja yang tidak benar-benar ada atau fiktif",
      },
      {
        icon: Ban,
        title: "Informasi Menyesatkan",
        description:
          "Memberikan informasi gaji, benefit, atau kondisi kerja yang tidak sesuai kenyataan",
      },
      {
        icon: Ban,
        title: "Diskriminasi",
        description:
          "Melakukan diskriminasi berdasarkan ras, agama, gender, atau latar belakang",
      },
      {
        icon: Ban,
        title: "Meminta Uang",
        description:
          "Meminta biaya pendaftaran, training, atau deposit dalam bentuk apapun",
      },
      {
        icon: Ban,
        title: "Penyalahgunaan Data",
        description:
          "Menggunakan data kandidat untuk tujuan di luar proses rekrutmen",
      },
      {
        icon: Ban,
        title: "MLM/Skema Piramida",
        description:
          "Menawarkan skema bisnis MLM atau investasi yang berkedok lowongan kerja",
      },
      {
        icon: Ban,
        title: "Ghosting Kandidat",
        description:
          "Tidak memberikan feedback atau update status lamaran kepada kandidat",
      },
      {
        icon: Ban,
        title: "Perusahaan Bodong",
        description:
          "Menggunakan nama perusahaan fiktif atau tidak terdaftar secara resmi",
      },
    ],
    tips: [
      "Tulis deskripsi pekerjaan yang jelas dan menarik",
      "Berikan informasi gaji yang transparan",
      "Respon lamaran kandidat dalam waktu yang wajar (max 2 minggu)",
      "Lakukan interview sesuai jadwal yang telah ditentukan",
      "Berikan feedback kepada kandidat yang tidak lolos",
      "Jaga kerahasiaan data pribadi kandidat",
      "Update status lowongan secara berkala",
      "Bersikap profesional dalam setiap komunikasi",
      "Jelaskan proses seleksi dengan detail di awal",
    ],
  };

  const consequences = {
    jobseeker: [
      "Akun dapat di-suspend sementara atau permanen",
      "Lamaran akan otomatis ditolak oleh sistem",
      "Blacklist dari perusahaan-perusahaan tertentu",
      "Kehilangan akses ke fitur premium (jika ada)",
      "Laporan ke pihak berwenang jika terbukti melakukan penipuan",
    ],
    recruiter: [
      "Lowongan akan dihapus dari platform",
      "Akun perusahaan di-suspend atau banned permanen",
      "Tidak dapat posting lowongan baru",
      "Blacklist dari database perusahaan terverifikasi",
      "Laporan ke Disnaker dan pihak berwenang terkait",
      "Tuntutan hukum jika terbukti melakukan penipuan atau penyalahgunaan data",
    ],
  };

  const faqs = [
    {
      question: "Apakah ada biaya untuk menggunakan platform ini?",
      answer:
        "Tidak ada biaya apapun untuk pencaker. Platform ini 100% gratis untuk pencari kerja. Untuk rekruter, kami menyediakan paket gratis dengan fitur terbatas dan paket berbayar dengan fitur premium.",
    },
    {
      question:
        "Bagaimana cara melaporkan lowongan atau perusahaan yang mencurigakan?",
      answer:
        'Anda dapat melaporkan melalui tombol "Laporkan" yang ada di setiap halaman lowongan, atau hubungi tim support kami melalui email support@jobseeker.id dengan menyertakan bukti dan detail lengkap.',
    },
    {
      question: "Berapa lama proses verifikasi perusahaan?",
      answer:
        "Proses verifikasi perusahaan biasanya memakan waktu 2-5 hari kerja. Kami akan melakukan pengecekan legalitas dokumen dan validasi informasi perusahaan.",
    },
    {
      question: "Apakah data pribadi saya aman?",
      answer:
        "Ya, kami sangat menjaga kerahasiaan data Anda. Data hanya dapat diakses oleh rekruter yang Anda lamar, dan kami tidak akan membagikan data Anda kepada pihak ketiga tanpa izin.",
    },
    {
      question:
        "Apa yang harus dilakukan jika diminta transfer uang oleh rekruter?",
      answer:
        "Jangan transfer. Ini adalah tanda kuat penipuan. Segera laporkan kepada kami dan jangan lanjutkan proses apa pun dengan rekruter tersebut. Perusahaan yang benar tidak akan meminta uang dalam proses rekrutmen.",
    },
    {
      question: "Bolehkah melamar ke banyak posisi sekaligus?",
      answer:
        "Ya, Anda boleh melamar ke berbagai posisi, namun pastikan Anda benar-benar memenuhi kualifikasi dan serius dengan setiap lamaran. Utamakan kualitas lamaran dibanding jumlahnya.",
    },
  ];

  const audiences = {
    jobseeker: {
      tabLabel: "Untuk Jobseeker",
      tipsTitle: "Tips Melamar dengan Rapi",
      consequenceIntro:
        "Jika aturan diabaikan, akun atau lamaran dapat terkena tindakan berikut:",
      icon: Users,
    },
    recruiter: {
      tabLabel: "Untuk Rekruter",
      tipsTitle: "Praktik Baik untuk Rekruter",
      consequenceIntro:
        "Perusahaan yang melanggar aturan dapat menerima sanksi berikut:",
      icon: Briefcase,
    },
  };

  const activeAudience = audiences[activeTab];
  const activeRules =
    activeTab === "jobseeker" ? jobseekerRules : recruiterRules;
  const activeConsequences = consequences[activeTab];

  const principles = [
    {
      icon: Eye,
      title: "Transparan",
      description: "Informasi lowongan, profil, dan proses seleksi harus jelas.",
    },
    {
      icon: Shield,
      title: "Aman",
      description: "Data pengguna digunakan sesuai kebutuhan layanan.",
    },
    {
      icon: Award,
      title: "Profesional",
      description: "Komunikasi dilakukan dengan sopan dan bertanggung jawab.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      <div className="container mx-auto px-4 pb-14 sm:px-6 lg:px-8">
        <div className="mb-6 mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-6 w-6 flex-none text-amber-600" />
            <div>
              <h3 className="font-semibold text-amber-900">Penting untuk dibaca</h3>
              <p className="mt-1 text-sm leading-6 text-amber-800">
                Halaman ini menjelaskan aturan dasar penggunaan platform agar
                proses rekrutmen tetap aman, jelas, dan bertanggung jawab.
              </p>
            </div>
          </div>
        </div>

        <section className="relative overflow-hidden rounded-[2rem] bg-primary text-white shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-hover" />
          <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="relative z-10 px-6 py-10 sm:px-8 md:py-14 lg:px-14">
            <div className="mx-auto max-w-4xl text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/15 bg-white/10">
                <Shield className="h-8 w-8" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                Syarat & Ketentuan Platform SIMPel
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-blue-100 sm:text-lg">
                Panduan singkat untuk menjaga layanan lowongan kerja tetap rapi,
                aman, dan nyaman bagi pencari kerja maupun perusahaan.
              </p>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {principles.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-sm"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-blue-100">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-blue-100">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="mx-auto mt-8 max-w-2xl rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
          <div className="grid gap-2 sm:grid-cols-2">
            {Object.entries(audiences).map(([key, audience]) => {
              const Icon = audience.icon;
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex items-center justify-center gap-3 rounded-xl px-5 py-4 text-sm font-semibold transition ${
                    activeTab === key
                      ? "bg-primary text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-50 hover:text-primary"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {audience.tabLabel}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-8 space-y-8">
          <section className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-6 flex items-start gap-4">
              <div className="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-primary/10 text-primary">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
                  {activeAudience.tabLabel}
                </p>
                <h2 className="mt-1 text-2xl font-bold text-slate-950 md:text-3xl">
                  Syarat yang Harus Dipenuhi
                </h2>
              </div>
            </div>

            <div className="space-y-5">
              {activeRules.requirements.map((req) => (
                <div
                  key={req.title}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                >
                  <h3 className="text-lg font-semibold text-slate-950">
                    {req.title}
                  </h3>
                  <p className="mt-2 leading-7 text-slate-600">
                    {req.description}
                  </p>
                  <ul className="mt-4 grid gap-3 md:grid-cols-2">
                    {req.items.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <CheckCircle className="mt-0.5 h-5 w-5 flex-none text-primary" />
                        <span className="text-sm leading-6 text-slate-700">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-6 flex items-start gap-4">
              <div className="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-red-50 text-red-600">
                <XCircle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-600">
                  Batasan Penggunaan
                </p>
                <h2 className="mt-1 text-2xl font-bold text-slate-950 md:text-3xl">
                  Hal yang Dilarang
                </h2>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {activeRules.prohibited.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-red-100 bg-red-50/70 p-5"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 flex-none items-center justify-center rounded-xl border border-red-100 bg-white text-red-600">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-950">
                          {item.title}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-slate-700">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-[1.5rem] border border-primary/15 bg-primary/5 p-6 shadow-sm md:p-8">
            <div className="mb-6 flex items-start gap-4">
              <div className="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-primary text-white">
                <Info className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
                  Rekomendasi
                </p>
                <h2 className="mt-1 text-2xl font-bold text-slate-950 md:text-3xl">
                  {activeAudience.tipsTitle}
                </h2>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {activeRules.tips.map((tip, index) => (
                <div
                  key={tip}
                  className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
                >
                  <div className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                    {index + 1}
                  </div>
                  <p className="text-sm leading-6 text-slate-700">{tip}</p>
                </div>
              ))}
            </div>
          </section>

          {activeTab === "jobseeker" && (
            <section className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
              <div className="mb-6 flex items-start gap-4">
                <div className="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
                    Informasi AK-1
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-slate-950 md:text-3xl">
                    Cara Mendapatkan Kartu AK-1
                  </h2>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 md:p-6">
                <h3 className="text-lg font-semibold text-slate-950">
                  Apa itu Kartu AK-1?
                </h3>
                <p className="mt-3 leading-7 text-slate-600">
                  Kartu Kuning atau Kartu AK-1 (Antar Kerja) adalah kartu tanda
                  pencari kerja yang dikeluarkan oleh Dinas Tenaga Kerja
                  (Disnaker). Kartu ini dapat menjadi dokumen pendukung saat
                  melamar pekerjaan di instansi pemerintah maupun perusahaan
                  tertentu.
                </p>

                <h3 className="mt-6 text-lg font-semibold text-slate-950">
                  Syarat Pembuatan Kartu AK-1
                </h3>
                <ul className="mt-4 grid gap-3 md:grid-cols-2">
                  {[
                    "Fotokopi KTP yang masih berlaku",
                    "Fotokopi Kartu Keluarga (KK)",
                    "Fotokopi ijazah terakhir yang telah dilegalisir",
                    "Pas foto ukuran 3x4, 2 lembar dengan latar belakang merah",
                    "Surat pengantar dari Kelurahan/Desa jika diperlukan",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <CheckCircle className="mt-0.5 h-5 w-5 flex-none text-primary" />
                      <span className="text-sm leading-6 text-slate-700">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 rounded-2xl border border-primary/15 bg-white p-4">
                  <p className="mb-4 text-sm font-medium leading-6 text-slate-700">
                    Untuk penduduk Kabupaten Cirebon, pendaftaran antrian
                    pembuatan Kartu AK-1 dapat dilakukan melalui layanan online
                    Disnaker Kabupaten Cirebon.
                  </p>
                  <a
                    href="https://disnaker.cirebonkab.go.id/form_antrian_ak1"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-hover"
                  >
                    <FileText className="h-5 w-5" />
                    Daftar Antrian Kartu AK-1 Online
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 h-6 w-6 flex-none text-amber-600" />
                  <div>
                    <p className="font-semibold text-amber-900">Catatan penting</p>
                    <p className="mt-1 text-sm leading-6 text-amber-800">
                      Kartu AK-1 berlaku selama 2 tahun dan dapat diperpanjang.
                      Pembuatan Kartu AK-1 tidak dipungut biaya.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )}

          <section className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-6 shadow-sm md:p-8">
            <div className="mb-6 flex items-start gap-4">
              <div className="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">
                  Sanksi
                </p>
                <h2 className="mt-1 text-2xl font-bold text-slate-950 md:text-3xl">
                  Konsekuensi Pelanggaran
                </h2>
              </div>
            </div>

            <div className="rounded-2xl border border-amber-100 bg-white p-5">
              <p className="mb-4 font-semibold text-slate-800">
                {activeAudience.consequenceIntro}
              </p>
              <ul className="space-y-3">
                {activeConsequences.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <AlertCircle className="mt-0.5 h-5 w-5 flex-none text-amber-600" />
                    <span className="text-sm leading-6 text-slate-700">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>

        <section className="mt-8 rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="mb-6 flex items-start gap-4">
            <div className="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
                FAQ
              </p>
              <h2 className="mt-1 text-2xl font-bold text-slate-950 md:text-3xl">
                Pertanyaan yang Sering Diajukan
              </h2>
            </div>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div
                key={faq.question}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:border-primary/25"
              >
                <button
                  onClick={() =>
                    setExpandedFaq(expandedFaq === index ? null : index)
                  }
                  className="flex w-full items-center justify-between gap-4 p-5 text-left transition hover:bg-slate-50"
                >
                  <h3 className="font-semibold text-slate-950">
                    {faq.question}
                  </h3>
                  {expandedFaq === index ? (
                    <ChevronUp className="h-5 w-5 flex-none text-primary" />
                  ) : (
                    <ChevronDown className="h-5 w-5 flex-none text-slate-400" />
                  )}
                </button>
                {expandedFaq === index && (
                  <div className="border-t border-slate-100 bg-slate-50 px-5 py-4">
                    <p className="leading-7 text-slate-700">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-[1.5rem] bg-primary p-6 text-center text-white shadow-sm md:p-8">
          <h2 className="text-2xl font-bold md:text-3xl">Masih Ada Pertanyaan?</h2>
          <p className="mx-auto mt-3 max-w-2xl leading-7 text-blue-100">
            Hubungi tim pengelola jika ada lowongan mencurigakan atau kendala
            saat menggunakan platform.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="mailto:support@jobseeker.id"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-primary transition hover:bg-blue-50"
            >
              <FileText className="h-5 w-5" />
              Hubungi Support
            </Link>
            <Link
              href="/help"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              <Info className="h-5 w-5" />
              Pusat Bantuan
            </Link>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-amber-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <AlertTriangle className="mt-1 h-6 w-6 flex-none text-amber-600" />
            <div>
              <h3 className="text-lg font-semibold text-slate-950">
                Pernyataan Persetujuan
              </h3>
              <p className="mt-2 leading-7 text-slate-700">
                Dengan menggunakan platform ini, Anda menyatakan telah membaca,
                memahami, dan menyetujui semua syarat dan ketentuan yang
                berlaku. Anda bertanggung jawab penuh atas setiap tindakan yang
                dilakukan melalui akun Anda. Platform berhak mengubah syarat dan
                ketentuan sewaktu-waktu tanpa pemberitahuan terlebih dahulu.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default WarningPage;
