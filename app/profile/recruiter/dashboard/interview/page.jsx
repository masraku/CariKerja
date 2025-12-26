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
} from "lucide-react";
import Swal from "sweetalert2";

function ScheduleInterviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [job, setJob] = useState(null);
  const [applicants, setApplicants] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    date: "",
    time: "",
    duration: 60,
    meetingType: "GOOGLE_MEET",
    meetingUrl: "",
    location: "",
    description: "",
    notes: "",
  });

  useEffect(() => {
    const jobId = searchParams.get("job");
    const applicantIds = searchParams.get("applicants");

    if (jobId && applicantIds) {
      loadData(jobId, applicantIds);
    } else {
      Swal.fire({
        icon: "error",
        title: "Invalid Request",
        text: "Missing required parameters",
        confirmButtonColor: "#2563EB",
      }).then(() => {
        router.push("/recruiter/dashboard");
      });
    }
  }, []);

  const loadData = async (jobId, applicantIds) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // Load applicants first - this includes job data
      const applicantResponse = await fetch(
        `/api/applications/batch?ids=${applicantIds}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (applicantResponse.ok) {
        const applicantData = await applicantResponse.json();
        setApplicants(applicantData.applications || []);

        // Get job info from first application (all should be same job)
        // API returns 'job' (singular) not 'jobs'
        if (
          applicantData.applications &&
          applicantData.applications.length > 0
        ) {
          const jobInfo = applicantData.applications[0].job;
          if (jobInfo) {
            setJob(jobInfo);
            // Set default interview title
            setFormData((prev) => ({
              ...prev,
              title: `Interview untuk posisi ${jobInfo.title || "Unknown"}`,
            }));
          } else {
            console.error("No job info in application");
          }
        }
      } else {
        const errorText = await applicantResponse.text();
        console.error("Failed to load applicants:", errorText);
        Swal.fire({
          icon: "error",
          title: "Gagal Memuat Data",
          text: "Silakan coba lagi atau kembali ke halaman sebelumnya",
          confirmButtonColor: "#2563EB",
        });
      }
    } catch (error) {
      console.error("Load data error:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load data",
        confirmButtonColor: "#2563EB",
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
        text: "Silakan tentukan tanggal dan waktu interview",
        confirmButtonColor: "#2563EB",
      });
      return;
    }

    if (
      (formData.meetingType === "GOOGLE_MEET" ||
        formData.meetingType === "ZOOM") &&
      !formData.meetingUrl
    ) {
      Swal.fire({
        icon: "warning",
        title: "Link Meeting Belum Diisi",
        text: "Silakan masukkan link meeting",
        confirmButtonColor: "#2563EB",
      });
      return;
    }

    if (formData.meetingType === "IN_PERSON" && !formData.location) {
      Swal.fire({
        icon: "warning",
        title: "Lokasi Belum Diisi",
        text: "Silakan masukkan lokasi interview",
        confirmButtonColor: "#2563EB",
      });
      return;
    }

    if (!job?.id) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Data lowongan belum dimuat. Silakan refresh halaman.",
        confirmButtonColor: "#2563EB",
      });
      return;
    }

    if (!applicants || applicants.length === 0) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Data kandidat belum dimuat. Silakan refresh halaman.",
        confirmButtonColor: "#2563EB",
      });
      return;
    }

    try {
      setSaving(true);

      const token = localStorage.getItem("token");
      const response = await fetch("/api/interviews/schedule", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          jobId: job.id,
          applicationIds: applicants.map((app) => app.id),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Format date for WhatsApp message
        const formattedDate = new Date(formData.date).toLocaleDateString(
          "id-ID",
          {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          }
        );

        // Send WhatsApp to each candidate with phone number
        const candidatesWithPhone = applicants.filter(
          (app) => app.jobseeker?.phone
        );

        if (candidatesWithPhone.length > 0) {
          await Swal.fire({
            icon: "info",
            title: "Kirim Undangan WhatsApp",
            html: `<p>Klik OK untuk membuka WhatsApp dan mengirim undangan ke ${candidatesWithPhone.length} kandidat.</p>
                  <p class="text-sm text-gray-500 mt-2">Tab baru akan terbuka untuk setiap kandidat.</p>`,
            confirmButtonColor: "#25D366",
            confirmButtonText: "Buka WhatsApp",
          });

          // Open WhatsApp for each candidate
          candidatesWithPhone.forEach((app, index) => {
            const phone = app.jobseeker.phone.replace(/[^0-9]/g, ""); // Remove non-numeric chars
            const formattedPhone = phone.startsWith("0")
              ? "62" + phone.slice(1)
              : phone; // Convert 08xx to 628xx

            const meetingInfo =
              formData.meetingType === "IN_PERSON"
                ? `📍 *Lokasi:* ${formData.location}`
                : `🔗 *Link Meeting:* ${formData.meetingUrl}`;

            const message = encodeURIComponent(
              `Halo ${app.jobseeker.firstName} ${app.jobseeker.lastName},

Selamat! Anda diundang untuk mengikuti interview untuk posisi *${
                job?.title
              }* di *${job?.company?.name || "Perusahaan"}*.

📅 *Tanggal:* ${formattedDate}
⏰ *Waktu:* ${formData.time} WIB
⏱️ *Durasi:* ${formData.duration} menit
${meetingInfo}

${formData.description ? `📝 *Info:* ${formData.description}\n` : ""}
Mohon konfirmasi kehadiran Anda dengan membalas pesan ini.

Terima kasih dan sampai jumpa!`
            );

            // Delay opening each tab to prevent blocking
            setTimeout(() => {
              window.open(
                `https://wa.me/${formattedPhone}?text=${message}`,
                "_blank"
              );
            }, index * 800);
          });
        }

        await Swal.fire({
          icon: "success",
          title: "Interview Dijadwalkan!",
          html: `
            <p>Interview telah dijadwalkan untuk ${
              applicants.length
            } kandidat</p>
            <p class="text-sm text-gray-600 mt-2">Email notifikasi telah dikirim ke semua kandidat</p>
            ${
              candidatesWithPhone.length > 0
                ? `<p class="text-sm text-green-600 mt-1">✓ ${candidatesWithPhone.length} undangan WhatsApp sudah dibuka</p>`
                : ""
            }
          `,
          confirmButtonColor: "#2563EB",
        });
        router.push("/profile/recruiter/dashboard/applications");
      } else {
        Swal.fire({
          icon: "error",
          title: "Gagal",
          text: data.error || "Gagal menjadwalkan interview",
          confirmButtonColor: "#2563EB",
        });
      }
    } catch (error) {
      console.error("Schedule interview error:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to schedule interview",
        confirmButtonColor: "#2563EB",
      });
    } finally {
      setSaving(false);
    }
  };

  const removeApplicant = (applicantId) => {
    setApplicants((prev) => prev.filter((app) => app.id !== applicantId));

    if (applicants.length === 1) {
      Swal.fire({
        icon: "warning",
        title: "No Applicants",
        text: "You need at least one applicant to schedule an interview",
        confirmButtonColor: "#2563EB",
      }).then(() => {
        router.back();
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-200 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Jadwalkan Interview
            </h1>
            <p className="text-gray-600">
              {applicants.length > 1
                ? `Undang ${applicants.length} kandidat untuk interview bersama`
                : `Jadwalkan interview untuk kandidat`}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-lg shadow-sm p-6 space-y-6"
            >
              {/* Job Info */}
              {job && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-600 font-medium mb-1">
                    Posisi
                  </p>
                  <h3 className="text-lg font-bold text-gray-900">
                    {job.title}
                  </h3>
                  <p className="text-sm text-gray-600">{job.company?.name}</p>
                </div>
              )}

              {/* Interview Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Judul Interview *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Contoh: Interview Tahap 1 - Frontend Developer"
                  required
                />
              </div>

              {/* Date & Time */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal *
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
                    Waktu *
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
                    { value: "GOOGLE_MEET", label: "Google Meet", icon: Video },
                    { value: "ZOOM", label: "Zoom", icon: Video },
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

              {/* Meeting URL (for online meetings) */}
              {(formData.meetingType === "GOOGLE_MEET" ||
                formData.meetingType === "ZOOM") && (
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
                    placeholder={
                      formData.meetingType === "GOOGLE_MEET"
                        ? "https://meet.google.com/xxx-xxxx-xxx"
                        : "https://zoom.us/j/xxxxxxxxx"
                    }
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.meetingType === "GOOGLE_MEET"
                      ? "Masukkan link Google Meet yang sudah Anda buat"
                      : "Masukkan link Zoom meeting Anda"}
                  </p>
                </div>
              )}

              {/* Location (for in-person) */}
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
                    placeholder="Masukkan alamat lengkap lokasi interview"
                    required
                  />
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deskripsi
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tambahkan informasi tambahan tentang interview..."
                />
              </div>

              {/* Internal Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catatan Internal (Privat)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tambahkan catatan internal (tidak akan dibagikan ke kandidat)"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className={`flex-1 px-6 py-3 rounded-lg transition flex items-center justify-center gap-2 ${
                    saving
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
                      Menjadwalkan...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Jadwalkan Interview
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Sidebar - Selected Candidates */}
          <div>
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Kandidat Terpilih ({applicants.length})
              </h3>

              <div className="space-y-3">
                {applicants.map((application) => (
                  <div
                    key={application.id}
                    className="p-3 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold overflow-hidden flex-shrink-0">
                          {application.jobseeker?.photo ? (
                            <img
                              src={application.jobseeker.photo}
                              alt={application.jobseeker.firstName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            application.jobseeker?.firstName?.charAt(0) || "U"
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 text-sm truncate">
                            {application.jobseeker?.firstName}{" "}
                            {application.jobseeker?.lastName}
                          </h4>
                          <p className="text-xs text-gray-600 truncate">
                            {application.jobseeker?.currentTitle ||
                              "Job Seeker"}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeApplicant(application.id)}
                        className="p-1 hover:bg-red-50 rounded transition"
                        title="Hapus"
                      >
                        <X className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Info Box */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <p className="font-medium mb-1">Notifikasi Email</p>
                    <p className="text-blue-700">
                      Semua kandidat yang dipilih akan menerima email dengan
                      detail interview.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ScheduleInterviewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat halaman...</p>
          </div>
        </div>
      }
    >
      <ScheduleInterviewContent />
    </Suspense>
  );
}
