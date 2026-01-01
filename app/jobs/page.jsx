"use client";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import {
  Search,
  MapPin,
  Briefcase,
  Building2,
  Filter,
  X,
  Bookmark,
  BookmarkCheck,
  Calendar,
  Users,
  ChevronLeft,
  ChevronRight,
  Banknote,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Clock,
  Globe,
  ImageIcon,
  CalendarDays,
  Coffee,
  Heart,
  XCircle,
  Accessibility,
  Loader2,
} from "lucide-react";

import { useRouter, useSearchParams } from "next/navigation";

const JobsPage = () => {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );
  const [location, setLocation] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [savedJobs, setSavedJobs] = useState([]);
  const [sortBy, setSortBy] = useState("latest");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showDetail, setShowDetail] = useState(false); // Mobile detail view toggle
  const [selectedImage, setSelectedImage] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 0,
  });

  const [filters, setFilters] = useState({
    jobType: [],
    experience: [],
    salary: "",
    category: [],
  });

  const jobTypes = ["FULL_TIME", "PART_TIME"];
  const experienceLevels = ["0-1 tahun", "1-3 tahun", "3-5 tahun", "5+ tahun"];

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (location) params.append("location", location);
      if (filters.jobType.length > 0)
        params.append("jobType", filters.jobType.join(","));
      if (filters.experience.length > 0)
        params.append("experience", filters.experience.join(","));
      if (sortBy) params.append("sortBy", sortBy);
      params.append("page", currentPage.toString());
      params.append("limit", "20");

      const response = await fetch(`/api/jobs?${params.toString()}`, {
        credentials: "include",
      });
      const data = await response.json();
      if (data.success) {
        setJobs(data.data);
        setPagination(data.pagination);
        // Auto-select first job on desktop
        if (data.data.length > 0 && !selectedJob && window.innerWidth >= 1024) {
          setSelectedJob(data.data[0]);
        }
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [searchQuery, location, filters, sortBy, currentPage]);
  useEffect(() => {
    const saved = localStorage.getItem("savedJobs");
    if (saved) setSavedJobs(JSON.parse(saved));
  }, []);
  useEffect(() => {
    localStorage.setItem("savedJobs", JSON.stringify(savedJobs));
  }, [savedJobs]);

  const handleFilterChange = (type, value) => {
    setFilters((prev) => {
      const currentValues = prev[type];
      if (Array.isArray(currentValues)) {
        return currentValues.includes(value)
          ? { ...prev, [type]: currentValues.filter((v) => v !== value) }
          : { ...prev, [type]: [...currentValues, value] };
      }
      return { ...prev, [type]: value };
    });
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({ jobType: [], experience: [], salary: "", category: [] });
    setSearchQuery("");
    setLocation("");
    setCurrentPage(1);
  };

  const toggleSaveJob = (jobId, e) => {
    e?.stopPropagation();
    e?.preventDefault();
    setSavedJobs((prev) =>
      prev.includes(jobId)
        ? prev.filter((id) => id !== jobId)
        : [...prev, jobId]
    );
  };

  const selectJob = (job) => {
    setSelectedJob(job);
    if (window.innerWidth < 1024) {
      setShowDetail(true);
    }
  };

  const getTimeSince = (date) => {
    const days = Math.floor(
      (new Date() - new Date(date)) / (1000 * 60 * 60 * 24)
    );
    if (days === 0) return "Hari ini";
    if (days === 1) return "Kemarin";
    return `${days} hari lalu`;
  };

  const formatJobType = (type) => {
    const map = { FULL_TIME: "Full Time", PART_TIME: "Part Time" };
    return map[type] || type;
  };

  const formatSalary = (min, max) => {
    const format = (num) => {
      if (!num) return null;
      if (num >= 1000000) return `${(num / 1000000).toFixed(0)} jt`;
      if (num >= 1000) return `${(num / 1000).toFixed(0)} rb`;
      return num;
    };
    if (min && max) return `Rp ${format(min)} - ${format(max)}`;
    if (min) return `Rp ${format(min)}+`;
    return "Nego";
  };

  const getJobTypeBadgeClass = (type) => {
    const classes = {
      FULL_TIME: "bg-blue-50 text-blue-700 border-blue-100",
      PART_TIME: "bg-purple-50 text-purple-700 border-purple-100",
    };
    return classes[type] || "bg-slate-50 text-slate-700 border-slate-100";
  };

  const activeFiltersCount = filters.jobType.length + filters.experience.length;

  // Job Card Component
  const JobCard = ({ job, isSelected }) => (
    <div
      onClick={() => selectJob(job)}
      className={`bg-white rounded-2xl p-5 cursor-pointer transition-all duration-300 border ${
        isSelected
          ? "border-blue-500 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500"
          : "border-slate-100 hover:border-blue-200 hover:shadow-md"
      }`}
    >
      <div className="flex gap-4">
        <div className="w-14 h-14 rounded-xl bg-slate-50 flex items-center justify-center overflow-hidden flex-shrink-0 border border-slate-100 relative">
          {job.logo?.startsWith("http") ? (
            <img
              src={job.logo}
              alt={job.company}
              className="w-full h-full object-cover"
            />
          ) : (
            <Building2 className="w-7 h-7 text-slate-400" />
          )}
          {/* Disability Badge for Card */}
          {job.isDisabilityFriendly && (
            <div
              className="absolute -bottom-1 -right-1 bg-green-600 text-white p-0.5 rounded-full border-2 border-white"
              title="Ramah Difabel"
            >
              <Accessibility className="w-3 h-3" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-slate-900 text-base truncate mb-1">
            {job.title}
          </h3>
          <div className="flex items-center gap-1.5 text-slate-600 text-sm mb-2">
            <span className="truncate font-medium">{job.company}</span>
            {job.companyVerified && (
              <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md">
              <MapPin className="w-3 h-3" />
              {job.location}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {getTimeSince(job.postedDate)}
            </span>
            {job.hasApplied && (
              <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-0.5 rounded-md font-medium border border-green-100">
                <CheckCircle className="w-3 h-3" />
                Dilamar
              </span>
            )}
          </div>
        </div>
        <button
          onClick={(e) => toggleSaveJob(job.id, e)}
          className={`p-2 rounded-xl transition-all flex-shrink-0 h-fit ${
            savedJobs.includes(job.id)
              ? "text-blue-600 bg-blue-50"
              : "text-slate-300 hover:text-slate-500 hover:bg-slate-50"
          }`}
        >
          {savedJobs.includes(job.id) ? (
            <BookmarkCheck className="w-5 h-5" />
          ) : (
            <Bookmark className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );

  // Job Detail Component
  const JobDetail = ({ job }) => (
    <div className="h-full overflow-y-auto custom-scrollbar relative">
      {/* Header */}
      <div className="p-6 lg:p-8 border-b border-slate-100 bg-white">
        {/* Mobile Back Button */}
        <button
          onClick={() => setShowDetail(false)}
          className="lg:hidden flex items-center gap-2 text-slate-600 mb-6 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Kembali ke daftar</span>
        </button>

        <div className="flex items-start gap-6">
          <div className="w-20 h-20 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0 p-2">
            {job.logo?.startsWith("http") ? (
              <img
                src={job.logo}
                alt={job.company}
                className="w-full h-full object-contain"
              />
            ) : (
              <Building2 className="w-10 h-10 text-slate-300" />
            )}
          </div>
          <div className="flex-1 min-w-0 pt-1">
            <h1 className="text-2xl font-bold text-slate-900 leading-tight mb-2">
              {job.title}
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-slate-600 font-medium">{job.company}</span>
              {job.companyVerified && (
                <CheckCircle className="w-5 h-5 text-blue-500" />
              )}
            </div>
          </div>
          <button
            onClick={(e) => toggleSaveJob(job.id, e)}
            className={`p-3 rounded-xl transition-all hidden lg:flex ${
              savedJobs.includes(job.id)
                ? "bg-blue-50 text-blue-600"
                : "bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            }`}
          >
            {savedJobs.includes(job.id) ? (
              <BookmarkCheck className="w-6 h-6" />
            ) : (
              <Bookmark className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Quick Info */}
        <div className="flex flex-wrap gap-3 mt-6">
          <span
            className={`px-4 py-2 text-sm font-medium rounded-xl border ${getJobTypeBadgeClass(
              job.type
            )}`}
          >
            {formatJobType(job.type)}
          </span>
          <span className="px-4 py-2 text-sm bg-slate-50 text-slate-600 rounded-xl flex items-center gap-2 border border-slate-100">
            <MapPin className="w-4 h-4" />
            {job.location}
          </span>
          {job.remote && (
            <span className="px-4 py-2 text-sm bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100 flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Remote
            </span>
          )}
          {job.salary && (
            <span className="px-4 py-2 text-sm bg-blue-50 text-blue-700 rounded-xl flex items-center gap-2 font-medium border border-blue-100">
              <Banknote className="w-4 h-4" />
              {job.salary}
            </span>
          )}
        </div>

        {/* Disability Friendly Prominent Banner */}
        {job.isDisabilityFriendly && (
          <div className="mt-6 bg-gradient-to-r from-green-600 to-green-500 rounded-2xl p-4 shadow-lg shadow-green-500/20 text-white flex items-center gap-4 animate-in slide-in-from-bottom-2">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
              <Accessibility className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg leading-tight">
                Ramah Disabilitas
              </h3>
              <p className="text-green-50 text-sm opacity-90">
                Lowongan ini terbuka dan inklusif untuk teman-teman difabel.
              </p>
            </div>
            <div className="hidden sm:block">
              <span className="px-3 py-1 bg-white/20 rounded-lg text-xs font-semibold backdrop-blur-md">
                Inclusive
              </span>
            </div>
          </div>
        )}

        {/* Meta Info */}
        <div className="flex flex-wrap items-center gap-6 mt-6 pt-6 border-t border-slate-100 text-sm text-slate-500">
          <span className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Diposting {getTimeSince(job.postedDate)}
          </span>
          <span className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            {job.applicants || 0} pelamar
          </span>
          {job.experience && (
            <span className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Min. {job.experience}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-8">
          {job.hasApplied ? (
            <button
              disabled
              className="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-green-50 text-green-700 font-bold rounded-xl border border-green-200 cursor-not-allowed opacity-90"
            >
              <CheckCircle className="w-5 h-5" />
              Sudah Dilamar
            </button>
          ) : (
            <Link
              href={`/jobs/${job.slug}`}
              className="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-[#03587f] hover:bg-[#024666] text-white font-bold rounded-xl transition-all shadow-lg shadow-[#03587f]/20 hover:shadow-[#03587f]/30 hover:-translate-y-0.5"
            >
              Lamar Sekarang
              <ArrowRight className="w-5 h-5" />
            </Link>
          )}
          <button
            onClick={(e) => toggleSaveJob(job.id, e)}
            className={`lg:hidden px-6 py-4 rounded-xl transition-all border ${
              savedJobs.includes(job.id)
                ? "bg-blue-50 text-blue-600 border-blue-100"
                : "bg-white text-slate-600 border-slate-200"
            }`}
          >
            {savedJobs.includes(job.id) ? (
              <BookmarkCheck className="w-6 h-6" />
            ) : (
              <Bookmark className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 lg:p-8 space-y-8">
        {/* Gallery + Main Photo */}
        {(job.photo || (job.gallery && job.gallery.length > 0)) && (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
              <h2 className="font-bold text-slate-900 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-purple-500" />
                Media & Galeri
              </h2>
            </div>
            <div className="p-6">
              {job.photo && (
                <div
                  className="aspect-video rounded-2xl overflow-hidden bg-slate-50 mb-4 border border-slate-100 cursor-pointer hover:opacity-95 transition"
                  onClick={() => setSelectedImage(job.photo)}
                >
                  <img
                    src={job.photo}
                    alt="Main Job Photo"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {job.gallery && job.gallery.length > 0 && (
                <div className="grid grid-cols-4 gap-3">
                  {job.gallery.map((img, idx) => (
                    <div
                      key={idx}
                      className="aspect-square rounded-xl overflow-hidden bg-slate-50 border border-slate-100 hover:shadow-md transition-shadow cursor-pointer hover:opacity-95"
                      onClick={() => setSelectedImage(img)}
                    >
                      <img
                        src={img}
                        alt={`Gallery ${idx}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Description */}
        {job.description && (
          <section>
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              Deskripsi Pekerjaan
            </h3>
            <div
              className="prose prose-slate max-w-none text-slate-600 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: job.description }}
            />
          </section>
        )}

        {/* Working Days & Holidays */}
        {(job.workingDays || job.holidays) && (
          <div className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col md:flex-row gap-6">
            {job.workingDays && (
              <div className="flex items-start gap-3 flex-1">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Hari Kerja</h4>
                  <p className="text-slate-600 text-sm mt-0.5">
                    {job.workingDays}
                  </p>
                </div>
              </div>
            )}
            {job.holidays && (
              <div className="flex items-start gap-3 flex-1">
                <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600 flex-shrink-0">
                  <Coffee className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Hari Libur</h4>
                  <p className="text-slate-600 text-sm mt-0.5">
                    {job.holidays}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Shift Info */}
        {job.isShift && (
          <div className="bg-purple-50 rounded-2xl border border-purple-100 p-6 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-purple-600 flex-shrink-0 shadow-sm">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-purple-900">Sistem Shift</h4>
              <p className="text-purple-700 text-sm mt-0.5">
                Posisi ini menggunakan sistem shift ({job.shiftCount} shift)
              </p>
            </div>
          </div>
        )}

        {/* Requirements */}
        {job.requirements && (
          <section>
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              Kualifikasi
            </h3>
            <div
              className="prose prose-slate max-w-none text-slate-600 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: job.requirements }}
            />
          </section>
        )}

        {/* Benefits */}
        {job.benefits && job.benefits.length > 0 && (
          <section>
            <h3 className="text-lg font-bold text-slate-900 mb-4">Benefit</h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {job.benefits.map((benefit, index) => (
                <li
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-700"
                >
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm font-medium">{benefit}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-5xl w-full max-h-[90vh] flex items-center justify-center">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 text-white/80 hover:text-white transition"
            >
              <XCircle className="w-8 h-8" />
            </button>
            <img
              src={selectedImage}
              alt="Full View"
              className="max-w-full max-h-[85vh] rounded-lg shadow-2xl object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-[calc(100vh-8rem)]">
        <div className="flex gap-6 h-full">
          {/* Left Sidebar - Job List */}
          <div
            className={`flex-1 flex flex-col h-full ${
              showDetail ? "hidden lg:flex" : "flex"
            }`}
          >
            {/* Search & Filter Header */}
            <div className="mb-6 space-y-4">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari posisi atau perusahaan..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all outline-none bg-white shadow-sm"
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-4 py-3 rounded-xl border transition-all flex items-center gap-2 ${
                    showFilters || activeFiltersCount > 0
                      ? "bg-blue-50 border-blue-200 text-blue-600"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Filter className="w-5 h-5" />
                  <span className="hidden sm:inline">Filter</span>
                  {activeFiltersCount > 0 && (
                    <span className="bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>
              </div>

              {/* Expanded Filters */}
              {showFilters && (
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm animate-in slide-in-from-top-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Tipe Pekerjaan
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {jobTypes.map((type) => (
                          <button
                            key={type}
                            onClick={() => handleFilterChange("jobType", type)}
                            className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${
                              filters.jobType.includes(type)
                                ? "bg-blue-50 border-blue-200 text-blue-600"
                                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            {formatJobType(type)}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Pengalaman
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {experienceLevels.map((level) => (
                          <button
                            key={level}
                            onClick={() =>
                              handleFilterChange("experience", level)
                            }
                            className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${
                              filters.experience.includes(level)
                                ? "bg-blue-50 border-blue-200 text-blue-600"
                                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            {level}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end mt-4 pt-4 border-t border-slate-100">
                    <button
                      onClick={clearFilters}
                      className="text-sm text-slate-500 hover:text-red-500 transition-colors"
                    >
                      Reset Filter
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Job List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
              {loading ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl p-5 border border-slate-100 animate-pulse"
                  >
                    <div className="flex gap-4">
                      <div className="w-14 h-14 bg-slate-100 rounded-xl" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-slate-100 rounded w-3/4" />
                        <div className="h-3 bg-slate-100 rounded w-1/2" />
                      </div>
                    </div>
                  </div>
                ))
              ) : jobs.length > 0 ? (
                jobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    isSelected={selectedJob?.id === job.id}
                  />
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Tidak ada lowongan ditemukan
                  </h3>
                  <p className="text-slate-500">
                    Coba ubah kata kunci atau filter pencarian Anda
                  </p>
                  <button
                    onClick={clearFilters}
                    className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    Reset Filter
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar - Job Detail (Desktop) */}
          <div
            className={`lg:w-[600px] xl:w-[700px] bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col ${
              showDetail
                ? "fixed inset-0 z-50 lg:static lg:z-auto"
                : "hidden lg:flex"
            }`}
          >
            {selectedJob ? (
              <JobDetail job={selectedJob} />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                  <Briefcase className="w-12 h-12 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Pilih Lowongan
                </h3>
                <p className="max-w-xs mx-auto">
                  Pilih salah satu lowongan dari daftar di samping untuk melihat
                  detail lengkapnya.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Loading fallback for Suspense
const JobsPageLoading = () => (
  <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
    <div className="text-center">
      <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
      <p className="text-gray-600">Memuat lowongan...</p>
    </div>
  </div>
);

// Export with Suspense wrapper
export default function JobsPageWrapper() {
  return (
    <Suspense fallback={<JobsPageLoading />}>
      <JobsPage />
    </Suspense>
  );
}
