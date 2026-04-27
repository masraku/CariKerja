"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Briefcase,
  Building2,
  MapPin,
  ArrowRight,
  ChevronRight,
  Sparkles,
  Users,
  CheckCircle,
  TrendingUp,
  Banknote,
  Clock,
  Star,
} from "lucide-react";
import { useHomepageData } from "@/hooks/homepage/useHomepage";

export default function LandingPage() {
  const router = useRouter();
  const [searchKeyword, setSearchKeyword] = useState("");

  // Use React Query hook
  const {
    stats,
    featuredJobs,
    topCompanies,
    isLoading: loading,
    isLoadingStats,
    isLoadingJobs,
    isLoadingCompanies,
  } = useHomepageData();

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchKeyword) params.set("search", searchKeyword);
    router.push(`/jobs?${params.toString()}`);
  };

  const formatSalary = (min, max) => {
    const format = (num) => {
      if (!num) return null;
      if (num >= 1000000) return `${(num / 1000000).toFixed(0)}jt`;
      if (num >= 1000) return `${(num / 1000).toFixed(0)}rb`;
      return num;
    };
    if (min && max) return `${format(min)} - ${format(max)}`;
    if (min) return `${format(min)}+`;
    return "Nego";
  };

  const formatJobType = (type) => {
    const map = {
      FULL_TIME: "Full Time",
      PART_TIME: "Part Time",
      CONTRACT: "Contract",
      FREELANCE: "Freelance",
      INTERNSHIP: "Internship",
    };
    return map[type] || type;
  };

  const getTimeAgo = (date) => {
    if (!date) return "Baru saja";
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " thn lalu";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " bln lalu";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " hari lalu";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " jam lalu";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " menit lalu";
    return "Baru saja";
  };

  return (
    <div className="min-h-screen bg-gray-50 selection:bg-primary/10 selection:text-primary overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 lg:pt-36 lg:pb-24 overflow-hidden bg-primary">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-hover opacity-90" />
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-20"
        >
          <source
            src="https://static.vecteezy.com/system/resources/previews/025/315/414/mp4/yogyakarta-indonesia-may-5th-2023-aerial-view-of-tugu-jogja-or-yogyakarta-monument-indonesia-free-video.mp4"
            type="video/mp4"
          />
        </video>

        <div className="max-w-5xl mx-auto px-4 lg:px-8 relative z-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-8 animate-fade-in-up shadow-lg shadow-blue-900/20">
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span className="text-sm text-white font-medium">
              Platform Karir by Dinas Ketenagakerjaan Kabupaten Cirebon
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-white mb-6 leading-tight drop-shadow-sm">
            Cari Kerja Lebih <span className="text-[#ffd700]">SIMPEL</span>
          </h1>
          <div className="flex flex-col items-center justify-center mb-10">
            <div className="h-px w-24 bg-blue-400/50 mb-1"></div>
            <p className="text-lg sm:text-xl lg:text-2xl text-[#ffd700] font-semibold tracking-wider uppercase">
              Sistem Informasi Matching Pelamar
            </p>
            <p className="text-base lg:text-lg text-blue-100 font-light mt-1">
              Platform Pencari Kerja Kabupaten Cirebon
            </p>
          </div>

          {/* Search Bar */}
          <form
            onSubmit={handleSearch}
            className="max-w-2xl mx-auto mb-16 relative z-20"
          >
            <div className="bg-white/10 backdrop-blur-md p-2 rounded-2xl shadow-2xl border border-white/20 flex flex-col sm:flex-row gap-2">
              <div className="flex-1 relative bg-white rounded-xl overflow-hidden">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari posisi, perusahaan, atau keahlian..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-transparent border-0 focus:ring-0 text-gray-900 placeholder-gray-400 text-base"
                />
              </div>
              <button
                type="submit"
                className="px-8 py-3.5 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl transition-all shadow-lg shadow-gray-900/20 flex items-center justify-center gap-2"
              >
                Cari
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </form>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-3xl mx-auto">
            {[
              {
                label: "Total Lowongan",
                value: stats?.totalJobs,
              },
              {
                label: "Perusahaan Terverifikasi",
                value: stats?.totalCompanies,
              },
              {
                label: "Talenta Diterima",
                value: stats?.totalHires,
              },
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-lg text-center min-h-[80px] sm:min-h-[100px] lg:min-h-[120px] flex flex-col justify-center"
              >
                {isLoadingStats ? (
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  </div>
                ) : (
                  <>
                    <div className="text-xl sm:text-2xl lg:text-4xl font-bold text-white mb-1">
                      {stat.value?.toLocaleString() || "0"}+
                    </div>
                    <div className="text-[10px] sm:text-xs lg:text-sm text-blue-200 font-medium uppercase tracking-wider leading-tight">
                      {stat.label}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="px-4 lg:px-8 py-20 lg:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-12">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
                Lowongan Terbaru
              </h2>
              <p className="text-gray-500 text-lg">
                Peluang karir terbaik minggu ini
              </p>
            </div>
            <Link
              href="/jobs"
              className="group inline-flex items-center gap-2 px-5 py-2.5 bg-white text-gray-700 hover:text-primary font-medium rounded-xl border border-gray-200 hover:border-primary/20 transition-all shadow-sm hover:shadow-md"
            >
              Lihat Semua
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Jobs Grid */}
          {isLoadingJobs ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm h-48 animate-pulse"
                ></div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredJobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/jobs/${job.slug}`}
                  className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300 flex flex-col h-full overflow-hidden"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-14 h-14 rounded-xl bg-white border border-gray-100 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform shadow-sm">
                      {job.companies?.logo ? (
                        <img
                          src={job.companies.logo}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Building2 className="w-7 h-7 text-gray-300" />
                      )}
                    </div>
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-lg border border-primary/20">
                      {formatJobType(job.jobType)}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors mb-2 line-clamp-1">
                    {job.title}
                  </h3>

                  <div className="flex items-center gap-2 text-gray-500 text-sm mb-6 flex-1 min-w-0">
                    <span className="font-medium text-gray-700 truncate flex-shrink-0 max-w-[40%]">
                      {job.companies?.name}
                    </span>
                    {job.companies?.verified && (
                        <CheckCircle className="w-4 h-4 text-primary fill-primary/10 flex-shrink-0" />
                    )}
                    <span className="w-1 h-1 bg-gray-300 rounded-full flex-shrink-0"></span>
                    <span className="truncate">{job.location || job.city}</span>
                  </div>

                  <div className="pt-4 border-t border-gray-50 flex items-center justify-between mt-auto">
                    <div className="text-gray-400 text-xs font-medium flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1.5" />
                      {getTimeAgo(job.postedAt)}
                    </div>
                    {(job.salaryMin || job.salaryMax) && (
                      <div className="font-bold text-primary text-sm">
                        Rp {formatSalary(job.salaryMin, job.salaryMax)}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Top Companies Section */}
      <section className="px-4 lg:px-8 py-20 lg:py-28 bg-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
        <div className="max-w-7xl mx-auto">
          <div className="border border-gray-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.06)] overflow-hidden">
            <div className="px-6 py-10 sm:px-10 lg:px-14 lg:py-14 border-b border-gray-200">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary mb-5">
                Perusahaan Terverifikasi
              </p>
              <div className="max-w-4xl">
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-950 leading-[1.05]">
                  Dipercaya perusahaan terbaik, aman untuk talenta lokal.
                </h2>
                <p className="mt-5 text-base sm:text-lg text-gray-500 max-w-2xl">
                  Mitra perusahaan yang telah diverifikasi Disnaker ditampilkan
                  dalam format yang lebih ringkas agar fokus langsung ke brand.
                </p>
              </div>
            </div>

            {/* Companies Grid */}
            {isLoadingCompanies ? (
              <div className="grid grid-cols-2 md:grid-cols-4 border-r border-b border-gray-200 -mr-px -mb-px">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div
                    key={i}
                    className="h-36 sm:h-40 border-l border-t border-gray-200 bg-gray-50 animate-pulse"
                  ></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 border-r border-b border-gray-200 -mr-px -mb-px">
                {topCompanies.slice(0, 12).map((company) => (
                  <Link
                    key={company.id}
                    href={`/companies/${company.slug || company.id}`}
                    className="group relative h-36 sm:h-40 lg:h-44 border-l border-t border-gray-200 bg-white flex items-center justify-center p-6 sm:p-8 transition-colors duration-300 hover:bg-gray-50"
                  >
                    <div className="flex max-w-full flex-col items-center justify-center text-center">
                      {company.logo ? (
                        <img
                          src={company.logo}
                          alt={company.name}
                          className="max-h-12 sm:max-h-14 lg:max-h-16 w-auto max-w-[150px] sm:max-w-[180px] object-contain transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <>
                          <div className="w-14 h-14 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center mb-3 transition-colors duration-300 group-hover:bg-primary/10 group-hover:text-primary">
                            <Building2 className="w-7 h-7" />
                          </div>
                          <h3 className="font-semibold text-gray-900 text-sm sm:text-base leading-tight line-clamp-2">
                            {company.name}
                          </h3>
                        </>
                      )}
                      <span className="absolute left-4 top-4 inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Verified
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="px-4 lg:px-8 py-20 lg:py-28 bg-gray-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/30 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/30 rounded-full blur-[100px]"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Mulai Karirmu Sekarang
            </h2>
            <p className="text-gray-400 text-lg">
              Hanya butuh 3 langkah sederhana
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {[
              {
                icon: Users,
                title: "Buat Profil Profesional",
                desc: "Tunjukkan keahlian dan pengalamanmu dengan profil yang menarik.",
                color: "bg-primary",
              },
              {
                icon: Search,
                title: "Temukan Peluang",
                desc: "Filter ribuan lowongan yang sesuai dengan kriteria impianmu.",
                color: "bg-indigo-500",
              },
              {
                icon: Briefcase,
                title: "Lamar & Berkarir",
                desc: "Kirim lamaran dengan satu klik dan pantau statusnya.",
                color: "bg-purple-500",
              },
            ].map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="relative group">
                  <div className="absolute inset-0 bg-white/5 rounded-3xl transform rotate-3 group-hover:rotate-6 transition-transform duration-300"></div>
                  <div className="relative bg-gray-800/50 backdrop-blur-sm border border-white/10 p-8 rounded-3xl hover:-translate-y-2 transition-transform duration-300 h-full">
                    <div
                      className={`w-14 h-14 ${step.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}
                    >
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                    <p className="text-gray-400 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 lg:px-8 py-20 lg:py-28 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-r from-primary to-primary-hover rounded-[2.5rem] p-8 lg:p-16 text-center relative overflow-hidden shadow-2xl shadow-primary/20">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
            <div className="relative z-10">
              <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
                Siap untuk Langkah Selanjutnya?
              </h2>
              <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto">
                Jangan lewatkan kesempatan untuk berkembang. Bergabunglah dengan
                komunitas profesional kami hari ini.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  href="/login?action=register&role=jobseeker"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary hover:bg-primary/10 font-bold rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
                >
                  Mulai Cari Kerja
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/login?action=register&role=recruiter"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-700/50 hover:bg-blue-700 text-white font-bold rounded-xl transition-all border border-blue-400/30 hover:border-blue-400/50"
                >
                  <Building2 className="w-5 h-5" />
                  Untuk Perusahaan
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
