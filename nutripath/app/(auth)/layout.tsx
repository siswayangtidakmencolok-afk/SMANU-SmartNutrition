/**
 * app/(auth)/layout.tsx — Auth pages layout
 * Clean, centered layout for login and register pages.
 * No sidebar, no header — standalone auth flow.
 */

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SMANU — Masuk",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4">
      {children}
    </div>
  );
}
