/**
 * POST /api/auth/register
 *
 * Creates a new user account.
 * Validates input server-side, hashes password with bcrypt, writes to Neon DB.
 *
 * Body: { fullName, username, email, password, confirmPassword }
 * Returns 201 on success, 4xx on validation error, 500 on server error.
 * Never returns password hash or internal DB IDs in error messages.
 */

import { NextRequest, NextResponse } from "next/server";
import { eq, or } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

const BCRYPT_ROUNDS = 12;

// ── Validation helpers ────────────────────────────────────────────────────────

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidUsername(username: string): boolean {
  // 3-30 chars, alphanumeric + underscore + hyphen
  return /^[a-zA-Z0-9_-]{3,30}$/.test(username);
}

function isValidPassword(password: string): boolean {
  // Minimum 8 chars
  return password.length >= 8;
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Format request tidak valid." }, { status: 400 });
  }

  // Extract fields
  const fullName = String(body.fullName ?? "").trim();
  const username = String(body.username ?? "").trim().toLowerCase();
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  const confirmPassword = String(body.confirmPassword ?? "");

  // ── Field validation ──────────────────────────────────────────────────────

  const errors: Record<string, string> = {};

  if (!fullName || fullName.length < 2) {
    errors.fullName = "Nama lengkap minimal 2 karakter.";
  } else if (fullName.length > 100) {
    errors.fullName = "Nama lengkap maksimal 100 karakter.";
  }

  if (!username) {
    errors.username = "Username wajib diisi.";
  } else if (!isValidUsername(username)) {
    errors.username = "Username 3–30 karakter, hanya huruf, angka, underscore (_), dan tanda hubung (-).";
  }

  if (!email) {
    errors.email = "Email wajib diisi.";
  } else if (!isValidEmail(email)) {
    errors.email = "Format email tidak valid.";
  }

  if (!password) {
    errors.password = "Password wajib diisi.";
  } else if (!isValidPassword(password)) {
    errors.password = "Password minimal 8 karakter.";
  }

  if (password !== confirmPassword) {
    errors.confirmPassword = "Password dan konfirmasi password tidak cocok.";
  }

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ errors }, { status: 422 });
  }

  // ── Check uniqueness ──────────────────────────────────────────────────────

  try {
    const existing = await db
      .select({ id: users.id, email: users.email, username: users.username })
      .from(users)
      .where(or(eq(users.email, email), eq(users.username, username)))
      .limit(1);

    if (existing.length > 0) {
      const taken = existing[0];
      if (taken.email === email) {
        return NextResponse.json(
          { errors: { email: "Email ini sudah terdaftar. Coba masuk atau gunakan email lain." } },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { errors: { username: "Username ini sudah digunakan. Coba username lain." } },
        { status: 409 }
      );
    }
  } catch (err) {
    console.error("[register] DB uniqueness check error:", err instanceof Error ? err.message : String(err));
    return NextResponse.json(
      { error: "Terjadi kesalahan server. Coba lagi." },
      { status: 500 }
    );
  }

  // ── Hash password ─────────────────────────────────────────────────────────

  let passwordHash: string;
  try {
    passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  } catch (err) {
    console.error("[register] bcrypt error:", err instanceof Error ? err.message : String(err));
    return NextResponse.json({ error: "Terjadi kesalahan saat memproses password." }, { status: 500 });
  }

  // ── Insert user ───────────────────────────────────────────────────────────

  try {
    await db.insert(users).values({
      fullName,
      displayName: fullName, // default display name = full name, can be changed later
      username,
      email,
      passwordHash,
    });
  } catch (err) {
    console.error("[register] DB insert error:", err instanceof Error ? err.message : String(err));
    // Catch unique constraint race condition (unlikely but possible)
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("unique") || msg.includes("duplicate")) {
      return NextResponse.json(
        { error: "Username atau email sudah terdaftar. Coba lagi dengan data berbeda." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Gagal membuat akun. Coba lagi." }, { status: 500 });
  }

  return NextResponse.json(
    { message: "Akun berhasil dibuat. Silakan masuk." },
    { status: 201 }
  );
}
