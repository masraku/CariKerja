"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  ExternalLink,
  Facebook,
  Flag,
  Globe,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Share2,
  Star,
  TrendingUp,
  Twitter,
  Users,
} from "lucide-react";
import { useQueryCompanyDetail } from "@/hooks/companies/useCompanies";

const tabs = [
  { id: "about", label: "Tentang", icon: Building2 },
  { id: "jobs", label: "Lowongan", icon: Briefcase },
  { id: "benefits", label: "Benefits", icon: Award },
  { id: "reviews", label: "Reviews", icon: Star },
];

export default function CompanyProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("about");

  const {
    data: company,
    isPending: loading,
    isError,
  } = useQueryCompanyDetail(params?.slug);

  useEffect(() => {
    if (isError) {
      router.push("/companies");
    }
  }, [isError, router]);

  const getJobTypeLabel = (type) => {
    const labels = {
      FULL_TIME: "Full Time",
      PART_TIME: "Part Time",
      CONTRACT: "Kontrak",
      FREELANCE: "Freelance",
      INTERNSHIP: "Magang",
    };
    return labels[type] || type;
  };

  const getLevelLabel = (level) => {
    const labels = {
      ENTRY_LEVEL: "Entry Level",
      JUNIOR: "Junior",
      MID_LEVEL: "Mid Level",
      SENIOR: "Senior",
      LEAD: "Lead",
      MANAGER: "Manager",
      DIRECTOR: "Director",
    };
    return labels[level] || level;
  };

  const formatSalary = (min, max, type) => {
    const formatNumber = (num) => new Intl.NumberFormat("id-ID").format(num);
    if (!min || !max) return "Gaji kompetitif";

    const typeLabel = {
      monthly: "/ bulan",
      yearly: "/ tahun",
      hourly: "/ jam",
    };

    return `Rp ${formatNumber(min)} - Rp ${formatNumber(max)} ${
      typeLabel[type] || ""
    }`;
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return `${Math.floor(interval)} tahun lalu`;
    interval = seconds / 2592000;
    if (interval > 1) return `${Math.floor(interval)} bulan lalu`;
    interval = seconds / 86400;
    if (interval > 1) return `${Math.floor(interval)} hari lalu`;
    interval = seconds / 3600;
    if (interval > 1) return `${Math.floor(interval)} jam lalu`;
    interval = seconds / 60;
    if (interval > 1) return `${Math.floor(interval)} menit lalu`;
    return "Baru saja";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="animate-pulse lg:flex lg:gap-8">
              <div className="mb-6 h-36 w-36 rounded-3xl bg-slate-100 lg:mb-0" />
              <div className="flex-1 space-y-4">
                <div className="h-10 w-2/3 rounded bg-slate-100" />
                <div className="h-5 w-1/2 rounded bg-slate-100" />
                <div className="grid gap-3 sm:grid-cols-4">
                  {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="h-16 rounded-2xl bg-slate-100" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-50 text-slate-300">
            <Building2 className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-950">
            Perusahaan Tidak Ditemukan
          </h2>
          <p className="mt-3 leading-7 text-slate-500">
            Perusahaan yang Anda cari mungkin telah dihapus atau tautan yang
            digunakan salah.
          </p>
          <Link
            href="/companies"
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-hover"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Daftar Perusahaan
          </Link>
        </div>
      </div>
    );
  }

  const activeJobsCount = company.jobs?.length || 0;
  const ratingValue = Number(company.averageRatings?.overall || 0);
  const profileDescription = company.bio || company.description;

  return (
    <div className="min-h-screen overflow-hidden bg-slate-50 pb-16">
      <section className="relative bg-slate-950 pt-32 text-white lg:pt-36">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_22%,rgba(14,116,144,0.5),transparent_34%),linear-gradient(135deg,#011d29_0%,#03587f_52%,#012b3d_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-50 to-transparent" />
        <div className="container relative z-10 mx-auto px-4 pb-28 sm:px-6 lg:px-8">
          <Link
            href="/companies"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-blue-100 backdrop-blur transition hover:bg-white/15 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke perusahaan
          </Link>
        </div>
      </section>

      <main className="container relative z-10 mx-auto -mt-24 px-4 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_90px_rgba(15,23,42,0.12)]">
          <div className="grid gap-8 p-6 lg:grid-cols-[180px_1fr_auto] lg:p-8">
            <div className="mx-auto flex h-36 w-36 items-center justify-center rounded-[1.75rem] border border-slate-100 bg-white p-4 shadow-xl shadow-slate-200/70 lg:mx-0 lg:h-44 lg:w-44">
              {company.logo ? (
                <img
                  src={company.logo}
                  alt={company.name}
                  className="h-full w-full object-contain"
                />
              ) : (
                <Building2 className="h-16 w-16 text-slate-300" />
              )}
            </div>

            <div className="min-w-0 text-center lg:text-left">
              <div className="mb-4 flex flex-wrap justify-center gap-2 lg:justify-start">
                {company.verified && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-primary/5 px-3 py-1.5 text-sm font-semibold text-primary">
                    <CheckCircle className="h-4 w-4" />
                    Terverifikasi
                  </span>
                )}
                {activeJobsCount > 0 && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700">
                    <Briefcase className="h-4 w-4" />
                    {activeJobsCount} lowongan aktif
                  </span>
                )}
              </div>

              <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                {company.name}
              </h1>
              <p className="mx-auto mt-4 max-w-3xl text-base leading-8 text-slate-600 lg:mx-0 lg:text-lg">
                {company.tagline ||
                  "Profil perusahaan terverifikasi dengan informasi lowongan dan detail perusahaan yang dapat ditinjau sebelum melamar."}
              </p>

              <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  {
                    icon: Building2,
                    label: "Industri",
                    value: company.industry || "Belum dilengkapi",
                  },
                  {
                    icon: Users,
                    label: "Ukuran",
                    value: `${company.companySize || "-"} karyawan`,
                  },
                  {
                    icon: MapPin,
                    label: "Lokasi",
                    value: [company.city, company.province]
                      .filter(Boolean)
                      .join(", "),
                  },
                  {
                    icon: Star,
                    label: "Rating",
                    value:
                      ratingValue > 0
                        ? `${ratingValue.toFixed(1)} dari ${company._count.reviews} ulasan`
                        : "Belum ada ulasan",
                  },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="rounded-2xl bg-slate-50 p-4">
                    <div className="mb-2 flex items-center justify-center gap-2 text-sm font-semibold text-slate-500 lg:justify-start">
                      <Icon className="h-4 w-4 text-primary" />
                      {label}
                    </div>
                    <p className="truncate font-bold text-slate-950">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3 lg:min-w-[180px]">
              {company.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-hover"
                >
                  <Globe className="h-4 w-4" />
                  Website
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
              <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-primary/20 hover:bg-primary/5 hover:text-primary">
                <Share2 className="h-4 w-4" />
                Bagikan
              </button>
              <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600">
                <Flag className="h-4 w-4" />
                Laporkan
              </button>
            </div>
          </div>
        </section>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0 space-y-6">
            <nav className="sticky top-24 z-30 rounded-[1.5rem] border border-slate-200 bg-white/95 p-2 shadow-sm backdrop-blur">
              <div className="flex gap-2 overflow-x-auto">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const count =
                    tab.id === "jobs"
                      ? ` (${activeJobsCount})`
                      : tab.id === "reviews"
                        ? ` (${company._count.reviews})`
                        : "";

                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`inline-flex flex-none items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition ${
                        activeTab === tab.id
                          ? "bg-primary text-white shadow-sm"
                          : "text-slate-600 hover:bg-slate-50 hover:text-primary"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {tab.label}
                      {count}
                    </button>
                  );
                })}
              </div>
            </nav>

            <section className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
              {activeTab === "about" && (
                <div className="space-y-10">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">
                      Profil
                    </p>
                    <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                      Tentang Perusahaan
                    </h2>
                    {profileDescription ? (
                      <div className="mt-5 whitespace-pre-line text-base leading-8 text-slate-600">
                        {profileDescription}
                      </div>
                    ) : (
                      <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-slate-600">
                        Perusahaan ini belum menambahkan deskripsi. Anda tetap
                        dapat melihat informasi dasar, lokasi, dan lowongan aktif
                        yang tersedia.
                      </div>
                    )}
                  </div>

                  {company.culture && (
                    <div className="rounded-2xl border border-primary/15 bg-primary/5 p-6">
                      <h3 className="text-xl font-bold text-slate-950">
                        Budaya Kerja
                      </h3>
                      <p className="mt-4 leading-8 text-slate-600">
                        {company.culture}
                      </p>
                    </div>
                  )}

                  {company.gallery?.length > 0 && (
                    <div>
                      <div className="mb-5 flex items-end justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">
                            Galeri
                          </p>
                          <h3 className="mt-2 text-2xl font-bold text-slate-950">
                            Suasana Perusahaan
                          </h3>
                        </div>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        {company.gallery.map((image, index) => (
                          <div
                            key={image || index}
                            className="group aspect-[4/3] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm"
                          >
                            <img
                              src={image}
                              alt={`Galeri ${company.name} ${index + 1}`}
                              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "jobs" && (
                <div>
                  <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">
                        Lowongan
                      </p>
                      <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                        Lowongan Kerja Aktif
                      </h2>
                    </div>
                    <span className="w-fit rounded-full bg-primary/5 px-4 py-2 text-sm font-semibold text-primary">
                      {activeJobsCount} posisi tersedia
                    </span>
                  </div>

                  {activeJobsCount === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
                      <Briefcase className="mx-auto mb-4 h-12 w-12 text-slate-300" />
                      <p className="font-semibold text-slate-700">
                        Belum ada lowongan aktif saat ini
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {company.jobs.map((job) => (
                        <Link
                          key={job.id}
                          href={`/jobs/${job.slug}`}
                          className="group block rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-lg hover:shadow-primary/5"
                        >
                          <div className="flex gap-4">
                            <div className="hidden h-12 w-12 flex-none items-center justify-center rounded-xl bg-primary/10 text-primary sm:flex">
                              <Briefcase className="h-5 w-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <h3 className="text-xl font-bold text-slate-950 transition group-hover:text-primary">
                                    {job.title}
                                  </h3>
                                  <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-500">
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1.5">
                                      <MapPin className="h-3.5 w-3.5" />
                                      {job.city || job.location}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1.5">
                                      <Briefcase className="h-3.5 w-3.5" />
                                      {getJobTypeLabel(job.jobType)}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1.5">
                                      <TrendingUp className="h-3.5 w-3.5" />
                                      {getLevelLabel(job.level)}
                                    </span>
                                  </div>
                                </div>
                                <ArrowRight className="mt-1 h-5 w-5 flex-none text-slate-300 transition group-hover:translate-x-1 group-hover:text-primary" />
                              </div>

                              <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                                <p className="font-bold text-primary">
                                  {job.showSalary && job.salaryMin && job.salaryMax
                                    ? formatSalary(
                                        job.salaryMin,
                                        job.salaryMax,
                                        job.salaryType
                                      )
                                    : "Gaji kompetitif"}
                                </p>
                                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-400">
                                  <Clock className="h-4 w-4" />
                                  {getTimeAgo(job.createdAt)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "benefits" && (
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">
                    Fasilitas
                  </p>
                  <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                    Benefits & Fasilitas
                  </h2>
                  {company.benefits?.length > 0 ? (
                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                      {company.benefits.map((benefit) => (
                        <div
                          key={benefit}
                          className="flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4"
                        >
                          <div className="mt-0.5 flex h-7 w-7 flex-none items-center justify-center rounded-full bg-white text-emerald-600">
                            <CheckCircle className="h-4 w-4" />
                          </div>
                          <span className="font-medium leading-7 text-slate-700">
                            {benefit}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
                      <Award className="mx-auto mb-4 h-12 w-12 text-slate-300" />
                      <p className="font-semibold text-slate-700">
                        Informasi benefits belum tersedia
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "reviews" && (
                <div>
                  <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">
                        Ulasan
                      </p>
                      <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                        Reviews & Ratings
                      </h2>
                    </div>
                    <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl font-bold text-slate-950">
                          {ratingValue.toFixed(1)}
                        </span>
                        <div>
                          <div className="flex">
                            {[...Array(5)].map((_, index) => (
                              <Star
                                key={index}
                                className={`h-4 w-4 ${
                                  index < Math.floor(ratingValue)
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-amber-200"
                                }`}
                              />
                            ))}
                          </div>
                          <p className="mt-1 text-xs font-medium text-amber-700">
                            {company._count.reviews} ulasan
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {company.reviews.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
                      <Star className="mx-auto mb-4 h-12 w-12 text-slate-300" />
                      <p className="font-semibold text-slate-700">
                        Belum ada review untuk perusahaan ini
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {company.reviews.map((review) => (
                        <div
                          key={review.id}
                          className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                        >
                          <div className="mb-4 flex items-start gap-4">
                            <div className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-primary text-white font-bold">
                              {review.jobseekers?.firstName?.charAt(0) || "U"}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-3">
                                <h4 className="font-bold text-slate-950">
                                  {review.isAnonymous
                                    ? "Pengguna anonim"
                                    : review.jobseekers?.firstName || "Pengguna"}
                                </h4>
                                <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-sm font-bold text-slate-700">
                                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                  {review.rating}
                                </span>
                              </div>
                              {review.position && (
                                <p className="mt-1 text-sm text-slate-500">
                                  {review.position}
                                </p>
                              )}
                            </div>
                          </div>
                          <h5 className="text-lg font-bold text-slate-950">
                            {review.title}
                          </h5>
                          <p className="mt-2 leading-7 text-slate-600">
                            {review.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </section>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <section className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Building2 className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-950">
                  Detail Perusahaan
                </h3>
              </div>

              <div className="space-y-5">
                {[
                  {
                    icon: Building2,
                    label: "Industri",
                    value: company.industry,
                  },
                  {
                    icon: Users,
                    label: "Ukuran Perusahaan",
                    value: `${company.companySize || "-"} karyawan`,
                  },
                  company.foundedYear && {
                    icon: Calendar,
                    label: "Tahun Didirikan",
                    value: company.foundedYear,
                  },
                  {
                    icon: MapPin,
                    label: "Lokasi Kantor Pusat",
                    value: [company.address, company.city, company.province]
                      .filter(Boolean)
                      .join(", "),
                  },
                ]
                  .filter(Boolean)
                  .map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex gap-3">
                      <div className="mt-1 flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-slate-50 text-primary">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                          {label}
                        </p>
                        <p className="mt-1 break-words font-semibold leading-7 text-slate-900">
                          {value || "Belum dilengkapi"}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </section>

            {(company.email || company.phone || company.website) && (
              <section className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-xl font-bold text-slate-950">Kontak</h3>
                <div className="mt-5 space-y-3">
                  {company.email && (
                    <a
                      href={`mailto:${company.email}`}
                      className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 font-semibold text-slate-700 transition hover:bg-primary/5 hover:text-primary"
                    >
                      <Mail className="h-5 w-5 flex-none text-primary" />
                      <span className="truncate">{company.email}</span>
                    </a>
                  )}
                  {company.phone && (
                    <a
                      href={`tel:${company.phone}`}
                      className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 font-semibold text-slate-700 transition hover:bg-primary/5 hover:text-primary"
                    >
                      <Phone className="h-5 w-5 flex-none text-primary" />
                      <span className="break-all">{company.phone}</span>
                    </a>
                  )}
                  {company.website && (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 font-semibold text-slate-700 transition hover:bg-primary/5 hover:text-primary"
                    >
                      <Globe className="h-5 w-5 flex-none text-primary" />
                      <span className="truncate">Website perusahaan</span>
                    </a>
                  )}
                </div>
              </section>
            )}

            {(company.linkedinUrl ||
              company.facebookUrl ||
              company.twitterUrl ||
              company.instagramUrl) && (
              <section className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-xl font-bold text-slate-950">Media Sosial</h3>
                <div className="mt-5 flex flex-wrap gap-3">
                  {[
                    [company.linkedinUrl, Linkedin, "LinkedIn"],
                    [company.facebookUrl, Facebook, "Facebook"],
                    [company.twitterUrl, Twitter, "Twitter"],
                    [company.instagramUrl, Instagram, "Instagram"],
                  ].map(([url, Icon, label]) =>
                    url ? (
                      <a
                        key={label}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={label}
                        className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-primary/20 hover:bg-primary/5 hover:text-primary"
                      >
                        <Icon className="h-5 w-5" />
                      </a>
                    ) : null
                  )}
                </div>
              </section>
            )}

            {company.averageRatings && (
              <section className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
                    <Star className="h-5 w-5 fill-current" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-950">
                    Rating Breakdown
                  </h3>
                </div>

                <div className="space-y-4">
                  {[
                    ["Work-Life Balance", company.averageRatings.workLifeBalance],
                    ["Compensation", company.averageRatings.compensation],
                    ["Career Growth", company.averageRatings.careerGrowth],
                    ["Management", company.averageRatings.management],
                    ["Culture", company.averageRatings.culture],
                  ].map(([label, value]) => {
                    const numericValue = Number(value || 0);
                    return (
                      <div key={label}>
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span className="font-medium text-slate-600">
                            {label}
                          </span>
                          <span className="font-bold text-slate-950">
                            {numericValue.toFixed(1)}
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-amber-400"
                            style={{ width: `${(numericValue / 5) * 100}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}
