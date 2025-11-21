'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Swal from 'sweetalert2'
import { User, Star, Briefcase, GraduationCap, Award, FileText, CheckCircle, Upload, X, Plus, Calendar, Phone, Mail, Globe, Linkedin, Github, ChevronRight, ChevronLeft, Save, ArrowLeft } from 'lucide-react'
import RupiahInput from '@/components/RupiahInput'

const JobseekerProfilePage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({})
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditMode, setIsEditMode] = useState(false)
  const formatRupiah = (value) => {
    if (!value) return ''
    const number = value.toString().replace(/[^0-9]/g, '')
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  }

  const [formData, setFormData] = useState({
    // Personal Info
    photo: null,
    photoPreview: null,
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    religion: '',
    maritalStatus: '',
    nationality: 'Indonesia',
    idNumber: '',

    // Contact Info
    phone: '',
    email: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',

    // Professional Info
    currentTitle: '',
    summary: '',
    linkedinUrl: '',
    githubUrl: '',
    portfolioUrl: '',
    websiteUrl: '',

    // CV
    cvFile: null,
    cvFileName: '',
    cvUrl: '',

    // Education
    educations: [{
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
    }],

    // Work Experience
    experiences: [{
      company: '',
      position: '',
      location: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
      description: '',
      achievements: ['']
    }],

    // Skills
    skills: [''],

    // Certifications
    certifications: [{
      name: '',
      issuingOrganization: '',
      issueDate: '',
      expiryDate: '',
      credentialId: '',
      credentialUrl: '',
      certificateFile: null,
      certificateFileName: '',
      certificateUrl: ''
    }],

    // Job Preferences
    desiredJobTitle: '',
    desiredSalaryMin: '',
    desiredSalaryMax: '',
    preferredLocation: '',
    preferredJobType: '',
    willingToRelocate: false,
    availableFrom: ''
  })

  const totalSteps = 7

  const steps = [
    { number: 1, title: 'Informasi Pribadi', icon: User },
    { number: 2, title: 'Kontak & CV', icon: Phone },
    { number: 3, title: 'Skills', icon: Star },
    { number: 4, title: 'Pendidikan', icon: GraduationCap },
    { number: 5, title: 'Pengalaman', icon: Briefcase },
    { number: 6, title: 'Sertifikat', icon: Award },
    { number: 7, title: 'Preferensi', icon: FileText }
  ]

  const religions = ['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu', 'Lainnya']
  const genders = ['Laki-laki', 'Perempuan']
  const maritalStatuses = ['Belum Menikah', 'Menikah', 'Cerai']
  const educationLevels = ['SMA/SMK', 'D3', 'S1', 'S2', 'S3']
  const jobTypes = ['Full Time', 'Part Time', 'Contract', 'Freelance', 'Internship']
  const provinces = [
    'DKI Jakarta', 'Jawa Barat', 'Jawa Tengah', 'Jawa Timur', 'Banten',
    'DI Yogyakarta', 'Bali', 'Sumatera Utara', 'Sumatera Barat', 'Sulawesi Selatan'
  ]

  // Load existing profile if edit mode
  useEffect(() => {
    const mode = searchParams.get('mode')
    if (mode === 'edit') {
      setIsEditMode(true)
      loadProfile()
    } else {
      setIsLoading(false)
    }
  }, [searchParams])

  const loadProfile = async () => {
    try {
      const response = await fetch('/api/profile/jobseeker')
      const data = await response.json()

      if (response.ok && data.profile) {
        const profile = data.profile

        // Helper to format date for input[type="month"]
        const formatMonthDate = (dateString) => {
          if (!dateString) return ''
          const date = new Date(dateString)
          const year = date.getFullYear()
          const month = String(date.getMonth() + 1).padStart(2, '0')
          return `${year}-${month}`
        }

        // Helper to format date for input[type="date"]
        const formatDate = (dateString) => {
          if (!dateString) return ''
          const date = new Date(dateString)
          return date.toISOString().split('T')[0]
        }

        setFormData({
          // Personal Info
          photo: profile.photo,
          photoPreview: profile.photo,
          firstName: profile.firstName || '',
          lastName: profile.lastName || '',
          dateOfBirth: formatDate(profile.dateOfBirth) || '',
          gender: profile.gender || '',
          religion: profile.religion || '',
          maritalStatus: profile.maritalStatus || '',
          nationality: profile.nationality || 'Indonesia',
          idNumber: profile.idNumber || '',

          // Contact Info
          phone: profile.phone || '',
          email: profile.email || '',
          address: profile.address || '',
          city: profile.city || '',
          province: profile.province || '',
          postalCode: profile.postalCode || '',

          // Professional Info
          currentTitle: profile.currentTitle || '',
          summary: profile.summary || '',
          linkedinUrl: profile.linkedinUrl || '',
          githubUrl: profile.githubUrl || '',
          portfolioUrl: profile.portfolioUrl || '',
          websiteUrl: profile.websiteUrl || '',

          // CV
          cvUrl: profile.cvUrl || '',
          cvFileName: profile.cvUrl ? 'CV.pdf' : '',

          // Education
          educations: profile.educations && profile.educations.length > 0
            ? profile.educations.map(edu => ({
              institution: edu.institution || '',
              degree: edu.degree || '',
              fieldOfStudy: edu.fieldOfStudy || '',
              level: edu.level || '',
              startDate: formatMonthDate(edu.startDate) || '',
              endDate: formatMonthDate(edu.endDate) || '',
              gpa: edu.gpa?.toString() || '',
              isCurrent: edu.isCurrent || false,
              diplomaUrl: edu.diplomaUrl || '',
              diplomaFileName: edu.diplomaUrl ? 'Ijazah.pdf' : ''
            }))
            : [{
              institution: '',
              degree: '',
              fieldOfStudy: '',
              level: '',
              startDate: '',
              endDate: '',
              gpa: '',
              isCurrent: false,
              diplomaFileName: '',
              diplomaUrl: ''
            }],

          // Work Experience
          experiences: profile.workExperiences && profile.workExperiences.length > 0
            ? profile.workExperiences.map(exp => ({
              company: exp.company || '',
              position: exp.position || '',
              location: exp.location || '',
              startDate: formatMonthDate(exp.startDate) || '',
              endDate: formatMonthDate(exp.endDate) || '',
              isCurrent: exp.isCurrent || false,
              description: exp.description || '',
              achievements: exp.achievements && exp.achievements.length > 0 ? exp.achievements : ['']
            }))
            : [{
              company: '',
              position: '',
              location: '',
              startDate: '',
              endDate: '',
              isCurrent: false,
              description: '',
              achievements: ['']
            }],

          // Skills
          skills: profile.skills && profile.skills.length > 0
            ? profile.skills.map(s => s.name)
            : [''],

          // Certifications
          certifications: profile.certifications && profile.certifications.length > 0
            ? profile.certifications.map(cert => ({
              name: cert.name || '',
              issuingOrganization: cert.issuingOrganization || '',
              issueDate: formatMonthDate(cert.issueDate) || '',
              expiryDate: formatMonthDate(cert.expiryDate) || '',
              credentialId: cert.credentialId || '',
              credentialUrl: cert.credentialUrl || '',
              certificateUrl: cert.certificateUrl || '',
              certificateFileName: cert.certificateUrl ? 'Sertifikat.pdf' : ''
            }))
            : [{
              name: '',
              issuingOrganization: '',
              issueDate: '',
              expiryDate: '',
              credentialId: '',
              credentialUrl: '',
              certificateFileName: '',
              certificateUrl: ''
            }],

          // Job Preferences
          desiredJobTitle: profile.desiredJobTitle || '',
          desiredSalaryMin: profile.desiredSalaryMin?.toString() || '',
          desiredSalaryMax: profile.desiredSalaryMax?.toString() || '',
          preferredLocation: profile.preferredLocation || '',
          preferredJobType: profile.preferredJobType || '',
          willingToRelocate: profile.willingToRelocate || false,
          availableFrom: formatDate(profile.availableFrom) || ''
        })
      }
    } catch (error) {
      console.error('Load profile error:', error)
      Swal.fire({
        icon: 'error',
        title: 'Gagal Memuat Data',
        text: 'Terjadi kesalahan saat memuat profile'
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Upload file helper
  const uploadFile = async (file, bucket) => {
    console.log(`🚀 Uploading to bucket: ${bucket}`)

    const formDataUpload = new FormData()
    formDataUpload.append('file', file)
    formDataUpload.append('bucket', bucket)
    formDataUpload.append('userId', user?.id || '')

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formDataUpload
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Upload failed')
    }

    const result = await response.json()
    console.log(`✅ Upload successful to ${bucket}:`, result.url)

    return result
  }

  // Handle photo upload
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      setIsUploading(true)
      setUploadProgress({ photo: 0 })

      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          photoPreview: reader.result
        }))
      }
      reader.readAsDataURL(file)

      setUploadProgress({ photo: 50 })

      const result = await uploadFile(file, 'Profile')

      setFormData(prev => ({
        ...prev,
        photo: result.url,
        photoFile: file
      }))

      setUploadProgress({ photo: 100 })

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Foto profil berhasil diupload',
        timer: 2000,
        showConfirmButton: false
      })

      setTimeout(() => setUploadProgress({}), 1000)
    } catch (error) {
      console.error('Photo upload error:', error)
      Swal.fire({
        icon: 'error',
        title: 'Gagal Upload',
        text: error.message || 'Gagal upload foto profil'
      })
    } finally {
      setIsUploading(false)
    }
  }

  // Handle CV upload
  const handleCVUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      setIsUploading(true)
      setUploadProgress({ cv: 0 })
      setUploadProgress({ cv: 50 })

      const result = await uploadFile(file, 'Resume')

      setFormData(prev => ({
        ...prev,
        cvFile: file,
        cvFileName: file.name,
        cvUrl: result.url
      }))

      setUploadProgress({ cv: 100 })

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'CV berhasil diupload',
        timer: 2000,
        showConfirmButton: false
      })

      setTimeout(() => setUploadProgress({}), 1000)
    } catch (error) {
      console.error('CV upload error:', error)
      Swal.fire({
        icon: 'error',
        title: 'Gagal Upload',
        text: error.message || 'Gagal upload CV'
      })
    } finally {
      setIsUploading(false)
    }
  }

  // Handle diploma upload
  const handleDiplomaUpload = async (e, index) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      setIsUploading(true)
      setUploadProgress({ [`diploma-${index}`]: 0 })
      setUploadProgress({ [`diploma-${index}`]: 50 })

      const result = await uploadFile(file, 'Ijazah')

      handleArrayChange(index, 'diplomaFile', file, 'educations')
      handleArrayChange(index, 'diplomaFileName', file.name, 'educations')
      handleArrayChange(index, 'diplomaUrl', result.url, 'educations')

      setUploadProgress({ [`diploma-${index}`]: 100 })

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Ijazah berhasil diupload',
        timer: 2000,
        showConfirmButton: false
      })

      setTimeout(() => setUploadProgress({}), 1000)
    } catch (error) {
      console.error('Diploma upload error:', error)
      Swal.fire({
        icon: 'error',
        title: 'Gagal Upload',
        text: error.message || 'Gagal upload ijazah'
      })
    } finally {
      setIsUploading(false)
    }
  }

  // Handle certificate upload
  const handleCertificateUpload = async (e, index) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      setIsUploading(true)
      setUploadProgress({ [`cert-${index}`]: 0 })
      setUploadProgress({ [`cert-${index}`]: 50 })

      const result = await uploadFile(file, 'Sertificate')

      handleArrayChange(index, 'certificateFile', file, 'certifications')
      handleArrayChange(index, 'certificateFileName', file.name, 'certifications')
      handleArrayChange(index, 'certificateUrl', result.url, 'certifications')

      setUploadProgress({ [`cert-${index}`]: 100 })

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Sertifikat berhasil diupload',
        timer: 2000,
        showConfirmButton: false
      })

      setTimeout(() => setUploadProgress({}), 1000)
    } catch (error) {
      console.error('Certificate upload error:', error)
      Swal.fire({
        icon: 'error',
        title: 'Gagal Upload',
        text: error.message || 'Gagal upload sertifikat'
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleArrayChange = (index, field, value, arrayName) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: prev[arrayName].map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }))
  }

  const handleNestedArrayChange = (parentIndex, childIndex, value, parentArray, childArray) => {
    setFormData(prev => ({
      ...prev,
      [parentArray]: prev[parentArray].map((item, i) =>
        i === parentIndex
          ? { ...item, [childArray]: item[childArray].map((child, j) => j === childIndex ? value : child) }
          : item
      )
    }))
  }

  const addArrayItem = (arrayName, defaultItem) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: [...prev[arrayName], defaultItem]
    }))
  }

  const removeArrayItem = (index, arrayName) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: prev[arrayName].filter((_, i) => i !== index)
    }))
  }

  const addNestedArrayItem = (parentIndex, parentArray, childArray, defaultValue) => {
    setFormData(prev => ({
      ...prev,
      [parentArray]: prev[parentArray].map((item, i) =>
        i === parentIndex
          ? { ...item, [childArray]: [...item[childArray], defaultValue] }
          : item
      )
    }))
  }

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const result = await Swal.fire({
      title: isEditMode ? 'Update Profile?' : 'Simpan Profile?',
      text: 'Pastikan semua informasi sudah benar',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#ef4444',
      confirmButtonText: isEditMode ? 'Ya, Update!' : 'Ya, Simpan!',
      cancelButtonText: 'Batal'
    })

    if (!result.isConfirmed) return

    setIsSaving(true)

    try {
      const payload = {
        photo: formData.photo,
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        religion: formData.religion,
        maritalStatus: formData.maritalStatus,
        nationality: formData.nationality,
        idNumber: formData.idNumber,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        city: formData.city,
        province: formData.province,
        postalCode: formData.postalCode,
        currentTitle: formData.currentTitle,
        summary: formData.summary,
        linkedinUrl: formData.linkedinUrl,
        githubUrl: formData.githubUrl,
        portfolioUrl: formData.portfolioUrl,
        websiteUrl: formData.websiteUrl,
        cvUrl: formData.cvUrl,
        educations: formData.educations.map(edu => ({
          institution: edu.institution,
          degree: edu.degree,
          fieldOfStudy: edu.fieldOfStudy,
          level: edu.level,
          startDate: edu.startDate,
          endDate: edu.endDate,
          gpa: edu.gpa,
          isCurrent: edu.isCurrent,
          diplomaUrl: edu.diplomaUrl
        })),
        experiences: formData.experiences,
        skills: formData.skills.filter(s => s),
        certifications: formData.certifications.map(cert => ({
          name: cert.name,
          issuingOrganization: cert.issuingOrganization,
          issueDate: cert.issueDate,
          expiryDate: cert.expiryDate,
          credentialId: cert.credentialId,
          credentialUrl: cert.credentialUrl,
          certificateUrl: cert.certificateUrl
        })),
        desiredJobTitle: formData.desiredJobTitle,
        desiredSalaryMin: formData.desiredSalaryMin,
        desiredSalaryMax: formData.desiredSalaryMax,
        preferredLocation: formData.preferredLocation,
        preferredJobType: formData.preferredJobType,
        willingToRelocate: formData.willingToRelocate,
        availableFrom: formData.availableFrom
      }

      const response = await fetch('/api/profile/jobseeker', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to save profile')
      }

      await Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        html: `
          <p>Profile berhasil ${isEditMode ? 'diupdate' : 'disimpan'}!</p>
          <p class="text-lg font-bold text-indigo-600 mt-2">Kelengkapan: ${data.completeness}%</p>
        `,
        confirmButtonColor: '#3b82f6'
      })

      // Redirect to view profile
      router.push('/profile/jobseeker/view')
    } catch (error) {
      console.error('Save error:', error)

      await Swal.fire({
        icon: 'error',
        title: 'Gagal Menyimpan',
        html: `
          <p class="text-red-600 font-semibold">${error.message}</p>
          <p class="text-sm text-gray-600 mt-2">Silakan cek console untuk detail error</p>
        `
      })
    } finally {
      setIsSaving(false)
    }
  }

  const calculateAge = (birthDate) => {
    if (!birthDate) return ''
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          {isEditMode && (
            <button
              onClick={() => router.push('/profile/jobseeker/view')}
              className="mb-4 flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold mx-auto"
            >
              <ArrowLeft className="w-5 h-5" />
              Kembali ke Profile
            </button>
          )}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {isEditMode ? 'Edit Profile Anda' : 'Lengkapi Profile Anda'}
          </h1>
          <p className="text-gray-600 text-lg">
            Isi semua informasi dengan lengkap untuk meningkatkan peluang diterima kerja
          </p>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-gray-600">
              Langkah {currentStep} dari {totalSteps}
            </span>
            <span className="text-sm font-semibold text-indigo-600">
              {Math.round((currentStep / totalSteps) * 100)}% Selesai
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
            <div
              className="bg-gradient-to-r from-indigo-600 to-purple-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>

          {/* Step Indicators */}
          <div className="hidden md:flex justify-between">
            {steps.map((step) => {
              const Icon = step.icon
              return (
                <div key={step.number} className="flex flex-col items-center flex-1">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all ${currentStep >= step.number
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                    : 'bg-gray-200 text-gray-400'
                    }`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className={`text-xs text-center font-medium ${currentStep >= step.number ? 'text-indigo-600' : 'text-gray-400'
                    }`}>
                    {step.title}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Step 1: Personal Info */}
            {currentStep === 1 && (
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
            )}

            {/* Step 2: Contact Info + CV + Social Media - UPDATED */}
            {currentStep === 2 && (
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
                    Upload CV/Resume
                  </h3>

                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-indigo-500 transition">
                    {formData.cvFileName ? (
                      <div className="flex items-center justify-between bg-indigo-50 p-4 rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="w-8 h-8 text-indigo-600" />
                          <div className="text-left">
                            <p className="font-semibold text-gray-900">{formData.cvFileName}</p>
                            <p className="text-sm text-gray-500">CV berhasil diupload</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, cvFile: null, cvFileName: '', cvUrl: '' }))}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <label className={`cursor-pointer ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-700 font-semibold mb-2">
                          Klik untuk upload CV Anda
                        </p>
                        <p className="text-sm text-gray-500">
                          PDF, DOC, DOCX (Max 5MB)
                        </p>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={handleCVUpload}
                          className="hidden"
                          disabled={isUploading}
                        />
                      </label>
                    )}
                    {uploadProgress.cv && (
                      <div className="mt-4 max-w-xs mx-auto">
                        <div className="bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-indigo-600 h-2 rounded-full transition-all"
                            style={{ width: `${uploadProgress.cv}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
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
                          LinkedIn
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
                          GitHub
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
                          Portfolio
                        </div>
                      </label>
                      <input
                        type="url"
                        name="portfolioUrl"
                        value={formData.portfolioUrl}
                        onChange={handleInputChange}
                        className="w-full text-gray-900 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="https://portfolio.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <div className="flex items-center gap-2">
                          <Globe className="w-5 h-5 text-indigo-600" />
                          Website
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
            )}

            {/* Step 3: Skills Only - NEW */}
            {currentStep === 3 && (
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
            )}

            {/* Step 4: Education */}
            {currentStep === 4 && (
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
                          Gelar <span className="text-red-500">*</span>
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
            )}

            {/* Step 5: Work Experience */}
            {currentStep === 5 && (
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
            )}

            {/* Step 6: Certifications */}
            {currentStep === 6 && (
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
            )}

            {/* Step 7: Job Preferences */}
            {currentStep === 7 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <FileText className="w-7 h-7 text-indigo-600" />
                  Preferensi Pekerjaan
                </h2>

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

                {/* Summary - tetap sama */}
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
                      <p className="font-semibold text-gray-900">{formData.educations[0].level || '-'} - {formData.educations[0].fieldOfStudy || '-'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Pengalaman</p>
                      <p className="font-semibold text-gray-900">{formData.experiences[0].company ? 'Ada' : 'Fresh Graduate'}</p>
                    </div>
                    {/* ✅ ADD: Show salary range in summary */}
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
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-8 border-t border-gray-200 mt-8">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className={`flex items-center gap-2 px-8 py-4 rounded-xl font-semibold transition ${currentStep === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                <ChevronLeft className="w-5 h-5" />
                Sebelumnya
              </button>

              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition font-semibold shadow-lg hover:shadow-xl"
                >
                  Selanjutnya
                  <ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSaving || isUploading}
                  className={`flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl transition font-semibold shadow-lg hover:shadow-xl ${(isSaving || isUploading) ? 'opacity-50 cursor-not-allowed' : 'hover:from-green-700 hover:to-emerald-700'
                    }`}
                >
                  {isSaving ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      {isEditMode ? 'Mengupdate...' : 'Menyimpan...'}
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
          </div>
        </form>
      </div>
    </div >
  )
}

export default JobseekerProfilePage