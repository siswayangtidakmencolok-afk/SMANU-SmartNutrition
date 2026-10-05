import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  title: "NutriPath — Personal Nutrition Navigator for Students",
  description:
    "NutriPath is a RAG-powered educational nutrition assistant that helps students make better food decisions based on their real situation, available foods, and budget.",
  keywords: ["nutrition", "student", "RAG", "food choices", "healthy eating", "gizi"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={geist.variable}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
