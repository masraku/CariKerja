"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Calendar,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Briefcase,
  GraduationCap,
  Heart,
  ImageIcon,
  Globe,
  CalendarDays,
  Coffee,
  AlertCircle,
  Accessibility,
} from "lucide-react";
import Swal from "sweetalert2";

export default function AdminJobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (params.id) {
      fetchJobDetail();
    }
  }, [params.id]);

  const fetchJobDetail = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/jobs/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (data.success) {
        setJob(data.job);
      }
    } catch (error) {
      console.error("Error fetching job:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      let rejectionReason = null;

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
          input: "textarea",
          inputPlaceholder: "Masukkan alasan penolakan...",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#EF4444",
          cancelButtonColor: "#6B7280",
          confirmButtonText: "Tolak Lowongan",
          cancelButtonText: "Batal",
          inputValidator: (value) => {
            if (!value) return "Alasan penolakan wajib diisi!";
          },
        });
        if (!result.isConfirmed) return;
        rejectionReason = result.value;
      }

      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/jobs", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          jobId: job.id,
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
        router.push("/admin/jobs");
      } else {
        throw new Error("Failed to update");
      }
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
      PENDING:
        "bg-orange-50 text-orange-700 border-orange-200 ring-orange-500/20",
      ACTIVE:
        "bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20",
      REJECTED: "bg-red-50 text-red-700 border-red-200 ring-red-500/20",
      CLOSED: "bg-slate-50 text-slate-700 border-slate-200 ring-slate-500/20",
    };
    const labels = {
      PENDING: "Menunggu Review",
      ACTIVE: "Aktif / Live",
      REJECTED: "Ditolak",
      CLOSED: "Ditutup",
    };
    return (
      <span
        className={`inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-full border ring-1 ${styles[status]}`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            status === "ACTIVE"
              ? "bg-emerald-500"
              : status === "PENDING"
              ? "bg-orange-500 animate-pulse"
              : status === "REJECTED"
              ? "bg-red-500"
              : "bg-slate-500"
          }`}
        />
        {labels[status] || status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="h-48 bg-gray-200 rounded-3xl animate-pulse"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-96 bg-gray-200 rounded-3xl animate-pulse"></div>
            <div className="h-96 bg-gray-200 rounded-3xl animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50/50 p-12 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Lowongan tidak ditemukan
          </h3>
          <button
            onClick={() => router.back()}
            className="mt-4 text-blue-600 font-medium hover:underline"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* Top Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Kembali</span>
          </button>
          <div className="flex items-center gap-3">
            {job.status === "PENDING" && (
              <>
                <button
                  onClick={() => handleUpdateStatus("REJECTED")}
                  className="px-4 py-2 text-red-600 font-medium hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                >
                  Tolak
                </button>
                <button
                  onClick={() => handleUpdateStatus("ACTIVE")}
                  className="px-4 py-2 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
                >
                  Setujui Lowongan
                </button>
              </>
            )}
            {job.status === "ACTIVE" && (
              <button
                onClick={() => handleUpdateStatus("CLOSED")}
                className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
              >
                Tutup Lowongan
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header Content */}
        <div className="bg-white rounded-3xl p-8 mb-8 border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Building2 className="w-64 h-64" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row gap-8">
            <div className="w-24 h-24 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center p-2 flex-shrink-0">
              {job.company?.logo ? (
                <img
                  src={job.company.logo}
                  alt={job.company.name}
                  className="w-full h-full object-contain rounded-xl"
                />
              ) : (
                <Building2 className="w-10 h-10 text-gray-300" />
              )}
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                {getStatusBadge(job.status)}
                <span className="text-gray-400">•</span>
                <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  {job.jobType.replace("_", " ")}
                </span>
                {job.isRemote && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
                    <Globe className="w-3 h-3" />
                    Remote
                  </span>
                )}
                {job.isDisabilityFriendly && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700">
                    <Accessibility className="w-3 h-3" />
                    Ramah Disabilitas
                  </span>
                )}
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {job.title}
              </h1>

              <div className="flex items-center gap-2 text-lg text-gray-600 mb-6">
                <Building2 className="w-5 h-5 text-gray-400" />
                <span className="font-medium">{job.company?.name}</span>
                {job.company?.verified && (
                  <CheckCircle
                    className="w-5 h-5 text-blue-500"
                    fill="currentColor"
                  />
                )}
              </div>

              <div className="flex flex-wrap gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  {job.city}, {job.province}
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-gray-400" />
                  {job.educationLevel || "Semua Jenjang"}
                </div>
              </div>

              {/* Full Location Address */}
              {job.location && (
                <div className="mt-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-gray-700">
                      Alamat Lengkap:
                    </span>{" "}
                    {job.location}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Gallery + Main Photo */}
            {(job.photo || (job.gallery && job.gallery.length > 0)) && (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                  <h2 className="font-bold text-gray-900 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-purple-500" />
                    Media & Galeri
                  </h2>
                </div>
                <div className="p-6">
                  {job.photo && (
                    <div
                      className="aspect-video rounded-2xl overflow-hidden bg-gray-100 mb-4 border border-gray-100 cursor-pointer hover:opacity-95 transition"
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
                          className="aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-100 hover:shadow-md transition-shadow cursor-pointer hover:opacity-95"
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

            {/* Image Modal */}
            {selectedImage && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                onClick={() => setSelectedImage(null)}
              >
                <div className="relative max-w-5xl w-full max-h-[90vh] flex items-center justify-center">
                  <button
                    onClick={() => setSelectedImage(null)}
                    className="absolute -top-12 right-0 text-white hover:text-gray-300 transition"
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

            {/* Description */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-50">
                <h2 className="font-bold text-gray-900 text-lg">
                  Deskripsi Pekerjaan
                </h2>
              </div>
              <div className="p-8 prose prose-slate max-w-none prose-p:text-gray-600 prose-headings:text-gray-900">
                <div className="whitespace-pre-wrap leading-relaxed">
                  {job.description}
                </div>
              </div>
            </div>

            {/* Requirements & Responsibilities */}
            <div className="grid md:grid-cols-2 gap-6">
              {job.requirements && (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    Persyaratan
                  </h3>
                  <div className="whitespace-pre-wrap text-gray-600 text-sm leading-relaxed">
                    {job.requirements}
                  </div>
                </div>
              )}
              {job.responsibilities && (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-blue-500" />
                    Tanggung Jawab
                  </h3>
                  <div className="whitespace-pre-wrap text-gray-600 text-sm leading-relaxed">
                    {job.responsibilities}
                  </div>
                </div>
              )}
            </div>

            {/* Benefits */}
            {job.benefits && job.benefits.length > 0 && (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-pink-500" />
                  Benefit & Fasilitas
                </h3>
                <div className="flex flex-wrap gap-3">
                  {job.benefits.map((benefit, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-pink-50/50 text-pink-700 border border-pink-100"
                    >
                      <CheckCircle className="w-4 h-4 text-pink-500" />
                      <span className="font-medium text-sm">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Right Column */}
          <div className="space-y-6">
            {/* Quick Summary Card */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-6 text-sm uppercase tracking-wider">
                Informasi Perekrutan
              </h3>
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-0.5">
                      Jumlah Posisi
                    </p>
                    <p className="font-semibold text-gray-900">
                      {job.numberOfPositions} Orang
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-0.5">Pendidikan</p>
                    <p className="font-semibold text-gray-900">
                      {job.educationLevel || "Semua Jurusan"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-0.5">Deadline</p>
                    <p className="font-semibold text-gray-900">
                      {job.applicationDeadline
                        ? formatDate(job.applicationDeadline)
                        : "-"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Schedule Info */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-6 text-sm uppercase tracking-wider">
                Jadwal & Waktu
              </h3>
              <div className="space-y-4">
                {job.isShift ? (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 mb-4">
                    <div className="flex items-center gap-2 text-amber-800 font-semibold mb-1">
                      <Clock className="w-4 h-4" />
                      Sistem Shift
                    </div>
                    <p className="text-sm text-amber-700">
                      {job.shiftCount} Shift / Hari
                    </p>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-green-50 border border-green-100 mb-4">
                    <div className="flex items-center gap-2 text-green-800 font-semibold mb-1">
                      <Clock className="w-4 h-4" />
                      Normal (Non-Shift)
                    </div>
                  </div>
                )}

                {job.workingDays && (
                  <div className="flex items-start gap-3 py-3 border-t border-gray-50">
                    <CalendarDays className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                        Hari Kerja
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {job.workingDays}
                      </p>
                    </div>
                  </div>
                )}

                {job.holidays && (
                  <div className="flex items-start gap-3 py-3 border-t border-gray-50">
                    <Coffee className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                        Hari Libur
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {job.holidays}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Rejection Alert */}
            {job.status === "REJECTED" && (
              <div className="bg-red-50 rounded-3xl p-6 border border-red-100">
                <div className="flex items-center gap-2 mb-3 text-red-700 font-bold">
                  <XCircle className="w-5 h-5" />
                  Alasan Penolakan
                </div>
                <p className="text-sm text-red-600 leading-relaxed bg-white/50 p-4 rounded-xl border border-red-100">
                  {job.rejectionReason}
                </p>
              </div>
            )}

            <div className="text-center">
              <p className="text-xs text-gray-400">
                Job ID: <span className="font-mono">{job.id}</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Created: {formatDate(job.createdAt)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
