"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Calendar,
  Clock,
  Video,
  Users,
  MapPin,
  CheckCircle,
  XCircle,
  ArrowLeft,
  ExternalLink,
  MessageSquare,
} from "lucide-react";
import Swal from "sweetalert2";

function InterviewRoomContent() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [interview, setInterview] = useState(null);
  const [participants, setParticipants] = useState([]);

  useEffect(() => {
    if (id) {
      loadData(id);
    }
  }, [id]);

  const loadData = async (interviewId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await fetch(
        `/api/profile/recruiter/interviews/${interviewId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setInterview(data.data.interview);
        setParticipants(data.data.participants);
      } else {
        throw new Error("Failed to load interview");
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Gagal memuat data interview",
        confirmButtonColor: "#2563EB",
      }).then(() => {
        router.push("/profile/recruiter/dashboard/interviews");
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteInterview = async (participantId = null) => {
    const isIndividual = !!participantId;
    const result = await Swal.fire({
      title: isIndividual ? "Selesaikan Kandidat?" : "Selesaikan Interview?",
      text: isIndividual
        ? "Interview untuk kandidat ini akan ditandai selesai."
        : "Interview akan ditandai sukses dan semua status kandidat akan diupdate.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10B981", // Green
      cancelButtonColor: "#d33",
      confirmButtonText: isIndividual
        ? "Ya, Selesaikan"
        : "Ya, Selesaikan Semua",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      try {
        setCompleting(true);
        const token = localStorage.getItem("token");

        const response = await fetch(
          `/api/profile/recruiter/interviews/${id}/complete`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ participantId: participantId || null }),
          }
        );

        const data = await response.json();

        if (response.ok) {
          await Swal.fire({
            icon: "success",
            title: "Berhasil!",
            text: isIndividual
              ? "Status kandidat telah diperbarui."
              : "Interview telah diselesaikan.",
            confirmButtonColor: "#2563EB",
          });

          if (isIndividual) {
            // Reload data to reflect changes
            loadData(id);
          } else {
            router.push("/profile/recruiter/dashboard/applications");
          }
        } else {
          // Handle specific error: too early
          if (data.error && data.error.includes("before scheduled time")) {
            Swal.fire({
              icon: "warning",
              title: "Belum Waktunya",
              text: "Anda tidak dapat menyelesaikan interview sebelum waktu jadwal dimulai.",
              confirmButtonColor: "#2563EB",
            });
          } else {
            throw new Error(data.error || "Gagal menyelesaikan interview");
          }
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Gagal",
          text: error.message,
          confirmButtonColor: "#2563EB",
        });
      } finally {
        setCompleting(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat ruang interview...</p>
        </div>
      </div>
    );
  }

  if (!interview) return null;

  const isCompleted = interview.status === "COMPLETED";
  const scheduledDate = new Date(interview.scheduledAt);

  // Format date/time
  const dateStr = scheduledDate.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const timeStr = scheduledDate.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Navbar/Header Placeholder if needed */}

      <div className="container mx-auto px-4 max-w-4xl py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Kembali
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header Banner */}
          <div
            className={`p-6 ${
              isCompleted
                ? "bg-green-50 border-b border-green-100"
                : "bg-[#03587f] text-white"
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h1
                  className={`text-2xl font-bold ${
                    isCompleted ? "text-green-800" : "text-white"
                  }`}
                >
                  {interview.title}
                </h1>
                <p
                  className={`mt-1 ${
                    isCompleted ? "text-green-600" : "text-blue-100"
                  }`}
                >
                  {isCompleted
                    ? "Interview telah selesai"
                    : "Ruang Tunggu Interview"}
                </p>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  isCompleted
                    ? "bg-green-200 text-green-800"
                    : "bg-blue-800/50 text-blue-100"
                }`}
              >
                {interview.status}
              </div>
            </div>
          </div>

          <div className="p-6 grid md:grid-cols-3 gap-8">
            {/* Left Column: Details */}
            <div className="md:col-span-2 space-y-6">
              {/* Time & Location */}
              <div className="flex flex-col gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Tanggal</p>
                    <p className="font-medium text-gray-900">{dateStr}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Waktu & Durasi</p>
                    <p className="font-medium text-gray-900">
                      {timeStr} ({interview.duration} Menit)
                    </p>
                  </div>
                </div>

                {interview.meetingType !== "IN_PERSON" ? (
                  <div className="flex items-center gap-3">
                    <Video className="w-5 h-5 text-gray-500" />
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm text-gray-500">
                        Link Meeting ({interview.meetingType})
                      </p>
                      <a
                        href={interview.meetingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline font-medium truncate block"
                      >
                        {interview.meetingUrl}
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Lokasi</p>
                      <p className="font-medium text-gray-900">
                        {interview.location}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Participants */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Kandidat ({participants.length})
                </h3>
                <div className="space-y-3">
                  {participants.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:border-blue-100 transition shadow-sm hover:shadow"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                          {p.candidate.photo ? (
                            <img
                              src={p.candidate.photo}
                              alt={p.candidate.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold">
                              {p.candidate.firstName?.[0]}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {p.candidate.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {p.candidate.currentTitle || "Pencaker"}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          p.status === "ACCEPTED"
                            ? "bg-green-100 text-green-700"
                            : p.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-700"
                            : p.status === "COMPLETED"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {p.status}
                      </span>
                      {!isCompleted &&
                        (p.status === "ACCEPTED" || p.status === "PENDING") && (
                          <button
                            onClick={() => handleCompleteInterview(p.id)}
                            disabled={completing}
                            className="ml-2 px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium hover:bg-green-200 transition"
                            title="Selesaikan untuk kandidat ini"
                          >
                            Selesaikan
                          </button>
                        )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Actions */}
            <div className="space-y-4">
              {!isCompleted && (
                <>
                  {/* Join Button */}
                  {interview.meetingUrl && (
                    <a
                      href={interview.meetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full py-3 px-4 bg-white border-2 border-blue-600 text-blue-600 rounded-xl font-bold text-center hover:bg-blue-50 transition flex items-center justify-center gap-2"
                    >
                      <ExternalLink className="w-5 h-5" />
                      Buka Meeting Link
                    </a>
                  )}

                  {/* Complete Button */}
                  <button
                    onClick={handleCompleteInterview}
                    disabled={completing}
                    className="w-full py-4 px-4 bg-[#00A753] text-white rounded-xl font-bold shadow-lg hover:bg-[#00964b] hover:shadow-xl transition transform active:scale-95 flex items-center justify-center gap-2"
                  >
                    {completing ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                    ) : (
                      <CheckCircle className="w-5 h-5" />
                    )}
                    Selesaikan Interview
                  </button>

                  <p className="text-xs text-gray-500 text-center px-4">
                    Klik "Selesaikan Interview" setelah sesi berakhir untuk
                    mengupdate status kandidat dan melanjutkan ke tahap
                    berikutnya.
                  </p>
                </>
              )}

              {isCompleted && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-center">
                  <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
                  <h3 className="font-bold text-green-900">Selesai</h3>
                  <p className="text-sm text-green-700">
                    Interview ini telah diselesaikan pada:
                  </p>
                  <p className="font-mono text-green-800 mt-1">
                    {new Date(interview.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InterviewRoomPage() {
  return (
    <Suspense fallback={<div>Loading Room...</div>}>
      <InterviewRoomContent />
    </Suspense>
  );
}
