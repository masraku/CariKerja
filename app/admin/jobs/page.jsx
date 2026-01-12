"use client";
import { useState } from "react";
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
import {
  useQueryAdminJobs,
  useMutationUpdateJobStatus,
} from "@/hooks/admin/useAdmin";

export default function AdminJobsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [jobTypeFilter, setJobTypeFilter] = useState("all");
  const [kecamatanFilter, setKecamatanFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [scopeFilter, setScopeFilter] = useState("all");

  // Use React Query hooks
  const {
    data,
    isPending: loading,
    refetch,
  } = useQueryAdminJobs({
    search,
    status: statusFilter,
    jobType: jobTypeFilter,
    kecamatan: kecamatanFilter,
    scope: scopeFilter,
    sort: sortOrder,
  });

  const updateStatusMutation = useMutationUpdateJobStatus();

  const jobs = data?.jobs || [];
  const stats = data?.stats || null;

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

      // Use mutation
      await updateStatusMutation.mutateAsync({
        jobId,
        status: newStatus,
        rejectionReason,
      });

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
    } catch (error) {
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
              <div className="text-3xl font-bold text-red-400">
                {stats?.rejected || 0}
              </div>
              <div className="text-slate-300 text-xs mt-1">Ditolak</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
        {/* Filters */}
        {/* Filters & Search */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6 sticky top-4 z-30">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Search Input */}
            <div className="lg:col-span-4 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari posisi, perusahaan..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-slate-400"
              />
            </div>

            {/* Main Filters */}
            <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-3">
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Semua Status</option>
                <option value="pending">⏳ Menunggu</option>
                <option value="active">✅ Aktif</option>
                <option value="rejected">❌ Ditolak</option>
                <option value="closed">🔒 Ditutup</option>
              </select>

              {/* Kecamatan Filter */}
              <select
                value={kecamatanFilter}
                onChange={(e) => setKecamatanFilter(e.target.value)}
                className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Semua Lokasi</option>
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
                className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Semua Tipe</option>
                <option value="FULL_TIME">Full Time</option>
                <option value="PART_TIME">Part Time</option>
              </select>

              {/* Sort Order */}
              <div className="md:col-span-1">
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="newest">Terbaru</option>
                  <option value="oldest">Terlama</option>
                  <option value="deadline_asc">Deadline Dekat</option>
                  <option value="deadline_desc">Deadline Jauh</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-4 px-1">
          <p className="text-sm font-medium text-slate-500">
            Menampilkan{" "}
            <span className="text-slate-900 font-bold">
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
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className={`bg-white rounded-xl shadow-sm border transition-all duration-200 group relative overflow-hidden ${
                  job.status === "PENDING"
                    ? "border-orange-200 ring-1 ring-orange-100"
                    : "border-slate-200 hover:border-blue-300 hover:shadow-md"
                }`}
              >
                {/* Status Strip for Pending */}
                {job.status === "PENDING" && (
                  <div className="absolute top-0 left-0 w-1 h-full bg-orange-400"></div>
                )}

                <div className="p-5">
                  <div className="flex flex-col lg:flex-row gap-5">
                    {/* Left: Logo & Main Info */}
                    <div className="flex gap-4 flex-1">
                      {/* Logo */}
                      <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {job.company?.logo ? (
                          <img
                            src={job.company.logo}
                            alt={job.company.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Building2 className="w-8 h-8 text-slate-300" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition truncate leading-tight">
                              {job.title}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-sm font-medium text-slate-700">
                                {job.company?.name}
                              </span>
                              {job.company?.verified && (
                                <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
                              )}
                            </div>
                          </div>
                          {/* Job Type Badge (Mobile/Desktop) */}
                          <div className="flex-shrink-0">
                            {getJobTypeBadge(job.jobType)}
                          </div>
                        </div>

                        {/* Metadata Rows */}
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-sm">
                          <div className="flex items-center gap-2 text-slate-500">
                            <MapPin className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">
                              {job.city}
                              {job.isRemote && " (Remote)"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-500">
                            <Users className="w-4 h-4 flex-shrink-0" />
                            <span>
                              {job.numberOfPositions} Posisi{" "}
                              {job.isDisabilityFriendly && "• Disabilitas"}
                            </span>
                          </div>
                          {job.showSalary && job.salaryMin && job.salaryMax && (
                            <div className="flex items-center gap-2 font-medium text-emerald-600">
                              <div className="w-4 h-4 flex items-center justify-center font-bold text-xs border border-emerald-200 rounded-full bg-emerald-50">
                                Rp
                              </div>
                              <span>
                                {formatCurrency(job.salaryMin)} -{" "}
                                {formatCurrency(job.salaryMax)}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-slate-500">
                            <Calendar className="w-4 h-4 flex-shrink-0" />
                            <span>Diposting {formatDate(job.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer / Actions Bar */}
                <div className="px-5 py-3 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                  {/* Left: Metrics & Status */}
                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-lg shadow-sm">
                        <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
                        <span className="font-semibold text-slate-700">
                          {job.applicationCount}
                        </span>
                        <span className="text-slate-500 text-xs">Pelamar</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Eye className="w-4 h-4 text-slate-400" />
                        <span>{job.viewCount} views</span>
                      </div>
                    </div>
                    <div className="sm:hidden">
                      {getStatusBadge(job.status || "PENDING")}
                    </div>
                  </div>

                  {/* Right: Actions & Desktop Status */}
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="hidden sm:block">
                      {getStatusBadge(job.status || "PENDING")}
                    </div>

                    <div className="h-6 w-px bg-slate-200 hidden sm:block mx-1"></div>

                    {job.status === "PENDING" ? (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(job.id, "REJECTED")}
                          className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition"
                        >
                          Tolak
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(job.id, "ACTIVE")}
                          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 shadow-sm shadow-emerald-200 transition"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Setujui
                        </button>
                      </>
                    ) : (
                      <Link
                        href={`/admin/jobs/${job.id}`}
                        className="flex-1 sm:flex-none text-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition"
                      >
                        Lihat Detail
                      </Link>
                    )}

                    {/* View Link for Pending (icon only) */}
                    {job.status === "PENDING" && (
                      <Link
                        href={`/admin/jobs/${job.id}`}
                        title="Lihat Detail"
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </Link>
                    )}
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
