import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const industry = searchParams.get('industry') || ''
    const size = searchParams.get('size') || ''

    console.log('🏢 Fetching companies with filters:', { search, industry, size })

    // Build where clause
    const where = {
      AND: [
        // Only show companies with at least one recruiter
        {
          recruiters: {
            some: {}
          }
        }
      ]
    }

    // Search filter
    if (search) {
      where.AND.push({
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { industry: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      })
    }

    // Industry filter
    if (industry && industry !== 'all') {
      where.AND.push({
        industry: { equals: industry, mode: 'insensitive' }
      })
    }

    // Size filter
    if (size && size !== 'all') {
      where.AND.push({
        companySize: size
      })
    }

    // Fetch companies
    const companies = await prisma.company.findMany({
      where,
      include: {
        jobs: {
          where: {
            isActive: true,
            publishedAt: { not: null }
          },
          select: { id: true }
        },
        recruiters: {
          select: { id: true }
        },
        reviews: {
          where: { isApproved: true },
          select: {
            rating: true
          }
        },
        _count: {
          select: {
            jobs: true,
            reviews: true,
            recruiters: true
          }
        }
      },
      orderBy: [
        { verified: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    console.log(`✅ Found ${companies.length} companies`)

    // Calculate ratings and format data
    const formattedCompanies = companies.map(company => {
      const activeJobsCount = company.jobs.length
      const totalReviews = company.reviews.length
      const averageRating = totalReviews > 0
        ? (company.reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews).toFixed(1)
        : 0

      return {
        id: company.id,
        name: company.name,
        slug: company.slug,
        logo: company.logo,
        tagline: company.tagline,
        industry: company.industry,
        companySize: company.companySize,
        location: `${company.city}, ${company.province}`,
        city: company.city,
        province: company.province,
        activeJobs: activeJobsCount,
        rating: parseFloat(averageRating),
        reviews: totalReviews,
        verified: company.verified,
        status: company.status
      }
    })

    return NextResponse.json({
      success: true,
      companies: formattedCompanies,
      total: formattedCompanies.length
    })

  } catch (error) {
    console.error('❌ Get companies error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch companies' },
      { status: 500 }
    )
  }
}