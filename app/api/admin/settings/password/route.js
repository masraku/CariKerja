import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authHelper";
import { authLimiter, getIP, rateLimitResponse } from "@/lib/rateLimit";
import { verifyPassword, hashPassword } from "@/lib/password";
import { changePasswordSchema } from "@/lib/validations/auth";

// PUT - Change admin password
export async function PUT(request) {
  try {
    // Use auth limiter (more restrictive for password changes)
    const ip = getIP(request);
    const { success } = await authLimiter.limit(ip);
    if (!success) return rateLimitResponse();

    // Verify admin
    const auth = await requireAdmin(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const { admin } = auth;

    const body = await request.json();
    
    // Validate with Zod schema (includes strong password check)
    const validation = changePasswordSchema.safeParse(body);
    if (!validation.success) {
      const firstError = validation.error.errors[0];
      return NextResponse.json(
        { error: firstError.message },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = validation.data;

    // Get current user
    const user = await prisma.users.findUnique({
      where: { id: admin.id },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    // Verify current password
    const isValidPassword = await verifyPassword(currentPassword, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Password saat ini salah" },
        { status: 400 }
      );
    }

    // Hash new password using Argon2
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await prisma.users.update({
      where: { id: admin.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json({
      message: "Password berhasil diubah",
    });
  } catch (error) {
    console.error("Error changing password:", error);
    return NextResponse.json(
      { error: "Gagal mengubah password" },
      { status: 500 }
    );
  }
}
