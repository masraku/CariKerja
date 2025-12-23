import { Briefcase, X, Plus } from 'lucide-react'

export default function ExperienceStep({
    formData,
    handleArrayChange,
    handleNestedArrayChange,
    removeArrayItem,
    addArrayItem,
    setFormData,
    addNestedArrayItem
}) {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Briefcase className="w-7 h-7 text-indigo-600" />
                Pengalaman Kerja
            </h2>

            <p className="text-gray-600 mb-4">
                Jika Anda fresh graduate atau belum memiliki pengalaman kerja, Anda bisa skip bagian ini.
            </p>

            {formData.experiences.map((experience, index) => (
                <div key={index} className="border-2 border-gray-200 rounded-xl p-6 relative">
                    {formData.experiences.length > 1 && (
                        <button
                            type="button"
                            onClick={() => removeArrayItem(index, 'experiences')}
                            className="absolute top-4 right-4 text-red-500 hover:text-red-700"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}

                    <h3 className="font-bold text-gray-900 mb-4">Pengalaman #{index + 1}</h3>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Nama Perusahaan
                            </label>
                            <input
                                type="text"
                                value={experience.company}
                                onChange={(e) => handleArrayChange(index, 'company', e.target.value, 'experiences')}
                                className="w-full text-gray-900 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="PT Example Indonesia"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Posisi/Jabatan
                            </label>
                            <input
                                type="text"
                                value={experience.position}
                                onChange={(e) => handleArrayChange(index, 'position', e.target.value, 'experiences')}
                                className="w-full text-gray-900 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="Frontend Developer"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Lokasi
                            </label>
                            <input
                                type="text"
                                value={experience.location}
                                onChange={(e) => handleArrayChange(index, 'location', e.target.value, 'experiences')}
                                className="w-full text-gray-900 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="Jakarta"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Mulai
                            </label>
                            <input
                                type="month"
                                value={experience.startDate}
                                onChange={(e) => handleArrayChange(index, 'startDate', e.target.value, 'experiences')}
                                className="w-full text-gray-900 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Selesai
                            </label>
                            <input
                                type="month"
                                value={experience.endDate}
                                onChange={(e) => handleArrayChange(index, 'endDate', e.target.value, 'experiences')}
                                className="w-full text-gray-900 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                disabled={experience.isCurrent}
                            />
                        </div>

                        <div className="md:col-span-2 flex items-center">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={experience.isCurrent}
                                    onChange={(e) => handleArrayChange(index, 'isCurrent', e.target.checked, 'experiences')}
                                    className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                                />
                                <span className="text-sm font-medium text-gray-700">
                                    Masih bekerja di sini
                                </span>
                            </label>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Deskripsi Pekerjaan
                            </label>
                            <textarea
                                value={experience.description}
                                onChange={(e) => handleArrayChange(index, 'description', e.target.value, 'experiences')}
                                rows="4"
                                className="w-full text-gray-900 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="Jelaskan tanggung jawab dan tugas Anda..."
                            ></textarea>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Pencapaian
                            </label>
                            {experience.achievements.map((achievement, achIndex) => (
                                <div key={achIndex} className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={achievement}
                                        onChange={(e) => handleNestedArrayChange(index, achIndex, e.target.value, 'experiences', 'achievements')}
                                        className="text-gray-900 flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        placeholder="Contoh: Meningkatkan performa website 50%"
                                    />
                                    {experience.achievements.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    experiences: prev.experiences.map((exp, i) =>
                                                        i === index
                                                            ? { ...exp, achievements: exp.achievements.filter((_, j) => j !== achIndex) }
                                                            : exp
                                                    )
                                                }))
                                            }}
                                            className="px-3 text-red-500 hover:text-red-700"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => addNestedArrayItem(index, 'experiences', 'achievements', '')}
                                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1 mt-2"
                            >
                                <Plus className="w-4 h-4" />
                                Tambah Pencapaian
                            </button>
                        </div>
                    </div>
                </div>
            ))}

            <button
                type="button"
                onClick={() => addArrayItem('experiences', {
                    company: '',
                    position: '',
                    location: '',
                    startDate: '',
                    endDate: '',
                    isCurrent: false,
                    description: '',
                    achievements: ['']
                })}
                className="w-full text-gray-900 py-3 border-2 border-dashed border-indigo-300 rounded-xl text-indigo-600 font-semibold hover:bg-indigo-50 transition flex items-center justify-center gap-2"
            >
                <Plus className="w-5 h-5" />
                Tambah Pengalaman
            </button>
        </div>
    )
}
