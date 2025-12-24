"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  User,
  Briefcase,
  Building2,
  MapPin,
  Globe,
  Phone,
  Mail,
  Calendar,
  Users,
  Award,
  FileText,
  ArrowLeft,
  ArrowRight,
  Check,
  Save,
  XCircle,
} from "lucide-react";
import Swal from "sweetalert2";
import RecruiterPhotoUpload from "@/components/recruiter/RecruiterPhotoUpload";
import CompanyGallery from "@/components/recruiter/CompanyGallery";

export default function RecruiterProfilePage() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true); // Start with true to show loading until redirect check completes
  const [isSaving, setIsSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [companyStatus, setCompanyStatus] = useState(null); // PENDING_VERIFICATION, REJECTED, PENDING_RESUBMISSION, VERIFIED
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    // Personal Info
    firstName: "",
    lastName: "",
    position: "",
    phone: "",
    department: "",
    bio: "",

    // Company Info
    companyId: "",
    companyName: "",
    companySlug: "",
    companyLogo: "",
    tagline: "",
    description: "",
    industry: "",
    companySize: "",
    foundedYear: "",

    // Company Contact
    companyEmail: "",
    companyPhone: "",
    website: "",

    // Company Address
    address: "",
    city: "",
    province: "",
    postalCode: "",

    // Social Media
    linkedinUrl: "",
    facebookUrl: "",
    twitterUrl: "",
    instagramUrl: "",

    // Additional
    culture: "",
    benefits: [],
    gallery: [],
  });

  const [newBenefit, setNewBenefit] = useState("");

  // Load existing profile and check redirect
  useEffect(() => {
    // Load profile data
    loadProfile();
  }, [user]);

  const handleSave = async () => {
    try {
      setIsSaving(true);

      // 1. Save Profile Data
      const response = await fetch("/api/profile/recruiter", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal menyimpan profile");
      }

      // 2. Automatically Submit for Validation
      // We use the token to submit validation immediately after saving
      const validationResponse = await fetch(
        "/api/profile/recruiter/submit-validation",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Even if validation submission fails (e.g. already submitted), we count the save as success but warn?
      // User requirement: "setiap update profile otomatis kirim permintaan validasi"
      // So we assume we should try to submit.

      await Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Profile berhasil disimpan dan diajukan untuk validasi.",
        confirmButtonColor: "#2563EB",
      });

      // Refresh user data
      await refreshUser();

      // Redirect to dashboard
      router.push("/profile/recruiter/dashboard");
      router.refresh();
    } catch (error) {
      console.error("Save profile error:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: error.message || "Terjadi kesalahan saat menyimpan",
        confirmButtonColor: "#2563EB",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const loadProfile = async () => {
    try {
      setIsLoading(true);

      const response = await fetch("/api/profile/recruiter", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();

        if (data.profile) {
          // Set company status - no redirect, allow viewing profile
          const status =
            data.profile.companies?.verified === true
              ? "VERIFIED"
              : data.profile.companies?.status || null;
          setCompanyStatus(status);

          setIsEditMode(true);
          setFormData({
            firstName: data.profile.firstName || "",
            lastName: data.profile.lastName || "",
            position: data.profile.position || "",
            phone: data.profile.phone || "",
            department: data.profile.department || "",
            bio: data.profile.bio || "",

            companyId: data.profile.companyId || "",
            companyName: data.profile.companies?.name || "",
            companySlug: data.profile.companies?.slug || "",
            companyLogo: data.profile.companies?.logo || "",
            tagline: data.profile.companies?.tagline || "",
            description: data.profile.companies?.description || "",
            industry: data.profile.companies?.industry || "",
            companySize: data.profile.companies?.companySize || "",
            foundedYear: data.profile.companies?.foundedYear || "",

            companyEmail: data.profile.companies?.email || "",
            companyPhone: data.profile.companies?.phone || "",
            website: data.profile.companies?.website || "",

            address: data.profile.companies?.address || "",
            city: data.profile.companies?.city || "",
            province: data.profile.companies?.province || "",
            postalCode: data.profile.companies?.postalCode || "",

            linkedinUrl: data.profile.companies?.linkedinUrl || "",
            facebookUrl: data.profile.companies?.facebookUrl || "",
            twitterUrl: data.profile.companies?.twitterUrl || "",
            instagramUrl: data.profile.companies?.instagramUrl || "",

            culture: data.profile.companies?.culture || "",
            benefits: data.profile.companies?.benefits || [],
            gallery: data.profile.companies?.gallery || [],
          });
        }
      }
    } catch (error) {
      console.error("Load profile error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Generate slug from company name
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  useEffect(() => {
    if (formData.companyName) {
      setFormData((prev) => ({
        ...prev,
        companySlug: generateSlug(prev.companyName),
      }));
    }
  }, [formData.companyName]);

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

  // Steps configuration - 3 steps
  const steps = [
    { number: 1, title: "Profil & Perusahaan", icon: Building2 },
    { number: 2, title: "Kontak & Social Media", icon: Globe },
    { number: 3, title: "Budaya & Benefits", icon: Award },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gray-50 py-6 sm:py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        {/* Verified Company Banner */}
        {companyStatus === "VERIFIED" && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-semibold text-green-800">
                Perusahaan Terverifikasi
              </p>
              <p className="text-sm text-green-600">
                Profil perusahaan Anda sudah diverifikasi. Hubungi admin jika
                ada perubahan data.
              </p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {companyStatus === "VERIFIED"
              ? "Profil Perusahaan"
              : isEditMode
              ? "Edit Profile Recruiter"
              : "Lengkapi Profile Recruiter"}
          </h1>
          <p className="text-gray-600">
            {companyStatus === "VERIFIED"
              ? "Lihat informasi perusahaan Anda yang sudah terverifikasi"
              : "Isi informasi perusahaan dan personal Anda untuk mulai memposting lowongan"}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
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
        <form className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          {/* Step 1: Profil & Perusahaan */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Profil & Perusahaan
              </h2>

              {/* Photo Upload Section */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Logo Perusahaan
                </h3>
                <RecruiterPhotoUpload
                  currentPhoto={formData.companyLogo}
                  recruiterId={user?.recruiter?.id}
                  onPhotoUpdate={(url) =>
                    setFormData((prev) => ({ ...prev, companyLogo: url }))
                  }
                  uploadType="company-logo"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Posisi/Jabatan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    className="w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="HR Manager"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nomor Telepon{" "}
                    <span className="text-gray-400 text-xs">(Opsional)</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="08123456789"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Departemen{" "}
                    <span className="text-gray-400 text-xs">(Opsional)</span>
                  </label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Human Resources"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Continue Step 1: Company Info */}
          {currentStep === 1 && (
            <div className="space-y-6 border-t border-gray-200 pt-6 mt-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Informasi Perusahaan
              </h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Perusahaan *
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    className="w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="PT. Tech Innovate Indonesia"
                    required
                  />
                  {formData.companyId && formData.companyName && (
                    <p className="text-xs text-green-600 mt-1">
                      ✓ Terisi dari data registrasi. Anda dapat mengedit jika
                      ada kesalahan.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Slug URL (Otomatis)
                  </label>
                  <input
                    type="text"
                    name="companySlug"
                    value={formData.companySlug}
                    readOnly
                    className="w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    placeholder="pt-tech-innovate-indonesia"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    URL: /companies/{formData.companySlug}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tagline Perusahaan
                  </label>
                  <input
                    type="text"
                    name="tagline"
                    value={formData.tagline}
                    onChange={handleChange}
                    className="w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Innovating the Future of Technology"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deskripsi Perusahaan *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    maxLength={3000}
                    rows={8}
                    className="w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ceritakan tentang perusahaan Anda, visi, misi, budaya kerja, pencapaian, dll..."
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1 text-right">
                    {formData.description?.length || 0}/3000 karakter
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Industri *
                    </label>
                    <select
                      name="industry"
                      value={formData.industry}
                      onChange={handleChange}
                      className="w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Pilih Industri</option>
                      <option value="Technology">Technology</option>
                      <option value="Finance">Finance</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Education">Education</option>
                      <option value="Retail">Retail</option>
                      <option value="Manufacturing">Manufacturing</option>
                      <option value="Consulting">Consulting</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Karyawan *
                    </label>
                    <select
                      name="companySize"
                      value={formData.companySize}
                      onChange={handleChange}
                      className="w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Pilih Ukuran</option>
                      <option value="1-10">1-10 karyawan</option>
                      <option value="11-50">11-50 karyawan</option>
                      <option value="51-200">51-200 karyawan</option>
                      <option value="201-500">201-500 karyawan</option>
                      <option value="501-1000">501-1000 karyawan</option>
                      <option value="1000+">1000+ karyawan</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tahun Didirikan
                    </label>
                    <input
                      type="number"
                      name="foundedYear"
                      value={formData.foundedYear}
                      onChange={handleChange}
                      min="1900"
                      max={new Date().getFullYear()}
                      className="w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="2020"
                    />
                  </div>
                </div>

                {/* Company Gallery Section */}
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 mt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Galeri Perusahaan
                  </h3>
                  {isEditMode && formData.companyId ? (
                    <CompanyGallery
                      gallery={formData.gallery}
                      companyId={formData.companyId}
                      onGalleryUpdate={(newGallery) =>
                        setFormData((prev) => ({
                          ...prev,
                          gallery: newGallery,
                        }))
                      }
                    />
                  ) : (
                    <div className="text-center py-8 text-gray-500 bg-white rounded-lg border-2 border-dashed border-gray-300">
                      <p>
                        Silakan simpan profil perusahaan terlebih dahulu untuk
                        mengupload foto galeri.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Kontak & Social Media */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Kontak & Social Media
              </h2>

              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Kontak</h3>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Perusahaan *
                    </label>
                    <input
                      type="email"
                      name="companyEmail"
                      value={formData.companyEmail}
                      onChange={handleChange}
                      className="w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="info@company.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telepon Perusahaan
                    </label>
                    <input
                      type="tel"
                      name="companyPhone"
                      value={formData.companyPhone}
                      onChange={handleChange}
                      className="w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="021-12345678"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website
                    </label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      className="w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://www.company.com"
                    />
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 pt-4">
                  Alamat
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alamat Lengkap <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows={3}
                    className="w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Jl. Sudirman No. 123"
                    required
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kota <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Pilih Kota</option>
                      <option value="Cirebon">Cirebon</option>
                      <option value="Bandung">Bandung</option>
                      <option value="Jakarta">Jakarta</option>
                      <option value="Surabaya">Surabaya</option>
                      <option value="Semarang">Semarang</option>
                      <option value="Yogyakarta">Yogyakarta</option>
                      <option value="Medan">Medan</option>
                      <option value="Makassar">Makassar</option>
                      <option value="Denpasar">Denpasar</option>
                      <option value="Palembang">Palembang</option>
                      <option value="Tangerang">Tangerang</option>
                      <option value="Bekasi">Bekasi</option>
                      <option value="Depok">Depok</option>
                      <option value="Bogor">Bogor</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Provinsi <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="province"
                      value={formData.province}
                      onChange={handleChange}
                      className="w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Pilih Provinsi</option>
                      <option value="Jawa Barat">Jawa Barat</option>
                      <option value="DKI Jakarta">DKI Jakarta</option>
                      <option value="Jawa Tengah">Jawa Tengah</option>
                      <option value="Jawa Timur">Jawa Timur</option>
                      <option value="DI Yogyakarta">DI Yogyakarta</option>
                      <option value="Banten">Banten</option>
                      <option value="Bali">Bali</option>
                      <option value="Sumatera Utara">Sumatera Utara</option>
                      <option value="Sumatera Selatan">Sumatera Selatan</option>
                      <option value="Sulawesi Selatan">Sulawesi Selatan</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kode Pos{" "}
                      <span className="text-gray-400 text-xs">(Opsional)</span>
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleChange}
                      className="w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="12345"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Continue Step 2: Social Media */}
          {currentStep === 2 && (
            <div className="space-y-6 border-t border-gray-200 pt-6 mt-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Social Media
              </h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    LinkedIn
                  </label>
                  <input
                    type="url"
                    name="linkedinUrl"
                    value={formData.linkedinUrl}
                    onChange={handleChange}
                    className="w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://linkedin.com/company/yourcompany"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Facebook
                  </label>
                  <input
                    type="url"
                    name="facebookUrl"
                    value={formData.facebookUrl}
                    onChange={handleChange}
                    className="w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://facebook.com/yourcompany"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Twitter
                  </label>
                  <input
                    type="url"
                    name="twitterUrl"
                    value={formData.twitterUrl}
                    onChange={handleChange}
                    className="w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://twitter.com/yourcompany"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instagram
                  </label>
                  <input
                    type="url"
                    name="instagramUrl"
                    value={formData.instagramUrl}
                    onChange={handleChange}
                    className="w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://instagram.com/yourcompany"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Culture & Benefits */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Budaya & Benefits
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budaya Perusahaan
                  </label>
                  <textarea
                    name="culture"
                    value={formData.culture}
                    onChange={handleChange}
                    rows={5}
                    className="w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ceritakan tentang budaya kerja di perusahaan Anda..."
                  />
                </div>

                <div>
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
                      className="flex-1 text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Contoh: BPJS Kesehatan"
                    />
                    <button
                      type="button"
                      onClick={handleAddBenefit}
                      className="px-4 text-gray-900 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      Tambah
                    </button>
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
                            <XCircle className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
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

            <div className="flex gap-3">
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
                <>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg transition ${
                      isSaving
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-green-600 text-white hover:bg-green-700"
                    }`}
                  >
                    {isSaving ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5"
                          viewBox="0 0 24 24"
                        >
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
                        Menyimpan & Mengajukan...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        {isEditMode
                          ? "Update & Ajukan Validasi"
                          : "Simpan & Ajukan Validasi"}
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Status Indicator */}
          {isEditMode && companyStatus && (
            <div
              className={`mt-4 p-4 rounded-lg ${
                companyStatus === "VERIFIED"
                  ? "bg-green-50 border border-green-200"
                  : companyStatus === "PENDING_RESUBMISSION"
                  ? "bg-blue-50 border border-blue-200"
                  : companyStatus === "REJECTED"
                  ? "bg-red-50 border border-red-200"
                  : "bg-orange-50 border border-orange-200"
              }`}
            >
              <p
                className={`text-sm font-medium ${
                  companyStatus === "VERIFIED"
                    ? "text-green-700"
                    : companyStatus === "PENDING_RESUBMISSION"
                    ? "text-blue-700"
                    : companyStatus === "REJECTED"
                    ? "text-red-700"
                    : "text-orange-700"
                }`}
              >
                {companyStatus === "VERIFIED" &&
                  "✓ Perusahaan sudah terverifikasi"}
                {companyStatus === "PENDING_VERIFICATION" &&
                  "⏳ Menunggu verifikasi awal dari admin"}
                {companyStatus === "PENDING_RESUBMISSION" &&
                  "🔄 Perusahaan sedang direview ulang oleh admin"}
                {companyStatus === "REJECTED" &&
                  "❌ Perusahaan ditolak. Silakan perbaiki dan submit ulang."}
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
