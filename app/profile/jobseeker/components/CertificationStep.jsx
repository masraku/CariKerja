import { Award, X, Upload, Plus, FileText } from 'lucide-react'

export default function CertificationStep({
    formData,
    handleArrayChange,
    handleCertificateUpload,
    removeArrayItem,
    addArrayItem,
    uploadProgress,
    isUploading
}) {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Award className="w-7 h-7 text-indigo-600" />
                Sertifikat & Pelatihan
            </h2>

            <p className="text-gray-600 mb-4">
                Tambahkan sertifikat profesional, pelatihan, atau kursus yang pernah Anda ikuti.
            </p>

            {formData.certifications.map((cert, index) => (
                <div key={index} className="border-2 border-gray-200 rounded-xl p-6 relative">
                    {formData.certifications.length > 1 && (
                        <button
                            type="button"
                            onClick={() => removeArrayItem(index, 'certifications')}
                            className="absolute top-4 right-4 text-red-500 hover:text-red-700"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}

                    <h3 className="font-bold text-gray-900 mb-4">Sertifikat #{index + 1}</h3>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Nama Sertifikat
                            </label>
                            <input
                                type="text"
                                value={cert.name}
                                onChange={(e) => handleArrayChange(index, 'name', e.target.value, 'certifications')}
                                className="w-full text-gray-900 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="Contoh: AWS Certified Solutions Architect"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Lembaga Penerbit
                            </label>
                            <input
                                type="text"
                                value={cert.issuingOrganization}
                                onChange={(e) => handleArrayChange(index, 'issuingOrganization', e.target.value, 'certifications')}
                                className="w-full text-gray-900 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="Contoh: Amazon Web Services"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Tanggal Terbit
                            </label>
                            <input
                                type="month"
                                value={cert.issueDate}
                                onChange={(e) => handleArrayChange(index, 'issueDate', e.target.value, 'certifications')}
                                className="w-full text-gray-900 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Tanggal Kadaluarsa (Opsional)
                            </label>
                            <input
                                type="month"
                                value={cert.expiryDate}
                                onChange={(e) => handleArrayChange(index, 'expiryDate', e.target.value, 'certifications')}
                                className="w-full text-gray-900 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Credential ID
                            </label>
                            <input
                                type="text"
                                value={cert.credentialId}
                                onChange={(e) => handleArrayChange(index, 'credentialId', e.target.value, 'certifications')}
                                className="w-full text-gray-900 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="ABC123XYZ"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                URL Credential
                            </label>
                            <input
                                type="url"
                                value={cert.credentialUrl}
                                onChange={(e) => handleArrayChange(index, 'credentialUrl', e.target.value, 'certifications')}
                                className="w-full text-gray-900 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="https://credential-url.com/verify"
                            />
                        </div>

                        <div className="md:col-span-2 border-t border-gray-200 pt-4 mt-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Upload Sertifikat
                            </label>
                            {cert.certificateFileName ? (
                                <div className="flex items-center justify-between bg-green-50 p-4 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Award className="w-6 h-6 text-green-600" />
                                        <p className="font-medium text-gray-900">{cert.certificateFileName}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            handleArrayChange(index, 'certificateFile', null, 'certifications')
                                            handleArrayChange(index, 'certificateFileName', '', 'certifications')
                                            handleArrayChange(index, 'certificateUrl', '', 'certifications')
                                        }}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            ) : (
                                <label className={`border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-indigo-500 transition block ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-600">Klik untuk upload (PDF, JPG, PNG - Max 2MB)</p>
                                    <input
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={(e) => handleCertificateUpload(e, index)}
                                        className="hidden"
                                        disabled={isUploading}
                                    />
                                </label>
                            )}
                            {uploadProgress[`cert-${index}`] && (
                                <div className="mt-2">
                                    <div className="bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-green-600 h-2 rounded-full transition-all"
                                            style={{ width: `${uploadProgress[`cert-${index}`]}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ))}

            <button
                type="button"
                onClick={() => addArrayItem('certifications', {
                    name: '',
                    issuingOrganization: '',
                    issueDate: '',
                    expiryDate: '',
                    credentialId: '',
                    credentialUrl: '',
                    certificateFile: null,
                    certificateFileName: '',
                    certificateUrl: ''
                })}
                className="w-full text-gray-900 py-3 border-2 border-dashed border-indigo-300 rounded-xl text-indigo-600 font-semibold hover:bg-indigo-50 transition flex items-center justify-center gap-2"
            >
                <Plus className="w-5 h-5" />
                Tambah Sertifikat
            </button>
        </div>
    )
}
