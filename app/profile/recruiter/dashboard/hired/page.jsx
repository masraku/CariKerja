"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import {
  ArrowLeft,
  Users,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Briefcase,
  Calendar,
  User,
  Loader2,
  DollarSign,
  Upload,
  X,
  Check,
  AlertCircle,
  Download,
} from "lucide-react";

export default function ContractRegistrationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pendaftaran"); // total, pendaftaran, menunggu, terdaftar
  const [acceptedApplicants, setAcceptedApplicants] = useState([]);
  const [pendingContracts, setPendingContracts] = useState([]); // Contract batches waiting for admin
  const [registeredWorkers, setRegisteredWorkers] = useState([]); // Approved contract batches
  const [stats, setStats] = useState({
    total: 0,
    pendingRegistration: 0,
    pendingContract: 0,
    pendingContractWorkers: 0,
    registered: 0,
    registeredWorkers: 0,
  });
  const [selectedWorkers, setSelectedWorkers] = useState([]);
  const [showFormModal, setShowFormModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [previewDocUrl, setPreviewDocUrl] = useState(null); // For document preview modal

  // Form state
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    salary: "",
    notes: "",
  });
  const [attachmentFile, setAttachmentFile] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // Load accepted applicants and registered workers
      const [applicantsRes, contractsRes] = await Promise.all([
        fetch("/api/contracts/accepted-applicants", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/contracts", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const applicantsData = await applicantsRes.json();
      const contractsData = await contractsRes.json();

      if (applicantsData.success) {
        console.log("API response:", applicantsData);
        setAcceptedApplicants(applicantsData.acceptedApplicants || []);
        setPendingContracts(applicantsData.pendingContracts || []);
        setRegisteredWorkers(applicantsData.approvedContracts || []);
      }

      // Calculate stats from API response
      const stats = applicantsData.stats || {};
      setStats({
        total:
          (stats.totalAccepted || 0) +
          (stats.totalPendingWorkers || 0) +
          (stats.totalApprovedWorkers || 0),
        pendingRegistration: stats.totalAccepted || 0,
        pendingContract: stats.totalPendingContracts || 0,
        pendingContractWorkers: stats.totalPendingWorkers || 0,
        registered: stats.totalApprovedContracts || 0,
        registeredWorkers: stats.totalApprovedWorkers || 0,
      });
    } catch (error) {
      console.error("Error loading data:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Gagal memuat data pekerja",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectWorker = (applicationId) => {
    setSelectedWorkers((prev) => {
      if (prev.includes(applicationId)) {
        return prev.filter((id) => id !== applicationId);
      } else {
        return [...prev, applicationId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedWorkers.length === acceptedApplicants.length) {
      setSelectedWorkers([]);
    } else {
      setSelectedWorkers(acceptedApplicants.map((a) => a.id));
    }
  };

  const openFormModal = () => {
    if (selectedWorkers.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Pilih Pekerja",
        text: "Silakan pilih minimal satu pekerja untuk didaftarkan",
      });
      return;
    }
    setShowFormModal(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAttachmentFile(file);
    }
  };

  const handleSubmitContract = async (e) => {
    e.preventDefault();

    if (!formData.startDate || !formData.endDate || !formData.salary) {
      Swal.fire({
        icon: "warning",
        title: "Data Tidak Lengkap",
        text: "Silakan isi periode kontrak dan upah",
      });
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");
      let uploadedFileUrl = null;

      // Upload file if exists
      if (attachmentFile) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", attachmentFile);
        uploadFormData.append("type", "contract-doc");
        uploadFormData.append("bucket", "Lowongan");
        uploadFormData.append("folder", "contracts");

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: uploadFormData,
        });

        const uploadData = await uploadRes.json();
        console.log("Upload response:", uploadData); // Debug log
        if (!uploadData.success) {
          throw new Error(uploadData.error || "Gagal mengupload lampiran");
        }
        uploadedFileUrl = uploadData.url;
        console.log("Uploaded file URL:", uploadedFileUrl); // Debug log
      }

      console.log("recruiterDocUrl being sent:", uploadedFileUrl); // Debug log

      // Prepare workers data (without attachmentUrl, it's now at registration level)
      const workers = selectedWorkers.map((appId) => {
        const applicant = acceptedApplicants.find((a) => a.id === appId);
        return {
          applicationId: appId,
          jobseekerId: applicant?.jobseekerId,
          jobTitle: applicant?.jobs?.title || "Unknown",
          startDate: formData.startDate,
          endDate: formData.endDate,
          salary: parseInt(formData.salary.replace(/\D/g, "")),
          notes: formData.notes || null,
        };
      });

      const response = await fetch("/api/contracts", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          workers,
          recruiterDocUrl: uploadedFileUrl // Document at registration level
        }),
      });

      const data = await response.json();

      if (data.success) {
        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: "Pendaftaran kontrak berhasil dikirim ke admin untuk review",
          timer: 2000,
          showConfirmButton: false,
        });
        setShowFormModal(false);
        setSelectedWorkers([]);
        setFormData({ startDate: "", endDate: "", salary: "", notes: "" });
        setAttachmentFile(null);
        loadData();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: error.message || "Gagal mendaftarkan kontrak",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (value) => {
    const numericValue = value.replace(/\D/g, "");
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handleSalaryChange = (e) => {
    const formatted = formatCurrency(e.target.value);
    setFormData((prev) => ({ ...prev, salary: formatted }));
  };

  const getSelectedWorkersInfo = () => {
    return acceptedApplicants.filter((a) => selectedWorkers.includes(a.id));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Memuat data pekerja...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push("/profile/recruiter/dashboard")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Kembali ke Dashboard
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <FileText className="w-8 h-8 text-green-500" />
                Pendaftaran Kontrak Kerja
              </h1>
              <p className="text-gray-600">
                Kelola dan daftarkan kontrak untuk pekerja yang diterima
              </p>
            </div>
          </div>
        </div>

        {/* Stats Tabs */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <button
            onClick={() => setActiveTab("total")}
            className={`text-left rounded-xl p-4 transition-all ${
              activeTab === "total"
                ? "bg-gray-900 text-white ring-2 ring-gray-900 ring-offset-2"
                : "bg-white hover:bg-gray-50 border border-gray-200"
            }`}
          >
            <p
              className={`text-xs mb-1 ${
                activeTab === "total" ? "text-gray-300" : "text-gray-500"
              }`}
            >
              Total
            </p>
            <p
              className={`text-2xl font-bold ${
                activeTab === "total" ? "text-white" : "text-gray-900"
              }`}
            >
              {stats.total}
            </p>
          </button>

          <button
            onClick={() => setActiveTab("pendaftaran")}
            className={`text-left rounded-xl p-4 transition-all ${
              activeTab === "pendaftaran"
                ? "bg-green-500 text-white ring-2 ring-green-500 ring-offset-2"
                : "bg-green-50 hover:bg-green-100 border border-green-200"
            }`}
          >
            <p
              className={`text-xs mb-1 ${
                activeTab === "pendaftaran"
                  ? "text-green-100"
                  : "text-green-700"
              }`}
            >
              Pendaftaran Kontrak
            </p>
            <p
              className={`text-2xl font-bold ${
                activeTab === "pendaftaran" ? "text-white" : "text-green-900"
              }`}
            >
              {stats.pendingRegistration}
            </p>
          </button>

          <button
            onClick={() => setActiveTab("menunggu")}
            className={`text-left rounded-xl p-4 transition-all ${
              activeTab === "menunggu"
                ? "bg-yellow-500 text-white ring-2 ring-yellow-500 ring-offset-2"
                : "bg-yellow-50 hover:bg-yellow-100 border border-yellow-200"
            }`}
          >
            <p
              className={`text-xs mb-1 ${
                activeTab === "menunggu" ? "text-yellow-100" : "text-yellow-700"
              }`}
            >
              Menunggu Admin
            </p>
            <p
              className={`text-2xl font-bold ${
                activeTab === "menunggu" ? "text-white" : "text-yellow-900"
              }`}
            >
              {stats.pendingContract}
            </p>
          </button>

          <button
            onClick={() => setActiveTab("terdaftar")}
            className={`text-left rounded-xl p-4 transition-all ${
              activeTab === "terdaftar"
                ? "bg-blue-500 text-white ring-2 ring-blue-500 ring-offset-2"
                : "bg-blue-50 hover:bg-blue-100 border border-blue-200"
            }`}
          >
            <p
              className={`text-xs mb-1 ${
                activeTab === "terdaftar" ? "text-blue-100" : "text-blue-700"
              }`}
            >
              Daftar Pekerja
            </p>
            <p
              className={`text-2xl font-bold ${
                activeTab === "terdaftar" ? "text-white" : "text-blue-900"
              }`}
            >
              {stats.registered}
            </p>
          </button>
        </div>

        {/* Content based on active tab */}
        {activeTab === "pendaftaran" && (
          <>
            {/* Action Bar */}
            {acceptedApplicants.length > 0 && (
              <div className="bg-white rounded-xl p-4 mb-6 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={
                        selectedWorkers.length === acceptedApplicants.length &&
                        acceptedApplicants.length > 0
                      }
                      onChange={handleSelectAll}
                      className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-gray-700 font-medium">
                      Pilih Semua
                    </span>
                  </label>
                  {selectedWorkers.length > 0 && (
                    <span className="text-sm text-gray-500">
                      {selectedWorkers.length} pekerja dipilih
                    </span>
                  )}
                </div>
                <button
                  onClick={openFormModal}
                  disabled={selectedWorkers.length === 0}
                  className={`px-6 py-2 rounded-lg font-semibold transition flex items-center gap-2 ${
                    selectedWorkers.length > 0
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  Daftarkan Kontrak
                </button>
              </div>
            )}

            {/* Workers Grid */}
            {acceptedApplicants.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Belum Ada Pekerja untuk Didaftarkan
                </h3>
                <p className="text-gray-600">
                  Pekerja yang sudah diterima dan belum didaftarkan kontrak akan
                  muncul di sini
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {acceptedApplicants.map((applicant) => (
                  <div
                    key={applicant.id}
                    className={`bg-white rounded-xl border-2 p-4 shadow-sm transition cursor-pointer ${
                      selectedWorkers.includes(applicant.id)
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => handleSelectWorker(applicant.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold overflow-hidden flex-shrink-0">
                          {applicant.jobseekers?.photo ? (
                            <img
                              src={applicant.jobseekers.photo}
                              alt={applicant.jobseekers?.firstName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span>
                              {applicant.jobseekers?.firstName?.charAt(0) ||
                                "U"}
                            </span>
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">
                            {applicant.jobseekers?.firstName}{" "}
                            {applicant.jobseekers?.lastName}
                          </h3>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <Briefcase className="w-3 h-3" />
                            {applicant.jobs?.title || "Unknown Position"}
                          </p>
                          <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
                            <AlertCircle className="w-3 h-3" />
                            Belum Terdaftar
                          </span>
                        </div>
                      </div>
                      <div
                        className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition ${
                          selectedWorkers.includes(applicant.id)
                            ? "bg-green-500 border-green-500"
                            : "border-gray-300 bg-white"
                        }`}
                      >
                        {selectedWorkers.includes(applicant.id) && (
                          <Check className="w-5 h-5 text-white" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === "menunggu" && (
          <>
            {pendingContracts.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Tidak Ada Kontrak Menunggu
                </h3>
                <p className="text-gray-600">
                  Kontrak yang menunggu persetujuan admin akan muncul di sini
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingContracts.map((contract, index) => (
                  <div
                    key={contract.id}
                    className="bg-white rounded-xl border border-yellow-200 p-5 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-white font-bold">
                          <FileText className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">
                            Batch Pendaftaran #{index + 1}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {contract.workers?.length || 0} pekerja • Diajukan{" "}
                            {new Date(contract.createdAt).toLocaleDateString(
                              "id-ID"
                            )}
                          </p>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                        <Clock className="w-3 h-3" />
                        Menunggu Approval Admin
                      </span>
                    </div>

                    {/* Worker list in this batch */}
                    <div className="border-t border-gray-100 pt-4">
                      <p className="text-xs text-gray-500 mb-2 font-medium">
                        DAFTAR PEKERJA:
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {contract.workers?.map((worker) => (
                          <div
                            key={worker.id}
                            className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
                          >
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500 overflow-hidden">
                              {worker.jobseekers?.photo ? (
                                <img
                                  src={worker.jobseekers.photo}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                worker.jobseekers?.firstName?.charAt(0) || "U"
                              )}
                            </div>
                            <div className="overflow-hidden">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {worker.jobseekers?.firstName}{" "}
                                {worker.jobseekers?.lastName}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {worker.jobTitle}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === "terdaftar" && (
          <>
            {registeredWorkers.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Belum Ada Kontrak Disetujui
                </h3>
                <p className="text-gray-600">
                  Kontrak yang sudah disetujui admin akan muncul di sini
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {registeredWorkers.map((contract, index) => (
                  <div
                    key={contract.id}
                    className="bg-white rounded-xl border border-green-200 p-5 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold">
                          <CheckCircle className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">
                            Batch Kontrak #{index + 1}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {contract.workers?.length || 0} pekerja • Disetujui{" "}
                            {new Date(
                              contract.updatedAt || contract.createdAt
                            ).toLocaleDateString("id-ID")}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                          <CheckCircle className="w-3 h-3" />
                          Disetujui Admin
                        </span>
                        {contract.adminResponseDocUrl && (
                          <button
                            onClick={() => setPreviewDocUrl(contract.adminResponseDocUrl)}
                            className="text-xs text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
                          >
                            <FileText className="w-3 h-3" />
                            Lihat Surat Balasan
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Worker list in this batch */}
                    <div className="border-t border-gray-100 pt-4">
                      <p className="text-xs text-gray-500 mb-2 font-medium">
                        DAFTAR PEKERJA:
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {contract.workers?.map((worker) => (
                          <div
                            key={worker.id}
                            className="flex items-center gap-2 p-2 bg-green-50 rounded-lg"
                          >
                            <div className="w-8 h-8 rounded-full bg-green-200 flex items-center justify-center text-xs font-bold text-green-600 overflow-hidden">
                              {worker.jobseekers?.photo ? (
                                <img
                                  src={worker.jobseekers.photo}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                worker.jobseekers?.firstName?.charAt(0) || "U"
                              )}
                            </div>
                            <div className="overflow-hidden">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {worker.jobseekers?.firstName}{" "}
                                {worker.jobseekers?.lastName}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {worker.jobTitle}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === "total" && (
          <div className="space-y-6">
            {/* Pending Registration Section */}
            {acceptedApplicants.length > 0 && (
              <div>
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-yellow-500" />
                  Menunggu Pendaftaran ({acceptedApplicants.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {acceptedApplicants.map((applicant) => (
                    <div
                      key={applicant.id}
                      className="bg-white rounded-xl border border-yellow-200 p-4 shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-white font-bold overflow-hidden flex-shrink-0">
                          {applicant.jobseekers?.firstName?.charAt(0) || "U"}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {applicant.jobseekers?.firstName}{" "}
                            {applicant.jobseekers?.lastName}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {applicant.jobs?.title}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Pending Admin Section */}
            {pendingContracts.length > 0 && (
              <div>
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-yellow-500" />
                  Menunggu Persetujuan Admin ({pendingContracts.length} batch)
                </h3>
                <div className="space-y-3">
                  {pendingContracts.map((contract, index) => (
                    <div
                      key={contract.id}
                      className="bg-white rounded-xl border border-yellow-200 p-4 shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-white font-bold">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            Batch #{index + 1} - {contract.workers?.length || 0}{" "}
                            pekerja
                          </h4>
                          <p className="text-sm text-gray-500">
                            Diajukan{" "}
                            {new Date(contract.createdAt).toLocaleDateString(
                              "id-ID"
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Registered Section */}
            {registeredWorkers.length > 0 && (
              <div>
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Sudah Terdaftar ({registeredWorkers.length} batch)
                </h3>
                <div className="space-y-3">
                  {registeredWorkers.map((contract, index) => (
                    <div
                      key={contract.id}
                      className="bg-white rounded-xl border border-green-200 p-4 shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold">
                          <CheckCircle className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            Batch #{index + 1} - {contract.workers?.length || 0}{" "}
                            pekerja
                          </h4>
                          <p className="text-sm text-gray-500">
                            Disetujui{" "}
                            {new Date(
                              contract.updatedAt || contract.createdAt
                            ).toLocaleDateString("id-ID")}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {acceptedApplicants.length === 0 &&
              pendingContracts.length === 0 &&
              registeredWorkers.length === 0 && (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Belum Ada Pekerja
                  </h3>
                  <p className="text-gray-600">
                    Terima pelamar untuk mulai mendaftarkan kontrak
                  </p>
                </div>
              )}
          </div>
        )}
      </div>

      {/* Contract Registration Modal */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                Form Pendaftaran Kontrak
              </h2>
              <button
                onClick={() => setShowFormModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitContract} className="p-6 space-y-4">
              {/* Nama - Auto filled */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Nama
                </label>
                <div className="p-3 bg-gray-100 rounded-lg text-gray-700">
                  {getSelectedWorkersInfo()
                    .map(
                      (w) =>
                        `${w.jobseekers?.firstName} ${w.jobseekers?.lastName}`
                    )
                    .join(", ")}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Otomatis terisi dari pekerja yang dipilih
                </p>
              </div>

              {/* Jabatan - Auto filled */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Jabatan
                </label>
                <div className="p-3 bg-gray-100 rounded-lg text-gray-700">
                  {[
                    ...new Set(
                      getSelectedWorkersInfo().map((w) => w.jobs?.title)
                    ),
                  ].join(", ")}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Otomatis dari data lowongan
                </p>
              </div>

              {/* Periode Kontrak */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Periode Kontrak
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Mulai
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          startDate: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Akhir
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          endDate: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Upah */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Upah
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    Rp
                  </span>
                  <input
                    type="text"
                    value={formData.salary}
                    onChange={handleSalaryChange}
                    placeholder="0"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                    required
                  />
                </div>
              </div>

              {/* Lampiran / Dokumen Pengantar */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Dokumen Pengantar / Lampiran
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Upload surat pengantar atau dokumen pendukung pendaftaran kontrak
                </p>
                <div className="relative">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    id="attachment-input"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                  <label
                    htmlFor="attachment-input"
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition"
                  >
                    <Upload className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">
                      {attachmentFile
                        ? attachmentFile.name
                        : "Pilih File Dokumen"}
                    </span>
                  </label>
                </div>
              </div>

              {/* Keterangan */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Keterangan
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  rows={3}
                  placeholder="Tambahkan keterangan (opsional)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 resize-none"
                />
              </div>

              {/* Submit */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Mengirim...
                    </>
                  ) : (
                    <>
                      <FileText className="w-5 h-5" />
                      Daftar
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Document Preview Modal */}
      {previewDocUrl && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-500" />
                Surat Balasan Admin
              </h3>
              <button
                onClick={() => setPreviewDocUrl(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-gray-50">
              {previewDocUrl.toLowerCase().endsWith('.pdf') ? (
                <iframe
                  src={previewDocUrl}
                  className="w-full h-[70vh] rounded-lg border border-gray-200"
                  title="Document Preview"
                />
              ) : (
                <div className="flex items-center justify-center">
                  <img
                    src={previewDocUrl}
                    alt="Surat Balasan"
                    className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
                  />
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setPreviewDocUrl(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
              >
                Tutup
              </button>
              <a
                href={previewDocUrl}
                download
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
