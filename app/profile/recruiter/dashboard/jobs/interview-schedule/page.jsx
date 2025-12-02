'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import {
    Calendar,
    Clock,
    Video,
    Users,
    Mail,
    Phone,
    ArrowLeft,
    CheckCircle,
    AlertCircle,
    Copy,
    ExternalLink
} from 'lucide-react'
import Swal from 'sweetalert2'

function ScheduleInterviewContent() {
    const router = useRouter()
    const params = useParams()
    const searchParams = useSearchParams()
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [job, setJob] = useState(null)
    const [applications, setApplications] = useState([])

    const [formData, setFormData] = useState({
        interviewDate: '',
        interviewTime: '',
        duration: '60',
        meetingLink: '',
        notes: ''
    })

    useEffect(() => {
        loadApplications()
    }, [])

    const loadApplications = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem('token')
            const applicationIds = searchParams.get('applications')

            if (!applicationIds) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No applications selected'
                })
                router.back()
                return
            }

            const response = await fetch(
                `/api/recruiter/jobs/${params.slug}/schedule-interview?applications=${applicationIds}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            )

            if (response.ok) {
                const data = await response.json()
                setJob(data.job)
                setApplications(data.applications)

                // Auto-generate Google Meet link suggestion
                const meetLink = generateMeetLink()
                setFormData(prev => ({
                    ...prev,
                    meetingLink: meetLink
                }))
            } else {
                throw new Error('Failed to load applications')
            }
        } catch (error) {
            console.error('Load applications error:', error)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to load applications'
            })
            router.back()
        } finally {
            setLoading(false)
        }
    }

    const generateMeetLink = () => {
        // Generate a random Google Meet-style link
        const randomCode = Math.random().toString(36).substring(2, 15)
        return `https://meet.google.com/${randomCode}`
    }

    const handleGenerateNewLink = () => {
        const newLink = generateMeetLink()
        setFormData(prev => ({
            ...prev,
            meetingLink: newLink
        }))
    }

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text)
        Swal.fire({
            icon: 'success',
            title: 'Copied!',
            text: 'Meeting link copied to clipboard',
            timer: 1500,
            showConfirmButton: false
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        // Validation
        if (!formData.interviewDate || !formData.interviewTime) {
            Swal.fire({
                icon: 'warning',
                title: 'Incomplete Form',
                text: 'Please fill in date and time'
            })
            return
        }

        if (!formData.meetingLink) {
            Swal.fire({
                icon: 'warning',
                title: 'Meeting Link Required',
                text: 'Please provide a Google Meet link'
            })
            return
        }

        const result = await Swal.fire({
            title: 'Schedule Interview?',
            html: `
        <div class="text-left">
          <p class="mb-2">You are scheduling interview for <strong>${applications.length} candidate(s)</strong></p>
          <p class="text-sm text-gray-600">📅 Date: ${new Date(formData.interviewDate).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p class="text-sm text-gray-600">⏰ Time: ${formData.interviewTime}</p>
          <p class="text-sm text-gray-600">⏱️ Duration: ${formData.duration} minutes</p>
          <p class="text-sm text-gray-600 mt-2">Candidates will receive email notifications with the meeting link.</p>
        </div>
      `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3b82f6',
            cancelButtonColor: '#ef4444',
            confirmButtonText: 'Yes, Schedule',
            cancelButtonText: 'Cancel'
        })

        if (!result.isConfirmed) return

        setSubmitting(true)

        try {
            const token = localStorage.getItem('token')
            const response = await fetch(
                `/api/recruiter/jobs/${params.slug}/schedule-interview`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        applicationIds: applications.map(app => app.id),
                        ...formData
                    })
                }
            )

            const data = await response.json()

            if (response.ok) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Interview Scheduled!',
                    html: `
            <p>Successfully scheduled interview for ${applications.length} candidate(s)</p>
            <p class="text-sm text-gray-600 mt-2">Email notifications have been sent to all candidates</p>
          `,
                    confirmButtonColor: '#3b82f6'
                })

                router.push(`/recruiter/jobs/${params.slug}/applications`)
            } else {
                throw new Error(data.error || 'Failed to schedule interview')
            }
        } catch (error) {
            console.error('Schedule error:', error)
            Swal.fire({
                icon: 'error',
                title: 'Failed to Schedule',
                text: error.message
            })
        } finally {
            setSubmitting(false)
        }
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        )
    }

    // Get minimum date (today)
    const today = new Date().toISOString().split('T')[0]

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-5xl">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Applications
                    </button>

                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                    Schedule Interview
                                </h1>
                                <p className="text-gray-600">
                                    {job?.title} • {job?.company}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Main Form */}
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Interview Details</h2>

                            <div className="space-y-6">
                                {/* Date & Time */}
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Interview Date <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="date"
                                                name="interviewDate"
                                                value={formData.interviewDate}
                                                onChange={handleInputChange}
                                                min={today}
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Interview Time <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="time"
                                                name="interviewTime"
                                                value={formData.interviewTime}
                                                onChange={handleInputChange}
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Duration */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Duration
                                    </label>
                                    <select
                                        name="duration"
                                        value={formData.duration}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                    >
                                        <option value="30">30 minutes</option>
                                        <option value="45">45 minutes</option>
                                        <option value="60">1 hour</option>
                                        <option value="90">1.5 hours</option>
                                        <option value="120">2 hours</option>
                                    </select>
                                </div>

                                {/* Google Meet Link */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Google Meet Link <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <Video className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="url"
                                                name="meetingLink"
                                                value={formData.meetingLink}
                                                onChange={handleInputChange}
                                                placeholder="https://meet.google.com/xxx-xxxx-xxx"
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                                required
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => copyToClipboard(formData.meetingLink)}
                                            className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                                            title="Copy link"
                                        >
                                            <Copy className="w-5 h-5 text-gray-600" />
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-2 mt-2">
                                        <button
                                            type="button"
                                            onClick={handleGenerateNewLink}
                                            className="text-sm text-blue-600 hover:text-blue-700"
                                        >
                                            Generate new link
                                        </button>
                                        <span className="text-gray-400">•</span>
                                        <a
                                            href="https://meet.google.com/"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                        >
                                            Create on Google Meet
                                            <ExternalLink className="w-3 h-3" />
                                        </a>
                                    </div>
                                </div>

                                {/* Notes */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Additional Notes (Optional)
                                    </label>
                                    <textarea
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleInputChange}
                                        rows="4"
                                        placeholder="Any additional information for the candidates..."
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                    ></textarea>
                                </div>

                                {/* Info Box */}
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                        <div className="text-sm text-blue-800">
                                            <p className="font-semibold mb-1">Interview Notification</p>
                                            <p>
                                                All selected candidates will receive an email with the interview schedule and Google Meet link.
                                                Make sure to create the meeting on Google Meet before sending invitations.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className={`w-full py-4 rounded-lg font-semibold text-white transition flex items-center justify-center gap-2 ${submitting
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-blue-600 hover:bg-blue-700'
                                        }`}
                                >
                                    {submitting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
                                            Scheduling...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="w-5 h-5" />
                                            Schedule Interview for {applications.length} Candidate(s)
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Sidebar - Selected Candidates */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Users className="w-5 h-5 text-blue-600" />
                                <h3 className="font-bold text-gray-900">
                                    Selected Candidates ({applications.length})
                                </h3>
                            </div>

                            <div className="space-y-3 max-h-[600px] overflow-y-auto">
                                {applications.map((app) => (
                                    <div
                                        key={app.id}
                                        className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm overflow-hidden flex-shrink-0">
                                                {app.jobseeker.photo ? (
                                                    <img
                                                        src={app.jobseeker.photo}
                                                        alt={app.jobseeker.firstName}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    app.jobseeker.firstName?.charAt(0) || 'U'
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-gray-900 text-sm truncate">
                                                    {app.jobseeker.firstName} {app.jobseeker.lastName}
                                                </h4>
                                                {app.jobseeker.currentTitle && (
                                                    <p className="text-xs text-gray-600 truncate">
                                                        {app.jobseeker.currentTitle}
                                                    </p>
                                                )}
                                                <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                                    <Mail className="w-3 h-3" />
                                                    <span className="truncate">{app.jobseeker.email}</span>
                                                </div>
                                                {app.jobseeker.phone && (
                                                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                                        <Phone className="w-3 h-3" />
                                                        <span>{app.jobseeker.phone}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div >
        </div >
    )
}

export default function ScheduleInterviewPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Memuat halaman...</p>
                </div>
            </div>
        }>
            <ScheduleInterviewContent />
        </Suspense>
    )
}