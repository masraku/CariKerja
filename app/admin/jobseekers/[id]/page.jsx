'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
    User, Mail, Phone, MapPin, Calendar, Briefcase, 
    GraduationCap, Award, FileText, ArrowLeft, Download,
    ExternalLink, CheckCircle, XCircle
} from 'lucide-react'
import Swal from 'sweetalert2'

export default function AdminJobseekerDetail() {
    const params = useParams()
    const router = useRouter()
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (params.id) {
            loadProfile()
        }
    }, [params.id])

    const loadProfile = async () => {
        try {
            const token = localStorage.getItem('token')
            // Using the same endpoint as list but filtering or a specific detail endpoint if available
            // Assuming we might need to fetch all and find or use a specific endpoint
            // For now, let's try a direct endpoint if it exists, or fallback to fetching all
            
            // Note: In a real app we would have /api/admin/jobseekers/:id
            // But based on previous file exploration, we only saw /api/admin/jobseekers route
            // Let's try to fetch all and filter for now as a fallback, or assume the API handles query
            
            const response = await fetch(`/api/admin/jobseekers/${params.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })

            // If direct endpoint fails (404), try fetching list
            if (!response.ok) {
                const listResponse = await fetch('/api/admin/jobseekers', {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                const listData = await listResponse.json()
                if (listData.success) {
                    const found = listData.data.jobseekers.find(j => j.id === params.id)
                    setProfile(found)
                }
            } else {
                const data = await response.json()
                if (data.success) {
                    setProfile(data.data)
                }
            }
        } catch (error) {
            console.error('Error loading profile:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
             <div className="min-h-screen bg-slate-50 p-8 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-slate-50 p-8 flex flex-col items-center justify-center">
                <User className="h-16 w-16 text-slate-300 mb-4" />
                <h2 className="text-xl font-bold text-slate-700">Jobseeker tidak ditemukan</h2>
                <button 
                    onClick={() => router.back()}
                    className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                >
                    Kembali ke Daftar
                </button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-12">
            {/* Header / Hero */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <button
                        onClick={() => router.back()}
                        className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 transition mb-6 group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition" />
                        <span className="text-sm font-medium">Kembali</span>
                    </button>

                    <div className="flex flex-col md:flex-row items-start gap-8">
                        {/* Profile Photo */}
                        <div className="w-32 h-32 rounded-2xl bg-slate-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg flex-shrink-0">
                            {profile.photo ? (
                                <img src={profile.photo} alt={profile.firstName} className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-12 h-12 text-slate-300" />
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <h1 className="text-3xl font-bold text-slate-900 mb-2">
                                {profile.firstName} {profile.lastName}
                            </h1>
                            <p className="text-xl text-slate-600 mb-4">{profile.currentTitle || 'Jobseeker'}</p>
                            
                            <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                                {profile.city && (
                                    <div className="flex items-center gap-1.5">
                                        <MapPin className="w-4 h-4 text-slate-400" />
                                        {profile.city}, {profile.province}
                                    </div>
                                )}
                                <div className="flex items-center gap-1.5">
                                    <Mail className="w-4 h-4 text-slate-400" />
                                    {profile.email}
                                </div>
                                {profile.phone && (
                                    <div className="flex items-center gap-1.5">
                                        <Phone className="w-4 h-4 text-slate-400" />
                                        {profile.phone}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                             {/* Status Badges */}
                            <div className="flex gap-2">
                                {profile.isEmployed ? (
                                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
                                        Sudah Bekerja
                                    </span>
                                ) : (
                                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">
                                        Belum Bekerja
                                    </span>
                                )}
                                {profile.isLookingForJob && (
                                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                                        Open to Work
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column - Main Info */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Summary */}
                        {profile.summary && (
                            <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <User className="w-5 h-5 text-blue-600" />
                                    Tentang Saya
                                </h2>
                                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                                    {profile.summary}
                                </p>
                            </section>
                        )}

                        {/* Experience */}
                        {(profile.experiences && profile.experiences.length > 0) && (
                            <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                                <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    <Briefcase className="w-5 h-5 text-purple-600" />
                                    Pengalaman Kerja
                                </h2>
                                <div className="space-y-8">
                                    {profile.experiences.map((exp, i) => (
                                        <div key={i} className="relative pl-8 border-l-2 border-slate-100 last:border-0">
                                            <div className="absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full bg-purple-600 ring-4 ring-white" />
                                            <h3 className="font-bold text-slate-900">{exp.position}</h3>
                                            <div className="text-slate-600 font-medium mb-1">{exp.company}</div>
                                            <div className="text-sm text-slate-400 mb-3">
                                                {new Date(exp.startDate).toLocaleDateString()} - {exp.isCurrent ? 'Sekarang' : new Date(exp.endDate).toLocaleDateString()}
                                            </div>
                                            <p className="text-slate-600 text-sm leading-relaxed">
                                                {exp.description}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Education */}
                        {(profile.educations && profile.educations.length > 0) && (
                            <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                                <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    <GraduationCap className="w-5 h-5 text-emerald-600" />
                                    Pendidikan
                                </h2>
                                <div className="space-y-6">
                                    {profile.educations.map((edu, i) => (
                                        <div key={i} className="flex gap-4">
                                            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                                <GraduationCap className="w-6 h-6 text-emerald-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-900">{edu.institution}</h3>
                                                <div className="text-slate-600">{edu.degree} - {edu.fieldOfStudy}</div>
                                                <div className="text-sm text-slate-400 mt-1">
                                                    {new Date(edu.startDate).getFullYear()} - {edu.isCurrent ? 'Sekarang' : new Date(edu.endDate).getFullYear()}
                                                </div>
                                                {edu.gpa && (
                                                    <div className="inline-block mt-2 px-2 py-1 bg-slate-100 rounded text-xs font-medium text-slate-600">
                                                        IPK: {edu.gpa}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="space-y-6">
                        {/* Skills */}
                        {(profile.skills && profile.skills.length > 0) && (
                            <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <Award className="w-5 h-5 text-amber-500" />
                                    Keahlian
                                </h2>
                                <div className="flex flex-wrap gap-2">
                                    {profile.skills.map((skill, i) => (
                                        <span key={i} className="px-3 py-1.5 bg-slate-50 text-slate-700 rounded-lg text-sm font-medium border border-slate-100">
                                            {typeof skill === 'string' ? skill : skill.name}
                                        </span>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Documents */}
                        <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-slate-500" />
                                Dokumen
                            </h2>
                            <div className="space-y-3">
                                {profile.cvUrl && (
                                    <a 
                                        href={profile.cvUrl} 
                                        target="_blank"
                                        className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center text-red-500">
                                                <FileText className="w-4 h-4" />
                                            </div>
                                            <span className="text-sm font-medium text-slate-700 group-hover:text-blue-700">CV / Resume</span>
                                        </div>
                                        <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
                                    </a>
                                )}
                                {profile.ktpUrl && (
                                    <a 
                                        href={profile.ktpUrl} 
                                        target="_blank"
                                        className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-500">
                                                <FileText className="w-4 h-4" />
                                            </div>
                                            <span className="text-sm font-medium text-slate-700 group-hover:text-blue-700">KTP</span>
                                        </div>
                                        <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
                                    </a>
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    )
}
