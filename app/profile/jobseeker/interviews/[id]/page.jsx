'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import {
  Calendar,
  Clock,
  Video,
  ArrowLeft,
  Building2,
  MapPin,
  Briefcase,
  User,
  Mail,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink
} from 'lucide-react'

export default function JobseekerInterviewDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [interview, setInterview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [timeUntil, setTimeUntil] = useState(null)
  const [responding, setResponding] = useState(false)

  useEffect(() => {
    loadInterviewDetails()
  }, [params.id])

  useEffect(() => {
    if (!interview) return

    const interval = setInterval(() => {
      const now = new Date()
      const scheduledTime = new Date(interview.interview.scheduledAt)
      const diff = scheduledTime - now

      setTimeUntil(diff)
    }, 1000)

    return () => clearInterval(interval)
  }, [interview])

  const loadInterviewDetails = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/profile/jobseeker/interviews/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setInterview(data.data)
      } else {
        alert(data.error || 'Failed to load interview')
        router.push('/profile/jobseeker/interviews')
      }
    } catch (error) {
      alert('Failed to load interview details')
    } finally {
      setLoading(false)
    }
  }

  const handleResponse = async (response) => {
    if (!confirm(`Are you sure you want to ${response.toLowerCase()} this interview invitation?`)) {
      return
    }

    setResponding(true)

    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/profile/jobseeker/interviews/${params.id}/respond`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ response })
      })

      const data = await res.json()

      if (res.ok && data.success) {
        alert(`You have ${response.toLowerCase()}ed the interview invitation!`)
        loadInterviewDetails()
      } else {
        alert(data.error || 'Failed to respond to interview')
      }
    } catch (error) {
      alert('Failed to respond to interview')
    } finally {
      setResponding(false)
    }
  }

  const formatCountdown = (ms) => {
    if (ms < 0) return 'Interview time has passed'

    const days = Math.floor(ms / (1000 * 60 * 60 * 24))
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((ms % (1000 * 60)) / 1000)

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`
    } else if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`
    } else {
      return `${minutes}m ${seconds}s`
    }
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

  const canJoin = interview.timing.canJoin
  const isPast = interview.timing.isPast

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/profile/jobseeker/interviews')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Interviews
          </button>

          <h1 className="text-3xl font-bold text-gray-900">{interview.interview.title}</h1>
        </div>

        {/* Countdown Banner */}
        {!isPast && (
          <div className={`rounded-lg p-6 mb-6 ${
            canJoin 
              ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' 
              : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90 mb-1">
                  {canJoin ? '🎯 Interview is ready to join!' : '⏰ Time until interview'}
                </p>
                <p className="text-3xl font-bold">
                  {timeUntil !== null ? formatCountdown(timeUntil) : '...'}
                </p>
              </div>
              {canJoin && (
                <a
                  href={interview.interview.meetingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-6 py-3 bg-white text-green-600 rounded-lg font-bold hover:bg-gray-100 transition"
                >
                  <Video className="w-5 h-5" />
                  Join Now
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        )}

        {/* Response Actions */}
        {interview.myParticipation.status === 'PENDING' && !isPast && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">Interview Invitation Pending</h3>
                <p className="text-gray-600 mb-4">
                  Silakan respon undangan wawancara ini. Beritahu rekruter apakah Anda dapat hadir.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleResponse('ACCEPT')}
                    disabled={responding}
                    className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Accept Invitation
                  </button>
                  <button
                    onClick={() => handleResponse('DECLINE')}
                    disabled={responding}
                    className="flex items-center gap-2 px-6 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    Decline
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Status Badge */}
        {interview.myParticipation.status !== 'PENDING' && (
          <div className={`rounded-lg p-4 mb-6 ${
            interview.myParticipation.status === 'ACCEPTED' ? 'bg-green-50 border border-green-200' :
            interview.myParticipation.status === 'DECLINED' ? 'bg-red-50 border border-red-200' :
            interview.myParticipation.status === 'COMPLETED' ? 'bg-blue-50 border border-blue-200' :
            'bg-gray-50 border border-gray-200'
          }`}>
            <div className="flex items-center gap-3">
              {interview.myParticipation.status === 'ACCEPTED' && <CheckCircle className="w-5 h-5 text-green-600" />}
              {interview.myParticipation.status === 'DECLINED' && <XCircle className="w-5 h-5 text-red-600" />}
              {interview.myParticipation.status === 'COMPLETED' && <CheckCircle className="w-5 h-5 text-blue-600" />}
              <div>
                <p className={`font-medium ${
                  interview.myParticipation.status === 'ACCEPTED' ? 'text-green-900' :
                  interview.myParticipation.status === 'DECLINED' ? 'text-red-900' :
                  interview.myParticipation.status === 'COMPLETED' ? 'text-blue-900' :
                  'text-gray-900'
                }`}>
                  {interview.myParticipation.status === 'ACCEPTED' && 'You have accepted this interview invitation'}
                  {interview.myParticipation.status === 'DECLINED' && 'You have declined this interview invitation'}
                  {interview.myParticipation.status === 'COMPLETED' && 'Interview completed'}
                  {interview.myParticipation.status === 'NO_SHOW' && 'Marked as no-show'}
                </p>
                {interview.myParticipation.respondedAt && (
                  <p className="text-sm text-gray-600">
                    Responded on {new Date(interview.myParticipation.respondedAt).toLocaleDateString('id-ID')}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* Interview Details */}
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
                    className="font-medium text-blue-600 hover:text-blue-700 break-all inline-flex items-center gap-1"
                  >
                    {interview.interview.meetingUrl}
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {interview.interview.description && (
                <div>
                  <p className="text-sm text-gray-600 mb-1 font-medium">About this Interview</p>
                  <p className="text-gray-900 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                    {interview.interview.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Job Details */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Job Information</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{interview.job.title}</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    {interview.job.type}
                  </span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                    {interview.job.level}
                  </span>
                  <span className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                    <MapPin className="w-3 h-3" />
                    {interview.job.location}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-start gap-3">
                  {interview.company.logo ? (
                    <img
                      src={interview.company.logo}
                      alt={interview.company.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                      <Building2 className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold text-gray-900">{interview.company.name}</h4>
                    <p className="text-sm text-gray-600">{interview.company.industry}</p>
                    <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" />
                      {interview.company.city}
                    </p>
                  </div>
                </div>
                {interview.company.description && (
                  <p className="text-sm text-gray-600 mt-3">{interview.company.description}</p>
                )}
              </div>
            </div>
          </div>

          {/* Kontak Rekruter */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Kontak Rekruter</h2>
            
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-lg font-bold">
                <User className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{interview.recruiter.name}</p>
                <p className="text-sm text-gray-600">{interview.recruiter.position}</p>
                <a
                  href={`mailto:${interview.recruiter.email}`}
                  className="text-sm text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 mt-1"
                >
                  <Mail className="w-4 h-4" />
                  {interview.recruiter.email}
                </a>
              </div>
            </div>
          </div>

          {/* Preparation Tips */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-3">📝 Interview Preparation Tips</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>Test your internet connection and Google Meet setup 15 minutes before</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>Prepare questions about the role and company</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>Review your resume and be ready to discuss your experience</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>Find a quiet, well-lit space for the interview</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
