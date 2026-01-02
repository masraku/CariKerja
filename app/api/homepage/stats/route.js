import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Run all queries in parallel for better performance
    const [totalJobs, totalCompanies, totalApplications, totalHires] =
      await Promise.all([
        // Count active jobs
        prisma.jobs.count({
          where: {
            status: {
              in: ["ACTIVE", "CLOSED"],
            },
          },
        }),

        // Count companies with active jobs
        prisma.companies.count({
          where: {
            jobs: {
              some: {
                isActive: true,
              },
            },
          },
        }),

        // Count total applications
        prisma.applications.count(),

        // Count accepted applications (hired candidates)
        prisma.applications.count({
          where: {
            status: "ACCEPTED",
          },
        }),
      ]);

    // Add cache headers for better performance
    return NextResponse.json({
      success: true,
      data: {
        totalJobs,
        totalCompanies,
        totalApplications,
        totalHires,
      },
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300'
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch homepage statistics" },
      { status: 500 }
    );
  }
}
