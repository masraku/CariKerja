import { NextResponse } from 'next/server'

export async function POST(request) {
    try {
        const body = await request.json()
        
        // Try external API first
        try {
            const response = await fetch('https://cv-parser-api.up.railway.app/api/match-skills', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
                signal: AbortSignal.timeout(5000) // 5 second timeout
            })

            if (response.ok) {
                const data = await response.json()
                return NextResponse.json(data)
            }
        } catch (externalError) {
            console.log('External AI API unavailable, using fallback matching')
        }

        // Fallback: Simple skill-based matching
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
        const matchScore = Math.min(100, Math.round((matchCount / maxPossible) * 100) + 20) // Base score + matching

        return NextResponse.json({
            match_score: matchScore,
            highlights: highlights.slice(0, 5),
            source: 'fallback'
        })
    } catch (error) {
        console.error('AI Match API error:', error)
        return NextResponse.json(
            { error: 'Failed to process', match_score: 50, highlights: [] },
            { status: 200 }
        )
    }
}

function extractKeywords(text) {
    if (!text) return []
    // Extract meaningful words (3+ chars, not common words)
    const commonWords = ['dan', 'atau', 'yang', 'untuk', 'dengan', 'dari', 'the', 'and', 'for', 'with', 'this', 'that']
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 2 && !commonWords.includes(w))
}
