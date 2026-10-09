/**
 * middleware.ts — Route protection
 *
 * Uses Auth.js v5 middleware to:
 * - Redirect authenticated users away from login/register pages
 * - Allow all other pages for both guests and authenticated users
 *
 * SMANU is fully accessible in Guest Mode — we do NOT block the main app.
 */

import { auth } from "@/auth";
import { NextResponse } from "next/server";

// Routes that should redirect authenticated users away (login page, register page)
const AUTH_ONLY_ROUTES = ["/login", "/register"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAuthenticated = !!req.auth?.user;

  // Redirect authenticated users away from login/register pages
  if (isAuthenticated && AUTH_ONLY_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Run middleware on all routes except static assets and Next.js internals
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
