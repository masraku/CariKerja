'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import {
  Calendar,
  Clock,
  Video,
  Users,
  MapPin,
  Mail,
  CheckCircle,
  X,
  ArrowLeft,
  Send
} from 'lucide-react'
import Swal from 'sweetalert2'

export default function ScheduleInterviewPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [job, setJob] = useState(null)
  const [applicants, setApplicants] = useState([])

  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    duration: 60,
    meetingType: 'GOOGLE_MEET',
    meetingUrl: '',
    location: '',
    description: '',
    notes: ''
  })

  useEffect(() => {
    const jobId = searchParams.get('job')
    const applicantIds = searchParams.get('applicants')

    if (jobId && applicantIds) {
      loadData(jobId, applicantIds)
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Request',
        text: 'Missing required parameters',
        confirmButtonColor: '#2563EB'
      }).then(() => {
        router.push('/recruiter/dashboard')
      })
    }
  }, [])

  const loadData = async (jobId, applicantIds) => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')

      // Load job details
      const jobResponse = await fetch(`/api/jobs/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (jobResponse.ok) {
        const jobData = await jobResponse.json()
        setJob(jobData.job)
        
        // Set default interview title
        setFormData(prev => ({
          ...prev,
          title: `Interview for ${jobData.job.title}`
        }))
      }

      // Load applicants
      const applicantResponse = await fetch(`/api/applications/batch?ids=${applicantIds}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (applicantResponse.ok) {
        const applicantData = await applicantResponse.json()
        setApplicants(applicantData.applications)
      }

    } catch (error) {
      console.error('Load data error:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load data',
        confirmButtonColor: '#2563EB'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const generateGoogleMeetLink = () => {
    // This will be a placeholder - actual Google Meet link generation requires OAuth
    const meetLink = `https://meet.google.com/${Math.random().toString(36).substr(2, 10)}`
    setFormData(prev => ({
      ...prev,
      meetingUrl: meetLink
    }))
    
    Swal.fire({
      icon: 'info',
      title: 'Google Meet Link',
      text: 'In production, this will integrate with Google Calendar API to create actual meeting',
      confirmButtonColor: '#2563EB'
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation
    if (!formData.date || !formData.time) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Input',
        text: 'Please set date and time for the interview',
        confirmButtonColor: '#2563EB'
      })
      return
    }

    if (formData.meetingType === 'GOOGLE_MEET' && !formData.meetingUrl) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Meeting Link',
        text: 'Please generate or enter a Google Meet link',
        confirmButtonColor: '#2563EB'
      })
      return
    }

    if (formData.meetingType === 'IN_PERSON' && !formData.location) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Location',
        text: 'Please enter the interview location',
        confirmButtonColor: '#2563EB'
      })
      return
    }

    try {
      setSaving(true)

      const token = localStorage.getItem('token')
      const response = await fetch('/api/interviews/schedule', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          jobId: job.id,
          applicationIds: applicants.map(app => app.id)
        })
      })

      const data = await response.json()

      if (response.ok) {
        await Swal.fire({
          icon: 'success',
          title: 'Interview Scheduled!',
          text: `Interview has been scheduled for ${applicants.length} candidate(s)`,
          confirmButtonColor: '#2563EB'
        })
        router.push('/recruiter/interviews')
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Failed',
          text: data.error || 'Failed to schedule interview',
          confirmButtonColor: '#2563EB'
        })
      }
    } catch (error) {
      console.error('Schedule interview error:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to schedule interview',
        confirmButtonColor: '#2563EB'
      })
    } finally {
      setSaving(false)
    }
  }

  const removeApplicant = (applicantId) => {
    setApplicants(prev => prev.filter(app => app.id !== applicantId))
    
    if (applicants.length === 1) {
      Swal.fire({
        icon: 'warning',
        title: 'No Applicants',
        text: 'You need at least one applicant to schedule an interview',
        confirmButtonColor: '#2563EB'
      }).then(() => {
        router.back()
      })
    }
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-200 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Schedule Interview
            </h1>
            <p className="text-gray-600">
              Set up interview for {applicants.length} candidate(s)
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
              {/* Job Info */}
              {job && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-600 font-medium mb-1">Position</p>
                  <h3 className="text-lg font-bold text-gray-900">{job.title}</h3>
                  <p className="text-sm text-gray-600">{job.company.name}</p>
                </div>
              )}

              {/* Interview Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interview Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Technical Interview - Frontend Developer"
                  required
                />
              </div>

              {/* Date & Time */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time *
                  </label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    className="w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (minutes)
                </label>
                <select
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  className="w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={90}>1.5 hours</option>
                  <option value={120}>2 hours</option>
                </select>
              </div>

              {/* Meeting Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meeting Type *
                </label>
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    { value: 'GOOGLE_MEET', label: 'Google Meet', icon: Video },
                    { value: 'ZOOM', label: 'Zoom', icon: Video },
                    { value: 'IN_PERSON', label: 'In Person', icon: MapPin }
                  ].map(type => (
                    <label
                      key={type.value}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                        formData.meetingType === type.value
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="meetingType"
                        value={type.value}
                        checked={formData.meetingType === type.value}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div className="flex flex-col items-center text-center">
                        <type.icon className="w-6 h-6 text-gray-600 mb-2" />
                        <span className="font-medium text-gray-900">{type.label}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Meeting URL (for online meetings) */}
              {(formData.meetingType === 'GOOGLE_MEET' || formData.meetingType === 'ZOOM') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meeting Link *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      name="meetingUrl"
                      value={formData.meetingUrl}
                      onChange={handleChange}
                      className="flex-1 text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://meet.google.com/xxx-xxxx-xxx"
                      required
                    />
                    {formData.meetingType === 'GOOGLE_MEET' && (
                      <button
                        type="button"
                        onClick={generateGoogleMeetLink}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition whitespace-nowrap"
                      >
                        Generate Link
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.meetingType === 'GOOGLE_MEET' 
                      ? 'Google Meet link will be generated automatically or you can paste one'
                      : 'Enter your Zoom meeting link'}
                  </p>
                </div>
              )}

              {/* Location (for in-person) */}
              {formData.meetingType === 'IN_PERSON' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <textarea
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    rows={3}
                    className="w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter the interview location address"
                    required
                  />
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add any additional information about the interview..."
                />
              </div>

              {/* Internal Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Internal Notes (Private)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add internal notes (will not be shared with candidates)"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className={`flex-1 px-6 py-3 rounded-lg transition flex items-center justify-center gap-2 ${
                    saving
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
                      Scheduling...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Schedule Interview
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Sidebar - Selected Candidates */}
          <div>
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Selected Candidates ({applicants.length})
              </h3>

              <div className="space-y-3">
                {applicants.map((application) => (
                  <div
                    key={application.id}
                    className="p-3 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold overflow-hidden flex-shrink-0">
                          {application.jobseeker.photo ? (
                            <img
                              src={application.jobseeker.photo}
                              alt={application.jobseeker.firstName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            application.jobseeker.firstName?.charAt(0) || 'U'
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 text-sm truncate">
                            {application.jobseeker.firstName} {application.jobseeker.lastName}
                          </h4>
                          <p className="text-xs text-gray-600 truncate">
                            {application.jobseeker.currentTitle || 'Job Seeker'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeApplicant(application.id)}
                        className="p-1 hover:bg-red-50 rounded transition"
                        title="Remove"
                      >
                        <X className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Info Box */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <p className="font-medium mb-1">Email Notification</p>
                    <p className="text-blue-700">
                      All selected candidates will receive an email with interview details.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}