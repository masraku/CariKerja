import { Phone, FileText, Eye, X, Upload, Globe, Linkedin, Github } from 'lucide-react'

export default function ContactStep({
    formData,
    handleInputChange,
    handleCVUpload,
    handleKTPUpload,
    handleAK1Upload,
    uploadProgress,
    isUploading,
    setDocumentModal,
    setFormData,
    provinces
}) {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Phone className="w-7 h-7 text-indigo-600" />
                Informasi Kontak & Dokumen
            </h2>

            {/* Contact Info */}
            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Nomor Telepon <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full text-gray-900 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="+62 812 3456 7890"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full text-gray-900 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="email@example.com"
                        required
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Alamat Lengkap <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full text-gray-900 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Jl. Contoh No. 123, RT/RW 001/002"
                        required
                    ></textarea>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Provinsi <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="province"
                        value={formData.province}
                        onChange={handleInputChange}
                        className="w-full text-gray-900 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                    >
                        <option value="">Pilih Provinsi</option>
                        {provinces.map((province) => (
                            <option key={province} value={province}>{province}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Kota/Kabupaten <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full text-gray-900 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Contoh: Jakarta Selatan"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Kode Pos
                    </label>
                    <input
                        type="text"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        className="w-full text-gray-900 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="12345"
                        maxLength="5"
                    />
                </div>
            </div>

            {/* CV Upload Section */}
            <div className="border-t border-gray-200 pt-6 mt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="w-6 h-6 text-indigo-600" />
                    Upload Dokumen <span className="text-red-500">*</span>
                </h3>
                <p className="text-sm text-gray-500 mb-4">Upload dokumen-dokumen berikut dalam format PDF atau gambar (Max 2MB per file)</p>

                <div className="grid md:grid-cols-3 gap-4">
                    {/* CV Upload */}
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-indigo-500 transition">
                        <p className="text-sm font-semibold text-gray-700 mb-3">CV Terbaru <span className="text-red-500">*</span></p>
                        {formData.cvFileName ? (
                            <div className="bg-indigo-50 p-3 rounded-lg">
                                <FileText className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                                <p className="text-xs font-semibold text-gray-900 truncate">{formData.cvFileName}</p>
                                <div className="flex gap-2 mt-2 justify-center">
                                    <button
                                        type="button"
                                        onClick={() => setDocumentModal({ isOpen: true, url: formData.cvUrl, title: 'CV' })}
                                        className="text-indigo-600 hover:text-indigo-800 text-xs flex items-center gap-1"
                                    >
                                        <Eye className="w-3 h-3" /> Lihat
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, cvFile: null, cvFileName: '', cvUrl: '' }))}
                                        className="text-red-500 hover:text-red-700 text-xs flex items-center gap-1"
                                    >
                                        <X className="w-3 h-3" /> Hapus
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <label className={`cursor-pointer block ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-xs text-gray-500">Klik untuk upload</p>
                                <input
                                    type="file"
                                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                    onChange={handleCVUpload}
                                    className="hidden"
                                    disabled={isUploading}
                                />
                            </label>
                        )}
                        {uploadProgress.cv && (
                            <div className="mt-2">
                                <div className="bg-gray-200 rounded-full h-1.5">
                                    <div className="bg-indigo-600 h-1.5 rounded-full transition-all" style={{ width: `${uploadProgress.cv}%` }}></div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* KTP Upload */}
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-indigo-500 transition">
                        <p className="text-sm font-semibold text-gray-700 mb-3">KTP <span className="text-red-500">*</span></p>
                        {formData.ktpFileName ? (
                            <div className="bg-green-50 p-3 rounded-lg">
                                <FileText className="w-8 h-8 text-green-600 mx-auto mb-2" />
                                <p className="text-xs font-semibold text-gray-900 truncate">{formData.ktpFileName}</p>
                                <div className="flex gap-2 mt-2 justify-center">
                                    <button
                                        type="button"
                                        onClick={() => setDocumentModal({ isOpen: true, url: formData.ktpUrl, title: 'KTP' })}
                                        className="text-green-600 hover:text-green-800 text-xs flex items-center gap-1"
                                    >
                                        <Eye className="w-3 h-3" /> Lihat
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, ktpFile: null, ktpFileName: '', ktpUrl: '' }))}
                                        className="text-red-500 hover:text-red-700 text-xs flex items-center gap-1"
                                    >
                                        <X className="w-3 h-3" /> Hapus
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <label className={`cursor-pointer block ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-xs text-gray-500">Klik untuk upload</p>
                                <input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={handleKTPUpload}
                                    className="hidden"
                                    disabled={isUploading}
                                />
                            </label>
                        )}
                        {uploadProgress.ktp && (
                            <div className="mt-2">
                                <div className="bg-gray-200 rounded-full h-1.5">
                                    <div className="bg-green-600 h-1.5 rounded-full transition-all" style={{ width: `${uploadProgress.ktp}%` }}></div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* AK-1 Upload */}
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-indigo-500 transition">
                        <p className="text-sm font-semibold text-gray-700 mb-3">Kartu AK-1 Disnaker <span className="text-red-500">*</span></p>
                        {formData.ak1FileName ? (
                            <div className="bg-orange-50 p-3 rounded-lg">
                                <FileText className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                                <p className="text-xs font-semibold text-gray-900 truncate">{formData.ak1FileName}</p>
                                <div className="flex gap-2 mt-2 justify-center">
                                    <button
                                        type="button"
                                        onClick={() => setDocumentModal({ isOpen: true, url: formData.ak1Url, title: 'Kartu AK-1' })}
                                        className="text-orange-600 hover:text-orange-800 text-xs flex items-center gap-1"
                                    >
                                        <Eye className="w-3 h-3" /> Lihat
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, ak1File: null, ak1FileName: '', ak1Url: '' }))}
                                        className="text-red-500 hover:text-red-700 text-xs flex items-center gap-1"
                                    >
                                        <X className="w-3 h-3" /> Hapus
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <label className={`cursor-pointer block ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-xs text-gray-500">Klik untuk upload</p>
                                <input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={handleAK1Upload}
                                    className="hidden"
                                    disabled={isUploading}
                                />
                            </label>
                        )}
                        {uploadProgress.ak1 && (
                            <div className="mt-2">
                                <div className="bg-gray-200 rounded-full h-1.5">
                                    <div className="bg-orange-600 h-1.5 rounded-full transition-all" style={{ width: `${uploadProgress.ak1}%` }}></div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-700">
                        <strong>Info:</strong> Kartu AK-1 (Kartu Tanda Pencari Kerja) bisa didapatkan di Dinas Tenaga Kerja setempat.
                        Untuk penduduk Kab. Cirebon, daftar online di{' '}
                        <a
                            href="https://disnaker.cirebonkab.go.id/form_antrian_ak1"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline font-semibold"
                        >
                            disnaker.cirebonkab.go.id
                        </a>
                        . Lihat info lengkap di halaman{' '}
                        <a href="/warning" className="text-blue-600 hover:text-blue-800 underline font-semibold">
                            S&K
                        </a>.
                    </p>
                </div>
            </div>

            {/* Social Media & Portfolio Section */}
            <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Globe className="w-6 h-6 text-indigo-600" />
                    Social Media & Portfolio
                </h3>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <div className="flex items-center gap-2">
                                <Linkedin className="w-5 h-5 text-blue-600" />
                                LinkedIn (Opsional)
                            </div>
                        </label>
                        <input
                            type="url"
                            name="linkedinUrl"
                            value={formData.linkedinUrl}
                            onChange={handleInputChange}
                            className="w-full text-gray-900 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="https://linkedin.com/in/username"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <div className="flex items-center gap-2">
                                <Github className="w-5 h-5 text-gray-900" />
                                GitHub (Opsional)
                            </div>
                        </label>
                        <input
                            type="url"
                            name="githubUrl"
                            value={formData.githubUrl}
                            onChange={handleInputChange}
                            className="w-full text-gray-900 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="https://github.com/username"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <div className="flex items-center gap-2">
                                <Globe className="w-5 h-5 text-indigo-600" />
                                Website (Opsional)
                            </div>
                        </label>
                        <input
                            type="url"
                            name="websiteUrl"
                            value={formData.websiteUrl}
                            onChange={handleInputChange}
                            className="w-full text-gray-900 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="https://website.com"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
