/**
 * app/api/auth/[...nextauth]/route.ts
 *
 * Auth.js v5 catch-all route — handles:
 *   POST /api/auth/signin
 *   GET  /api/auth/signout
 *   GET  /api/auth/session
 *   GET  /api/auth/csrf
 *   etc.
 */

import { handlers } from "@/auth";

export const { GET, POST } = handlers;
