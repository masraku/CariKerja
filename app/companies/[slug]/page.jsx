"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  MapPin,
  Users,
  Briefcase,
  Globe,
  Mail,
  Phone,
  Star,
  CheckCircle,
  Calendar,
  TrendingUp,
  Award,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  ArrowLeft,
  ExternalLink,
  Share2,
  Flag,
} from "lucide-react";

export default function CompanyProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState(null);
  const [activeTab, setActiveTab] = useState("about");

  useEffect(() => {
    if (params?.slug) {
      loadCompanyProfile();
    }
  }, [params?.slug]);

  const loadCompanyProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/companies/${params.slug}`);

      if (response.ok) {
        const data = await response.json();
        setCompany(data.company);
      } else {
        router.push("/companies");
      }
    } catch (error) {
      console.error("Load company error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getJobTypeLabel = (type) => {
    const labels = {
      FULL_TIME: "Full Time",
      PART_TIME: "Part Time",
      CONTRACT: "Contract",
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
    if (!min || !max) return "Negotiable";

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
    if (interval > 1) return Math.floor(interval) + " tahun lalu";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " bulan lalu";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " hari lalu";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " jam lalu";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " menit lalu";
    return "Baru saja";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 border-r-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">
            Memuat profil perusahaan...
          </p>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md px-4">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Building2 className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Perusahaan Tidak Ditemukan
          </h2>
          <p className="text-gray-600 mb-8">
            Perusahaan yang Anda cari mungkin telah dihapus atau tautan yang
            Anda gunakan salah.
          </p>
          <Link
            href="/companies"
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Daftar Perusahaan
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Hero Banner */}
      <div className="relative h-64 lg:h-80 bg-blue-600 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-900 opacity-90" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')] bg-cover bg-center mix-blend-overlay opacity-20" />

        <div className="absolute top-6 left-4 lg:left-8 z-10">
          <Link
            href="/companies"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-xl transition-all text-sm font-medium border border-white/20"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 relative z-10 -mt-32 pb-12">
        {/* Company Header Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-6 lg:p-8 mb-8">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Logo */}
            <div className="w-32 h-32 lg:w-40 lg:h-40 bg-white rounded-2xl shadow-lg border-4 border-white overflow-hidden flex-shrink-0 relative z-10">
              {company.logo ? (
                <img
                  src={company.logo}
                  alt={company.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                  <Building2 className="w-16 h-16 text-gray-300" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 pt-2">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                    {company.name}
                    {company.verified && (
                      <CheckCircle className="w-6 h-6 text-blue-500 fill-blue-50" />
                    )}
                  </h1>
                  {company.tagline && (
                    <p className="text-lg text-gray-500">{company.tagline}</p>
                  )}
                </div>
                <div className="flex gap-3">
                  <button className="p-2.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-gray-200 hover:border-blue-200">
                    <Share2 className="w-5 h-5" />
                  </button>
                  <button className="p-2.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-gray-200 hover:border-red-200">
                    <Flag className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-y-3 gap-x-6 text-sm text-gray-600 mb-6">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-gray-400" />
                  <span>{company.industry}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span>{company.companySize} karyawan</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>
                    {company.city}, {company.province}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-blue-500" />
                  <span className="font-medium text-blue-600">
                    {company._count.jobs} lowongan aktif
                  </span>
                </div>
                {company.averageRatings && (
                  <div className="flex items-center gap-2 px-2 py-0.5 bg-amber-50 rounded-lg border border-amber-100">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="font-bold text-amber-700">
                      {company.averageRatings.overall}
                    </span>
                    <span className="text-amber-600">
                      ({company._count.reviews} reviews)
                    </span>
                  </div>
                )}
              </div>

              {/* Social Links */}
              <div className="flex flex-wrap gap-3">
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/10"
                  >
                    <Globe className="w-4 h-4" />
                    Website
                    <ExternalLink className="w-3 h-3 opacity-50" />
                  </a>
                )}
                {company.linkedinUrl && (
                  <a
                    href={company.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-[#0077b5] hover:text-white transition-all"
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                )}
                {company.facebookUrl && (
                  <a
                    href={company.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-[#1877f2] hover:text-white transition-all"
                  >
                    <Facebook className="w-5 h-5" />
                  </a>
                )}
                {company.twitterUrl && (
                  <a
                    href={company.twitterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-black hover:text-white transition-all"
                  >
                    <Twitter className="w-5 h-5" />
                  </a>
                )}
                {company.instagramUrl && (
                  <a
                    href={company.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-pink-600 hover:text-white transition-all"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Tabs */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 sticky top-4 z-30">
              <div className="flex overflow-x-auto no-scrollbar gap-2">
                {[
                  { id: "about", label: "Tentang", icon: Building2 },
                  {
                    id: "jobs",
                    label: `Lowongan (${company.jobs.length})`,
                    icon: Briefcase,
                  },
                  { id: "benefits", label: "Benefits", icon: Award },
                  {
                    id: "reviews",
                    label: `Reviews (${company._count.reviews})`,
                    icon: Star,
                  },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap flex-1 justify-center ${
                      activeTab === tab.id
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8 min-h-[400px]">
              {activeTab === "about" && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                      Tentang Perusahaan
                    </h2>
                    <div className="prose prose-blue max-w-none text-gray-600 leading-relaxed whitespace-pre-line break-words">
                      {company.bio ||
                        company.description ||
                        "Belum ada deskripsi perusahaan."}
                    </div>
                  </div>

                  {company.culture && (
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-4">
                        Budaya Kerja
                      </h2>
                      <div className="prose prose-blue max-w-none text-gray-600 leading-relaxed break-words">
                        {company.culture}
                      </div>
                    </div>
                  )}

                  {company.gallery?.length > 0 && (
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-4">
                        Galeri
                      </h2>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {company.gallery.map((image, index) => (
                          <div
                            key={index}
                            className="aspect-video rounded-xl overflow-hidden shadow-sm border border-gray-100 group"
                          >
                            <img
                              src={image}
                              alt={`Gallery ${index + 1}`}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "jobs" && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">
                    Lowongan Kerja Aktif
                  </h2>
                  {company.jobs.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                      <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">
                        Belum ada lowongan aktif saat ini
                      </p>
                    </div>
                  ) : (
                    company.jobs.map((job) => (
                      <Link
                        key={job.id}
                        href={`/jobs/${job.slug}`}
                        className="block p-5 border border-gray-100 rounded-xl hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/5 transition-all group bg-white"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-blue-600 transition-colors">
                              {job.title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                              <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-lg">
                                <MapPin className="w-3.5 h-3.5" />
                                {job.city}
                              </div>
                              <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-lg">
                                <Briefcase className="w-3.5 h-3.5" />
                                {getJobTypeLabel(job.jobType)}
                              </div>
                              <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-lg">
                                <TrendingUp className="w-3.5 h-3.5" />
                                {getLevelLabel(job.level)}
                              </div>
                            </div>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                            <ArrowLeft className="w-4 h-4 rotate-180" />
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-4">
                          {job.showSalary && job.salaryMin && job.salaryMax ? (
                            <p className="text-blue-600 font-bold text-sm">
                              {formatSalary(
                                job.salaryMin,
                                job.salaryMax,
                                job.salaryType
                              )}
                            </p>
                          ) : (
                            <p className="text-blue-600 font-bold text-sm">
                              Gaji Kompetitif
                            </p>
                          )}
                          <span className="text-xs text-gray-400 font-medium">
                            Posted {getTimeAgo(job.createdAt)}
                          </span>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              )}

              {activeTab === "benefits" && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-6">
                    Benefits & Fasilitas
                  </h2>
                  {company.benefits?.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-4">
                      {company.benefits.map((benefit, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 p-4 bg-green-50/50 border border-green-100 rounded-xl"
                        >
                          <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                          </div>
                          <span className="text-gray-700 font-medium">
                            {benefit}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                      <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">
                        Informasi benefits belum tersedia
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "reviews" && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">
                      Reviews & Ratings
                    </h2>
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-bold text-gray-900">
                        {company.averageRatings?.overall || 0}
                      </span>
                      <div className="flex flex-col">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i <
                                Math.floor(company.averageRatings?.overall || 0)
                                  ? "text-amber-400 fill-amber-400"
                                  : "text-gray-200"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">
                          {company._count.reviews} reviews
                        </span>
                      </div>
                    </div>
                  </div>

                  {company.reviews.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                      <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">
                        Belum ada review untuk perusahaan ini
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {company.reviews.map((review) => (
                        <div
                          key={review.id}
                          className="p-6 border border-gray-100 rounded-2xl bg-gray-50/50"
                        >
                          <div className="flex items-start gap-4 mb-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                              {review.jobseeker?.firstName?.charAt(0) || "U"}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="font-bold text-gray-900">
                                  {review.isAnonymous
                                    ? "Anonymous User"
                                    : review.jobseeker?.firstName}
                                </h4>
                                <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-gray-200 shadow-sm">
                                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                  <span className="font-bold text-sm text-gray-700">
                                    {review.rating}
                                  </span>
                                </div>
                              </div>
                              {review.position && (
                                <p className="text-sm text-gray-500">
                                  {review.position}
                                </p>
                              )}
                            </div>
                          </div>

                          <h5 className="font-bold text-gray-900 mb-2 text-lg">
                            {review.title}
                          </h5>
                          <p className="text-gray-600 leading-relaxed">
                            {review.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Company Details Widget */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2 pb-4 border-b border-gray-100">
                <Building2 className="w-5 h-5 text-blue-600" />
                Detail Perusahaan
              </h3>

              <div className="space-y-5 text-sm">
                <div>
                  <p className="text-gray-500 mb-1 text-xs uppercase tracking-wider font-medium">
                    Industri
                  </p>
                  <p className="font-semibold text-gray-900 text-base">
                    {company.industry}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500 mb-1 text-xs uppercase tracking-wider font-medium">
                    Ukuran Perusahaan
                  </p>
                  <p className="font-semibold text-gray-900 text-base">
                    {company.companySize} karyawan
                  </p>
                </div>

                {company.foundedYear && (
                  <div>
                    <p className="text-gray-500 mb-1 text-xs uppercase tracking-wider font-medium">
                      Tahun Didirikan
                    </p>
                    <p className="font-semibold text-gray-900 text-base">
                      {company.foundedYear}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-gray-500 mb-1 text-xs uppercase tracking-wider font-medium">
                    Lokasi Kantor Pusat
                  </p>
                  <p className="font-semibold text-gray-900 text-base leading-relaxed">
                    {company.address}
                    <br />
                    {company.city}, {company.province}
                  </p>
                </div>

                {company.email && (
                  <div>
                    <p className="text-gray-500 mb-1 text-xs uppercase tracking-wider font-medium">
                      Email Kontak
                    </p>
                    <a
                      href={`mailto:${company.email}`}
                      className="font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-2 transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      {company.email}
                    </a>
                  </div>
                )}

                {company.phone && (
                  <div>
                    <p className="text-gray-500 mb-1 text-xs uppercase tracking-wider font-medium">
                      Nomor Telepon
                    </p>
                    <a
                      href={`tel:${company.phone}`}
                      className="font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-2 transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                      {company.phone}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Rating Widget */}
            {company.averageRatings && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2 pb-4 border-b border-gray-100">
                  <Star className="w-5 h-5 text-amber-400" />
                  Rating Breakdown
                </h3>

                <div className="space-y-4">
                  {[
                    {
                      label: "Work-Life Balance",
                      value: company.averageRatings.workLifeBalance,
                    },
                    {
                      label: "Compensation",
                      value: company.averageRatings.compensation,
                    },
                    {
                      label: "Career Growth",
                      value: company.averageRatings.careerGrowth,
                    },
                    {
                      label: "Management",
                      value: company.averageRatings.management,
                    },
                    { label: "Culture", value: company.averageRatings.culture },
                  ].map((item, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between text-sm mb-1.5">
                        <span className="text-gray-600 font-medium">
                          {item.label}
                        </span>
                        <span className="font-bold text-gray-900">
                          {item.value}
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-amber-300 to-amber-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${(item.value / 5) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
