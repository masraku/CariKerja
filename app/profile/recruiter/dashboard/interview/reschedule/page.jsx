"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  Calendar,
  Clock,
  Video,
  Users,
  MapPin,
  Mail,
  CheckCircle,
  X,
  ArrowLeft,
  Send,
  AlertCircle,
} from "lucide-react";
import Swal from "sweetalert2";

function RescheduleContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [interview, setInterview] = useState(null);
  const [participant, setParticipant] = useState(null);

  const [formData, setFormData] = useState({
    date: "",
    time: "",
    duration: 60,
    meetingType: "ONLINE",
    meetingUrl: "",
    location: "",
    description: "",
  });

  useEffect(() => {
    const interviewId = searchParams.get("interviewId");
    const participantId = searchParams.get("participantId"); // Optional, to highlight who requested

    if (interviewId) {
      loadData(interviewId, participantId);
    } else {
      Swal.fire({
        icon: "error",
        title: "Invalid Request",
        text: "Missing interview ID",
        confirmButtonColor: "#2563EB",
      }).then(() => {
        router.push("/profile/recruiter/dashboard/interviews");
      });
    }
  }, []);

  const loadData = async (interviewId, participantId) => {
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
        const interviewData = data.data.interview;
        const participantsData = data.data.participants;

        setInterview(interviewData);

        // Find the participant who requested reschedule (if any)
        if (participantId) {
          const found = participantsData.find((p) => p.id === participantId);
          setParticipant(found);
        } else {
          // Or try to find one with RESCHEDULE_REQUESTED status
          const found = participantsData.find(
            (p) => p.status === "RESCHEDULE_REQUESTED"
          );
          setParticipant(found);
        }

        // Parse scheduledAt to date and time
        const scheduledDate = new Date(interviewData.scheduledAt);
        const dateStr = scheduledDate.toISOString().split("T")[0];
        const timeStr = scheduledDate.toTimeString().slice(0, 5);

        setFormData({
          date: dateStr,
          time: timeStr,
          duration: interviewData.duration,
          meetingType: interviewData.meetingType,
          meetingUrl: interviewData.meetingUrl || "",
          location: interviewData.location || "",
          description: interviewData.description || "",
        });
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.date || !formData.time) {
      Swal.fire({
        icon: "warning",
        title: "Input Tidak Valid",
        text: "Silakan tentukan tanggal dan waktu interview baru",
        confirmButtonColor: "#2563EB",
      });
      return;
    }

    if (formData.meetingType === "ONLINE" && !formData.meetingUrl) {
      Swal.fire({
        icon: "warning",
        title: "Link Meeting Belum Diisi",
        text: "Silakan masukkan link meeting",
        confirmButtonColor: "#2563EB",
      });
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem("token");

      // Combine date and time
      const scheduledAt = new Date(`${formData.date}T${formData.time}`);

      const response = await fetch(
        `/api/profile/recruiter/interviews/${interview.id}/reschedule`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            scheduledAt: scheduledAt.toISOString(),
            duration: parseInt(formData.duration),
            meetingUrl: formData.meetingUrl,
            description: formData.description,
            participantId: participant ? participant.id : null,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        await Swal.fire({
          icon: "success",
          title: "Jadwal Diperbarui!",
          text: "Notifikasi perubahan jadwal telah dikirim ke kandidat.",
          confirmButtonColor: "#2563EB",
        });
        router.push("/profile/recruiter/dashboard/interviews");
      } else {
        throw new Error(data.error || "Gagal memperbarui jadwal");
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: error.message,
        confirmButtonColor: "#2563EB",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data interview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="container mx-auto px-4 max-w-4xl py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-200 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Jadwalkan Ulang Interview
            </h1>
            <p className="text-gray-600">{interview?.title}</p>
          </div>
        </div>

        {/* Reschedule Request Reason Alert */}
        {participant && participant.status === "RESCHEDULE_REQUESTED" && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-amber-800 mb-1">
                Permintaan Reschedule dari {participant.candidate?.firstName}
              </h3>
              <p className="text-amber-700 text-sm italic">
                "{participant.responseMessage || "Tidak ada alasan spesifik"}"
              </p>
            </div>
          </div>
        )}

        {/* Main Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Date & Time */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Baru *
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Waktu Baru *
                </label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  className="w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Durasi
              </label>
              <select
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className="w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={30}>30 menit</option>
                <option value={45}>45 menit</option>
                <option value={60}>1 jam</option>
                <option value={90}>1.5 jam</option>
                <option value={120}>2 jam</option>
              </select>
            </div>

            {/* Meeting Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipe Meeting *
              </label>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { value: "ONLINE", label: "Online", icon: Video },
                  { value: "IN_PERSON", label: "Tatap Muka", icon: MapPin },
                ].map((type) => (
                  <label
                    key={type.value}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                      formData.meetingType === type.value
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="meetingType"
                      value={type.value}
                      checked={formData.meetingType === type.value}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className="flex flex-col items-center text-center">
                      <type.icon className="w-6 h-6 text-gray-600 mb-2" />
                      <span className="font-medium text-gray-900">
                        {type.label}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Meeting URL */}
            {formData.meetingType === "ONLINE" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link Meeting *
                </label>
                <input
                  type="url"
                  name="meetingUrl"
                  value={formData.meetingUrl}
                  onChange={handleChange}
                  className="w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://..."
                  required
                />
              </div>
            )}

            {/* Location */}
            {formData.meetingType === "IN_PERSON" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lokasi *
                </label>
                <textarea
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  rows={3}
                  className="w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            )}

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catatan Tambahan
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Informasi update jadwal..."
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Simpan & Update Jadwal
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ReschedulePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RescheduleContent />
    </Suspense>
  );
}
