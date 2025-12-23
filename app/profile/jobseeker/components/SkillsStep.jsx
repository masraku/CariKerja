import { Star, X, Plus } from 'lucide-react'

export default function SkillsStep({ formData, handleInputChange, setFormData }) {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Star className="w-7 h-7 text-indigo-600" />
                Skills & Keahlian
            </h2>

            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 mb-6">
                <p className="text-gray-700 mb-2">
                    <strong>Tips:</strong> Tambahkan skills yang relevan dengan pekerjaan yang Anda inginkan.
                </p>
                <p className="text-sm text-gray-600">
                    Contoh: JavaScript, React, Node.js, Python, SQL, Git, Docker, AWS, UI/UX Design, Project Management
                </p>
            </div>

            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Ringkasan Profesional <span className="text-red-500">*</span>
                </label>
                <textarea
                    name="summary"
                    value={formData.summary}
                    onChange={handleInputChange}
                    rows="5"
                    className="w-full text-gray-900 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Ceritakan tentang diri Anda, keahlian, dan pengalaman profesional..."
                    required
                ></textarea>
                <p className="text-sm text-gray-500 mt-2">
                    {formData.summary.length}/500 karakter
                </p>
            </div>

            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Posisi/Jabatan Saat Ini
                </label>
                <input
                    type="text"
                    name="currentTitle"
                    value={formData.currentTitle}
                    onChange={handleInputChange}
                    className="w-full text-gray-900 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Contoh: Senior Frontend Developer"
                />
            </div>

            <div className="border-t border-gray-200 pt-6">
                <label className="block text-sm font-semibold text-gray-700 mb-4">
                    Daftar Skills <span className="text-red-500">*</span>
                </label>

                <div className="space-y-3">
                    {formData.skills.map((skill, index) => (
                        <div key={index} className="flex gap-2">
                            <input
                                type="text"
                                value={skill}
                                onChange={(e) => {
                                    const newSkills = [...formData.skills]
                                    newSkills[index] = e.target.value
                                    setFormData(prev => ({ ...prev, skills: newSkills }))
                                }}
                                className="flex-1 text-gray-900 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder={`Skill ${index + 1}`}
                            />
                            {formData.skills.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        const newSkills = formData.skills.filter((_, i) => i !== index)
                                        setFormData(prev => ({ ...prev, skills: newSkills }))
                                    }}
                                    className="px-4 py-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, skills: [...prev.skills, ''] }))}
                    className="mt-4 w-full py-3 border-2 border-dashed border-indigo-300 rounded-xl text-indigo-600 font-semibold hover:bg-indigo-50 transition flex items-center justify-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Tambah Skill
                </button>
            </div>

            {/* Skills Preview */}
            {formData.skills.filter(s => s).length > 0 && (
                <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Preview Skills:</h3>
                    <div className="flex flex-wrap gap-2">
                        {formData.skills.filter(s => s).map((skill, index) => (
                            <span
                                key={index}
                                className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium"
                            >
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
