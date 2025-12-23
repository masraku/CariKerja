import { FileText, CheckCircle } from 'lucide-react'
import RupiahInput from '@/components/RupiahInput'

export default function PreferencesStep({ formData, handleInputChange, jobTypes, formatRupiah, calculateAge }) {
    return (
        <div className="space-y-6">
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                    <FileText className="w-7 h-7 text-indigo-600" />
                    <h2 className="text-2xl font-bold text-gray-900">
                        Preferensi Pekerjaan
                    </h2>
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                        Opsional
                    </span>
                </div>
                <p className="text-gray-500 text-sm ml-10">
                    Bagian ini opsional. Anda bisa langsung klik "Simpan Profile" atau isi preferensi untuk hasil pencarian yang lebih akurat.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Posisi yang Diinginkan
                    </label>
                    <input
                        type="text"
                        name="desiredJobTitle"
                        value={formData.desiredJobTitle}
                        onChange={handleInputChange}
                        className="w-full text-gray-900 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Contoh: Senior Frontend Developer"
                    />
                </div>

                {/*RupiahInput untuk Salary */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Ekspektasi Gaji (Minimum)
                    </label>
                    <RupiahInput
                        name="desiredSalaryMin"
                        value={formData.desiredSalaryMin}
                        onChange={handleInputChange}
                        placeholder="5.000.000"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Ekspektasi Gaji (Maximum)
                    </label>
                    <RupiahInput
                        name="desiredSalaryMax"
                        value={formData.desiredSalaryMax}
                        onChange={handleInputChange}
                        placeholder="10.000.000"
                    />
                </div>

                {/* Preview Salary Range */}
                {formData.desiredSalaryMin && formData.desiredSalaryMax && (
                    <div className="md:col-span-2">
                        <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
                            <p className="text-sm text-indigo-600 font-medium mb-1">
                                Preview Range Gaji:
                            </p>
                            <p className="text-lg font-bold text-gray-900">
                                Rp {formatRupiah(formData.desiredSalaryMin)} - Rp {formatRupiah(formData.desiredSalaryMax)}
                            </p>
                        </div>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Lokasi Preferensi
                    </label>
                    <input
                        type="text"
                        name="preferredLocation"
                        value={formData.preferredLocation}
                        onChange={handleInputChange}
                        className="w-full text-gray-900 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Jakarta, Bandung, Remote"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Tipe Pekerjaan
                    </label>
                    <select
                        name="preferredJobType"
                        value={formData.preferredJobType}
                        onChange={handleInputChange}
                        className="w-full text-gray-900 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                        <option value="">Pilih Tipe</option>
                        {jobTypes.map((type) => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Bersedia Mulai Dari
                    </label>
                    <input
                        type="date"
                        name="availableFrom"
                        value={formData.availableFrom}
                        onChange={handleInputChange}
                        className="w-full text-gray-900 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="flex items-center gap-3 cursor-pointer p-4 border-2 border-gray-200 rounded-xl hover:border-indigo-300 transition">
                        <input
                            type="checkbox"
                            name="willingToRelocate"
                            checked={formData.willingToRelocate}
                            onChange={handleInputChange}
                            className="w-6 h-6 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                        />
                        <div>
                            <span className="font-semibold text-gray-900 block">Bersedia Relokasi</span>
                            <span className="text-sm text-gray-500">Saya bersedia pindah ke kota lain jika diperlukan</span>
                        </div>
                    </label>
                </div>
            </div>

            {/* Summary */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border-2 border-indigo-200 mt-8">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <CheckCircle className="w-6 h-6 text-indigo-600" />
                    Ringkasan Profile
                </h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-gray-600">Nama Lengkap</p>
                        <p className="font-semibold text-gray-900">{formData.firstName} {formData.lastName || '-'}</p>
                    </div>
                    <div>
                        <p className="text-gray-600">Umur</p>
                        <p className="font-semibold text-gray-900">{calculateAge(formData.dateOfBirth) || '-'} tahun</p>
                    </div>
                    <div>
                        <p className="text-gray-600">Lokasi</p>
                        <p className="font-semibold text-gray-900">{formData.city || '-'}, {formData.province || '-'}</p>
                    </div>
                    <div>
                        <p className="text-gray-600">Kontak</p>
                        <p className="font-semibold text-gray-900">{formData.phone || '-'}</p>
                    </div>
                    <div>
                        <p className="text-gray-600">Pendidikan</p>
                        <p className="font-semibold text-gray-900">{formData.educations[0]?.level || '-'} - {formData.educations[0]?.fieldOfStudy || '-'}</p>
                    </div>
                    <div>
                        <p className="text-gray-600">Pengalaman</p>
                        <p className="font-semibold text-gray-900">{formData.experiences[0]?.company ? 'Ada' : 'Fresh Graduate'}</p>
                    </div>
                    {formData.desiredSalaryMin && formData.desiredSalaryMax && (
                        <div className="md:col-span-2">
                            <p className="text-gray-600">Ekspektasi Gaji</p>
                            <p className="font-semibold text-gray-900">
                                Rp {formatRupiah(formData.desiredSalaryMin)} - Rp {formatRupiah(formData.desiredSalaryMax)}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
