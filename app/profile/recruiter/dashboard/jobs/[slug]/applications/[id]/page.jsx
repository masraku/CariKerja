"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  GraduationCap,
  Award,
  FileText,
  Download,
  ExternalLink,
  Linkedin,
  Github,
  Globe,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Video,
  Trash2,
  Star,
  User,
  MessageSquare,
} from "lucide-react";
import Swal from "sweetalert2";

export default function ApplicationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState(null);

  useEffect(() => {
    loadApplication();
  }, []);

  const loadApplication = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await fetch(
        `/api/profile/recruiter/applications/${params.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setApplication(data.application);
      } else {
        console.error("API Error:", data);
        throw new Error(
          data.error || data.details || "Failed to load application"
        );
      }
    } catch (error) {
      console.error("Load application error:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load application",
      });
      router.push(
        `/profile/recruiter/dashboard/jobs/${params.slug}/applications`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptCandidate = async () => {
    const result = await Swal.fire({
      title: "🎉 Terima Kandidat?",
      html: `
                <p class="text-gray-600 mb-4">Kandidat akan menerima notifikasi bahwa mereka diterima untuk posisi ini.</p>
                <textarea 
                    id="accept-message" 
                    class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                    placeholder="Pesan untuk kandidat (opsional)&#10;Contoh: Selamat! Silakan hubungi HR kami untuk proses selanjutnya..."
                    rows="4"
                ></textarea>
            `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "✓ Ya, Terima Kandidat",
      cancelButtonText: "Batal",
      confirmButtonColor: "#10b981",
      customClass: {
        popup: "rounded-2xl",
        confirmButton: "rounded-xl px-6",
        cancelButton: "rounded-xl px-6",
      },
      preConfirm: () => {
        return document.getElementById("accept-message").value;
      },
    });

    if (!result.isConfirmed) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `/api/profile/recruiter/applications/${params.id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "ACCEPTED",
            recruiterNotes: result.value,
          }),
        }
      );

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Berhasil! 🎉",
          text: "Kandidat berhasil diterima. Email notifikasi akan dikirim.",
          timer: 2500,
          showConfirmButton: false,
        });
        loadApplication();
      } else {
        throw new Error("Failed to accept candidate");
      }
    } catch (error) {
      console.error("Accept candidate error:", error);
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Gagal menerima kandidat",
      });
    }
  };

  const handleRejectCandidate = async () => {
    const result = await Swal.fire({
      title: "Tolak Kandidat?",
      html: `
                <p class="text-gray-600 mb-4">Kandidat akan menerima notifikasi bahwa mereka tidak lolos untuk posisi ini.</p>
                <textarea 
                    id="reject-reason" 
                    class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent" 
                    placeholder="Alasan penolakan (opsional)&#10;Contoh: Terima kasih atas minat Anda. Sayangnya profil Anda belum sesuai dengan kebutuhan kami saat ini..."
                    rows="4"
                ></textarea>
            `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "✗ Ya, Tolak Kandidat",
      cancelButtonText: "Batal",
      confirmButtonColor: "#ef4444",
      customClass: {
        popup: "rounded-2xl",
        confirmButton: "rounded-xl px-6",
        cancelButton: "rounded-xl px-6",
      },
      preConfirm: () => {
        return document.getElementById("reject-reason").value;
      },
    });

    if (!result.isConfirmed) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `/api/profile/recruiter/applications/${params.id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "REJECTED",
            recruiterNotes: result.value,
          }),
        }
      );

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Kandidat Ditolak",
          text: "Email notifikasi akan dikirim ke kandidat.",
          timer: 2000,
          showConfirmButton: false,
        });
        loadApplication();
      } else {
        throw new Error("Failed to reject candidate");
      }
    } catch (error) {
      console.error("Reject candidate error:", error);
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Gagal menolak kandidat",
      });
    }
  };

  const handleDeleteApplication = async () => {
    const result = await Swal.fire({
      title: "Hapus Lamaran?",
      html: `<p>Apakah Anda yakin ingin menghapus lamaran ini?</p><p class="text-sm text-gray-500 mt-2">Tindakan ini tidak dapat dibatalkan.</p>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#ef4444",
    });

    if (!result.isConfirmed) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `/api/profile/recruiter/applications/${params.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Lamaran berhasil dihapus",
          timer: 2000,
          showConfirmButton: false,
        });
        router.push(
          `/profile/recruiter/dashboard/jobs/${params.slug}/applications`
        );
      } else {
        throw new Error("Failed to delete application");
      }
    } catch (error) {
      console.error("Delete application error:", error);
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Gagal menghapus lamaran",
      });
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusConfig = (status) => {
    const configs = {
      PENDING: {
        label: "Menunggu Review",
        color: "bg-yellow-100 text-yellow-800 border-yellow-300",
        bgGradient: "from-yellow-500 to-orange-500",
        icon: Clock,
      },
      REVIEWING: {
        label: "Sedang Direview",
        color: "bg-blue-100 text-blue-800 border-blue-300",
        bgGradient: "from-blue-500 to-indigo-500",
        icon: Eye,
      },
      INTERVIEW_SCHEDULED: {
        label: "Interview Dijadwalkan",
        color: "bg-indigo-100 text-indigo-800 border-indigo-300",
        bgGradient: "from-indigo-500 to-purple-500",
        icon: Calendar,
      },
      INTERVIEW_COMPLETED: {
        label: "Interview Selesai",
        color: "bg-purple-100 text-purple-800 border-purple-300",
        bgGradient: "from-purple-500 to-pink-500",
        icon: Video,
      },
      ACCEPTED: {
        label: "Diterima 🎉",
        color: "bg-green-100 text-green-800 border-green-300",
        bgGradient: "from-green-500 to-emerald-500",
        icon: CheckCircle,
      },
      REJECTED: {
        label: "Ditolak",
        color: "bg-red-100 text-red-800 border-red-300",
        bgGradient: "from-red-500 to-pink-500",
        icon: XCircle,
      },
    };
    return configs[status] || configs.PENDING;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data kandidat...</p>
        </div>
      </div>
    );
  }

  if (!application) return null;

  const jobseeker = application.jobseekers;
  const statusConfig = getStatusConfig(application.status);
  const StatusIcon = statusConfig.icon;
  const interview = application.interview;

  // Check if interview time has passed (can mark as complete)
  const interviewTimePassed = interview?.scheduledAt
    ? new Date(interview.scheduledAt) < new Date()
    : false;
  const canMarkComplete =
    application.status === "INTERVIEW_SCHEDULED" && interviewTimePassed;

  // Check for reschedule request in recruiterNotes
  const hasRescheduleRequest = application.recruiterNotes?.includes(
    "[RESCHEDULE REQUEST"
  );
  const rescheduleRequestMatch = application.recruiterNotes?.match(
    /\[RESCHEDULE REQUEST - ([^\]]+)\]\n(.+?)(?=\n\n|\n\[|$)/s
  );
  const rescheduleInfo = rescheduleRequestMatch
    ? {
        date: rescheduleRequestMatch[1],
        reason: rescheduleRequestMatch[2]?.trim(),
      }
    : null;

  // Handle mark interview as complete
  const handleMarkInterviewComplete = async () => {
    const result = await Swal.fire({
      title: "Selesaikan Interview?",
      html: `
                <p class="text-gray-600 mb-4">Tandai interview ini sebagai selesai agar bisa memberikan keputusan untuk kandidat.</p>
            `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "✓ Ya, Interview Selesai",
      cancelButtonText: "Batal",
      confirmButtonColor: "#8b5cf6",
      customClass: {
        popup: "rounded-2xl",
      },
    });

    if (!result.isConfirmed) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `/api/profile/recruiter/applications/${params.id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "INTERVIEW_COMPLETED",
          }),
        }
      );

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Interview Ditandai Selesai",
          text: "Anda sekarang dapat memberikan keputusan untuk kandidat ini.",
          timer: 2000,
          showConfirmButton: false,
        });
        loadApplication();
      } else {
        throw new Error("Failed to mark interview complete");
      }
    } catch (error) {
      console.error("Mark complete error:", error);
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Gagal menandai interview selesai",
      });
    }
  };

  // Handle reschedule interview
  const handleRescheduleInterview = async () => {
    const result = await Swal.fire({
      title: "📅 Jadwalkan Ulang Interview",
      html: `
                <p class="text-gray-600 mb-4">Pelamar meminta perubahan jadwal interview.</p>
                ${
                  rescheduleInfo
                    ? `<div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 text-left">
                    <p class="text-xs text-yellow-700 mb-1">Alasan request:</p>
                    <p class="text-sm text-gray-700">${rescheduleInfo.reason}</p>
                </div>`
                    : ""
                }
                <div class="space-y-3 text-left">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Tanggal & Waktu Baru</label>
                        <input type="datetime-local" id="new-datetime" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Link Meeting (Opsional)</label>
                        <input type="text" id="new-meeting-url" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="https://meet.google.com/..." value="${
                          interview?.meetingUrl || ""
                        }" />
                    </div>
                </div>
            `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "✓ Simpan Jadwal Baru",
      cancelButtonText: "Batal",
      confirmButtonColor: "#3b82f6",
      customClass: {
        popup: "rounded-2xl",
        confirmButton: "rounded-xl px-6",
        cancelButton: "rounded-xl px-6",
      },
      preConfirm: () => {
        const datetime = document.getElementById("new-datetime").value;
        const meetingUrl = document.getElementById("new-meeting-url").value;
        if (!datetime) {
          Swal.showValidationMessage("Tanggal dan waktu wajib diisi");
          return false;
        }
        return { datetime, meetingUrl };
      },
    });

    if (!result.isConfirmed) return;

    try {
      Swal.fire({
        title: "Menyimpan...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const token = localStorage.getItem("token");
      const response = await fetch(
        `/api/profile/recruiter/applications/${params.id}/reschedule`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            newDateTime: result.value.datetime,
            meetingUrl: result.value.meetingUrl,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        await Swal.fire({
          icon: "success",
          title: "Jadwal Diperbarui!",
          text: "Pelamar akan menerima notifikasi jadwal interview baru.",
          confirmButtonColor: "#3b82f6",
        });
        loadApplication();
      } else {
        throw new Error(data.error || "Gagal memperbarui jadwal");
      }
    } catch (error) {
      console.error("Reschedule error:", error);
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: error.message || "Gagal memperbarui jadwal interview",
      });
    }
  };

  // Handle reject reschedule request
  const handleRejectReschedule = async () => {
    const result = await Swal.fire({
      title: "Tolak Request Reschedule?",
      html: `
                <p class="text-gray-600 mb-4">Pelamar akan diberitahu bahwa request reschedule ditolak dan interview tetap sesuai jadwal semula.</p>
                <textarea 
                    id="reject-reason" 
                    class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent" 
                    placeholder="Alasan penolakan (opsional)&#10;Contoh: Jadwal sudah tidak bisa diubah karena interviewer sudah dikonfirmasi..."
                    rows="3"
                ></textarea>
            `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "✗ Ya, Tolak Request",
      cancelButtonText: "Batal",
      confirmButtonColor: "#ef4444",
      customClass: {
        popup: "rounded-2xl",
        confirmButton: "rounded-xl px-6",
        cancelButton: "rounded-xl px-6",
      },
      preConfirm: () => {
        return document.getElementById("reject-reason").value;
      },
    });

    if (!result.isConfirmed) return;

    try {
      Swal.fire({
        title: "Memproses...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const token = localStorage.getItem("token");
      const response = await fetch(
        `/api/profile/recruiter/applications/${params.id}/reschedule`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reason: result.value,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        await Swal.fire({
          icon: "success",
          title: "Request Ditolak",
          text: "Pelamar akan menerima notifikasi bahwa request reschedule ditolak.",
          confirmButtonColor: "#3b82f6",
        });
        loadApplication();
      } else {
        throw new Error(data.error || "Gagal menolak request");
      }
    } catch (error) {
      console.error("Reject reschedule error:", error);
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: error.message || "Gagal menolak request reschedule",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Header with Gradient */}
      <div className={`bg-gradient-to-r ${statusConfig.bgGradient} text-white`}>
        <div className="container mx-auto px-4 max-w-6xl py-6">
          <button
            onClick={() =>
              router.push(
                `/profile/recruiter/dashboard/jobs/${params.slug}/applications`
              )
            }
            className="flex items-center gap-2 text-white/80 hover:text-white transition mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Kembali ke Daftar Pelamar
          </button>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-3xl font-bold overflow-hidden border-2 border-white/30">
                {jobseeker.photo ? (
                  <img
                    src={jobseeker.photo}
                    alt={jobseeker.firstName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  jobseeker.firstName?.charAt(0) || "U"
                )}
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">
                  {jobseeker.firstName} {jobseeker.lastName}
                </h1>
                <p className="text-white/80">
                  {jobseeker.currentTitle || "Job Seeker"}
                </p>
              </div>
            </div>

            {/* Status Badge */}
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 ${statusConfig.color} font-semibold`}
            >
              <StatusIcon className="w-5 h-5" />
              {statusConfig.label}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl py-8 -mt-4">
        {/* Action Cards - Decision After Interview */}
        {application.status === "INTERVIEW_COMPLETED" && (
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 mb-6 text-white shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold mb-1">
                  🎯 Interview Selesai!
                </h2>
                <p className="text-white/80">
                  Silakan berikan keputusan untuk kandidat ini.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleAcceptCandidate}
                  className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold transition shadow-lg"
                >
                  <CheckCircle className="w-5 h-5" />
                  Terima Kandidat
                </button>
                <button
                  onClick={handleRejectCandidate}
                  className="flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-red-500 text-white rounded-xl font-semibold transition border border-white/30"
                >
                  <XCircle className="w-5 h-5" />
                  Tolak
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reschedule Request Alert */}
        {hasRescheduleRequest &&
          application.status === "INTERVIEW_SCHEDULED" && (
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-6 mb-6 text-white shadow-xl">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                    📅 Request Reschedule Interview
                  </h2>
                  <p className="text-white/90 mb-3">
                    Pelamar{" "}
                    <span className="font-semibold">
                      {jobseeker.firstName} {jobseeker.lastName}
                    </span>{" "}
                    meminta perubahan jadwal interview.
                  </p>
                  {rescheduleInfo && (
                    <div className="bg-white/20 backdrop-blur rounded-xl p-4">
                      <p className="text-xs text-white/70 mb-1">Alasan:</p>
                      <p className="text-white font-medium">
                        {rescheduleInfo.reason}
                      </p>
                      <p className="text-xs text-white/60 mt-2">
                        Dikirim: {rescheduleInfo.date}
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleRescheduleInterview}
                    className="flex items-center gap-2 px-6 py-3 bg-white text-orange-600 rounded-xl font-semibold hover:bg-orange-50 transition shadow-lg whitespace-nowrap"
                  >
                    <Calendar className="w-5 h-5" />
                    Jadwalkan Ulang
                  </button>
                  <button
                    onClick={handleRejectReschedule}
                    className="flex items-center gap-2 px-6 py-3 bg-white/20 text-white rounded-xl font-semibold hover:bg-red-600 transition border border-white/30 whitespace-nowrap"
                  >
                    <XCircle className="w-5 h-5" />
                    Tolak Request
                  </button>
                </div>
              </div>
            </div>
          )}

        {/* Interview Info Card */}
        {(application.status === "INTERVIEW_SCHEDULED" ||
          application.status === "INTERVIEW_COMPLETED") &&
          interview && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Video className="w-5 h-5 text-indigo-600" />
                Informasi Interview
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-indigo-50 rounded-xl p-4">
                  <p className="text-xs text-indigo-600 font-medium mb-1">
                    Judul
                  </p>
                  <p className="font-semibold text-gray-900">
                    {interview.title}
                  </p>
                </div>
                <div className="bg-blue-50 rounded-xl p-4">
                  <p className="text-xs text-blue-600 font-medium mb-1">
                    Tanggal & Waktu
                  </p>
                  <p className="font-semibold text-gray-900">
                    {formatDate(interview.scheduledAt)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {formatTime(interview.scheduledAt)} WIB
                  </p>
                </div>
                <div className="bg-purple-50 rounded-xl p-4">
                  <p className="text-xs text-purple-600 font-medium mb-1">
                    Durasi
                  </p>
                  <p className="font-semibold text-gray-900">
                    {interview.duration} menit
                  </p>
                </div>
                <div className="bg-green-50 rounded-xl p-4">
                  <p className="text-xs text-green-600 font-medium mb-1">
                    Tipe Meeting
                  </p>
                  <p className="font-semibold text-gray-900">
                    {interview.meetingType}
                  </p>
                </div>
              </div>

              {/* Join Meeting Button & Mark Complete */}
              {application.status === "INTERVIEW_SCHEDULED" && (
                <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center gap-3">
                  {interview.meetingUrl && (
                    <a
                      href={interview.meetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition shadow-lg"
                    >
                      <Video className="w-5 h-5" />
                      Masuk Room Interview
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}

                  {/* Mark as Complete Button - Only show if interview time has passed */}
                  {canMarkComplete ? (
                    <button
                      onClick={handleMarkInterviewComplete}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition shadow-lg"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Selesaikan Interview
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 text-yellow-700 rounded-xl text-sm">
                      <Clock className="w-4 h-4" />
                      Interview belum dimulai. Tunggu hingga waktu interview
                      tiba.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        {/* Quick Info Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-blue-600" />
              <span className="text-gray-500">Melamar:</span>
              <span className="font-semibold text-gray-900">
                {application.jobs.title}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-green-600" />
              <span className="text-gray-500">Tanggal Lamar:</span>
              <span className="font-semibold text-gray-900">
                {formatDate(application.appliedAt)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-gray-500">Kelengkapan Profil:</span>
              <span
                className={`font-semibold ${
                  application.profileCompleteness >= 80
                    ? "text-green-600"
                    : "text-yellow-600"
                }`}
              >
                {application.profileCompleteness}%
              </span>
            </div>
          </div>
        </div>

        {/* Contact & Actions Row */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Contact Info */}
            <div className="flex flex-wrap items-center gap-4">
              {jobseeker.email && (
                <a
                  href={`mailto:${jobseeker.email}`}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl hover:bg-blue-100 transition text-gray-700 hover:text-blue-700"
                >
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">{jobseeker.email}</span>
                </a>
              )}
              {jobseeker.phone && (
                <a
                  href={`tel:${jobseeker.phone}`}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl hover:bg-green-100 transition text-gray-700 hover:text-green-700"
                >
                  <Phone className="w-4 h-4" />
                  <span className="text-sm">{jobseeker.phone}</span>
                </a>
              )}
              {jobseeker.city && (
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl text-gray-700">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">
                    {jobseeker.city}
                    {jobseeker.province && `, ${jobseeker.province}`}
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {jobseeker.cvUrl && (
                <a
                  href={jobseeker.cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition text-sm font-medium"
                >
                  <Download className="w-4 h-4" />
                  Download CV
                </a>
              )}
              {application.status === "REVIEWING" && (
                <button
                  onClick={() =>
                    router.push(
                      `/profile/recruiter/dashboard/interview?job=${application.jobs.id}&applicants=${params.id}`
                    )
                  }
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition text-sm font-medium"
                >
                  <Video className="w-4 h-4" />
                  Undang Interview
                </button>
              )}
              {!["ACCEPTED", "REJECTED"].includes(application.status) && (
                <button
                  onClick={handleDeleteApplication}
                  className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition text-sm font-medium"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Social Links */}
          {(jobseeker.linkedinUrl ||
            jobseeker.githubUrl ||
            jobseeker.portfolioUrl ||
            jobseeker.websiteUrl) && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
              {jobseeker.linkedinUrl && (
                <a
                  href={jobseeker.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm hover:bg-blue-100 transition"
                >
                  <Linkedin className="w-4 h-4" /> LinkedIn
                </a>
              )}
              {jobseeker.githubUrl && (
                <a
                  href={jobseeker.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition"
                >
                  <Github className="w-4 h-4" /> GitHub
                </a>
              )}
              {jobseeker.portfolioUrl && (
                <a
                  href={jobseeker.portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-sm hover:bg-purple-100 transition"
                >
                  <Globe className="w-4 h-4" /> Portfolio
                </a>
              )}
              {jobseeker.websiteUrl && (
                <a
                  href={jobseeker.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-sm hover:bg-indigo-100 transition"
                >
                  <Globe className="w-4 h-4" /> Website
                </a>
              )}
            </div>
          )}
        </div>

        {/* Main Content - 2 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cover Letter */}
            {application.coverLetter && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  Cover Letter
                </h3>
                <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {application.coverLetter}
                  </p>
                </div>
              </div>
            )}

            {/* Professional Summary */}
            {jobseeker.summary && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-indigo-600" />
                  Ringkasan Profesional
                </h3>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {jobseeker.summary}
                </p>
              </div>
            )}

            {/* Work Experience */}
            {jobseeker.workExperiences &&
              jobseeker.workExperiences.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-blue-600" />
                    Pengalaman Kerja
                  </h3>
                  <div className="space-y-4">
                    {jobseeker.workExperiences.map((exp, index) => (
                      <div
                        key={exp.id}
                        className={`relative pl-6 ${
                          index !== jobseeker.workExperiences.length - 1
                            ? "pb-4 border-l-2 border-blue-200"
                            : ""
                        }`}
                      >
                        <div className="absolute left-0 top-0 w-3 h-3 bg-blue-500 rounded-full -translate-x-[7px]"></div>
                        <div className="bg-gray-50 rounded-xl p-4">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                            <div>
                              <h4 className="font-bold text-gray-900">
                                {exp.jobTitle}
                              </h4>
                              <p className="text-blue-600 font-medium">
                                {exp.company}
                              </p>
                            </div>
                            <span className="text-xs text-gray-500 bg-white px-3 py-1 rounded-full border whitespace-nowrap">
                              {formatDate(exp.startDate)} -{" "}
                              {exp.isCurrentJob
                                ? "Sekarang"
                                : formatDate(exp.endDate)}
                            </span>
                          </div>
                          {exp.description && (
                            <p className="text-gray-600 text-sm whitespace-pre-wrap">
                              {exp.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Education - Simplified */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-green-600" />
                Pendidikan Terakhir
              </h3>
              {jobseeker.lastEducationLevel ||
              jobseeker.lastEducationInstitution ? (
                <div className="bg-green-50/50 rounded-xl p-4 border border-green-100">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600 font-bold text-lg shrink-0">
                      {jobseeker.lastEducationLevel?.charAt(0) || "?"}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">
                        {jobseeker.lastEducationInstitution || "-"}
                      </h4>
                      <p className="text-green-600 font-medium">
                        {jobseeker.lastEducationLevel}
                        {jobseeker.lastEducationMajor &&
                          ` - ${jobseeker.lastEducationMajor}`}
                      </p>
                      {jobseeker.graduationYear && (
                        <p className="text-sm text-gray-500 mt-1">
                          Lulus: {jobseeker.graduationYear}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : jobseeker.educations && jobseeker.educations.length > 0 ? (
                <div className="space-y-4">
                  {jobseeker.educations.map((edu) => (
                    <div
                      key={edu.id}
                      className="bg-green-50/50 rounded-xl p-4 border border-green-100"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-1">
                        <div>
                          <h4 className="font-bold text-gray-900">
                            {edu.degree}{" "}
                            {edu.fieldOfStudy && `- ${edu.fieldOfStudy}`}
                          </h4>
                          <p className="text-green-600 font-medium">
                            {edu.institution}
                          </p>
                        </div>
                        <span className="text-xs text-gray-500 bg-white px-3 py-1 rounded-full border whitespace-nowrap">
                          {formatDate(edu.startDate)} -{" "}
                          {edu.isCurrentlyStudying
                            ? "Sekarang"
                            : formatDate(edu.endDate)}
                        </span>
                      </div>
                      {edu.gpa && (
                        <p className="text-sm text-gray-600">IPK: {edu.gpa}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">
                  Belum ada data pendidikan.
                </p>
              )}
            </div>

            {/* Documents Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-600" />
                Dokumen Pelamar
              </h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  {
                    key: "cvUrl",
                    label: "CV / Resume",
                    url: jobseeker.cvUrl,
                    required: true,
                  },
                  {
                    key: "ktpUrl",
                    label: "KTP",
                    url: jobseeker.ktpUrl,
                    required: true,
                  },
                  {
                    key: "ak1Url",
                    label: "AK-1 (Kartu Kuning)",
                    url: jobseeker.ak1Url,
                    required: true,
                  },
                  {
                    key: "ijazahUrl",
                    label: "Ijazah",
                    url: jobseeker.ijazahUrl,
                    required: true,
                  },
                  {
                    key: "sertifikatUrl",
                    label: "Sertifikat",
                    url: jobseeker.sertifikatUrl,
                    required: false,
                  },
                  {
                    key: "suratPengalamanUrl",
                    label: "Surat Pengalaman",
                    url: jobseeker.suratPengalamanUrl,
                    required: false,
                  },
                ].map((doc) => (
                  <div
                    key={doc.key}
                    className={`flex items-center justify-between p-3 rounded-xl border ${
                      doc.url
                        ? "bg-green-50 border-green-200"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {doc.url ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                      )}
                      <span
                        className={`text-sm font-medium ${
                          doc.url ? "text-green-700" : "text-gray-500"
                        }`}
                      >
                        {doc.label}
                      </span>
                    </div>
                    {doc.url && (
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Skills */}
            {jobseeker.skills && jobseeker.skills.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-600" />
                  Keahlian
                </h3>
                <div className="flex flex-wrap gap-2">
                  {jobseeker.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-100"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications */}
            {jobseeker.certifications &&
              jobseeker.certifications.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-purple-600" />
                    Sertifikasi
                  </h3>
                  <div className="space-y-3">
                    {jobseeker.certifications.map((cert) => (
                      <div
                        key={cert.id}
                        className="bg-purple-50/50 rounded-xl p-4 border border-purple-100"
                      >
                        <h4 className="font-semibold text-gray-900 text-sm">
                          {cert.name}
                        </h4>
                        <p className="text-purple-600 text-xs">
                          {cert.issuingOrganization}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(cert.issueDate)}
                        </p>
                        {cert.credentialUrl && (
                          <a
                            href={cert.credentialUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 mt-2"
                          >
                            Lihat <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Additional Info */}
            {(jobseeker.dateOfBirth ||
              jobseeker.gender ||
              jobseeker.maritalStatus ||
              jobseeker.expectedSalary ||
              jobseeker.address) && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Info Tambahan
                </h3>
                <div className="space-y-3 text-sm">
                  {jobseeker.dateOfBirth && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Tanggal Lahir</span>
                      <span className="font-medium text-gray-900">
                        {formatDate(jobseeker.dateOfBirth)}
                      </span>
                    </div>
                  )}
                  {jobseeker.gender && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Jenis Kelamin</span>
                      <span className="font-medium text-gray-900">
                        {jobseeker.gender === "MALE"
                          ? "Laki-laki"
                          : "Perempuan"}
                      </span>
                    </div>
                  )}
                  {jobseeker.maritalStatus && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Status</span>
                      <span className="font-medium text-gray-900">
                        {jobseeker.maritalStatus === "SINGLE"
                          ? "Belum Menikah"
                          : jobseeker.maritalStatus === "MARRIED"
                          ? "Menikah"
                          : jobseeker.maritalStatus}
                      </span>
                    </div>
                  )}
                  {jobseeker.address && (
                    <div className="pt-3 border-t border-gray-100">
                      <span className="text-gray-500 block mb-1">
                        Alamat Lengkap
                      </span>
                      <span className="font-medium text-gray-900 block">
                        {jobseeker.address}
                        {jobseeker.city && `, ${jobseeker.city}`}
                        {jobseeker.province && `, ${jobseeker.province}`}
                        {jobseeker.postalCode && ` ${jobseeker.postalCode}`}
                      </span>
                    </div>
                  )}
                  {jobseeker.expectedSalary && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Ekspektasi Gaji</span>
                      <span className="font-medium text-green-600">
                        Rp{" "}
                        {parseInt(jobseeker.expectedSalary).toLocaleString(
                          "id-ID"
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
