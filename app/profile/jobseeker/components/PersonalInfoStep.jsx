import { User, Upload } from 'lucide-react'

export default function PersonalInfoStep({ 
    formData, 
    handleInputChange, 
    handlePhotoUpload, 
    uploadProgress, 
    isUploading, 
    calculateAge 
}) {
    const religions = ['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu', 'Lainnya']
    const genders = ['Laki-laki', 'Perempuan']
    const maritalStatuses = ['Belum Menikah', 'Menikah', 'Cerai']

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <User className="w-7 h-7 text-indigo-600" />
                Informasi Pribadi
            </h2>

            {/* Photo Upload */}
            <div className="flex flex-col items-center mb-8">
                <div className="relative group">
                    {formData.photoPreview ? (
                        <img
                            src={formData.photoPreview}
                            alt="Profile"
                            className="w-32 h-32 rounded-full object-cover border-4 border-indigo-200"
                        />
                    ) : (
                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center border-4 border-indigo-200">
                            <User className="w-16 h-16 text-indigo-400" />
                        </div>
                    )}
                    <label className={`absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full cursor-pointer hover:bg-indigo-700 transition shadow-lg ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <Upload className="w-5 h-5" />
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            className="hidden"
                            disabled={isUploading}
                        />
                    </label>
                </div>
                <p className="text-sm text-gray-500 mt-3">Upload foto profil (Max 2MB)</p>
                {uploadProgress.photo && (
                    <div className="mt-2 w-32">
                        <div className="bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-indigo-600 h-2 rounded-full transition-all"
                                style={{ width: `${uploadProgress.photo}%` }}
                            ></div>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Nama Depan <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full text-black px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Contoh: John"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Nama Belakang <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full text-black px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Contoh: Doe"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Tanggal Lahir <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        className="w-full text-black px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                    />
                    {formData.dateOfBirth && (
                        <p className="text-sm text-indigo-600 mt-2">
                            Umur: {calculateAge(formData.dateOfBirth)} tahun
                        </p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Jenis Kelamin <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        className="w-full text-black px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                    >
                        <option value="">Pilih Jenis Kelamin</option>
                        {genders.map((gender) => (
                            <option key={gender} value={gender}>{gender}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Agama <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="religion"
                        value={formData.religion}
                        onChange={handleInputChange}
                        className="w-full text-black px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                    >
                        <option value="">Pilih Agama</option>
                        {religions.map((religion) => (
                            <option key={religion} value={religion}>{religion}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Status Pernikahan
                    </label>
                    <select
                        name="maritalStatus"
                        value={formData.maritalStatus}
                        onChange={handleInputChange}
                        className="w-full text-black px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                        <option value="">Pilih Status</option>
                        {maritalStatuses.map((status) => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Kewarganegaraan
                    </label>
                    <input
                        type="text"
                        name="nationality"
                        value={formData.nationality}
                        onChange={handleInputChange}
                        className="w-full text-black px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Indonesia"
                    />
                </div>
            </div>
        </div>
    )
}
