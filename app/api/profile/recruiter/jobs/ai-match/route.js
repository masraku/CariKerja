

import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'

const prisma = new PrismaClient()

// Supabase client untuk storage
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
)

export async function POST(request) {
    try {
        const contentType = request.headers.get('content-type')
        
        // ============================================
        // SCENARIO 1: CV Upload (multipart/form-data)
        // ============================================
        if (contentType?.includes('multipart/form-data')) {
            return await handleCVUpload(request)
        }
        
        // ============================================
        // SCENARIO 2: Skill Matching (application/json) - EXISTING
        // ============================================
        return await handleSkillMatching(request)
        
    } catch (error) {
        return NextResponse.json(
            { 
                success: false,
                error: error.message || 'Failed to process',
                match_score: 50, 
                highlights: [] 
            },
            { status: 500 }
        )
    }
}

// ============================================
// NEW: Handle CV Upload + Python API Matching
// ============================================
async function handleCVUpload(request) {
    try {
        // 1. Parse form data
        const formData = await request.formData()
        const cvFile = formData.get('cv')
        const jobId = formData.get('job_id')
        const jobseekerId = formData.get('jobseeker_id')
        

        // Validation
        if (!cvFile || !jobId || !jobseekerId) {
            return NextResponse.json({
                success: false,
                error: 'Missing required fields: cv, job_id, jobseeker_id'
            }, { status: 400 })
        }

        // Validate file type
        if (!cvFile.type.includes('pdf')) {
            return NextResponse.json({
                success: false,
                error: 'Only PDF files are allowed'
            }, { status: 400 })
        }

        // Validate file size (max 5MB)
        if (cvFile.size > 5 * 1024 * 1024) {
            return NextResponse.json({
                success: false,
                error: 'File size must be less than 5MB'
            }, { status: 400 })
        }

        // 2. Get job details with skills
        const job = await prisma.jobs.findUnique({
            where: { id: jobId },
            include: {
                job_skills: {
                    include: {
                        skills: true
                    },
                    where: {
                        isRequired: true
                    }
                },
                companies: {
                    select: {
                        name: true
                    }
                }
            }
        })
        
        if (!job) {
            return NextResponse.json({
                success: false,
                error: 'Job not found'
            }, { status: 404 })
        }

        // Extract required skills
        const requiredSkills = job.job_skills.map(js => js.skills.name)
        

        // 3. Upload CV to Supabase Storage
        const fileName = `cvs/${jobseekerId}/${Date.now()}_${cvFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
        
        
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('Profile')
            .upload(fileName, cvFile, {
                contentType: 'application/pdf',
                upsert: false
            })

        if (uploadError) {
            return NextResponse.json({
                success: false,
                error: 'Failed to upload CV: ' + uploadError.message
            }, { status: 500 })
        }

        // 4. Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('Profile')
            .getPublicUrl(fileName)


        // 5. Call Python Matching API
        const pythonApiUrl = process.env.NEXT_PUBLIC_PYTHON_API_URL || 'http://localhost:5000'
        
        
        let matchResult = null
        let matchingSuccess = false

        try {
            const matchResponse = await fetch(`${pythonApiUrl}/api/match`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    uri_cv: publicUrl,
                    job_title: job.title,
                    required_skill: requiredSkills
                }),
                signal: AbortSignal.timeout(30000) // 30 second timeout
            })

            if (matchResponse.ok) {
                matchResult = await matchResponse.json()
                matchingSuccess = matchResult.success
            } else {
                const errorText = await matchResponse.text()
            }
        } catch (pythonError) {
        }

        // 6. Generate unique application ID
        const applicationId = `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

        // 7. Prepare application data
        const applicationData = {
            id: applicationId,
            jobId: jobId,
            jobseekerId: jobseekerId,
            resumeUrl: publicUrl,
            status: 'PENDING',
            appliedAt: new Date(),
            updatedAt: new Date(),
            viewed: false
        }

        // Add matching results if successful
        if (matchingSuccess && matchResult) {
            applicationData.candidateName = matchResult.nama || null
            applicationData.candidateEmail = matchResult.kontak?.email || null
            applicationData.candidatePhone = matchResult.kontak?.phone || null
            applicationData.matchedSkills = matchResult.skill || []
            applicationData.matchStatus = matchResult.status || 'NOT_RECOMMENDED'
            applicationData.matchPercentage = matchResult.persentase || '0%'
        } else {
            // Matching failed or not available
            applicationData.matchStatus = 'ERROR'
            applicationData.errorMessage = matchResult?.error || 'CV matching service unavailable'
            
        }

        // 8. Save to database (upsert to handle existing applications)
        const application = await prisma.applications.upsert({
            where: {
                jobId_jobseekerId: {
                    jobId: jobId,
                    jobseekerId: jobseekerId
                }
            },
            update: {
                resumeUrl: publicUrl,
                updatedAt: new Date(),
                candidateName: applicationData.candidateName,
                candidateEmail: applicationData.candidateEmail,
                candidatePhone: applicationData.candidatePhone,
                matchedSkills: applicationData.matchedSkills,
                matchStatus: applicationData.matchStatus,
                matchPercentage: applicationData.matchPercentage,
                errorMessage: applicationData.errorMessage
            },
            create: applicationData,
            include: {
                jobs: {
                    select: {
                        title: true,
                        companies: {
                            select: {
                                name: true
                            }
                        }
                    }
                }
            }
        })


        // 9. Prepare response message
        let responseMessage = 'Application submitted successfully.'
        
        if (matchingSuccess && matchResult?.status === 'RECOMMENDED') {
            responseMessage = `Great news! Your CV matches ${matchResult.persentase} with the job requirements.`
        } else if (matchingSuccess && matchResult?.status === 'NOT_RECOMMENDED') {
            responseMessage = 'Application submitted. Our team will review your application.'
        }

        // 10. Return success response
        return NextResponse.json({
            success: true,
            message: responseMessage,
            application: {
                id: application.id,
                job_title: application.jobs.title,
                company_name: application.jobs.companies.name,
                cv_url: publicUrl,
                candidate_name: matchResult?.nama,
                match_status: matchResult?.status,
                match_percentage: matchResult?.persentase,
                matched_skills: matchResult?.skill,
                applied_at: application.appliedAt
            }
        })

    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error.message || 'Failed to process CV upload'
        }, { status: 500 })
    } finally {
        await prisma.$disconnect()
    }
}

// ============================================
// EXISTING: Handle Skill Matching (JSON)
// ============================================
async function handleSkillMatching(request) {
    try {
        const body = await request.json()
        
        // Try external Python API first
        try {
            const pythonApiUrl = process.env.NEXT_PUBLIC_PYTHON_API_URL
            
            if (pythonApiUrl) {
                
                const response = await fetch(`${pythonApiUrl}/api/match`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        // Map existing format ke Python API format
                        uri_cv: body.cv_url || '',
                        job_title: body.job_requirements?.title || '',
                        required_skill: body.job_requirements?.skills || []
                    }),
                    signal: AbortSignal.timeout(5000) // 5 second timeout
                })

                if (response.ok) {
                    const data = await response.json()
                    
                    // Transform Python response ke format existing
                    return NextResponse.json({
                        match_score: data.persentase ? parseInt(data.persentase) : 50,
                        highlights: data.skill || [],
                        source: 'python_api',
                        candidate_name: data.nama,
                        status: data.status
                    })
                }
            }
        } catch (externalError) {
        }

        // Fallback: Simple skill-based matching (EXISTING LOGIC)
        const cvSkills = body.cv_skills || []
        const jobRequirements = body.job_requirements || {}
        const jobSkills = jobRequirements.skills || []
        const jobTitle = jobRequirements.title || ''
        const jobDesc = jobRequirements.description || ''
        const requirements = jobRequirements.requirements || ''

        // Extract keywords from job info
        const jobKeywords = [
            ...jobSkills,
            ...jobTitle.toLowerCase().split(/\s+/),
            ...extractKeywords(jobDesc),
            ...extractKeywords(requirements)
        ].filter(k => k.length > 2)

        // Calculate match score
        let matchCount = 0
        const highlights = []
        
        cvSkills.forEach(skill => {
            const skillLower = skill.toLowerCase()
            if (jobKeywords.some(kw => kw.includes(skillLower) || skillLower.includes(kw))) {
                matchCount++
                highlights.push(skill)
            }
        })

        const maxPossible = Math.max(jobKeywords.length, cvSkills.length, 1)
        const matchScore = Math.min(100, Math.round((matchCount / maxPossible) * 100) + 20)

        return NextResponse.json({
            match_score: matchScore,
            highlights: highlights.slice(0, 5),
            source: 'fallback'
        })
        
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to process', match_score: 50, highlights: [] },
            { status: 200 }
        )
    }
}

// Helper function
function extractKeywords(text) {
    if (!text) return []
    const commonWords = ['dan', 'atau', 'yang', 'untuk', 'dengan', 'dari', 'the', 'and', 'for', 'with', 'this', 'that']
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 2 && !commonWords.includes(w))
}