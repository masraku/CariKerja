'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Swal from 'sweetalert2'
import {
    User, Mail, Phone, MapPin, Calendar, Briefcase, GraduationCap,
    Award, FileText, Globe, Linkedin, Github, Edit, Download,
    Star, Target, ExternalLink, ArrowLeft, ToggleLeft, ToggleRight
} from 'lucide-react'

const ViewProfilePage = () => {
    const router = useRouter()
    const { user } = useAuth()
    const [profile, setProfile] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

    useEffect(() => {
        loadProfile()
    }, [])

    const loadProfile = async () => {
        try {
            const response = await fetch('/api/profile/jobseeker', { credentials: 'include' })
            const data = await response.json()

            if (response.ok && data.profile) {
                setProfile(data.profile)
            } else {
                router.push('/profile/jobseeker?mode=edit')
            }
        } catch (error) {
            console.error('Load profile error:', error)
            router.push('/profile/jobseeker?mode=edit')
        } finally {
            setIsLoading(false)
        }
    }

    // Toggle job seeking status
    const toggleJobSeekingStatus = async () => {
        const currentStatus = profile.isLookingForJob
        const newStatus = !currentStatus
        
        const result = await Swal.fire({
            title: newStatus ? 'Aktifkan Pencarian Kerja?' : 'Nonaktifkan Pencarian Kerja?',
            html: newStatus 
                ? '<p class="text-gray-600">Dengan mengaktifkan, profil Anda akan terlihat oleh recruiter yang sedang mencari kandidat.</p>'
                : '<p class="text-gray-600">Dengan menonaktifkan, profil Anda tidak akan muncul di pencarian recruiter.</p>',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: newStatus ? 'Ya, Aktifkan' : 'Ya, Nonaktifkan',
            cancelButtonText: 'Batal',
            confirmButtonColor: newStatus ? '#10b981' : '#f97316'
        })

        if (!result.isConfirmed) return

        try {
            setIsUpdatingStatus(true)
            const response = await fetch('/api/profile/jobseeker/status', {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isLookingForJob: newStatus })
            })

            const data = await response.json()

            if (response.ok) {
                setProfile(prev => ({ ...prev, isLookingForJob: newStatus }))
                await Swal.fire({
                    icon: 'success',
                    title: 'Berhasil!',
                    text: newStatus 
                        ? 'Status pencari kerja telah diaktifkan' 
                        : 'Status pencari kerja telah dinonaktifkan',
                    timer: 2000,
                    showConfirmButton: false
                })
            } else {
                throw new Error(data.error || 'Gagal mengubah status')
            }
        } catch (error) {
            console.error('Toggle status error:', error)
            Swal.fire({
                icon: 'error',
                title: 'Gagal',
                text: error.message
            })
        } finally {
            setIsUpdatingStatus(false)
        }
    }

    const formatDate = (dateString) => {
        if (!dateString) return '-'
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const formatMonthYear = (dateString) => {
        if (!dateString) return '-'
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'short'
        })
    }

    const formatCurrency = (amount) => {
        if (!amount) return '-'
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount)
    }

    const calculateAge = (birthDate) => {
        if (!birthDate) return '-'
        const today = new Date()
        const birth = new Date(birthDate)
        let age = today.getFullYear() - birth.getFullYear()
        const monthDiff = today.getMonth() - birth.getMonth()
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--
        }
        return age
    }

    const getCompletenessColor = (val) => {
        if (val >= 80) return { bg: '#dcfce7', color: '#16a34a' }
        if (val >= 50) return { bg: '#fef9c3', color: '#ca8a04' }
        return { bg: '#fee2e2', color: '#dc2626' }
    }

    // Styles
    const containerStyle = {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f0f4ff 0%, #faf5ff 100%)',
        padding: '5% 4%'
    }

    const cardStyle = {
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        padding: 'clamp(20px, 4%, 32px)',
        marginBottom: '24px'
    }

    const sectionTitleStyle = {
        fontSize: 'clamp(1.1rem, 2vw, 1.25rem)',
        fontWeight: 700,
        color: '#111827',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
    }

    const labelStyle = {
        fontSize: '13px',
        color: '#6b7280',
        marginBottom: '4px'
    }

    const valueStyle = {
        fontSize: '14px',
        fontWeight: 600,
        color: '#111827'
    }

    const badgeStyle = {
        display: 'inline-block',
        padding: '6px 12px',
        background: '#eef2ff',
        color: '#4f46e5',
        borderRadius: '100px',
        fontSize: '13px',
        fontWeight: 500
    }

    if (isLoading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ width: '48px', height: '48px', border: '4px solid #e5e7eb', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
                    <p style={{ color: '#6b7280' }}>Memuat profile...</p>
                </div>
                <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        )
    }

    if (!profile) return null

    const completenessColors = getCompletenessColor(profile.profileCompleteness)

    return (
        <div style={containerStyle}>
            <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

                {/* Header Card */}
                <div style={cardStyle}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '24px' }}>
                        
                        {/* Left: Photo + Info */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', flex: '1 1 300px' }}>
                            {/* Photo */}
                            <div style={{ position: 'relative' }}>
                                {profile.photo ? (
                                    <img
                                        src={profile.photo}
                                        alt="Profile"
                                        style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '4px solid #e0e7ff' }}
                                    />
                                ) : (
                                    <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'linear-gradient(135deg, #e0e7ff, #f3e8ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '4px solid #e0e7ff' }}>
                                        <User size={40} color="#818cf8" />
                                    </div>
                                )}
                                <div style={{
                                    position: 'absolute',
                                    bottom: '-4px',
                                    right: '-4px',
                                    padding: '4px 10px',
                                    borderRadius: '100px',
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    background: completenessColors.bg,
                                    color: completenessColors.color
                                }}>
                                    {profile.profileCompleteness}%
                                </div>
                            </div>

                            {/* Info */}
                            <div style={{ flex: 1 }}>
                                <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>
                                    {profile.firstName} {profile.lastName}
                                </h1>
                                {profile.currentTitle && (
                                    <p style={{ fontSize: '1rem', color: '#4f46e5', fontWeight: 600, marginBottom: '12px' }}>
                                        {profile.currentTitle}
                                    </p>
                                )}
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '14px', color: '#6b7280' }}>
                                    {profile.email && (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Mail size={16} /> {profile.email}
                                        </span>
                                    )}
                                    {profile.phone && (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Phone size={16} /> {profile.phone}
                                        </span>
                                    )}
                                    {(profile.city && profile.province) && (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <MapPin size={16} /> {profile.city}, {profile.province}
                                        </span>
                                    )}
                                    {profile.dateOfBirth && (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Calendar size={16} /> {calculateAge(profile.dateOfBirth)} tahun
                                        </span>
                                    )}
                                </div>

                                {/* Social Links */}
                                {(profile.linkedinUrl || profile.githubUrl || profile.portfolioUrl) && (
                                    <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                                        {profile.linkedinUrl && (
                                            <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer"
                                                style={{ padding: '8px', background: '#dbeafe', borderRadius: '8px', color: '#2563eb' }}>
                                                <Linkedin size={18} />
                                            </a>
                                        )}
                                        {profile.githubUrl && (
                                            <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer"
                                                style={{ padding: '8px', background: '#f3f4f6', borderRadius: '8px', color: '#374151' }}>
                                                <Github size={18} />
                                            </a>
                                        )}
                                        {profile.portfolioUrl && (
                                            <a href={profile.portfolioUrl} target="_blank" rel="noopener noreferrer"
                                                style={{ padding: '8px', background: '#e0e7ff', borderRadius: '8px', color: '#4f46e5' }}>
                                                <Globe size={18} />
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right: Action Buttons */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {/* Job Seeking Status Toggle */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '12px',
                                padding: '12px 16px',
                                background: profile.isLookingForJob ? '#dcfce7' : '#fee2e2',
                                borderRadius: '10px',
                                border: `2px solid ${profile.isLookingForJob ? '#10b981' : '#f87171'}`
                            }}>
                                <div>
                                    <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>Status Pencari Kerja</p>
                                    <p style={{ fontWeight: 700, color: profile.isLookingForJob ? '#16a34a' : '#dc2626' }}>
                                        {profile.isLookingForJob ? 'Aktif' : 'Tidak Aktif'}
                                    </p>
                                </div>
                                <button
                                    onClick={toggleJobSeekingStatus}
                                    disabled={isUpdatingStatus}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        cursor: isUpdatingStatus ? 'not-allowed' : 'pointer',
                                        opacity: isUpdatingStatus ? 0.5 : 1
                                    }}
                                >
                                    {profile.isLookingForJob ? (
                                        <ToggleRight size={36} color="#10b981" />
                                    ) : (
                                        <ToggleLeft size={36} color="#dc2626" />
                                    )}
                                </button>
                            </div>

                            <button
                                onClick={() => router.push('/profile/jobseeker/dashboard')}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '12px 24px',
                                    background: '#f3f4f6',
                                    color: '#374151',
                                    borderRadius: '10px',
                                    border: 'none',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    fontSize: '14px'
                                }}
                            >
                                <ArrowLeft size={18} />
                                Dashboard
                            </button>
                            <button
                                onClick={() => router.push('/profile/jobseeker?mode=edit')}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '12px 24px',
                                    background: '#4f46e5',
                                    color: 'white',
                                    borderRadius: '10px',
                                    border: 'none',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    fontSize: '14px'
                                }}
                            >
                                <Edit size={18} />
                                Edit Profile
                            </button>
                            <button
                                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '12px 24px',
                                    background: '#10b981',
                                    color: 'white',
                                    borderRadius: '10px',
                                    border: 'none',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    fontSize: '14px'
                                }}
                            >
                                <User size={18} />
                                Lihat Profile
                            </button>
                        </div>
                    </div>

                    {/* CV Download */}
                    {profile.cvUrl && (
                        <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e5e7eb' }}>
                            <a
                                href={profile.cvUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '12px 20px',
                                    background: '#dcfce7',
                                    color: '#16a34a',
                                    borderRadius: '10px',
                                    textDecoration: 'none',
                                    fontWeight: 600,
                                    fontSize: '14px'
                                }}
                            >
                                <Download size={18} />
                                Download CV
                            </a>
                        </div>
                    )}
                </div>

                {/* Grid Content */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                    
                    {/* Left Column */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        
                        {/* Personal Info */}
                        <div style={cardStyle}>
                            <h2 style={sectionTitleStyle}>
                                <User size={20} color="#4f46e5" />
                                Informasi Pribadi
                            </h2>
                            <div style={{ display: 'grid', gap: '12px' }}>
                                {profile.gender && (
                                    <div><p style={labelStyle}>Jenis Kelamin</p><p style={valueStyle}>{profile.gender}</p></div>
                                )}
                                {profile.religion && (
                                    <div><p style={labelStyle}>Agama</p><p style={valueStyle}>{profile.religion}</p></div>
                                )}
                                {profile.maritalStatus && (
                                    <div><p style={labelStyle}>Status</p><p style={valueStyle}>{profile.maritalStatus}</p></div>
                                )}
                                {profile.nationality && (
                                    <div><p style={labelStyle}>Kewarganegaraan</p><p style={valueStyle}>{profile.nationality}</p></div>
                                )}
                            </div>
                        </div>

                        {/* Job Preferences */}
                        <div style={cardStyle}>
                            <h2 style={sectionTitleStyle}>
                                <Target size={20} color="#4f46e5" />
                                Preferensi Kerja
                            </h2>
                            <div style={{ display: 'grid', gap: '12px' }}>
                                {profile.desiredJobTitle && (
                                    <div><p style={labelStyle}>Posisi Diinginkan</p><p style={valueStyle}>{profile.desiredJobTitle}</p></div>
                                )}
                                {profile.preferredJobType && (
                                    <div><p style={labelStyle}>Tipe Pekerjaan</p><p style={valueStyle}>{profile.preferredJobType}</p></div>
                                )}
                                {(profile.desiredSalaryMin || profile.desiredSalaryMax) && (
                                    <div><p style={labelStyle}>Ekspektasi Gaji</p><p style={valueStyle}>{formatCurrency(profile.desiredSalaryMin)} - {formatCurrency(profile.desiredSalaryMax)}</p></div>
                                )}
                                {profile.preferredLocation && (
                                    <div><p style={labelStyle}>Lokasi</p><p style={valueStyle}>{profile.preferredLocation}</p></div>
                                )}
                                <div><p style={labelStyle}>Bersedia Relokasi</p><p style={valueStyle}>{profile.willingToRelocate ? 'Ya' : 'Tidak'}</p></div>
                            </div>
                        </div>

                        {/* Skills */}
                        {profile.skills?.length > 0 && (
                            <div style={cardStyle}>
                                <h2 style={sectionTitleStyle}>
                                    <Star size={20} color="#4f46e5" />
                                    Skills
                                </h2>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {profile.skills.map((skill, i) => (
                                        <span key={i} style={badgeStyle}>{skill.name}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        
                        {/* Summary */}
                        {profile.summary && (
                            <div style={cardStyle}>
                                <h2 style={sectionTitleStyle}>
                                    <FileText size={20} color="#4f46e5" />
                                    Ringkasan
                                </h2>
                                <p style={{ color: '#374151', lineHeight: 1.7, whiteSpace: 'pre-wrap', fontSize: '14px' }}>
                                    {profile.summary}
                                </p>
                            </div>
                        )}

                        {/* Education */}
                        {profile.educations?.length > 0 && (
                            <div style={cardStyle}>
                                <h2 style={sectionTitleStyle}>
                                    <GraduationCap size={20} color="#4f46e5" />
                                    Pendidikan
                                </h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {profile.educations.map((edu, i) => (
                                        <div key={i} style={{ borderLeft: '3px solid #4f46e5', paddingLeft: '16px' }}>
                                            <h3 style={{ fontWeight: 600, color: '#111827', marginBottom: '2px' }}>{edu.degree} - {edu.fieldOfStudy}</h3>
                                            <p style={{ color: '#4f46e5', fontWeight: 500, fontSize: '14px' }}>{edu.institution}</p>
                                            <p style={{ color: '#6b7280', fontSize: '13px', marginTop: '4px' }}>
                                                {edu.level} • {formatMonthYear(edu.startDate)} - {edu.isCurrent ? 'Sekarang' : formatMonthYear(edu.endDate)}
                                            </p>
                                            {edu.gpa && <p style={{ color: '#6b7280', fontSize: '13px' }}>IPK: {edu.gpa}</p>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Experience */}
                        {profile.work_experiences?.length > 0 && profile.work_experiences[0].company && (
                            <div style={cardStyle}>
                                <h2 style={sectionTitleStyle}>
                                    <Briefcase size={20} color="#4f46e5" />
                                    Pengalaman
                                </h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {profile.work_experiences.map((exp, i) => (
                                        <div key={i} style={{ borderLeft: '3px solid #4f46e5', paddingLeft: '16px' }}>
                                            <h3 style={{ fontWeight: 600, color: '#111827', marginBottom: '2px' }}>{exp.position}</h3>
                                            <p style={{ color: '#4f46e5', fontWeight: 500, fontSize: '14px' }}>{exp.company}</p>
                                            <p style={{ color: '#6b7280', fontSize: '13px', marginTop: '4px' }}>
                                                {exp.location} • {formatMonthYear(exp.startDate)} - {exp.isCurrent ? 'Sekarang' : formatMonthYear(exp.endDate)}
                                            </p>
                                            {exp.description && <p style={{ color: '#374151', fontSize: '14px', marginTop: '8px' }}>{exp.description}</p>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Certifications */}
                        {profile.certifications?.length > 0 && profile.certifications[0].name && (
                            <div style={cardStyle}>
                                <h2 style={sectionTitleStyle}>
                                    <Award size={20} color="#4f46e5" />
                                    Sertifikat
                                </h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {profile.certifications.map((cert, i) => (
                                        <div key={i} style={{ padding: '12px', border: '1px solid #e5e7eb', borderRadius: '10px' }}>
                                            <h3 style={{ fontWeight: 600, color: '#111827', marginBottom: '2px' }}>{cert.name}</h3>
                                            <p style={{ color: '#4f46e5', fontSize: '14px' }}>{cert.issuingOrganization}</p>
                                            <p style={{ color: '#6b7280', fontSize: '13px', marginTop: '4px' }}>
                                                {formatMonthYear(cert.issueDate)}
                                                {cert.expiryDate && ` - ${formatMonthYear(cert.expiryDate)}`}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Back Button */}
                <div style={{ textAlign: 'center', marginTop: '32px' }}>
                    <button
                        onClick={() => router.push('/profile/jobseeker/dashboard')}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '12px 24px',
                            background: '#f3f4f6',
                            color: '#374151',
                            borderRadius: '10px',
                            border: 'none',
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontSize: '14px'
                        }}
                    >
                        <ArrowLeft size={18} />
                        Kembali ke Dashboard
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ViewProfilePage
