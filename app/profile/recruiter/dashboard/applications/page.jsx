"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Users,
  Search,
  Filter,
  Calendar,
  Eye,
  Briefcase,
  ExternalLink,
  MapPin,
} from "lucide-react";
import Swal from "sweetalert2";

export default function AllApplicationsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [jobFilter, setJobFilter] = useState("all");
  const [jobs, setJobs] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadAllApplications();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [applications, searchQuery, statusFilter, jobFilter]);

  const loadAllApplications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await fetch(
        "/api/profile/recruiter/dashboard/applications",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        // Sort by appliedAt date (newest first)
        const sortedApps = (data.applications || []).sort(
          (a, b) => new Date(b.appliedAt) - new Date(a.appliedAt)
        );
        setApplications(sortedApps);
        setStats(data.stats || null);
        setJobs(data.jobs || []);
      } else {
        throw new Error(data.error || "Failed to load applications");
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load applications",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterApplications = () => {
    let filtered = applications;

    if (jobFilter !== "all") {
      filtered = filtered.filter((app) => app.jobs.id === jobFilter);
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((app) => app.status === statusFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter((app) => {
        const fullName =
          `${app.jobseekers.firstName} ${app.jobseekers.lastName}`.toLowerCase();
        const email = app.jobseekers.email?.toLowerCase() || "";
        const jobTitle = app.jobs.title?.toLowerCase() || "";
        const query = searchQuery.toLowerCase();
        return (
          fullName.includes(query) ||
          email.includes(query) ||
          jobTitle.includes(query)
        );
      });
    }

    setFilteredApplications(filtered);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: {
        label: "Lamaran Masuk",
        color: "bg-yellow-100 text-yellow-700 border-yellow-300",
      },
      REVIEWING: {
        label: "Sedang Ditinjau",
        color: "bg-blue-100 text-blue-700 border-blue-300",
      },
      SHORTLISTED: {
        label: "Lolos Seleksi",
        color: "bg-purple-100 text-purple-700 border-purple-300",
      },
      INTERVIEW_SCHEDULED: {
        label: "Tahap Interview",
        color: "bg-indigo-100 text-indigo-700 border-indigo-300",
      },
      INTERVIEW_COMPLETED: {
        label: "Selesai Interview",
        color: "bg-teal-100 text-teal-700 border-teal-300",
      },
      ACCEPTED: {
        label: "Diterima",
        color: "bg-green-100 text-green-700 border-green-300",
      },
      REJECTED: {
        label: "Ditolak",
        color: "bg-red-100 text-red-700 border-red-300",
      },
    };
    const config = statusConfig[status] || statusConfig.PENDING;
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold border ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const totalPages = Math.max(
    1,
    Math.ceil(filteredApplications.length / itemsPerPage)
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredApplications.length]);

  // Navigate to job detail page
  const handleViewJob = (application) => {
    router.push(`/profile/recruiter/dashboard/jobs/${application.jobs.slug}`);
  };

  const renderApplicationCard = (application) => {
    return (
      <div
        key={application.id}
        onClick={() => handleViewJob(application)}
        className="bg-white rounded-xl border-2 border-gray-100 p-5 transition-all duration-200 hover:border-blue-300 hover:shadow-lg cursor-pointer group"
      >
        <div className="flex items-center gap-4">
          {/* Photo */}
          <div className="flex-shrink-0">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#03587f] to-[#024666] flex items-center justify-center text-white text-xl font-bold overflow-hidden">
              {application.jobseekers.photo ? (
                <img
                  src={application.jobseekers.photo}
                  alt={application.jobseekers.firstName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>
                  {application.jobseekers.firstName?.charAt(0) || "U"}
                </span>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            {/* Date & Name Row */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <p className="text-xs text-blue-600 font-medium mb-1">
                  {formatDate(application.appliedAt)}
                </p>
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {application.jobseekers.firstName}{" "}
                  {application.jobseekers.lastName}
                </h3>
              </div>
              {getStatusBadge(application.status)}
            </div>

            {/* Job Applied */}
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Briefcase className="w-4 h-4" />
                {application.jobs.title}
              </span>
              {application.jobs.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {application.jobs.location}
                </span>
              )}
              {application.jobseekers.hasDisability && (
                <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                  ♿ Disabilitas
                </span>
              )}
            </div>
          </div>

          {/* Arrow Indicator */}
          <div className="flex-shrink-0 text-gray-300 group-hover:text-blue-500 transition-colors">
            <ExternalLink className="w-5 h-5" />
          </div>
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
            onClick={() => router.push("/profile/recruiter/dashboard")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Kembali ke Dashboard
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Semua Pelamar
              </h1>
              <p className="text-gray-600">
                Klik pelamar untuk melihat detail dan mengelola di halaman
                lowongan
              </p>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <Briefcase className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-blue-800 font-medium">
                Halaman ini hanya untuk melihat profil pelamar
              </p>
              <p className="text-sm text-blue-700 mt-1">
                Untuk mengelola proses interview dan menerima kandidat, silakan
                buka halaman per-lowongan melalui tombol di setiap kartu.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
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
                {stats.shortlisted}
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

            {/* Selesai Interview */}
            <button
              onClick={() => setStatusFilter("INTERVIEW_COMPLETED")}
              className={`text-left rounded-xl p-4 transition-all ${
                statusFilter === "INTERVIEW_COMPLETED"
                  ? "bg-teal-500 text-white ring-2 ring-teal-500 ring-offset-2"
                  : "bg-teal-50 hover:bg-teal-100 border border-teal-200"
              }`}
            >
              <p
                className={`text-xs mb-1 ${
                  statusFilter === "INTERVIEW_COMPLETED"
                    ? "text-teal-100"
                    : "text-teal-700"
                }`}
              >
                Selesai Interview
              </p>
              <p
                className={`text-2xl font-bold ${
                  statusFilter === "INTERVIEW_COMPLETED"
                    ? "text-white"
                    : "text-teal-900"
                }`}
              >
                {stats.interviewCompleted || 0}
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
              value={jobFilter}
              onChange={(e) => setJobFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              <option value="all">Semua Lowongan</option>
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              <option value="all">Semua Status</option>
              <option value="PENDING">Lamaran Masuk</option>
              <option value="REVIEWING">Sedang Ditinjau</option>
              <option value="SHORTLISTED">Lolos Seleksi</option>
              <option value="INTERVIEW_SCHEDULED">Tahap Interview</option>
              <option value="INTERVIEW_COMPLETED">Selesai Interview</option>
              <option value="ACCEPTED">Diterima</option>
            </select>

            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari nama, email, atau lowongan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>
          </div>
        </div>

        {/* Applications List */}
        {filteredApplications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchQuery || statusFilter !== "all" || jobFilter !== "all"
                ? "Tidak ada pelamar ditemukan"
                : "Belum ada pelamar"}
            </h3>
            <p className="text-gray-600">
              {searchQuery || statusFilter !== "all" || jobFilter !== "all"
                ? "Coba ubah filter atau kata kunci pencarian"
                : "Tunggu hingga ada kandidat yang melamar"}
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {filteredApplications
                .slice(
                  (currentPage - 1) * itemsPerPage,
                  currentPage * itemsPerPage
                )
                .map((app) => renderApplicationCard(app))}
            </div>

            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-600">
                Menampilkan{" "}
                {Math.min(
                  filteredApplications.length,
                  (currentPage - 1) * itemsPerPage + 1
                )}
                -
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
                  className={`px-4 py-2 rounded-lg font-medium ${
                    currentPage === 1
                      ? "text-gray-400 bg-gray-100"
                      : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  Prev
                </button>
                <div className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium">
                  {currentPage} / {totalPages}
                </div>
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    currentPage === totalPages
                      ? "text-gray-400 bg-gray-100"
                      : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
