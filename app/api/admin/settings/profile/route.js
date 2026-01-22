import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authHelper";
import { adminLimiter, getIP, rateLimitResponse } from "@/lib/rateLimit";

// PUT - Update admin profile
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
    const { name, email } = body;

    // Check if email already exists (excluding current user)
    if (email) {
      const existingUser = await prisma.users.findFirst({
        where: {
          email,
          id: { not: admin.id },
        },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "Email sudah digunakan" },
          { status: 400 }
        );
      }
    }

    // Update user
    const updatedUser = await prisma.users.update({
      where: { id: admin.id },
      data: {
        ...(email && { email }),
      },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json({
      message: "Profil berhasil diperbarui",
      user: { ...updatedUser, name: name || "Administrator" },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui profil" },
      { status: 500 }
    );
  }
}
