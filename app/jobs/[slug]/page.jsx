"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Swal from "sweetalert2";
import {
  MapPin,
  Briefcase,
  DollarSign,
  Clock,
  Building2,
  Star,
  Calendar,
  Users,
  BookmarkCheck,
  Bookmark,
  Share2,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader2,
  Award,
  GraduationCap,
  Target,
  Globe,
  ImageIcon,
  CalendarDays,
  Coffee,
  Accessibility,
  XCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const slug = params.slug;

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [existingApplication, setExistingApplication] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (slug) {
      fetchJobDetail();
    }
  }, [slug]);

  useEffect(() => {
    if (job) {
      const savedJobs = JSON.parse(localStorage.getItem("savedJobs") || "[]");
      setSaved(savedJobs.includes(job.id));
    }
  }, [job]);

  const fetchJobDetail = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/jobs/${slug}`, {
        credentials: "include",
      });
      const data = await response.json();

      if (data.success) {
        setJob(data.data);

        if (data.data.hasApplied) {
          setHasApplied(true);
          setExistingApplication(data.data.existingApplication);
        } else {
          setHasApplied(false);
          setExistingApplication(null);
        }
      } else {
        Swal.fire({
          icon: "error",
          title: "Job Not Found",
          text: "Lowongan tidak ditemukan",
          confirmButtonColor: "#03587f",
        }).then(() => {
          router.push("/jobs");
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Gagal memuat detail lowongan",
        confirmButtonColor: "#03587f",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleSave = () => {
    if (!isAuthenticated) {
      Swal.fire({
        icon: "info",
        title: "Login Required",
        text: "Silakan login terlebih dahulu untuk menyimpan lowongan",
        showCancelButton: true,
        confirmButtonText: "Login",
        cancelButtonText: "Batal",
        confirmButtonColor: "#03587f",
      }).then((result) => {
        if (result.isConfirmed) {
          router.push("/login?redirect=/jobs/" + slug);
        }
      });
      return;
    }

    const savedJobs = JSON.parse(localStorage.getItem("savedJobs") || "[]");

    if (saved) {
      const updated = savedJobs.filter((id) => id !== job.id);
      localStorage.setItem("savedJobs", JSON.stringify(updated));
      setSaved(false);
      Swal.fire({
        icon: "success",
        title: "Dihapus",
        text: "Lowongan dihapus dari simpanan",
        timer: 1500,
        showConfirmButton: false,
      });
    } else {
      savedJobs.push(job.id);
      localStorage.setItem("savedJobs", JSON.stringify(savedJobs));
      setSaved(true);
      Swal.fire({
        icon: "success",
        title: "Disimpan",
        text: "Lowongan berhasil disimpan",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  const handleApply = async () => {
    if (!isAuthenticated) {
      Swal.fire({
        icon: "info",
        title: "Login Required",
        text: "Silakan login terlebih dahulu untuk melamar pekerjaan",
        showCancelButton: true,
        confirmButtonText: "Login",
        cancelButtonText: "Batal",
        confirmButtonColor: "#03587f",
      }).then((result) => {
        if (result.isConfirmed) {
          router.push("/login?redirect=/jobs/" + slug);
        }
      });
      return;
    }

    if (user?.role !== "JOBSEEKER") {
      Swal.fire({
        icon: "error",
        title: "Akses Ditolak",
        text: "Hanya pencaker yang dapat melamar pekerjaan",
        confirmButtonColor: "#03587f",
      });
      return;
    }

    router.push(`/jobs/${slug}/apply`);
  };

  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    if (isSharing) return;

    if (navigator.share) {
      try {
        setIsSharing(true);
        await navigator.share({
          title: job.title,
          text: `${job.title} at ${job.company.name}`,
          url: window.location.href,
        });
      } catch (error) {
        if (error.name !== "AbortError" && error.name !== "InvalidStateError") {
        }
      } finally {
        setIsSharing(false);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      Swal.fire({
        icon: "success",
        title: "Link Copied!",
        text: "Link lowongan berhasil disalin",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  const formatJobType = (type) => {
    const typeMap = {
      FULL_TIME: "Full Time",
      PART_TIME: "Part Time",
      CONTRACT: "Contract",
      FREELANCE: "Freelance",
      INTERNSHIP: "Internship",
    };
    return typeMap[type] || type;
  };

  const formatSalary = () => {
    if (!job.showSalary || !job.salaryMin || !job.salaryMax) {
      return "Negotiable";
    }
    return `Rp ${job.salaryMin.toLocaleString(
      "id-ID"
    )} - ${job.salaryMax.toLocaleString("id-ID")}`;
  };

  const getTimeSince = (date) => {
    const days = Math.floor(
      (new Date() - new Date(date)) / (1000 * 60 * 60 * 24)
    );
    if (days === 0) return "Hari ini";
    if (days === 1) return "Kemarin";
    return `${days} hari yang lalu`;
  };

  const isDeadlineExpired = () => {
    if (!job?.applicationDeadline) return false;
    return new Date(job.applicationDeadline) < new Date();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Memuat detail lowongan...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          href="/jobs"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors mb-6 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Kembali ke Daftar Lowongan</span>
        </Link>

        {/* Hero Section */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-8">
          <div className="p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row items-start gap-8">
              {/* Logo & Disability Badge */}
              <div className="w-24 h-24 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center p-2 flex-shrink-0 relative">
                {job.company.logo ? (
                  <img
                    src={job.company.logo}
                    alt={job.company.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Building2 className="w-12 h-12 text-slate-300" />
                )}
                {job.isDisabilityFriendly && (
                  <div
                    className="absolute -bottom-2 -right-2 bg-green-600 text-white p-1 rounded-full border-2 border-white shadow-sm"
                    title="Ramah Difabel"
                  >
                    <Accessibility className="w-4 h-4" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0 w-full">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
                  <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2 leading-tight">
                      {job.title}
                    </h1>
                    <Link
                      href={`/companies/${job.company.slug}`}
                      className="inline-flex items-center gap-2 text-lg text-slate-600 hover:text-blue-600 transition-colors group"
                    >
                      <Building2 className="w-5 h-5 text-slate-400 group-hover:text-blue-500" />
                      <span className="font-medium">{job.company.name}</span>
                      {job.company.verified && (
                        <CheckCircle className="w-4 h-4 text-blue-500" />
                      )}
                    </Link>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={toggleSave}
                      className={`p-3 rounded-xl transition-all border ${
                        saved
                          ? "bg-blue-50 text-blue-600 border-blue-100"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {saved ? (
                        <BookmarkCheck className="w-6 h-6" />
                      ) : (
                        <Bookmark className="w-6 h-6" />
                      )}
                    </button>
                    <button
                      onClick={handleShare}
                      className="p-3 rounded-xl bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 transition-all"
                    >
                      <Share2 className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-3 mt-4">
                  <span className="px-4 py-2 bg-slate-50 text-slate-700 rounded-xl text-sm font-medium flex items-center gap-2 border border-slate-100">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    {job.city}
                  </span>
                  <span className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-sm font-medium flex items-center gap-2 border border-blue-100">
                    <Briefcase className="w-4 h-4" />
                    {formatJobType(job.jobType)}
                  </span>
                  {job.salary && (
                    <span className="px-4 py-2 bg-green-50 text-green-700 rounded-xl text-sm font-medium flex items-center gap-2 border border-green-100">
                      <DollarSign className="w-4 h-4" />
                      {formatSalary()}
                    </span>
                  )}
                  {job.isRemote && (
                    <span className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-medium flex items-center gap-2 border border-emerald-100">
                      <Globe className="w-4 h-4" />
                      Remote
                    </span>
                  )}
                  {job.isFeatured && (
                    <span className="px-4 py-2 bg-amber-50 text-amber-700 rounded-xl text-sm font-medium flex items-center gap-2 border border-amber-100 shadow-sm">
                      <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                      Featured
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Disability Friendly Prominent Banner */}
            {job.isDisabilityFriendly && (
              <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-3xl p-6 shadow-lg shadow-green-500/20 text-white flex flex-col sm:flex-row items-center gap-6 animate-in slide-in-from-bottom-2">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Accessibility className="w-8 h-8" />
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="font-bold text-xl leading-tight mb-1">
                    Ramah Disabilitas
                  </h3>
                  <p className="text-green-50 opacity-90">
                    Lowongan ini terbuka dan inklusif untuk teman-teman difabel.
                  </p>
                </div>
                <div className="hidden sm:block">
                  <span className="px-4 py-2 bg-white/20 rounded-xl text-sm font-bold backdrop-blur-md border border-white/10">
                    Inclusive Job
                  </span>
                </div>
              </div>
            )}

            {/* Gallery + Main Photo */}
            {(job.photo || (job.gallery && job.gallery.length > 0)) && (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                  <h2 className="font-bold text-slate-900 flex items-center gap-2 text-lg">
                    <ImageIcon className="w-5 h-5 text-purple-500" />
                    Media & Galeri
                  </h2>
                </div>
                <div className="p-6">
                  {job.photo && (
                    <div
                      className="aspect-video rounded-2xl overflow-hidden bg-slate-50 mb-4 border border-slate-100 cursor-pointer hover:opacity-95 transition"
                      onClick={() => setSelectedImage(job.photo)}
                    >
                      <img
                        src={job.photo}
                        alt="Main Job Photo"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {job.gallery && job.gallery.length > 0 && (
                    <div className="grid grid-cols-4 gap-3">
                      {job.gallery.map((img, idx) => (
                        <div
                          key={idx}
                          className="aspect-square rounded-xl overflow-hidden bg-slate-50 border border-slate-100 hover:shadow-md transition-shadow cursor-pointer hover:opacity-95"
                          onClick={() => setSelectedImage(img)}
                        >
                          <img
                            src={img}
                            alt={`Gallery ${idx}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <Briefcase className="w-5 h-5" />
                </div>
                Deskripsi Pekerjaan
              </h2>
              <div
                className="prose prose-slate max-w-none text-slate-600 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: job.description }}
              />
            </div>

            {/* Requirements */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                  <Target className="w-5 h-5" />
                </div>
                Kualifikasi
              </h2>

              {/* Skills Required */}
              {job.skills && job.skills.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
                    Skill yang Dibutuhkan
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill, index) => (
                      <span
                        key={skill.id || index}
                        className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 ${
                          skill.isRequired
                            ? "bg-blue-50 text-blue-700 border border-blue-100"
                            : "bg-slate-50 text-slate-600 border border-slate-100"
                        }`}
                      >
                        {skill.isRequired && (
                          <CheckCircle className="w-4 h-4" />
                        )}
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Education & Experience */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {job.educationLevel && (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <GraduationCap className="w-5 h-5 text-purple-500 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-semibold">
                        Pendidikan
                      </p>
                      <p className="text-sm font-medium text-slate-900">
                        Min. {job.educationLevel}
                      </p>
                    </div>
                  </div>
                )}
                {job.minExperience !== null &&
                  job.minExperience !== undefined && (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <Briefcase className="w-5 h-5 text-blue-500 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-slate-500 uppercase font-semibold">
                          Pengalaman
                        </p>
                        <p className="text-sm font-medium text-slate-900">
                          {job.minExperience === 0
                            ? "Fresh Graduate"
                            : `Min. ${job.minExperience} Tahun`}
                        </p>
                      </div>
                    </div>
                  )}
              </div>

              {/* Requirements Text */}
              {job.requirements && (
                <div
                  className="prose prose-slate max-w-none text-slate-600 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: job.requirements }}
                />
              )}

              {/* Empty State */}
              {(!job.skills || job.skills.length === 0) &&
                !job.requirements &&
                !job.educationLevel && (
                  <p className="text-slate-400 italic">
                    Belum ada kualifikasi yang ditentukan.
                  </p>
                )}
            </div>

            {/* Benefits */}
            {job.benefits && job.benefits.length > 0 && (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-8">
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                    <Award className="w-5 h-5" />
                  </div>
                  Benefit & Fasilitas
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {job.benefits.map((benefit, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100"
                    >
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-slate-700 font-medium">
                        {benefit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Apply Card */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
              <h3 className="font-bold text-slate-900 mb-4 text-lg">
                Tertarik Melamar?
              </h3>
              <p className="text-slate-500 text-sm mb-6">
                Jangan lewatkan kesempatan ini. Lamar sekarang sebelum batas
                waktu berakhir.
              </p>

              {isDeadlineExpired() ? (
                <button
                  disabled
                  className="w-full py-4 bg-slate-100 text-slate-400 font-bold rounded-xl cursor-not-allowed flex items-center justify-center gap-2 mb-4"
                >
                  <AlertCircle className="w-5 h-5" />
                  Lowongan Ditutup
                </button>
              ) : hasApplied ? (
                <div className="w-full py-4 bg-green-50 text-green-700 font-bold rounded-xl border border-green-100 flex items-center justify-center gap-2 mb-4">
                  <CheckCircle className="w-5 h-5" />
                  Sudah Melamar
                </div>
              ) : (
                <button
                  onClick={handleApply}
                  className="w-full py-4 bg-[#03587f] hover:bg-[#024666] text-white font-bold rounded-xl transition-all shadow-lg shadow-[#03587f]/20 hover:shadow-[#03587f]/30 hover:-translate-y-0.5 flex items-center justify-center gap-2 mb-4"
                >
                  Lamar Sekarang
                  <ArrowLeft className="w-5 h-5 rotate-180" />
                </button>
              )}

              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Diposting</span>
                  <span className="font-semibold text-slate-900">
                    {getTimeSince(job.publishedAt || job.createdAt)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Deadline</span>
                  <span className="font-semibold text-slate-900">
                    {job.applicationDeadline
                      ? new Date(job.applicationDeadline).toLocaleDateString(
                          "id-ID",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          }
                        )
                      : "Tidak ada batas"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Total Pelamar</span>
                  <span className="font-semibold text-slate-900">
                    {job.applicationCount || 0} orang
                  </span>
                </div>
              </div>
            </div>

            {/* Schedule & Time Card */}
            {(job.workingDays || job.holidays || job.isShift) && (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-500" />
                  Jadwal & Waktu
                </h3>
                <div className="space-y-4">
                  {job.isShift && (
                    <div className="p-4 rounded-xl bg-purple-50 border border-purple-100 mb-2">
                      <div className="flex items-center gap-2 text-purple-800 font-semibold mb-1">
                        <Clock className="w-4 h-4" />
                        Sistem Shift
                      </div>
                      <p className="text-sm text-purple-700">
                        {job.shiftCount} Shift / Hari
                      </p>
                    </div>
                  )}

                  {job.workingDays && (
                    <div className="flex items-start gap-3 py-2">
                      <CalendarDays className="w-5 h-5 text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-slate-500 uppercase font-semibold mb-0.5">
                          Hari Kerja
                        </p>
                        <p className="text-sm font-medium text-slate-900">
                          {job.workingDays}
                        </p>
                      </div>
                    </div>
                  )}

                  {job.holidays && (
                    <div className="flex items-start gap-3 py-2 border-t border-slate-50 pt-4">
                      <Coffee className="w-5 h-5 text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-slate-500 uppercase font-semibold mb-0.5">
                          Hari Libur
                        </p>
                        <p className="text-sm font-medium text-slate-900">
                          {job.holidays}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-5xl w-full max-h-[90vh] flex items-center justify-center">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 text-white/80 hover:text-white transition"
            >
              <XCircle className="w-8 h-8" />
            </button>
            <img
              src={selectedImage}
              alt="Full View"
              className="max-w-full max-h-[85vh] rounded-lg shadow-2xl object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
