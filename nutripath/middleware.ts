/**
 * middleware.ts — Route protection (Edge Runtime safe)
 *
 * IMPORTANT: This middleware runs on Vercel Edge Runtime — it CANNOT import
 * any Node.js-only modules (drizzle-orm, bcryptjs, @neondatabase/serverless).
 *
 * We read the Auth.js JWT cookie directly using next/server, avoiding any
 * import from @/auth (which pulls in DB + bcrypt → crashes Edge).
 *
 * Strategy:
 * - If user has a valid auth-token cookie → they are authenticated
 * - Redirect authenticated users away from /login and /register
 * - Everything else: pass through (SMANU is fully accessible as guest)
 */

import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const AUTH_REDIRECT_ROUTES = ["/login", "/register"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only run checks on auth pages — everything else passes through freely
  if (!AUTH_REDIRECT_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.next();
  }

  // Check for JWT session cookie — Edge-safe, no DB call
  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? "",
  });

  // If user is already logged in, redirect away from login/register
  if (token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Only match auth routes — skip static assets entirely
    "/login/:path*",
    "/register/:path*",
  ],
};
