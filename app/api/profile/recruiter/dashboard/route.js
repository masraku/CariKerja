import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRecruiter } from "@/lib/authHelper";

export async function GET(request) {
  try {
    const auth = await requireRecruiter(request);

    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { recruiter } = auth;

    if (!recruiter) {
      return NextResponse.json(
        { error: "Recruiter profile not found" },
        { status: 404 }
      );
    }

    const companyId = recruiter.companyId;
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    // Run all queries in parallel for better performance
    const [
      company,
      jobStats,
      applicationStats,
      newApplicationsCount,
      recentApplications,
    ] = await Promise.all([
      // 1. Get company with recent active jobs
      prisma.companies.findUnique({
        where: { id: companyId },
        select: {
          id: true,
          name: true,
          slug: true,
          logo: true,
          tagline: true,
          description: true,
          industry: true,
          companySize: true,
          city: true,
          status: true,
          verified: true,
          jobs: {
            where: { isActive: true },
            orderBy: { createdAt: "desc" },
            take: 5,
            select: {
              id: true,
              title: true,
              slug: true,
              createdAt: true,
              _count: { select: { applications: true } },
            },
          },
          _count: { select: { jobs: true, recruiters: true } },
        },
      }),

      // 2. Get job statistics using aggregation
      prisma.jobs.groupBy({
        by: ["isActive"],
        where: { companyId },
        _count: true,
      }),

      // 3. Get application statistics using groupBy (much faster than filtering in JS)
      prisma.applications.groupBy({
        by: ["status"],
        where: { jobs: { companyId } },
        _count: true,
      }),

      // 4. Count new applications this week
      prisma.applications.count({
        where: {
          jobs: { companyId },
          createdAt: { gte: weekAgo },
        },
      }),

      // 5. Get recent applications with minimal data
      prisma.applications.findMany({
        where: { jobs: { companyId } },
        select: {
          id: true,
          status: true,
          appliedAt: true,
          jobseekers: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              photo: true,
              currentTitle: true,
              city: true,
            },
          },
          jobs: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
        },
        orderBy: { appliedAt: "desc" },
        take: 5,
      }),
    ]);

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    // Process job stats
    const totalJobs = jobStats.reduce((sum, stat) => sum + stat._count, 0);
    const activeJobs = jobStats.find((s) => s.isActive === true)?._count || 0;

    // Process application stats into object
    const appStatsMap = {};
    applicationStats.forEach((stat) => {
      appStatsMap[stat.status] = stat._count;
    });

    const totalApplications = applicationStats.reduce(
      (sum, stat) => sum + stat._count,
      0
    );

    const stats = {
      totalJobs,
      activeJobs,
      totalApplications,
      pendingApplications: appStatsMap["PENDING"] || 0,
      reviewingApplications: appStatsMap["REVIEWING"] || 0,
      shortlistedApplications: appStatsMap["SHORTLISTED"] || 0,
      interviewScheduled: appStatsMap["INTERVIEW_SCHEDULED"] || 0,
      accepted: appStatsMap["ACCEPTED"] || 0,
      rejected: appStatsMap["REJECTED"] || 0,
      newApplicationsThisWeek: newApplicationsCount,
    };

    return NextResponse.json({
      success: true,
      data: {
        company,
        recruiter,
        stats,
        recentApplications,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to fetch dashboard data",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
