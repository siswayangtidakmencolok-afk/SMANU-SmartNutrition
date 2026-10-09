/**
 * app/(auth)/layout.tsx
 * Full-screen split layout for login & register.
 * Left panel (visual) + Right panel (form) rendered by each page.
 */

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SMANU — SmartNutrition for Students",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-[#0b1c30] overflow-x-hidden">
      {children}
    </div>
  );
}
