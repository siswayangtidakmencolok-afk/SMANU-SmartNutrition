/**
 * auth.ts — Auth.js v5 (next-auth beta) configuration
 *
 * Strategy: JWT sessions (stateless — no session table needed for core login).
 * Credentials provider: email/username + password (bcrypt verified server-side).
 *
 * No OAuth / social login in this version.
 */

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { eq, or } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Use JWT strategy — no database-backed sessions table required for login
  session: { strategy: "jwt" },

  // Custom pages
  pages: {
    signIn: "/login",
    error: "/login",
  },

  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        identifier: { label: "Email or username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) return null;

        const identifier = String(credentials.identifier).trim().toLowerCase();
        const password = String(credentials.password);

        // Look up by email OR username
        let user;
        try {
          const results = await db
            .select()
            .from(users)
            .where(
              or(
                eq(users.email, identifier),
                eq(users.username, identifier)
              )
            )
            .limit(1);

          user = results[0];
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          console.error("[auth] DB lookup error:", msg);
          // Throw so NextAuth surfaces this as a generic error (not CredentialsSignin)
          // The login page checks for result.error !== "CredentialsSignin" to show the
          // "server tidak dapat dihubungi" message instead of "password salah".
          throw new Error("DatabaseError");
        }

        if (!user) return null;

        let passwordMatch = false;
        try {
          passwordMatch = await bcrypt.compare(password, user.passwordHash);
        } catch (err) {
          console.error("[auth] bcrypt error:", err instanceof Error ? err.message : String(err));
          return null;
        }
        if (!passwordMatch) return null;

        // Return only the fields that should go into the JWT — never the hash
        return {
          id: user.id,
          name: user.displayName,
          email: user.email,
          username: user.username,
          fullName: user.fullName,
        };
      },
    }),
  ],

  callbacks: {
    // Persist extra fields into the JWT
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = (user as { username?: string }).username ?? "";
        token.fullName = (user as { fullName?: string }).fullName ?? "";
      }
      return token;
    },
    // Expose JWT fields on the session object (available client-side via useSession)
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        (session.user as { username?: string }).username = token.username as string;
        (session.user as { fullName?: string }).fullName = token.fullName as string;
      }
      return session;
    },
  },
});
