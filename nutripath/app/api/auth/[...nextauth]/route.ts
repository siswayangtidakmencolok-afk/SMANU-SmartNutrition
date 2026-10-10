/**
 * Auth.js v5 — catch-all route handler
 *
 * This file MUST exist at app/api/auth/[...nextauth]/route.ts.
 * It registers the GET and POST handlers that Auth.js needs to:
 *  - serve /api/auth/session  (read session — used by SessionProvider)
 *  - serve /api/auth/csrf     (CSRF token)
 *  - serve /api/auth/providers
 *  - handle /api/auth/callback/credentials  (sign-in)
 *  - handle /api/auth/signout
 *
 * Without this file every /api/auth/* request returns a 404 HTML page,
 * causing the client to throw: "Unexpected token '<', <!DOCTYPE ... not valid JSON"
 */

import { handlers } from "@/auth";

export const { GET, POST } = handlers;
