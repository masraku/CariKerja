"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Calendar,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Briefcase,
  GraduationCap,
  Heart,
  AlertCircle,
  Accessibility,
  Edit,
} from "lucide-react";

export default function JobPreviewPage() {
  const params = useParams();
  const router = useRouter();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.slug) {
      fetchJobDetail();
    }
  }, [params.slug]);

  const fetchJobDetail = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `/api/profile/recruiter/jobs/${params.slug}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();

      if (data.success) {
        setJob(data.job);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const styles = {
      PENDING: "bg-orange-100 text-orange-700 border-orange-200",
      ACTIVE: "bg-emerald-100 text-emerald-700 border-emerald-200",
      REJECTED: "bg-red-100 text-red-700 border-red-200",
      CLOSED: "bg-slate-100 text-slate-700 border-slate-200",
    };
    const labels = {
      PENDING: "Menunggu Review",
      ACTIVE: "Aktif / Live",
      REJECTED: "Ditolak",
      CLOSED: "Ditutup",
    };
    return (
      <span
        className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full border ${styles[status]}`}
      >
        <span
          className={`w-2 h-2 rounded-full ${
            status === "ACTIVE"
              ? "bg-emerald-500"
              : status === "PENDING"
              ? "bg-orange-500 animate-pulse"
              : status === "REJECTED"
              ? "bg-red-500"
              : "bg-slate-500"
          }`}
        />
        {labels[status] || status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 lg:p-8">
        <div className="max-w-5xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded w-1/4"></div>
            <div className="h-64 bg-slate-200 rounded-2xl"></div>
            <div className="h-48 bg-slate-200 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 lg:p-8">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
            <Briefcase className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">Lowongan tidak ditemukan</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 lg:p-8">
      {/* Header */}
      <div className="max-w-5xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 transition group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition" />
          <span className="text-sm font-medium">Kembali</span>
        </button>

        {job.status === "REJECTED" ? (
          <button
            onClick={() =>
              router.push(`/profile/recruiter/dashboard/jobs/${job.slug}/edit`)
            }
            className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 transition shadow-lg shadow-yellow-500/20 text-sm font-medium"
          >
            <Edit className="w-4 h-4" />
            Perbaiki & Validasi Ulang
          </button>
        ) : (
          <button
            onClick={() =>
              router.push(`/profile/recruiter/dashboard/jobs/${job.slug}/edit`)
            }
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition text-sm font-medium"
          >
            <Edit className="w-4 h-4" />
            Edit Lowongan
          </button>
        )}
      </div>

      {/* Main Card */}
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6">
          <div className="p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row lg:items-start gap-6">
              {/* Company Logo */}
              <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
                {job.company?.logo ? (
                  <img
                    src={job.company.logo}
                    alt={job.company.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Building2 className="w-10 h-10 text-slate-400" />
                )}
              </div>

              {/* Job Info */}
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  {getStatusBadge(job.status)}
                  {job.isDisabilityFriendly && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      <Accessibility className="w-4 h-4" />
                      Ramah Disabilitas
                    </span>
                  )}
                </div>

                <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-2">
                  {job.title}
                </h1>

                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg text-slate-600">
                    {job.company?.name}
                  </span>
                  {job.company?.verified && (
                    <CheckCircle className="w-5 h-5 text-blue-500" />
                  )}
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    {job.city}, {job.province}
                    {job.isRemote && (
                      <span className="ml-1 px-2 py-0.5 bg-blue-100 text-blue-600 rounded text-xs">
                        Remote
                      </span>
                    )}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-slate-400" />
                    {job.jobType === "FULL_TIME" ? "Full Time" : "Part Time"}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-slate-400" />
                    {job.numberOfPositions} posisi
                  </span>
                  {job.educationLevel && (
                    <span className="flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-slate-400" />
                      Min. {job.educationLevel}
                    </span>
                  )}
                </div>

                {job.showSalary && job.salaryMin && job.salaryMax && (
                  <p className="text-xl font-bold text-emerald-600 mt-4">
                    {formatCurrency(job.salaryMin)} -{" "}
                    {formatCurrency(job.salaryMax)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">
                Deskripsi Pekerjaan
              </h2>
              <div className="prose prose-slate max-w-none">
                <p className="text-slate-600 whitespace-pre-line">
                  {job.description}
                </p>
              </div>
            </div>

            {/* Job Photo - Instagram Style */}
            {job.photo && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                  <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-pink-500"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <circle cx="12" cy="12" r="4" />
                      <circle cx="18" cy="6" r="1.5" fill="currentColor" />
                    </svg>
                    Foto Lowongan
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Akan diposting di Instagram saat lowongan aktif
                  </p>
                </div>
                <div className="aspect-square bg-slate-100">
                  <img
                    src={job.photo}
                    alt={job.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                      {job.company?.logo ? (
                        <img
                          src={job.company.logo}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Building2 className="w-5 h-5 text-slate-400 m-auto mt-2.5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 text-sm truncate">
                        {job.company?.name}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        Lowongan: {job.title}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Requirements */}
            {job.requirements && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">
                  Persyaratan
                </h2>
                <p className="text-slate-600 whitespace-pre-line">
                  {job.requirements}
                </p>
              </div>
            )}

            {/* Responsibilities */}
            {job.responsibilities && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">
                  Tanggung Jawab
                </h2>
                <p className="text-slate-600 whitespace-pre-line">
                  {job.responsibilities}
                </p>
              </div>
            )}

            {/* Benefits */}
            {job.benefits && job.benefits.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-pink-500" />
                  Benefits & Fasilitas
                </h2>
                <div className="flex flex-wrap gap-2">
                  {job.benefits.map((benefit, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-2 bg-slate-50 text-slate-700 rounded-xl text-sm border border-slate-200"
                    >
                      {benefit}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Shift Info */}
            {job.isShift && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h3 className="text-sm font-semibold text-slate-800 mb-3 uppercase tracking-wider">
                  Info Shift
                </h3>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                    <Clock className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800">
                      Sistem Shift
                    </div>
                    <div className="text-sm text-slate-500">
                      {job.shiftCount || "-"} shift
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Deadline */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h3 className="text-sm font-semibold text-slate-800 mb-3 uppercase tracking-wider">
                Info Lamaran
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">Deadline</div>
                    <div className="font-semibold text-slate-800">
                      {job.applicationDeadline
                        ? formatDate(job.applicationDeadline)
                        : "Tidak ada"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">Lamaran Masuk</div>
                    <div className="font-semibold text-slate-800">
                      {job.applicationCount || 0}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Company Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h3 className="text-sm font-semibold text-slate-800 mb-3 uppercase tracking-wider">
                Perusahaan
              </h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden">
                  {job.company?.logo ? (
                    <img
                      src={job.company.logo}
                      alt={job.company.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Building2 className="w-6 h-6 text-slate-400" />
                  )}
                </div>
                <div>
                  <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                    {job.company?.name}
                    {job.company?.verified && (
                      <CheckCircle className="w-4 h-4 text-blue-500" />
                    )}
                  </div>
                  <div className="text-sm text-slate-500">
                    {job.company?.industry}
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h3 className="text-sm font-semibold text-slate-800 mb-3 uppercase tracking-wider">
                Timeline
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Dibuat</span>
                  <span className="text-slate-800 font-medium">
                    {formatDate(job.createdAt)}
                  </span>
                </div>
                {job.publishedAt && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Dipublikasi</span>
                    <span className="text-emerald-600 font-medium">
                      {formatDate(job.publishedAt)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Rejection Reason */}
            {job.status === "REJECTED" && job.rejectionReason && (
              <div className="bg-red-50 rounded-2xl border border-red-200 p-6">
                <h3 className="text-sm font-semibold text-red-800 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Alasan Penolakan
                </h3>
                <p className="text-red-700 text-sm">{job.rejectionReason}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
