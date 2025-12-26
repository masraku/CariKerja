"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
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
} from "lucide-react";

export default function ApplicationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState(null);
  const [interview, setInterview] = useState(null);

  useEffect(() => {
    if (params.id) {
      loadApplicationDetail();
    }
  }, [params.id]);

  const loadApplicationDetail = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await fetch(
        `/api/profile/jobseeker/applications/${params.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        // API returns data in data field
        const appData = data.data || data.application;
        setApplication(appData);

        // If has interview from the response
        if (appData.interview) {
          loadInterviewDetail(appData.id);
        } else if (
          appData.status === "INTERVIEW_SCHEDULED" ||
          appData.status === "INTERVIEW_COMPLETED"
        ) {
          loadInterviewDetail(appData.id);
        }
      } else {
        throw new Error("Failed to load application");
      }
    } catch (error) {
      console.error("Load error:", error);
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
      const token = localStorage.getItem("token");
      const response = await fetch(
        `/api/profile/jobseeker/applications/${applicationId}/interview`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setInterview(data.interview);
      }
    } catch (error) {
      console.error("Load interview error:", error);
    }
  };

  // Handle Accept Offer
  const handleAcceptOffer = async () => {
    const result = await Swal.fire({
      title: "Terima Tawaran Kerja?",
      html: `
                <p class="text-gray-600 mb-2">Dengan menerima tawaran ini:</p>
                <ul class="text-left text-sm text-gray-600 space-y-1 mb-4">
                    <li>• Status Anda akan berubah menjadi <b>"Tidak Mencari Kerja"</b></li>
                    <li>• Anda tidak akan muncul di pencarian recruiter lain</li>
                    <li>• Anda tetap bisa mengubah status nanti di profil</li>
                </ul>
                <p class="text-gray-600">Apakah Anda yakin ingin menerima tawaran ini?</p>
            `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, Terima Tawaran",
      cancelButtonText: "Batal",
      confirmButtonColor: "#10b981",
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
        `/api/profile/jobseeker/applications/${params.id}/accept`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        await Swal.fire({
          icon: "success",
          title: "Selamat! 🎉",
          html: `
                        <p class="text-gray-600 mb-2">Tawaran berhasil diterima!</p>
                        <p class="text-sm text-gray-500">Status pencari kerja Anda sekarang: <b>Tidak Aktif</b></p>
                    `,
          confirmButtonColor: "#10b981",
        });
        loadApplicationDetail();
      } else {
        throw new Error(data.error || "Gagal menerima tawaran");
      }
    } catch (error) {
      console.error("Accept offer error:", error);
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: error.message || "Terjadi kesalahan saat menerima tawaran",
      });
    }
  };

  const handleRequestReschedule = async () => {
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

      const token = localStorage.getItem("token");
      const response = await fetch(
        `/api/profile/jobseeker/applications/${params.id}/reschedule`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reason }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        await Swal.fire({
          icon: "success",
          title: "Request Terkirim!",
          text: "Permintaan reschedule Anda telah dikirim ke recruiter. Mohon tunggu konfirmasi.",
          confirmButtonColor: "#3b82f6",
        });
        loadApplicationDetail();
      } else {
        throw new Error(data.error || "Gagal mengirim request");
      }
    } catch (error) {
      console.error("Reschedule error:", error);
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: error.message || "Gagal mengirim request reschedule",
      });
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
            className={`bg-gradient-to-r ${statusConfig.bgGradient} p-8 border-b`}
          >
            <div className="flex items-center gap-6">
              {/* Company Logo */}
              <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center overflow-hidden">
                {application.jobs?.companies?.logo ? (
                  <img
                    src={application.jobs.companies.logo}
                    alt={application.jobs.companies.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Building2 className="w-10 h-10 text-gray-400" />
                )}
              </div>

              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  {application.jobs?.title}
                </h1>
                <p className="text-lg text-gray-700 mb-2">
                  {application.jobs?.companies?.name}
                </p>
                <div className="flex items-center gap-4 text-gray-600">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {application.jobs?.location || application.jobs?.city}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Dilamar {formatDate(application.appliedAt)}
                  </span>
                </div>
              </div>

              {/* Status Badge */}
              <div
                className={`px-6 py-3 rounded-2xl border-2 ${statusConfig.color} flex items-center gap-2`}
              >
                <StatusIcon className={`w-6 h-6 ${statusConfig.iconColor}`} />
                <span className="font-bold text-lg">{statusConfig.label}</span>
              </div>
            </div>
          </div>

          {/* Status Description */}
          <div className="p-6 bg-white">
            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${statusConfig.color}`}
              >
                <StatusIcon className={`w-6 h-6 ${statusConfig.iconColor}`} />
              </div>
              <div className="flex-1">
                <p className="text-gray-700 text-lg">
                  {statusConfig.description}
                </p>

                {/* Tips */}
                {statusConfig.tips.length > 0 && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                    <p className="font-semibold text-gray-800 mb-2">💡 Tips:</p>
                    <ul className="space-y-1">
                      {statusConfig.tips.map((tip, index) => (
                        <li
                          key={index}
                          className="text-gray-600 flex items-center gap-2"
                        >
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Accept Offer Button - Show when status is ACCEPTED and not yet responded */}
                {application.status === "ACCEPTED" &&
                  !application.respondedAt && (
                    <div className="mt-6">
                      <button
                        onClick={handleAcceptOffer}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-2xl font-bold text-lg hover:from-green-700 hover:to-emerald-700 transition shadow-lg flex items-center justify-center gap-3"
                      >
                        <CheckCircle className="w-6 h-6" />
                        Terima Tawaran Kerja
                      </button>
                      <p className="text-center text-gray-500 text-sm mt-2">
                        Klik untuk mengkonfirmasi penerimaan tawaran kerja
                      </p>
                    </div>
                  )}

                {/* Already Accepted Notice */}
                {application.status === "ACCEPTED" &&
                  application.respondedAt && (
                    <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-200">
                      <div className="flex items-center gap-3 text-green-700">
                        <CheckCircle className="w-6 h-6 flex-shrink-0" />
                        <div>
                          <p className="font-semibold">
                            Tawaran Telah Diterima
                          </p>
                          <p className="text-sm text-green-600">
                            Anda telah menerima tawaran ini pada{" "}
                            {formatDate(application.respondedAt)}
                          </p>
                        </div>
                      </div>
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

                {/* Join Meeting Button */}
                {application.status === "INTERVIEW_SCHEDULED" &&
                  interview.meetingUrl && (
                    <div className="mt-6 space-y-3">
                      <a
                        href={interview.meetingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-2xl font-bold text-lg hover:from-green-700 hover:to-emerald-700 transition shadow-lg flex items-center justify-center gap-3">
                          <Video className="w-6 h-6" />
                          Masuk Room Interview
                          <ExternalLink className="w-5 h-5" />
                        </button>
                      </a>
                      <p className="text-center text-gray-500 text-sm">
                        Klik untuk bergabung ke Google Meet
                      </p>

                      {/* Request Reschedule Button */}
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
    </div>
  );
}
