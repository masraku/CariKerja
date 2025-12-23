import { GraduationCap, X, Upload, Plus, FileText } from 'lucide-react'

export default function EducationStep({
    formData,
    educationLevels,
    handleArrayChange,
    handleDiplomaUpload,
    uploadProgress,
    removeArrayItem,
    addArrayItem,
    isUploading
}) {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <GraduationCap className="w-7 h-7 text-indigo-600" />
                Riwayat Pendidikan
            </h2>

            {formData.educations.map((education, index) => (
                <div key={index} className="border-2 border-gray-200 rounded-xl p-6 relative">
                    {formData.educations.length > 1 && (
                        <button
                            type="button"
                            onClick={() => removeArrayItem(index, 'educations')}
                            className="absolute top-4 right-4 text-red-500 hover:text-red-700"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}

                    <h3 className="font-bold text-gray-900 mb-4">Pendidikan #{index + 1}</h3>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Nama Institusi <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={education.institution}
                                onChange={(e) => handleArrayChange(index, 'institution', e.target.value, 'educations')}
                                className="w-full text-gray-900 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="Universitas Indonesia"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Jenjang <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={education.level}
                                onChange={(e) => handleArrayChange(index, 'level', e.target.value, 'educations')}
                                className="w-full text-gray-900 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                required
                            >
                                <option value="">Pilih Jenjang</option>
                                {educationLevels.map((level) => (
                                    <option key={level} value={level}>{level}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Gelar (Beri - jika tidak ada)<span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={education.degree}
                                onChange={(e) => handleArrayChange(index, 'degree', e.target.value, 'educations')}
                                className="w-full text-gray-900 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="Sarjana Komputer"
                                required
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Jurusan <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={education.fieldOfStudy}
                                onChange={(e) => handleArrayChange(index, 'fieldOfStudy', e.target.value, 'educations')}
                                className="w-full text-gray-900 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="Teknik Informatika"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Tahun Mulai <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="month"
                                value={education.startDate}
                                onChange={(e) => handleArrayChange(index, 'startDate', e.target.value, 'educations')}
                                className="w-full text-gray-900 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Tahun Selesai
                            </label>
                            <input
                                type="month"
                                value={education.endDate}
                                onChange={(e) => handleArrayChange(index, 'endDate', e.target.value, 'educations')}
                                className="w-full text-gray-900 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                disabled={education.isCurrent}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                IPK/Nilai
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                max="4"
                                value={education.gpa}
                                onChange={(e) => handleArrayChange(index, 'gpa', e.target.value, 'educations')}
                                className="w-full text-gray-900 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="3.50"
                            />
                        </div>

                        <div className="flex items-center pt-8">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={education.isCurrent}
                                    onChange={(e) => handleArrayChange(index, 'isCurrent', e.target.checked, 'educations')}
                                    className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                                />
                                <span className="text-sm font-medium text-gray-700">
                                    Masih berkuliah di sini
                                </span>
                            </label>
                        </div>

                        <div className="md:col-span-2 border-t border-gray-200 pt-4 mt-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Upload Ijazah/Transkrip Nilai
                            </label>
                            {education.diplomaFileName ? (
                                <div className="flex items-center justify-between bg-green-50 p-4 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <FileText className="w-6 h-6 text-green-600" />
                                        <p className="font-medium text-gray-900">{education.diplomaFileName}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            handleArrayChange(index, 'diplomaFile', null, 'educations')
                                            handleArrayChange(index, 'diplomaFileName', '', 'educations')
                                            handleArrayChange(index, 'diplomaUrl', '', 'educations')
                                        }}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            ) : (
                                <label className={`border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-indigo-500 transition block ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-600">Klik untuk upload (PDF, Max 2MB)</p>
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        onChange={(e) => handleDiplomaUpload(e, index)}
                                        className="hidden"
                                        disabled={isUploading}
                                    />
                                </label>
                            )}
                            {uploadProgress[`diploma-${index}`] && (
                                <div className="mt-2">
                                    <div className="bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-green-600 h-2 rounded-full transition-all"
                                            style={{ width: `${uploadProgress[`diploma-${index}`]}%` }}
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
                onClick={() => addArrayItem('educations', {
                    institution: '',
                    degree: '',
                    fieldOfStudy: '',
                    level: '',
                    startDate: '',
                    endDate: '',
                    gpa: '',
                    isCurrent: false,
                    diplomaFile: null,
                    diplomaFileName: '',
                    diplomaUrl: ''
                })}
                className="w-full text-gray-900 py-3 border-2 border-dashed border-indigo-300 rounded-xl text-indigo-600 font-semibold hover:bg-indigo-50 transition flex items-center justify-center gap-2"
            >
                <Plus className="w-5 h-5" />
                Tambah Pendidikan
            </button>
        </div>
    )
}
