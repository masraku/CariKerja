"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Swal from "sweetalert2";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  FileText,
  Edit,
  Download,
  ArrowLeft,
  ToggleLeft,
  ToggleRight,
  CheckCircle2,
  Eye,
  X,
} from "lucide-react";

const ViewProfilePage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [previewModal, setPreviewModal] = useState({
    isOpen: false,
    url: "",
    fileName: "",
    fileType: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await fetch("/api/profile/jobseeker", {
        credentials: "include",
      });
      const data = await response.json();

      if (response.ok && data.profile) {
        setProfile(data.profile);
      } else {
        router.push("/profile/jobseeker?mode=edit");
      }
    } catch (error) {
      router.push("/profile/jobseeker?mode=edit");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleJobSeekingStatus = async () => {
    const currentStatus = profile.isLookingForJob;
    const newStatus = !currentStatus;

    const result = await Swal.fire({
      title: newStatus
        ? "Aktifkan Pencarian Kerja?"
        : "Nonaktifkan Pencarian Kerja?",
      html: newStatus
        ? '<p class="text-gray-600">Dengan mengaktifkan, profil Anda akan terlihat oleh recruiter.</p>'
        : '<p class="text-gray-600">Dengan menonaktifkan, profil Anda tidak akan muncul di pencarian.</p>',
      icon: "question",
      showCancelButton: true,
      confirmButtonText: newStatus ? "Ya, Aktifkan" : "Ya, Nonaktifkan",
      cancelButtonText: "Batal",
      confirmButtonColor: newStatus ? "#10b981" : "#f97316",
    });

    if (!result.isConfirmed) return;

    try {
      setIsUpdatingStatus(true);
      const response = await fetch("/api/profile/jobseeker/status", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isLookingForJob: newStatus }),
      });

      if (response.ok) {
        setProfile((prev) => ({ ...prev, isLookingForJob: newStatus }));
        await Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: newStatus
            ? "Status pencari kerja telah diaktifkan"
            : "Status pencari kerja telah dinonaktifkan",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      Swal.fire({ icon: "error", text: "Gagal mengupdate status" });
    } finally {
      setIsUpdatingStatus(false);
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

  const openPreview = (url, fileName) => {
    const extension = (fileName || url).split(".").pop().toLowerCase();
    const fileType = ["jpg", "jpeg", "png", "gif", "webp"].includes(extension)
      ? "image"
      : "pdf";
    setPreviewModal({ isOpen: true, url, fileName, fileType });
  };

  const closePreview = () => {
    setPreviewModal({ isOpen: false, url: "", fileName: "", fileType: "" });
  };

  // Document list for display
  const documents = [
    {
      key: "cv",
      label: "CV / Daftar Riwayat Hidup",
      url: profile?.cvUrl,
      fileName: profile?.cvFileName,
    },
    {
      key: "ktp",
      label: "KTP",
      url: profile?.ktpUrl,
      fileName: profile?.ktpFileName,
    },
    {
      key: "ak1",
      label: "AK1 (Kartu Pencari Kerja)",
      url: profile?.ak1Url,
      fileName: profile?.ak1FileName,
    },
    {
      key: "ijazah",
      label: "Ijazah Pendidikan Terakhir",
      url: profile?.ijazahUrl,
      fileName: profile?.ijazahFileName,
    },
    {
      key: "sertifikat",
      label: "Sertifikat",
      url: profile?.sertifikatUrl,
      fileName: profile?.sertifikatFileName,
    },
    {
      key: "suratPengalaman",
      label: "Surat Pengalaman Kerja",
      url: profile?.suratPengalamanUrl,
      fileName: profile?.suratPengalamanFileName,
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-500">Memuat profil...</p>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-4 space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
              {/* Header Background */}
              <div className="h-24 bg-gradient-to-br from-[#03587f] to-[#024666] relative">
                <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                  <div className="w-24 h-24 rounded-2xl border-4 border-white bg-white shadow-lg overflow-hidden">
                    {profile.photo ? (
                      <img
                        src={profile.photo}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-500">
                        <User size={40} />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-16 pb-6 px-6 text-center">
                <h1 className="text-xl font-bold text-gray-900">
                  {profile.firstName} {profile.lastName}
                </h1>

                {/* Location & Age */}
                <div className="flex flex-wrap justify-center gap-2 mt-3">
                  {(profile.kecamatan || profile.kelurahan) && (
                    <span className="flex items-center gap-1.5 text-gray-500 text-sm bg-gray-50 px-3 py-1.5 rounded-full">
                      <MapPin size={14} />
                      {profile.kelurahan && `${profile.kelurahan}, `}
                      {profile.kecamatan || profile.city}
                    </span>
                  )}
                  {profile.dateOfBirth && (
                    <span className="flex items-center gap-1.5 text-gray-500 text-sm bg-gray-50 px-3 py-1.5 rounded-full">
                      <Calendar size={14} />
                      {calculateAge(profile.dateOfBirth)} Tahun
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Status Card */}
            <div className="bg-white rounded-3xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">
                  Status Pencari Kerja
                </h3>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    profile.isEmployed
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {profile.isEmployed ? "BEKERJA" : "MENCARI KERJA"}
                </div>
              </div>

              <p className="text-sm text-gray-500 text-center">
                {profile.isEmployed 
                  ? `Anda tercatat sedang bekerja${profile.employedCompany ? ` di ${profile.employedCompany}` : ''}`
                  : "Anda sedang aktif mencari pekerjaan"
                }
              </p>
              <p className="text-xs text-gray-400 text-center mt-2">
                Status ini diperbarui otomatis berdasarkan kontrak kerja
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => router.push("/profile/jobseeker?mode=edit")}
                className="w-full py-3.5 bg-[#03587f] text-white rounded-2xl font-semibold shadow-lg hover:bg-[#024666] transition flex items-center justify-center gap-2"
              >
                <Edit size={18} /> Edit Profil
              </button>
              <button
                onClick={() => router.push("/profile/jobseeker/dashboard")}
                className="w-full py-3.5 bg-white text-gray-700 border rounded-2xl font-semibold hover:bg-gray-50 transition flex items-center justify-center gap-2"
              >
                <ArrowLeft size={18} /> Kembali ke Dashboard
              </button>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-8 space-y-6">
            {/* Ringkasan */}
            {profile.summary && (
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                    <FileText size={20} />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Tentang Saya
                  </h2>
                </div>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {profile.summary}
                </p>
              </div>
            )}

            {/* Info Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Data Diri */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                    <User size={20} />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">Data Diri</h2>
                </div>
                <div className="space-y-3">
                  <InfoItem label="NIK" value={profile.idNumber} />
                  <InfoItem label="Jenis Kelamin" value={profile.gender} />
                  <InfoItem label="Agama" value={profile.religion} />
                  <InfoItem label="Status" value={profile.maritalStatus} />
                </div>
              </div>

              {/* Kontak */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                    <Phone size={20} />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">Kontak</h2>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-bold">
                        Email
                      </p>
                      <p className="font-medium text-gray-900">
                        {profile.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-bold">
                        Telepon
                      </p>
                      <p className="font-medium text-gray-900">
                        {profile.phone || "-"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-bold">
                        Alamat
                      </p>
                      <p className="font-medium text-gray-900">
                        {profile.address && `${profile.address}, `}
                        {profile.kelurahan && `${profile.kelurahan}, `}
                        {profile.kecamatan || profile.city || "-"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pendidikan Terakhir */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
                  <GraduationCap size={20} />
                </div>
                <h2 className="text-lg font-bold text-gray-900">
                  Pendidikan Terakhir
                </h2>
              </div>
              {profile.lastEducationLevel ||
              profile.lastEducationInstitution ? (
                <div className="bg-gray-50 rounded-2xl p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 font-bold text-lg shrink-0">
                      {profile.lastEducationLevel?.charAt(0) || "?"}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">
                        {profile.lastEducationInstitution || "-"}
                      </h3>
                      <p className="text-purple-600 font-medium">
                        {profile.lastEducationLevel}
                        {profile.lastEducationMajor &&
                          ` - ${profile.lastEducationMajor}`}
                      </p>
                      {profile.graduationYear && (
                        <p className="text-sm text-gray-500 mt-1">
                          Lulus: {profile.graduationYear}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 italic">
                  Belum ada data pendidikan.
                </p>
              )}
            </div>

            {/* Dokumen */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                  <FileText size={20} />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Dokumen</h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {documents.map((doc) => (
                  <div
                    key={doc.key}
                    className={`flex items-center justify-between p-3 rounded-xl border ${
                      doc.url
                        ? "bg-green-50 border-green-200"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {doc.url ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                      )}
                      <span
                        className={`text-sm font-medium ${
                          doc.url ? "text-green-700" : "text-gray-500"
                        }`}
                      >
                        {doc.label}
                      </span>
                    </div>
                    {doc.url && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => openPreview(doc.url, doc.fileName)}
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                        >
                          <Eye size={16} />
                        </button>
                        <a
                          href={doc.url}
                          download
                          className="p-1.5 text-green-600 hover:bg-green-100 rounded-lg transition"
                        >
                          <Download size={16} />
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {previewModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-gray-900 truncate pr-4">
                {previewModal.fileName || "Preview"}
              </h3>
              <button
                onClick={closePreview}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-auto max-h-[calc(90vh-80px)] flex items-center justify-center bg-gray-100">
              {previewModal.fileType === "image" ? (
                <img
                  src={previewModal.url}
                  alt={previewModal.fileName}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
                />
              ) : (
                <iframe
                  src={previewModal.url}
                  title={previewModal.fileName}
                  className="w-full h-[70vh] rounded-lg border"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper component
const InfoItem = ({ label, value }) => (
  <div>
    <p className="text-xs text-gray-500 uppercase font-bold">{label}</p>
    <p className="font-medium text-gray-900">{value || "-"}</p>
  </div>
);

export default ViewProfilePage;
