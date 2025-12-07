'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import {
    Briefcase,
    MapPin,
    DollarSign,
    Calendar,
    Users,
    FileText,
    Award,
    Clock,
    ArrowLeft,
    ArrowRight,
    Check,
    Save,
    X,
    Plus
} from 'lucide-react'
import Swal from 'sweetalert2'
import RupiahInput from '@/components/RupiahInput'

export default function PostJobPage() {
    const router = useRouter()
    const { user } = useAuth()
    const [currentStep, setCurrentStep] = useState(1)
    const [isSaving, setIsSaving] = useState(false)
    const [isCheckingVerification, setIsCheckingVerification] = useState(true)

    // Check company verification on page load
    useEffect(() => {
        checkCompanyVerification()
    }, [])

    const checkCompanyVerification = async () => {
        try {
            const token = localStorage.getItem('token')
            if (!token) {
                router.push('/login?role=recruiter')
                return
            }

            // Fetch recruiter profile to check company verification status
            const response = await fetch('/api/profile/recruiter', {
                headers: { 'Authorization': `Bearer ${token}` }
            })

            const data = await response.json()

            if (!response.ok) {
                Swal.fire({
                    icon: 'error',
                    title: 'Gagal Memuat Profile',
                    text: 'Silakan coba lagi atau hubungi admin.',
                    confirmButtonColor: '#2563EB'
                }).then(() => {
                    router.push('/profile/recruiter/dashboard')
                })
                return
            }

            // Check if company is verified
            // API returns { success: true, profile: { companies: { verified: true/false } } }
            const profile = data.profile
            console.log('📥 Profile data:', profile)
            
            // If no profile exists, redirect to create profile
            if (!profile) {
                Swal.fire({
                    icon: 'info',
                    title: 'Profile Belum Lengkap',
                    text: 'Silakan lengkapi profile perusahaan terlebih dahulu.',
                    confirmButtonColor: '#2563EB'
                }).then(() => {
                    router.push('/profile/recruiter')
                })
                return
            }

            // Check company verification - companies is the relation name from Prisma
            const company = profile.companies
            console.log('📥 Company data:', company)
            
            if (!company?.verified) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Perusahaan Belum Terverifikasi',
                    html: `
                        <p class="mb-2">Anda belum bisa memposting lowongan kerja.</p>
                        <p class="text-sm text-gray-600">Perusahaan Anda harus terverifikasi terlebih dahulu oleh admin sebelum dapat memposting lowongan.</p>
                    `,
                    confirmButtonColor: '#2563EB',
                    confirmButtonText: 'Kembali ke Dashboard'
                }).then(() => {
                    router.push('/profile/recruiter/dashboard')
                })
                return
            }

            // Company is verified, allow access
            setIsCheckingVerification(false)

        } catch (error) {
            console.error('Error checking verification:', error)
            Swal.fire({
                icon: 'error',
                title: 'Terjadi Kesalahan',
                text: 'Gagal memeriksa status verifikasi perusahaan.',
                confirmButtonColor: '#2563EB'
            }).then(() => {
                router.push('/profile/recruiter/dashboard')
            })
        }
    }

    const [formData, setFormData] = useState({
        // Basic Info
        title: '',
        description: '',
        requirements: '',
        responsibilities: '',

        // Job Details
        jobType: 'FULL_TIME',
        level: 'MID_LEVEL',
        category: '',

        // Location
        location: '',
        city: '',
        province: '',
        isRemote: false,

        // Salary
        salaryMin: '',
        salaryMax: '',
        salaryType: 'monthly',
        showSalary: true,

        // Work Schedule
        workingDays: 'Senin - Jumat',
        holidays: 'Sabtu - Minggu',

        // Requirements
        minExperience: '',
        maxExperience: '',
        educationLevel: '',

        // Additional
        benefits: [],
        numberOfPositions: 1,
        applicationDeadline: '',

        // Job Type Specific
        contractDuration: '',        // For CONTRACT (in months)
        partTimeHours: '',           // For PART_TIME (hours per week)
        internshipDuration: '',      // For INTERNSHIP (in months)
        hasPocketMoney: false,       // For INTERNSHIP
        hasCertificate: false,       // For INTERNSHIP

        // Skills
        skills: []
    })

    const [newBenefit, setNewBenefit] = useState('')
    const [newSkill, setNewSkill] = useState('')

    // Handle input change
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }

    // Add benefit
    const handleAddBenefit = () => {
        if (newBenefit.trim()) {
            setFormData(prev => ({
                ...prev,
                benefits: [...prev.benefits, newBenefit.trim()]
            }))
            setNewBenefit('')
        }
    }

    // Remove benefit
    const handleRemoveBenefit = (index) => {
        setFormData(prev => ({
            ...prev,
            benefits: prev.benefits.filter((_, i) => i !== index)
        }))
    }

    // Add skill
    const handleAddSkill = () => {
        if (newSkill.trim()) {
            setFormData(prev => ({
                ...prev,
                skills: [...prev.skills, newSkill.trim()]
            }))
            setNewSkill('')
        }
    }

    // Remove skill
    const handleRemoveSkill = (index) => {
        setFormData(prev => ({
            ...prev,
            skills: prev.skills.filter((_, i) => i !== index)
        }))
    }

    // Format rupiah for preview (optional)
    const formatRupiah = (value) => {
        if (!value) return ''
        const number = value.toString().replace(/[^0-9]/g, '')
        return number.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    }

    // Submit job
    const handleSubmit = async () => {
        try {
            setIsSaving(true)

            // Check token first
            const token = localStorage.getItem('token')
            if (!token) {
                Swal.fire({
                    icon: 'error',
                    title: 'Session Expired',
                    text: 'Please login again',
                    confirmButtonColor: '#2563EB'
                }).then(() => {
                    router.push('/login?role=recruiter')
                })
                return
            }

            // Validate required fields
            if (!formData.title || !formData.description) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Data Tidak Lengkap',
                    text: 'Posisi dan deskripsi wajib diisi',
                    confirmButtonColor: '#2563EB'
                })
                return
            }

            // ✅ Prepare data - value dari RupiahInput sudah numeric string
            const submitData = {
                ...formData,
                salaryMin: formData.salaryMin ? parseInt(formData.salaryMin) : null,
                salaryMax: formData.salaryMax ? parseInt(formData.salaryMax) : null
            }

            console.log('📤 Submitting job:', submitData.title)

            const response = await fetch('/api/profile/recruiter/jobs/create', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(submitData)
            })

            console.log('📥 Response status:', response.status)

            const data = await response.json()
            console.log('📥 Response data:', data)

            if (response.ok) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Berhasil!',
                    text: 'Lowongan berhasil dipublikasikan!',
                    confirmButtonColor: '#2563EB'
                })
                router.push('/profile/recruiter/dashboard')
            } else {
                // Handle specific errors
                if (response.status === 401) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Session Expired',
                        text: 'Sesi Anda telah berakhir. Silakan login kembali.',
                        confirmButtonColor: '#2563EB'
                    }).then(() => {
                        localStorage.removeItem('token')
                        router.push('/login?role=recruiter')
                    })
                } else if (response.status === 404) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Profile Belum Lengkap',
                        text: data.error || 'Silakan lengkapi profile perusahaan Anda terlebih dahulu',
                        confirmButtonColor: '#2563EB'
                    }).then(() => {
                        router.push('/profile/recruiter')
                    })
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Gagal!',
                        text: data.error || 'Gagal mempublikasikan lowongan',
                        confirmButtonColor: '#2563EB'
                    })
                }
            }
        } catch (error) {
            console.error('❌ Submit job error:', error)
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: 'Terjadi kesalahan saat mempublikasikan: ' + error.message,
                confirmButtonColor: '#2563EB'
            })
        } finally {
            setIsSaving(false)
        }
    }

    // Steps configuration - 4 steps (combined Informasi & Persyaratan)
    const steps = [
        { number: 1, title: 'Informasi & Persyaratan', icon: Briefcase },
        { number: 2, title: 'Lokasi & Tipe', icon: MapPin },
        { number: 3, title: 'Gaji & Jadwal', icon: DollarSign },
        { number: 4, title: 'Benefits & Skills', icon: Users }
    ]

    // Show loading while checking verification
    if (isCheckingVerification) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Memeriksa status perusahaan...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Pasang Lowongan Baru
                    </h1>
                    <p className="text-gray-600">
                        Buat lowongan pekerjaan untuk menarik kandidat terbaik
                    </p>
                </div>

                {/* Progress Steps */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between">
                        {steps.map((step, index) => (
                            <div key={step.number} className="flex items-center flex-1">
                                <div className="flex flex-col items-center flex-1">
                                    <div
                                        className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition ${currentStep === step.number
                                            ? 'bg-blue-600 text-white'
                                            : currentStep > step.number
                                                ? 'bg-green-500 text-white'
                                                : 'bg-gray-200 text-gray-600'
                                            }`}
                                    >
                                        {currentStep > step.number ? (
                                            <Check className="w-6 h-6" />
                                        ) : (
                                            <step.icon className="w-6 h-6" />
                                        )}
                                    </div>
                                    <span className="text-xs text-center mt-2 font-medium hidden md:block">
                                        {step.title}
                                    </span>
                                </div>
                                {index < steps.length - 1 && (
                                    <div
                                        className={`h-1 flex-1 mx-2 ${currentStep > step.number ? 'bg-green-500' : 'bg-gray-200'
                                            }`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form Content */}
                <form className="bg-white rounded-lg shadow-sm p-6">
                    {/* Step 1: Basic Info */}
                    {currentStep === 1 && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                Informasi Dasar
                            </h2>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Posisi / Jabatan *
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Contoh: Frontend Developer"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Deskripsi Pekerjaan *
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={6}
                                    className="w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Jelaskan tentang pekerjaan ini, lingkungan kerja, dan apa yang akan dikerjakan..."
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Persyaratan *
                                </label>
                                <textarea
                                    name="requirements"
                                    value={formData.requirements}
                                    onChange={handleChange}
                                    rows={5}
                                    className="w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Contoh:&#10;- Minimal S1 Informatika&#10;- Pengalaman 2 tahun di React&#10;- Menguasai TypeScript"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tanggung Jawab *
                                </label>
                                <textarea
                                    name="responsibilities"
                                    value={formData.responsibilities}
                                    onChange={handleChange}
                                    rows={5}
                                    className="w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Contoh:&#10;- Mengembangkan fitur baru&#10;- Melakukan code review&#10;- Berkolaborasi dengan tim"
                                    required
                                />
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Kategori *
                                    </label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        className="w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    >
                                        <option value="">Pilih Kategori</option>
                                        <option value="Technology">Technology</option>
                                        <option value="Marketing">Marketing</option>
                                        <option value="Sales">Sales</option>
                                        <option value="Finance">Finance</option>
                                        <option value="HR">Human Resources</option>
                                        <option value="Design">Design</option>
                                        <option value="Customer Service">Customer Service</option>
                                        <option value="Operations">Operations</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Level *
                                    </label>
                                    <select
                                        name="level"
                                        value={formData.level}
                                        onChange={handleChange}
                                        className="w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    >
                                        <option value="ENTRY_LEVEL">Entry Level</option>
                                        <option value="JUNIOR">Junior</option>
                                        <option value="MID_LEVEL">Mid Level</option>
                                        <option value="SENIOR">Senior</option>
                                        <option value="LEAD">Lead</option>
                                        <option value="MANAGER">Manager</option>
                                        <option value="DIRECTOR">Director</option>
                                    </select>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="border-t border-gray-200 pt-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Persyaratan Kandidat
                                </h3>
                                
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Pendidikan Minimal
                                        </label>
                                        <select
                                            name="educationLevel"
                                            value={formData.educationLevel}
                                            onChange={handleChange}
                                            className="w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="">Tidak ada persyaratan khusus</option>
                                            <option value="SMA">SMA/SMK</option>
                                            <option value="D3">Diploma (D3)</option>
                                            <option value="S1">Sarjana (S1)</option>
                                            <option value="S2">Magister (S2)</option>
                                            <option value="S3">Doktor (S3)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Pengalaman Kerja (Tahun)
                                        </label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-xs text-gray-600 mb-1 block">Min</label>
                                                <input
                                                    type="number"
                                                    name="minExperience"
                                                    value={formData.minExperience}
                                                    onChange={handleChange}
                                                    min="0"
                                                    className="w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="0"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-600 mb-1 block">Max</label>
                                                <input
                                                    type="number"
                                                    name="maxExperience"
                                                    value={formData.maxExperience}
                                                    onChange={handleChange}
                                                    min="0"
                                                    className="w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="5"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Location & Type */}
                    {currentStep === 2 && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                Lokasi & Tipe Pekerjaan
                            </h2>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tipe Pekerjaan *
                                </label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-gray-900">
                                    {[
                                        { value: 'FULL_TIME', label: 'Full Time', icon: '💼', desc: 'Pegawai tetap' },
                                        { value: 'PART_TIME', label: 'Part Time', icon: '⏰', desc: 'Paruh waktu' },
                                        { value: 'CONTRACT', label: 'Kontrak', icon: '📄', desc: 'Durasi tertentu' },
                                        { value: 'INTERNSHIP', label: 'Magang', icon: '🎓', desc: 'Program magang' }
                                    ].map(type => (
                                        <label
                                            key={type.value}
                                            className={`p-4 border-2 rounded-lg text-center cursor-pointer transition ${formData.jobType === type.value
                                                ? 'border-blue-600 bg-blue-50'
                                                : 'border-gray-200 hover:border-blue-300'
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name="jobType"
                                                value={type.value}
                                                checked={formData.jobType === type.value}
                                                onChange={handleChange}
                                                className="sr-only"
                                            />
                                            <div className="text-2xl mb-1">{type.icon}</div>
                                            <div className="font-medium">{type.label}</div>
                                            <div className="text-xs text-gray-500 mt-1">{type.desc}</div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Contract Specific Options */}
                            {formData.jobType === 'CONTRACT' && (
                                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                                    <h3 className="font-medium text-orange-900 mb-3 flex items-center gap-2">
                                        📄 Detail Kontrak
                                    </h3>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Durasi Kontrak (Bulan) *
                                            </label>
                                            <input
                                                type="number"
                                                name="contractDuration"
                                                value={formData.contractDuration}
                                                onChange={handleChange}
                                                min="1"
                                                max="60"
                                                className="w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                                placeholder="12"
                                                required
                                            />
                                            <p className="text-xs text-gray-500 mt-1">Contoh: 6 bulan, 12 bulan</p>
                                        </div>
                                        <div className="flex items-center">
                                            <div className="p-3 bg-orange-100 rounded-lg">
                                                <p className="text-sm text-orange-800">
                                                    💡 Kontrak dapat diperpanjang sesuai kebutuhan perusahaan dan kinerja karyawan.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Part Time Specific Options */}
                            {formData.jobType === 'PART_TIME' && (
                                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                                    <h3 className="font-medium text-purple-900 mb-3 flex items-center gap-2">
                                        ⏰ Detail Part Time
                                    </h3>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Jam Kerja per Minggu *
                                            </label>
                                            <input
                                                type="number"
                                                name="partTimeHours"
                                                value={formData.partTimeHours}
                                                onChange={handleChange}
                                                min="1"
                                                max="35"
                                                className="w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                placeholder="20"
                                                required
                                            />
                                            <p className="text-xs text-gray-500 mt-1">Umumnya 10-25 jam per minggu</p>
                                        </div>
                                        <div className="flex items-center">
                                            <div className="p-3 bg-purple-100 rounded-lg">
                                                <p className="text-sm text-purple-800">
                                                    💡 Jam kerja fleksibel dan dapat disesuaikan dengan jadwal pekerja.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Internship Specific Options */}
                            {formData.jobType === 'INTERNSHIP' && (
                                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                    <h3 className="font-medium text-green-900 mb-3 flex items-center gap-2">
                                        🎓 Detail Program Magang
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Durasi Magang (Bulan) *
                                                </label>
                                                <input
                                                    type="number"
                                                    name="internshipDuration"
                                                    value={formData.internshipDuration}
                                                    onChange={handleChange}
                                                    min="1"
                                                    max="12"
                                                    className="w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                    placeholder="3"
                                                    required
                                                />
                                                <p className="text-xs text-gray-500 mt-1">Umumnya 3-6 bulan</p>
                                            </div>
                                        </div>
                                        
                                        <div className="border-t border-green-200 pt-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                                Fasilitas Magang
                                            </label>
                                            <div className="grid md:grid-cols-2 gap-3">
                                                <label className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition ${formData.hasPocketMoney ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300'}`}>
                                                    <input
                                                        type="checkbox"
                                                        name="hasPocketMoney"
                                                        checked={formData.hasPocketMoney}
                                                        onChange={handleChange}
                                                        className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                                                    />
                                                    <div>
                                                        <div className="font-medium text-gray-900">💰 Uang Saku</div>
                                                        <div className="text-xs text-gray-500">Tersedia tunjangan bulanan</div>
                                                    </div>
                                                </label>
                                                <label className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition ${formData.hasCertificate ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300'}`}>
                                                    <input
                                                        type="checkbox"
                                                        name="hasCertificate"
                                                        checked={formData.hasCertificate}
                                                        onChange={handleChange}
                                                        className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                                                    />
                                                    <div>
                                                        <div className="font-medium text-gray-900">📜 Sertifikat</div>
                                                        <div className="text-xs text-gray-500">Sertifikat setelah selesai</div>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Full Time Info */}
                            {formData.jobType === 'FULL_TIME' && (
                                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <h3 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                                        💼 Pegawai Tetap / Full Time
                                    </h3>
                                    <p className="text-sm text-blue-800">
                                        Posisi ini adalah untuk karyawan penuh waktu dengan jam kerja standar (40 jam/minggu). 
                                        Termasuk benefit seperti BPJS, cuti tahunan, dan fasilitas lainnya sesuai kebijakan perusahaan.
                                    </p>
                                </div>
                            )}

                            <div>
                                <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 transition">
                                    <input
                                        type="checkbox"
                                        name="isRemote"
                                        checked={formData.isRemote}
                                        onChange={handleChange}
                                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                    />
                                    <div>
                                        <div className="font-medium text-gray-900">Remote / Work From Home</div>
                                        <div className="text-sm text-gray-600">Pekerjaan ini bisa dikerjakan dari rumah</div>
                                    </div>
                                </label>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Alamat Lengkap Kantor *
                                </label>
                                <textarea
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Jl. Sudirman No. 123, Jakarta Pusat"
                                    required={!formData.isRemote}
                                />
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Kota *
                                    </label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        className="w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Jakarta"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Provinsi *
                                    </label>
                                    <input
                                        type="text"
                                        name="province"
                                        value={formData.province}
                                        onChange={handleChange}
                                        className="w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="DKI Jakarta"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Jumlah Posisi yang Dibuka
                                </label>
                                <input
                                    type="number"
                                    name="numberOfPositions"
                                    value={formData.numberOfPositions}
                                    onChange={handleChange}
                                    min="1"
                                    className="w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 3: Salary & Schedule */}
                    {currentStep === 3 && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                Gaji & Jadwal Kerja
                            </h2>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Range Gaji
                                </label>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-gray-600 mb-1 block">Gaji Minimum</label>
                                        <RupiahInput
                                            name="salaryMin"
                                            value={formData.salaryMin}
                                            onChange={handleChange}
                                            placeholder="5.000.000"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-600 mb-1 block">Gaji Maximum</label>
                                        <RupiahInput
                                            name="salaryMax"
                                            value={formData.salaryMax}
                                            onChange={handleChange}
                                            placeholder="10.000.000"
                                        />
                                    </div>
                                </div>

                                {/* Preview Gaji */}
                                {formData.salaryMin && formData.salaryMax && (
                                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                        <p className="text-sm text-blue-900">
                                            <span className="font-medium">Preview Gaji:</span>
                                            {' '}Rp {formatRupiah(formData.salaryMin)} - Rp {formatRupiah(formData.salaryMax)}
                                            {formData.salaryType === 'monthly' && ' / bulan'}
                                            {formData.salaryType === 'yearly' && ' / tahun'}
                                            {formData.salaryType === 'hourly' && ' / jam'}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tipe Gaji
                                </label>
                                <select
                                    name="salaryType"
                                    value={formData.salaryType}
                                    onChange={handleChange}
                                    className="w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="monthly">Per Bulan</option>
                                    <option value="yearly">Per Tahun</option>
                                    <option value="hourly">Per Jam</option>
                                </select>
                            </div>

                            <div>
                                <label className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        name="showSalary"
                                        checked={formData.showSalary}
                                        onChange={handleChange}
                                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700">
                                        Tampilkan gaji di lowongan
                                    </span>
                                </label>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Hari Kerja *
                                    </label>
                                    <input
                                        type="text"
                                        name="workingDays"
                                        value={formData.workingDays}
                                        onChange={handleChange}
                                        className="w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Senin - Jumat"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Hari Libur *
                                    </label>
                                    <input
                                        type="text"
                                        name="holidays"
                                        value={formData.holidays}
                                        onChange={handleChange}
                                        className="w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Sabtu - Minggu"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Batas Akhir Lamaran
                                </label>
                                <input
                                    type="date"
                                    name="applicationDeadline"
                                    value={formData.applicationDeadline}
                                    onChange={handleChange}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 5: Benefits & Skills */}
                    {/* Step 4: Benefits & Skills */}
                    {currentStep === 4 && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                Benefits & Skills
                            </h2>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Benefits & Fasilitas
                                </label>
                                <div className="flex gap-2 mb-3">
                                    <input
                                        type="text"
                                        value={newBenefit}
                                        onChange={(e) => setNewBenefit(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault()
                                                handleAddBenefit()
                                            }
                                        }}
                                        className="text-gray-900 flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Contoh: BPJS Kesehatan"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddBenefit}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                    >
                                        <Plus className="w-5 h-5" />
                                    </button>
                                </div>

                                {formData.benefits.length > 0 && (
                                    <div className="space-y-2">
                                        {formData.benefits.map((benefit, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                            >
                                                <span className="text-gray-700">{benefit}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveBenefit(index)}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Skills yang Dibutuhkan
                                </label>
                                <div className="flex gap-2 mb-3">
                                    <input
                                        type="text"
                                        value={newSkill}
                                        onChange={(e) => setNewSkill(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault()
                                                handleAddSkill()
                                            }
                                        }}
                                        className="text-gray-900 flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Contoh: React, Node.js"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddSkill}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                    >
                                        <Plus className="w-5 h-5" />
                                    </button>
                                </div>

                                {formData.skills.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {formData.skills.map((skill, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg"
                                            >
                                                <span className="font-medium">{skill}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveSkill(index)}
                                                    className="text-blue-600 hover:text-blue-800"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                            disabled={currentStep === 1}
                            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition ${currentStep === 1
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Sebelumnya
                        </button>

                        {currentStep < steps.length ? (
                            <button
                                type="button"
                                onClick={() => setCurrentStep(prev => prev + 1)}
                                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                            >
                                Selanjutnya
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={isSaving}
                                className={`flex items-center gap-2 px-6 py-3 rounded-lg transition ${isSaving
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-green-600 text-white hover:bg-green-700'
                                    }`}
                            >
                                {isSaving ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Mempublikasikan...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        Publikasikan Lowongan
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    )
}