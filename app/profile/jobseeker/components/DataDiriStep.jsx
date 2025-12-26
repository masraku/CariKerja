"use client";
import { useState, useEffect } from "react";
import { User, Phone, MapPin, FileText, Camera, Upload } from "lucide-react";
import { getAllKecamatan, getKelurahanByKecamatan } from "@/lib/cirebonData";

export default function DataDiriStep({
  formData = {},
  handleInputChange = () => {},
  handlePhotoUpload = () => {},
  uploadProgress = {},
  isUploading = false,
}) {
  const [kecamatanList] = useState(getAllKecamatan());
  const [kelurahanList, setKelurahanList] = useState([]);

  // Update kelurahan when kecamatan changes
  useEffect(() => {
    if (formData.kecamatan) {
      setKelurahanList(getKelurahanByKecamatan(formData.kecamatan));
    } else {
      setKelurahanList([]);
    }
  }, [formData.kecamatan]);

  const genderOptions = ["Laki-laki", "Perempuan"];
  const religionOptions = [
    "Islam",
    "Kristen",
    "Katolik",
    "Hindu",
    "Buddha",
    "Konghucu",
    "Lainnya",
  ];
  const maritalOptions = [
    "Belum Menikah",
    "Menikah",
    "Cerai Hidup",
    "Cerai Mati",
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <User className="w-7 h-7 text-indigo-600" />
          Data Diri
        </h2>
        <p className="text-gray-500 mt-1 ml-10">
          Lengkapi informasi pribadi Anda
        </p>
      </div>

      {/* Photo Upload */}
      <div className="flex justify-center">
        <div className="relative group">
          <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-xl">
            {formData.photoPreview || formData.photo ? (
              <img
                src={formData.photoPreview || formData.photo}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-12 h-12 text-indigo-300" />
            )}
          </div>
          <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-indigo-600 hover:bg-indigo-700 rounded-xl flex items-center justify-center cursor-pointer shadow-lg transition group-hover:scale-110">
            <Camera className="w-5 h-5 text-white" />
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </label>
          {uploadProgress.photo && (
            <div className="absolute -bottom-6 left-0 right-0 text-center text-xs text-indigo-600">
              Uploading... {uploadProgress.photo}%
            </div>
          )}
        </div>
      </div>

      {/* ====== INFORMASI PRIBADI ====== */}
      <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
        <h3 className="font-bold text-gray-800 flex items-center gap-2 text-lg">
          <User className="w-5 h-5 text-indigo-600" />
          Informasi Pribadi
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Nama Depan */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nama Depan <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName || ""}
              onChange={handleInputChange}
              className="w-full text-gray-900 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Nama depan"
              required
            />
          </div>

          {/* Nama Belakang */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nama Belakang
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName || ""}
              onChange={handleInputChange}
              className="w-full text-gray-900 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Nama belakang"
            />
          </div>

          {/* Tanggal Lahir */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tanggal Lahir <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-3 items-center">
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth || ""}
                onChange={handleInputChange}
                className="flex-1 text-gray-900 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
              {formData.dateOfBirth && (
                <div className="px-3 py-2 bg-indigo-100 text-indigo-700 rounded-xl font-semibold text-sm whitespace-nowrap">
                  {(() => {
                    const today = new Date();
                    const birthDate = new Date(formData.dateOfBirth);
                    let age = today.getFullYear() - birthDate.getFullYear();
                    const monthDiff = today.getMonth() - birthDate.getMonth();
                    if (
                      monthDiff < 0 ||
                      (monthDiff === 0 && today.getDate() < birthDate.getDate())
                    ) {
                      age--;
                    }
                    return `${age} tahun`;
                  })()}
                </div>
              )}
            </div>
          </div>

          {/* Jenis Kelamin */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Jenis Kelamin <span className="text-red-500">*</span>
            </label>
            <select
              name="gender"
              value={formData.gender || ""}
              onChange={handleInputChange}
              className="w-full text-gray-900 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            >
              <option value="">Pilih</option>
              {genderOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Agama */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Agama <span className="text-red-500">*</span>
            </label>
            <select
              name="religion"
              value={formData.religion || ""}
              onChange={handleInputChange}
              className="w-full text-gray-900 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            >
              <option value="">Pilih</option>
              {religionOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Status Pernikahan */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Status Pernikahan <span className="text-red-500">*</span>
            </label>
            <select
              name="maritalStatus"
              value={formData.maritalStatus || ""}
              onChange={handleInputChange}
              className="w-full text-gray-900 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            >
              <option value="">Pilih</option>
              {maritalOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* NIK */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nomor Induk Kependudukan (NIK){" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="idNumber"
              value={formData.idNumber || ""}
              onChange={handleInputChange}
              className="w-full text-gray-900 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="16 digit NIK"
              maxLength={16}
              required
            />
          </div>
        </div>
      </div>

      {/* ====== ALAMAT (CIREBON) ====== */}
      <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
        <h3 className="font-bold text-gray-800 flex items-center gap-2 text-lg">
          <MapPin className="w-5 h-5 text-indigo-600" />
          Alamat (Kabupaten Cirebon)
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Kecamatan */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Kecamatan <span className="text-red-500">*</span>
            </label>
            <select
              name="kecamatan"
              value={formData.kecamatan || ""}
              onChange={handleInputChange}
              className="w-full text-gray-900 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            >
              <option value="">Pilih Kecamatan</option>
              {kecamatanList.map((kec) => (
                <option key={kec} value={kec}>
                  {kec}
                </option>
              ))}
            </select>
          </div>

          {/* Kelurahan/Desa */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Kelurahan/Desa <span className="text-red-500">*</span>
            </label>
            <select
              name="kelurahan"
              value={formData.kelurahan || ""}
              onChange={handleInputChange}
              className="w-full text-gray-900 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
              disabled={!formData.kecamatan}
            >
              <option value="">Pilih Kelurahan/Desa</option>
              {kelurahanList.map((kel) => (
                <option key={kel} value={kel}>
                  {kel}
                </option>
              ))}
            </select>
          </div>

          {/* Alamat Lengkap */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Alamat Lengkap (RT/RW, Dusun, dll)
            </label>
            <textarea
              name="address"
              value={formData.address || ""}
              onChange={handleInputChange}
              rows={2}
              className="w-full text-gray-900 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              placeholder="Contoh: Jl. Raya No. 123, RT 01/RW 02, Dusun Melati"
            />
          </div>
        </div>
      </div>

      {/* ====== KONTAK ====== */}
      <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
        <h3 className="font-bold text-gray-800 flex items-center gap-2 text-lg">
          <Phone className="w-5 h-5 text-indigo-600" />
          Kontak
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Nomor Telepon */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nomor Telepon <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone || ""}
              onChange={handleInputChange}
              className="w-full text-gray-900 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="08xxxxxxxxxx"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email || ""}
              onChange={handleInputChange}
              className="w-full text-gray-900 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="email@example.com"
              required
            />
          </div>
        </div>
      </div>

      {/* ====== PENDIDIKAN TERAKHIR ====== */}
      <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
        <h3 className="font-bold text-gray-800 flex items-center gap-2 text-lg">
          <FileText className="w-5 h-5 text-indigo-600" />
          Pendidikan Terakhir
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Jenjang Pendidikan */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Jenjang Pendidikan <span className="text-red-500">*</span>
            </label>
            <select
              name="lastEducationLevel"
              value={formData.lastEducationLevel || ""}
              onChange={handleInputChange}
              className="w-full text-gray-900 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            >
              <option value="">Pilih Jenjang</option>
              <option value="SD">SD / Sederajat</option>
              <option value="SMP">SMP / Sederajat</option>
              <option value="SMA">SMA / Sederajat</option>
              <option value="SMK">SMK / Sederajat</option>
              <option value="D1">D1</option>
              <option value="D2">D2</option>
              <option value="D3">D3</option>
              <option value="D4">D4</option>
              <option value="S1">S1 (Sarjana)</option>
              <option value="S2">S2 (Magister)</option>
              <option value="S3">S3 (Doktor)</option>
            </select>
          </div>

          {/* Tahun Lulus */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tahun Lulus <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="graduationYear"
              value={formData.graduationYear || ""}
              onChange={handleInputChange}
              className="w-full text-gray-900 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Contoh: 2023"
              min="1970"
              max={new Date().getFullYear()}
              required
            />
          </div>

          {/* Nama Institusi */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nama Sekolah / Universitas <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="lastEducationInstitution"
              value={formData.lastEducationInstitution || ""}
              onChange={handleInputChange}
              className="w-full text-gray-900 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Contoh: SMKN 1 Cirebon / Universitas Swadaya Gunung Jati"
              required
            />
          </div>

          {/* Jurusan / Bidang Studi */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Jurusan / Bidang Studi
            </label>
            <input
              type="text"
              name="lastEducationMajor"
              value={formData.lastEducationMajor || ""}
              onChange={handleInputChange}
              className="w-full text-gray-900 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Contoh: Teknik Komputer dan Jaringan / Manajemen"
            />
          </div>
        </div>
      </div>
      <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
        <h3 className="font-bold text-gray-800 flex items-center gap-2 text-lg">
          <FileText className="w-5 h-5 text-indigo-600" />
          Ringkasan Profesional
        </h3>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Tentang Saya / Ringkasan Karir
          </label>
          <textarea
            name="summary"
            value={formData.summary || ""}
            onChange={handleInputChange}
            rows={4}
            className="w-full text-gray-900 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            placeholder="Ceritakan secara singkat tentang diri Anda, keahlian, dan pengalaman kerja Anda..."
          />
          <p className="text-xs text-gray-400 mt-2">
            Tulis ringkasan singkat yang menggambarkan diri Anda sebagai
            profesional
          </p>
        </div>
      </div>
    </div>
  );
}
