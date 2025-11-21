'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { User, Briefcase, Building2, MapPin, Globe, Phone, Mail, Calendar, Users, Award, FileText, ArrowLeft, ArrowRight, Check,Save, XCircle } from 'lucide-react'
import Swal from 'sweetalert2'

export default function RecruiterProfilePage() {
    const router = useRouter()
    const { user, refreshUser } = useAuth()
    const [currentStep, setCurrentStep] = useState(1)
    const [isLoading, setIsLoading] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [isEditMode, setIsEditMode] = useState(false)

    // Form data
    const [formData, setFormData] = useState({
        // Personal Info
        firstName: '',
        lastName: '',
        position: '',
        phone: '',
        department: '',

        // Company Info
        companyName: '',
        companySlug: '',
        companyLogo: '',
        tagline: '',
        description: '',
        industry: '',
        companySize: '',
        foundedYear: '',

        // Company Contact
        companyEmail: '',
        companyPhone: '',
        website: '',

        // Company Address
        address: '',
        city: '',
        province: '',
        postalCode: '',

        // Social Media
        linkedinUrl: '',
        facebookUrl: '',
        twitterUrl: '',
        instagramUrl: '',

        // Additional
        culture: '',
        benefits: []
    })

    const [newBenefit, setNewBenefit] = useState('')

    // Load existing profile
    useEffect(() => {
        loadProfile()
    }, [])

    const handleSave = async () => {
        try {
            setIsSaving(true)

            const response = await fetch('/api/profile/recruiter', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            })

            const data = await response.json()

            if (response.ok) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Berhasil!',
                    text: data.message,
                    confirmButtonColor: '#2563EB'
                })

                // ✅ CRITICAL: Refresh user data untuk update header
                await refreshUser()

                // Redirect to dashboard
                router.push('/profile/recruiter/dashboard')

                // Force refresh
                router.refresh()
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Gagal!',
                    text: data.error || 'Gagal menyimpan profile',
                    confirmButtonColor: '#2563EB'
                })
            }
        } catch (error) {
            console.error('Save profile error:', error)
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: 'Terjadi kesalahan saat menyimpan',
                confirmButtonColor: '#2563EB'
            })
        } finally {
            setIsSaving(false)
        }
    }


    const loadProfile = async () => {
        try {
            setIsLoading(true)
            const response = await fetch('/api/profile/recruiter', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })

            if (response.ok) {
                const data = await response.json()
                if (data.profile) {
                    setIsEditMode(true)
                    setFormData({
                        firstName: data.profile.firstName || '',
                        lastName: data.profile.lastName || '',
                        position: data.profile.position || '',
                        phone: data.profile.phone || '',
                        department: data.profile.department || '',

                        companyName: data.profile.company?.name || '',
                        companySlug: data.profile.company?.slug || '',
                        companyLogo: data.profile.company?.logo || '',
                        tagline: data.profile.company?.tagline || '',
                        description: data.profile.company?.description || '',
                        industry: data.profile.company?.industry || '',
                        companySize: data.profile.company?.companySize || '',
                        foundedYear: data.profile.company?.foundedYear || '',

                        companyEmail: data.profile.company?.email || '',
                        companyPhone: data.profile.company?.phone || '',
                        website: data.profile.company?.website || '',

                        address: data.profile.company?.address || '',
                        city: data.profile.company?.city || '',
                        province: data.profile.company?.province || '',
                        postalCode: data.profile.company?.postalCode || '',

                        linkedinUrl: data.profile.company?.linkedinUrl || '',
                        facebookUrl: data.profile.company?.facebookUrl || '',
                        twitterUrl: data.profile.company?.twitterUrl || '',
                        instagramUrl: data.profile.company?.instagramUrl || '',

                        culture: data.profile.company?.culture || '',
                        benefits: data.profile.company?.benefits || []
                    })
                }
            }
        } catch (error) {
            console.error('Load profile error:', error)
        } finally {
            setIsLoading(false)
        }
    }

    // Handle input change
    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    // Generate slug from company name
    const generateSlug = (name) => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
    }

    useEffect(() => {
        if (formData.companyName) {
            setFormData(prev => ({
                ...prev,
                companySlug: generateSlug(prev.companyName)
            }))
        }
    }, [formData.companyName])

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


    // Steps configuration
    const steps = [
        { number: 1, title: 'Informasi Personal', icon: User },
        { number: 2, title: 'Informasi Perusahaan', icon: Building2 },
        { number: 3, title: 'Kontak & Alamat', icon: MapPin },
        { number: 4, title: 'Social Media', icon: Globe },
        { number: 5, title: 'Budaya & Benefits', icon: Award }
    ]

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading profile...</p>
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
                        {isEditMode ? 'Edit Profile Recruiter' : 'Lengkapi Profile Recruiter'}
                    </h1>
                    <p className="text-gray-600">
                        Isi informasi perusahaan dan personal Anda untuk mulai memposting lowongan
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
                    {/* Step 1: Personal Info */}
                    {currentStep === 1 && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                Informasi Personal
                            </h2>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nama Depan *
                                    </label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        className="w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="John"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nama Belakang *
                                    </label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        className="w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Doe"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Posisi/Jabatan *
                                    </label>
                                    <input
                                        type="text"
                                        name="position"
                                        value={formData.position}
                                        onChange={handleChange}
                                        className="w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="HR Manager"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nomor Telepon
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="08123456789"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Departemen
                                    </label>
                                    <input
                                        type="text"
                                        name="department"
                                        value={formData.department}
                                        onChange={handleChange}
                                        className="w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Human Resources"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Company Info */}
                    {currentStep === 2 && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                Informasi Perusahaan
                            </h2>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nama Perusahaan *
                                    </label>
                                    <input
                                        type="text"
                                        name="companyName"
                                        value={formData.companyName}
                                        onChange={handleChange}
                                        className="w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="PT. Tech Innovate Indonesia"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Slug URL (Otomatis)
                                    </label>
                                    <input
                                        type="text"
                                        name="companySlug"
                                        value={formData.companySlug}
                                        readOnly
                                        className="w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                                        placeholder="pt-tech-innovate-indonesia"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        URL: /companies/{formData.companySlug}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Logo URL
                                    </label>
                                    <input
                                        type="url"
                                        name="companyLogo"
                                        value={formData.companyLogo}
                                        onChange={handleChange}
                                        className="w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="https://example.com/logo.png"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tagline Perusahaan
                                    </label>
                                    <input
                                        type="text"
                                        name="tagline"
                                        value={formData.tagline}
                                        onChange={handleChange}
                                        className="w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Innovating the Future of Technology"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Deskripsi Perusahaan *
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows={5}
                                        className="w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Ceritakan tentang perusahaan Anda..."
                                        required
                                    />
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Industri *
                                        </label>
                                        <select
                                            name="industry"
                                            value={formData.industry}
                                            onChange={handleChange}
                                            className="w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        >
                                            <option value="">Pilih Industri</option>
                                            <option value="Technology">Technology</option>
                                            <option value="Finance">Finance</option>
                                            <option value="Healthcare">Healthcare</option>
                                            <option value="Education">Education</option>
                                            <option value="Retail">Retail</option>
                                            <option value="Manufacturing">Manufacturing</option>
                                            <option value="Consulting">Consulting</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Ukuran Perusahaan *
                                        </label>
                                        <select
                                            name="companySize"
                                            value={formData.companySize}
                                            onChange={handleChange}
                                            className="w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        >
                                            <option value="">Pilih Ukuran</option>
                                            <option value="1-10">1-10 karyawan</option>
                                            <option value="11-50">11-50 karyawan</option>
                                            <option value="51-200">51-200 karyawan</option>
                                            <option value="201-500">201-500 karyawan</option>
                                            <option value="501-1000">501-1000 karyawan</option>
                                            <option value="1000+">1000+ karyawan</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Tahun Didirikan
                                        </label>
                                        <input
                                            type="number"
                                            name="foundedYear"
                                            value={formData.foundedYear}
                                            onChange={handleChange}
                                            min="1900"
                                            max={new Date().getFullYear()}
                                            className="w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="2020"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Contact & Address */}
                    {currentStep === 3 && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                Kontak & Alamat
                            </h2>

                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold text-gray-900">Kontak</h3>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email Perusahaan *
                                        </label>
                                        <input
                                            type="email"
                                            name="companyEmail"
                                            value={formData.companyEmail}
                                            onChange={handleChange}
                                            className="w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="info@company.com"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Telepon Perusahaan
                                        </label>
                                        <input
                                            type="tel"
                                            name="companyPhone"
                                            value={formData.companyPhone}
                                            onChange={handleChange}
                                            className="w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="021-12345678"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Website
                                        </label>
                                        <input
                                            type="url"
                                            name="website"
                                            value={formData.website}
                                            onChange={handleChange}
                                            className="w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="https://www.company.com"
                                        />
                                    </div>
                                </div>

                                <h3 className="text-lg font-semibold text-gray-900 pt-4">Alamat</h3>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Alamat Lengkap *
                                    </label>
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        rows={3}
                                        className="w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Jl. Sudirman No. 123"
                                        required
                                    />
                                </div>

                                <div className="grid md:grid-cols-3 gap-6">
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

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Kode Pos
                                        </label>
                                        <input
                                            type="text"
                                            name="postalCode"
                                            value={formData.postalCode}
                                            onChange={handleChange}
                                            className="w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="12345"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Social Media */}
                    {currentStep === 4 && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                Social Media
                            </h2>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        LinkedIn
                                    </label>
                                    <input
                                        type="url"
                                        name="linkedinUrl"
                                        value={formData.linkedinUrl}
                                        onChange={handleChange}
                                        className="w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="https://linkedin.com/company/yourcompany"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Facebook
                                    </label>
                                    <input
                                        type="url"
                                        name="facebookUrl"
                                        value={formData.facebookUrl}
                                        onChange={handleChange}
                                        className="w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="https://facebook.com/yourcompany"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Twitter
                                    </label>
                                    <input
                                        type="url"
                                        name="twitterUrl"
                                        value={formData.twitterUrl}
                                        onChange={handleChange}
                                        className="w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="https://twitter.com/yourcompany"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Instagram
                                    </label>
                                    <input
                                        type="url"
                                        name="instagramUrl"
                                        value={formData.instagramUrl}
                                        onChange={handleChange}
                                        className="w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="https://instagram.com/yourcompany"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 5: Culture & Benefits */}
                    {currentStep === 5 && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                Budaya & Benefits
                            </h2>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Budaya Perusahaan
                                    </label>
                                    <textarea
                                        name="culture"
                                        value={formData.culture}
                                        onChange={handleChange}
                                        rows={5}
                                        className="w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Ceritakan tentang budaya kerja di perusahaan Anda..."
                                    />
                                </div>

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
                                            className="flex-1 text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Contoh: BPJS Kesehatan"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddBenefit}
                                            className="px-4 text-gray-900 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                        >
                                            Tambah
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
                                                        <XCircle className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
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
                                onClick={handleSave}
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
                                        Menyimpan...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        {isEditMode ? 'Update Profile' : 'Simpan Profile'}
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