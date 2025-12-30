"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  Briefcase,
  Users,
  FileText,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  MapPin,
  Building2,
  Globe,
  Mail,
  Phone,
  Calendar,
  Edit,
  Plus,
  ArrowRight,
  AlertCircle,
  LogOut,
} from "lucide-react";

export default function RecruiterDashboard() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [activeFilter, setActiveFilter] = useState("ALL");

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/profile/recruiter/dashboard", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDashboardData(data.data);
      } else if (response.status === 404) {
        // Recruiter profile not found - redirect to create profile
        router.push("/profile/recruiter");
        return;
      } else if (response.status === 401) {
        // Not authenticated
        router.push("/login?role=recruiter");
        return;
      } else {
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    const config = {
      PENDING: { label: "Pending", color: "bg-yellow-100 text-yellow-800" },
      REVIEWING: { label: "Reviewing", color: "bg-blue-100 text-blue-800" },
      SHORTLISTED: {
        label: "Shortlisted",
        color: "bg-purple-100 text-purple-800",
      },
      INTERVIEW_SCHEDULED: {
        label: "Interview",
        color: "bg-indigo-100 text-indigo-800",
      },
      INTERVIEW_COMPLETED: {
        label: "Interview Done",
        color: "bg-cyan-100 text-cyan-800",
      },
      ACCEPTED: { label: "Accepted", color: "bg-green-100 text-green-800" },
      REJECTED: { label: "Rejected", color: "bg-red-100 text-red-800" },
      WITHDRAWN: { label: "Withdrawn", color: "bg-gray-100 text-gray-800" },
    };
    return config[status] || config.PENDING;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Failed to load dashboard data</p>
        </div>
      </div>
    );
  }

  const { company, recruiter, stats, recentApplications } = dashboardData;

  const filteredApplications =
    activeFilter === "ALL"
      ? recentApplications
      : recentApplications.filter((app) => {
          // This filters the *recent* list. Ideally should filter all or fetch filtered. For now, filter client side on recent list is OK or clarification needed.
          // But mapped to stats:
          if (activeFilter === "PENDING")
            return ["PENDING", "REVIEWING"].includes(app.status);
          if (activeFilter === "SHORTLISTED")
            return app.status === "SHORTLISTED";
          // 'Total Lowongan' or 'Total Pelamar' click -> 'ALL'
          return true;
        });

  // Actually, clicking "Total Lowongan" should probably show Jobs tab?
  // Clicking "Pending Review" -> Filter applications by status.
  // The user requested: "terus buat card nya itu bisa dipencet sehingga dapat menjadi filter otomatis"

  const handleStatClick = (filterType) => {
    setActiveFilter(filterType);
    // Optional: Scroll to applications section if needed
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard Rekruter
          </h1>
          <p className="text-gray-600">
            Hai,{" "}
            <span className="font-semibold text-blue-600">{company.name}</span>!
            Kelola lowongan dan pelamar Anda
          </p>
        </div>

        {/* Company Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex gap-6">
              <div className="w-24 h-24 bg-gradient-to-br from-[#03587f] to-[#024666] rounded-2xl flex items-center justify-center text-white text-4xl overflow-hidden shadow-lg shadow-blue-500/20">
                {company.logo ? (
                  <img
                    src={company.logo}
                    alt={company.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  company.name.charAt(0)
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {company.name}
                </h2>
                {company.tagline && (
                  <p className="text-gray-500 mb-3">{company.tagline}</p>
                )}

                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                  {company.industry && (
                    <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                      <Building2 className="w-4 h-4 text-blue-500" />
                      {company.industry}
                    </div>
                  )}
                  {company.city && (
                    <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                      <MapPin className="w-4 h-4 text-red-500" />
                      {company.city}, {company.province}
                    </div>
                  )}
                  {company.companySize && (
                    <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                      <Users className="w-4 h-4 text-purple-500" />
                      {company.companySize} karyawan
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <button
                onClick={() => router.push("/profile/recruiter")}
                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
              >
                <Edit className="w-4 h-4" />
                Edit Profile
              </button>
            </div>
          </div>

          {/* Validation Status */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            {company.status === "REJECTED" && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <XCircle className="w-6 h-6 text-red-600 mt-0.5" />
                <div>
                  <h4 className="font-bold text-red-900">Verifikasi Ditolak</h4>
                  <p className="text-red-700 text-sm mt-1">
                    {company.rejectionReason ||
                      "Mohon perbaiki data perusahaan Anda."}
                  </p>
                </div>
              </div>
            )}
            {!company.verified && company.status !== "REJECTED" && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-bold text-amber-900">
                    Menunggu Verifikasi
                  </h4>
                  <p className="text-amber-700 text-sm mt-1">
                    Tim kami sedang meninjau dokumen legalitas perusahaan Anda.
                  </p>
                </div>
              </div>
            )}
            {company.verified && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-bold text-green-900">
                    Akun Terverifikasi
                  </h4>
                  <p className="text-green-700 text-sm mt-1">
                    Anda memiliki akses penuh ke fitur premium.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Statistics Cards (Clickable) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div
            onClick={() => handleStatClick("ALL")}
            className={`bg-white rounded-2xl p-6 border transition-all cursor-pointer hover:shadow-md ${
              activeFilter === "ALL"
                ? "ring-2 ring-blue-500 border-transparent shadow-md"
                : "border-gray-100 shadow-sm"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-blue-600" />
              </div>
              <span
                className={`text-xs font-bold px-2 py-1 rounded-full ${
                  activeFilter === "ALL"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                Total
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {stats.totalJobs}
            </p>
            <p className="text-sm text-gray-500">Lowongan Aktif</p>
          </div>

          <div
            onClick={() => handleStatClick("ALL")}
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm transition-all cursor-pointer hover:shadow-md"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {stats.totalApplications}
            </p>
            <p className="text-sm text-gray-500">Total Pelamar</p>
          </div>

          <div
            onClick={() => handleStatClick("PENDING")}
            className={`bg-white rounded-2xl p-6 border transition-all cursor-pointer hover:shadow-md ${
              activeFilter === "PENDING"
                ? "ring-2 ring-yellow-500 border-transparent shadow-md"
                : "border-gray-100 shadow-sm"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              {activeFilter === "PENDING" && (
                <CheckCircle className="w-4 h-4 text-yellow-600" />
              )}
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {stats.pendingApplications + stats.reviewingApplications}
            </p>
            <p className="text-sm text-gray-500">Perlu Direview</p>
          </div>

          <div
            onClick={() => handleStatClick("SHORTLISTED")}
            className={`bg-white rounded-2xl p-6 border transition-all cursor-pointer hover:shadow-md ${
              activeFilter === "SHORTLISTED"
                ? "ring-2 ring-purple-500 border-transparent shadow-md"
                : "border-gray-100 shadow-sm"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              {activeFilter === "SHORTLISTED" && (
                <CheckCircle className="w-4 h-4 text-purple-600" />
              )}
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {stats.shortlistedApplications}
            </p>
            <p className="text-sm text-gray-500">Shortlisted</p>
          </div>
        </div>

        {/* Quick Actions & Recent Jobs */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Col: Actions & Jobs */}
          <div className="lg:col-span-2 space-y-8">
            {/* Actions */}
            <div className="grid sm:grid-cols-4 gap-4">
              <button
                onClick={() => router.push("/profile/recruiter/post-job")}
                disabled={
                  company.status === "REJECTED" ||
                  (!company.verified && company.status !== "PENDING")
                }
                className="p-4 bg-white border border-gray-200 rounded-2xl hover:border-blue-400 hover:shadow-md transition-all group text-left relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Plus className="w-16 h-16 text-blue-600" />
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-3 group-hover:scale-110 transition-transform">
                  <Plus className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-gray-900">Buat Lowongan</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Posting pekerjaan baru
                </p>
              </button>

              <button
                onClick={() => router.push("/profile/recruiter/dashboard/jobs")}
                className="p-4 bg-white border border-gray-200 rounded-2xl hover:border-green-400 hover:shadow-md transition-all group text-left relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Briefcase className="w-16 h-16 text-green-600" />
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-3 group-hover:scale-110 transition-transform">
                  <Briefcase className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-gray-900">Kelola Lowongan</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Lihat semua lowongan
                </p>
              </button>

              <button
                onClick={() =>
                  router.push("/profile/recruiter/dashboard/applications")
                }
                className="p-4 bg-white border border-gray-200 rounded-2xl hover:border-purple-400 hover:shadow-md transition-all group text-left relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Users className="w-16 h-16 text-purple-600" />
                </div>
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mb-3 group-hover:scale-110 transition-transform">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-gray-900">Kelola Pelamar</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Review lamaran masuk
                </p>
              </button>

              <button
                onClick={() =>
                  router.push("/profile/recruiter/dashboard/resignations")
                }
                className="p-4 bg-white border border-gray-200 rounded-2xl hover:border-orange-400 hover:shadow-md transition-all group text-left relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <LogOut className="w-16 h-16 text-orange-600" />
                </div>
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 mb-3 group-hover:scale-110 transition-transform">
                  <LogOut className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-gray-900">Pengajuan Resign</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Kelola pengunduran diri
                </p>
              </button>
            </div>

            {/* Recent Jobs */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg text-gray-900">
                  Lowongan Terbaru
                </h3>
                <button
                  onClick={() =>
                    router.push("/profile/recruiter/dashboard/jobs")
                  }
                  className="text-sm text-blue-600 font-medium hover:underline"
                >
                  Lihat Semua
                </button>
              </div>

              {company.jobs.length > 0 ? (
                <div className="space-y-4">
                  {company.jobs.slice(0, 3).map((job) => (
                    <div
                      key={job.id}
                      onClick={() =>
                        router.push(
                          `/profile/recruiter/dashboard/jobs/${job.slug}`
                        )
                      }
                      className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all cursor-pointer group"
                    >
                      <div>
                        <h4 className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                          {job.title}
                        </h4>
                        <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" /> {job.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />{" "}
                            {formatDate(job.createdAt)}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                          {job._count.applications}
                        </div>
                        <div className="text-xs text-gray-500">Pelamar</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Belum ada lowongan aktif
                </div>
              )}
            </div>
          </div>

          {/* Right Col: Applications (Filtered) */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 h-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg text-gray-900">
                  {activeFilter === "ALL"
                    ? "Lamaran Terbaru"
                    : `Lamaran ${
                        activeFilter === "PENDING" ? "Pending" : "Shortlisted"
                      }`}
                </h3>
                <button
                  onClick={() =>
                    router.push("/profile/recruiter/dashboard/applications")
                  }
                  className="text-sm text-blue-600 font-medium hover:underline"
                >
                  Lihat Semua
                </button>
              </div>

              {filteredApplications.length > 0 ? (
                <div className="space-y-4">
                  {filteredApplications.slice(0, 5).map((app) => (
                    <div
                      key={app.id}
                      className="p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-gray-50 transition-all cursor-pointer"
                      onClick={() =>
                        router.push("/profile/recruiter/dashboard/applications")
                      }
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                          {app.jobseekers.photo ? (
                            <img
                              src={app.jobseekers.photo}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold">
                              {app.jobseekers.firstName?.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 text-sm">
                            {app.jobseekers.firstName} {app.jobseekers.lastName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {app.jobs.title}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                            getStatusBadge(app.status).color
                          }`}
                        >
                          {getStatusBadge(app.status).label}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {formatDate(app.appliedAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="w-6 h-6 text-gray-300" />
                  </div>
                  <p className="text-gray-500 text-sm">
                    Tidak ada lamaran{" "}
                    {activeFilter !== "ALL" && "untuk filter ini"}
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
