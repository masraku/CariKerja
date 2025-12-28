"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Users,
  Eye,
  Calendar,
  MapPin,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  ToggleLeft,
  ToggleRight,
  ExternalLink,
  ArrowLeft,
  AlertCircle,
  MoreHorizontal,
  FileText,
} from "lucide-react";
import Swal from "sweetalert2";

export default function RecruiterJobsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    loadJobs();
  }, [statusFilter]);

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      if (searchQuery !== null) {
        loadJobs();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (searchQuery) params.append("search", searchQuery);

      const response = await fetch(
        `/api/profile/recruiter/jobs?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs);
        setStats(data.stats);
      } else {
        throw new Error("Failed to load jobs");
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load jobs",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (slug, currentStatus) => {
    // If currently active (deactivating), just toggle immediately
    if (currentStatus) {
      const result = await Swal.fire({
        title: "Nonaktifkan Lowongan?",
        text: "Lowongan akan disembunyikan dari pencarian",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#ef4444",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Ya, Nonaktifkan",
        cancelButtonText: "Batal",
      });

      if (!result.isConfirmed) return;

      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `/api/profile/recruiter/jobs/${slug}/toggle-status`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          Swal.fire({
            icon: "success",
            title: "Berhasil!",
            text: "Lowongan berhasil dinonaktifkan",
            timer: 2000,
            showConfirmButton: false,
          });
          loadJobs();
        } else {
          throw new Error("Failed to toggle status");
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Gagal",
          text: "Gagal mengubah status lowongan",
        });
      }
    } else {
      // If currently inactive (activating), redirect to edit page to update deadline
      const result = await Swal.fire({
        title: "Aktifkan Lowongan?",
        html: `
          <p>Untuk mengaktifkan kembali lowongan, Anda perlu:</p>
          <ul class="text-left mt-3 space-y-1 text-sm text-gray-600">
            <li>✓ Memperbarui <strong>tanggal deadline</strong> penutupan</li>
            <li>✓ Mereview informasi lowongan</li>
          </ul>
          <p class="mt-3 text-sm">Anda akan diarahkan ke halaman edit.</p>
        `,
        icon: "info",
        showCancelButton: true,
        confirmButtonColor: "#3b82f6",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Ya, Edit & Aktifkan",
        cancelButtonText: "Batal",
      });

      if (result.isConfirmed) {
        router.push(
          `/profile/recruiter/dashboard/jobs/${slug}/edit?activate=true`
        );
      }
    }
  };

  const handleDeleteJob = async (slug, title) => {
    const result = await Swal.fire({
      title: "Hapus Lowongan?",
      html: `
        <p>Anda yakin ingin menghapus lowongan:</p>
        <p class="font-bold mt-2">${title}</p>
        <p class="text-sm text-gray-600 mt-2">Semua data lamaran akan ikut terhapus dan tidak dapat dikembalikan!</p>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/profile/recruiter/jobs/${slug}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Terhapus!",
          text: "Lowongan berhasil dihapus",
          timer: 2000,
          showConfirmButton: false,
        });
        loadJobs();
      } else {
        throw new Error("Failed to delete job");
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Gagal menghapus lowongan",
      });
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusBadge = (status, isActive) => {
    if (!isActive && status !== "REJECTED") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium border border-slate-200">
          <ToggleLeft className="w-3.5 h-3.5" />
          Nonaktif
        </span>
      );
    }

    switch (status) {
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-xs font-medium border border-orange-200">
            <Clock className="w-3.5 h-3.5" />
            Menunggu Review
          </span>
        );
      case "ACTIVE":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium border border-emerald-200">
            <CheckCircle className="w-3.5 h-3.5" />
            Aktif
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-medium border border-red-200">
            <XCircle className="w-3.5 h-3.5" />
            Ditolak
          </span>
        );
      case "CLOSED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium border border-slate-200">
            <XCircle className="w-3.5 h-3.5" />
            Ditutup
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push("/profile/recruiter/dashboard")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Kembali ke Dashboard
          </button>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Kelola Lowongan
              </h1>
              <p className="text-gray-600">
                Manage semua lowongan pekerjaan yang Anda posting
              </p>
            </div>

            <button
              onClick={() => router.push("/profile/recruiter/post-job")}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-600/20"
            >
              <Plus className="w-5 h-5" />
              Lowongan Baru
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
              <p className="text-sm text-slate-500 mb-1">Total Lowongan</p>
              <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
            </div>
            <div className="bg-emerald-50 rounded-xl border border-emerald-100 p-4">
              <p className="text-sm text-emerald-700 mb-1">Aktif</p>
              <p className="text-3xl font-bold text-emerald-900">
                {stats.active}
              </p>
            </div>
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
              <p className="text-sm text-slate-700 mb-1">Nonaktif</p>
              <p className="text-3xl font-bold text-slate-900">
                {stats.inactive}
              </p>
            </div>
            <div className="bg-blue-50 rounded-xl border border-blue-100 p-4">
              <p className="text-sm text-blue-700 mb-1">Total Pelamar</p>
              <p className="text-3xl font-bold text-blue-900">
                {stats.totalApplications}
              </p>
            </div>
            <div className="bg-purple-50 rounded-xl border border-purple-100 p-4">
              <p className="text-sm text-purple-700 mb-1">Total Views</p>
              <p className="text-3xl font-bold text-purple-900">
                {stats.totalViews}
              </p>
            </div>
          </div>
        )}

        {/* Filters & Search */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <span className="font-semibold text-gray-900">Filter:</span>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              <option value="all">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
            </select>

            <div className="flex-1 relative min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari judul atau lokasi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>

            {(statusFilter !== "all" || searchQuery) && (
              <button
                onClick={() => {
                  setStatusFilter("all");
                  setSearchQuery("");
                }}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>

        {/* Jobs List */}
        {jobs.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-12 text-center">
            <Briefcase className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              {searchQuery || statusFilter !== "all"
                ? "Tidak ada lowongan ditemukan"
                : "Belum ada lowongan"}
            </h3>
            <p className="text-slate-600 mb-6">
              {searchQuery || statusFilter !== "all"
                ? "Coba ubah filter atau kata kunci pencarian"
                : "Mulai posting lowongan pertama Anda"}
            </p>
            {!searchQuery && statusFilter === "all" && (
              <button
                onClick={() => router.push("/profile/recruiter/post-job")}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
              >
                <Plus className="w-5 h-5" />
                Pasang Lowongan
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition overflow-hidden"
              >
                {/* Top Section - Clickable */}
                <div
                  onClick={() =>
                    router.push(`/profile/recruiter/dashboard/jobs/${job.slug}`)
                  }
                  className="p-6 cursor-pointer hover:bg-slate-50 transition"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-slate-900">
                          {job.title}
                        </h3>
                        {getStatusBadge(job.status, job.isActive)}
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 mb-4">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-4 h-4 text-slate-400" />
                          {job.jobType}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          Posted {formatDate(job.createdAt)}
                        </span>
                      </div>

                      {/* Rejection Alert */}
                      {job.status === "REJECTED" && job.rejectionReason && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                          <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <h4 className="font-semibold text-red-900">
                                Lowongan Ditolak
                              </h4>
                              <p className="text-sm text-red-700 mt-1">
                                {job.rejectionReason}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Stats Preview */}
                      <div className="flex flex-wrap items-center gap-6">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                            <Users className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <span className="text-lg font-bold text-slate-900">
                              {job.stats.total}
                            </span>
                            <span className="text-xs text-slate-600 ml-1">
                              pelamar
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center">
                            <Eye className="w-4 h-4 text-purple-600" />
                          </div>
                          <div>
                            <span className="text-lg font-bold text-slate-900">
                              {job.viewCount || 0}
                            </span>
                            <span className="text-xs text-slate-600 ml-1">
                              views
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions Bar */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() =>
                      router.push(
                        `/profile/recruiter/dashboard/jobs/${job.slug}`
                      )
                    }
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition text-sm font-medium"
                  >
                    <Users className="w-4 h-4" />
                    Lihat Pelamar
                  </button>

                  <button
                    onClick={() =>
                      router.push(
                        `/profile/recruiter/dashboard/jobs/${job.slug}/preview`
                      )
                    }
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition text-sm font-medium"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Preview
                  </button>

                  <div className="w-px h-6 bg-slate-300 mx-1 hidden md:block" />

                  {job.status === "REJECTED" ? (
                    <button
                      onClick={() =>
                        router.push(
                          `/profile/recruiter/dashboard/jobs/${job.slug}/edit`
                        )
                      }
                      className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 transition text-sm font-medium"
                    >
                      <Edit className="w-4 h-4" />
                      Perbaiki & Validasi Ulang
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        router.push(
                          `/profile/recruiter/dashboard/jobs/${job.slug}/edit`
                        )
                      }
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition text-sm font-medium"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                  )}

                  <div className="ml-auto flex items-center gap-2">
                    <button
                      onClick={() => handleToggleStatus(job.slug, job.isActive)}
                      className={`p-2 rounded-lg transition ${
                        job.isActive
                          ? "text-emerald-600 hover:bg-emerald-50"
                          : "text-slate-400 hover:bg-slate-100"
                      }`}
                      title={job.isActive ? "Nonaktifkan" : "Aktifkan"}
                    >
                      {job.isActive ? (
                        <ToggleRight className="w-6 h-6" />
                      ) : (
                        <ToggleLeft className="w-6 h-6" />
                      )}
                    </button>

                    <button
                      onClick={() => handleDeleteJob(job.slug, job.title)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Hapus Lowongan"
                    >
                      <Trash2 className="w-5 h-5" />
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
}
