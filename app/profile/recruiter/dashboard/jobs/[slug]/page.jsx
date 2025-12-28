"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Users,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Eye,
  MapPin,
  Briefcase,
  Mail,
  Phone,
  Video,
  CheckSquare,
  Square,
  UserPlus,
  Trash2,
  ExternalLink,
  FileText,
  X,
  Sparkles,
  Loader2,
  GraduationCap,
  Award,
} from "lucide-react";
import Swal from "sweetalert2";

export default function JobDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [job, setJob] = useState(null);
  const [stats, setStats] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedApplications, setSelectedApplications] = useState([]);
  const [selectMode, setSelectMode] = useState(false);
  const [documentModal, setDocumentModal] = useState({
    isOpen: false,
    url: "",
    title: "",
  });
  const [aiRecommendations, setAiRecommendations] = useState({});
  const [loadingAI, setLoadingAI] = useState({});
  const [applicantModal, setApplicantModal] = useState({
    isOpen: false,
    application: null,
  });
  const itemsPerPage = 10;

  useEffect(() => {
    loadApplications();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [applications, searchQuery, statusFilter, aiRecommendations]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredApplications.length]);

  // Recalculate stats when applications change
  useEffect(() => {
    if (applications.length > 0) {
      setStats({
        total: applications.length,
        pending: applications.filter((a) => a.status === "PENDING").length,
        reviewing: applications.filter((a) => a.status === "REVIEWING").length,
        shortlisted: applications.filter((a) => a.status === "SHORTLISTED")
          .length,
        interview: applications.filter(
          (a) => a.status === "INTERVIEW_SCHEDULED"
        ).length,
        interviewCompleted: applications.filter(
          (a) => a.status === "INTERVIEW_COMPLETED"
        ).length,
        accepted: applications.filter((a) => a.status === "ACCEPTED").length,
      });
    }
  }, [applications]);

  // Fetch AI recommendations for applications
  useEffect(() => {
    if (applications.length > 0 && job) {
      applications.forEach((app) => {
        if (
          app.jobseekers?.cvUrl &&
          !aiRecommendations[app.id] &&
          !loadingAI[app.id]
        ) {
          fetchAIRecommendation(app);
        }
      });
    }
  }, [applications, job]);

  const fetchAIRecommendation = async (application) => {
    try {
      setLoadingAI((prev) => ({ ...prev, [application.id]: true }));

      // Use internal API route to avoid CORS issues
      const response = await fetch("/api/profile/recruiter/jobs/ai-match", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cv_url: application.jobseekers?.cvUrl,
          job_requirements: {
            title: job?.title,
            description: job?.description,
            requirements: job?.requirements,
            skills:
              job?.job_skills?.map((js) => js.skills?.name).filter(Boolean) ||
              job?.skills ||
              [],
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAiRecommendations((prev) => ({
          ...prev,
          [application.id]: {
            isRecommended: data.match_score >= 70,
            score: data.match_score,
            highlights: data.highlights || [],
          },
        }));
      }
    } catch (error) {
    } finally {
      setLoadingAI((prev) => ({ ...prev, [application.id]: false }));
    }
  };

  const loadApplications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await fetch(
        `/api/profile/recruiter/jobs/${params.slug}/applications`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications || []);
        setJob(data.job);
        setStats(data.stats);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to load applications");
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to load applications",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterApplications = () => {
    let filtered = applications;

    // Handle AI_RECOMMENDED filter
    if (statusFilter === "AI_RECOMMENDED") {
      filtered = filtered.filter(
        (app) => aiRecommendations[app.id]?.isRecommended
      );
    } else if (statusFilter !== "all") {
      filtered = filtered.filter((app) => app.status === statusFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter((app) => {
        const fullName = `${app.jobseekers?.firstName || ""} ${
          app.jobseekers?.lastName || ""
        }`.toLowerCase();
        const email = app.jobseekers?.email?.toLowerCase() || "";
        const query = searchQuery.toLowerCase();
        return fullName.includes(query) || email.includes(query);
      });
    }

    // Sort: AI Recommended first, then by date (oldest first - FIFO)
    if (statusFilter === "all" || statusFilter === "PENDING") {
      filtered = [...filtered].sort((a, b) => {
        const aRecommended = aiRecommendations[a.id]?.isRecommended ? 1 : 0;
        const bRecommended = aiRecommendations[b.id]?.isRecommended ? 1 : 0;

        // AI recommended first
        if (bRecommended !== aRecommended) {
          return bRecommended - aRecommended;
        }

        // Then by date (oldest first - FIFO)
        return new Date(a.appliedAt) - new Date(b.appliedAt);
      });
    } else {
      // For other filters, just sort by date (oldest first - FIFO)
      filtered = [...filtered].sort(
        (a, b) => new Date(a.appliedAt) - new Date(b.appliedAt)
      );
    }

    setFilteredApplications(filtered);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: {
        label: "Lamaran Masuk",
        color: "bg-yellow-100 text-yellow-700",
        icon: Clock,
      },
      REVIEWING: {
        label: "Sedang Ditinjau",
        color: "bg-blue-100 text-blue-700",
        icon: Eye,
      },
      SHORTLISTED: {
        label: "Lolos Seleksi",
        color: "bg-purple-100 text-purple-700",
        icon: CheckCircle,
      },
      INTERVIEW_SCHEDULED: {
        label: "Tahap Interview",
        color: "bg-indigo-100 text-indigo-700",
        icon: Calendar,
      },
      INTERVIEW_COMPLETED: {
        label: "Selesai Interview",
        color: "bg-teal-100 text-teal-700",
        icon: CheckCircle,
      },
      ACCEPTED: {
        label: "Diterima",
        color: "bg-green-100 text-green-700",
        icon: CheckCircle,
      },
      REJECTED: {
        label: "Ditolak",
        color: "bg-red-100 text-red-700",
        icon: XCircle,
      },
    };
    const config = statusConfig[status] || statusConfig.PENDING;
    const Icon = config.icon;
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Toggle select mode
  const toggleSelectMode = () => {
    setSelectMode(!selectMode);
    setSelectedApplications([]);
  };

  // Handle checkbox toggle
  const handleSelectApplication = (applicationId) => {
    setSelectedApplications((prev) => {
      if (prev.includes(applicationId)) {
        return prev.filter((id) => id !== applicationId);
      } else {
        return [...prev, applicationId];
      }
    });
  };

  // Handle bulk shortlist (REVIEWING -> SHORTLISTED)
  const handleBulkShortlist = async () => {
    const selectedApps = filteredApplications.filter((app) =>
      selectedApplications.includes(app.id)
    );
    const validApps = selectedApps.filter((app) => app.status === "REVIEWING");

    if (validApps.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Tidak Ada Kandidat Valid",
        text: 'Hanya kandidat dengan status "Sedang Ditinjau" yang bisa dipindahkan ke Lolos Seleksi.',
        confirmButtonColor: "#9333ea",
      });
      return;
    }

    const result = await Swal.fire({
      title: "Lolos Seleksi Serentak?",
      html: `<p>Pindahkan <strong>${validApps.length} kandidat</strong> ke tahap Lolos Seleksi?</p>`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, Lolos Seleksi",
      cancelButtonText: "Batal",
      confirmButtonColor: "#9333ea",
    });

    if (!result.isConfirmed) return;

    try {
      const token = localStorage.getItem("token");

      // Update all selected candidates
      await Promise.all(
        validApps.map((app) =>
          fetch(`/api/profile/recruiter/applications/${app.id}`, {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: "SHORTLISTED" }),
          })
        )
      );

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: `${validApps.length} kandidat berhasil dipindahkan ke Lolos Seleksi`,
        timer: 2000,
        showConfirmButton: false,
      });

      // Update local state
      setApplications((prev) =>
        prev.map((app) =>
          validApps.find((v) => v.id === app.id)
            ? { ...app, status: "SHORTLISTED" }
            : app
        )
      );
      setSelectedApplications([]);
      setSelectMode(false);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Gagal memindahkan kandidat",
      });
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedApplications.length === 0) return;

    const result = await Swal.fire({
      title: "Hapus Serentak?",
      html: `<p>Hapus <strong>${selectedApplications.length} lamaran</strong> yang dipilih?</p>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#ef4444",
    });

    if (!result.isConfirmed) return;

    try {
      const token = localStorage.getItem("token");

      await Promise.all(
        selectedApplications.map((appId) =>
          fetch(`/api/profile/recruiter/applications/${appId}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
        )
      );

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: `${selectedApplications.length} lamaran berhasil dihapus`,
        timer: 2000,
        showConfirmButton: false,
      });

      // Update local state
      setApplications((prev) =>
        prev.filter((app) => !selectedApplications.includes(app.id))
      );
      setSelectedApplications([]);
      setSelectMode(false);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Gagal menghapus lamaran",
      });
    }
  };

  // Handle invite multiple to interview (from SHORTLISTED)
  const handleInviteMultipleInterview = () => {
    if (!job?.id) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Data lowongan belum dimuat. Silakan refresh halaman.",
      });
      return;
    }

    const selectedApps = filteredApplications.filter((app) =>
      selectedApplications.includes(app.id)
    );
    const invalidApps = selectedApps.filter(
      (app) => app.status !== "SHORTLISTED"
    );
    if (invalidApps.length > 0) {
      Swal.fire({
        icon: "warning",
        title: "Status Tidak Valid",
        text: 'Hanya kandidat dengan status "Lolos Seleksi" yang bisa diundang interview.',
        confirmButtonColor: "#3b82f6",
      });
      return;
    }

    router.push(
      `/profile/recruiter/dashboard/interview?job=${
        job.id
      }&applicants=${selectedApplications.join(",")}`
    );
  };

  // Handle view application - open modal instead of new page
  const handleViewApplication = async (application) => {
    if (application.status === "PENDING") {
      try {
        const token = localStorage.getItem("token");
        await fetch(`/api/profile/recruiter/applications/${application.id}`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "REVIEWING" }),
        });
        // Update local state
        setApplications((prev) =>
          prev.map((app) =>
            app.id === application.id ? { ...app, status: "REVIEWING" } : app
          )
        );
      } catch (error) {
      }
    }
    // Open modal instead of navigating
    setApplicantModal({ isOpen: true, application });
  };

  // Handle shortlist candidate (REVIEWING -> SHORTLISTED)
  const handleShortlistCandidate = async (application) => {
    const result = await Swal.fire({
      title: "Lolos Seleksi Awal?",
      html: `<p>Pindahkan <strong>${application.jobseekers?.firstName} ${application.jobseekers?.lastName}</strong> ke tahap Lolos Seleksi?</p>`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, Lolos Seleksi",
      cancelButtonText: "Batal",
      confirmButtonColor: "#9333ea",
    });

    if (!result.isConfirmed) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `/api/profile/recruiter/applications/${application.id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "SHORTLISTED" }),
        }
      );

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Kandidat berhasil dipindahkan ke Lolos Seleksi",
          timer: 1500,
          showConfirmButton: false,
        });
        // Update local state
        setApplications((prev) =>
          prev.map((app) =>
            app.id === application.id ? { ...app, status: "SHORTLISTED" } : app
          )
        );
      } else {
        throw new Error("Failed to update status");
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Gagal memindahkan kandidat",
      });
    }
  };

  // Handle invite single to interview
  const handleInviteInterview = (application) => {
    if (!job?.id) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Data lowongan belum dimuat. Silakan refresh halaman.",
      });
      return;
    }
    router.push(
      `/profile/recruiter/dashboard/interview?job=${job.id}&applicants=${application.id}`
    );
  };

  // Handle accept candidate
  const handleAcceptCandidate = async (application) => {
    if (application.status !== "INTERVIEW_COMPLETED") {
      Swal.fire({
        icon: "warning",
        title: "Belum Bisa Diterima",
        text: "Kandidat hanya bisa diterima setelah interview selesai.",
        confirmButtonColor: "#3b82f6",
      });
      return;
    }

    const result = await Swal.fire({
      title: "Terima Kandidat?",
      html: `
                <p class="mb-4">Apakah Anda yakin ingin menerima <strong>${application.jobseekers?.firstName} ${application.jobseekers?.lastName}</strong>?</p>
                <textarea 
                    id="accept-message" 
                    class="swal2-input" 
                    placeholder="Pesan untuk kandidat (opsional)"
                    rows="4"
                    style="width: 90%; height: 100px; resize: vertical;"
                ></textarea>
            `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, Terima",
      cancelButtonText: "Batal",
      confirmButtonColor: "#10b981",
      preConfirm: () => {
        return document.getElementById("accept-message").value;
      },
    });

    if (!result.isConfirmed) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `/api/profile/recruiter/applications/${application.id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "ACCEPTED",
            recruiterNotes: result.value || "",
          }),
        }
      );

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Kandidat Diterima!",
          text: "Email notifikasi telah dikirim ke kandidat.",
          timer: 2000,
          showConfirmButton: false,
        });
        loadApplications();
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Gagal menerima kandidat",
      });
    }
  };

  // Handle delete application
  const handleDeleteApplication = async (applicationId, applicantName) => {
    const result = await Swal.fire({
      title: "Hapus Lamaran?",
      html: `<p>Apakah Anda yakin ingin menghapus lamaran dari <strong>${applicantName}</strong>?</p>`,
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
        `/api/profile/recruiter/applications/${applicationId}`,
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
          title: "Lamaran Dihapus",
          timer: 1500,
          showConfirmButton: false,
        });
        loadApplications();
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Gagal menghapus lamaran",
      });
    }
  };

  const totalPages = Math.max(
    1,
    Math.ceil(filteredApplications.length / itemsPerPage)
  );

  const renderApplicationCard = (application) => {
    const skills = application.jobseekers?.skills || [];
    const displaySkills = skills.slice(0, 3);
    const remainingSkills = skills.length - 3;
    const isSelected = selectedApplications.includes(application.id);
    const canSelect = selectMode; // Allow selecting any status

    return (
      <div
        key={application.id}
        onClick={() => canSelect && handleSelectApplication(application.id)}
        className={`group bg-white rounded-2xl border p-5 transition-all duration-300 ${
          isSelected
            ? "border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/30"
            : "border-gray-100 hover:shadow-xl hover:border-blue-100"
        } ${canSelect ? "cursor-pointer" : ""}`}
      >
        {/* Header with Avatar and Status */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            {/* Checkbox for select mode */}
            {selectMode && (
              <div
                className="flex-shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectApplication(application.id);
                }}
              >
                {isSelected ? (
                  <CheckSquare className="w-6 h-6 text-indigo-600" />
                ) : (
                  <Square
                    className={`w-6 h-6 ${
                      application.status === "REVIEWING"
                        ? "text-gray-400 hover:text-indigo-500"
                        : "text-gray-300"
                    }`}
                  />
                )}
              </div>
            )}
            <div className="relative">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#03587f] to-[#024666] flex items-center justify-center text-white text-lg font-semibold overflow-hidden">
                {application.jobseekers?.photo ? (
                  <img
                    src={application.jobseekers.photo}
                    alt={application.jobseekers.firstName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  application.jobseekers?.firstName?.charAt(0) || "U"
                )}
              </div>
              <div
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                  application.profileCompleteness >= 80
                    ? "bg-green-500"
                    : "bg-yellow-500"
                }`}
              ></div>
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {application.jobseekers?.firstName}{" "}
                {application.jobseekers?.lastName}
              </h3>
              <p className="text-sm text-gray-500">
                {application.jobseekers?.currentTitle || "Job Seeker"}
              </p>
            </div>
          </div>
          {getStatusBadge(application.status)}
        </div>

        {/* Skills */}
        {skills.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1.5">
              {displaySkills.map((skill, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium"
                >
                  {skill}
                </span>
              ))}
              {remainingSkills > 0 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-medium">
                  +{remainingSkills} lainnya
                </span>
              )}
            </div>
          </div>
        )}

        {/* Documents Section */}
        {(application.jobseekers?.cvUrl ||
          application.jobseekers?.ktpUrl ||
          application.jobseekers?.ak1Url) && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-600 mb-2">Berkas:</p>
            <div className="flex flex-wrap gap-2">
              {application.jobseekers?.cvUrl && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDocumentModal({
                      isOpen: true,
                      url: application.jobseekers.cvUrl,
                      title: "CV",
                    });
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-medium hover:bg-indigo-100 transition"
                >
                  <FileText className="w-3.5 h-3.5" />
                  CV
                </button>
              )}
              {application.jobseekers?.ktpUrl && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDocumentModal({
                      isOpen: true,
                      url: application.jobseekers.ktpUrl,
                      title: "KTP",
                    });
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-medium hover:bg-green-100 transition"
                >
                  <FileText className="w-3.5 h-3.5" />
                  KTP
                </button>
              )}
              {application.jobseekers?.ak1Url && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDocumentModal({
                      isOpen: true,
                      url: application.jobseekers.ak1Url,
                      title: "Kartu AK-1",
                    });
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-orange-50 text-orange-700 rounded-lg text-xs font-medium hover:bg-orange-100 transition"
                >
                  <FileText className="w-3.5 h-3.5" />
                  AK-1
                </button>
              )}
            </div>
          </div>
        )}

        {/* Contact & Meta Info */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Mail className="w-3.5 h-3.5" />
            <span className="truncate max-w-[150px]">
              {application.jobseekers?.email}
            </span>
          </div>
          {application.jobseekers?.phone && (
            <div className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5" />
              {application.jobseekers.phone}
            </div>
          )}
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(application.appliedAt)}
          </div>
        </div>

        {/* Action Buttons - Dynamic based on status */}
        <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
          {application.status === "PENDING" ? (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewApplication(application);
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition text-sm font-medium"
              >
                <Eye className="w-4 h-4" />
                Lihat
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteApplication(
                    application.id,
                    `${application.jobseekers?.firstName} ${application.jobseekers?.lastName}`
                  );
                }}
                className="flex items-center justify-center px-3 py-2 border border-gray-200 text-gray-500 rounded-xl hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          ) : application.status === "REVIEWING" ? (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewApplication(application);
                }}
                className="flex items-center justify-center gap-1.5 px-3 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition text-sm"
              >
                <Eye className="w-4 h-4" />
                Detail
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleShortlistCandidate(application);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition text-sm font-medium"
              >
                <CheckCircle className="w-4 h-4" />
                Lolos Seleksi
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteApplication(
                    application.id,
                    `${application.jobseekers?.firstName} ${application.jobseekers?.lastName}`
                  );
                }}
                className="flex items-center justify-center px-3 py-2 border border-gray-200 text-gray-500 rounded-xl hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          ) : application.status === "SHORTLISTED" ? (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewApplication(application);
                }}
                className="flex items-center justify-center gap-1.5 px-3 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition text-sm"
              >
                <Eye className="w-4 h-4" />
                Detail
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleInviteInterview(application);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition text-sm font-medium"
              >
                <Video className="w-4 h-4" />
                Undang Interview
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteApplication(
                    application.id,
                    `${application.jobseekers?.firstName} ${application.jobseekers?.lastName}`
                  );
                }}
                className="flex items-center justify-center px-3 py-2 border border-gray-200 text-gray-500 rounded-xl hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          ) : application.status === "INTERVIEW_SCHEDULED" ? (
            <>
              {application.interview?.meetingUrl && (
                <a
                  href={application.interview.meetingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition text-sm font-medium shadow-lg"
                >
                  <Video className="w-4 h-4" />
                  Masuk Interview
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewApplication(application);
                }}
                className="flex items-center justify-center gap-1.5 px-3 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition text-sm"
              >
                <Eye className="w-4 h-4" />
                Detail
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteApplication(
                    application.id,
                    `${application.jobseekers?.firstName} ${application.jobseekers?.lastName}`
                  );
                }}
                className="flex items-center justify-center px-3 py-2 border border-gray-200 text-gray-500 rounded-xl hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          ) : application.status === "INTERVIEW_COMPLETED" ? (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewApplication(application);
                }}
                className="flex items-center justify-center gap-1.5 px-3 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition text-sm"
              >
                <Eye className="w-4 h-4" />
                Detail
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAcceptCandidate(application);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition text-sm font-medium"
              >
                <CheckCircle className="w-4 h-4" />
                Terima
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteApplication(
                    application.id,
                    `${application.jobseekers?.firstName} ${application.jobseekers?.lastName}`
                  );
                }}
                className="flex items-center justify-center px-3 py-2 border border-gray-200 text-gray-500 rounded-xl hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          ) : application.status === "ACCEPTED" ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleViewApplication(application);
              }}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition text-sm font-medium"
            >
              <CheckCircle className="w-4 h-4" />
              Lihat Detail
            </button>
          ) : (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewApplication(application);
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition text-sm font-medium"
              >
                <Eye className="w-4 h-4" />
                Lihat Detail
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteApplication(
                    application.id,
                    `${application.jobseekers?.firstName} ${application.jobseekers?.lastName}`
                  );
                }}
                className="flex items-center justify-center px-3 py-2 border border-gray-200 text-gray-500 rounded-xl hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push("/profile/recruiter/dashboard/jobs")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Kembali ke Daftar Lowongan
          </button>

          {job && (
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {job.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-gray-600">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {job.location}
                </div>
                <div className="flex items-center gap-1">
                  <Briefcase className="w-4 h-4" />
                  {job.jobType}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stats Cards - 7 Cards Bahasa Indonesia */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
            {/* Total */}
            <button
              onClick={() => setStatusFilter("all")}
              className={`text-left rounded-xl p-4 transition-all ${
                statusFilter === "all"
                  ? "bg-gray-900 text-white ring-2 ring-gray-900 ring-offset-2"
                  : "bg-white hover:bg-gray-50 border border-gray-200"
              }`}
            >
              <p
                className={`text-xs mb-1 ${
                  statusFilter === "all" ? "text-gray-300" : "text-gray-500"
                }`}
              >
                Total
              </p>
              <p
                className={`text-2xl font-bold ${
                  statusFilter === "all" ? "text-white" : "text-gray-900"
                }`}
              >
                {stats.total}
              </p>
            </button>

            {/* Lamaran Masuk (PENDING) */}
            <button
              onClick={() => setStatusFilter("PENDING")}
              className={`text-left rounded-xl p-4 transition-all ${
                statusFilter === "PENDING"
                  ? "bg-yellow-500 text-white ring-2 ring-yellow-500 ring-offset-2"
                  : "bg-yellow-50 hover:bg-yellow-100 border border-yellow-200"
              }`}
            >
              <p
                className={`text-xs mb-1 ${
                  statusFilter === "PENDING"
                    ? "text-yellow-100"
                    : "text-yellow-700"
                }`}
              >
                Lamaran Masuk
              </p>
              <p
                className={`text-2xl font-bold ${
                  statusFilter === "PENDING" ? "text-white" : "text-yellow-900"
                }`}
              >
                {stats.pending}
              </p>
            </button>

            {/* Rekomendasi AI */}
            <button
              onClick={() => setStatusFilter("AI_RECOMMENDED")}
              className={`text-left rounded-xl p-4 transition-all relative overflow-hidden ${
                statusFilter === "AI_RECOMMENDED"
                  ? "bg-gradient-to-br from-amber-500 to-orange-500 text-white ring-2 ring-amber-500 ring-offset-2"
                  : "bg-gradient-to-br from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 border border-amber-200"
              }`}
            >
              <Sparkles
                className={`absolute -right-2 -top-2 w-10 h-10 ${
                  statusFilter === "AI_RECOMMENDED"
                    ? "text-white/30"
                    : "text-amber-200"
                }`}
              />
              <p
                className={`text-xs mb-1 ${
                  statusFilter === "AI_RECOMMENDED"
                    ? "text-amber-100"
                    : "text-amber-700"
                }`}
              >
                Rekomendasi AI
              </p>
              <p
                className={`text-2xl font-bold ${
                  statusFilter === "AI_RECOMMENDED"
                    ? "text-white"
                    : "text-amber-900"
                }`}
              >
                {
                  Object.values(aiRecommendations).filter(
                    (r) => r?.isRecommended
                  ).length
                }
              </p>
            </button>

            {/* Sedang Ditinjau (REVIEWING) */}
            <button
              onClick={() => setStatusFilter("REVIEWING")}
              className={`text-left rounded-xl p-4 transition-all ${
                statusFilter === "REVIEWING"
                  ? "bg-blue-500 text-white ring-2 ring-blue-500 ring-offset-2"
                  : "bg-blue-50 hover:bg-blue-100 border border-blue-200"
              }`}
            >
              <p
                className={`text-xs mb-1 ${
                  statusFilter === "REVIEWING"
                    ? "text-blue-100"
                    : "text-blue-700"
                }`}
              >
                Sedang Ditinjau
              </p>
              <p
                className={`text-2xl font-bold ${
                  statusFilter === "REVIEWING" ? "text-white" : "text-blue-900"
                }`}
              >
                {stats.reviewing}
              </p>
            </button>

            {/* Lolos Seleksi (SHORTLISTED) */}
            <button
              onClick={() => setStatusFilter("SHORTLISTED")}
              className={`text-left rounded-xl p-4 transition-all ${
                statusFilter === "SHORTLISTED"
                  ? "bg-purple-500 text-white ring-2 ring-purple-500 ring-offset-2"
                  : "bg-purple-50 hover:bg-purple-100 border border-purple-200"
              }`}
            >
              <p
                className={`text-xs mb-1 ${
                  statusFilter === "SHORTLISTED"
                    ? "text-purple-100"
                    : "text-purple-700"
                }`}
              >
                Lolos Seleksi
              </p>
              <p
                className={`text-2xl font-bold ${
                  statusFilter === "SHORTLISTED"
                    ? "text-white"
                    : "text-purple-900"
                }`}
              >
                {stats.shortlisted || 0}
              </p>
            </button>

            {/* Tahap Interview (INTERVIEW_SCHEDULED) */}
            <button
              onClick={() => setStatusFilter("INTERVIEW_SCHEDULED")}
              className={`text-left rounded-xl p-4 transition-all ${
                statusFilter === "INTERVIEW_SCHEDULED"
                  ? "bg-indigo-500 text-white ring-2 ring-indigo-500 ring-offset-2"
                  : "bg-indigo-50 hover:bg-indigo-100 border border-indigo-200"
              }`}
            >
              <p
                className={`text-xs mb-1 ${
                  statusFilter === "INTERVIEW_SCHEDULED"
                    ? "text-indigo-100"
                    : "text-indigo-700"
                }`}
              >
                Tahap Interview
              </p>
              <p
                className={`text-2xl font-bold ${
                  statusFilter === "INTERVIEW_SCHEDULED"
                    ? "text-white"
                    : "text-indigo-900"
                }`}
              >
                {stats.interview}
              </p>
            </button>

            {/* Terima (ACCEPTED) */}
            <button
              onClick={() => setStatusFilter("ACCEPTED")}
              className={`text-left rounded-xl p-4 transition-all ${
                statusFilter === "ACCEPTED"
                  ? "bg-green-500 text-white ring-2 ring-green-500 ring-offset-2"
                  : "bg-green-50 hover:bg-green-100 border border-green-200"
              }`}
            >
              <p
                className={`text-xs mb-1 ${
                  statusFilter === "ACCEPTED"
                    ? "text-green-100"
                    : "text-green-700"
                }`}
              >
                Terima
              </p>
              <p
                className={`text-2xl font-bold ${
                  statusFilter === "ACCEPTED" ? "text-white" : "text-green-900"
                }`}
              >
                {stats.accepted}
              </p>
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <span className="font-semibold text-gray-900">Filter:</span>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              <option value="all">Semua Status</option>
              <option value="PENDING">Lamaran Masuk</option>
              <option value="AI_RECOMMENDED">Rekomendasi AI</option>
              <option value="REVIEWING">Sedang Ditinjau</option>
              <option value="SHORTLISTED">Lolos Seleksi</option>
              <option value="INTERVIEW_SCHEDULED">Tahap Interview</option>
              <option value="ACCEPTED">Diterima</option>
            </select>

            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari nama atau email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>

            {(statusFilter !== "all" || searchQuery) && (
              <button
                onClick={() => {
                  setStatusFilter("all");
                  setSearchQuery("");
                }}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Reset Filter
              </button>
            )}

            {/* Select Mode Toggle */}
            <button
              onClick={toggleSelectMode}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                selectMode
                  ? "bg-indigo-600 text-white hover:bg-indigo-700"
                  : "border border-indigo-300 text-indigo-600 hover:bg-indigo-50"
              }`}
            >
              <UserPlus className="w-4 h-4" />
              {selectMode ? "Batal Pilih" : "Pilih Kandidat"}
            </button>
          </div>

          {/* Selection Info Bar */}
          {selectMode && (
            <div className="mt-4 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
              <p className="text-sm text-indigo-700">
                <span className="font-semibold">Mode Pilih Aktif</span> - Klik
                checkbox pada kandidat berstatus "Reviewing" untuk memilih
                beberapa kandidat sekaligus untuk interview bersama.
                {selectedApplications.length > 0 && (
                  <span className="ml-2 font-bold">
                    {selectedApplications.length} kandidat terpilih
                  </span>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Applications List */}
        {filteredApplications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchQuery || statusFilter !== "all"
                ? "Tidak ada pelamar ditemukan"
                : "Belum ada pelamar"}
            </h3>
            <p className="text-gray-600">
              {searchQuery || statusFilter !== "all"
                ? "Coba ubah filter atau kata kunci pencarian"
                : "Tunggu hingga ada kandidat yang melamar"}
            </p>
          </div>
        ) : (
          (() => {
            const start = (currentPage - 1) * itemsPerPage;
            const pageItems = filteredApplications.slice(
              start,
              start + itemsPerPage
            );
            const half = Math.ceil(pageItems.length / 2);
            const left = pageItems.slice(0, half);
            const right = pageItems.slice(half);

            return (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    {left.map((app) => renderApplicationCard(app))}
                  </div>
                  <div className="space-y-4">
                    {right.map((app) => renderApplicationCard(app))}
                  </div>
                </div>

                {/* Pagination - Always Show */}
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    Menampilkan{" "}
                    {Math.min(
                      (currentPage - 1) * itemsPerPage + 1,
                      filteredApplications.length
                    )}{" "}
                    -{" "}
                    {Math.min(
                      currentPage * itemsPerPage,
                      filteredApplications.length
                    )}{" "}
                    dari {filteredApplications.length} pelamar
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        currentPage === 1
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      Sebelumnya
                    </button>
                    <div className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">
                      Halaman {currentPage} / {totalPages}
                    </div>
                    <button
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        currentPage === totalPages
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      Selanjutnya
                    </button>
                  </div>
                </div>
              </>
            );
          })()
        )}
      </div>

      {/* Floating Action Bar */}
      {selectedApplications.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {selectedApplications.length} Kandidat Terpilih
                    </p>
                    <p className="text-xs text-gray-500">
                      Pilih aksi untuk kandidat yang dipilih
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedApplications([])}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                >
                  Batal
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition font-medium"
                >
                  <Trash2 className="w-4 h-4" />
                  Hapus
                </button>
                <button
                  onClick={handleBulkShortlist}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition font-medium"
                >
                  <CheckCircle className="w-4 h-4" />
                  Lolos Seleksi
                </button>
                <button
                  onClick={handleInviteMultipleInterview}
                  className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-medium shadow-lg shadow-indigo-500/30"
                >
                  <Video className="w-5 h-5" />
                  Undang Interview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Document Preview Modal */}
      {documentModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
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

      {/* Applicant Detail Modal */}
      {applicantModal.isOpen && applicantModal.application && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-[#03587f] to-[#024666]">
              <h3 className="text-lg font-bold text-white">Detail Pelamar</h3>
              <button
                type="button"
                onClick={() =>
                  setApplicantModal({ isOpen: false, application: null })
                }
                className="text-white/80 hover:text-white p-2 rounded-full hover:bg-white/20"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {/* Applicant Header */}
              <div className="flex items-start gap-4 mb-6">
                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-[#03587f] to-[#024666] flex items-center justify-center text-white text-2xl font-bold overflow-hidden flex-shrink-0">
                  {applicantModal.application.jobseekers?.photo ? (
                    <img
                      src={applicantModal.application.jobseekers.photo}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    applicantModal.application.jobseekers?.firstName?.charAt(
                      0
                    ) || "U"
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900">
                    {applicantModal.application.jobseekers?.firstName}{" "}
                    {applicantModal.application.jobseekers?.lastName}
                  </h2>
                  <p className="text-gray-600">
                    {applicantModal.application.jobseekers?.currentTitle ||
                      "Job Seeker"}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {applicantModal.application.jobseekers?.email}
                    </div>
                    {applicantModal.application.jobseekers?.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {applicantModal.application.jobseekers.phone}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {getStatusBadge(applicantModal.application.status)}
                  {aiRecommendations[applicantModal.application.id]
                    ?.isRecommended && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700">
                      <Sparkles className="w-3 h-3" />
                      AI Recommended (
                      {aiRecommendations[applicantModal.application.id].score}%)
                    </span>
                  )}
                </div>
              </div>

              {/* Summary */}
              {applicantModal.application.jobseekers?.summary && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Ringkasan
                  </h4>
                  <p className="text-gray-600 text-sm">
                    {applicantModal.application.jobseekers.summary}
                  </p>
                </div>
              )}

              {/* Skills */}
              {applicantModal.application.jobseekers?.skills?.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Keahlian</h4>
                  <div className="flex flex-wrap gap-2">
                    {applicantModal.application.jobseekers.skills.map(
                      (skill, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Documents */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">Dokumen</h4>
                <div className="flex flex-wrap gap-3">
                  {applicantModal.application.jobseekers?.cvUrl && (
                    <button
                      onClick={() => {
                        setApplicantModal({ isOpen: false, application: null });
                        setDocumentModal({
                          isOpen: true,
                          url: applicantModal.application.jobseekers.cvUrl,
                          title: "CV",
                        });
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition"
                    >
                      <FileText className="w-4 h-4" />
                      Lihat CV
                    </button>
                  )}
                  {applicantModal.application.jobseekers?.ktpUrl && (
                    <button
                      onClick={() => {
                        setApplicantModal({ isOpen: false, application: null });
                        setDocumentModal({
                          isOpen: true,
                          url: applicantModal.application.jobseekers.ktpUrl,
                          title: "KTP",
                        });
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition"
                    >
                      <FileText className="w-4 h-4" />
                      Lihat KTP
                    </button>
                  )}
                  {applicantModal.application.jobseekers?.ak1Url && (
                    <button
                      onClick={() => {
                        setApplicantModal({ isOpen: false, application: null });
                        setDocumentModal({
                          isOpen: true,
                          url: applicantModal.application.jobseekers.ak1Url,
                          title: "Kartu AK-1",
                        });
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition"
                    >
                      <FileText className="w-4 h-4" />
                      Lihat AK-1
                    </button>
                  )}
                  {applicantModal.application.jobseekers?.ijazahUrl && (
                    <button
                      onClick={() => {
                        setApplicantModal({ isOpen: false, application: null });
                        setDocumentModal({
                          isOpen: true,
                          url: applicantModal.application.jobseekers.ijazahUrl,
                          title: "Ijazah",
                        });
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition"
                    >
                      <FileText className="w-4 h-4" />
                      Lihat Ijazah
                    </button>
                  )}
                  {applicantModal.application.jobseekers?.sertifikatUrl && (
                    <button
                      onClick={() => {
                        setApplicantModal({ isOpen: false, application: null });
                        setDocumentModal({
                          isOpen: true,
                          url: applicantModal.application.jobseekers
                            .sertifikatUrl,
                          title: "Sertifikat",
                        });
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition"
                    >
                      <FileText className="w-4 h-4" />
                      Lihat Sertifikat
                    </button>
                  )}
                  {applicantModal.application.jobseekers
                    ?.suratPengalamanUrl && (
                    <button
                      onClick={() => {
                        setApplicantModal({ isOpen: false, application: null });
                        setDocumentModal({
                          isOpen: true,
                          url: applicantModal.application.jobseekers
                            .suratPengalamanUrl,
                          title: "Surat Pengalaman",
                        });
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-700 rounded-lg hover:bg-teal-100 transition"
                    >
                      <FileText className="w-4 h-4" />
                      Lihat Surat Pengalaman
                    </button>
                  )}
                </div>
              </div>

              {/* Education */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  Pendidikan Terakhir
                </h4>
                {applicantModal.application.jobseekers?.lastEducationLevel ||
                applicantModal.application.jobseekers
                  ?.lastEducationInstitution ? (
                  <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600 font-bold shrink-0">
                        {applicantModal.application.jobseekers?.lastEducationLevel?.charAt(
                          0
                        ) || "?"}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {applicantModal.application.jobseekers
                            ?.lastEducationInstitution || "-"}
                        </p>
                        <p className="text-sm text-green-600">
                          {
                            applicantModal.application.jobseekers
                              ?.lastEducationLevel
                          }
                          {applicantModal.application.jobseekers
                            ?.lastEducationMajor &&
                            ` - ${applicantModal.application.jobseekers.lastEducationMajor}`}
                        </p>
                        {applicantModal.application.jobseekers
                          ?.graduationYear && (
                          <p className="text-xs text-gray-500 mt-1">
                            Lulus:{" "}
                            {
                              applicantModal.application.jobseekers
                                .graduationYear
                            }
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : applicantModal.application.jobseekers?.educations?.length >
                  0 ? (
                  <div className="space-y-3">
                    {applicantModal.application.jobseekers.educations.map(
                      (edu, idx) => (
                        <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                          <p className="font-medium text-gray-900">
                            {edu.institution}
                          </p>
                          <p className="text-sm text-gray-600">
                            {edu.degree} - {edu.fieldOfStudy}
                          </p>
                          <p className="text-xs text-gray-500">
                            {edu.startYear} - {edu.endYear || "Sekarang"}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    Belum ada data pendidikan
                  </p>
                )}
              </div>

              {/* Work Experience */}
              {applicantModal.application.jobseekers?.work_experiences?.length >
                0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    Pengalaman Kerja
                  </h4>
                  <div className="space-y-3">
                    {applicantModal.application.jobseekers.work_experiences.map(
                      (exp, idx) => (
                        <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                          <p className="font-medium text-gray-900">
                            {exp.position}
                          </p>
                          <p className="text-sm text-gray-600">{exp.company}</p>
                          <p className="text-xs text-gray-500">
                            {exp.startDate
                              ? new Date(exp.startDate).getFullYear()
                              : ""}{" "}
                            -{" "}
                            {exp.endDate
                              ? new Date(exp.endDate).getFullYear()
                              : "Sekarang"}
                          </p>
                          {exp.description && (
                            <p className="text-sm text-gray-600 mt-1">
                              {exp.description}
                            </p>
                          )}
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Certifications */}
              {applicantModal.application.jobseekers?.certifications?.length >
                0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Sertifikasi
                  </h4>
                  <div className="space-y-2">
                    {applicantModal.application.jobseekers.certifications.map(
                      (cert, idx) => (
                        <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                          <p className="font-medium text-gray-900">
                            {cert.name}
                          </p>
                          <p className="text-sm text-gray-600">{cert.issuer}</p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-3 p-4 border-t bg-gray-50">
              {applicantModal.application.status === "REVIEWING" && (
                <button
                  onClick={() => {
                    setApplicantModal({ isOpen: false, application: null });
                    handleShortlistCandidate(applicantModal.application);
                  }}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm font-medium flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Lolos Seleksi
                </button>
              )}
              {applicantModal.application.status === "SHORTLISTED" && (
                <button
                  onClick={() => {
                    setApplicantModal({ isOpen: false, application: null });
                    handleInviteInterview(applicantModal.application);
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium flex items-center gap-2"
                >
                  <Video className="w-4 h-4" />
                  Undang Interview
                </button>
              )}
              {applicantModal.application.status === "INTERVIEW_COMPLETED" && (
                <button
                  onClick={() => {
                    setApplicantModal({ isOpen: false, application: null });
                    handleAcceptCandidate(applicantModal.application);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Terima Kandidat
                </button>
              )}
              <button
                type="button"
                onClick={() =>
                  setApplicantModal({ isOpen: false, application: null })
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
