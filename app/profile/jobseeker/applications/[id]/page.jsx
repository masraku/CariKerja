"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import Swal from "sweetalert2";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  ExternalLink,
  Video,
  Mail,
  Phone,
  Briefcase,
  GraduationCap,
  Star,
  TrendingUp,
  MessageSquare,
  Send,
  User,
  Eye,
  RefreshCw,
  ChevronRight,
  Download,
  LogOut,
  Upload,
  Loader2,
  X,
} from "lucide-react";

export default function ApplicationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState(null);
  const [interview, setInterview] = useState(null);
  const [showResignModal, setShowResignModal] = useState(false);
  const [resignReason, setResignReason] = useState("");
  const [resignLetterUrl, setResignLetterUrl] = useState("");
  const [uploadingLetter, setUploadingLetter] = useState(false);
  const [submittingResign, setSubmittingResign] = useState(false);
  const [resignationStatus, setResignationStatus] = useState(null);

  useEffect(() => {
    if (params.id) {
      loadApplicationDetail();
    }
  }, [params.id]);

  const loadApplicationDetail = async () => {
    try {
      setLoading(true);

      const { data } = await api.get(
        `/api/profile/jobseeker/applications/${params.id}`,
        {
          withCredentials: true,
        },
      );

      // API returns data in data field
      const appData = data.data || data.application;
      setApplication(appData);

      // If has interview from the response
      if (appData.interview) {
        await loadInterviewDetail(appData.id);
      } else if (
        appData.status === "INTERVIEW_SCHEDULED" ||
        appData.status === "INTERVIEW_COMPLETED"
      ) {
        await loadInterviewDetail(appData.id);
      } else {
        setInterview(null);
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Gagal memuat detail lamaran",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadInterviewDetail = async (applicationId) => {
    try {
      const { data } = await api.get(
        `/api/profile/jobseeker/applications/${applicationId}/interview`,
        {
          withCredentials: true,
        },
      );

      setInterview(
        data.interview
          ? {
              ...data.interview,
              participantStatus: data.participantStatus,
              responseMessage: data.responseMessage,
              respondedAt: data.respondedAt,
            }
          : null,
      );
    } catch (error) {}
  };

  useEffect(() => {
    const refreshApplication = () => {
      if (params.id) loadApplicationDetail();
    };

    window.addEventListener("pageshow", refreshApplication);
    window.addEventListener("focus", refreshApplication);

    return () => {
      window.removeEventListener("pageshow", refreshApplication);
      window.removeEventListener("focus", refreshApplication);
    };
  }, [params.id]);

  const handleRequestReschedule = async () => {
    if (interview?.participantStatus === "RESCHEDULE_REQUESTED") {
      Swal.fire({
        icon: "info",
        title: "Request Sudah Dikirim",
        text: "Permintaan reschedule Anda sedang menunggu konfirmasi recruiter.",
        confirmButtonColor: "#3b82f6",
      });
      return;
    }

    const { value: reason } = await Swal.fire({
      title: "Request Reschedule",
      html: `
                <p class="text-gray-600 mb-4 text-sm">Jelaskan alasan Anda meminta perubahan jadwal interview.</p>
                <textarea 
                    id="reschedule-reason" 
                    class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" 
                    placeholder="Contoh: Saya memiliki jadwal kuliah yang tidak dapat ditinggalkan pada waktu tersebut..."
                    rows="4"
                ></textarea>
            `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Kirim Request",
      cancelButtonText: "Batal",
      confirmButtonColor: "#f97316",
      preConfirm: () => {
        const reason = document.getElementById("reschedule-reason").value;
        if (!reason.trim()) {
          Swal.showValidationMessage("Mohon isi alasan reschedule");
          return false;
        }
        return reason;
      },
    });

    if (!reason) return;

    try {
      Swal.fire({
        title: "Mengirim Request...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      await api.post(
        `/api/profile/jobseeker/applications/${params.id}/reschedule`,
        { reason },
        {
          withCredentials: true,
        },
      );

      setInterview((current) =>
        current
          ? {
              ...current,
              participantStatus: "RESCHEDULE_REQUESTED",
              responseMessage: reason,
              respondedAt: new Date().toISOString(),
            }
          : current,
      );

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["jobseekerApplications"] }),
        queryClient.invalidateQueries({ queryKey: ["jobseekerInterviews"] }),
      ]);

      await loadApplicationDetail();

      await Swal.fire({
        icon: "success",
        title: "Request Terkirim!",
        text: "Permintaan reschedule Anda telah dikirim ke recruiter. Mohon tunggu konfirmasi.",
        confirmButtonColor: "#3b82f6",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Gagal mengirim request reschedule",
      });
    }
  };

  // Handle Letter Upload
  const handleLetterUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      Swal.fire({
        icon: "error",
        title: "Format Salah",
        text: "File harus dalam format PDF",
      });
      return;
    }

    try {
      setUploadingLetter(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", "resignation"); // Specify bucket to allow PDF upload

      const { data } = await api.post("/api/upload", formData, {
        withCredentials: true,
      });

      if (data.url) {
        setResignLetterUrl(data.url);
        Swal.fire({
          icon: "success",
          title: "Upload Berhasil",
          text: "Surat pengunduran diri berhasil diupload",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Upload Gagal",
        text: "Gagal mengupload surat pengunduran diri",
      });
    } finally {
      setUploadingLetter(false);
    }
  };

  // Handle Resign Submit
  const handleResignSubmit = async () => {
    if (!resignReason.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Form Tidak Lengkap",
        text: "Mohon isi alasan pengunduran diri",
      });
      return;
    }

    if (!resignLetterUrl) {
      Swal.fire({
        icon: "warning",
        title: "Form Tidak Lengkap",
        text: "Mohon upload surat pengunduran diri",
      });
      return;
    }

    try {
      setSubmittingResign(true);
      const { data } = await api.post(
        "/api/resignations/submit",
        {
          applicationId: application.id,
          reason: resignReason,
          letterUrl: resignLetterUrl,
        },
        {
          withCredentials: true,
        },
      );

      if (data.success) {
        setShowResignModal(false);
        setResignReason("");
        setResignLetterUrl("");
        Swal.fire({
          icon: "success",
          title: "Pengajuan Terkirim",
          text: "Pengajuan pengunduran diri Anda telah dikirim dan akan diproses oleh perusahaan.",
          confirmButtonColor: "#3b82f6",
        });
        loadApplicationDetail();
      } else {
        throw new Error(data.error || "Gagal mengajukan resign");
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Gagal mengajukan pengunduran diri",
      });
    } finally {
      setSubmittingResign(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusConfig = (status) => {
    const configs = {
      PENDING: {
        label: "Menunggu Review",
        color: "bg-amber-100 text-amber-800",
        indicator: "bg-amber-500",
        icon: Clock,
        description: "Lamaran Anda sedang dalam antrian untuk ditinjau.",
        tips: [
          "Pastikan profil Anda lengkap",
          "Periksa email secara berkala",
          "Siapkan dokumen pendukung",
        ],
      },
      REVIEWING: {
        label: "Sedang Ditinjau",
        color: "bg-blue-100 text-blue-800",
        indicator: "bg-blue-500",
        icon: Eye,
        description: "Tim rekrutmen sedang meninjau profil Anda.",
        tips: [
          "Lamaran Anda sedang diproses",
          "Pastikan nomor telepon aktif",
          "Cek spam folder email",
        ],
      },
      SHORTLISTED: {
        label: "Lolos Seleksi Awal",
        color: "bg-purple-100 text-purple-800",
        indicator: "bg-purple-500",
        icon: Star,
        description: "Selamat! Anda masuk kandidat terpilih.",
        tips: [
          "Persiapkan diri untuk interview",
          "Pelajari tentang perusahaan",
          "Siapkan pertanyaan",
        ],
      },
      INTERVIEW_SCHEDULED: {
        label: "Interview Dijadwalkan",
        color: "bg-indigo-100 text-indigo-800",
        indicator: "bg-indigo-500",
        icon: Video,
        description: "Cek detail interview di bawah.",
        tips: [
          "Pastikan koneksi internet stabil",
          "Test kamera dan mikrofon",
          "Siapkan tempat yang tenang",
        ],
      },
      INTERVIEW_COMPLETED: {
        label: "Interview Selesai",
        color: "bg-cyan-100 text-cyan-800",
        indicator: "bg-cyan-500",
        icon: CheckCircle,
        description: "Menunggu hasil interview.",
        tips: [
          "Kirim email terima kasih",
          "Tetap pantau email",
          "Persiapkan untuk tahap selanjutnya",
        ],
      },
      ACCEPTED: {
        label: "Diterima",
        color: "bg-emerald-100 text-emerald-800",
        indicator: "bg-emerald-500",
        icon: CheckCircle,
        description: "Selamat! Anda diterima bekerja.",
        tips: [
          "Segera hubungi recruiter",
          "Siapkan dokumen yang diperlukan",
          "Diskusikan tanggal mulai kerja",
        ],
      },
      REJECTED: {
        label: "Tidak Lolos",
        color: "bg-rose-100 text-rose-800",
        indicator: "bg-rose-500",
        icon: XCircle,
        description: "Mohon maaf, Anda belum lolos kali ini.",
        tips: ["Jangan menyerah!", "Coba posisi lain", "Tingkatkan skill Anda"],
      },
      WITHDRAWN: {
        label: "Ditarik",
        color: "bg-gray-100 text-gray-800",
        indicator: "bg-gray-500",
        icon: AlertCircle,
        description: "Lamaran telah ditarik.",
        tips: [],
      },
      RESIGNED: {
        label: "Mengundurkan Diri",
        color: "bg-orange-100 text-orange-800",
        indicator: "bg-orange-500",
        icon: LogOut,
        description: "Anda telah mengundurkan diri dari posisi ini.",
        tips: [],
      },
    };
    return configs[status] || configs.PENDING;
  };

  const getTimelineSteps = () => {
    const steps = [
      {
        key: "applied",
        label: "Lamaran Dikirim",
        date: application?.appliedAt,
        completed: true,
      },
      {
        key: "reviewing",
        label: "Ditinjau",
        date: application?.reviewedAt,
        completed: [
          "REVIEWING",
          "SHORTLISTED",
          "INTERVIEW_SCHEDULED",
          "INTERVIEW_COMPLETED",
          "ACCEPTED",
          "REJECTED",
        ].includes(application?.status),
      },
      {
        key: "interview",
        label: "Interview",
        date: interview?.scheduledAt,
        completed: [
          "INTERVIEW_SCHEDULED",
          "INTERVIEW_COMPLETED",
          "ACCEPTED",
        ].includes(application?.status),
      },
      {
        key: "result",
        label: "Hasil",
        date:
          application?.status === "ACCEPTED" ||
          application?.status === "REJECTED"
            ? new Date()
            : null,
        completed: ["ACCEPTED", "REJECTED"].includes(application?.status),
      },
    ];
    return steps;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat detail lamaran...</p>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Lamaran Tidak Ditemukan
          </h2>
          <Link href="/profile/jobseeker/applications">
            <button className="text-blue-600 hover:underline">
              Kembali ke Daftar Lamaran
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(application.status);
  const StatusIcon = statusConfig.icon;
  const timelineSteps = getTimelineSteps();
  const participantStatus = interview?.participantStatus;
  const isApprovedReschedule =
    interview?.title?.includes("(Reschedule)") &&
    participantStatus !== "RESCHEDULE_REQUESTED" &&
    participantStatus !== "DECLINED";
  const effectiveParticipantStatus = isApprovedReschedule
    ? "ACCEPTED"
    : participantStatus;
  const hasRequestedReschedule =
    participantStatus === "RESCHEDULE_REQUESTED";
  const canRequestReschedule =
    application.status === "INTERVIEW_SCHEDULED" &&
    !isApprovedReschedule &&
    ["PENDING", "ACCEPTED"].includes(effectiveParticipantStatus || "PENDING");

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${statusConfig.bgGradient} pt-24 pb-8`}
    >
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Back Button */}
        <Link href="/profile/jobseeker/applications">
          <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition mb-6">
            <ArrowLeft className="w-5 h-5" />
            Kembali ke Daftar Lamaran
          </button>
        </Link>

        {/* Main Status Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-6">
          {/* Status Header */}
          <div
            className={`bg-gradient-to-r ${statusConfig.bgGradient} p-4 sm:p-8 border-b`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
              {/* Company Logo & Info */}
              <div className="flex items-start gap-4 flex-1">
                {/* Company Logo */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                  {application.jobs?.companies?.logo ? (
                    <img
                      src={application.jobs.companies.logo}
                      alt={application.jobs.companies.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Building2 className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h1 className="text-lg sm:text-2xl font-bold text-gray-900 mb-1 truncate">
                    {application.jobs?.title}
                  </h1>
                  <p className="text-base sm:text-lg text-gray-700 mb-2 truncate">
                    {application.jobs?.companies?.name}
                  </p>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-gray-600 text-sm sm:text-base">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">
                        {application.jobs?.location || application.jobs?.city}
                      </span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">
                        Dilamar {formatDate(application.appliedAt)}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div
                className={`px-4 py-2 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl border-2 ${statusConfig.color} flex items-center gap-2 self-start sm:self-center flex-shrink-0`}
              >
                <StatusIcon
                  className={`w-5 h-5 sm:w-6 sm:h-6 ${statusConfig.iconColor}`}
                />
                <span className="font-bold text-sm sm:text-lg whitespace-nowrap">
                  {statusConfig.label}
                </span>
              </div>
            </div>
          </div>

          {/* Status Description */}
          <div className="p-4 sm:p-6 bg-white">
            <div className="flex items-start gap-3 sm:gap-4">
              <div
                className={`hidden sm:flex w-12 h-12 rounded-xl items-center justify-center flex-shrink-0 ${statusConfig.color}`}
              >
                <StatusIcon className={`w-6 h-6 ${statusConfig.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-700 text-base sm:text-lg">
                  {statusConfig.description}
                </p>

                {/* Tips */}
                {statusConfig.tips.length > 0 && (
                  <div className="mt-4 p-3 sm:p-4 bg-gray-50 rounded-xl">
                    <p className="font-semibold text-gray-800 mb-2">💡 Tips:</p>
                    <ul className="space-y-1">
                      {statusConfig.tips.map((tip, index) => (
                        <li
                          key={index}
                          className="text-gray-600 text-sm sm:text-base flex items-center gap-2"
                        >
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0"></span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Accepted Notice - Auto accepted, no manual confirmation needed */}
                {application.status === "ACCEPTED" && (
                  <div className="mt-6 space-y-4">
                    <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                      <div className="flex items-center gap-3 text-green-700">
                        <CheckCircle className="w-6 h-6 flex-shrink-0" />
                        <div>
                          <p className="font-semibold">
                            🎉 Selamat! Anda Diterima Bekerja
                          </p>
                          <p className="text-sm text-green-600">
                            Status Anda telah otomatis diperbarui menjadi "Sudah
                            Bekerja"
                          </p>
                          {application.respondedAt && (
                            <p className="text-xs text-green-500 mt-1">
                              Diterima pada{" "}
                              {formatDate(application.respondedAt)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Resign Button */}
                    {!application.resignation && (
                      <button
                        onClick={() => setShowResignModal(true)}
                        className="w-full bg-white border-2 border-orange-300 text-orange-600 py-3 rounded-2xl font-semibold hover:bg-orange-50 transition flex items-center justify-center gap-2"
                      >
                        <LogOut className="w-5 h-5" />
                        Ajukan Pengunduran Diri (Resign)
                      </button>
                    )}

                    {/* Resignation Status */}
                    {application.resignation && (
                      <div
                        className={`p-4 rounded-xl border ${
                          application.resignation.status === "PENDING"
                            ? "bg-yellow-50 border-yellow-200"
                            : application.resignation.status === "APPROVED"
                              ? "bg-green-50 border-green-200"
                              : "bg-red-50 border-red-200"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <LogOut
                            className={`w-6 h-6 ${
                              application.resignation.status === "PENDING"
                                ? "text-yellow-600"
                                : application.resignation.status === "APPROVED"
                                  ? "text-green-600"
                                  : "text-red-600"
                            }`}
                          />
                          <div>
                            <p className="font-semibold text-gray-900">
                              Pengajuan Resign:{" "}
                              {application.resignation.status === "PENDING"
                                ? "Menunggu Proses"
                                : application.resignation.status === "APPROVED"
                                  ? "Disetujui"
                                  : "Ditolak"}
                            </p>
                            <p className="text-sm text-gray-600">
                              Diajukan pada{" "}
                              {formatDate(application.resignation.createdAt)}
                            </p>
                            {application.resignation.recruiterNotes && (
                              <p className="text-sm text-gray-600 mt-1">
                                <strong>Catatan:</strong>{" "}
                                {application.resignation.recruiterNotes}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Interview Card - Show if interview scheduled */}
        {interview &&
          (application.status === "INTERVIEW_SCHEDULED" ||
            application.status === "INTERVIEW_COMPLETED") && (
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-6">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Video className="w-6 h-6" />
                  Detail Interview
                </h2>
              </div>
              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-gray-500 text-sm mb-1">
                      Judul Interview
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      {interview.title}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm mb-1">Tipe Meeting</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {interview.meetingType}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm mb-1">
                      Tanggal & Waktu
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatDate(interview.scheduledAt)} -{" "}
                      {formatTime(interview.scheduledAt)} WIB
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm mb-1">Durasi</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {interview.duration} menit
                    </p>
                  </div>
                </div>

                {interview.description && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                    <p className="text-gray-500 text-sm mb-1">
                      Catatan dari Recruiter
                    </p>
                    <p className="text-gray-800">{interview.description}</p>
                  </div>
                )}

                {hasRequestedReschedule && (
                  <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-xl">
                    <div className="flex items-start gap-3 text-orange-800">
                      <RefreshCw className="w-5 h-5 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold">
                          Permintaan reschedule sudah dikirim
                        </p>
                        <p className="text-sm text-orange-700 mt-1">
                          Status Anda sedang menunggu konfirmasi recruiter.
                        </p>
                        {interview.responseMessage && (
                          <p className="text-sm text-orange-700 mt-2">
                            <span className="font-semibold">Alasan Anda:</span>{" "}
                            {interview.responseMessage}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {isApprovedReschedule && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                    <div className="flex items-start gap-3 text-green-800">
                      <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold">
                          Jadwal reschedule sudah disetujui
                        </p>
                        <p className="text-sm text-green-700 mt-1">
                          Gunakan jadwal baru ini untuk mengikuti interview.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Join Meeting Button */}
                {application.status === "INTERVIEW_SCHEDULED" && interview && (
                    <div className="mt-6 space-y-3">
                      {effectiveParticipantStatus === "ACCEPTED" ? (
                        <Link
                          href={`/interviews/${interview.id}/room`}
                          className="block"
                        >
                          <button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-2xl font-bold text-lg hover:from-green-700 hover:to-emerald-700 transition shadow-lg flex items-center justify-center gap-3">
                            <Video className="w-6 h-6" />
                            Masuk Room Interview
                          </button>
                        </Link>
                      ) : hasRequestedReschedule ? (
                        <div className="w-full bg-orange-50 border border-orange-200 text-orange-800 py-4 px-4 rounded-2xl font-semibold flex items-center justify-center gap-3 text-center">
                          <RefreshCw className="w-5 h-5 flex-shrink-0" />
                          Menunggu konfirmasi reschedule dari recruiter
                        </div>
                      ) : effectiveParticipantStatus === "DECLINED" ? (
                        <div className="w-full bg-red-50 border border-red-200 text-red-700 py-4 px-4 rounded-2xl font-semibold flex items-center justify-center gap-3 text-center">
                          <XCircle className="w-5 h-5 flex-shrink-0" />
                          Anda sudah menolak undangan interview ini
                        </div>
                      ) : (
                        <Link
                          href={`/profile/jobseeker/interviews/${interview.id}`}
                          className="block"
                        >
                          <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-2xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transition shadow-lg flex items-center justify-center gap-3">
                            <Calendar className="w-6 h-6" />
                            Konfirmasi Undangan Interview
                          </button>
                        </Link>
                      )}
                      {!hasRequestedReschedule &&
                        effectiveParticipantStatus !== "DECLINED" && (
                          <p className="text-center text-gray-500 text-sm">
                            Klik untuk membuka room internal saat jadwal interview
                            tiba
                          </p>
                        )}

                      {/* Request Reschedule Button */}
                      {canRequestReschedule && (
                        <>
                          <button
                            onClick={handleRequestReschedule}
                            className="w-full bg-white border-2 border-orange-300 text-orange-600 py-3 rounded-2xl font-semibold hover:bg-orange-50 transition flex items-center justify-center gap-2"
                          >
                            <RefreshCw className="w-5 h-5" />
                            Minta Reschedule Interview
                          </button>
                          <p className="text-center text-gray-400 text-xs">
                            Jika ada kendala, Anda dapat meminta jadwal ulang
                          </p>
                        </>
                      )}
                    </div>
                  )}
              </div>
            </div>
          )}

        {/* Timeline */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-6">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">
              Timeline Lamaran
            </h2>
          </div>
          <div className="p-6">
            <div className="relative">
              {timelineSteps.map((step, index) => (
                <div
                  key={step.key}
                  className="flex items-start gap-4 mb-6 last:mb-0"
                >
                  {/* Line */}
                  <div className="relative">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        step.completed
                          ? "bg-green-500 text-white"
                          : "bg-gray-200 text-gray-400"
                      }`}
                    >
                      {step.completed ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <span className="text-sm font-bold">{index + 1}</span>
                      )}
                    </div>
                    {index < timelineSteps.length - 1 && (
                      <div
                        className={`absolute top-10 left-1/2 w-0.5 h-12 -translate-x-1/2 ${
                          step.completed ? "bg-green-500" : "bg-gray-200"
                        }`}
                      ></div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-6">
                    <p
                      className={`font-semibold ${
                        step.completed ? "text-gray-900" : "text-gray-400"
                      }`}
                    >
                      {step.label}
                    </p>
                    {step.date && step.completed && (
                      <p className="text-sm text-gray-500">
                        {formatDate(step.date)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Application Details */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-6">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">Detail Lamaran</h2>
          </div>
          <div className="p-6 space-y-6">
            {/* Cover Letter */}
            {application.coverLetter && (
              <div>
                <p className="text-gray-500 text-sm mb-2 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Cover Letter
                </p>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {application.coverLetter}
                  </p>
                </div>
              </div>
            )}

            {/* Resume */}
            {application.jobseekers?.cvUrl && (
              <div>
                <p className="text-gray-500 text-sm mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  CV / Resume
                </p>
                <a
                  href={application.jobseekers.cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition"
                >
                  <FileText className="w-5 h-5" />
                  Lihat CV
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}

            {/* Recruiter Notes */}
            {application.recruiterNotes && (
              <div>
                <p className="text-gray-500 text-sm mb-2 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Catatan dari Recruiter
                </p>
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <p className="text-blue-800">{application.recruiterNotes}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Job Details */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">
              Tentang Lowongan
            </h2>
          </div>
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Briefcase className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Tipe Pekerjaan</p>
                  <p className="font-semibold text-gray-900">
                    {application.jobs?.jobType}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <TrendingUp className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Level</p>
                  <p className="font-semibold text-gray-900">
                    {application.jobs?.level}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <MapPin className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Lokasi</p>
                  <p className="font-semibold text-gray-900">
                    {application.jobs?.location ||
                      `${application.jobs?.city}, ${application.jobs?.province}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Building2 className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Perusahaan</p>
                  <p className="font-semibold text-gray-900">
                    {application.jobs?.companies?.name}
                  </p>
                </div>
              </div>
            </div>

            <Link href={`/jobs/${application.jobs?.slug}`}>
              <button className="w-full mt-6 py-3 border-2 border-blue-600 text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition flex items-center justify-center gap-2">
                <Eye className="w-5 h-5" />
                Lihat Detail Lowongan
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Resign Modal */}
      {showResignModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <LogOut className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Ajukan Pengunduran Diri
                    </h3>
                    <p className="text-sm text-gray-500">
                      Isi form berikut dengan lengkap
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowResignModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Reason */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Alasan Pengunduran Diri *
                </label>
                <textarea
                  value={resignReason}
                  onChange={(e) => setResignReason(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
                  placeholder="Jelaskan alasan Anda mengundurkan diri dari posisi ini..."
                />
              </div>

              {/* Upload Letter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Surat Pengunduran Diri (PDF) *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-orange-400 transition">
                  {resignLetterUrl ? (
                    <div className="flex items-center justify-center gap-3">
                      <FileText className="w-8 h-8 text-green-500" />
                      <div className="text-left">
                        <p className="font-semibold text-gray-900">
                          Surat berhasil diupload
                        </p>
                        <a
                          href={resignLetterUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          Lihat file
                        </a>
                      </div>
                      <button
                        onClick={() => setResignLetterUrl("")}
                        className="p-1 hover:bg-red-100 rounded-lg"
                      >
                        <X className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={handleLetterUpload}
                        className="hidden"
                        disabled={uploadingLetter}
                      />
                      {uploadingLetter ? (
                        <div className="flex flex-col items-center">
                          <Loader2 className="w-10 h-10 text-orange-500 animate-spin mb-2" />
                          <p className="text-gray-600">Mengupload...</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <Upload className="w-10 h-10 text-gray-400 mb-2" />
                          <p className="font-semibold text-gray-700">
                            Klik untuk upload
                          </p>
                          <p className="text-sm text-gray-500">
                            Format: PDF (max 5MB)
                          </p>
                        </div>
                      )}
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setShowResignModal(false)}
                className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition"
              >
                Batal
              </button>
              <button
                onClick={handleResignSubmit}
                disabled={submittingResign || !resignReason || !resignLetterUrl}
                className={`flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition ${
                  submittingResign || !resignReason || !resignLetterUrl
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-orange-600 text-white hover:bg-orange-700"
                }`}
              >
                {submittingResign ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Mengirim...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Ajukan Resign
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
