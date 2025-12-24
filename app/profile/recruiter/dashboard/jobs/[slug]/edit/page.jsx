"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Briefcase,
  MapPin,
  Users,
  Calendar,
  ArrowLeft,
  Save,
  Eye,
  Plus,
  X,
  Image as ImageIcon,
} from "lucide-react";
import Swal from "sweetalert2";

export default function EditJobPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [newBenefit, setNewBenefit] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    benefits: [],
    location: "",
    city: "",
    province: "",
    isRemote: false,
    jobType: "",
    educationLevel: "",
    numberOfPositions: "1",
    applicationDeadline: "",
    skills: [],
    isActive: true,
    jobPhoto: "",
    gallery: [],
    workingDays: "",
    holidays: "",
    isShift: false,
    shiftCount: "",
    isDisabilityFriendly: false,
  });

  const jobTypes = ["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP"];
  const educationLevels = ["SMA", "D3", "S1", "S2", "S3"];
  const provinces = [
    "DKI Jakarta",
    "Jawa Barat",
    "Jawa Tengah",
    "Jawa Timur",
    "Banten",
    "DI Yogyakarta",
    "Bali",
    "Sumatera Utara",
    "Sumatera Barat",
    "Sulawesi Selatan",
  ];

  useEffect(() => {
    loadJob();
  }, [params.slug]);

  const loadJob = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(
        `/api/profile/recruiter/jobs/${params.slug}/edit`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const job = data.job;

        const formatDate = (date) => {
          if (!date) return "";
          const d = new Date(date);
          return d.toISOString().split("T")[0];
        };

        setFormData({
          title: job.title || "",
          description: job.description || "",
          benefits: Array.isArray(job.benefits) ? job.benefits : [],
          location: job.location || "",
          city: job.city || "",
          province: job.province || "",
          isRemote: job.isRemote || false,
          jobType: job.jobType || "",
          educationLevel: job.educationLevel || "",
          numberOfPositions: job.numberOfPositions?.toString() || "1",
          applicationDeadline: formatDate(job.applicationDeadline) || "",
          skills: job.skills || [],
          isActive: job.isActive !== undefined ? job.isActive : true,
          jobPhoto: job.photo || "",
          gallery: Array.isArray(job.gallery) ? job.gallery : [],
          workingDays: job.workingDays || "",
          holidays: job.holidays || "",
          isShift: job.isShift || false,
          shiftCount: job.shiftCount?.toString() || "",
          isDisabilityFriendly: job.isDisabilityFriendly || false,
        });
      } else {
        throw new Error("Failed to load job");
      }
    } catch (error) {
      console.error("Load job error:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load job data",
      });
      router.push("/profile/recruiter/dashboard/jobs");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Skills handlers
  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()],
      }));
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (index) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
  };

  // Benefits handlers
  const handleAddBenefit = () => {
    if (newBenefit.trim() && !formData.benefits.includes(newBenefit.trim())) {
      setFormData((prev) => ({
        ...prev,
        benefits: [...prev.benefits, newBenefit.trim()],
      }));
      setNewBenefit("");
    }
  };

  const handleRemoveBenefit = (index) => {
    setFormData((prev) => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index),
    }));
  };

  // Photo Upload Handler (Main Photo)
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    uploadFile(file, "jobPhoto");
  };

  // Gallery Upload Handler
  const handleGalleryUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (formData.gallery.length >= 5) {
      Swal.fire({
        icon: "warning",
        title: "Limit Reached",
        text: "Maksimal 5 foto galeri",
      });
      return;
    }

    uploadFile(file, "gallery");
  };

  const uploadFile = async (file, type) => {
    Swal.fire({
      title: "Uploading...",
      text: "Sedang mengupload foto",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);
      formDataUpload.append("folder", "jobs");

      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formDataUpload,
      });

      const data = await response.json();

      if (response.ok && data.url) {
        if (type === "gallery") {
          setFormData((prev) => ({
            ...prev,
            gallery: [...prev.gallery, data.url],
          }));
        } else {
          setFormData((prev) => ({
            ...prev,
            [type]: data.url,
          }));
        }
        Swal.close();
      } else {
        throw new Error(data.error || "Upload failed");
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Upload Gagal",
        text: error.message,
      });
    }
  };

  const handleRemoveGallery = (index) => {
    setFormData((prev) => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.title ||
      !formData.description ||
      !formData.location ||
      !formData.jobType
    ) {
      Swal.fire({
        icon: "warning",
        title: "Incomplete Form",
        text: "Please fill all required fields",
      });
      return;
    }

    const result = await Swal.fire({
      title: "Update Lowongan?",
      text: "Pastikan semua informasi sudah benar",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3b82f6",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, Update",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const submitData = {
        ...formData,
        photo: formData.jobPhoto,
        // Ensure array fields are sent correctly
        gallery: formData.gallery || [],
        benefits: formData.benefits || [],
        skills: formData.skills || [],
      };

      const response = await fetch(
        `/api/profile/recruiter/jobs/${params.slug}/update`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(submitData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        await Swal.fire({
          icon: "success",
          title: "Berhasil Diajukan!",
          text: "Lowongan berhasil diupdate dan dikirim untuk validasi ulang oleh admin.",
          confirmButtonColor: "#3b82f6",
        });
        router.push("/profile/recruiter/dashboard/jobs");
      } else {
        throw new Error(data.details || data.error || "Failed to update job");
      }
    } catch (error) {
      console.error("Update job error:", error);
      Swal.fire({
        icon: "error",
        title: "Gagal Update",
        text: error.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-32">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-5xl">
          <button
            onClick={() => router.push("/profile/recruiter/dashboard/jobs")}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Kembali</span>
          </button>
          <h1 className="text-lg font-bold text-gray-900">Edit Lowongan</h1>
          <div className="w-20"></div> {/* Spacer for center alignment */}
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Main Info Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <Briefcase className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Informasi Utama
              </h2>
            </div>

            <div className="grid gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Judul Posisi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full bg-gray-50 text-gray-900 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                  placeholder="Contoh: Senior Frontend Developer"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tipe Pekerjaan <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="jobType"
                    value={formData.jobType}
                    onChange={handleInputChange}
                    className="w-full bg-gray-50 text-gray-900 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none appearance-none"
                    required
                  >
                    <option value="">Pilih Tipe</option>
                    {jobTypes.map((type) => (
                      <option key={type} value={type}>
                        {type.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Level Pendidikan
                  </label>
                  <select
                    name="educationLevel"
                    value={formData.educationLevel}
                    onChange={handleInputChange}
                    className="w-full bg-gray-50 text-gray-900 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none appearance-none"
                  >
                    <option value="">Tidak ada persyaratan</option>
                    {educationLevels.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Jumlah Posisi
                </label>
                <input
                  type="number"
                  name="numberOfPositions"
                  value={formData.numberOfPositions}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full md:w-1/3 bg-gray-50 text-gray-900 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Deskripsi Pekerjaan <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="8"
                  className="w-full bg-gray-50 text-gray-900 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none resize-y"
                  placeholder="Jelaskan detail tanggung jawab, persyaratan, dan ekspektasi..."
                  required
                ></textarea>
              </div>
            </div>
          </div>

          {/* Media Gallery */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Media & Galeri
                </h2>
                <p className="text-sm text-gray-500">
                  Upload foto untuk menarik kandidat
                </p>
              </div>
            </div>

            <div className="grid gap-8">
              {/* Main Photo */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Foto Utama (Thumbnail)
                </label>
                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-4 transition-all hover:border-blue-400 hover:bg-blue-50/10 group">
                  {formData.jobPhoto ? (
                    <div className="relative aspect-video w-full max-w-md mx-auto rounded-xl overflow-hidden shadow-sm">
                      <img
                        src={formData.jobPhoto}
                        alt="Job Thumbnail"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, jobPhoto: "" }))
                        }
                        className="absolute top-2 right-2 p-1.5 bg-white/90 text-red-500 rounded-full hover:bg-red-50 transition-colors shadow-sm backdrop-blur-sm"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center py-12 cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoUpload}
                      />
                      <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <ImageIcon className="w-8 h-8" />
                      </div>
                      <span className="font-semibold text-gray-900">
                        Upload Foto Utama
                      </span>
                      <span className="text-sm text-gray-500 mt-1">
                        JPG, PNG max 5MB
                      </span>
                    </label>
                  )}
                </div>
              </div>

              {/* Gallery */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Galeri Foto Tambahan{" "}
                  <span className="text-gray-400 font-normal">
                    (Maksimal 5)
                  </span>
                </label>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {formData.gallery.map((photo, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-xl overflow-hidden group shadow-sm bg-gray-100"
                    >
                      <img
                        src={photo}
                        alt={`Gallery ${index}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveGallery(index)}
                        className="absolute top-1 right-1 p-1 bg-white/90 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  {formData.gallery.length < 5 && (
                    <label className="aspect-square border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/10 transition-all text-gray-400 hover:text-blue-500">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleGalleryUpload}
                      />
                      <Plus className="w-8 h-8 mb-2" />
                      <span className="text-xs font-semibold">Tambah</span>
                    </label>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Location & Schedule */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                  <MapPin className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  Lokasi & Jadwal
                </h2>
              </div>

              <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-xl hover:border-blue-300 transition-colors cursor-pointer bg-gray-50/50">
                <input
                  type="checkbox"
                  name="isRemote"
                  checked={formData.isRemote}
                  onChange={handleInputChange}
                  className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                />
                <div>
                  <span className="font-semibold text-gray-900 block">
                    Remote / WFH
                  </span>
                  <span className="text-sm text-gray-500">
                    Pekerjaan bisa dilakukan dari mana saja
                  </span>
                </div>
              </label>

              {!formData.isRemote && (
                <div className="space-y-4 pt-2">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Alamat Lengkap <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full bg-gray-50 text-gray-900 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full bg-gray-50 text-gray-900 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                      placeholder="Kota"
                    />
                    <select
                      name="province"
                      value={formData.province}
                      onChange={handleInputChange}
                      className="w-full bg-gray-50 text-gray-900 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none appearance-none"
                    >
                      <option value="">Provinsi</option>
                      {provinces.map((prov) => (
                        <option key={prov} value={prov}>
                          {prov}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-gray-100 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                      Hari Kerja
                    </label>
                    <input
                      type="text"
                      name="workingDays"
                      value={formData.workingDays}
                      onChange={handleInputChange}
                      className="w-full bg-gray-50 text-gray-900 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-500 outline-none"
                      placeholder="Senin - Jumat"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                      Hari Libur
                    </label>
                    <input
                      type="text"
                      name="holidays"
                      value={formData.holidays}
                      onChange={handleInputChange}
                      className="w-full bg-gray-50 text-gray-900 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-500 outline-none"
                      placeholder="Sabtu - Minggu"
                    />
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="isShift"
                      checked={formData.isShift}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <span className="font-medium text-gray-900 text-sm">
                      Sistem Shift
                    </span>
                  </label>

                  {formData.isShift && (
                    <select
                      name="shiftCount"
                      value={formData.shiftCount}
                      onChange={handleInputChange}
                      className="mt-3 w-full bg-white text-gray-900 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-500 outline-none"
                    >
                      <option value="">Pilih Jumlah Shift</option>
                      <option value="2">2 Shift</option>
                      <option value="3">3 Shift</option>
                      <option value="4">4 Shift</option>
                    </select>
                  )}
                </div>
              </div>
            </div>

            {/* Skills & Benefits */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                  <Users className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Kualifikasi</h2>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Skill Wajib
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" &&
                      (e.preventDefault(), handleAddSkill())
                    }
                    className="flex-1 bg-gray-50 text-gray-900 px-4 py-2 border border-gray-200 rounded-xl focus:border-blue-500 outline-none"
                    placeholder="Tambah skill..."
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="w-10 h-10 bg-gray-900 text-white rounded-xl flex items-center justify-center hover:bg-black transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 min-h-[40px]">
                  {formData.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium group"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(index)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                  {formData.skills.length === 0 && (
                    <p className="text-sm text-gray-400 italic">
                      Belum ada skill ditambahkan
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Benefits
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newBenefit}
                    onChange={(e) => setNewBenefit(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" &&
                      (e.preventDefault(), handleAddBenefit())
                    }
                    className="flex-1 bg-gray-50 text-gray-900 px-4 py-2 border border-gray-200 rounded-xl focus:border-blue-500 outline-none"
                    placeholder="Tambah benefit..."
                  />
                  <button
                    type="button"
                    onClick={handleAddBenefit}
                    className="w-10 h-10 bg-green-600 text-white rounded-xl flex items-center justify-center hover:bg-green-700 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.benefits.map((benefit, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm font-medium"
                    >
                      {benefit}
                      <button
                        type="button"
                        onClick={() => handleRemoveBenefit(index)}
                        className="text-green-600/60 hover:text-green-800"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100">
                <div className="bg-blue-50 rounded-xl p-4">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="isDisabilityFriendly"
                      checked={formData.isDisabilityFriendly}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <div>
                      <span className="font-semibold text-blue-900 block text-sm">
                        Ramah Disabilitas
                      </span>
                      <span className="text-xs text-blue-600">
                        Posisi terbuka untuk penyandang disabilitas
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Action Bar */}
          <div className="fixed bottom-0 left-0 lg:left-64 right-0 bg-white border-t border-gray-100 p-4 shadow-lg z-20">
            <div className="container mx-auto max-w-5xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="text-blue-600 focus:ring-blue-500 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Tampilkan Lowongan
                  </span>
                </label>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    router.push("/profile/recruiter/dashboard/jobs")
                  }
                  className="px-6 py-2.5 text-gray-600 font-medium hover:bg-gray-50 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`flex items-center gap-2 px-8 py-2.5 bg-gray-900 text-white rounded-xl font-medium hover:bg-black transition-all shadow-lg shadow-gray-200 transform active:scale-95 ${
                    submitting ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Simpan Perubahan</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
