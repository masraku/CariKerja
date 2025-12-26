"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Swal from "sweetalert2";
import {
  ArrowLeft,
  FileText,
  Upload,
  Briefcase,
  Building2,
  MapPin,
  DollarSign,
  Loader2,
  CheckCircle,
  AlertCircle,
  Eye,
  X,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function ApplyJobPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const slug = params.slug;

  const [job, setJob] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [documentModal, setDocumentModal] = useState({
    isOpen: false,
    url: "",
    title: "",
  });

  useEffect(() => {
    if (!isAuthenticated) {
      Swal.fire({
        icon: "info",
        title: "Login Required",
        text: "Please login first to apply for this job",
        confirmButtonColor: "#2563EB",
      }).then(() => {
        router.push(`/login?redirect=/jobs/${slug}/apply`);
      });
      return;
    }

    if (user?.role !== "JOBSEEKER") {
      Swal.fire({
        icon: "error",
        title: "Access Denied",
        text: "Only jobseekers can apply for jobs",
        confirmButtonColor: "#2563EB",
      }).then(() => {
        router.push("/jobs");
      });
      return;
    }

    fetchJobAndProfile();
  }, [slug, isAuthenticated, user]);

  const fetchJobAndProfile = async () => {
    try {
      setLoading(true);

      // Fetch job details
      const jobResponse = await fetch(`/api/jobs/${slug}`);
      const jobData = await jobResponse.json();

      if (!jobData.success) {
        throw new Error("Job not found");
      }

      setJob(jobData.data);

      // Fetch user profile
      const profileResponse = await fetch("/api/profile/jobseeker");
      const profileData = await profileResponse.json();

      if (profileData.success) {
        setProfile(profileData.profile);

        // Check if profile is complete
        if (!profileData.profile.profileCompleted) {
          Swal.fire({
            icon: "warning",
            title: "Profile Incomplete",
            text: "Please complete your profile before applying for jobs",
            showCancelButton: true,
            confirmButtonText: "Complete Profile",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#2563EB",
          }).then((result) => {
            if (result.isConfirmed) {
              router.push("/profile/jobseeker?mode=edit");
            } else {
              router.push(`/jobs/${slug}`);
            }
          });
        }
      }
    } catch (error) {
      console.error("Error:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load job details",
        confirmButtonColor: "#2563EB",
      }).then(() => {
        router.push("/jobs");
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if CV is uploaded
    if (!profile.cvUrl) {
      Swal.fire({
        icon: "warning",
        title: "CV Diperlukan",
        text: "Silakan upload CV Anda di profil terlebih dahulu",
        confirmButtonColor: "#2563EB",
      });
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(`/api/jobs/${slug}/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resumeUrl: profile.cvUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit application");
      }

      // Success
      Swal.fire({
        icon: "success",
        title: "Lamaran Terkirim!",
        text: "Lamaran Anda telah berhasil dikirim. Semoga berhasil!",
        confirmButtonColor: "#2563EB",
      }).then(() => {
        router.push("/profile/jobseeker/applications");
      });
    } catch (error) {
      console.error("Submit error:", error);

      if (
        error.message.includes("sudah melamar") ||
        error.message.includes("already applied")
      ) {
        Swal.fire({
          icon: "info",
          title: "Sudah Pernah Melamar",
          html: `
            <p>Anda sudah pernah melamar ke lowongan ini.</p>
            <p class="mt-2">Silakan cek status aplikasi Anda atau melamar ke lowongan lain.</p>
          `,
          showCancelButton: true,
          confirmButtonText: "Lihat Status Aplikasi",
          cancelButtonText: "Cari Lowongan Lain",
          confirmButtonColor: "#2563EB",
        }).then((result) => {
          if (result.isConfirmed) {
            router.push("/profile/jobseeker/applications");
          } else {
            router.push("/jobs");
          }
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Gagal Mengirim Lamaran",
          text: error.message,
          confirmButtonColor: "#2563EB",
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Get document count
  const getDocumentStatus = () => {
    let completed = 0;
    let required = 0;
    const requiredDocs = [
      profile?.cvUrl,
      profile?.ktpUrl,
      profile?.ak1Url,
      profile?.ijazahUrl,
    ];
    const optionalDocs = [profile?.sertifikatUrl, profile?.suratPengalamanUrl];

    requiredDocs.forEach((doc) => {
      if (doc) completed++;
    });
    optionalDocs.forEach((doc) => {
      if (doc) completed++;
    });
    requiredDocs.forEach((doc) => {
      if (doc) required++;
    });

    return {
      completed,
      total: 6,
      requiredCompleted: required,
      requiredTotal: 4,
      allRequiredComplete: required === 4,
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!job || !profile) {
    return null;
  }

  const docStatus = getDocumentStatus();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <Link
            href={`/jobs/${slug}`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Kembali ke Detail Lowongan</span>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Job Info Card - Compact */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-2xl overflow-hidden flex-shrink-0">
                {job.company.logo ? (
                  <img
                    src={job.company.logo}
                    alt={job.company.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  "🏢"
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold text-gray-900 truncate">
                  {job.title}
                </h1>
                <p className="text-gray-600 text-sm flex items-center gap-1">
                  <Building2 className="w-4 h-4" />
                  {job.company.name}
                </p>
                <div className="flex gap-2 mt-1">
                  <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                    {job.city}
                  </span>
                  {job.showSalary && job.salaryMin && (
                    <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded">
                      Rp {job.salaryMin.toLocaleString("id-ID")}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Application Form - Simplified */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FileText className="w-6 h-6 text-blue-600" />
              Kirim Lamaran
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Summary */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  Data Diri Anda
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">Nama:</span>
                    <p className="font-medium text-gray-900">
                      {profile.firstName} {profile.lastName}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Email:</span>
                    <p className="font-medium text-gray-900">{profile.email}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Telepon:</span>
                    <p className="font-medium text-gray-900">
                      {profile.phone || "-"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Kota:</span>
                    <p className="font-medium text-gray-900">
                      {profile.city || "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Document Status */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">
                    Status Kelengkapan Lampiran
                  </h3>
                  <span
                    className={`text-sm font-medium px-2 py-1 rounded ${
                      docStatus.allRequiredComplete
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {docStatus.requiredCompleted}/{docStatus.requiredTotal}{" "}
                    Wajib
                  </span>
                </div>

                <div className="space-y-3">
                  {/* Documents Array */}
                  {[
                    {
                      key: "cvUrl",
                      label: "CV / Resume",
                      required: true,
                      url: profile.cvUrl,
                    },
                    {
                      key: "ktpUrl",
                      label: "KTP",
                      required: true,
                      url: profile.ktpUrl,
                    },
                    {
                      key: "ak1Url",
                      label: "Kartu AK-1",
                      required: true,
                      url: profile.ak1Url,
                    },
                    {
                      key: "ijazahUrl",
                      label: "Ijazah Pendidikan Terakhir",
                      required: true,
                      url: profile.ijazahUrl,
                    },
                    {
                      key: "sertifikatUrl",
                      label: "Sertifikat Pelatihan",
                      required: false,
                      url: profile.sertifikatUrl,
                    },
                    {
                      key: "suratPengalamanUrl",
                      label: "Surat Pengalaman Kerja",
                      required: false,
                      url: profile.suratPengalamanUrl,
                    },
                  ].map((doc) => (
                    <div
                      key={doc.key}
                      className={`flex items-center justify-between p-4 rounded-xl border-2 ${
                        doc.url
                          ? "border-green-200 bg-green-50"
                          : doc.required
                          ? "border-red-200 bg-red-50"
                          : "border-gray-200 bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {doc.url ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : doc.required ? (
                          <AlertCircle className="w-5 h-5 text-red-500" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                        )}
                        <div>
                          <p className="font-medium text-gray-900 text-sm">
                            {doc.label}
                            {doc.required && (
                              <span className="text-red-500 ml-1">*</span>
                            )}
                          </p>
                          <p
                            className={`text-xs ${
                              doc.url
                                ? "text-green-600"
                                : doc.required
                                ? "text-red-500"
                                : "text-gray-500"
                            }`}
                          >
                            {doc.url
                              ? "✓ Sudah diupload"
                              : doc.required
                              ? "✗ Belum diupload"
                              : "Opsional"}
                          </p>
                        </div>
                      </div>
                      {doc.url && (
                        <button
                          type="button"
                          onClick={() =>
                            setDocumentModal({
                              isOpen: true,
                              url: doc.url,
                              title: doc.label,
                            })
                          }
                          className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          Lihat
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Link to complete profile */}
                {docStatus.completed < docStatus.total && (
                  <Link
                    href="/profile/jobseeker?mode=edit"
                    className="block mt-3"
                  >
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700 hover:bg-blue-100 transition">
                      📎 Klik di sini untuk melengkapi dokumen di profil Anda
                    </div>
                  </Link>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting || !docStatus.allRequiredComplete}
                className={`w-full py-4 rounded-xl font-semibold text-white transition flex items-center justify-center gap-2 ${
                  submitting || !docStatus.allRequiredComplete
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl"
                }`}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Mengirim Lamaran...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Kirim Lamaran Sekarang
                  </>
                )}
              </button>

              {!docStatus.allRequiredComplete && (
                <p className="text-center text-sm text-red-500">
                  * Semua dokumen wajib harus diupload untuk mengirim lamaran
                </p>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Document Preview Modal */}
      {documentModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-bold text-gray-900">
                Preview: {documentModal.title}
              </h3>
              <button
                type="button"
                onClick={() =>
                  setDocumentModal({ isOpen: false, url: "", title: "" })
                }
                className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4 h-[70vh] overflow-auto">
              {documentModal.url && (
                <>
                  {documentModal.url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                    <img
                      src={documentModal.url}
                      alt={documentModal.title}
                      className="max-w-full h-auto mx-auto rounded-lg"
                    />
                  ) : (
                    <iframe
                      src={documentModal.url}
                      className="w-full h-full rounded-lg"
                      title={documentModal.title}
                    />
                  )}
                </>
              )}
            </div>
            <div className="flex justify-end gap-3 p-4 border-t bg-gray-50">
              <a
                href={documentModal.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Buka di Tab Baru
              </a>
              <button
                type="button"
                onClick={() =>
                  setDocumentModal({ isOpen: false, url: "", title: "" })
                }
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm font-medium"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
