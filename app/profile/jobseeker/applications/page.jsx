"use client";
import { useState, useEffect } from "react";
import {
  Briefcase,
  Building2,
  MapPin,
  Calendar,
  Clock,
  Filter,
  Search,
  Eye,
  XCircle,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  FileText,
  ExternalLink,
  ChevronRight,
  MoreVertical,
} from "lucide-react";
import Swal from "sweetalert2";
import Link from "next/link";

export default function JobseekerApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Helper function untuk auth header
  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  // Fetch applications
  const fetchApplications = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (selectedStatus !== "ALL") {
        queryParams.append("status", selectedStatus);
      }

      const response = await fetch(
        `/api/profile/jobseeker/my-applications?${queryParams}`,
        {
          headers: getAuthHeader(),
        }
      );

      const result = await response.json();

      if (result.success) {
        setApplications(result.data.applications);
        setStats(result.data.stats);
      } else {
        if (response.status === 401) {
          window.location.href = "/login";
        }
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  // Withdraw application with SweetAlert
  const handleWithdraw = async (applicationId) => {
    const result = await Swal.fire({
      title: "Tarik Lamaran?",
      text: "Apakah Anda yakin ingin menarik lamaran ini? Tindakan ini tidak dapat dibatalkan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, Tarik Lamaran",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    try {
      Swal.fire({
        title: "Memproses...",
        text: "Sedang menarik lamaran",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const response = await fetch(
        `/api/applications/${applicationId}/withdraw`,
        {
          method: "PATCH",
          headers: getAuthHeader(),
        }
      );

      const data = await response.json();

      if (data.success) {
        await Swal.fire({
          title: "Berhasil!",
          text: "Lamaran berhasil ditarik",
          icon: "success",
          confirmButtonColor: "#3b82f6",
        });
        fetchApplications();
      } else {
        await Swal.fire({
          title: "Gagal!",
          text: data.error || "Gagal menarik lamaran",
          icon: "error",
          confirmButtonColor: "#3b82f6",
        });
      }
    } catch (error) {
      await Swal.fire({
        title: "Error!",
        text: "Terjadi kesalahan saat menarik lamaran",
        icon: "error",
        confirmButtonColor: "#3b82f6",
      });
    }
  };

  // View details
  const viewDetails = async (applicationId) => {
    // Direct navigation is better for UX now
    window.location.href = `/profile/jobseeker/applications/${applicationId}`;
  };

  // Fetch on mount and when status changes
  useEffect(() => {
    fetchApplications();
  }, [selectedStatus]);

  // Filter applications
  const filteredApplications = applications.filter((app) => {
    const matchSearch =
      app.jobs.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.jobs.companies.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchSearch;
  });

  // Status configuration
  const statusConfig = {
    PENDING: {
      label: "Menunggu",
      color: "bg-yellow-100 text-yellow-800",
      icon: Clock,
      description: "Menunggu review",
    },
    REVIEWING: {
      label: "Ditinjau",
      color: "bg-blue-100 text-blue-800",
      icon: Eye,
      description: "Sedang ditinjau recruiter",
    },
    SHORTLISTED: {
      label: "Lolos Seleksi",
      color: "bg-purple-100 text-purple-800",
      icon: TrendingUp,
      description: "Anda masuk shortlist",
    },
    INTERVIEW_SCHEDULED: {
      label: "Interview Dijadwalkan",
      color: "bg-indigo-100 text-indigo-800",
      icon: Calendar,
      description: "Interview telah dijadwalkan",
    },
    INTERVIEW_COMPLETED: {
      label: "Interview Selesai",
      color: "bg-cyan-100 text-cyan-800",
      icon: CheckCircle,
      description: "Menunggu keputusan",
    },
    ACCEPTED: {
      label: "Diterima",
      color: "bg-green-100 text-green-800",
      icon: CheckCircle,
      description: "Selamat! Anda diterima",
    },
    REJECTED: {
      label: "Ditolak",
      color: "bg-red-100 text-red-800",
      icon: XCircle,
      description: "Lamaran ditolak",
    },
    WITHDRAWN: {
      label: "Ditarik",
      color: "bg-gray-100 text-gray-800",
      icon: AlertCircle,
      description: "Lamaran ditarik",
    },
    RESIGNED: {
      label: "Resign",
      color: "bg-orange-100 text-orange-800",
      icon: AlertCircle,
      description: "Mengundurkan diri",
    },
  };

  // Status tabs
  const statusTabs = [
    {
      key: "ALL",
      label: "Semua",
      count: Object.values(stats).reduce((a, b) => a + b, 0),
    },
    { key: "PENDING", label: "Menunggu", count: stats.PENDING || 0 },
    { key: "REVIEWING", label: "Ditinjau", count: stats.REVIEWING || 0 },
    {
      key: "SHORTLISTED",
      label: "Lolos Seleksi",
      count: stats.SHORTLISTED || 0,
    },
    {
      key: "INTERVIEW_SCHEDULED",
      label: "Interview",
      count: stats.INTERVIEW_SCHEDULED || 0,
    },
    { key: "ACCEPTED", label: "Diterima", count: stats.ACCEPTED || 0 },
    { key: "REJECTED", label: "Ditolak", count: stats.REJECTED || 0 },
  ];

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Time ago
  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " tahun lalu";

    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " bulan lalu";

    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " hari lalu";

    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " jam lalu";

    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " menit lalu";

    return "Baru saja";
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Riwayat Lamaran
          </h1>
          <p className="text-gray-600">
            Pantau status semua lamaran pekerjaan Anda
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Lamaran</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {Object.values(stats).reduce((a, b) => a + b, 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Dalam Proses</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {(stats.PENDING || 0) +
                    (stats.REVIEWING || 0) +
                    (stats.SHORTLISTED || 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Diterima</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  {stats.ACCEPTED || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Ditolak</p>
                <p className="text-3xl font-bold text-red-600 mt-1">
                  {stats.REJECTED || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Cari posisi atau perusahaan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Status Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {statusTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSelectedStatus(tab.key)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition ${
                  selectedStatus === tab.key
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {/* Applications List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Belum Ada Lamaran
            </h3>
            <p className="text-gray-600 mb-6">
              Anda belum melamar pekerjaan apapun
            </p>
            <a
              href="/jobs"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Search className="w-5 h-5 mr-2" />
              Cari Lowongan
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((application) => {
              const StatusIcon = statusConfig[application.status].icon;

              return (
                <div
                  key={application.id}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex gap-4 flex-1">
                      {/* Company Logo */}
                      <div className="w-16 h-16 bg-gradient-to-br from-[#03587f] to-[#024666] rounded-lg flex items-center justify-center text-white text-2xl flex-shrink-0">
                        {application.jobs.companies.logo ? (
                          <img
                            src={application.jobs.companies.logo}
                            alt={application.jobs.companies.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          application.jobs.companies.name.charAt(0)
                        )}
                      </div>

                      {/* Job Info */}
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">
                          {application.jobs.title}
                        </h3>
                        <div className="flex items-center gap-4 text-gray-600 text-sm mb-3">
                          <div className="flex items-center gap-1">
                            <Building2 className="w-4 h-4" />
                            {application.jobs.companies.name}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {application.jobs.companies.city}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(application.appliedAt)}
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                              statusConfig[application.status].color
                            }`}
                          >
                            <StatusIcon className="w-4 h-4" />
                            {statusConfig[application.status].label}
                          </span>
                          <span className="text-sm text-gray-500">
                            • {timeAgo(application.appliedAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <a
                        href={`/profile/jobseeker/applications/${application.id}`}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        Lihat Detail
                      </a>

                      {["PENDING", "REVIEWING"].includes(
                        application.status
                      ) && (
                        <button
                          onClick={() => handleWithdraw(application.id)}
                          className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition flex items-center gap-2"
                        >
                          <XCircle className="w-4 h-4" />
                          Tarik
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Additional Info */}
                  {application.interviewDate && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-2 text-sm text-blue-600">
                        <Calendar className="w-4 h-4" />
                        <span className="font-medium">Interview:</span>
                        <span>{formatDate(application.interviewDate)}</span>
                      </div>
                    </div>
                  )}

                  {application.recruiterNotes && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Catatan Recruiter:</span>{" "}
                        {application.recruiterNotes}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Detail Modal */}
        {showDetailModal && selectedApplication && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Detail Lamaran
                  </h2>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                {/* Job Info */}
                <div className="mb-6">
                  <div className="flex gap-4 mb-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-[#03587f] to-[#024666] rounded-lg flex items-center justify-center text-white text-3xl">
                      {selectedApplication.jobs.companies.logo ? (
                        <img
                          src={selectedApplication.jobs.companies.logo}
                          alt={selectedApplication.jobs.companies.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        selectedApplication.jobs.companies.name.charAt(0)
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {selectedApplication.jobs.title}
                      </h3>
                      <p className="text-gray-600">
                        {selectedApplication.jobs.companies.name}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        <MapPin className="w-4 h-4" />
                        {selectedApplication.jobs.companies.city}
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {(() => {
                      const StatusIcon =
                        statusConfig[selectedApplication.status].icon;
                      return (
                        <div
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
                            statusConfig[selectedApplication.status].color
                          }`}
                        >
                          <StatusIcon className="w-5 h-5" />
                          <span className="font-medium">
                            {statusConfig[selectedApplication.status].label}
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Timeline */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Timeline</h4>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Calendar className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="w-0.5 h-full bg-gray-200 mt-2"></div>
                      </div>
                      <div className="pb-6">
                        <p className="font-medium text-gray-900">
                          Lamaran Dikirim
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatDate(selectedApplication.appliedAt)}
                        </p>
                      </div>
                    </div>

                    {selectedApplication.reviewedAt && (
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <Eye className="w-4 h-4 text-green-600" />
                          </div>
                          <div className="w-0.5 h-full bg-gray-200 mt-2"></div>
                        </div>
                        <div className="pb-6">
                          <p className="font-medium text-gray-900">Direview</p>
                          <p className="text-sm text-gray-600">
                            {formatDate(selectedApplication.reviewedAt)}
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedApplication.interviewDate && (
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <Calendar className="w-4 h-4 text-purple-600" />
                          </div>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Interview</p>
                          <p className="text-sm text-gray-600">
                            {formatDate(selectedApplication.interviewDate)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Cover Letter */}
                {selectedApplication.coverLetter && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Cover Letter
                    </h4>
                    <p className="text-gray-600 whitespace-pre-wrap">
                      {selectedApplication.coverLetter}
                    </p>
                  </div>
                )}

                {/* Documents */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Dokumen</h4>
                  <div className="space-y-2">
                    {selectedApplication.resumeUrl && (
                      <a
                        href={selectedApplication.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                      >
                        <FileText className="w-4 h-4" />
                        CV / Resume
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    {selectedApplication.portfolioUrl && (
                      <a
                        href={selectedApplication.portfolioUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Portfolio
                      </a>
                    )}
                  </div>
                </div>

                {/* Recruiter Notes */}
                {selectedApplication.recruiterNotes && (
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Catatan Recruiter
                    </h4>
                    <p className="text-gray-600">
                      {selectedApplication.recruiterNotes}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  {/* View Interview button for interview statuses */}
                  {["INTERVIEW_SCHEDULED", "INTERVIEW_COMPLETED"].includes(
                    selectedApplication.status
                  ) &&
                    selectedApplication.interview && (
                      <a
                        href={`/profile/jobseeker/interviews/${selectedApplication.interview.id}`}
                        className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-center font-medium"
                      >
                        📅 Lihat Detail Interview
                      </a>
                    )}

                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    Tutup
                  </button>
                  {["PENDING", "REVIEWING"].includes(
                    selectedApplication.status
                  ) && (
                    <button
                      onClick={() => {
                        handleWithdraw(selectedApplication.id);
                        setShowDetailModal(false);
                      }}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                      Tarik Lamaran
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
