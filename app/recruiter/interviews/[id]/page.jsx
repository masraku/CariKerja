'use client'
import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function RecruiterInterviewRedirect() {
  const router = useRouter()
  const params = useParams()

  useEffect(() => {
    // Redirect to correct path
    router.replace(`/profile/recruiter/interviews/${params.id}`)
  }, [router, params.id])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  )
}
