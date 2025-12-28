"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Swal from "sweetalert2";
import {
  Calendar,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Video,
  ArrowLeft,
  Bell,
  RefreshCw,
  Trash2,
  Eye,
  Check,
  X,
  ExternalLink,
} from "lucide-react";

export default function RecruiterInterviewsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [interviews, setInterviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    loadInterviews();
  }, []);

  const loadInterviews = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await fetch("/api/profile/recruiter/interviews/list", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setInterviews(data.data.interviews);
        setStats(data.data.stats);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Gagal memuat data interview",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle approve reschedule - redirect to reschedule page
  const handleApproveReschedule = (interview, participant) => {
    router.push(
      `/profile/recruiter/dashboard/interview/reschedule?interviewId=${interview.id}&participantId=${participant.id}`
    );
  };

  // Handle reject reschedule - mark as failed
  const handleRejectReschedule = async (interview, participant) => {
    const result = await Swal.fire({
      title: "Tolak Permintaan Reschedule?",
      html: `
                <p class="mb-4">Kandidat <strong>${participant.jobseeker?.firstName} ${participant.jobseeker?.lastName}</strong> meminta reschedule dengan alasan:</p>
                <p class="italic text-gray-600 mb-4">"${participant.responseMessage}"</p>
                <p class="text-red-600">Menolak reschedule akan membatalkan interview kandidat ini.</p>
            `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Tolak",
      cancelButtonText: "Batal",
      confirmButtonColor: "#ef4444",
    });

    if (!result.isConfirmed) return;

    try {
      const token = localStorage.getItem("token");

      // Update participant status to DECLINED (rejected)
      const response = await fetch(
        `/api/profile/recruiter/interviews/${interview.id}/participants/${participant.id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "DECLINED",
            rejectReschedule: true,
          }),
        }
      );

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Reschedule Ditolak",
          text: "Interview kandidat ini telah dibatalkan",
          timer: 2000,
          showConfirmButton: false,
        });
        loadInterviews();
      } else {
        const data = await response.json();
        throw new Error(data.error);
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: error.message || "Gagal menolak reschedule",
      });
    }
  };

  // Handle delete interview - mark as rejected
  const handleDeleteInterview = async (interview) => {
    const result = await Swal.fire({
      title: "Hapus Interview?",
      html: `
                <p>Menghapus interview akan otomatis menolak semua kandidat yang tergabung.</p>
                <p class="text-red-600 mt-2 font-semibold">Interview: ${interview.title}</p>
            `,
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
        `/api/profile/recruiter/interviews/${interview.id}`,
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
          title: "Interview Dihapus",
          text: "Semua kandidat terkait telah ditolak",
          timer: 2000,
          showConfirmButton: false,
        });
        loadInterviews();
      } else {
        const data = await response.json();
        throw new Error(data.error);
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: error.message || "Gagal menghapus interview",
      });
    }
  };

  // Handle mark as complete
  const handleMarkComplete = async (interview) => {
    const result = await Swal.fire({
      title: "Selesaikan Interview?",
      text: "Tandai interview ini sebagai selesai?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, Selesai",
      cancelButtonText: "Batal",
      confirmButtonColor: "#10b981",
    });

    if (!result.isConfirmed) return;

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `/api/profile/recruiter/interviews/${interview.id}/complete`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Interview Selesai",
          text: "Status aplikasi kandidat telah diperbarui",
          timer: 2000,
          showConfirmButton: false,
        });
        loadInterviews();
      } else {
        const data = await response.json();
        throw new Error(data.error);
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: error.message || "Gagal menyelesaikan interview",
      });
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("id-ID", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Filter interviews
  const getFilteredInterviews = () => {
    if (activeFilter === "all") return interviews;
    if (activeFilter === "scheduled")
      return interviews.filter((i) => i.status === "SCHEDULED");
    if (activeFilter === "reschedule")
      return interviews.filter((i) =>
        i.participants?.some((p) => p.status === "RESCHEDULE_REQUESTED")
      );
    if (activeFilter === "completed")
      return interviews.filter((i) => i.status === "COMPLETED");
    if (activeFilter === "cancelled")
      return interviews.filter((i) => i.status === "CANCELLED");
    return interviews;
  };

  const filteredInterviews = getFilteredInterviews();

  // Count reschedule requests
  const rescheduleCount = interviews.reduce((count, interview) => {
    return (
      count +
      (interview.participants?.filter(
        (p) => p.status === "RESCHEDULE_REQUESTED"
      ).length || 0)
    );
  }, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Memuat interview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <Link href="/profile/recruiter/dashboard">
            <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition mb-4">
              <ArrowLeft className="w-5 h-5" />
              Kembali ke Dashboard
            </button>
          </Link>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Kelola Interview
          </h1>
          <p className="text-gray-600">
            Kelola jadwal interview dan respon kandidat
          </p>
        </div>

        {/* Stats - Clickable Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {/* Total */}
          <button
            onClick={() => setActiveFilter("all")}
            className={`rounded-xl shadow-sm p-4 transition-all ${
              activeFilter === "all"
                ? "bg-blue-600 text-white ring-2 ring-blue-600 ring-offset-2"
                : "bg-white hover:bg-blue-50 border border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <p
                  className={`text-xs font-medium ${
                    activeFilter === "all" ? "text-blue-100" : "text-gray-500"
                  }`}
                >
                  Total
                </p>
                <p className="text-2xl font-bold">{stats?.total || 0}</p>
              </div>
              <Calendar
                className={`w-8 h-8 ${
                  activeFilter === "all" ? "text-blue-200" : "text-blue-600"
                }`}
              />
            </div>
          </button>

          {/* Scheduled */}
          <button
            onClick={() => setActiveFilter("scheduled")}
            className={`rounded-xl shadow-sm p-4 transition-all ${
              activeFilter === "scheduled"
                ? "bg-green-600 text-white ring-2 ring-green-600 ring-offset-2"
                : "bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 hover:border-green-400"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <p
                  className={`text-xs font-medium ${
                    activeFilter === "scheduled"
                      ? "text-green-100"
                      : "text-green-700"
                  }`}
                >
                  Terjadwal
                </p>
                <p
                  className={`text-2xl font-bold ${
                    activeFilter === "scheduled"
                      ? "text-white"
                      : "text-green-900"
                  }`}
                >
                  {stats?.scheduled || 0}
                </p>
              </div>
              <CheckCircle
                className={`w-8 h-8 ${
                  activeFilter === "scheduled"
                    ? "text-green-200"
                    : "text-green-600"
                }`}
              />
            </div>
          </button>

          {/* Reschedule Requests */}
          <button
            onClick={() => setActiveFilter("reschedule")}
            className={`rounded-xl shadow-sm p-4 transition-all relative ${
              activeFilter === "reschedule"
                ? "bg-orange-500 text-white ring-2 ring-orange-500 ring-offset-2"
                : "bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 hover:border-orange-400"
            }`}
          >
            {rescheduleCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
                {rescheduleCount}
              </span>
            )}
            <div className="flex items-center justify-between">
              <div className="text-left">
                <p
                  className={`text-xs font-medium ${
                    activeFilter === "reschedule"
                      ? "text-orange-100"
                      : "text-orange-700"
                  }`}
                >
                  Reschedule
                </p>
                <p
                  className={`text-2xl font-bold ${
                    activeFilter === "reschedule"
                      ? "text-white"
                      : "text-orange-900"
                  }`}
                >
                  {rescheduleCount}
                </p>
              </div>
              <RefreshCw
                className={`w-8 h-8 ${
                  activeFilter === "reschedule"
                    ? "text-orange-200"
                    : "text-orange-600"
                }`}
              />
            </div>
          </button>

          {/* Completed */}
          <button
            onClick={() => setActiveFilter("completed")}
            className={`rounded-xl shadow-sm p-4 transition-all ${
              activeFilter === "completed"
                ? "bg-purple-600 text-white ring-2 ring-purple-600 ring-offset-2"
                : "bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 hover:border-purple-400"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <p
                  className={`text-xs font-medium ${
                    activeFilter === "completed"
                      ? "text-purple-100"
                      : "text-purple-700"
                  }`}
                >
                  Selesai
                </p>
                <p
                  className={`text-2xl font-bold ${
                    activeFilter === "completed"
                      ? "text-white"
                      : "text-purple-900"
                  }`}
                >
                  {stats?.completed || 0}
                </p>
              </div>
              <Check
                className={`w-8 h-8 ${
                  activeFilter === "completed"
                    ? "text-purple-200"
                    : "text-purple-600"
                }`}
              />
            </div>
          </button>

          {/* Cancelled */}
          <button
            onClick={() => setActiveFilter("cancelled")}
            className={`rounded-xl shadow-sm p-4 transition-all ${
              activeFilter === "cancelled"
                ? "bg-gray-600 text-white ring-2 ring-gray-600 ring-offset-2"
                : "bg-gray-100 border border-gray-200 hover:border-gray-400"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <p
                  className={`text-xs font-medium ${
                    activeFilter === "cancelled"
                      ? "text-gray-300"
                      : "text-gray-600"
                  }`}
                >
                  Dibatalkan
                </p>
                <p className="text-2xl font-bold">{stats?.cancelled || 0}</p>
              </div>
              <XCircle
                className={`w-8 h-8 ${
                  activeFilter === "cancelled"
                    ? "text-gray-400"
                    : "text-gray-400"
                }`}
              />
            </div>
          </button>
        </div>

        {/* Interview List */}
        <div className="space-y-4">
          {filteredInterviews.map((interview) => {
            const rescheduleParticipants =
              interview.participants?.filter(
                (p) => p.status === "RESCHEDULE_REQUESTED"
              ) || [];
            const hasRescheduleRequest = rescheduleParticipants.length > 0;

            return (
              <div
                key={interview.id}
                className={`bg-white rounded-2xl shadow-lg p-6 border-2 ${
                  hasRescheduleRequest ? "border-orange-300" : "border-gray-200"
                }`}
              >
                {/* Interview Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {interview.title}
                    </h3>
                    <div className="flex items-center gap-4 text-gray-600 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(interview.scheduledAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatTime(interview.scheduledAt)} WIB
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {interview.participants?.length || 0} kandidat
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-4 md:mt-0">
                    {interview.status === "SCHEDULED" && (
                      <>
                        {interview.meetingUrl && (
                          <a
                            href={interview.meetingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition flex items-center gap-2 shadow-lg"
                          >
                            <Video className="w-4 h-4" />
                            Masuk Interview
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                        <button
                          onClick={() => handleMarkComplete(interview)}
                          className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition flex items-center gap-2"
                        >
                          <Check className="w-4 h-4" />
                          Selesai
                        </button>
                        <button
                          onClick={() => handleDeleteInterview(interview)}
                          className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Hapus
                        </button>
                      </>
                    )}
                    {interview.status === "COMPLETED" && (
                      <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Selesai
                      </span>
                    )}
                    {interview.status === "CANCELLED" && (
                      <span className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg flex items-center gap-2">
                        <XCircle className="w-4 h-4" />
                        Dibatalkan
                      </span>
                    )}
                  </div>
                </div>

                {/* Reschedule Requests */}
                {hasRescheduleRequest && (
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-4">
                    <h4 className="font-bold text-orange-800 mb-3 flex items-center gap-2">
                      <RefreshCw className="w-5 h-5" />
                      Permintaan Reschedule ({rescheduleParticipants.length})
                    </h4>
                    <div className="space-y-3">
                      {rescheduleParticipants.map((participant) => (
                        <div
                          key={participant.id}
                          className="bg-white rounded-lg p-4 border border-orange-200"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                                {participant.jobseeker?.photo ? (
                                  <img
                                    src={participant.jobseeker.photo}
                                    alt=""
                                    className="w-10 h-10 rounded-full object-cover"
                                  />
                                ) : (
                                  <span className="text-orange-600 font-bold">
                                    {participant.jobseeker?.firstName?.charAt(
                                      0
                                    ) || "?"}
                                  </span>
                                )}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {participant.jobseeker?.firstName}{" "}
                                  {participant.jobseeker?.lastName}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {participant.jobseeker?.currentTitle ||
                                    "Kandidat"}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  handleApproveReschedule(
                                    interview,
                                    participant
                                  )
                                }
                                className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm flex items-center gap-1"
                              >
                                <Check className="w-4 h-4" />
                                Jadwalkan Ulang
                              </button>
                              <button
                                onClick={() =>
                                  handleRejectReschedule(interview, participant)
                                }
                                className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm flex items-center gap-1"
                              >
                                <X className="w-4 h-4" />
                                Tolak
                              </button>
                            </div>
                          </div>
                          {participant.responseMessage && (
                            <div className="mt-3 p-3 bg-orange-50 rounded-lg">
                              <p className="text-sm text-orange-800">
                                <strong>Alasan:</strong>{" "}
                                {participant.responseMessage}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Participants List */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-700 mb-2">
                    Kandidat:
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {interview.participants
                      ?.filter((p) => p.status !== "RESCHEDULE_REQUESTED")
                      .map((participant) => (
                        <div
                          key={participant.id}
                          className="flex items-center justify-between bg-gray-50 rounded-lg p-3"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                              {participant.jobseeker?.photo ? (
                                <img
                                  src={participant.jobseeker.photo}
                                  alt=""
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-gray-600 text-sm font-bold">
                                  {participant.jobseeker?.firstName?.charAt(
                                    0
                                  ) || "?"}
                                </span>
                              )}
                            </div>
                            <span className="text-gray-800">
                              {participant.jobseeker?.firstName}{" "}
                              {participant.jobseeker?.lastName}
                            </span>
                          </div>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              participant.status === "ACCEPTED"
                                ? "bg-green-100 text-green-700"
                                : participant.status === "DECLINED"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {participant.status === "ACCEPTED"
                              ? "Hadir"
                              : participant.status === "DECLINED"
                              ? "Tidak Hadir"
                              : "Pending"}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Meeting Link */}
                {interview.meetingUrl && interview.status === "SCHEDULED" && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <a
                      href={interview.meetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
                    >
                      <Video className="w-5 h-5" />
                      Join Meeting
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredInterviews.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Tidak Ada Interview
            </h3>
            <p className="text-gray-600">
              {activeFilter === "all"
                ? "Anda belum memiliki jadwal interview."
                : "Tidak ada interview dengan filter yang dipilih."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
