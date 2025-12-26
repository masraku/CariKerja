"use client";
import { useState } from "react";
import {
  FileText,
  Upload,
  X,
  Eye,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export default function DokumenStep({
  formData = {},
  handleCVUpload = () => {},
  handleKTPUpload = () => {},
  handleAK1Upload = () => {},
  handleIjazahUpload = () => {},
  handleSertifikatUpload = () => {},
  handleSuratPengalamanUpload = () => {},
  uploadProgress = {},
  isUploading = false,
  setFormData = () => {},
}) {
  // Modal state for document preview
  const [previewModal, setPreviewModal] = useState({
    isOpen: false,
    url: "",
    fileName: "",
    fileType: "",
  });

  // Document config - 6 total (4 required, 2 optional)
  const documents = [
    {
      key: "cv",
      label: "CV / Daftar Riwayat Hidup",
      required: true,
      fileUrl: formData.cvUrl,
      fileName: formData.cvFileName,
      onUpload: handleCVUpload,
      description: "Upload CV dalam format PDF (maks. 5MB)",
      accept: ".pdf,.doc,.docx",
    },
    {
      key: "ktp",
      label: "KTP (Kartu Tanda Penduduk)",
      required: true,
      fileUrl: formData.ktpUrl,
      fileName: formData.ktpFileName,
      onUpload: handleKTPUpload,
      description: "Upload foto atau scan KTP (maks. 2MB)",
      accept: ".pdf,.jpg,.jpeg,.png",
    },
    {
      key: "ak1",
      label: "AK1 (Kartu Pencari Kerja)",
      required: true,
      fileUrl: formData.ak1Url,
      fileName: formData.ak1FileName,
      onUpload: handleAK1Upload,
      description: "Kartu kuning dari Disnaker (maks. 2MB)",
      accept: ".pdf,.jpg,.jpeg,.png",
    },
    {
      key: "ijazah",
      label: "Ijazah Pendidikan Terakhir",
      required: true,
      fileUrl: formData.ijazahUrl,
      fileName: formData.ijazahFileName,
      onUpload: handleIjazahUpload,
      description: "Scan ijazah pendidikan terakhir (maks. 2MB)",
      accept: ".pdf,.jpg,.jpeg,.png",
    },
    {
      key: "sertifikat",
      label: "Sertifikat Pelatihan / Kursus",
      required: false,
      fileUrl: formData.sertifikatUrl,
      fileName: formData.sertifikatFileName,
      onUpload: handleSertifikatUpload,
      description: "Sertifikat pelatihan, kursus, atau kompetensi (opsional)",
      accept: ".pdf,.jpg,.jpeg,.png",
    },
    {
      key: "suratPengalaman",
      label: "Surat Pengalaman Kerja",
      required: false,
      fileUrl: formData.suratPengalamanUrl,
      fileName: formData.suratPengalamanFileName,
      onUpload: handleSuratPengalamanUpload,
      description:
        "Surat keterangan bekerja dari perusahaan sebelumnya (opsional)",
      accept: ".pdf,.jpg,.jpeg,.png",
    },
  ];

  const removeDocument = (key) => {
    setFormData((prev) => ({
      ...prev,
      [`${key}Url`]: "",
      [`${key}FileName`]: "",
      [`${key}File`]: null,
    }));
  };

  const openPreview = (url, fileName) => {
    // Determine file type from URL or filename
    const extension = (fileName || url).split(".").pop().toLowerCase();
    const fileType = ["jpg", "jpeg", "png", "gif", "webp"].includes(extension)
      ? "image"
      : "pdf";

    setPreviewModal({
      isOpen: true,
      url,
      fileName,
      fileType,
    });
  };

  const closePreview = () => {
    setPreviewModal({
      isOpen: false,
      url: "",
      fileName: "",
      fileType: "",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <FileText className="w-7 h-7 text-indigo-600" />
          Upload Dokumen
        </h2>
        <p className="text-gray-500 mt-1 ml-10">
          Unggah dokumen yang diperlukan untuk melengkapi profil
        </p>
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500"></span>
          <span className="text-gray-600">Wajib</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-gray-300"></span>
          <span className="text-gray-600">Opsional</span>
        </div>
      </div>

      {/* Document Upload Cards */}
      <div className="space-y-4">
        {documents.map((doc) => (
          <div
            key={doc.key}
            className={`border-2 rounded-2xl p-5 transition-all ${
              doc.fileUrl
                ? "border-green-200 bg-green-50/50"
                : doc.required
                ? "border-gray-200 hover:border-indigo-200"
                : "border-dashed border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900">{doc.label}</h3>
                  {doc.required ? (
                    <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-bold rounded-full">
                      Wajib
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs font-medium rounded-full">
                      Opsional
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">{doc.description}</p>

                {/* Show uploaded file */}
                {doc.fileUrl && (
                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-green-200">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-gray-700 truncate max-w-[200px]">
                        {doc.fileName || "File uploaded"}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => openPreview(doc.fileUrl, doc.fileName)}
                      className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeDocument(doc.key)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Upload progress */}
                {uploadProgress[doc.key] && (
                  <div className="mt-3">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 transition-all duration-300"
                        style={{ width: `${uploadProgress[doc.key]}%` }}
                      />
                    </div>
                    <p className="text-xs text-indigo-600 mt-1">
                      Uploading... {uploadProgress[doc.key]}%
                    </p>
                  </div>
                )}
              </div>

              {/* Upload Button */}
              {!doc.fileUrl && (
                <label className="shrink-0 flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl cursor-pointer transition font-medium text-sm">
                  <Upload className="w-4 h-4" />
                  Upload
                  <input
                    type="file"
                    accept={doc.accept}
                    onChange={doc.onUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                </label>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Info Box */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800">
          <p className="font-semibold mb-1">Tips Upload Dokumen:</p>
          <ul className="list-disc list-inside space-y-1 text-amber-700">
            <li>Pastikan dokumen dapat terbaca dengan jelas</li>
            <li>Gunakan format PDF untuk CV agar lebih profesional</li>
            <li>Ukuran maksimal file adalah 5MB per dokumen</li>
          </ul>
        </div>
      </div>

      {/* Preview Modal */}
      {previewModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900 truncate pr-4">
                {previewModal.fileName || "Preview Dokumen"}
              </h3>
              <div className="flex items-center gap-2">
                <a
                  href={previewModal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                >
                  Buka di Tab Baru
                </a>
                <button
                  onClick={closePreview}
                  className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
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
                  className="w-full h-[70vh] rounded-lg border border-gray-200"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
