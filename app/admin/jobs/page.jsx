"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Briefcase,
  Search,
  Building2,
  MapPin,
  Clock,
  Eye,
  Users,
  CheckCircle,
  XCircle,
  ExternalLink,
  Calendar,
  TrendingUp,
  Filter,
  ArrowUpDown,
  Globe,
} from "lucide-react";
import Swal from "sweetalert2";
import { getAllKecamatan } from "@/lib/cirebonData";

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [jobTypeFilter, setJobTypeFilter] = useState("all");
  const [kecamatanFilter, setKecamatanFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [scopeFilter, setScopeFilter] = useState("all");

  useEffect(() => {
    fetchJobs();
  }, [
    search,
    statusFilter,
    jobTypeFilter,
    kecamatanFilter,
    sortOrder,
    scopeFilter,
  ]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (jobTypeFilter !== "all") params.append("jobType", jobTypeFilter);
      if (kecamatanFilter !== "all")
        params.append("kecamatan", kecamatanFilter);
      if (scopeFilter !== "all") params.append("scope", scopeFilter);
      params.append("sort", sortOrder);

      const response = await fetch(`/api/admin/jobs?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (data.success) {
        setJobs(data.jobs || []);
        setStats(data.stats || null);
      } else {
        setJobs([]);
        setStats(null);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
      setJobs([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getJobTypeBadge = (type) => {
    const styles = {
      FULL_TIME: "bg-blue-100 text-blue-700",
      PART_TIME: "bg-purple-100 text-purple-700",
    };
    const labels = {
      FULL_TIME: "Full Time",
      PART_TIME: "Part Time",
    };
    return (
      <span
        className={`px-3 py-1 text-xs font-medium rounded-full ${
          styles[type] || "bg-slate-100 text-slate-700"
        }`}
      >
        {labels[type] || type}
      </span>
    );
  };

  const handleUpdateStatus = async (jobId, newStatus) => {
    try {
      let rejectionReason = null;

      // UI Confirmation
      if (newStatus === "ACTIVE") {
        const result = await Swal.fire({
          title: "Setujui Lowongan?",
          text: "Lowongan ini akan ditampilkan ke publik",
          icon: "question",
          showCancelButton: true,
          confirmButtonColor: "#10B981",
          cancelButtonColor: "#6B7280",
          confirmButtonText: "Ya, Setujui",
          cancelButtonText: "Batal",
        });
        if (!result.isConfirmed) return;
      } else if (newStatus === "REJECTED") {
        const result = await Swal.fire({
          title: "Tolak Lowongan",
          text: "Silakan masukkan alasan penolakan:",
          input: "textarea",
          inputPlaceholder: "Contoh: Informasi gaji tidak masuk akal...",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#EF4444",
          cancelButtonColor: "#6B7280",
          confirmButtonText: "Tolak Lowongan",
          cancelButtonText: "Batal",
          inputValidator: (value) => {
            if (!value) {
              return "Alasan penolakan wajib diisi!";
            }
          },
        });
        if (!result.isConfirmed) return;
        rejectionReason = result.value;
      }

      // API Call
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/jobs", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          jobId,
          status: newStatus,
          rejectionReason,
        }),
      });

      if (response.ok) {
        await Swal.fire({
          icon: "success",
          title: "Berhasil",
          text:
            newStatus === "ACTIVE"
              ? "Lowongan berhasil disetujui"
              : "Lowongan berhasil ditolak",
          timer: 1500,
          showConfirmButton: false,
        });
        fetchJobs();
      } else {
        throw new Error("Failed to update");
      }
    } catch (error) {
      console.error("Failed to update status", error);
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Terjadi kesalahan saat mengupdate status",
      });
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      PENDING: "bg-orange-100 text-orange-700",
      ACTIVE: "bg-emerald-100 text-emerald-700",
      REJECTED: "bg-red-100 text-red-700",
      CLOSED: "bg-slate-100 text-slate-700",
    };
    const labels = {
      PENDING: "Menunggu Review",
      ACTIVE: "Aktif / Live",
      REJECTED: "Ditolak",
      CLOSED: "Ditutup",
    };
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full ${
          styles[status] || styles.CLOSED
        }`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            status === "ACTIVE"
              ? "bg-emerald-500"
              : status === "PENDING"
              ? "bg-orange-500"
              : status === "REJECTED"
              ? "bg-red-500"
              : "bg-slate-500"
          }`}
        />
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header - Always visible */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
            Manajemen Lowongan
          </h1>
          <p className="text-slate-300 text-sm">
            Kelola semua lowongan pekerjaan yang terdaftar
          </p>

          {/* Quick Stats in Header */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-3xl font-bold text-white">
                {stats?.total || 0}
              </div>
              <div className="text-slate-300 text-xs mt-1">Total Lowongan</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-3xl font-bold text-orange-400">
                {stats?.pending || 0}
              </div>
              <div className="text-slate-300 text-xs mt-1">Perlu Review</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-3xl font-bold text-emerald-400">
                {stats?.active || 0}
              </div>
              <div className="text-slate-300 text-xs mt-1">Aktif</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-3xl font-bold text-blue-400">
                {stats?.totalApplications || 0}
              </div>
              <div className="text-slate-300 text-xs mt-1">Total Lamaran</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 mb-6">
          {/* Row 1: Search + Status Filter */}
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari lowongan, perusahaan, atau lokasi..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800 placeholder-slate-400"
              />
            </div>

            {/* Status Filter Pills */}
            <div className="flex gap-1.5 bg-slate-100 p-1.5 rounded-xl overflow-x-auto">
              {[
                { key: "all", label: "Semua", color: "" },
                { key: "pending", label: "Pending", color: "text-orange-600" },
                { key: "active", label: "Aktif", color: "text-emerald-600" },
                { key: "rejected", label: "Ditolak", color: "text-red-600" },
                { key: "closed", label: "Ditutup", color: "text-slate-600" },
              ].map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setStatusFilter(filter.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                    statusFilter === filter.key
                      ? "bg-white text-slate-800 shadow-sm"
                      : `${filter.color || "text-slate-500"} hover:bg-white/50`
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Row 2: Advanced Filters */}
          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Filter className="w-4 h-4" />
              <span>Filter:</span>
            </div>

            {/* Kecamatan Filter */}
            <select
              value={kecamatanFilter}
              onChange={(e) => setKecamatanFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Semua Kecamatan</option>
              {getAllKecamatan().map((kec) => (
                <option key={kec} value={kec}>
                  Kec. {kec}
                </option>
              ))}
            </select>

            {/* Job Type Filter */}
            <select
              value={jobTypeFilter}
              onChange={(e) => setJobTypeFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Semua Tipe</option>
              <option value="FULL_TIME">Full Time</option>
              <option value="PART_TIME">Part Time</option>
            </select>

            {/* Scope Filter */}
            <select
              value={scopeFilter}
              onChange={(e) => setScopeFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Semua Skup</option>
              <option value="domestic">Dalam Negeri</option>
              <option value="international">Luar Negeri</option>
            </select>

            {/* Divider */}
            <div className="w-px h-6 bg-slate-200 hidden sm:block"></div>

            {/* Sort Order */}
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <ArrowUpDown className="w-4 h-4" />
              <span>Urutkan:</span>
            </div>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="newest">Terbaru</option>
              <option value="oldest">Terlama</option>
              <option value="deadline_asc">Deadline Terdekat</option>
              <option value="deadline_desc">Deadline Terjauh</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-slate-500">
            Menampilkan{" "}
            <span className="font-semibold text-slate-700">
              {loading ? "..." : jobs.length}
            </span>{" "}
            lowongan
          </p>
        </div>

        {/* Loading State - Skeleton cards */}
        {loading ? (
          <div className="grid gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 animate-pulse"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-slate-200"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-slate-200 rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/4 mb-2"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                  </div>
                  <div className="hidden md:flex gap-4">
                    <div className="h-6 w-20 bg-slate-200 rounded-full"></div>
                    <div className="h-6 w-16 bg-slate-200 rounded-full"></div>
                  </div>
                  <div className="h-10 w-24 bg-slate-200 rounded-xl"></div>
                </div>
              </div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
            <Briefcase className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              Tidak ada lowongan
            </h3>
            <p className="text-slate-500">
              Coba ubah filter atau kata kunci pencarian
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className={`bg-white rounded-2xl shadow-sm border p-5 transition group ${
                  job.status === "PENDING"
                    ? "border-orange-200 ring-4 ring-orange-50"
                    : "border-slate-100 hover:shadow-md"
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Company Logo & Job Info */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {job.company?.logo ? (
                        <img
                          src={job.company.logo}
                          alt={job.company.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Building2 className="w-7 h-7 text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-800 group-hover:text-blue-600 transition truncate">
                        {job.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-slate-600">
                          {job.company?.name}
                        </span>
                        {job.company?.verified && (
                          <CheckCircle className="w-4 h-4 text-blue-500" />
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 mt-2">
                        <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                          <MapPin className="w-3.5 h-3.5" />
                          {job.city}
                          {job.isRemote && (
                            <span className="ml-1 px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded text-xs">
                              Remote
                            </span>
                          )}
                        </span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs text-slate-500">
                          {job.numberOfPositions} posisi
                        </span>
                        {job.isDisabilityFriendly && (
                          <>
                            <span className="text-xs text-slate-400">•</span>
                            <span className="text-xs text-blue-600">
                              ♿ Disabilitas
                            </span>
                          </>
                        )}
                      </div>
                      {job.showSalary && job.salaryMin && job.salaryMax && (
                        <p className="text-sm text-emerald-600 font-medium mt-2">
                          {formatCurrency(job.salaryMin)} -{" "}
                          {formatCurrency(job.salaryMax)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions for Pending Jobs */}
                  {job.status === "PENDING" && (
                    <div className="flex items-center gap-2 lg:border-l lg:border-r lg:border-slate-100 lg:px-6">
                      <button
                        onClick={() => handleUpdateStatus(job.id, "ACTIVE")}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white text-sm font-medium rounded-lg hover:bg-emerald-600 transition shadow-sm hover:shadow"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Setujui
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(job.id, "REJECTED")}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition"
                      >
                        <XCircle className="w-4 h-4" />
                        Tolak
                      </button>
                    </div>
                  )}

                  {/* Stats & Actions */}
                  <div className="flex items-center gap-6 lg:gap-8">
                    {/* Job Type Badge */}
                    <div className="hidden md:block">
                      {getJobTypeBadge(job.jobType)}
                    </div>

                    {/* Metrics */}
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="flex items-center gap-1 text-slate-800 font-semibold">
                          <Users className="w-4 h-4 text-purple-500" />
                          {job.applicationCount}
                        </div>
                        <div className="text-xs text-slate-400">Lamaran</div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center gap-1 text-slate-800 font-semibold">
                          <Eye className="w-4 h-4 text-blue-500" />
                          {job.viewCount}
                        </div>
                        <div className="text-xs text-slate-400">Views</div>
                      </div>
                    </div>

                    {/* Status */}
                    <div>{getStatusBadge(job.status || "PENDING")}</div>

                    {/* Date */}
                    <div className="hidden lg:block text-right">
                      <div className="text-sm text-slate-600">
                        {formatDate(job.createdAt)}
                      </div>
                      <div className="text-xs text-slate-400">Dibuat</div>
                    </div>

                    {/* Action */}
                    <Link
                      href={`/admin/jobs/${job.id}`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-xl hover:bg-slate-700 transition"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Lihat
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
