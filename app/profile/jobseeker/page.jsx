"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Swal from "sweetalert2";
import {
  User,
  Star,
  Briefcase,
  GraduationCap,
  Award,
  FileText,
  CheckCircle,
  Upload,
  X,
  Plus,
  Calendar,
  Phone,
  Mail,
  Globe,
  Linkedin,
  Github,
  ChevronRight,
  ChevronLeft,
  Save,
  ArrowLeft,
  Eye,
  Camera,
  MapPin,
  Building2,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import RupiahInput from "@/components/RupiahInput";
import DataDiriStep from "./components/DataDiriStep";
import DokumenStep from "./components/DokumenStep";

function JobseekerProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);

  // Format helpers
  const formatRupiah = (value) => {
    if (!value) return "";
    const number = value.toString().replace(/[^0-9]/g, "");
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const [formData, setFormData] = useState({
    // Personal Info
    photo: null,
    photoPreview: null,
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    religion: "",
    maritalStatus: "",
    nationality: "Indonesia",
    idNumber: "",

    // Contact Info
    phone: "",
    email: "",
    address: "",
    city: "",
    province: "",
    postalCode: "",

    // Alamat Cirebon
    kecamatan: "",
    kelurahan: "",

    // Professional Info
    currentTitle: "",
    summary: "",
    linkedinUrl: "",
    githubUrl: "",
    portfolioUrl: "",
    websiteUrl: "",

    // CV & Documents
    cvFile: null,
    cvFileName: "",
    cvUrl: "",
    ktpFile: null,
    ktpFileName: "",
    ktpUrl: "",
    ak1File: null,
    ak1FileName: "",
    ak1Url: "",
    ijazahFile: null,
    ijazahFileName: "",
    ijazahUrl: "",

    // Additional Documents (Optional)
    sertifikatFile: null,
    sertifikatFileName: "",
    sertifikatUrl: "",
    suratPengalamanFile: null,
    suratPengalamanFileName: "",
    suratPengalamanUrl: "",

    // Education (Simplified - Last Education Only)
    lastEducationLevel: "",
    lastEducationInstitution: "",
    lastEducationMajor: "",
    graduationYear: "",

    // Education
    educations: [
      {
        institution: "",
        degree: "",
        fieldOfStudy: "",
        level: "",
        startDate: "",
        endDate: "",
        gpa: "",
        isCurrent: false,
        diplomaFile: null,
        diplomaFileName: "",
        diplomaUrl: "",
      },
    ],

    // Work Experience
    experiences: [
      {
        company: "",
        position: "",
        location: "",
        startDate: "",
        endDate: "",
        isCurrent: false,
        description: "",
        achievements: [""],
      },
    ],

    // Skills
    skills: [""],

    // Certifications
    certifications: [
      {
        name: "",
        issuingOrganization: "",
        issueDate: "",
        expiryDate: "",
        credentialId: "",
        credentialUrl: "",
        certificateFile: null,
        certificateFileName: "",
        certificateUrl: "",
      },
    ],

    // Preferences
    desiredJobTitle: "",
    desiredSalaryMin: "",
    desiredSalaryMax: "",
    preferredLocation: "",
    preferredJobType: "",
    willingToRelocate: false,
    availableFrom: "",
  });

  // Steps configuration (simplified to 2 steps)
  const steps = [
    {
      number: 1,
      id: "datadiri",
      title: "Data Diri",
      subtitle: "Info Pribadi & Kontak",
      icon: User,
      color: "text-blue-600",
      bg: "bg-blue-100",
      gradient: "from-[#03587f] to-[#024666]",
    },
    {
      number: 2,
      id: "dokumen",
      title: "Dokumen",
      subtitle: "Upload Berkas",
      icon: FileText,
      color: "text-emerald-600",
      bg: "bg-emerald-100",
      gradient: "from-emerald-500 to-teal-600",
    },
  ];

  const totalSteps = steps.length;

  useEffect(() => {
    const mode = searchParams.get("mode");
    if (mode === "edit") setIsEditMode(true);
    loadProfile();
  }, [searchParams]);

  const loadProfile = async () => {
    try {
      const response = await fetch("/api/profile/jobseeker", {
        credentials: "include",
      });
      const data = await response.json();
      if (response.ok && data.profile) {
        const profile = data.profile;
        const formatMonthDate = (d) =>
          d ? new Date(d).toISOString().slice(0, 7) : "";
        const formatDate = (d) =>
          d ? new Date(d).toISOString().split("T")[0] : "";

        setFormData({
          // Personal Info
          photo: profile.photo,
          photoPreview: profile.photo,
          firstName: profile.firstName || "",
          lastName: profile.lastName || "",
          dateOfBirth: formatDate(profile.dateOfBirth) || "",
          gender: profile.gender || "",
          religion: profile.religion || "",
          maritalStatus: profile.maritalStatus || "",
          nationality: profile.nationality || "Indonesia",
          idNumber: profile.idNumber || "",

          // Contact Info
          phone: profile.phone || "",
          email: profile.email || "",
          address: profile.address || "",
          city: profile.city || "",
          province: profile.province || "",
          postalCode: profile.postalCode || "",

          // Professional Info
          currentTitle: profile.currentTitle || "",
          summary: profile.summary || "",
          linkedinUrl: profile.linkedinUrl || "",
          githubUrl: profile.githubUrl || "",
          portfolioUrl: profile.portfolioUrl || "",
          websiteUrl: profile.websiteUrl || "",

          // CV & Documents
          cvUrl: profile.cvUrl || "",
          cvFileName: profile.cvUrl ? "CV.pdf" : "",
          ktpUrl: profile.ktpUrl || "",
          ktpFileName: profile.ktpUrl ? "KTP.pdf" : "",
          ak1Url: profile.ak1Url || "",
          ak1FileName: profile.ak1Url ? "Kartu AK-1.pdf" : "",

          // Education
          educations:
            profile.educations && profile.educations.length > 0
              ? profile.educations.map((edu) => ({
                  institution: edu.institution || "",
                  degree: edu.degree || "",
                  fieldOfStudy: edu.fieldOfStudy || "",
                  level: edu.level || "",
                  startDate: formatMonthDate(edu.startDate) || "",
                  endDate: formatMonthDate(edu.endDate) || "",
                  gpa: edu.gpa?.toString() || "",
                  isCurrent: edu.isCurrent || false,
                  diplomaUrl: edu.diplomaUrl || "",
                  diplomaFileName: edu.diplomaUrl ? "Ijazah.pdf" : "",
                }))
              : [
                  {
                    institution: "",
                    degree: "",
                    fieldOfStudy: "",
                    level: "",
                    startDate: "",
                    endDate: "",
                    gpa: "",
                    isCurrent: false,
                    diplomaFileName: "",
                    diplomaUrl: "",
                  },
                ],

          // Work Experience
          experiences:
            profile.work_experiences && profile.work_experiences.length > 0
              ? profile.work_experiences.map((exp) => ({
                  company: exp.company || "",
                  position: exp.position || "",
                  location: exp.location || "",
                  startDate: formatMonthDate(exp.startDate) || "",
                  endDate: formatMonthDate(exp.endDate) || "",
                  isCurrent: exp.isCurrent || false,
                  description: exp.description || "",
                  achievements:
                    exp.achievements && exp.achievements.length > 0
                      ? exp.achievements
                      : [""],
                }))
              : [
                  {
                    company: "",
                    position: "",
                    location: "",
                    startDate: "",
                    endDate: "",
                    isCurrent: false,
                    description: "",
                    achievements: [""],
                  },
                ],

          // Skills
          skills:
            profile.skills && profile.skills.length > 0
              ? profile.skills.map((s) => s.name)
              : [""],

          // Certifications
          certifications:
            profile.certifications && profile.certifications.length > 0
              ? profile.certifications.map((cert) => ({
                  name: cert.name || "",
                  issuingOrganization: cert.issuingOrganization || "",
                  issueDate: formatMonthDate(cert.issueDate) || "",
                  expiryDate: formatMonthDate(cert.expiryDate) || "",
                  credentialId: cert.credentialId || "",
                  credentialUrl: cert.credentialUrl || "",
                  certificateUrl: cert.certificateUrl || "",
                  certificateFileName: cert.certificateUrl
                    ? "Sertifikat.pdf"
                    : "",
                }))
              : [
                  {
                    name: "",
                    issuingOrganization: "",
                    issueDate: "",
                    expiryDate: "",
                    credentialId: "",
                    credentialUrl: "",
                    certificateFileName: "",
                    certificateUrl: "",
                  },
                ],

          // Job Preferences
          desiredJobTitle: profile.desiredJobTitle || "",
          desiredSalaryMin: profile.desiredSalaryMin?.toString() || "",
          desiredSalaryMax: profile.desiredSalaryMax?.toString() || "",
          preferredLocation: profile.preferredLocation || "",
          preferredJobType: profile.preferredJobType || "",
          willingToRelocate: profile.willingToRelocate || false,
          availableFrom: formatDate(profile.availableFrom) || "",
        });
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  // Upload Logic
  const uploadFile = async (file, bucket) => {
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize)
      throw new Error(`Ukuran file terlalu besar. Maksimal 2MB.`);

    const formDataUpload = new FormData();
    formDataUpload.append("file", file);
    formDataUpload.append("bucket", bucket);
    formDataUpload.append("userId", user?.id || "");

    const response = await fetch("/api/upload", {
      method: "POST",
      credentials: "include",
      body: formDataUpload,
    });

    if (!response.ok) {
      const error = await response.json();
      if (error.error?.includes("exceeded the maximum allowed size")) {
        throw new Error("Ukuran file melebihi batas maksimal (2MB).");
      }
      throw new Error(error.error || "Upload failed");
    }
    return await response.json();
  };

  // Upload Handlers
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setIsUploading(true);
      setUploadProgress({ photo: 20 });
      const reader = new FileReader();
      reader.onloadend = () =>
        setFormData((prev) => ({ ...prev, photoPreview: reader.result }));
      reader.readAsDataURL(file);
      setUploadProgress({ photo: 50 });
      const result = await uploadFile(file, "Profile");
      setFormData((prev) => ({ ...prev, photo: result.url, photoFile: file }));
      setUploadProgress({ photo: 100 });
      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        timer: 1500,
        showConfirmButton: false,
      });
      setTimeout(() => setUploadProgress({}), 1000);
    } catch (err) {
      Swal.fire({ icon: "error", text: err.message });
    } finally {
      setIsUploading(false);
      setUploadProgress({});
    }
  };

  const handleCVUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setIsUploading(true);
      setUploadProgress({ cv: 50 });
      const result = await uploadFile(file, "jobseeker-cv");
      setFormData((prev) => ({
        ...prev,
        cvFile: file,
        cvFileName: file.name,
        cvUrl: result.url,
      }));
      Swal.fire({
        icon: "success",
        title: "CV Uploaded!",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (e) {
      Swal.fire({ icon: "error", text: e.message });
    } finally {
      setIsUploading(false);
      setUploadProgress({});
    }
  };

  const handleKTPUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setIsUploading(true);
      setUploadProgress({ ktp: 50 });
      const result = await uploadFile(file, "jobseeker-documents");
      setFormData((prev) => ({
        ...prev,
        ktpFile: file,
        ktpFileName: file.name,
        ktpUrl: result.url,
      }));
      Swal.fire({
        icon: "success",
        title: "KTP Uploaded!",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (e) {
      Swal.fire({ icon: "error", text: e.message });
    } finally {
      setIsUploading(false);
      setUploadProgress({});
    }
  };

  const handleAK1Upload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setIsUploading(true);
      setUploadProgress({ ak1: 50 });
      const result = await uploadFile(file, "jobseeker-documents");
      setFormData((prev) => ({
        ...prev,
        ak1File: file,
        ak1FileName: file.name,
        ak1Url: result.url,
      }));
      Swal.fire({
        icon: "success",
        title: "AK-1 Uploaded!",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (e) {
      Swal.fire({ icon: "error", text: e.message });
    } finally {
      setIsUploading(false);
      setUploadProgress({});
    }
  };

  const handleSertifikatUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setIsUploading(true);
      setUploadProgress({ sertifikat: 50 });
      const result = await uploadFile(file, "jobseeker-documents");
      setFormData((prev) => ({
        ...prev,
        sertifikatFile: file,
        sertifikatFileName: file.name,
        sertifikatUrl: result.url,
      }));
      Swal.fire({
        icon: "success",
        title: "Sertifikat Uploaded!",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (e) {
      Swal.fire({ icon: "error", text: e.message });
    } finally {
      setIsUploading(false);
      setUploadProgress({});
    }
  };

  const handleIjazahUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setIsUploading(true);
      setUploadProgress({ ijazah: 50 });
      const result = await uploadFile(file, "jobseeker-documents");
      setFormData((prev) => ({
        ...prev,
        ijazahFile: file,
        ijazahFileName: file.name,
        ijazahUrl: result.url,
      }));
      Swal.fire({
        icon: "success",
        title: "Ijazah Uploaded!",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (e) {
      Swal.fire({ icon: "error", text: e.message });
    } finally {
      setIsUploading(false);
      setUploadProgress({});
    }
  };

  const handleSuratPengalamanUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setIsUploading(true);
      setUploadProgress({ suratPengalaman: 50 });
      const result = await uploadFile(file, "jobseeker-documents");
      setFormData((prev) => ({
        ...prev,
        suratPengalamanFile: file,
        suratPengalamanFileName: file.name,
        suratPengalamanUrl: result.url,
      }));
      Swal.fire({
        icon: "success",
        title: "Surat Pengalaman Uploaded!",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (e) {
      Swal.fire({ icon: "error", text: e.message });
    } finally {
      setIsUploading(false);
      setUploadProgress({});
    }
  };

  const handleDiplomaUpload = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setIsUploading(true);
      setUploadProgress({ [`diploma-${index}`]: 50 });
      const result = await uploadFile(file, "jobseeker-diploma");
      handleArrayChange(index, "diplomaFile", file, "educations");
      handleArrayChange(index, "diplomaFileName", file.name, "educations");
      handleArrayChange(index, "diplomaUrl", result.url, "educations");
      Swal.fire({
        icon: "success",
        title: "Ijazah Uploaded!",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (e) {
      Swal.fire({ icon: "error", text: e.message });
    } finally {
      setIsUploading(false);
    }
  };

  const handleCertificateUpload = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setIsUploading(true);
      setUploadProgress({ [`cert-${index}`]: 50 });
      const result = await uploadFile(file, "jobseeker-certificate");
      handleArrayChange(index, "certificateFile", file, "certifications");
      handleArrayChange(
        index,
        "certificateFileName",
        file.name,
        "certifications"
      );
      handleArrayChange(index, "certificateUrl", result.url, "certifications");
      Swal.fire({
        icon: "success",
        title: "Sertifikat Uploaded!",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (e) {
      Swal.fire({ icon: "error", text: e.message });
    } finally {
      setIsUploading(false);
    }
  };

  // State Updates
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleArrayChange = (index, field, value, arrayName) => {
    setFormData((prev) => ({
      ...prev,
      [arrayName]: prev[arrayName].map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addArrayItem = (arrayName, defaultItem) => {
    setFormData((prev) => ({
      ...prev,
      [arrayName]: [...prev[arrayName], defaultItem],
    }));
  };

  const removeArrayItem = (index, arrayName) => {
    setFormData((prev) => ({
      ...prev,
      [arrayName]: prev[arrayName].filter((_, i) => i !== index),
    }));
  };

  const handleNestedArrayChange = (
    parentIndex,
    childIndex,
    value,
    parentArray,
    childArray
  ) => {
    setFormData((prev) => ({
      ...prev,
      [parentArray]: prev[parentArray].map((item, i) =>
        i === parentIndex
          ? {
              ...item,
              [childArray]: item[childArray].map((child, j) =>
                j === childIndex ? value : child
              ),
            }
          : item
      ),
    }));
  };

  const addNestedArrayItem = (
    parentIndex,
    parentArray,
    childArray,
    defaultValue
  ) => {
    setFormData((prev) => ({
      ...prev,
      [parentArray]: prev[parentArray].map((item, i) =>
        i === parentIndex
          ? { ...item, [childArray]: [...item[childArray], defaultValue] }
          : item
      ),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await Swal.fire({
      title: isEditMode ? "Update Profile?" : "Simpan Profile?",
      text: "Pastikan semua informasi sudah benar",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: isEditMode ? "Ya, Update!" : "Ya, Simpan!",
      confirmButtonColor: "#3b82f6",
    });

    if (!result.isConfirmed) return;
    setIsSaving(true);

    try {
      const payload = {
        ...formData,
        skills: formData.skills.filter((s) => s), // Clean skills
      };

      const response = await fetch("/api/profile/jobseeker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to save");

      await Swal.fire({
        icon: "success",
        title: "Berhasil!",
        html: `<p>Profile berhasil disimpan!</p><p class="mt-2 font-bold text-blue-600">Kelengkapan: ${data.completeness}%</p>`,
        confirmButtonColor: "#3b82f6",
      });
      router.push("/profile/jobseeker/view");
    } catch (error) {
      Swal.fire({ icon: "error", title: "Gagal", text: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  // Helper to calculate age
  const calculateAge = (birthDate) => {
    if (!birthDate) return "";
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  // Render Form Content
  const renderCurrentStep = () => {
    const commonProps = {
      formData,
      handleInputChange,
      handleArrayChange,
      addArrayItem,
      removeArrayItem,
      isUploading,
      uploadProgress,
      handleNestedArrayChange,
      addNestedArrayItem,
    };
    switch (currentStep) {
      case 1:
        return (
          <DataDiriStep
            formData={formData}
            handleInputChange={handleInputChange}
            handlePhotoUpload={handlePhotoUpload}
            uploadProgress={uploadProgress}
            isUploading={isUploading}
          />
        );
      case 2:
        return (
          <DokumenStep
            formData={formData}
            handleCVUpload={handleCVUpload}
            handleKTPUpload={handleKTPUpload}
            handleAK1Upload={handleAK1Upload}
            handleIjazahUpload={handleIjazahUpload}
            handleSertifikatUpload={handleSertifikatUpload}
            handleSuratPengalamanUpload={handleSuratPengalamanUpload}
            uploadProgress={uploadProgress}
            isUploading={isUploading}
            setFormData={setFormData}
          />
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Memuat profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Gradient Header Background */}
      <div className="bg-gradient-to-br from-[#03587f] via-[#046a96] to-[#024666] pt-24 pb-12 rounded-b-[40px] shadow-2xl">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 text-white">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl transition border border-white/10 shadow-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                  <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-yellow-300 drop-shadow-md" />
                  {isEditMode
                    ? "Edit Profil Profesional"
                    : "Lengkapi Profil Profesional"}
                </h1>
                <p className="text-blue-100 mt-1 font-medium opacity-90 text-sm md:text-base">
                  Tingkatkan peluang karir Anda dengan profil yang menonjol
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push("/profile/jobseeker/view")}
              className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-white text-blue-700 rounded-xl hover:bg-blue-50 transition shadow-xl font-semibold transform hover:-translate-y-0.5"
            >
              <Eye className="w-5 h-5" />
              Lihat Profil
            </button>
          </div>
          {/* Close gradient section */}
        </div>
        {/* Close gradient wrapper */}
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto px-4 max-w-7xl -mt-6 pb-20 relative z-10">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-3 space-y-6 sticky top-8 z-10">
            {/* Steps Card */}
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl shadow-indigo-900/5 border border-white/50 overflow-hidden">
              <div className="p-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 font-bold text-gray-500 text-xs uppercase tracking-wider flex items-center justify-between">
                <span>Langkah Pengisian</span>
                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px]">
                  {Math.round((currentStep / totalSteps) * 100)}%
                </span>
              </div>
              <div className="p-2 space-y-1 max-h-[calc(100vh-250px)] overflow-y-auto custom-scrollbar">
                {steps.map((step) => {
                  const isActive = currentStep === step.number;
                  const isCompleted = currentStep > step.number;
                  return (
                    <button
                      key={step.number}
                      onClick={() => setCurrentStep(step.number)}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all duration-200 group cursor-pointer ${
                        isActive
                          ? "bg-blue-50/80 shadow-sm ring-1 ring-blue-100"
                          : isCompleted
                          ? "hover:bg-gray-50"
                          : "hover:bg-gray-50/50"
                      }`}
                    >
                      <div
                        className={`
                                w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300 relative overflow-hidden
                                ${
                                  isActive
                                    ? `bg-gradient-to-br ${step.gradient} text-white shadow-md scale-105`
                                    : isCompleted
                                    ? "bg-green-100 text-green-600"
                                    : "bg-gray-100 text-gray-400"
                                }
                            `}
                      >
                        {isCompleted ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <step.icon className="w-4 h-4" />
                        )}
                        {isActive && (
                          <div className="absolute inset-0 bg-white/20 animate-pulse" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div
                          className={`font-semibold text-sm truncate ${
                            isActive ? "text-gray-900" : "text-gray-600"
                          }`}
                        >
                          {step.title}
                        </div>
                        <div className="text-[10px] text-gray-400 truncate">
                          {step.subtitle}
                        </div>
                      </div>
                      {isActive && (
                        <ChevronRight className="w-4 h-4 text-blue-400" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Stats or Promo */}
            <div className="hidden lg:block bg-gradient-to-br from-[#03587f] to-[#024666] rounded-2xl p-5 text-white shadow-lg relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-white/20 transition-all duration-700" />
              <div className="relative z-10">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm mb-3">
                  <Award className="w-6 h-6 text-yellow-300" />
                </div>
                <h3 className="font-bold text-lg leading-tight mb-1">
                  Tips Profesional
                </h3>
                <p className="text-indigo-100 text-xs leading-relaxed">
                  Lengkapi sertifikat dan portfolio untuk meningkatkan peluang
                  dilirik rekruter hingga{" "}
                  <span className="text-yellow-300 font-bold">3x lipat</span>!
                </p>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-9">
            <div className="bg-white rounded-[2rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden flex flex-col min-h-[600px] relative">
              {/* Content Header */}
              <div className="px-6 md:px-10 py-8 border-b border-gray-50 bg-gradient-to-b from-gray-50/50 to-white relative">
                <div
                  className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${
                    steps[currentStep - 1].gradient
                  }`}
                />
                <div className="flex items-start justify-between">
                  <div>
                    <div
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-3 ${
                        steps[currentStep - 1].bg
                      } ${steps[currentStep - 1].color}`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      LANGKAH {currentStep} DARI {totalSteps}
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                      {steps[currentStep - 1].title}
                    </h2>
                    <p className="text-gray-500 text-sm md:text-base max-w-xl">
                      {currentStep === 1 &&
                        "Lengkapi data diri Anda agar perusahaan dapat mengenali Anda lebih baik."}
                      {currentStep === 2 &&
                        "Pastikan kontak aktif dan CV terbaru sudah terlampir."}
                      {currentStep === 3 &&
                        "Tunjukkan keahlian terbaik Anda untuk menarik perhatian."}
                      {currentStep === 4 &&
                        "Riwayat pendidikan formal maupun non-formal."}
                      {currentStep === 5 &&
                        "Pengalaman kerja yang relevan akan menjadi nilai plus."}
                      {currentStep === 6 &&
                        "Sertifikasi membuktikan kompetensi profesional Anda."}
                      {currentStep === 7 &&
                        "Bantu kami mencarikan pekerjaan yang paling pas untuk Anda."}
                    </p>
                  </div>
                  <div
                    className={`hidden md:flex w-16 h-16 rounded-2xl ${
                      steps[currentStep - 1].bg
                    } items-center justify-center`}
                  >
                    {(() => {
                      const Icon = steps[currentStep - 1].icon;
                      return (
                        <Icon
                          className={`w-8 h-8 ${steps[currentStep - 1].color}`}
                        />
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Form Content */}
              <div className="p-6 md:p-10 flex-1 bg-white">
                <div className="max-w-4xl mx-auto animate-fadeIn">
                  {renderCurrentStep()}
                </div>
              </div>

              {/* Footer Navigation */}
              <div className="px-6 md:px-10 py-6 bg-gray-50 border-t border-gray-100 flex items-center justify-between sticky bottom-0 z-20 backdrop-blur-lg bg-gray-50/90">
                <button
                  onClick={() => {
                    setCurrentStep((prev) => prev - 1);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  disabled={currentStep === 1}
                  className={`
                        flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all
                        ${
                          currentStep === 1
                            ? "text-gray-300 cursor-not-allowed bg-transparent"
                            : "text-gray-600 bg-white border border-gray-200 hover:bg-gray-100 hover:text-gray-900 shadow-sm"
                        }
                    `}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden md:inline">Sebelumnya</span>
                </button>

                <div className="flex gap-3">
                  {/* Save Draft Button (Optional future feature) */}

                  {currentStep < totalSteps ? (
                    <button
                      onClick={() => {
                        setCurrentStep((prev) => prev + 1);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="flex items-center gap-2 px-8 py-3 bg-gray-900 text-white rounded-xl hover:bg-black transition-all shadow-lg shadow-gray-900/20 font-semibold hover:-translate-y-0.5 active:translate-y-0"
                    >
                      Selanjutnya
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      disabled={isSaving}
                      className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-xl hover:shadow-blue-500/30 transition-all hover:-translate-y-0.5 active:translate-y-0 font-bold tracking-wide"
                    >
                      {isSaving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          {isEditMode ? "Update Profile" : "Simpan Profile"}
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS for custom scrollbar for sidebar */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

export default function JobseekerProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-100 rounded-full animate-pulse"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-500 font-medium animate-pulse">
            Memuat pengalaman terbaik untuk Anda...
          </p>
        </div>
      }
    >
      <JobseekerProfileContent />
    </Suspense>
  );
}
