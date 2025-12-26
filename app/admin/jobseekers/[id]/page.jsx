"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  GraduationCap,
  Award,
  FileText,
  ArrowLeft,
  Download,
  ExternalLink,
  Eye,
  X,
  CheckCircle,
  XCircle,
  UserCheck,
  UserX,
  CreditCard,
  Heart,
  Globe,
  Building2,
} from "lucide-react";
import Swal from "sweetalert2";

export default function AdminJobseekerDetail() {
  const params = useParams();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [documentModal, setDocumentModal] = useState({
    isOpen: false,
    url: "",
    title: "",
  });

  useEffect(() => {
    if (params.id) {
      loadProfile();
    }
  }, [params.id]);

  const loadProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/jobseekers/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const listResponse = await fetch("/api/admin/jobseekers", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const listData = await listResponse.json();
        if (listData.success) {
          const found = listData.data.jobseekers.find(
            (j) => j.id === params.id
          );
          setProfile(found);
        }
      } else {
        const data = await response.json();
        if (data.success) {
          setProfile(data.data);
        }
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 flex flex-col items-center justify-center">
        <User className="h-16 w-16 text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-700">
          Pencari kerja tidak ditemukan
        </h2>
        <button
          onClick={() => router.back()}
          className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
        >
          Kembali ke Daftar
        </button>
      </div>
    );
  }

  // Define all documents
  const documents = [
    { key: "cvUrl", label: "CV / Resume", url: profile.cvUrl, color: "red" },
    { key: "ktpUrl", label: "KTP", url: profile.ktpUrl, color: "blue" },
    {
      key: "ak1Url",
      label: "AK-1 (Kartu Kuning)",
      url: profile.ak1Url,
      color: "orange",
    },
    {
      key: "ijazahUrl",
      label: "Ijazah",
      url: profile.ijazahUrl,
      color: "purple",
    },
    {
      key: "sertifikatUrl",
      label: "Sertifikat",
      url: profile.sertifikatUrl,
      color: "amber",
    },
    {
      key: "suratPengalamanUrl",
      label: "Surat Pengalaman Kerja",
      url: profile.suratPengalamanUrl,
      color: "teal",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Header / Hero */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition" />
            <span className="text-sm font-medium">Kembali ke Daftar</span>
          </button>

          <div className="flex flex-col md:flex-row items-start gap-6">
            {/* Profile Photo */}
            <div className="w-28 h-28 rounded-2xl bg-white/10 flex items-center justify-center overflow-hidden border-4 border-white/20 flex-shrink-0">
              {profile.photo ? (
                <img
                  src={profile.photo}
                  alt={profile.firstName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-12 h-12 text-white/50" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                {profile.firstName} {profile.lastName}
              </h1>
              <p className="text-lg text-slate-300 mb-4">
                {profile.currentTitle || "Pencari Kerja"}
              </p>

              {/* Status Badges */}
              <div className="flex flex-wrap gap-2">
                {profile.isEmployed ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white rounded-full text-xs font-bold">
                    <UserCheck className="w-3.5 h-3.5" />
                    Sudah Bekerja
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-500 text-white rounded-full text-xs font-bold">
                    <UserX className="w-3.5 h-3.5" />
                    Belum Bekerja
                  </span>
                )}
                {profile.isLookingForJob && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 text-white rounded-full text-xs font-bold">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                    Aktif Mencari Kerja
                  </span>
                )}
                {profile.profileCompleted && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 text-white rounded-full text-xs font-bold">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Profil Lengkap
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Data Diri */}
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Data Diri
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold">
                    NIK
                  </p>
                  <p className="font-medium text-slate-800">
                    {profile.idNumber || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold">
                    Tanggal Lahir
                  </p>
                  <p className="font-medium text-slate-800">
                    {formatDate(profile.dateOfBirth)}
                    {calculateAge(profile.dateOfBirth) &&
                      ` (${calculateAge(profile.dateOfBirth)} tahun)`}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold">
                    Jenis Kelamin
                  </p>
                  <p className="font-medium text-slate-800">
                    {profile.gender || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold">
                    Agama
                  </p>
                  <p className="font-medium text-slate-800">
                    {profile.religion || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold">
                    Status Pernikahan
                  </p>
                  <p className="font-medium text-slate-800">
                    {profile.maritalStatus || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold">
                    Kewarganegaraan
                  </p>
                  <p className="font-medium text-slate-800">
                    {profile.nationality || "Indonesia"}
                  </p>
                </div>
              </div>
            </section>

            {/* Kontak & Alamat */}
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-green-600" />
                Kontak & Alamat
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold">
                    Email
                  </p>
                  <p className="font-medium text-slate-800">{profile.email}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold">
                    No. Telepon
                  </p>
                  <p className="font-medium text-slate-800">
                    {profile.phone || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold">
                    Kecamatan
                  </p>
                  <p className="font-medium text-slate-800">
                    {profile.kecamatan || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold">
                    Kelurahan/Desa
                  </p>
                  <p className="font-medium text-slate-800">
                    {profile.kelurahan || "-"}
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs text-slate-500 uppercase font-bold">
                    Alamat Lengkap
                  </p>
                  <p className="font-medium text-slate-800">
                    {profile.address || "-"}
                    {profile.city && `, ${profile.city}`}
                    {profile.province && `, ${profile.province}`}
                    {profile.postalCode && ` ${profile.postalCode}`}
                  </p>
                </div>
              </div>
            </section>

            {/* Pendidikan Terakhir */}
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-purple-600" />
                Pendidikan Terakhir
              </h2>
              {profile.lastEducationLevel ||
              profile.lastEducationInstitution ? (
                <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 font-bold text-lg shrink-0">
                      {profile.lastEducationLevel?.charAt(0) || "?"}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">
                        {profile.lastEducationInstitution || "-"}
                      </h3>
                      <p className="text-purple-600 font-medium">
                        {profile.lastEducationLevel}
                        {profile.lastEducationMajor &&
                          ` - ${profile.lastEducationMajor}`}
                      </p>
                      {profile.graduationYear && (
                        <p className="text-sm text-slate-500 mt-1">
                          Lulus: {profile.graduationYear}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : profile.educations && profile.educations.length > 0 ? (
                <div className="space-y-4">
                  {profile.educations.map((edu, i) => (
                    <div
                      key={i}
                      className="bg-purple-50 rounded-xl p-4 border border-purple-100"
                    >
                      <h3 className="font-bold text-slate-900">
                        {edu.institution}
                      </h3>
                      <p className="text-purple-600">
                        {edu.degree} - {edu.fieldOfStudy}
                      </p>
                      <p className="text-sm text-slate-500 mt-1">
                        {new Date(edu.startDate).getFullYear()} -{" "}
                        {edu.isCurrent
                          ? "Sekarang"
                          : new Date(edu.endDate).getFullYear()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 italic">
                  Belum ada data pendidikan
                </p>
              )}
            </section>

            {/* Summary */}
            {profile.summary && (
              <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  Tentang / Ringkasan
                </h2>
                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {profile.summary}
                </p>
              </section>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Dokumen */}
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-600" />
                Dokumen
              </h2>
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div
                    key={doc.key}
                    className={`flex items-center justify-between p-3 rounded-xl border ${
                      doc.url
                        ? "bg-green-50 border-green-200"
                        : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {doc.url ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
                      )}
                      <span
                        className={`text-sm font-medium ${
                          doc.url ? "text-green-700" : "text-slate-500"
                        }`}
                      >
                        {doc.label}
                      </span>
                    </div>
                    {doc.url && (
                      <button
                        onClick={() =>
                          setDocumentModal({
                            isOpen: true,
                            url: doc.url,
                            title: doc.label,
                          })
                        }
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Info Kerja */}
            {profile.isEmployed && profile.employedCompany && (
              <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-emerald-600" />
                  Info Pekerjaan Saat Ini
                </h2>
                <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                  <p className="font-medium text-emerald-700">
                    {profile.employedCompany}
                  </p>
                  {profile.employedAt && (
                    <p className="text-sm text-slate-500 mt-1">
                      Sejak {formatDate(profile.employedAt)}
                    </p>
                  )}
                </div>
              </section>
            )}

            {/* Statistik */}
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 mb-4">
                Statistik
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 text-sm">Total Lamaran</span>
                  <span className="font-bold text-slate-800">
                    {profile.totalApplications || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 text-sm">
                    Kelengkapan Profil
                  </span>
                  <span className="font-bold text-slate-800">
                    {profile.profileCompleteness || 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 text-sm">Tanggal Daftar</span>
                  <span className="font-medium text-slate-800">
                    {formatDate(profile.createdAt || profile.joinedAt)}
                  </span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Document Preview Modal */}
      {documentModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-bold text-lg text-slate-900">
                {documentModal.title}
              </h3>
              <div className="flex items-center gap-2">
                <a
                  href={documentModal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
                <button
                  onClick={() =>
                    setDocumentModal({ isOpen: false, url: "", title: "" })
                  }
                  className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="h-[75vh] bg-slate-100">
              {documentModal.url.toLowerCase().endsWith(".pdf") ? (
                <iframe
                  src={documentModal.url}
                  className="w-full h-full"
                  title={documentModal.title}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center p-4">
                  <img
                    src={documentModal.url}
                    alt={documentModal.title}
                    className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
