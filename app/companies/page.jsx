"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  MapPin,
  Briefcase,
  Users,
  CheckCircle,
  Heart,
  HeartOff,
  Filter,
  Building2,
  Star,
  ArrowRight,
  Globe,
  Calendar,
} from "lucide-react";

const CompaniesPage = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [followedCompanies, setFollowedCompanies] = useState([]);
  const [selectedIndustry, setSelectedIndustry] = useState("all");
  const [selectedSize, setSelectedSize] = useState("all");
  const [industries, setIndustries] = useState(["all"]);
  const companySizes = [
    "all",
    "1-10",
    "11-50",
    "51-200",
    "201-500",
    "501-1000",
    "1000+",
  ];

  useEffect(() => {
    loadCompanies();
  }, [selectedIndustry, selectedSize]);
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery || searchQuery === "") loadCompanies();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

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

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (selectedIndustry !== "all")
        params.append("industry", selectedIndustry);
      if (selectedSize !== "all") params.append("size", selectedSize);

      const response = await fetch(`/api/companies?${params.toString()}`);
      const data = await response.json();
      if (response.ok) {
        setCompanies(data.companies);
        const uniqueIndustries = [
          "all",
          ...new Set(
            data.companies
              .map((c) => c.industry)
              .filter((i) => i && i !== "Belum dilengkapi")
          ),
        ];
        setIndustries(uniqueIndustries);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const toggleFollow = (companyId) => {
    setFollowedCompanies((prev) =>
      prev.includes(companyId)
        ? prev.filter((id) => id !== companyId)
        : [...prev, companyId]
    );
  };

  const totalActiveJobs = companies.reduce((sum, c) => sum + c.activeJobs, 0);
  const hasFilters = selectedIndustry !== "all" || selectedSize !== "all";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-[#03587f] overflow-hidden px-4 lg:px-8 py-16 lg:py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-[#03587f] to-indigo-900 opacity-90" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')] bg-cover bg-center mix-blend-overlay opacity-20" />

        <div className="relative max-w-5xl mx-auto text-center z-10">
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            Jelajahi Perusahaan Terbaik
          </h1>
          <p className="text-blue-100 text-lg lg:text-xl mb-10 max-w-2xl mx-auto">
            Temukan perusahaan impianmu dan bergabunglah dengan tim luar biasa
            yang sedang membangun masa depan.
          </p>

          {/* Search Box */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2 lg:p-3 shadow-2xl border border-white/20 max-w-2xl mx-auto">
            <div className="relative bg-white rounded-xl overflow-hidden flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari nama perusahaan atau industri..."
                className="w-full pl-12 pr-4 py-4 bg-transparent border-0 focus:ring-0 text-gray-900 placeholder-gray-400 text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex justify-center gap-8 lg:gap-16 mt-12">
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-white mb-1">
                {companies.length}
              </div>
              <div className="text-sm text-blue-200 font-medium uppercase tracking-wider">
                Perusahaan
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-emerald-400 mb-1">
                {totalActiveJobs}
              </div>
              <div className="text-sm text-blue-200 font-medium uppercase tracking-wider">
                Lowongan Aktif
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12 -mt-8 relative z-20">
        {/* Filter Bar */}
        <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-4 mb-8">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-gray-700 font-bold px-2">
              <Filter className="w-5 h-5 text-blue-600" />
              <span>Filter:</span>
            </div>

            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer hover:bg-white"
            >
              <option value="all">Semua Industri</option>
              {industries
                .filter((i) => i !== "all")
                .map((ind) => (
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
            </select>

            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer hover:bg-white"
            >
              <option value="all">Semua Ukuran</option>
              {companySizes
                .filter((s) => s !== "all")
                .map((size) => (
                  <option key={size} value={size}>
                    {size} karyawan
                  </option>
                ))}
            </select>

            {hasFilters && (
              <button
                onClick={() => {
                  setSelectedIndustry("all");
                  setSelectedSize("all");
                }}
                className="ml-auto text-sm text-red-600 hover:text-red-700 font-medium px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-gray-500">
            Menampilkan{" "}
            <span className="font-bold text-gray-900">{companies.length}</span>{" "}
            perusahaan
          </p>
        </div>

        {/* Loading Skeleton */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse"
              >
                <div className="h-28 bg-gray-200"></div>
                <div className="p-6 pt-0 relative">
                  <div className="w-20 h-20 bg-gray-300 rounded-2xl -mt-10 mb-4 border-4 border-white"></div>
                  <div className="h-5 bg-gray-200 rounded w-2/3 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
                  <div className="space-y-3 mb-6">
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                  <div className="h-12 bg-gray-200 rounded-xl"></div>
                </div>
              </div>
            ))}
          </div>
        ) : companies.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Building2 className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Tidak ada perusahaan ditemukan
            </h3>
            <p className="text-gray-500 mb-8">
              Coba ubah filter pencarian Anda untuk menemukan hasil yang lebih
              baik
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedIndustry("all");
                setSelectedSize("all");
              }}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((company) => (
              <div
                key={company.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-blue-500/5 hover:border-blue-200 transition-all duration-300 group flex flex-col h-full"
              >
                {/* Card Header */}
                <div className="h-28 bg-gradient-to-r from-gray-800 to-gray-700 relative overflow-hidden">
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                  {/* Verified Badge */}
                  {company.verified && (
                    <div className="absolute top-3 right-3 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full flex items-center gap-1.5 text-white text-xs font-medium border border-white/20 shadow-sm">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Verified</span>
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-6 pt-0 flex-1 flex flex-col relative">
                  {/* Logo */}
                  <div className="w-20 h-20 bg-white rounded-2xl shadow-lg border-4 border-white flex items-center justify-center overflow-hidden -mt-10 mb-4 relative z-10 group-hover:scale-105 transition-transform duration-300">
                    {company.logo ? (
                      <img
                        src={company.logo}
                        alt={company.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Building2 className="w-10 h-10 text-gray-300" />
                    )}
                  </div>

                  <div className="mb-1">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                      {company.name}
                    </h3>
                    {company.tagline && (
                      <p className="text-sm text-gray-500 truncate mt-1">
                        {company.tagline}
                      </p>
                    )}
                  </div>

                  {/* Industry Badge */}
                  {company.industry &&
                    company.industry !== "Belum dilengkapi" && (
                      <div className="mb-4 mt-2">
                        <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-lg border border-blue-100">
                          {company.industry}
                        </span>
                      </div>
                    )}

                  {/* Info */}
                  <div className="space-y-3 mb-6 flex-1">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0 text-gray-400">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <span className="truncate font-medium">
                        {company.location}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0 text-gray-400">
                        <Users className="w-4 h-4" />
                      </div>
                      <span className="font-medium">
                        {company.companySize} karyawan
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 text-blue-500">
                        <Briefcase className="w-4 h-4" />
                      </div>
                      <span className="text-blue-600 font-bold">
                        {company.activeJobs} lowongan aktif
                      </span>
                    </div>
                  </div>

                  {/* Rating */}
                  {company.rating > 0 && (
                    <div className="flex items-center gap-2 mb-6 bg-amber-50 p-2 rounded-lg w-fit">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < Math.floor(company.rating)
                                ? "text-amber-400 fill-amber-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs font-bold text-amber-700">
                        {company.rating}{" "}
                        <span className="font-normal text-amber-600">
                          ({company.reviews})
                        </span>
                      </span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 mt-auto">
                    <Link
                      href={`/companies/${company.slug}`}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 hover:bg-blue-600 text-white text-sm font-bold rounded-xl transition-all duration-300 shadow-lg shadow-gray-900/10 hover:shadow-blue-600/20"
                    >
                      Lihat Profil
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => toggleFollow(company.id)}
                      className={`p-3 rounded-xl transition-all duration-300 border ${
                        followedCompanies.includes(company.id)
                          ? "bg-pink-50 text-pink-500 border-pink-200 hover:bg-pink-100"
                          : "bg-white text-gray-400 border-gray-200 hover:border-pink-200 hover:text-pink-500"
                      }`}
                    >
                      {followedCompanies.includes(company.id) ? (
                        <Heart className="w-5 h-5 fill-current" />
                      ) : (
                        <Heart className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompaniesPage;
