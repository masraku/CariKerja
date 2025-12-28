"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  Briefcase,
  MapPin,
  Calendar,
  Users,
  ArrowLeft,
  ArrowRight,
  Check,
  Save,
  X,
  Plus,
  Eye,
  Image,
} from "lucide-react";
import Swal from "sweetalert2";
import RupiahInput from "@/components/RupiahInput";
import {
  kecamatanCirebon,
  getKelurahanByKecamatan,
  getAllKecamatan,
} from "@/lib/cirebonData";

export default function PostJobPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [isCheckingVerification, setIsCheckingVerification] = useState(true);
  const [blockReason, setBlockReason] = useState(null);
  const [companyStatus, setCompanyStatus] = useState(null);
  const [companyProfile, setCompanyProfile] = useState(null);
  const [useCompanyAddress, setUseCompanyAddress] = useState(true);

  // Check company verification on page load
  useEffect(() => {
    checkCompanyVerification();
  }, []);

  const checkCompanyVerification = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setBlockReason("no_token");
        setIsCheckingVerification(false);
        return;
      }

      const response = await fetch("/api/profile/recruiter", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (!response.ok) {
        setBlockReason("error");
        setIsCheckingVerification(false);
        return;
      }

      const profile = data.profile;

      if (!profile) {
        setBlockReason("no_profile");
        setIsCheckingVerification(false);
        return;
      }

      const company = profile.companies;

      if (!company?.verified) {
        setBlockReason("not_verified");
        setCompanyStatus(company?.status);
        setIsCheckingVerification(false);
        return;
      }

      // Save company profile for address
      setCompanyProfile(company);

      // Set default address from company
      setFormData((prev) => ({
        ...prev,
        location: company.address || "",
        city: company.city || "",
        province: company.province || "",
      }));

      setBlockReason(null);
      setIsCheckingVerification(false);
    } catch (error) {
      setBlockReason("error");
      setIsCheckingVerification(false);
    }
  };

  const [formData, setFormData] = useState({
    // Basic Info (Step 1)
    title: "",
    description: "",
    responsibilities: "",
    educationLevel: "",
    skills: [],

    // Position Details (Step 1)
    numberOfPositions: 1,
    malePositions: 0,
    femalePositions: 0,

    // Location (Step 1)
    location: "",
    kecamatan: "",
    kelurahan: "",
    city: "Cirebon",
    province: "Jawa Barat",
    isRemote: false,
    jobScope: "DOMESTIC", // DOMESTIC or INTERNATIONAL

    // Salary & Benefits (Step 2)
    showSalary: false,
    salaryMin: "",
    salaryMax: "",
    salaryType: "monthly",
    // Photo (Step 2)
    jobPhoto: "",
    gallery: [],
    benefits: [],

    // Work Schedule (Step 2)
    workingDays: "",
    holidays: "",
    isShift: false,
    shiftCount: "",
    isDisabilityFriendly: false,

    // Review & Deadline (Step 3)
    applicationDeadline: "",

    // Hidden/Removed fields (kept for API compatibility)
    jobType: "FULL_TIME",
    level: "MID_LEVEL",
    category: "Other",
    requirements: "",
    minExperience: "",
    maxExperience: "",
  });

  const [newBenefit, setNewBenefit] = useState("");
  const [newSkill, setNewSkill] = useState("");
  const [selectedKecamatan, setSelectedKecamatan] = useState("");
  const [kelurahanOptions, setKelurahanOptions] = useState([]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle kecamatan change
  const handleKecamatanChange = (e) => {
    const kecamatan = e.target.value;
    setSelectedKecamatan(kecamatan);
    setKelurahanOptions(getKelurahanByKecamatan(kecamatan));
    setFormData((prev) => ({
      ...prev,
      kecamatan: kecamatan,
      kelurahan: "",
      location: kecamatan ? `Kec. ${kecamatan}, Kab. Cirebon, Jawa Barat` : "",
    }));
  };

  // Handle kelurahan change
  const handleKelurahanChange = (e) => {
    const kelurahan = e.target.value;
    setFormData((prev) => ({
      ...prev,
      kelurahan: kelurahan,
      location:
        kelurahan && selectedKecamatan
          ? `${kelurahan}, Kec. ${selectedKecamatan}, Kab. Cirebon, Jawa Barat`
          : prev.location,
    }));
  };

  // Handle address toggle
  const handleAddressToggle = (useCompany) => {
    setUseCompanyAddress(useCompany);
    if (useCompany && companyProfile) {
      setFormData((prev) => ({
        ...prev,
        location: companyProfile.address || "",
        city: companyProfile.city || "",
        province: companyProfile.province || "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        location: "",
        city: "",
        province: "",
      }));
    }
  };

  // Add benefit
  const handleAddBenefit = () => {
    if (newBenefit.trim()) {
      setFormData((prev) => ({
        ...prev,
        benefits: [...prev.benefits, newBenefit.trim()],
      }));
      setNewBenefit("");
    }
  };

  // Remove benefit
  const handleRemoveBenefit = (index) => {
    setFormData((prev) => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index),
    }));
  };

  // Add skill
  const handleAddSkill = () => {
    if (newSkill.trim()) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()],
      }));
      setNewSkill("");
    }
  };

  // Remove skill
  const handleRemoveSkill = (index) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
  };

  // Format rupiah for preview
  const formatRupiah = (value) => {
    if (!value) return "";
    const number = value.toString().replace(/[^0-9]/g, "");
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // Submit job
  const handleSubmit = async () => {
    try {
      setIsSaving(true);

      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire({
          icon: "error",
          title: "Session Expired",
          text: "Please login again",
          confirmButtonColor: "#2563EB",
        }).then(() => {
          router.push("/login?role=recruiter");
        });
        return;
      }

      // Validate required fields
      const missingFields = [];

      // Basic Info
      if (!formData.title) missingFields.push("Nama Posisi");
      if (!formData.description) missingFields.push("Deskripsi Pekerjaan");
      if (!formData.educationLevel) missingFields.push("Level Pendidikan");

      // Skills
      if (!formData.skills || formData.skills.length === 0) {
        missingFields.push("Skill yang Dibutuhkan (minimal 1)");
      }

      // Positions
      const totalPositions =
        parseInt(formData.malePositions || 0) +
        parseInt(formData.femalePositions || 0);
      if (totalPositions < 1) {
        missingFields.push("Jumlah Posisi (minimal 1)");
      }

      // Location (if not remote)
      if (!formData.isRemote) {
        if (!formData.location && !formData.kecamatan) {
          missingFields.push("Lokasi Kerja");
        }
      }

      // Deadline
      if (!formData.applicationDeadline) {
        missingFields.push("Batas Akhir Lamaran");
      }

      // Show error if missing fields
      if (missingFields.length > 0) {
        Swal.fire({
          icon: "warning",
          title: "Data Tidak Lengkap",
          html: `<p>Mohon lengkapi field berikut:</p><ul style="text-align:left;margin-top:10px;">${missingFields
            .map((f) => `<li>• ${f}</li>`)
            .join("")}</ul>`,
          confirmButtonColor: "#2563EB",
        });
        return;
      }

      // Prepare data
      const submitData = {
        ...formData,
        photo: formData.jobPhoto || null,
        numberOfPositions:
          parseInt(formData.malePositions || 0) +
            parseInt(formData.femalePositions || 0) || 1,
      };

      const response = await fetch("/api/profile/recruiter/jobs/create", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });
      const data = await response.json();

      if (response.ok) {
        await Swal.fire({
          icon: "success",
          title: "Berhasil Diajukan!",
          text: "Lowongan berhasil diajukan dan menunggu validasi admin sebelum dipublikasikan.",
          confirmButtonColor: "#2563EB",
        });
        router.push("/profile/recruiter/dashboard");
      } else {
        if (response.status === 401) {
          Swal.fire({
            icon: "error",
            title: "Session Expired",
            text: "Sesi Anda telah berakhir. Silakan login kembali.",
            confirmButtonColor: "#2563EB",
          }).then(() => {
            localStorage.removeItem("token");
            router.push("/login?role=recruiter");
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Gagal!",
            text: data.error || "Gagal mempublikasikan lowongan",
            confirmButtonColor: "#2563EB",
          });
        }
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Terjadi kesalahan saat mempublikasikan: " + error.message,
        confirmButtonColor: "#2563EB",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Steps configuration - 3 steps
  const steps = [
    { number: 1, title: "Informasi Lowongan", icon: Briefcase },
    { number: 2, title: "Foto & Benefit", icon: Image },
    { number: 3, title: "Review & Posting", icon: Eye },
  ];

  // City options
  const cityOptions = [
    "Cirebon",
    "Bandung",
    "Jakarta",
    "Surabaya",
    "Semarang",
    "Yogyakarta",
    "Medan",
    "Makassar",
    "Denpasar",
    "Palembang",
    "Tangerang",
    "Bekasi",
    "Depok",
    "Bogor",
  ];

  // Province options
  const provinceOptions = [
    "Jawa Barat",
    "DKI Jakarta",
    "Jawa Tengah",
    "Jawa Timur",
    "DI Yogyakarta",
    "Banten",
    "Bali",
    "Sumatera Utara",
    "Sumatera Selatan",
    "Sulawesi Selatan",
  ];

  // Show loading while checking verification
  if (isCheckingVerification) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memeriksa status perusahaan...</p>
        </div>
      </div>
    );
  }

  // Show blocked UI if there's a block reason
  if (blockReason) {
    const blockConfig = {
      no_token: {
        icon: "🔐",
        title: "Sesi Berakhir",
        message: "Silakan login kembali untuk melanjutkan.",
        buttonText: "Login",
        buttonAction: () => router.push("/login?role=recruiter"),
      },
      no_profile: {
        icon: "📝",
        title: "Profile Belum Lengkap",
        message:
          "Silakan lengkapi profile perusahaan terlebih dahulu sebelum memposting lowongan.",
        buttonText: "Lengkapi Profile",
        buttonAction: () => router.push("/profile/recruiter"),
      },
      not_verified: {
        icon: "⏳",
        title: "Menunggu Verifikasi",
        message:
          companyStatus === "REJECTED"
            ? "Perusahaan Anda ditolak. Silakan edit profile perusahaan dan kirim ulang untuk di-review."
            : companyStatus === "PENDING_RESUBMISSION"
            ? "Perusahaan Anda sedang dalam proses review ulang oleh admin."
            : "Perusahaan Anda harus terverifikasi terlebih dahulu oleh admin sebelum dapat memposting lowongan.",
        buttonText:
          companyStatus === "REJECTED"
            ? "Edit Profile Perusahaan"
            : "Kembali ke Dashboard",
        buttonAction: () =>
          router.push(
            companyStatus === "REJECTED"
              ? "/profile/recruiter"
              : "/profile/recruiter/dashboard"
          ),
      },
      error: {
        icon: "❌",
        title: "Terjadi Kesalahan",
        message:
          "Gagal memeriksa status verifikasi perusahaan. Silakan coba lagi.",
        buttonText: "Kembali ke Dashboard",
        buttonAction: () => router.push("/profile/recruiter/dashboard"),
      },
    };

    const config = blockConfig[blockReason] || blockConfig.error;

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">{config.icon}</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {config.title}
          </h1>
          <p className="text-gray-600 mb-6">{config.message}</p>
          <button
            onClick={config.buttonAction}
            className="w-full py-3 px-6 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
          >
            {config.buttonText}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Pasang Lowongan Baru
          </h1>
          <p className="text-gray-600">
            Buat lowongan pekerjaan untuk menarik kandidat terbaik
          </p>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition ${
                      currentStep === step.number
                        ? "bg-blue-600 text-white"
                        : currentStep > step.number
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {currentStep > step.number ? (
                      <Check className="w-6 h-6" />
                    ) : (
                      <step.icon className="w-6 h-6" />
                    )}
                  </div>
                  <span className="text-xs text-center mt-2 font-medium hidden md:block">
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-1 flex-1 mx-2 ${
                      currentStep > step.number ? "bg-green-500" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <form className="bg-white rounded-lg shadow-sm p-6">
          {/* Step 1: Informasi Lowongan */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Informasi Lowongan
              </h2>

              {/* Jumlah Posisi & Gender - Di Awal */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Jumlah Posisi yang Dibuka{" "}
                  <span className="text-red-500">*</span>
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jumlah Posisi Pria
                    </label>
                    <input
                      type="number"
                      name="malePositions"
                      value={formData.malePositions}
                      onChange={handleChange}
                      min="0"
                      className="w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jumlah Posisi Wanita
                    </label>
                    <input
                      type="number"
                      name="femalePositions"
                      value={formData.femalePositions}
                      onChange={handleChange}
                      min="0"
                      className="w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                </div>
                <p className="text-sm text-blue-700 mt-2">
                  Total posisi:{" "}
                  {(parseInt(formData.malePositions) || 0) +
                    (parseInt(formData.femalePositions) || 0)}{" "}
                  orang
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Posisi / Jabatan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Contoh: Frontend Developer"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipe Pekerjaan <span className="text-red-500">*</span>
                </label>
                <select
                  name="jobType"
                  value={formData.jobType}
                  onChange={handleChange}
                  className="w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="FULL_TIME">Full Time</option>
                  <option value="PART_TIME">Part Time</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deskripsi dan Tanggung Jawab{" "}
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={8}
                  className="w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Jelaskan tentang pekerjaan ini, lingkungan kerja, dan tanggung jawab utama..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Persyaratan Pendidikan
                </label>
                <select
                  name="educationLevel"
                  value={formData.educationLevel}
                  onChange={handleChange}
                  className="w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Tidak ada persyaratan khusus</option>
                  <option value="SMA">SMA/SMK</option>
                  <option value="D3">Diploma (D3)</option>
                  <option value="S1">Sarjana (S1)</option>
                  <option value="S2">Magister (S2)</option>
                  <option value="S3">Doktor (S3)</option>
                </select>
              </div>

              {/* Skills di Page Awal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skill yang Dibutuhkan <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
                    className="text-gray-900 flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Contoh: React, Node.js, Microsoft Office"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                {formData.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg"
                      >
                        <span className="font-medium">{skill}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(index)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Lokasi - Gabung di sini */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-gray-600" />
                  Lokasi Kerja
                </h3>

                {/* Job Scope Toggle */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Skup Lowongan <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <label
                      className={`p-4 border-2 rounded-xl cursor-pointer transition flex items-center gap-3 ${
                        formData.jobScope === "DOMESTIC"
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="jobScope"
                        value="DOMESTIC"
                        checked={formData.jobScope === "DOMESTIC"}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <span className="text-xl">🇮🇩</span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          Dalam Negeri
                        </div>
                        <div className="text-xs text-gray-500">
                          Lowongan di Indonesia
                        </div>
                      </div>
                    </label>
                    <label
                      className={`p-4 border-2 rounded-xl cursor-pointer transition flex items-center gap-3 ${
                        formData.jobScope === "INTERNATIONAL"
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="jobScope"
                        value="INTERNATIONAL"
                        checked={formData.jobScope === "INTERNATIONAL"}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-xl">🌍</span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          Luar Negeri
                        </div>
                        <div className="text-xs text-gray-500">
                          Lowongan internasional
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Remote Toggle */}
                <div className="mb-4">
                  <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 transition mb-3">
                    <input
                      type="checkbox"
                      name="isRemote"
                      checked={formData.isRemote}
                      onChange={handleChange}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <div>
                      <div className="font-medium text-gray-900">
                        Remote / Work From Home
                      </div>
                      <div className="text-sm text-gray-600">
                        Pekerjaan ini bisa dikerjakan dari rumah
                      </div>
                    </div>
                  </label>
                </div>

                {!formData.isRemote && (
                  <>
                    {/* Address Toggle */}
                    <div className="flex gap-4 mb-4">
                      <label
                        className={`flex-1 p-4 border-2 rounded-lg cursor-pointer transition ${
                          useCompanyAddress
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200"
                        }`}
                      >
                        <input
                          type="radio"
                          name="addressType"
                          checked={useCompanyAddress}
                          onChange={() => handleAddressToggle(true)}
                          className="sr-only"
                        />
                        <div className="font-medium text-gray-900">
                          Sama dengan Alamat Perusahaan
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {companyProfile?.address}, {companyProfile?.city}
                        </div>
                      </label>
                      <label
                        className={`flex-1 p-4 border-2 rounded-lg cursor-pointer transition ${
                          !useCompanyAddress
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200"
                        }`}
                      >
                        <input
                          type="radio"
                          name="addressType"
                          checked={!useCompanyAddress}
                          onChange={() => handleAddressToggle(false)}
                          className="sr-only"
                        />
                        <div className="font-medium text-gray-900">
                          Alamat Berbeda
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          Input alamat manual
                        </div>
                      </label>
                    </div>

                    {!useCompanyAddress && (
                      <>
                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Kecamatan <span className="text-red-500">*</span>
                            </label>
                            <select
                              name="kecamatan"
                              value={formData.kecamatan}
                              onChange={handleKecamatanChange}
                              className="w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              required
                            >
                              <option value="">Pilih Kecamatan</option>
                              {getAllKecamatan().map((kec) => (
                                <option key={kec} value={kec}>
                                  {kec}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Kelurahan/Desa{" "}
                              <span className="text-red-500">*</span>
                            </label>
                            <select
                              name="kelurahan"
                              value={formData.kelurahan}
                              onChange={handleKelurahanChange}
                              className="w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              required
                              disabled={!selectedKecamatan}
                            >
                              <option value="">
                                {selectedKecamatan
                                  ? "Pilih Kelurahan/Desa"
                                  : "Pilih Kecamatan Terlebih Dahulu"}
                              </option>
                              {kelurahanOptions.map((kel) => (
                                <option key={kel} value={kel}>
                                  {kel}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Preview Alamat */}
                        {formData.location && (
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-blue-800">
                              <span className="font-medium">
                                Alamat Lengkap:
                              </span>{" "}
                              {formData.location}
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Foto & Benefit */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Foto & Benefit
              </h2>

              {/* Job Photos Gallery Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Foto Lowongan (Opsional)
                </label>
                <p className="text-sm text-gray-500 mb-3">
                  Upload foto yang menggambarkan pekerjaan atau lingkungan kerja
                  (maksimal 5 foto)
                </p>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {/* Existing Photos */}
                  {(formData.gallery || []).map((photo, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group"
                    >
                      <img
                        src={photo}
                        alt={`Job Photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            gallery: prev.gallery.filter((_, i) => i !== index),
                            // Set first image as jobPhoto
                            jobPhoto:
                              index === 0
                                ? prev.gallery[1] || ""
                                : prev.jobPhoto,
                          }));
                        }}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 opacity-0 group-hover:opacity-100 transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      {index === 0 && (
                        <span className="absolute bottom-1 left-1 text-xs bg-blue-600 text-white px-2 py-0.5 rounded">
                          Utama
                        </span>
                      )}
                    </div>
                  ))}

                  {/* Add Photo Button */}
                  {(formData.gallery?.length || 0) < 5 && (
                    <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;

                          // Show loading
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
                                Authorization: `Bearer ${localStorage.getItem(
                                  "token"
                                )}`,
                              },
                              body: formDataUpload,
                            });

                            const data = await response.json();

                            if (response.ok && data.url) {
                              setFormData((prev) => {
                                const newGallery = [
                                  ...(prev.gallery || []),
                                  data.url,
                                ];
                                return {
                                  ...prev,
                                  gallery: newGallery,
                                  // Set first image as jobPhoto
                                  jobPhoto: newGallery[0] || "",
                                };
                              });
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
                        }}
                      />
                      <Plus className="w-8 h-8 text-gray-400 mb-1" />
                      <span className="text-xs text-gray-500">Tambah Foto</span>
                      <span className="text-xs text-gray-400 mt-1">
                        {formData.gallery?.length || 0}/5
                      </span>
                    </label>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Foto pertama akan menjadi foto utama lowongan
                </p>
              </div>

              {/* Salary Section - Optional */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Informasi Gaji (Opsional)
                </h3>

                {/* Toggle for showing salary */}
                <div className="mb-4">
                  <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 transition">
                    <input
                      type="checkbox"
                      name="showSalary"
                      checked={formData.showSalary}
                      onChange={handleChange}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <div>
                      <div className="font-medium text-gray-900">
                        Tampilkan Range Gaji
                      </div>
                      <div className="text-sm text-gray-600">
                        Jika tidak dicentang, gaji akan ditampilkan sebagai
                        "Negotiable"
                      </div>
                    </div>
                  </label>
                </div>

                {/* Salary inputs - only show if showSalary is checked */}
                {formData.showSalary && (
                  <div className="grid md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gaji Minimum
                      </label>
                      <RupiahInput
                        name="salaryMin"
                        value={formData.salaryMin}
                        onChange={handleChange}
                        placeholder="3.000.000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gaji Maksimum
                      </label>
                      <RupiahInput
                        name="salaryMax"
                        value={formData.salaryMax}
                        onChange={handleChange}
                        placeholder="5.000.000"
                      />
                    </div>
                    {formData.salaryMin && formData.salaryMax && (
                      <div className="md:col-span-2 text-sm text-green-700 bg-green-50 p-3 rounded-lg">
                        Preview:{" "}
                        <strong>
                          Rp {formatRupiah(formData.salaryMin)} -{" "}
                          {formatRupiah(formData.salaryMax)}
                        </strong>{" "}
                        /bulan
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 pt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Benefits & Fasilitas
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newBenefit}
                    onChange={(e) => setNewBenefit(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddBenefit();
                      }
                    }}
                    className="text-gray-900 flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Contoh: BPJS Kesehatan, Tunjangan Makan"
                  />
                  <button
                    type="button"
                    onClick={handleAddBenefit}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                {/* Quick Add Benefits */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {[
                    "BPJS Kesehatan",
                    "BPJS Ketenagakerjaan",
                    "Tunjangan Makan",
                    "Tunjangan Transport",
                    "THR",
                    "Bonus Tahunan",
                  ].map((benefit) => (
                    <button
                      key={benefit}
                      type="button"
                      onClick={() => {
                        if (!formData.benefits.includes(benefit)) {
                          setFormData((prev) => ({
                            ...prev,
                            benefits: [...prev.benefits, benefit],
                          }));
                        }
                      }}
                      className={`px-3 py-1 text-sm rounded-full transition ${
                        formData.benefits.includes(benefit)
                          ? "bg-green-100 text-green-700 cursor-not-allowed"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                      disabled={formData.benefits.includes(benefit)}
                    >
                      + {benefit}
                    </button>
                  ))}
                </div>

                {formData.benefits.length > 0 && (
                  <div className="space-y-2">
                    {formData.benefits.map((benefit, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <span className="text-gray-700">{benefit}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveBenefit(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Work Schedule Section */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Jadwal Kerja
                </h3>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hari Kerja
                    </label>
                    <input
                      type="text"
                      name="workingDays"
                      value={formData.workingDays}
                      onChange={handleChange}
                      className="w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Contoh: Senin - Jumat"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hari Libur
                    </label>
                    <input
                      type="text"
                      name="holidays"
                      value={formData.holidays}
                      onChange={handleChange}
                      className="w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Contoh: Sabtu - Minggu"
                    />
                  </div>
                </div>

                {/* Shift Work */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <input
                      type="checkbox"
                      id="isShift"
                      name="isShift"
                      checked={formData.isShift}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          isShift: e.target.checked,
                          shiftCount: e.target.checked ? prev.shiftCount : "",
                        }))
                      }
                      className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <label
                      htmlFor="isShift"
                      className="text-sm font-medium text-gray-700"
                    >
                      Pekerjaan ini menggunakan sistem shift
                    </label>
                  </div>

                  {formData.isShift && (
                    <div className="ml-8">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Jumlah Shift
                      </label>
                      <select
                        name="shiftCount"
                        value={formData.shiftCount}
                        onChange={handleChange}
                        className="w-full md:w-48 text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Pilih Jumlah Shift</option>
                        <option value="2">2 Shift</option>
                        <option value="3">3 Shift</option>
                        <option value="4">4 Shift</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Disability Friendly */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="isDisabilityFriendly"
                      name="isDisabilityFriendly"
                      checked={formData.isDisabilityFriendly}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          isDisabilityFriendly: e.target.checked,
                        }))
                      }
                      className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <label
                      htmlFor="isDisabilityFriendly"
                      className="text-sm font-medium text-gray-700"
                    >
                      Lowongan ini terbuka untuk penyandang disabilitas
                    </label>
                  </div>
                  <p className="text-xs text-blue-600 mt-2 ml-8">
                    Centang jika posisi ini dapat diisi oleh penyandang
                    disabilitas
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Review & Posting */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Review Lowongan
              </h2>

              {/* Preview Card */}
              <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
                {/* Job Photo Preview */}
                {formData.jobPhoto && (
                  <div className="w-full h-48 bg-gray-100">
                    <img
                      src={formData.jobPhoto}
                      alt="Job Photo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#03587f] to-[#024666] rounded-xl flex items-center justify-center text-2xl overflow-hidden">
                      {companyProfile?.logo ? (
                        <img
                          src={companyProfile.logo}
                          alt="Logo"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        "🏢"
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900">
                        {formData.title || "Posisi/Jabatan"}
                      </h3>
                      <p className="text-gray-600">
                        {companyProfile?.name || "Nama Perusahaan"}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                          <MapPin className="w-3 h-3 inline mr-1" />
                          {formData.city || companyProfile?.city || "Kota"}
                        </span>
                        {formData.showSalary &&
                        formData.salaryMin &&
                        formData.salaryMax ? (
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm">
                            Rp {formatRupiah(formData.salaryMin)} -{" "}
                            {formatRupiah(formData.salaryMax)}
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm">
                            Negotiable
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4 space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        Jumlah Posisi:
                      </span>
                      <span className="ml-2 text-gray-900">
                        {(parseInt(formData.malePositions) || 0) +
                          (parseInt(formData.femalePositions) || 0)}{" "}
                        orang ({formData.malePositions || 0} Pria,{" "}
                        {formData.femalePositions || 0} Wanita)
                      </span>
                    </div>
                    {formData.educationLevel && (
                      <div>
                        <span className="text-sm font-medium text-gray-500">
                          Pendidikan:
                        </span>
                        <span className="ml-2 text-gray-900">
                          {formData.educationLevel}
                        </span>
                      </div>
                    )}
                    {formData.skills.length > 0 && (
                      <div>
                        <span className="text-sm font-medium text-gray-500">
                          Skills:
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {formData.skills.map((skill, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {formData.benefits.length > 0 && (
                      <div>
                        <span className="text-sm font-medium text-gray-500">
                          Benefits:
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {formData.benefits.map((benefit, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs"
                            >
                              {benefit}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Deadline */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <label className="block text-sm font-medium text-orange-900 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Batas Akhir Lamaran <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="applicationDeadline"
                  value={formData.applicationDeadline}
                  onChange={handleChange}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full text-gray-900 px-4 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                  required
                />
                <p className="text-sm text-orange-700 mt-2">
                  Lowongan akan otomatis ditutup setelah tanggal ini
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
              disabled={currentStep === 1}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition ${
                currentStep === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
              Sebelumnya
            </button>

            {currentStep < steps.length ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => prev + 1)}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Selanjutnya
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSaving}
                className={`flex items-center gap-2 px-8 py-3 rounded-lg transition ${
                  isSaving
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Mempublikasikan...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Posting Lowongan
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
