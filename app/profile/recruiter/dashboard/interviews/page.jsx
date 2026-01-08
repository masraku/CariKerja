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
  RefreshCw,
  Trash2,
  Check,
  X,
  ExternalLink,
  MapPin,
  PlayCircle,
  AlertTriangle,
} from "lucide-react";

export default function RecruiterInterviewsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [interviews, setInterviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [processingId, setProcessingId] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Sync with client time and update every minute
    setCurrentTime(new Date());
    const timer = setInterval(() => setCurrentTime(new Date()), 10000); // Check every 10s
    return () => clearInterval(timer);
  }, []);

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

  // Helper to check if interview has started
  const isInterviewStarted = (scheduledAt) => {
    return currentTime >= new Date(scheduledAt);
  };

  // Handle Application Status Update (Accept/Reject Candidate)
  const handleUpdateApplicationStatus = async (
    applicationId,
    newStatus,
    candidateName
  ) => {
    const actionText = newStatus === "ACCEPTED" ? "Terima" : "Tolak";
    const color = newStatus === "ACCEPTED" ? "#10b981" : "#ef4444";

    const result = await Swal.fire({
      title: `${actionText} Kandidat?`,
      text: `Anda akan me-${actionText.toLowerCase()} lamaran ${candidateName}.`,
      icon: newStatus === "ACCEPTED" ? "question" : "warning",
      showCancelButton: true,
      confirmButtonColor: color,
      confirmButtonText: `Ya, ${actionText}`,
      cancelButtonText: "Batal",
      input: newStatus === "REJECTED" ? "textarea" : undefined,
      inputPlaceholder:
        newStatus === "REJECTED" ? "Alasan penolakan..." : undefined,
      inputValidator: (value) => {
        if (newStatus === "REJECTED" && !value) {
          return "Mohon isi alasan penolakan";
        }
      },
    });

    if (!result.isConfirmed) return;

    try {
      setProcessingId(applicationId);
      const token = localStorage.getItem("token");

      const body = { status: newStatus };
      if (newStatus === "REJECTED") {
        body.reason = result.value; // Assuming API accepts reason/notes
        body.recruiterNotes = result.value;
      }

      const response = await fetch(
        `/api/profile/recruiter/applications/${applicationId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: `Kandidat berhasil di-${actionText.toLowerCase()}`,
          timer: 1500,
          showConfirmButton: false,
        });
        loadInterviews(); // Reload to reflect changes
      } else {
        throw new Error("Gagal mengupdate status");
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message,
      });
    } finally {
      setProcessingId(null);
    }
  };

  // Handle approve reschedule
  const handleApproveReschedule = (interview, participant) => {
    router.push(
      `/profile/recruiter/dashboard/interview/reschedule?interviewId=${interview.id}&participantId=${participant.id}`
    );
  };

  // Handle reject reschedule
  const handleRejectReschedule = async (interview, participant) => {
    // ... existing logic ...
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
      setProcessingId(participant.id);
      const token = localStorage.getItem("token");

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
          timer: 1500,
          showConfirmButton: false,
        });
        loadInterviews();
      } else {
        throw new Error("Gagal menolak reschedule");
      }
    } catch (error) {
      Swal.fire({ icon: "error", title: "Gagal", text: error.message });
    } finally {
      setProcessingId(null);
    }
  };

  // Handle delete interview
  const handleDeleteInterview = async (interview) => {
    // ... existing logic ...
    const result = await Swal.fire({
      title: "Hapus Interview?",
      text: "Menghapus interview akan otomatis menolak semua kandidat yang tergabung.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus",
      confirmButtonColor: "#ef4444",
    });

    if (!result.isConfirmed) return;

    try {
      const token = localStorage.getItem("token");
      await fetch(`/api/profile/recruiter/interviews/${interview.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      loadInterviews();
    } catch (error) {
      Swal.fire({ icon: "error", title: "Error" });
    }
  };

  const handleMarkComplete = async (interview) => {
    // Use the new Room logic API or just redirect to Room?
    // Redirect to room is better as user wants "Masuk Room" experience
    router.push(`/profile/recruiter/dashboard/interview/room/${interview.id}`);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("id-ID", {
      weekday: "long",
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

  // ... Filter logic ...
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
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-6 pt-6">
          <Link
            href="/profile/recruiter/dashboard"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Kembali ke Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Kelola Interview
          </h1>
          <p className="text-gray-600">
            Kelola jadwal interview dan respon kandidat
          </p>
        </div>

        {/* Stats Filter Tabs (Simplified for brevity, same layout) */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <StatsButton
            active={activeFilter === "all"}
            onClick={() => setActiveFilter("all")}
            color="blue"
            label="Total"
            value={stats?.total || 0}
            icon={Calendar}
          />
          <StatsButton
            active={activeFilter === "scheduled"}
            onClick={() => setActiveFilter("scheduled")}
            color="green"
            label="Terjadwal"
            value={stats?.scheduled || 0}
            icon={CheckCircle}
          />
          <StatsButton
            active={activeFilter === "reschedule"}
            onClick={() => setActiveFilter("reschedule")}
            color="orange"
            label="Reschedule"
            value={rescheduleCount}
            icon={RefreshCw}
            badge={rescheduleCount > 0 ? rescheduleCount : null}
          />
          <StatsButton
            active={activeFilter === "completed"}
            onClick={() => setActiveFilter("completed")}
            color="purple"
            label="Selesai"
            value={stats?.completed || 0}
            icon={Check}
          />
          <StatsButton
            active={activeFilter === "cancelled"}
            onClick={() => setActiveFilter("cancelled")}
            color="gray"
            label="Dibatalkan"
            value={stats?.cancelled || 0}
            icon={XCircle}
          />
        </div>

        {/* Interview List */}
        <div className="space-y-6">
          {filteredInterviews.map((interview) => {
            const isStarted = isInterviewStarted(interview.scheduledAt);
            const isCompleted = interview.status === "COMPLETED";
            const rescheduleParticipants =
              interview.participants?.filter(
                (p) => p.status === "RESCHEDULE_REQUESTED"
              ) || [];

            return (
              <div
                key={interview.id}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                {/* Header Content */}
                <div className="p-6">
                  <div className="flex flex-col md:flex-row justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        {interview.title}
                        {interview.status === "CANCELLED" && (
                          <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                            Dibatalkan
                          </span>
                        )}
                        {isCompleted && (
                          <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">
                            Selesai
                          </span>
                        )}
                      </h3>
                      <div className="flex flex-wrap items-center gap-4 text-gray-600 mt-2 text-sm">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />{" "}
                          {formatDate(interview.scheduledAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />{" "}
                          {formatTime(interview.scheduledAt)} WIB
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />{" "}
                          {interview.participants?.length || 0} kandidat
                        </span>
                        {interview.meetingType === "In Person" ? (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" /> Tatap Muka
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <Video className="w-4 h-4" /> Online
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Status Badge for Interview */}
                    <div className="mt-4 md:mt-0">
                      {/* You can put Delete button here for Scheduled interviews */}
                      {interview.status === "SCHEDULED" && !isStarted && (
                        <button
                          onClick={() => handleDeleteInterview(interview)}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition"
                          title="Batalkan Interview"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Reschedule Alerts */}
                  {rescheduleParticipants.length > 0 && (
                    <div className="mb-6 bg-orange-50 border border-orange-200 rounded-xl p-4">
                      <h4 className="font-bold text-orange-800 text-sm mb-2 flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-2" /> Permintaan
                        Reschedule
                      </h4>
                      {rescheduleParticipants.map((participant) => (
                        <div
                          key={participant.id}
                          className="bg-white p-3 rounded-lg border border-orange-100 mb-2 last:mb-0"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold text-gray-900 text-sm">
                                {participant.jobseeker?.firstName}{" "}
                                {participant.jobseeker?.lastName}
                              </p>
                              <p className="text-orange-600 text-xs mt-1">
                                "{participant.responseMessage}"
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  handleApproveReschedule(
                                    interview,
                                    participant
                                  )
                                }
                                className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700"
                              >
                                Terima
                              </button>
                              <button
                                onClick={() =>
                                  handleRejectReschedule(interview, participant)
                                }
                                className="text-xs bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700"
                              >
                                Tolak
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Candidates List */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-700 text-sm">
                      Daftar Kandidat:
                    </h4>
                    {interview.participants
                      ?.filter((p) => {
                        // Hide reschedule requested (shown separately)
                        if (p.status === "RESCHEDULE_REQUESTED") return false;
                        // Hide participants with terminal application statuses
                        const appStatus = p.applications?.status;
                        const terminalStatuses = [
                          "ACCEPTED",
                          "REJECTED",
                          "RESIGNED",
                          "WITHDRAWN",
                        ];
                        if (terminalStatuses.includes(appStatus)) return false;
                        return true;
                      })
                      .map((participant) => {
                        const appStatus = participant.applications?.status;
                        let displayStatus = "Pending";
                        let statusColor = "bg-yellow-100 text-yellow-700";

                        if (participant.status === "ACCEPTED") {
                          displayStatus = "Siap Interview";
                          statusColor = "bg-blue-100 text-blue-700";
                        } else if (participant.status === "DECLINED") {
                          displayStatus = "Menolak";
                          statusColor = "bg-red-100 text-red-700";
                        } else if (participant.status === "COMPLETED") {
                          displayStatus = "Interview Selesai";
                          statusColor = "bg-green-100 text-green-700";
                        }

                        return (
                          <div
                            key={participant.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 gap-4"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                                {participant.jobseeker?.photo ? (
                                  <img
                                    src={participant.jobseeker.photo}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center font-bold text-gray-400">
                                    {participant.jobseeker?.firstName?.[0]}
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900 text-sm">
                                  {participant.jobseeker?.firstName}{" "}
                                  {participant.jobseeker?.lastName}
                                </p>
                                <span
                                  className={`text-[10px] uppercase font-bold tracking-wide px-2 py-0.5 rounded-full ${statusColor}`}
                                >
                                  {displayStatus}
                                </span>
                              </div>
                            </div>

                            {/* Actions for Candidates (Accept/Reject) - Only if Interview Completed and Application Status is INTERVIEW_COMPLETED */}
                            {isCompleted &&
                              appStatus === "INTERVIEW_COMPLETED" && (
                                <div className="flex gap-2">
                                  <button
                                    onClick={() =>
                                      handleUpdateApplicationStatus(
                                        participant.applicationId,
                                        "ACCEPTED",
                                        participant.jobseeker.firstName
                                      )
                                    }
                                    disabled={
                                      processingId === participant.applicationId
                                    }
                                    className="px-3 py-1.5 bg-green-100 text-green-700 text-xs font-bold rounded-lg hover:bg-green-200 transition flex items-center gap-1"
                                  >
                                    <Check className="w-3 h-3" /> Terima
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleUpdateApplicationStatus(
                                        participant.applicationId,
                                        "REJECTED",
                                        participant.jobseeker.firstName
                                      )
                                    }
                                    disabled={
                                      processingId === participant.applicationId
                                    }
                                    className="px-3 py-1.5 bg-red-100 text-red-700 text-xs font-bold rounded-lg hover:bg-red-200 transition flex items-center gap-1"
                                  >
                                    <X className="w-3 h-3" /> Tolak
                                  </button>
                                </div>
                              )}
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* Footer Actions - ALWAYS AT BOTTOM */}
                {interview.status === "SCHEDULED" && (
                  <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex flex-wrap justify-end gap-3 items-center">
                    {isStarted ? (
                      <>
                        {interview.meetingUrl && (
                          <Link
                            href={`/profile/recruiter/dashboard/interview/room/${interview.id}`}
                            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-blue-600 text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition shadow-sm"
                          >
                            <Video className="w-4 h-4" /> Masuk Room
                          </Link>
                        )}
                        <Link
                          href={`/profile/recruiter/dashboard/interview/room/${interview.id}`}
                          className="flex items-center gap-2 px-5 py-2.5 bg-[#00A753] text-white font-bold rounded-xl hover:bg-[#00964b] transition shadow-md"
                        >
                          <CheckCircle className="w-4 h-4" /> Selesaikan
                          Interview
                        </Link>
                      </>
                    ) : (
                      /* Not Started Actions */
                      <div className="flex items-center justify-between w-full">
                        <span
                          className="text-sm text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg flex items-center gap-2"
                          title={`Akan mulai pada ${formatTime(
                            interview.scheduledAt
                          )}`}
                        >
                          <Clock className="w-4 h-4 text-orange-500" />
                          <span className="font-medium text-gray-600">
                            Mulai {formatTime(interview.scheduledAt)}
                          </span>
                        </span>

                        <div className="flex gap-2">
                          <Link
                            href={`/profile/recruiter/dashboard/interview/reschedule?interviewId=${interview.id}`}
                            className="text-sm font-medium text-blue-600 hover:text-blue-800 px-3 py-2 bg-blue-50 rounded-lg"
                          >
                            Edit Jadwal
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredInterviews.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center mt-8">
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

// Stats Button Component
function StatsButton({
  active,
  onClick,
  color,
  label,
  value,
  icon: Icon,
  badge,
}) {
  const colorStyles = {
    blue: {
      active: "bg-blue-600 text-white ring-2 ring-blue-600 ring-offset-2",
      inactive: "bg-white hover:bg-blue-50 border border-gray-200",
      iconActive: "text-blue-200",
      iconInactive: "text-blue-600",
      textActive: "text-blue-100",
      textInactive: "text-gray-500",
    },
    green: {
      active: "bg-green-600 text-white ring-2 ring-green-600 ring-offset-2",
      inactive:
        "bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 hover:border-green-400",
      iconActive: "text-green-200",
      iconInactive: "text-green-600",
      textActive: "text-green-100",
      textInactive: "text-green-700",
    },
    orange: {
      active: "bg-orange-500 text-white ring-2 ring-orange-500 ring-offset-2",
      inactive:
        "bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 hover:border-orange-400",
      iconActive: "text-orange-200",
      iconInactive: "text-orange-600",
      textActive: "text-orange-100",
      textInactive: "text-orange-700",
    },
    purple: {
      active: "bg-purple-600 text-white ring-2 ring-purple-600 ring-offset-2",
      inactive:
        "bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 hover:border-purple-400",
      iconActive: "text-purple-200",
      iconInactive: "text-purple-600",
      textActive: "text-purple-100",
      textInactive: "text-purple-700",
    },
    gray: {
      active: "bg-gray-600 text-white ring-2 ring-gray-600 ring-offset-2",
      inactive: "bg-gray-100 border border-gray-200 hover:border-gray-400",
      iconActive: "text-gray-300",
      iconInactive: "text-gray-400",
      textActive: "text-gray-300",
      textInactive: "text-gray-600",
    },
  };

  const style = colorStyles[color] || colorStyles.blue;

  return (
    <button
      onClick={onClick}
      className={`rounded-xl shadow-sm p-4 transition-all relative text-left ${
        active ? style.active : style.inactive
      }`}
    >
      {badge && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center animate-pulse border-2 border-white">
          {badge}
        </span>
      )}
      <div className="flex items-center justify-between">
        <div>
          <p
            className={`text-xs font-medium ${
              active ? style.textActive : style.textInactive
            }`}
          >
            {label}
          </p>
          <p className={`text-2xl font-bold ${active ? "text-white" : ""}`}>
            {value}
          </p>
        </div>
        <Icon
          className={`w-8 h-8 ${
            active ? style.iconActive : style.iconInactive
          }`}
        />
      </div>
    </button>
  );
}
