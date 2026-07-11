"use client";

import { useState, useEffect, useMemo } from "react";
import Swal from "sweetalert2";
import api from "@/lib/api";
import { getSafeErrorMessage } from "@/lib/swalError";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Trash2,
  FileText,
  Download,
  Sparkles,
  RefreshCw,
  Briefcase,
  GraduationCap,
  Wrench,
  FolderGit,
  User,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Globe,
  Settings,
  Eye,
  Edit3,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

// Initial state data structures
const emptyData = {
  personal: {
    fullName: "",
    jobTitle: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    website: "",
  },
  summary: "",
  experiences: [],
  educations: [],
  skills: [],
  projects: [],
};

const sampleData = {
  personal: {
    fullName: "Budi Santoso, S.Kom.",
    jobTitle: "Senior Web Developer",
    email: "budi.santoso@email.com",
    phone: "0812-3456-7890",
    location: "Cirebon, Jawa Barat",
    linkedin: "linkedin.com/in/budisantoso",
    website: "github.com/budisantoso",
  },
  summary: "Software Engineer berpengalaman lebih dari 5 tahun dalam pengembangan aplikasi web menggunakan JavaScript/TypeScript, React, Next.js, dan Node.js. Terampil dalam membangun sistem scalable, mengoptimalkan kinerja aplikasi, dan memimpin tim developer kecil.",
  experiences: [
    {
      company: "PT Solusi Teknologi Cemerlang",
      position: "Senior Web Developer",
      location: "Jakarta (Remote)",
      startDate: "Januari 2023",
      endDate: "Sekarang",
      current: true,
      description: "• Memimpin migrasi platform e-commerce dari arsitektur monolitik ke microservices menggunakan Next.js dan NestJS, meningkatkan kecepatan muat halaman sebesar 40%.\n• Mengembangkan dan memelihara sistem design system internal perusahaan menggunakan React dan Tailwind CSS.\n• Melakukan mentorship kepada 3 junior developer dan code review berkala untuk menjaga standar kualitas kode."
    },
    {
      company: "CV Digital Kreatif Nusantara",
      position: "Full Stack Developer",
      location: "Cirebon, Indonesia",
      startDate: "Agustus 2020",
      endDate: "Desember 2022",
      current: false,
      description: "• Membangun sistem manajemen inventaris (ERP) berbasis web untuk 10+ klien retail di wilayah Cirebon.\n• Mengintegrasikan payment gateway (Midtrans) dan layanan logistik pihak ketiga API.\n• Mengoptimalkan query database PostgreSQL dan mendesain ulang skema database, meningkatkan efisiensi pembacaan data sebesar 25%."
    }
  ],
  educations: [
    {
      institution: "Universitas Swadaya Gunung Jati (UGJ)",
      degree: "Sarjana Komputer (S.Kom.)",
      fieldOfStudy: "Teknik Informatika",
      location: "Cirebon, Indonesia",
      startDate: "2016",
      endDate: "2020",
      current: false,
      description: "Lulus dengan IPK 3.75/4.00. Aktif dalam himpunan mahasiswa informatika (HMTI) dan memenangkan juara 2 lomba pemrograman tingkat regional."
    }
  ],
  skills: [
    "JavaScript (ES6+)", "TypeScript", "React.js", "Next.js", "Node.js", "Express.js",
    "PostgreSQL", "MongoDB", "Git & GitHub", "RESTful API", "Tailwind CSS", "Agile / Scrum"
  ],
  projects: [
    {
      title: "Portal Lowongan Kerja Cirebon",
      issuerOrOrg: "Proyek Mandiri",
      date: "2024",
      description: "Membangun platform portal pencari kerja terintegrasi untuk wilayah Cirebon menggunakan Next.js dan Prisma ORM, memfasilitasi pencari kerja lokal dalam menemukan lowongan yang terverifikasi."
    },
    {
      title: "Sertifikasi Dicoding - Back-End Developer",
      issuerOrOrg: "Dicoding Indonesia",
      date: "2023",
      description: "Program pelatihan intensif mengenai arsitektur backend, pembuatan REST API handal, penggunaan Node.js, pengujian otomatis, dan deployment ke AWS."
    }
  ]
};

const fontOptions = [
  { name: "Arial (Clean & Modern)", value: "var(--font-arial, Arial, sans-serif)" },
  { name: "Times New Roman (Formal & Klasik)", value: "var(--font-times, 'Times New Roman', Times, serif)" },
  { name: "Calibri (Korporat)", value: "var(--font-calibri, Calibri, sans-serif)" },
  { name: "Georgia (Elegan)", value: "var(--font-georgia, Georgia, serif)" },
];

const marginOptions = [
  { name: "Padat (0.5 in / 1.2 cm)", value: "12mm" },
  { name: "Sedang (0.75 in / 1.9 cm)", value: "19mm" },
  { name: "Lebar (1.0 in / 2.5 cm)", value: "25mm" },
];

const colorOptions = [
  { name: "Hitam Putih Klasik (ATS Murni)", value: "#000000" },
  { name: "Abu-abu Gelap Sleek", value: "#334155" },
  { name: "Navy Profesional", value: "#1e3a8a" },
  { name: "Forest Green", value: "#064e3b" },
];

const formatMonthYear = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("id-ID", {
    month: "short",
    year: "numeric",
  });
};

const joinClean = (parts, separator = ", ") =>
  parts.filter(Boolean).map((part) => String(part).trim()).filter(Boolean).join(separator);

const profileToCvData = (profile) => {
  const educations = profile.educations?.length
    ? profile.educations.map((edu) => ({
        id: edu.id,
        institution: edu.institution || "",
        degree: edu.degree || edu.level || "",
        fieldOfStudy: edu.fieldOfStudy || "",
        location: "",
        startDate: formatMonthYear(edu.startDate),
        endDate: edu.isCurrent ? "Sekarang" : formatMonthYear(edu.endDate),
        current: edu.isCurrent || false,
        description: joinClean([
          edu.gpa ? `IPK ${edu.gpa}` : "",
          edu.diplomaUrl ? "Ijazah/dokumen pendidikan tersedia" : "",
        ], ". "),
      }))
    : profile.lastEducationInstitution
      ? [
          {
            institution: profile.lastEducationInstitution,
            degree: profile.lastEducationLevel || "",
            fieldOfStudy: profile.lastEducationMajor || "",
            location: "",
            startDate: "",
            endDate: profile.graduationYear ? String(profile.graduationYear) : "",
            current: false,
            description: "",
          },
        ]
      : [];

  return {
    personal: {
      fullName: joinClean([profile.firstName, profile.lastName], " "),
      jobTitle: profile.currentTitle || profile.desiredJobTitle || "",
      email: profile.email || "",
      phone: profile.phone || "",
      location: joinClean([profile.city, profile.province]) || joinClean([profile.kecamatan, profile.kelurahan]),
      linkedin: profile.linkedinUrl || "",
      website: profile.portfolioUrl || profile.githubUrl || profile.websiteUrl || "",
    },
    summary: profile.summary || "",
    experiences: (profile.work_experiences || []).map((exp) => ({
      id: exp.id,
      company: exp.company || "",
      position: exp.position || "",
      location: exp.location || "",
      startDate: formatMonthYear(exp.startDate),
      endDate: exp.isCurrent ? "Sekarang" : formatMonthYear(exp.endDate),
      current: exp.isCurrent || false,
      description: joinClean([
        exp.description || "",
        ...(exp.achievements || []),
      ], "\n"),
    })),
    educations,
    skills: (profile.skills || []).map((skill) => skill.name).filter(Boolean),
    projects: (profile.certifications || []).map((cert) => ({
      id: cert.id,
      title: cert.name || "",
      issuerOrOrg: cert.issuingOrganization || "",
      date: formatMonthYear(cert.issueDate),
      description: joinClean([
        cert.credentialId ? `Credential ID: ${cert.credentialId}` : "",
        cert.credentialUrl || "",
      ], "\n"),
    })),
  };
};

const getAtsAudit = (data) => {
  const summaryLength = data.summary.trim().length;
  const hasMetric = [...data.experiences, ...data.projects].some((item) =>
    /(\d+|%|persen|meningkat|mengurangi|mengelola|membangun|mengembangkan|memimpin)/i.test(item.description || "")
  );

  const checks = [
    {
      label: "Kontak utama lengkap",
      passed: Boolean(data.personal.fullName && data.personal.email && data.personal.phone && data.personal.location),
      hint: "Lengkapi nama, email, nomor aktif, dan lokasi.",
    },
    {
      label: "Ringkasan profesional padat",
      passed: summaryLength >= 80 && summaryLength <= 600,
      hint: "Tulis 2-4 kalimat berisi target posisi, pengalaman, dan kekuatan utama.",
    },
    {
      label: "Pengalaman memakai dampak terukur",
      passed: data.experiences.length > 0 && hasMetric,
      hint: "Tambahkan angka, target, volume kerja, atau hasil yang dicapai.",
    },
    {
      label: "Keahlian mudah dipindai ATS",
      passed: data.skills.length >= 5,
      hint: "Masukkan minimal 5 skill teknis/nonteknis sesuai lowongan.",
    },
    {
      label: "Pendidikan tersedia",
      passed: data.educations.length > 0,
      hint: "Tambahkan pendidikan terakhir agar profil lebih lengkap.",
    },
  ];

  const passedCount = checks.filter((check) => check.passed).length;

  return {
    checks,
    score: Math.round((passedCount / checks.length) * 100),
    nextHint: checks.find((check) => !check.passed)?.hint || "CV sudah siap diekspor. Sesuaikan kata kunci dengan lowongan tujuan.",
  };
};

export default function CVBuilderPage() {
  const [activeTab, setActiveTab] = useState("personal");
  const [viewMode, setViewMode] = useState("edit"); // edit / preview (useful for mobile)
  const [cvData, setCvData] = useState(emptyData);
  const [isImportingProfile, setIsImportingProfile] = useState(false);
  
  // Customization states
  const [selectedFont, setSelectedFont] = useState("var(--font-arial, Arial, sans-serif)");
  const [selectedMargin, setSelectedMargin] = useState("19mm");
  const [selectedColor, setSelectedColor] = useState("#000000");
  const [selectedTemplate, setSelectedTemplate] = useState("classic"); // classic, minimal, modern
  const atsAudit = useMemo(() => getAtsAudit(cvData), [cvData]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("disnaker_cv_builder_data");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCvData(parsed);
      } catch (e) {
        console.error("Failed to load saved CV data", e);
      }
    } else {
      // Set sample data by default to show something nice on first load
      setCvData(sampleData);
    }
  }, []);

  // Save data to localStorage when it changes
  const saveToLocalStorage = (newData) => {
    localStorage.setItem("disnaker_cv_builder_data", JSON.stringify(newData));
  };

  // Handlers for personal info
  const handlePersonalInfoChange = (field, value) => {
    const updated = {
      ...cvData,
      personal: {
        ...cvData.personal,
        [field]: value,
      },
    };
    setCvData(updated);
    saveToLocalStorage(updated);
  };

  // Handlers for professional summary
  const handleSummaryChange = (value) => {
    const updated = {
      ...cvData,
      summary: value,
    };
    setCvData(updated);
    saveToLocalStorage(updated);
  };

  // Generic list-item handlers (Experiences, Educations, Projects)
  const handleAddListItem = (section, templateObj) => {
    const updated = {
      ...cvData,
      [section]: [...cvData[section], { ...templateObj, id: Date.now() }],
    };
    setCvData(updated);
    saveToLocalStorage(updated);
  };

  const handleUpdateListItem = (section, index, field, value) => {
    const newList = [...cvData[section]];
    newList[index] = { ...newList[index], [field]: value };
    const updated = {
      ...cvData,
      [section]: newList,
    };
    setCvData(updated);
    saveToLocalStorage(updated);
  };

  const handleRemoveListItem = (section, index) => {
    const newList = cvData[section].filter((_, i) => i !== index);
    const updated = {
      ...cvData,
      [section]: newList,
    };
    setCvData(updated);
    saveToLocalStorage(updated);
  };

  // Skill handlers
  const [newSkill, setNewSkill] = useState("");
  const handleAddSkill = (e) => {
    e.preventDefault();
    if (newSkill.trim() && !cvData.skills.includes(newSkill.trim())) {
      const updated = {
        ...cvData,
        skills: [...cvData.skills, newSkill.trim()],
      };
      setCvData(updated);
      saveToLocalStorage(updated);
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    const updated = {
      ...cvData,
      skills: cvData.skills.filter((s) => s !== skillToRemove),
    };
    setCvData(updated);
    saveToLocalStorage(updated);
  };

  const handleImportSampleData = () => {
    setCvData(sampleData);
    saveToLocalStorage(sampleData);
  };

  const handleImportProfileData = async () => {
    setIsImportingProfile(true);

    try {
      const { data } = await api.get("/api/profile/jobseeker");

      if (!data.success || !data.profile) {
        throw new Error(data.error || "Profil tidak ditemukan");
      }

      const importedData = profileToCvData(data.profile);
      setCvData(importedData);
      saveToLocalStorage(importedData);

      Swal.fire({
        title: "Data Profil Diimpor",
        text: "Data profil pencari kerja berhasil dimasukkan ke pembuat CV ATS.",
        icon: "success",
        timer: 1600,
        showConfirmButton: false,
      });
    } catch (error) {
      const status = error.response?.status;
      Swal.fire({
        title: status === 401 ? "Login Diperlukan" : "Gagal Mengimpor Profil",
        text:
          status === 401
            ? "Silakan login sebagai pencari kerja untuk mengambil data profil."
            : getSafeErrorMessage(
                error,
                "Data profil belum bisa diambil. Pastikan Anda login sebagai pencari kerja, lalu coba lagi.",
              ),
        icon: "error",
      });
    } finally {
      setIsImportingProfile(false);
    }
  };

  const handleResetData = () => {
    Swal.fire({
      title: "Hapus Semua Data?",
      text: "Tindakan ini akan mengosongkan seluruh isi formulir CV Anda dan tidak dapat dibatalkan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        setCvData(emptyData);
        saveToLocalStorage(emptyData);
        Swal.fire({
          title: "Berhasil!",
          text: "Formulir CV Anda telah berhasil dikosongkan.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  };

  const handleTriggerPrint = () => {
    window.print();
  };

  return (
    <div className="bg-slate-100 min-h-screen pt-24 pb-12">
      {/* Dynamic Style Block for PDF printing and layout overrides */}
      <style dangerouslySetInnerHTML={{ __html: `
        @page {
          size: A4;
          margin: 0;
        }

        @media print {
          /* Hide everything except print area */
          header, footer, nav, aside, button, .no-print, #mobile-view-tabs {
            display: none !important;
          }
          
          /* Force show the preview column when printing */
          .cv-preview-column {
            display: block !important;
            width: 100% !important;
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
          }

          /* Reset grids and layout containers to regular blocks to prevent clipping */
          .grid, .container {
            display: block !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
          }
          
          /* Reset paper container for printing */
          .paper-preview-container {
            background: transparent !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
            display: block !important;
            overflow: visible !important;
            min-height: auto !important;
          }

          /* Full width body print */
          body {
            background-color: white !important;
            color: black !important;
            font-size: 11pt !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          /* Global font family rule for print */
          .cv-document-print {
            font-family: ${selectedFont} !important;
            width: 100% !important;
            max-width: 100% !important;
            min-height: auto !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
            padding: ${selectedMargin} !important;
            display: block !important;
          }

          #main-content {
            padding: 0 !important;
            margin: 0 !important;
          }
          
          /* Prevent items breaking across pages in an ugly manner */
          .cv-section-item {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}} />

      <div className="container mx-auto px-4">
        {/* Banner/Header */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm gap-4 no-print">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <FileText className="text-primary w-8 h-8" />
              Pembuat CV ATS Instan
            </h1>
            <p className="text-slate-500 mt-1 text-sm md:text-base">
              Rancang CV bersih satu-kolom 100% ramah Screening System (ATS) secara gratis.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5 w-full md:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleImportProfileData}
              disabled={isImportingProfile}
              className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700"
            >
              <User className={`w-4 h-4 text-primary ${isImportingProfile ? "animate-pulse" : ""}`} />
              {isImportingProfile ? "Mengambil..." : "Ambil dari Profil"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleImportSampleData}
              className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              Isi Data Contoh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetData}
              className="flex items-center gap-2 border-red-200 text-red-600 hover:bg-red-50"
            >
              <RefreshCw className="w-4 h-4" />
              Reset Form
            </Button>
            <Button
              onClick={handleTriggerPrint}
              className="flex items-center gap-2 shadow-md shadow-primary/20 bg-primary text-primary-foreground font-semibold"
            >
              <Download className="w-4 h-4" />
              Cetak / Ekspor PDF
            </Button>
          </div>
        </div>

        {/* Mobile View Toggle Tabs */}
        <div id="mobile-view-tabs" className="lg:hidden flex mb-4 bg-white p-1 rounded-xl border border-slate-200 shadow-sm no-print">
          <button
            onClick={() => setViewMode("edit")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
              viewMode === "edit" ? "bg-primary text-primary-foreground shadow" : "text-slate-600"
            }`}
          >
            <Edit3 className="w-4 h-4" />
            Edit Data
          </button>
          <button
            onClick={() => setViewMode("preview")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
              viewMode === "preview" ? "bg-primary text-primary-foreground shadow" : "text-slate-600"
            }`}
          >
            <Eye className="w-4 h-4" />
            Pratinjau CV
          </button>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Form Editor */}
          <div className={`lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden no-print ${
            viewMode === "preview" ? "hidden lg:block" : "block"
          }`}>
            
            {/* Form Menu Tabs */}
            <div className="flex border-b border-slate-100 overflow-x-auto scrollbar-none bg-slate-50/50">
              {[
                { id: "personal", label: "Profil", icon: User },
                { id: "summary", label: "Ringkasan", icon: FileText },
                { id: "experience", label: "Kerja", icon: Briefcase },
                { id: "education", label: "Pendidikan", icon: GraduationCap },
                { id: "skills", label: "Keahlian", icon: Wrench },
                { id: "projects", label: "Proyek", icon: FolderGit },
                { id: "design", label: "Tata Letak", icon: Settings },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-4 py-3.5 border-b-2 font-medium text-xs whitespace-nowrap transition-colors ${
                      activeTab === tab.id
                        ? "border-primary text-primary bg-white"
                        : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="px-6 py-4 border-b border-slate-100 bg-white">
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-16 h-16 rounded-full border-4 border-slate-100 flex items-center justify-center bg-slate-50">
                  <span className="text-lg font-extrabold text-slate-900">{atsAudit.score}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <p className="text-sm font-bold text-slate-900">Kesiapan ATS</p>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                      atsAudit.score >= 80
                        ? "bg-emerald-50 text-emerald-700"
                        : atsAudit.score >= 60
                          ? "bg-amber-50 text-amber-700"
                          : "bg-red-50 text-red-700"
                    }`}>
                      {atsAudit.score >= 80 ? "Siap" : atsAudit.score >= 60 ? "Perlu Rapih" : "Lengkapi"}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden mb-3">
                    <div
                      className={`h-full rounded-full ${
                        atsAudit.score >= 80
                          ? "bg-emerald-500"
                          : atsAudit.score >= 60
                            ? "bg-amber-500"
                            : "bg-red-500"
                      }`}
                      style={{ width: `${atsAudit.score}%` }}
                    />
                  </div>
                  <div className="space-y-1.5">
                    {atsAudit.checks.map((check) => (
                      <div key={check.label} className="flex items-center gap-2 text-xs text-slate-600">
                        {check.passed ? (
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        ) : (
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        )}
                        <span className={check.passed ? "text-slate-700" : "text-slate-500"}>{check.label}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-3 leading-relaxed">{atsAudit.nextHint}</p>
                </div>
              </div>
            </div>

            {/* Form Panel Content */}
            <div className="p-6 max-h-[68vh] overflow-y-auto">
              
              {/* Profile Details Tab */}
              {activeTab === "personal" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-800 mb-3 border-b pb-2">Informasi Kontak Diri</h3>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1">Nama Lengkap</label>
                    <Input
                      placeholder="Contoh: Budi Santoso, S.Kom."
                      value={cvData.personal.fullName}
                      onChange={(e) => handlePersonalInfoChange("fullName", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1">Pekerjaan / Jabatan</label>
                    <Input
                      placeholder="Contoh: Senior Web Developer"
                      value={cvData.personal.jobTitle}
                      onChange={(e) => handlePersonalInfoChange("jobTitle", e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-500 block mb-1">Email</label>
                      <Input
                        type="email"
                        placeholder="nama@email.com"
                        value={cvData.personal.email}
                        onChange={(e) => handlePersonalInfoChange("email", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 block mb-1">No. Telp / WhatsApp</label>
                      <Input
                        placeholder="0812-xxxx-xxxx"
                        value={cvData.personal.phone}
                        onChange={(e) => handlePersonalInfoChange("phone", e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1">Lokasi (Kota, Negara)</label>
                    <Input
                      placeholder="Contoh: Cirebon, Indonesia"
                      value={cvData.personal.location}
                      onChange={(e) => handlePersonalInfoChange("location", e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-500 block mb-1">Profil LinkedIn (Opsional)</label>
                      <Input
                        placeholder="linkedin.com/in/username"
                        value={cvData.personal.linkedin}
                        onChange={(e) => handlePersonalInfoChange("linkedin", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 block mb-1">Website / GitHub (Opsional)</label>
                      <Input
                        placeholder="github.com/username"
                        value={cvData.personal.website}
                        onChange={(e) => handlePersonalInfoChange("website", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Professional Summary Tab */}
              {activeTab === "summary" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-800 mb-3 border-b pb-2">Ringkasan Profesional</h3>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1">
                      Deskripsikan profil profesional Anda dalam 2-4 kalimat (maks 500 karakter).
                    </label>
                    <textarea
                      rows={6}
                      maxLength={600}
                      className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      placeholder="Contoh: Web Developer berpengalaman dengan track record yang terbukti membangun aplikasi scalable. Fokus pada optimalisasi frontend dan manajemen basis data..."
                      value={cvData.summary}
                      onChange={(e) => handleSummaryChange(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Experience Tab */}
              {activeTab === "experience" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b pb-2">
                    <h3 className="text-lg font-bold text-slate-800">Riwayat Pengalaman Kerja</h3>
                    <Button
                      size="sm"
                      onClick={() =>
                        handleAddListItem("experiences", {
                          company: "",
                          position: "",
                          location: "",
                          startDate: "",
                          endDate: "",
                          current: false,
                          description: "",
                        })
                      }
                      className="flex items-center gap-1 py-1 px-3 text-xs"
                    >
                      <Plus className="w-3.5 h-3.5" /> Tambah
                    </Button>
                  </div>
                  {cvData.experiences.length === 0 ? (
                    <p className="text-slate-400 text-xs italic text-center py-6">
                      Belum ada riwayat pekerjaan dimasukkan.
                    </p>
                  ) : (
                    cvData.experiences.map((exp, index) => (
                      <div key={exp.id || index} className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 relative space-y-3">
                        <button
                          onClick={() => handleRemoveListItem("experiences", index)}
                          className="absolute top-3 right-3 text-red-500 hover:text-red-700 bg-white p-1.5 rounded-lg border border-slate-100 shadow-sm"
                          title="Hapus Pekerjaan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                          Pekerjaan #{index + 1}
                        </h4>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Nama Perusahaan</label>
                          <Input
                            placeholder="Contoh: PT Telkom Indonesia"
                            value={exp.company}
                            onChange={(e) =>
                              handleUpdateListItem("experiences", index, "company", e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Jabatan / Posisi</label>
                          <Input
                            placeholder="Contoh: Frontend Developer"
                            value={exp.position}
                            onChange={(e) =>
                              handleUpdateListItem("experiences", index, "position", e.target.value)
                            }
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Mulai (Bulan Tahun)</label>
                            <Input
                              placeholder="Jan 2022"
                              value={exp.startDate}
                              onChange={(e) =>
                                handleUpdateListItem("experiences", index, "startDate", e.target.value)
                              }
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Selesai (Bulan Tahun)</label>
                            <Input
                              placeholder="Sekarang / Des 2023"
                              disabled={exp.current}
                              value={exp.current ? "Sekarang" : exp.endDate}
                              onChange={(e) =>
                                handleUpdateListItem("experiences", index, "endDate", e.target.value)
                              }
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                          <input
                            type="checkbox"
                            id={`exp-curr-${index}`}
                            checked={exp.current || false}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              const newList = [...cvData.experiences];
                              newList[index] = {
                                ...newList[index],
                                current: checked,
                                endDate: checked ? "Sekarang" : "",
                              };
                              setCvData({ ...cvData, experiences: newList });
                              saveToLocalStorage({ ...cvData, experiences: newList });
                            }}
                            className="rounded text-primary focus:ring-primary w-4 h-4"
                          />
                          <label htmlFor={`exp-curr-${index}`} className="text-xs font-medium text-slate-600 cursor-pointer">
                            Saya masih bekerja di sini
                          </label>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Lokasi</label>
                          <Input
                            placeholder="Contoh: Jakarta (Remote)"
                            value={exp.location}
                            onChange={(e) =>
                              handleUpdateListItem("experiences", index, "location", e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                            Tanggung Jawab & Prestasi (Gunakan poin • untuk baris baru)
                          </label>
                          <textarea
                            rows={4}
                            className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            placeholder="• Mengembangkan fitur pembayaran menggunakan React.\n• Meningkatkan efisiensi render halaman sebesar 30%."
                            value={exp.description}
                            onChange={(e) =>
                              handleUpdateListItem("experiences", index, "description", e.target.value)
                            }
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Education Tab */}
              {activeTab === "education" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b pb-2">
                    <h3 className="text-lg font-bold text-slate-800">Riwayat Pendidikan</h3>
                    <Button
                      size="sm"
                      onClick={() =>
                        handleAddListItem("educations", {
                          institution: "",
                          degree: "",
                          fieldOfStudy: "",
                          location: "",
                          startDate: "",
                          endDate: "",
                          current: false,
                          description: "",
                        })
                      }
                      className="flex items-center gap-1 py-1 px-3 text-xs"
                    >
                      <Plus className="w-3.5 h-3.5" /> Tambah
                    </Button>
                  </div>
                  {cvData.educations.length === 0 ? (
                    <p className="text-slate-400 text-xs italic text-center py-6">
                      Belum ada riwayat pendidikan dimasukkan.
                    </p>
                  ) : (
                    cvData.educations.map((edu, index) => (
                      <div key={edu.id || index} className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 relative space-y-3">
                        <button
                          onClick={() => handleRemoveListItem("educations", index)}
                          className="absolute top-3 right-3 text-red-500 hover:text-red-700 bg-white p-1.5 rounded-lg border border-slate-100 shadow-sm"
                          title="Hapus Pendidikan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                          Pendidikan #{index + 1}
                        </h4>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Nama Institusi / Universitas</label>
                          <Input
                            placeholder="Contoh: Universitas Gadjah Mada"
                            value={edu.institution}
                            onChange={(e) =>
                              handleUpdateListItem("educations", index, "institution", e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Gelar Kelulusan</label>
                          <Input
                            placeholder="Contoh: Sarjana Komputer (S.Kom.)"
                            value={edu.degree}
                            onChange={(e) =>
                              handleUpdateListItem("educations", index, "degree", e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Jurusan / Bidang Studi</label>
                          <Input
                            placeholder="Contoh: Sistem Informasi"
                            value={edu.fieldOfStudy}
                            onChange={(e) =>
                              handleUpdateListItem("educations", index, "fieldOfStudy", e.target.value)
                            }
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Tahun Masuk</label>
                            <Input
                              placeholder="2018"
                              value={edu.startDate}
                              onChange={(e) =>
                                handleUpdateListItem("educations", index, "startDate", e.target.value)
                              }
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Tahun Lulus</label>
                            <Input
                              placeholder="2022"
                              value={edu.endDate}
                              onChange={(e) =>
                                handleUpdateListItem("educations", index, "endDate", e.target.value)
                              }
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Lokasi</label>
                          <Input
                            placeholder="Contoh: Yogyakarta, Indonesia"
                            value={edu.location}
                            onChange={(e) =>
                              handleUpdateListItem("educations", index, "location", e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                            Keterangan Tambahan / Prestasi (IPK, organisasi, dll.)
                          </label>
                          <textarea
                            rows={3}
                            className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            placeholder="Lulus dengan IPK 3.80. Aktif di Himpunan Mahasiswa."
                            value={edu.description}
                            onChange={(e) =>
                              handleUpdateListItem("educations", index, "description", e.target.value)
                            }
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Skills Tab */}
              {activeTab === "skills" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-800 mb-3 border-b pb-2">Keahlian & Kompetensi</h3>
                  <form onSubmit={handleAddSkill} className="flex gap-2">
                    <Input
                      placeholder="Contoh: JavaScript, Microsoft Office, Las Listrik"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                    />
                    <Button type="submit">Tambah</Button>
                  </form>
                  <p className="text-slate-400 text-[10px] italic">
                    Ketik keahlian Anda satu per satu lalu klik tombol "Tambah" atau tekan Enter.
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mt-4">
                    {cvData.skills.length === 0 ? (
                      <p className="text-slate-400 text-xs italic py-2">Belum ada keahlian ditambahkan.</p>
                    ) : (
                      cvData.skills.map((skill, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-full text-xs font-semibold border border-slate-200 transition-colors"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(skill)}
                            className="text-slate-400 hover:text-red-500 font-bold ml-0.5 text-[11px]"
                          >
                            ×
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Projects & Certifications Tab */}
              {activeTab === "projects" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b pb-2">
                    <h3 className="text-lg font-bold text-slate-800">Proyek Mandiri & Sertifikasi</h3>
                    <Button
                      size="sm"
                      onClick={() =>
                        handleAddListItem("projects", {
                          title: "",
                          issuerOrOrg: "",
                          date: "",
                          description: "",
                        })
                      }
                      className="flex items-center gap-1 py-1 px-3 text-xs"
                    >
                      <Plus className="w-3.5 h-3.5" /> Tambah
                    </Button>
                  </div>
                  {cvData.projects.length === 0 ? (
                    <p className="text-slate-400 text-xs italic text-center py-6">
                      Belum ada proyek/sertifikasi dimasukkan.
                    </p>
                  ) : (
                    cvData.projects.map((proj, index) => (
                      <div key={proj.id || index} className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 relative space-y-3">
                        <button
                          onClick={() => handleRemoveListItem("projects", index)}
                          className="absolute top-3 right-3 text-red-500 hover:text-red-700 bg-white p-1.5 rounded-lg border border-slate-100 shadow-sm"
                          title="Hapus Proyek"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                          Proyek/Sertifikat #{index + 1}
                        </h4>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Nama Proyek / Sertifikat</label>
                          <Input
                            placeholder="Contoh: E-Commerce Web App"
                            value={proj.title}
                            onChange={(e) =>
                              handleUpdateListItem("projects", index, "title", e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Pihak Penyelenggara / Organisasi</label>
                          <Input
                            placeholder="Contoh: Proyek Mandiri / BNSP / Dicoding"
                            value={proj.issuerOrOrg}
                            onChange={(e) =>
                              handleUpdateListItem("projects", index, "issuerOrOrg", e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Tanggal / Tahun Terbit</label>
                          <Input
                            placeholder="Contoh: Nov 2023 / 2024"
                            value={proj.date}
                            onChange={(e) =>
                              handleUpdateListItem("projects", index, "date", e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Deskripsi Proyek / Cakupan Materi</label>
                          <textarea
                            rows={3}
                            className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            placeholder="Mengembangkan web app dengan React.js yang digunakan oleh 200+ pengguna aktif bulanan..."
                            value={proj.description}
                            onChange={(e) =>
                              handleUpdateListItem("projects", index, "description", e.target.value)
                            }
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Design Customizations Tab */}
              {activeTab === "design" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-800 mb-3 border-b pb-2">Desain Kertas & Layout</h3>
                  
                  {/* Select Template Style */}
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Gaya Garis / Template</label>
                    <select
                      className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm transition-colors focus:ring-primary w-full"
                      value={selectedTemplate}
                      onChange={(e) => setSelectedTemplate(e.target.value)}
                    >
                      <option value="classic">Klasik ATS (Garis Pembatas Bersih)</option>
                      <option value="minimal">Minimalis Murni (Tanpa Garis)</option>
                      <option value="modern">Modern (Header Tebal / Aksen Kotak)</option>
                    </select>
                  </div>

                  {/* Select Font Family */}
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Jenis Huruf (Font)</label>
                    <select
                      className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm transition-colors focus:ring-primary w-full"
                      value={selectedFont}
                      onChange={(e) => setSelectedFont(e.target.value)}
                    >
                      {fontOptions.map((font) => (
                        <option key={font.value} value={font.value}>
                          {font.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Select Margin Size */}
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Margin Halaman</label>
                    <select
                      className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm transition-colors focus:ring-primary w-full"
                      value={selectedMargin}
                      onChange={(e) => setSelectedMargin(e.target.value)}
                    >
                      {marginOptions.map((margin) => (
                        <option key={margin.value} value={margin.value}>
                          {margin.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Select Accent Color */}
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Warna Judul Section (Opsional)</label>
                    <div className="grid grid-cols-4 gap-2">
                      {colorOptions.map((color) => (
                        <button
                          key={color.value}
                          onClick={() => setSelectedColor(color.value)}
                          className={`h-9 rounded-lg border flex items-center justify-center text-[10px] font-bold text-white transition-all ${
                            selectedColor === color.value
                              ? "ring-2 ring-primary ring-offset-2 border-transparent scale-105"
                              : "border-slate-200 opacity-80 hover:opacity-100"
                          }`}
                          style={{ backgroundColor: color.value === "#000000" ? "#1e293b" : color.value }}
                        >
                          {selectedColor === color.value ? "✓" : ""}
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2">
                      * Catatan: Sistem ATS lebih merekomendasikan warna hitam polos (Hitam Putih Klasik) agar pembacaan parser aman 100%.
                    </p>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Right Column: Live Preview Panel */}
          <div className={`cv-preview-column lg:col-span-7 flex flex-col items-center ${
            viewMode === "edit" ? "hidden lg:flex" : "flex"
          }`}>
            
            {/* Paper Preview Container */}
            <div className="paper-preview-container w-full bg-slate-200/50 p-4 lg:p-8 rounded-2xl border border-slate-200/80 shadow-inner flex justify-center overflow-x-auto min-h-[75vh]">
              
              {/* The Actual A4 CV Page Sheet */}
              <div
                className="cv-document-print bg-white text-black shadow-xl w-full max-w-[210mm] min-h-[297mm] transition-all origin-top duration-200"
                style={{
                  fontFamily: selectedFont,
                  padding: selectedMargin,
                  boxSizing: "border-box",
                }}
              >
                {/* CV Header - Name & Contact */}
                <header className="text-center mb-5">
                  <h2
                    className="text-2xl md:text-3xl font-bold tracking-tight mb-1"
                    style={{ color: selectedColor }}
                  >
                    {cvData.personal.fullName || "NAMA LENGKAP ANDA"}
                  </h2>
                  <p className="text-sm font-semibold text-slate-700 tracking-wide mb-3 uppercase">
                    {cvData.personal.jobTitle || "JABATAN PROFESIONAL YANG DILAMAR"}
                  </p>
                  
                  {/* Contact Links Bar */}
                  <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-xs text-slate-600 font-medium">
                    {cvData.personal.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-slate-400 no-print" />
                        {cvData.personal.email}
                      </span>
                    )}
                    {cvData.personal.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400 no-print" />
                        {cvData.personal.phone}
                      </span>
                    )}
                    {cvData.personal.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 no-print" />
                        {cvData.personal.location}
                      </span>
                    )}
                    {cvData.personal.linkedin && (
                      <span className="flex items-center gap-1">
                        <Linkedin className="w-3.5 h-3.5 text-slate-400 no-print" />
                        {cvData.personal.linkedin}
                      </span>
                    )}
                    {cvData.personal.website && (
                      <span className="flex items-center gap-1">
                        <Globe className="w-3.5 h-3.5 text-slate-400 no-print" />
                        {cvData.personal.website}
                      </span>
                    )}
                  </div>
                </header>

                {/* Professional Summary Section */}
                {cvData.summary && (
                  <section className="mb-5 cv-section-item">
                    <h3
                      className={`text-sm font-bold uppercase tracking-wider mb-1.5 ${
                        selectedTemplate === "modern" ? "bg-slate-100 px-2 py-0.5 rounded" : ""
                      }`}
                      style={{ color: selectedColor }}
                    >
                      Ringkasan Profesional
                    </h3>
                    {selectedTemplate === "classic" && <div className="h-px bg-slate-900/60 mb-2" />}
                    <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-line">
                      {cvData.summary}
                    </p>
                  </section>
                )}

                {/* Experience Section */}
                {cvData.experiences.length > 0 && (
                  <section className="mb-5 cv-section-item">
                    <h3
                      className={`text-sm font-bold uppercase tracking-wider mb-1.5 ${
                        selectedTemplate === "modern" ? "bg-slate-100 px-2 py-0.5 rounded" : ""
                      }`}
                      style={{ color: selectedColor }}
                    >
                      Pengalaman Kerja
                    </h3>
                    {selectedTemplate === "classic" && <div className="h-px bg-slate-900/60 mb-2" />}
                    
                    <div className="space-y-4 mt-2">
                      {cvData.experiences.map((exp, idx) => (
                        <div key={idx} className="cv-section-item">
                          <div className="flex justify-between items-start text-xs font-bold text-slate-950 mb-0.5">
                            <span>
                              {exp.position || "Jabatan"} <span className="font-normal text-slate-600">|</span> {exp.company || "Perusahaan"}
                            </span>
                            <span className="font-semibold text-slate-700 whitespace-nowrap">
                              {exp.startDate} - {exp.current ? "Sekarang" : exp.endDate || "Selesai"}
                            </span>
                          </div>
                          <div className="flex justify-between text-[11px] text-slate-600 italic mb-1.5">
                            <span>{exp.location || "Lokasi Kantor"}</span>
                          </div>
                          {exp.description && (
                            <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-line font-light">
                              {exp.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Education Section */}
                {cvData.educations.length > 0 && (
                  <section className="mb-5 cv-section-item">
                    <h3
                      className={`text-sm font-bold uppercase tracking-wider mb-1.5 ${
                        selectedTemplate === "modern" ? "bg-slate-100 px-2 py-0.5 rounded" : ""
                      }`}
                      style={{ color: selectedColor }}
                    >
                      Pendidikan
                    </h3>
                    {selectedTemplate === "classic" && <div className="h-px bg-slate-900/60 mb-2" />}
                    
                    <div className="space-y-3.5 mt-2">
                      {cvData.educations.map((edu, idx) => (
                        <div key={idx} className="cv-section-item">
                          <div className="flex justify-between items-start text-xs font-bold text-slate-950 mb-0.5">
                            <span>
                              {edu.degree || "Gelar"} {edu.fieldOfStudy ? `di ${edu.fieldOfStudy}` : ""} <span className="font-normal text-slate-600">|</span> {edu.institution || "Universitas"}
                            </span>
                            <span className="font-semibold text-slate-700 whitespace-nowrap">
                              {edu.startDate} - {edu.endDate || "Selesai"}
                            </span>
                          </div>
                          <div className="flex justify-between text-[11px] text-slate-600 italic mb-1.5">
                            <span>{edu.location || "Lokasi Institusi"}</span>
                          </div>
                          {edu.description && (
                            <p className="text-xs text-slate-800 leading-relaxed font-light whitespace-pre-line">
                              {edu.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Skills Section */}
                {cvData.skills.length > 0 && (
                  <section className="mb-5 cv-section-item">
                    <h3
                      className={`text-sm font-bold uppercase tracking-wider mb-1.5 ${
                        selectedTemplate === "modern" ? "bg-slate-100 px-2 py-0.5 rounded" : ""
                      }`}
                      style={{ color: selectedColor }}
                    >
                      Keahlian & Kompetensi
                    </h3>
                    {selectedTemplate === "classic" && <div className="h-px bg-slate-900/60 mb-2" />}
                    <div className="text-xs text-slate-800 leading-relaxed mt-2 font-light">
                      <span className="font-bold">Keahlian Utama:</span> {cvData.skills.join(", ")}
                    </div>
                  </section>
                )}

                {/* Projects & Certifications Section */}
                {cvData.projects.length > 0 && (
                  <section className="mb-5 cv-section-item">
                    <h3
                      className={`text-sm font-bold uppercase tracking-wider mb-1.5 ${
                        selectedTemplate === "modern" ? "bg-slate-100 px-2 py-0.5 rounded" : ""
                      }`}
                      style={{ color: selectedColor }}
                    >
                      Proyek Mandiri & Sertifikasi
                    </h3>
                    {selectedTemplate === "classic" && <div className="h-px bg-slate-900/60 mb-2" />}
                    
                    <div className="space-y-3.5 mt-2">
                      {cvData.projects.map((proj, idx) => (
                        <div key={idx} className="cv-section-item">
                          <div className="flex justify-between items-start text-xs font-bold text-slate-950 mb-0.5">
                            <span>
                              {proj.title || "Nama Proyek / Sertifikat"} <span className="font-normal text-slate-600">|</span> {proj.issuerOrOrg || "Penyelenggara"}
                            </span>
                            <span className="font-semibold text-slate-700 whitespace-nowrap">
                              {proj.date || "Tahun"}
                            </span>
                          </div>
                          {proj.description && (
                            <p className="text-xs text-slate-800 leading-relaxed font-light mt-1 whitespace-pre-line">
                              {proj.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

              </div>

            </div>

            {/* Print Help Notice */}
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs flex gap-2 max-w-[210mm] no-print">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Panduan Unduh PDF:</p>
                <p className="mt-1">
                  Saat dialog cetak muncul, atur <b>Tujuan (Destination)</b> ke <b>Save as PDF / Simpan sebagai PDF</b>.
                  Pastikan untuk menonaktifkan opsi <b>Header dan Footer (Headers and Footers)</b> di pengaturan lanjutan cetak agar tampilan halaman PDF bersih dari URL dan tanggal cetak.
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
