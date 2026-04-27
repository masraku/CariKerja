"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  Building2,
  CheckCircle,
  Filter,
  Heart,
  MapPin,
  Search,
  SlidersHorizontal,
  Star,
  Users,
  X,
} from "lucide-react";
import { useQueryCompanies } from "@/hooks/companies/useCompanies";

const companySizes = [
  "all",
  "1-10",
  "11-50",
  "51-200",
  "201-500",
  "501-1000",
  "1000+",
];

const CompaniesPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [followedCompanies, setFollowedCompanies] = useState([]);
  const [selectedIndustry, setSelectedIndustry] = useState("all");
  const [selectedSize, setSelectedSize] = useState("all");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: companiesData, isPending: loading } = useQueryCompanies({
    search: debouncedSearch,
    industry: selectedIndustry,
    size: selectedSize,
  });

  const companies = companiesData?.companies || [];
  const industries = companiesData?.industries || ["all"];

  useEffect(() => {
    const saved = localStorage.getItem("followedCompanies");
    if (saved) setFollowedCompanies(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "followedCompanies",
      JSON.stringify(followedCompanies)
    );
  }, [followedCompanies]);

  const totalActiveJobs = useMemo(
    () => companies.reduce((sum, company) => sum + (company.activeJobs || 0), 0),
    [companies]
  );

  const hasFilters =
    searchQuery.trim() || selectedIndustry !== "all" || selectedSize !== "all";

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedIndustry("all");
    setSelectedSize("all");
  };

  const toggleFollow = (companyId) => {
    setFollowedCompanies((prev) =>
      prev.includes(companyId)
        ? prev.filter((id) => id !== companyId)
        : [...prev, companyId]
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden bg-slate-950 pt-32 text-white lg:pt-36">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(14,116,144,0.45),transparent_34%),linear-gradient(135deg,#012b3d_0%,#03587f_48%,#023952_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-slate-50 to-transparent" />
        <div className="absolute right-10 top-24 hidden h-72 w-72 rounded-full bg-cyan-300/10 blur-3xl lg:block" />

        <div className="container relative z-10 mx-auto grid gap-10 px-4 pb-24 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-blue-100 backdrop-blur">
              <CheckCircle className="h-4 w-4" />
              Direktori perusahaan terverifikasi
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Temukan perusahaan yang tepat sebelum melamar.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-blue-100 sm:text-lg">
              Lihat profil perusahaan, lokasi, jumlah karyawan, dan lowongan
              aktif dalam satu halaman yang lebih mudah dipindai.
            </p>

            <div className="mt-8 max-w-2xl rounded-2xl border border-white/15 bg-white/10 p-2 shadow-2xl shadow-slate-950/20 backdrop-blur-md">
              <div className="relative flex items-center rounded-xl bg-white">
                <Search className="absolute left-4 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari perusahaan, industri, atau kata kunci..."
                  className="h-14 w-full rounded-xl border-0 bg-transparent pl-12 pr-12 text-base text-slate-900 placeholder:text-slate-400 focus:ring-0"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    aria-label="Hapus pencarian"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid content-end gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {[
              {
                label: "Perusahaan",
                value: companies.length,
                helper: "terverifikasi",
                icon: Building2,
              },
              {
                label: "Lowongan",
                value: totalActiveJobs,
                helper: "aktif saat ini",
                icon: Briefcase,
              },
              {
                label: "Industri",
                value: Math.max(industries.length - 1, 0),
                helper: "kategori",
                icon: SlidersHorizontal,
              },
            ].map(({ label, value, helper, icon: Icon }) => (
              <div
                key={label}
                className="rounded-2xl border border-white/12 bg-white/10 p-5 shadow-lg shadow-slate-950/10 backdrop-blur-md"
              >
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-blue-100">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="text-3xl font-bold tracking-tight">{value}</div>
                <div className="mt-1 text-sm font-medium text-blue-100">
                  {label} {helper}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <main className="container mx-auto -mt-12 px-4 pb-16 sm:px-6 lg:px-8">
        <div className="relative z-20 rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-[0_24px_80px_rgba(15,23,42,0.08)] md:p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-3 text-slate-800">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Filter className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">Filter perusahaan</p>
                <p className="text-sm text-slate-500">
                  Saring berdasarkan industri dan ukuran tim.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row xl:items-center">
              <select
                value={selectedIndustry}
                onChange={(event) => setSelectedIndustry(event.target.value)}
                className="h-12 min-w-[190px] rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700 transition hover:bg-white focus:border-primary focus:ring-2 focus:ring-primary/15"
              >
                <option value="all">Semua Industri</option>
                {industries
                  .filter((industry) => industry !== "all")
                  .map((industry) => (
                    <option key={industry} value={industry}>
                      {industry}
                    </option>
                  ))}
              </select>

              <select
                value={selectedSize}
                onChange={(event) => setSelectedSize(event.target.value)}
                className="h-12 min-w-[180px] rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700 transition hover:bg-white focus:border-primary focus:ring-2 focus:ring-primary/15"
              >
                <option value="all">Semua Ukuran</option>
                {companySizes
                  .filter((size) => size !== "all")
                  .map((size) => (
                    <option key={size} value={size}>
                      {size} karyawan
                    </option>
                  ))}
              </select>

              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                >
                  <X className="h-4 w-4" />
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="mb-6 mt-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">
              Hasil Pencarian
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 md:text-3xl">
              {loading ? "Memuat perusahaan..." : `${companies.length} perusahaan ditemukan`}
            </h2>
          </div>
          {hasFilters && (
            <div className="flex flex-wrap gap-2 text-sm">
              {searchQuery.trim() && (
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-slate-600">
                  {searchQuery.trim()}
                </span>
              )}
              {selectedIndustry !== "all" && (
                <span className="rounded-full border border-primary/15 bg-primary/5 px-3 py-1.5 text-primary">
                  {selectedIndustry}
                </span>
              )}
              {selectedSize !== "all" && (
                <span className="rounded-full border border-primary/15 bg-primary/5 px-3 py-1.5 text-primary">
                  {selectedSize} karyawan
                </span>
              )}
            </div>
          )}
        </div>

        {loading ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="animate-pulse">
                  <div className="mb-6 h-24 rounded-2xl bg-slate-100" />
                  <div className="mb-5 h-6 w-2/3 rounded bg-slate-100" />
                  <div className="mb-8 h-4 w-full rounded bg-slate-100" />
                  <div className="space-y-3">
                    <div className="h-10 rounded-xl bg-slate-100" />
                    <div className="h-10 rounded-xl bg-slate-100" />
                    <div className="h-12 rounded-xl bg-slate-100" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : companies.length === 0 ? (
          <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm md:p-16">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-50 text-slate-300">
              <Building2 className="h-10 w-10" />
            </div>
            <h3 className="text-2xl font-bold text-slate-950">
              Perusahaan tidak ditemukan
            </h3>
            <p className="mx-auto mt-3 max-w-md leading-7 text-slate-500">
              Coba gunakan kata kunci lain atau kosongkan filter agar daftar
              perusahaan tampil kembali.
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="mt-8 inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-hover"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {companies.map((company) => {
              const isFollowed = followedCompanies.includes(company.id);

              return (
                <article
                  key={company.id}
                  className="group relative overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-xl hover:shadow-primary/10"
                >
                  <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-br from-primary/12 via-blue-50 to-slate-50" />
                  <div className="relative p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-slate-100 bg-white p-3 shadow-lg shadow-slate-200/70">
                        {company.logo ? (
                          <img
                            src={company.logo}
                            alt={company.name}
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <Building2 className="h-10 w-10 text-slate-300" />
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        {company.verified && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-white/90 px-3 py-1 text-xs font-semibold text-primary shadow-sm">
                            <CheckCircle className="h-3.5 w-3.5" />
                            Verified
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => toggleFollow(company.id)}
                          className={`flex h-10 w-10 items-center justify-center rounded-full border bg-white shadow-sm transition ${
                            isFollowed
                              ? "border-red-100 text-red-500"
                              : "border-slate-200 text-slate-400 hover:border-red-100 hover:text-red-500"
                          }`}
                          aria-label={
                            isFollowed
                              ? "Berhenti ikuti perusahaan"
                              : "Ikuti perusahaan"
                          }
                        >
                          <Heart
                            className={`h-5 w-5 ${isFollowed ? "fill-current" : ""}`}
                          />
                        </button>
                      </div>
                    </div>

                    <div className="mt-6">
                      <h3 className="line-clamp-2 text-2xl font-bold tracking-tight text-slate-950 transition group-hover:text-primary">
                        {company.name}
                      </h3>
                      <p className="mt-3 line-clamp-2 min-h-[3rem] text-sm leading-6 text-slate-500">
                        {company.tagline ||
                          "Perusahaan terverifikasi yang membuka peluang karir untuk talenta lokal."}
                      </p>
                    </div>

                    {company.industry && company.industry !== "Belum dilengkapi" && (
                      <div className="mt-5">
                        <span className="inline-flex rounded-full border border-primary/15 bg-primary/5 px-3 py-1.5 text-sm font-semibold text-primary">
                          {company.industry}
                        </span>
                      </div>
                    )}

                    <div className="mt-6 grid gap-3 text-sm text-slate-600">
                      <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
                        <MapPin className="h-5 w-5 flex-none text-slate-400" />
                        <span className="truncate font-medium">
                          {company.location || "Lokasi belum tersedia"}
                        </span>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
                          <Users className="h-5 w-5 flex-none text-slate-400" />
                          <span className="truncate font-medium">
                            {company.companySize} karyawan
                          </span>
                        </div>
                        <div className="flex items-center gap-3 rounded-2xl bg-primary/5 p-3 text-primary">
                          <Briefcase className="h-5 w-5 flex-none" />
                          <span className="truncate font-bold">
                            {company.activeJobs} lowongan
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-100 pt-5">
                      {company.rating > 0 ? (
                        <div className="flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-700">
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                          {company.rating} ({company.reviews})
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400">Belum ada ulasan</span>
                      )}

                      <Link
                        href={`/companies/${company.slug}`}
                        className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary"
                      >
                        Lihat Profil
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default CompaniesPage;
