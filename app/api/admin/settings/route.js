import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authHelper";
import { adminLimiter, getIP, rateLimitResponse, redis } from "@/lib/rateLimit";

// GET - Ambil semua settings
export async function GET(request) {
  try {
    // Rate limiting
    const ip = getIP(request);
    const { success } = await adminLimiter.limit(ip);
    if (!success) return rateLimitResponse();

    // Verify admin
    const auth = await requireAdmin(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    // Get or create default settings
    let settings = await prisma.system_settings.findUnique({
      where: { id: "default" },
    });

    if (!settings) {
      settings = await prisma.system_settings.create({
        data: { id: "default" },
      });
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Gagal mengambil pengaturan" },
      { status: 500 }
    );
  }
}

// PUT - Update settings
export async function PUT(request) {
  try {
    // Rate limiting
    const ip = getIP(request);
    const { success } = await adminLimiter.limit(ip);
    if (!success) return rateLimitResponse();

    // Verify admin
    const auth = await requireAdmin(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const { admin } = auth;

    const body = await request.json();
    const {
      maintenanceMode,
      allowRegistration,
      autoApproveJobs,
      maxUploadSize,
      emailNotifications,
      newCompanyAlert,
      newContractAlert,
      weeklyReport,
    } = body;

    // Sync maintenance mode to Redis for middleware
    if (maintenanceMode !== undefined) {
      if (maintenanceMode) {
        await redis.set("system:maintenance", "true");
      } else {
        await redis.del("system:maintenance");
      }
    }

    // Update or create settings
    const settings = await prisma.system_settings.upsert({
      where: { id: "default" },
      update: {
        ...(maintenanceMode !== undefined && { maintenanceMode }),
        ...(allowRegistration !== undefined && { allowRegistration }),
        ...(autoApproveJobs !== undefined && { autoApproveJobs }),
        ...(maxUploadSize !== undefined && { maxUploadSize: parseInt(maxUploadSize) }),
        ...(emailNotifications !== undefined && { emailNotifications }),
        ...(newCompanyAlert !== undefined && { newCompanyAlert }),
        ...(newContractAlert !== undefined && { newContractAlert }),
        ...(weeklyReport !== undefined && { weeklyReport }),
        updatedBy: admin.id,
      },
      create: {
        id: "default",
        maintenanceMode: maintenanceMode ?? false,
        allowRegistration: allowRegistration ?? true,
        autoApproveJobs: autoApproveJobs ?? false,
        maxUploadSize: maxUploadSize ? parseInt(maxUploadSize) : 10,
        emailNotifications: emailNotifications ?? true,
        newCompanyAlert: newCompanyAlert ?? true,
        newContractAlert: newContractAlert ?? true,
        weeklyReport: weeklyReport ?? false,
        updatedBy: admin.id,
      },
    });
    
    // Ensure sync matches result
    if (settings.maintenanceMode) {
      await redis.set("system:maintenance", "true");
    } else {
      await redis.del("system:maintenance");
    }

    return NextResponse.json({
      message: "Pengaturan berhasil disimpan",
      settings,
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan pengaturan" },
      { status: 500 }
    );
  }
}
