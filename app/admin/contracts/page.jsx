"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import {
  ArrowLeft,
  Building2,
  Users,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Briefcase,
  Calendar,
  User,
  Loader2,
  Eye,
  DollarSign,
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  Upload,
  X,
  Download,
} from "lucide-react";

export default function AdminContractsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true); // Initial full page load
  const [contentLoading, setContentLoading] = useState(false); // For filter changes
  const [contracts, setContracts] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [searchQuery, setSearchQuery] = useState("");
  const [processingId, setProcessingId] = useState(null);
  const [selectedContract, setSelectedContract] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState("");
  const [approvalFile, setApprovalFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [previewDocUrl, setPreviewDocUrl] = useState(null);

  useEffect(() => {
    loadContracts(true);
  }, []);

  // Effect for filter changes (partial loading)
  useEffect(() => {
    if (!loading) {
      loadContracts(false);
    }
  }, [statusFilter]);

  const loadContracts = async (isInitial = false) => {
    try {
      if (isInitial) {
        setLoading(true);
      } else {
        setContentLoading(true);
      }
      const token = localStorage.getItem("token");

      const params = new URLSearchParams();
      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }

      const response = await fetch(`/api/admin/contracts?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setContracts(data.contracts || []);
        setStats(
          data.stats || { total: 0, pending: 0, approved: 0, rejected: 0 }
        );
      }
    } catch (error) {
      console.error("Error loading contracts:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Gagal memuat data kontrak",
      });
    } finally {
      setLoading(false);
      setContentLoading(false);
    }
  };

  const handleProcess = async (id, action) => {
    const actionText = action === "approve" ? "menyetujui" : "menolak";

    // For reject, keep using Swal
    if (action === "reject") {
      const { value: notes, isConfirmed } = await Swal.fire({
        title: "Tolak Pendaftaran Kontrak?",
        input: "textarea",
        inputLabel: "Alasan penolakan (wajib)",
        inputPlaceholder: "Berikan alasan penolakan...",
        inputValidator: (value) => {
          if (!value) {
            return "Alasan penolakan harus diisi!";
          }
        },
        showCancelButton: true,
        confirmButtonColor: "#ef4444",
        confirmButtonText: "Ya, Tolak",
        cancelButtonText: "Batal",
      });

      if (!isConfirmed) return;

      // Proceed with reject
      try {
        setProcessingId(id);
        const token = localStorage.getItem("token");
        const response = await fetch(`/api/admin/contracts/${id}`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action,
            adminNotes: notes,
          }),
        });

        const data = await response.json();
        if (data.success) {
          Swal.fire({
            icon: "success",
            title: "Berhasil",
            text: `Pendaftaran kontrak berhasil ditolak`,
            timer: 1500,
            showConfirmButton: false,
          });
          setShowDetail(false);
          loadContracts(false);
        } else {
          throw new Error(data.error);
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Gagal",
          text: error.message || `Gagal menolak pendaftaran kontrak`,
        });
      } finally {
        setProcessingId(null);
      }
      return;
    }

    // For approve, logic is moved to submitApproval
    if (action === "approve") {
      setSelectedContract(contracts.find((c) => c.id === id)); // Ensure selectedContract is set for the modal
      setShowApprovalModal(true);
    }
  };

  const submitApproval = async () => {
    if (!selectedContract) return;

    try {
      setUploading(true);
      const token = localStorage.getItem("token");
      let adminResponseDocUrl = null;

      // Upload file if present
      if (approvalFile) {
        const formData = new FormData();
        formData.append("file", approvalFile);
        formData.append("type", "admin-doc"); // or whatever logic in API
        formData.append("bucket", "Lowongan"); // Use Lowongan as decided
        formData.append("folder", "admin-approvals");

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        const uploadData = await uploadRes.json();
        if (!uploadData.success) {
          throw new Error(uploadData.error || "Gagal mengupload dokumen");
        }
        adminResponseDocUrl = uploadData.url;
      }

      // Approve contract
      const response = await fetch(
        `/api/admin/contracts/${selectedContract.id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "approve",
            adminNotes: approvalNotes,
            adminResponseDocUrl,
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: `Pendaftaran kontrak berhasil disetujui`,
          timer: 1500,
          showConfirmButton: false,
        });
        setShowApprovalModal(false);
        setShowDetail(false);
        setApprovalFile(null);
        setApprovalNotes("");
        loadContracts(false);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: error.message || "Gagal menyetujui pendaftaran",
      });
    } finally {
      setUploading(false);
    }
  };

  const viewDetail = (contract) => {
    setSelectedContract(contract);
    setShowDetail(true);
  };

  const filteredContracts = contracts.filter((item) => {
    if (!searchQuery) return true;
    const companyName = item.companies?.name?.toLowerCase() || "";
    const query = searchQuery.toLowerCase();
    return companyName.includes(query);
  });

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (value) => {
    return parseInt(value).toLocaleString("id-ID");
  };

  const getStatusBadge = (status) => {
    const config = {
      PENDING: {
        label: "Menunggu Review",
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
          <p className="text-gray-600">Memuat data kontrak...</p>
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
            onClick={() => router.push("/admin")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Kembali ke Dashboard
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <FileText className="w-8 h-8 text-blue-500" />
                Pendaftaran Kontrak Kerja
              </h1>
              <p className="text-gray-600">
                Review pendaftaran kontrak dari perusahaan
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
              Menunggu Review
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
              placeholder="Cari nama perusahaan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
          </div>
        </div>

        {/* List */}
        {filteredContracts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchQuery || statusFilter !== "all"
                ? "Tidak ada pendaftaran ditemukan"
                : "Belum ada pendaftaran kontrak"}
            </h3>
            <p className="text-gray-600">
              {searchQuery || statusFilter !== "all"
                ? "Coba ubah filter atau kata kunci pencarian"
                : "Pendaftaran kontrak dari perusahaan akan muncul di sini"}
            </p>
          </div>
        ) : (
          <div className="relative min-h-[500px]">
            {contentLoading && (
              <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            )}
            <div className="space-y-4">
              {filteredContracts.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex items-start gap-4">
                    {/* Company Logo */}
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xl font-bold overflow-hidden flex-shrink-0">
                      {item.companies?.logo ? (
                        <img
                          src={item.companies.logo}
                          alt={item.companies?.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Building2 className="w-6 h-6" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            {item.companies?.name}
                          </h3>
                          <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {item.workers?.length || 0} Pekerja
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(item.createdAt)}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {item.companies?.city}
                            </span>
                          </div>
                        </div>
                        {getStatusBadge(item.status)}
                      </div>

                      {/* Workers Preview */}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {item.workers?.slice(0, 3).map((worker) => (
                          <span
                            key={worker.id}
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                          >
                            {worker.jobseekers?.firstName}{" "}
                            {worker.jobseekers?.lastName} - {worker.jobTitle}
                          </span>
                        ))}
                        {item.workers?.length > 3 && (
                          <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-xs">
                            +{item.workers.length - 3} lainnya
                          </span>
                        )}
                      </div>

                      {/* Recruiter Info */}
                      <div className="mt-3 text-sm text-gray-500">
                        Diajukan oleh: {item.recruiters?.firstName}{" "}
                        {item.recruiters?.lastName} ({item.recruiters?.position}
                        )
                      </div>

                      {/* Actions */}
                      <div className="mt-4 flex gap-3">
                        <button
                          onClick={() => viewDetail(item)}
                          className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 transition flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          Lihat Detail
                        </button>
                        {item.status === "PENDING" && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedContract(item);
                                setShowApprovalModal(true);
                              }}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition flex items-center gap-2"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Setujui
                            </button>
                            <button
                              onClick={() => handleProcess(item.id, "reject")}
                              disabled={processingId === item.id}
                              className="px-4 py-2 border-2 border-red-300 text-red-600 rounded-lg font-medium hover:bg-red-50 transition flex items-center gap-2 disabled:opacity-50"
                            >
                              <XCircle className="w-4 h-4" />
                              Tolak
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetail && selectedContract && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                Detail Pendaftaran Kontrak
              </h2>
              <button
                onClick={() => setShowDetail(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Company Info */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Informasi Perusahaan
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Nama Perusahaan</p>
                    <p className="font-medium text-gray-900">
                      {selectedContract.companies?.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Industri</p>
                    <p className="font-medium text-gray-900">
                      {selectedContract.companies?.industry}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Alamat Perusahaan</p>
                    <p className="font-medium text-gray-900">
                      {selectedContract.companies?.address}
                      {selectedContract.companies?.city &&
                        `, ${selectedContract.companies?.city}`}
                      {selectedContract.companies?.province &&
                        `, ${selectedContract.companies?.province}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Kontak Perusahaan</p>
                    <p className="font-medium text-gray-900">
                      {selectedContract.companies?.phone || "-"}
                    </p>
                    <p className="text-sm text-gray-600">
                      {selectedContract.companies?.email || "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Recruiter Info */}
              <div className="bg-blue-50 rounded-xl p-4">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Informasi Pengaju (Recruiter)
                </h3>
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold overflow-hidden flex-shrink-0">
                    {selectedContract.recruiters?.photoUrl ? (
                      <img
                        src={selectedContract.recruiters.photoUrl}
                        alt={selectedContract.recruiters?.firstName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>
                        {selectedContract.recruiters?.firstName?.charAt(0) || "R"}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Nama Lengkap</p>
                        <p className="font-medium text-gray-900">
                          {selectedContract.recruiters?.firstName}{" "}
                          {selectedContract.recruiters?.lastName}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Jabatan</p>
                        <p className="font-medium text-gray-900">
                          {selectedContract.recruiters?.position || "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="font-medium text-gray-900 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {selectedContract.recruiters?.users?.email || "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Telepon</p>
                        <p className="font-medium text-gray-900 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {selectedContract.recruiters?.phone || "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recruiter Document Attachment */}
              <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-600" />
                  Dokumen Pengantar dari Recruiter
                </h3>
                {selectedContract.recruiterDocUrl ? (
                  <button
                    onClick={() => setPreviewDocUrl(selectedContract.recruiterDocUrl)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white text-amber-700 rounded-lg font-medium hover:bg-amber-100 transition border border-amber-300"
                  >
                    <FileText className="w-4 h-4" />
                    Lihat Dokumen Pengantar
                    <Eye className="w-3 h-3" />
                  </button>
                ) : (
                  <p className="text-sm text-amber-700 italic">
                    Tidak ada dokumen pengantar yang dilampirkan
                  </p>
                )}
              </div>

              {/* Workers List */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Daftar Pekerja ({selectedContract.workers?.length || 0})
                </h3>
                <div className="space-y-3">
                  {selectedContract.workers?.map((worker) => {
                    const isTerminated = worker.status === "TERMINATED";
                    const isCompleted = worker.status === "COMPLETED" || new Date(worker.endDate) < new Date();
                    const isActive = worker.status === "ACTIVE" && new Date(worker.endDate) >= new Date();
                    
                    return (
                    <div
                      key={worker.id}
                      className={`border rounded-xl p-4 ${
                        isTerminated 
                          ? "bg-red-50 border-red-200" 
                          : isCompleted 
                          ? "bg-gray-50 border-gray-200" 
                          : "bg-white border-gray-200"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold overflow-hidden flex-shrink-0 ${
                          isTerminated 
                            ? "bg-gradient-to-br from-red-500 to-rose-500" 
                            : isCompleted 
                            ? "bg-gradient-to-br from-gray-400 to-gray-500" 
                            : "bg-gradient-to-br from-green-500 to-emerald-500"
                        }`}>
                          {worker.jobseekers?.photo ? (
                            <img
                              src={worker.jobseekers.photo}
                              alt={worker.jobseekers?.firstName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span>
                              {worker.jobseekers?.firstName?.charAt(0) || "U"}
                            </span>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-gray-900">
                              {worker.jobseekers?.firstName}{" "}
                              {worker.jobseekers?.lastName}
                            </h4>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              isTerminated 
                                ? "bg-red-100 text-red-700" 
                                : isCompleted 
                                ? "bg-gray-100 text-gray-700" 
                                : "bg-green-100 text-green-700"
                            }`}>
                              {isTerminated ? "Diakhiri" : isCompleted ? "Selesai" : "Aktif"}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <Briefcase className="w-3 h-3" />
                            {worker.jobTitle}
                          </p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 pt-3 border-t border-gray-100">
                            <div>
                              <p className="text-xs text-gray-500">Periode</p>
                              <p className="text-sm font-medium text-gray-900">
                                {formatDate(worker.startDate)} -{" "}
                                {formatDate(worker.endDate)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Upah</p>
                              <p className="text-sm font-medium text-gray-900">
                                Rp {formatCurrency(worker.salary)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Email</p>
                              <p className="text-sm text-gray-900">
                                {worker.jobseekers?.email || "-"}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Telepon</p>
                              <p className="text-sm text-gray-900">
                                {worker.jobseekers?.phone || "-"}
                              </p>
                            </div>
                          </div>
                          {/* Termination Info */}
                          {isTerminated && worker.terminatedAt && (
                            <div className="mt-3 p-3 bg-red-100 rounded-lg border border-red-200">
                              <div className="flex flex-wrap gap-4">
                                <div>
                                  <p className="text-xs text-red-600 font-medium">Tanggal Diakhiri</p>
                                  <p className="text-sm font-semibold text-red-700">
                                    {formatDate(worker.terminatedAt)}
                                  </p>
                                </div>
                                {worker.terminationReason && (
                                  <div className="flex-1">
                                    <p className="text-xs text-red-600 font-medium">Alasan</p>
                                    <p className="text-sm text-red-700">
                                      {worker.terminationReason}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                          {worker.notes && (
                            <div className="mt-3 p-2 bg-gray-50 rounded-lg text-sm text-gray-600">
                              <strong>Keterangan:</strong> {worker.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )})}
                </div>
              </div>

              {/* Admin Notes */}
              {selectedContract.adminNotes && (
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <p className="text-sm text-blue-700">
                    <strong>Catatan Admin:</strong>{" "}
                    {selectedContract.adminNotes}
                  </p>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            {selectedContract.status === "PENDING" && (
              <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowDetail(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
                >
                  Tutup
                </button>
                <button
                  onClick={() => handleProcess(selectedContract.id, "reject")}
                  disabled={processingId === selectedContract.id}
                  className="px-6 py-2 border-2 border-red-300 text-red-600 rounded-lg font-semibold hover:bg-red-50 transition flex items-center gap-2 disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" />
                  Tolak
                </button>
                <button
                  onClick={() => {
                    setShowApprovalModal(true);
                    // setShowDetail(false); // Optional: close detail or keep it open behind? Better to keep logic simple
                  }}
                  disabled={processingId === selectedContract.id}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition flex items-center gap-2 disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" />
                  Setujui
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {showApprovalModal && selectedContract && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                Persetujuan Kontrak
              </h3>
              <button
                onClick={() => {
                  setShowApprovalModal(false);
                  setApprovalFile(null);
                  setApprovalNotes("");
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dokumen Balasan (Opsional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition cursor-pointer relative">
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={(e) => setApprovalFile(e.target.files[0])}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-sm font-medium text-gray-900">
                      {approvalFile
                        ? approvalFile.name
                        : "Klik untuk upload dokumen"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PDF atau Gambar (Max 2MB)
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catatan (Opsional)
                </label>
                <textarea
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  placeholder="Tambahkan catatan untuk perusahaan..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-24 resize-none"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowApprovalModal(false);
                  setApprovalFile(null);
                  setApprovalNotes("");
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={submitApproval}
                disabled={uploading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition flex items-center gap-2 disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Setujui Kontrak
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Preview Modal */}
      {previewDocUrl && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-500" />
                Dokumen Pengantar dari Recruiter
              </h3>
              <button
                onClick={() => setPreviewDocUrl(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-gray-50">
              {previewDocUrl.toLowerCase().endsWith('.pdf') ? (
                <iframe
                  src={previewDocUrl}
                  className="w-full h-[70vh] rounded-lg border border-gray-200"
                  title="Document Preview"
                />
              ) : (
                <div className="flex items-center justify-center">
                  <img
                    src={previewDocUrl}
                    alt="Dokumen Pengantar"
                    className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
                  />
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setPreviewDocUrl(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
              >
                Tutup
              </button>
              <a
                href={previewDocUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
