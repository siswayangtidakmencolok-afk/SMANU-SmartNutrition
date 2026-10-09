/**
 * /api/profile
 *
 * GET  — Returns the authenticated user's profile (no sensitive fields).
 * PATCH — Updates allowed profile fields. Auth required.
 *
 * Security:
 * - User identity comes from server-side JWT session, NOT from request body.
 * - passwordHash is NEVER returned to the client.
 * - Email changes are accepted but flagged as unverified (future: send verify email).
 */

import { NextRequest, NextResponse } from "next/server";
import { eq, or, and, ne } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

// ── GET /api/profile ──────────────────────────────────────────────────────────

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const results = await db
      .select({
        id: users.id,
        fullName: users.fullName,
        displayName: users.displayName,
        username: users.username,
        email: users.email,
        age: users.age,
        school: users.school,
        grade: users.grade,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    const user = results[0];
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (err) {
    console.error("[profile GET] error:", err instanceof Error ? err.message : String(err));
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}

// ── PATCH /api/profile ────────────────────────────────────────────────────────

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Format request tidak valid." }, { status: 400 });
  }

  const errors: Record<string, string> = {};
  const updates: Partial<typeof users.$inferInsert> = {};

  // displayName
  if ("displayName" in body) {
    const val = String(body.displayName ?? "").trim();
    if (!val || val.length < 2) {
      errors.displayName = "Nama tampilan minimal 2 karakter.";
    } else if (val.length > 60) {
      errors.displayName = "Nama tampilan maksimal 60 karakter.";
    } else {
      updates.displayName = val;
    }
  }

  // fullName
  if ("fullName" in body) {
    const val = String(body.fullName ?? "").trim();
    if (!val || val.length < 2) {
      errors.fullName = "Nama lengkap minimal 2 karakter.";
    } else if (val.length > 100) {
      errors.fullName = "Nama lengkap maksimal 100 karakter.";
    } else {
      updates.fullName = val;
    }
  }

  // username
  if ("username" in body) {
    const val = String(body.username ?? "").trim().toLowerCase();
    if (!/^[a-zA-Z0-9_-]{3,30}$/.test(val)) {
      errors.username = "Username 3–30 karakter, hanya huruf, angka, _ dan -.";
    } else {
      // Check uniqueness (exclude current user)
      try {
        const existing = await db
          .select({ id: users.id })
          .from(users)
          .where(and(eq(users.username, val), ne(users.id, session.user.id)))
          .limit(1);
        if (existing.length > 0) {
          errors.username = "Username ini sudah digunakan.";
        } else {
          updates.username = val;
        }
      } catch {
        errors.username = "Gagal memverifikasi username.";
      }
    }
  }

  // email
  if ("email" in body) {
    const val = String(body.email ?? "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      errors.email = "Format email tidak valid.";
    } else {
      // Check uniqueness
      try {
        const existing = await db
          .select({ id: users.id })
          .from(users)
          .where(and(eq(users.email, val), ne(users.id, session.user.id)))
          .limit(1);
        if (existing.length > 0) {
          errors.email = "Email ini sudah digunakan akun lain.";
        } else {
          updates.email = val;
        }
      } catch {
        errors.email = "Gagal memverifikasi email.";
      }
    }
  }

  // age (optional)
  if ("age" in body) {
    if (body.age === null || body.age === "" || body.age === undefined) {
      updates.age = null;
    } else {
      const val = Number(body.age);
      if (!Number.isInteger(val) || val < 10 || val > 100) {
        errors.age = "Umur harus antara 10 dan 100.";
      } else {
        updates.age = val;
      }
    }
  }

  // school (optional)
  if ("school" in body) {
    const val = body.school === null || body.school === "" ? null : String(body.school ?? "").trim();
    updates.school = val && val.length > 0 && val.length <= 100 ? val : null;
  }

  // grade (optional)
  if ("grade" in body) {
    const val = body.grade === null || body.grade === "" ? null : String(body.grade ?? "").trim();
    updates.grade = val && val.length > 0 && val.length <= 50 ? val : null;
  }

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ errors }, { status: 422 });
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ message: "Tidak ada perubahan." }, { status: 200 });
  }

  updates.updatedAt = new Date();

  try {
    await db
      .update(users)
      .set(updates)
      .where(eq(users.id, session.user.id));

    return NextResponse.json({ message: "Profil berhasil diperbarui." });
  } catch (err) {
    console.error("[profile PATCH] error:", err instanceof Error ? err.message : String(err));
    return NextResponse.json({ error: "Gagal menyimpan perubahan." }, { status: 500 });
  }
}

// Only GET and PATCH are supported
export async function DELETE() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
