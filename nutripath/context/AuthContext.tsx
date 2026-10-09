"use client";

/**
 * AuthContext.tsx — Client-side auth state
 *
 * Wraps Auth.js useSession and adds:
 * - Guest mode detection
 * - Typed user object
 * - Convenience hooks
 *
 * Guest Mode: unauthenticated users are treated as "guest" — they can
 * use the app fully. No fake account is created; guest is just the
 * unauthenticated state with a friendly display name.
 */

import { createContext, useContext } from "react";
import { useSession } from "next-auth/react";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  displayName: string;
  fullName: string;
  username: string;
  email: string;
  role: "registered" | "guest";
}

export interface AuthContextValue {
  user: AuthUser;
  isGuest: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// ── Default guest identity ────────────────────────────────────────────────────

const GUEST_USER: AuthUser = {
  id: "guest",
  displayName: "Student",
  fullName: "Student",
  username: "guest",
  email: "",
  role: "guest",
};

// ── Context ───────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue>({
  user: GUEST_USER,
  isGuest: true,
  isAuthenticated: false,
  isLoading: false,
});

// ── Provider ──────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const isLoading = status === "loading";

  let user: AuthUser = GUEST_USER;
  let isAuthenticated = false;

  if (session?.user) {
    const u = session.user as {
      id?: string;
      name?: string | null;
      email?: string | null;
      username?: string;
      fullName?: string;
    };

    user = {
      id: u.id ?? "guest",
      displayName: u.name ?? "Student",
      fullName: (u.fullName) ?? (u.name ?? "Student"),
      username: (u.username) ?? "",
      email: u.email ?? "",
      role: "registered",
    };
    isAuthenticated = true;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isGuest: !isAuthenticated,
        isAuthenticated,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAuth() {
  return useContext(AuthContext);
}
