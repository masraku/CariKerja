'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import {
  Calendar,
  Clock,
  Video,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Building2
} from 'lucide-react'

export default function RecruiterInterviewDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [interview, setInterview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showRescheduleModal, setShowRescheduleModal] = useState(false)
  const [rescheduleForm, setRescheduleForm] = useState({
    scheduledAt: '',
    duration: '',
    meetingUrl: '',
    description: ''
  })

  useEffect(() => {
    loadInterviewDetails()
  }, [params.id])

  const loadInterviewDetails = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/profile/recruiter/interviews/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setInterview(data.data)
        // Set initial reschedule form values
        setRescheduleForm({
          scheduledAt: new Date(data.data.interview.scheduledAt).toISOString().slice(0, 16),
          duration: data.data.interview.duration,
          meetingUrl: data.data.interview.meetingUrl,
          description: data.data.interview.description || ''
        })
      } else {
        alert(data.error || 'Failed to load interview')
        router.push('/profile/recruiter/dashboard')
      }
    } catch (error) {
      console.error('Load interview error:', error)
      alert('Failed to load interview details')
    } finally {
      setLoading(false)
    }
  }

  const handleReschedule = async (e) => {
    e.preventDefault()

    if (!confirm('Are you sure you want to reschedule this interview? All participants will be notified via email.')) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/profile/recruiter/interviews/${params.id}/reschedule`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          scheduledAt: new Date(rescheduleForm.scheduledAt).toISOString(),
          duration: parseInt(rescheduleForm.duration),
          meetingUrl: rescheduleForm.meetingUrl,
          description: rescheduleForm.description
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        alert('Interview rescheduled successfully! Notifications sent to all participants.')
        setShowRescheduleModal(false)
        loadInterviewDetails()
      } else {
        alert(data.error || 'Failed to reschedule interview')
      }
    } catch (error) {
      console.error('Reschedule error:', error)
      alert('Failed to reschedule interview')
    }
  }

  const handleCompleteInterview = async () => {
    if (!confirm('Mark this interview as completed? This will allow you to accept or reject candidates.')) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/profile/recruiter/interviews/${params.id}/complete`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (response.ok && data.success) {
        alert('Interview marked as completed successfully!')
        router.push('/profile/recruiter/dashboard/applications')
      } else {
        alert(data.error || 'Failed to mark interview as completed')
      }
    } catch (error) {
      console.error('Complete interview error:', error)
      alert('Failed to mark interview as completed')
    }
  }

  const canCompleteInterview = () => {
    if (!interview) return false
    if (interview.interview.status === 'COMPLETED') return false
    const now = new Date()
    const scheduled = new Date(interview.interview.scheduledAt)
    return now > scheduled // Can only complete if interview time has passed
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading interview details...</p>
        </div>
      </div>
    )
  }

  if (!interview) {
    return null
  }

  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Jakarta'
    }).format(new Date(dateString))
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: AlertCircle },
      ACCEPTED: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      DECLINED: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
      COMPLETED: { bg: 'bg-blue-100', text: 'text-blue-800', icon: CheckCircle },
      NO_SHOW: { bg: 'bg-gray-100', text: 'text-gray-800', icon: XCircle }
    }

    const config = statusConfig[status] || statusConfig.PENDING
    const Icon = config.icon

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3" />
        {status}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{interview.interview.title}</h1>
              <p className="text-gray-600 mt-1">{interview.job.title} - {interview.company.name}</p>
            </div>
            
            <div className="flex gap-3">
              {canCompleteInterview() && (
                <button
                  onClick={handleCompleteInterview}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  <CheckCircle className="w-4 h-4" />
                  Mark as Completed
                </button>
              )}
              
              {interview.interview.status !== 'COMPLETED' && interview.interview.status !== 'CANCELLED' && (
                <button
                  onClick={() => setShowRescheduleModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <Edit className="w-4 h-4" />
                  Reschedule
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Interview Details Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Interview Details</h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Scheduled At</p>
                    <p className="font-medium text-gray-900">{formatDate(interview.interview.scheduledAt)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="font-medium text-gray-900">{interview.interview.duration} minutes</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Video className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Meeting Link</p>
                    <a
                      href={interview.interview.meetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-blue-600 hover:text-blue-700 break-all"
                    >
                      {interview.interview.meetingUrl}
                    </a>
                  </div>
                </div>

                {interview.interview.description && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Description</p>
                    <p className="text-gray-900 whitespace-pre-wrap">{interview.interview.description}</p>
                  </div>
                )}

                {interview.interview.notes && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-amber-900 mb-1">Private Notes</p>
                    <p className="text-sm text-amber-800 whitespace-pre-wrap">{interview.interview.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Participants List */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Participants ({interview.stats.total})</h2>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    {interview.stats.accepted} Accepted
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                    {interview.stats.pending} Pending
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    {interview.stats.declined} Declined
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {interview.participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                      {participant.candidate.photo ? (
                        <img
                          src={participant.candidate.photo}
                          alt={participant.candidate.name}
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        participant.candidate.firstName.charAt(0)
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">{participant.candidate.name}</h3>
                          <p className="text-sm text-gray-600">{participant.candidate.currentTitle || 'Job Seeker'}</p>
                        </div>
                        {getStatusBadge(participant.status)}
                      </div>

                      <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {participant.candidate.email}
                        </span>
                        {participant.candidate.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            {participant.candidate.phone}
                          </span>
                        )}
                        {participant.candidate.city && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {participant.candidate.city}
                          </span>
                        )}
                      </div>

                      {participant.respondedAt && (
                        <p className="text-xs text-gray-500 mt-2">
                          Responded on {new Date(participant.respondedAt).toLocaleDateString('id-ID')}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Interview Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Status</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    interview.interview.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-800' :
                    interview.interview.status === 'RESCHEDULED' ? 'bg-amber-100 text-amber-800' :
                    interview.interview.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {interview.interview.status}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Participants</span>
                  <span className="font-medium">{interview.stats.total}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Accepted</span>
                  <span className="font-medium text-green-600">{interview.stats.accepted}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Pending</span>
                  <span className="font-medium text-yellow-600">{interview.stats.pending}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Declined</span>
                  <span className="font-medium text-red-600">{interview.stats.declined}</span>
                </div>
              </div>
            </div>

            {/* Company Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Company</h3>
              <div className="flex items-start gap-3">
                {interview.company.logo ? (
                  <img
                    src={interview.company.logo}
                    alt={interview.company.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-gray-400" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900">{interview.company.name}</p>
                  <p className="text-sm text-gray-600">{interview.company.city}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reschedule Modal */}
      {showRescheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Reschedule Interview</h2>
              <p className="text-gray-600 mt-1">Update interview schedule and notify all participants</p>
            </div>

            <form onSubmit={handleReschedule} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Date & Time *
                </label>
                <input
                  type="datetime-local"
                  value={rescheduleForm.scheduledAt}
                  onChange={(e) => setRescheduleForm({...rescheduleForm, scheduledAt: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (minutes) *
                </label>
                <input
                  type="number"
                  value={rescheduleForm.duration}
                  onChange={(e) => setRescheduleForm({...rescheduleForm, duration: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="15"
                  step="15"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Google Meet Link *
                </label>
                <input
                  type="url"
                  value={rescheduleForm.meetingUrl}
                  onChange={(e) => setRescheduleForm({...rescheduleForm, meetingUrl: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://meet.google.com/..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={rescheduleForm.description}
                  onChange={(e) => setRescheduleForm({...rescheduleForm, description: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="4"
                  placeholder="Add any additional information about the rescheduled interview..."
                />
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-800">
                  <strong>⚠️ Note:</strong> All participants will receive an email notification with the updated schedule.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowRescheduleModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Reschedule Interview
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
