"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import {
  ArrowLeft,
  LogOut,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  ExternalLink,
  Building2,
  Briefcase,
  Calendar,
  User,
  Loader2,
  MessageSquare,
} from "lucide-react";

export default function ResignationsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [resignations, setResignations] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [processingId, setProcessingId] = useState(null);
  const [listLoading, setListLoading] = useState(false);

  // Initial load
  useEffect(() => {
    loadResignations(true);
  }, []);

  // Filter change - only refresh list
  useEffect(() => {
    if (!loading) {
      loadResignations(false);
    }
  }, [statusFilter]);

  const loadResignations = async (isInitial = false) => {
    try {
      if (isInitial) {
        setLoading(true);
      } else {
        setListLoading(true);
      }
      const token = localStorage.getItem("token");

      const params = new URLSearchParams();
      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }

      const response = await fetch(`/api/resignations?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setResignations(data.resignations || []);
        if (isInitial) {
          setStats(
            data.stats || { total: 0, pending: 0, approved: 0, rejected: 0 }
          );
        }
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Gagal memuat data pengajuan resign",
      });
    } finally {
      setLoading(false);
      setListLoading(false);
    }
  };

  const handleProcess = async (id, action) => {
    const actionText = action === "approve" ? "menyetujui" : "menolak";
    const { value: notes, isConfirmed } = await Swal.fire({
      title: `${action === "approve" ? "Setujui" : "Tolak"} Pengajuan Resign?`,
      input: "textarea",
      inputLabel: "Catatan (opsional)",
      inputPlaceholder: "Berikan catatan untuk karyawan...",
      showCancelButton: true,
      confirmButtonColor: action === "approve" ? "#10b981" : "#ef4444",
      confirmButtonText: action === "approve" ? "Ya, Setujui" : "Ya, Tolak",
      cancelButtonText: "Batal",
    });

    if (!isConfirmed) return;

    try {
      setProcessingId(id);
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/resignations/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
          recruiterNotes: notes || null,
        }),
      });

      const data = await response.json();
      if (data.success) {
        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: `Pengajuan resign berhasil di${
            action === "approve" ? "setujui" : "tolak"
          }`,
          timer: 1500,
          showConfirmButton: false,
        });
        loadResignations();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: error.message || `Gagal ${actionText} pengajuan resign`,
      });
    } finally {
      setProcessingId(null);
    }
  };

  const filteredResignations = resignations.filter((item) => {
    if (!searchQuery) return true;
    const name = `${item.jobseekers?.firstName || ""} ${
      item.jobseekers?.lastName || ""
    }`.toLowerCase();
    const jobTitle = item.applications?.jobs?.title?.toLowerCase() || "";
    const query = searchQuery.toLowerCase();
    return name.includes(query) || jobTitle.includes(query);
  });

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    const config = {
      PENDING: {
        label: "Menunggu",
        color: "bg-yellow-100 text-yellow-700 border-yellow-300",
        icon: Clock,
      },
      APPROVED: {
        label: "Disetujui",
        color: "bg-green-100 text-green-700 border-green-300",
        icon: CheckCircle,
      },
      REJECTED: {
        label: "Ditolak",
        color: "bg-red-100 text-red-700 border-red-300",
        icon: XCircle,
      },
    };
    const { label, color, icon: Icon } = config[status] || config.PENDING;
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 ${color}`}
      >
        <Icon className="w-3 h-3" />
        {label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Memuat pengajuan resign...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
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

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <LogOut className="w-8 h-8 text-orange-500" />
                Pengajuan Resign
              </h1>
              <p className="text-gray-600">
                Kelola pengajuan pengunduran diri karyawan
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <button
            onClick={() => setStatusFilter("all")}
            className={`text-left rounded-xl p-4 transition-all ${
              statusFilter === "all"
                ? "bg-gray-900 text-white ring-2 ring-gray-900 ring-offset-2"
                : "bg-white hover:bg-gray-50 border border-gray-200"
            }`}
          >
            <p
              className={`text-xs mb-1 ${
                statusFilter === "all" ? "text-gray-300" : "text-gray-500"
              }`}
            >
              Total
            </p>
            <p
              className={`text-2xl font-bold ${
                statusFilter === "all" ? "text-white" : "text-gray-900"
              }`}
            >
              {stats.total}
            </p>
          </button>

          <button
            onClick={() => setStatusFilter("PENDING")}
            className={`text-left rounded-xl p-4 transition-all ${
              statusFilter === "PENDING"
                ? "bg-yellow-500 text-white ring-2 ring-yellow-500 ring-offset-2"
                : "bg-yellow-50 hover:bg-yellow-100 border border-yellow-200"
            }`}
          >
            <p
              className={`text-xs mb-1 ${
                statusFilter === "PENDING"
                  ? "text-yellow-100"
                  : "text-yellow-700"
              }`}
            >
              Menunggu
            </p>
            <p
              className={`text-2xl font-bold ${
                statusFilter === "PENDING" ? "text-white" : "text-yellow-900"
              }`}
            >
              {stats.pending}
            </p>
          </button>

          <button
            onClick={() => setStatusFilter("APPROVED")}
            className={`text-left rounded-xl p-4 transition-all ${
              statusFilter === "APPROVED"
                ? "bg-green-500 text-white ring-2 ring-green-500 ring-offset-2"
                : "bg-green-50 hover:bg-green-100 border border-green-200"
            }`}
          >
            <p
              className={`text-xs mb-1 ${
                statusFilter === "APPROVED"
                  ? "text-green-100"
                  : "text-green-700"
              }`}
            >
              Disetujui
            </p>
            <p
              className={`text-2xl font-bold ${
                statusFilter === "APPROVED" ? "text-white" : "text-green-900"
              }`}
            >
              {stats.approved}
            </p>
          </button>

          <button
            onClick={() => setStatusFilter("REJECTED")}
            className={`text-left rounded-xl p-4 transition-all ${
              statusFilter === "REJECTED"
                ? "bg-red-500 text-white ring-2 ring-red-500 ring-offset-2"
                : "bg-red-50 hover:bg-red-100 border border-red-200"
            }`}
          >
            <p
              className={`text-xs mb-1 ${
                statusFilter === "REJECTED" ? "text-red-100" : "text-red-700"
              }`}
            >
              Ditolak
            </p>
            <p
              className={`text-2xl font-bold ${
                statusFilter === "REJECTED" ? "text-white" : "text-red-900"
              }`}
            >
              {stats.rejected}
            </p>
          </button>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl p-4 mb-6 shadow-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama karyawan atau posisi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
            />
          </div>
        </div>

        {/* List */}
        {listLoading ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Loader2 className="w-10 h-10 text-orange-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Memuat data...</p>
          </div>
        ) : filteredResignations.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <LogOut className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchQuery || statusFilter !== "all"
                ? "Tidak ada pengajuan ditemukan"
                : "Belum ada pengajuan resign"}
            </h3>
            <p className="text-gray-600">
              {searchQuery || statusFilter !== "all"
                ? "Coba ubah filter atau kata kunci pencarian"
                : "Pengajuan resign dari karyawan akan muncul di sini"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredResignations.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-start gap-4">
                  {/* Photo */}
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white text-xl font-bold overflow-hidden flex-shrink-0">
                    {item.jobseekers?.photo ? (
                      <img
                        src={item.jobseekers.photo}
                        alt={item.jobseekers?.firstName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>
                        {item.jobseekers?.firstName?.charAt(0) || "U"}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {item.jobseekers?.firstName}{" "}
                          {item.jobseekers?.lastName}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-4 h-4" />
                            {item.applications?.jobs?.title ||
                              "Unknown Position"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(item.createdAt)}
                          </span>
                        </div>
                      </div>
                      {getStatusBadge(item.status)}
                    </div>

                    {/* Reason */}
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        Alasan Resign:
                      </p>
                      <p className="text-gray-700">{item.reason}</p>
                    </div>

                    {/* Letter Link */}
                    <div className="mt-3 flex items-center gap-4">
                      <a
                        href={item.letterUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition text-sm font-medium"
                      >
                        <FileText className="w-4 h-4" />
                        Surat Resign
                        <ExternalLink className="w-3 h-3" />
                      </a>

                      {item.jobseekers?.email && (
                        <span className="text-sm text-gray-500">
                          {item.jobseekers.email}
                        </span>
                      )}
                    </div>

                    {/* Recruiter Notes */}
                    {item.recruiterNotes && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-700">
                          <strong>Catatan:</strong> {item.recruiterNotes}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    {item.status === "PENDING" && (
                      <div className="mt-4 flex gap-3">
                        <button
                          onClick={() => handleProcess(item.id, "approve")}
                          disabled={processingId === item.id}
                          className="flex-1 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {processingId === item.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                          Setujui
                        </button>
                        <button
                          onClick={() => handleProcess(item.id, "reject")}
                          disabled={processingId === item.id}
                          className="flex-1 py-2 border-2 border-red-300 text-red-600 rounded-lg font-semibold hover:bg-red-50 transition flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          <XCircle className="w-4 h-4" />
                          Tolak
                        </button>
                      </div>
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
