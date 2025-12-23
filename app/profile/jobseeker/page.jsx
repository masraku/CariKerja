'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Swal from 'sweetalert2'
import { User, Star, Briefcase, GraduationCap, Award, FileText, CheckCircle, Upload, X, Plus, Calendar, Phone, Mail, Globe, Linkedin, Github, ChevronRight, ChevronLeft, Save, ArrowLeft, Eye } from 'lucide-react'
import RupiahInput from '@/components/RupiahInput'
import PersonalInfoStep from './components/PersonalInfoStep'
import ContactStep from './components/ContactStep'
import SkillsStep from './components/SkillsStep'
import EducationStep from './components/EducationStep'
import ExperienceStep from './components/ExperienceStep'
import CertificationStep from './components/CertificationStep'
import PreferencesStep from './components/PreferencesStep'

function JobseekerProfileContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({})
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditMode, setIsEditMode] = useState(false)
  const [documentModal, setDocumentModal] = useState({ isOpen: false, url: '', title: '' })
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

    // CV & Documents
    cvFile: null,
    cvFileName: '',
    cvUrl: '',
    ktpFile: null,
    ktpFileName: '',
    ktpUrl: '',
    ak1File: null,
    ak1FileName: '',
    ak1Url: '',

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

  // Always load existing profile data
  useEffect(() => {
    const mode = searchParams.get('mode')
    if (mode === 'edit') {
      setIsEditMode(true)
    }
    // Always load profile to prevent data loss
    loadProfile()
  }, [searchParams])

  const loadProfile = async () => {
    try {
      const response = await fetch('/api/profile/jobseeker', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })
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

          // CV & Documents
          cvUrl: profile.cvUrl || '',
          cvFileName: profile.cvUrl ? 'CV.pdf' : '',
          ktpUrl: profile.ktpUrl || '',
          ktpFileName: profile.ktpUrl ? 'KTP.pdf' : '',
          ak1Url: profile.ak1Url || '',
          ak1FileName: profile.ak1Url ? 'Kartu AK-1.pdf' : '',

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
          experiences: profile.work_experiences && profile.work_experiences.length > 0
            ? profile.work_experiences.map(exp => ({
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
    // Validate file size (max 2MB for Supabase free tier)
    const maxSize = 2 * 1024 * 1024 // 2MB
    if (file.size > maxSize) {
      throw new Error(`Ukuran file terlalu besar (${(file.size / 1024 / 1024).toFixed(2)}MB). Maksimal 2MB.`)
    }

    const formDataUpload = new FormData()
    formDataUpload.append('file', file)
    formDataUpload.append('bucket', bucket)
    formDataUpload.append('userId', user?.id || '')

    const response = await fetch('/api/upload', {
      method: 'POST',
      credentials: 'include', // Important: send cookies with request
      body: formDataUpload
    })

    if (!response.ok) {
      const error = await response.json()
      // Handle Supabase storage limit error
      if (error.error?.includes('exceeded the maximum allowed size')) {
        throw new Error('Ukuran file melebihi batas maksimal. Silakan kompres file terlebih dahulu (maks 2MB).')
      }
      throw new Error(error.error || 'Upload failed')
    }

    const result = await response.json()
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

      const result = await uploadFile(file, 'jobseeker-cv')

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

  // Handle KTP upload
  const handleKTPUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      setIsUploading(true)
      setUploadProgress({ ktp: 0 })
      setUploadProgress({ ktp: 50 })

      const result = await uploadFile(file, 'jobseeker-documents')

      setFormData(prev => ({
        ...prev,
        ktpFile: file,
        ktpFileName: file.name,
        ktpUrl: result.url
      }))

      setUploadProgress({ ktp: 100 })

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'KTP berhasil diupload',
        timer: 2000,
        showConfirmButton: false
      })

      setTimeout(() => setUploadProgress({}), 1000)
    } catch (error) {
      console.error('KTP upload error:', error)
      Swal.fire({
        icon: 'error',
        title: 'Gagal Upload',
        text: error.message || 'Gagal upload KTP'
      })
    } finally {
      setIsUploading(false)
    }
  }

  // Handle AK-1 upload
  const handleAK1Upload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      setIsUploading(true)
      setUploadProgress({ ak1: 0 })
      setUploadProgress({ ak1: 50 })

      const result = await uploadFile(file, 'jobseeker-documents')

      setFormData(prev => ({
        ...prev,
        ak1File: file,
        ak1FileName: file.name,
        ak1Url: result.url
      }))

      setUploadProgress({ ak1: 100 })

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Kartu AK-1 berhasil diupload',
        timer: 2000,
        showConfirmButton: false
      })

      setTimeout(() => setUploadProgress({}), 1000)
    } catch (error) {
      console.error('AK-1 upload error:', error)
      Swal.fire({
        icon: 'error',
        title: 'Gagal Upload',
        text: error.message || 'Gagal upload Kartu AK-1'
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

      const result = await uploadFile(file, 'jobseeker-diploma')

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

      const result = await uploadFile(file, 'jobseeker-certificate')

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
        ktpUrl: formData.ktpUrl,
        ak1Url: formData.ak1Url,
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
        credentials: 'include',
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
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 sm:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
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
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
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
          <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8">
            {/* Step 1: Personal Info */}
            {/* Step 1: Personal Info */}
            {currentStep === 1 && (
              <PersonalInfoStep 
                formData={formData}
                handleInputChange={handleInputChange}
                handlePhotoUpload={handlePhotoUpload}
                uploadProgress={uploadProgress}
                isUploading={isUploading}
                calculateAge={calculateAge}
              />
            )}

            {/* Step 2: Contact Info + CV + Social Media - UPDATED */}
            {currentStep === 2 && (
              <ContactStep 
                formData={formData}
                handleInputChange={handleInputChange}
                handleCVUpload={handleCVUpload}
                handleKTPUpload={handleKTPUpload}
                handleAK1Upload={handleAK1Upload}
                uploadProgress={uploadProgress}
                isUploading={isUploading}
                setDocumentModal={setDocumentModal}
                setFormData={setFormData}
                provinces={provinces}
              />
            )}

            {/* Step 3: Skills Only - NEW */}
            {currentStep === 3 && (
              <SkillsStep 
                formData={formData}
                handleInputChange={handleInputChange}
                setFormData={setFormData}
              />
            )}

            {/* Step 4: Education */}
            {currentStep === 4 && (
              <EducationStep 
                formData={formData}
                educationLevels={educationLevels}
                handleArrayChange={handleArrayChange}
                handleDiplomaUpload={handleDiplomaUpload}
                uploadProgress={uploadProgress}
                removeArrayItem={removeArrayItem}
                addArrayItem={addArrayItem}
                isUploading={isUploading}
              />
            )}

            {/* Step 5: Work Experience */}
            {currentStep === 5 && (
              <ExperienceStep 
                formData={formData}
                handleArrayChange={handleArrayChange}
                handleNestedArrayChange={handleNestedArrayChange}
                removeArrayItem={removeArrayItem}
                addArrayItem={addArrayItem}
                setFormData={setFormData}
                addNestedArrayItem={addNestedArrayItem}
              />
            )}

            {/* Step 6: Certifications */}
            {currentStep === 6 && (
              <CertificationStep 
                formData={formData}
                handleArrayChange={handleArrayChange}
                handleCertificateUpload={handleCertificateUpload}
                removeArrayItem={removeArrayItem}
                addArrayItem={addArrayItem}
                uploadProgress={uploadProgress}
                isUploading={isUploading}
              />
            )}

            {/* Step 7: Job Preferences */}
            {currentStep === 7 && (
              <PreferencesStep 
                formData={formData}
                handleInputChange={handleInputChange}
                jobTypes={jobTypes}
                formatRupiah={formatRupiah}
                calculateAge={calculateAge}
              />
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

      {/* Document Preview Modal */}
      {documentModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-bold text-gray-900">Preview: {documentModal.title}</h3>
              <button
                type="button"
                onClick={() => setDocumentModal({ isOpen: false, url: '', title: '' })}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4 h-[70vh] overflow-auto">
              {documentModal.url && (
                <>
                  {documentModal.url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                    <img
                      src={documentModal.url}
                      alt={documentModal.title}
                      className="max-w-full h-auto mx-auto rounded-lg"
                    />
                  ) : (
                    <iframe
                      src={documentModal.url}
                      className="w-full h-full rounded-lg"
                      title={documentModal.title}
                    />
                  )}
                </>
              )}
            </div>
            <div className="flex justify-end gap-3 p-4 border-t bg-gray-50">
              <a
                href={documentModal.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
              >
                Buka di Tab Baru
              </a>
              <button
                type="button"
                onClick={() => setDocumentModal({ isOpen: false, url: '', title: '' })}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm font-medium"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div >
  )
}

// Main component with Suspense boundary
const JobseekerProfilePage = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat halaman...</p>
        </div>
      </div>
    }>
      <JobseekerProfileContent />
    </Suspense>
  )
}

export default JobseekerProfilePage