import { NextResponse } from "next/server";
import { publicLimiter, getIP, rateLimitResponse } from "@/lib/rateLimit";
import { getHomepageStats } from "@/lib/homepage";

export async function GET(request) {
  try {
    // Rate limiting - 100 requests per minute
    const ip = getIP(request);
    const { success, reset } = await publicLimiter.limit(ip);
    if (!success) {
      return rateLimitResponse(reset);
    }

    const stats = await getHomepageStats();

    return NextResponse.json({
      success: true,
      data: stats,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300'
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal memuat statistik" },
      { status: 500 }
    );
  }
}
