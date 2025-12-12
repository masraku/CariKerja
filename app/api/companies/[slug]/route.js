import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request, { params }) {
  try {
    const { slug } = await params

    // Get company with all related data
    const company = await prisma.companies.findUnique({
      where: { slug },
      include: {
        jobs: {
          where: {
            isActive: true,
            publishedAt: {
              not: null
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          select: {
            id: true,
            title: true,
            slug: true,
            location: true,
            city: true,
            province: true,
            jobType: true,
            level: true,
            salaryMin: true,
            salaryMax: true,
            salaryType: true,
            showSalary: true,
            isRemote: true,
            createdAt: true,
            applicationDeadline: true,
            _count: {
              select: {
                applications: true
              }
            }
          }
        },
        recruiters: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            position: true
          }
        },
        reviews: {
          where: {
            isApproved: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 10,
          include: {
            jobseekers: {
              select: {
                firstName: true,
                photo: true
              }
            }
          }
        },
        _count: {
          select: {
            jobs: true,
            recruiters: true,
            reviews: true
          }
        }
      }
    })

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      )
    }

    // Calculate average ratings if reviews exist
    let averageRatings = null
    if (company.reviews.length > 0) {
      const totalReviews = company.reviews.length
      const sumRatings = company.reviews.reduce((acc, review) => ({
        overall: acc.overall + review.rating,
        workLifeBalance: acc.workLifeBalance + (review.workLifeBalance || 0),
        compensation: acc.compensation + (review.compensation || 0),
        careerGrowth: acc.careerGrowth + (review.careerGrowth || 0),
        management: acc.management + (review.management || 0),
        culture: acc.culture + (review.culture || 0)
      }), {
        overall: 0,
        workLifeBalance: 0,
        compensation: 0,
        careerGrowth: 0,
        management: 0,
        culture: 0
      })

      averageRatings = {
        overall: (sumRatings.overall / totalReviews).toFixed(1),
        workLifeBalance: (sumRatings.workLifeBalance / totalReviews).toFixed(1),
        compensation: (sumRatings.compensation / totalReviews).toFixed(1),
        careerGrowth: (sumRatings.careerGrowth / totalReviews).toFixed(1),
        management: (sumRatings.management / totalReviews).toFixed(1),
        culture: (sumRatings.culture / totalReviews).toFixed(1)
      }
    }

    return NextResponse.json({
      success: true,
      company: {
        ...company,
        averageRatings
      }
    })

  } catch (error) {
    console.error('❌ Get company error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch company details',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}