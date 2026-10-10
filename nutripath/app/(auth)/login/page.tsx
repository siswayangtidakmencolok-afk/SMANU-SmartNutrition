"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthLeftPanel } from "@/components/auth/AuthLeftPanel";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isLoading) return;

    setError("");

    if (!identifier.trim() || !password) {
      setError("Email/username dan password wajib diisi.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await signIn("credentials", {
        identifier: identifier.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (result?.error) {
        // "CredentialsSignin" = wrong email/password (authorize returned null)
        // Anything else = server/DB error (authorize threw an error)
        if (result.error === "CredentialsSignin") {
          setError("Email/username atau password salah. Coba lagi.");
        } else if (result.error.includes("DatabaseError") || result.error.includes("database") || result.error.includes("connect")) {
          setError("Tidak dapat terhubung ke database. Periksa koneksi internet kamu dan coba lagi dalam beberapa saat.");
        } else {
          setError("Server tidak dapat dihubungi. Periksa koneksi internet kamu, lalu coba lagi.");
        }
      } else if (result?.ok) {
        router.push("/");
        router.refresh();
      } else {
        setError("Terjadi kesalahan. Coba lagi.");
      }
    } catch {
      setError("Tidak dapat terhubung ke server. Coba lagi.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row">

      {/* Left panel — visual storytelling */}
      <AuthLeftPanel />

      {/* Right panel — login form */}
      <div className="w-full lg:w-[48%] bg-[#f8f9ff] flex flex-col min-h-screen">

        {/* Top bar */}
        <div className="flex items-center justify-between px-7 sm:px-10 lg:px-12 pt-7 lg:pt-10">
          <div className="flex items-center gap-2 text-[#45464d]">
            <svg className="w-4 h-4 text-[#006c49]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} />
            </svg>
            <span className="text-[11px] font-semibold tracking-widest uppercase text-[#45464d]">Portal Siswa</span>
          </div>
          <div className="text-right">
            <span className="text-[13px] text-[#45464d]">Belum punya akun? </span>
            <Link href="/register" className="text-[13px] text-[#006c49] font-semibold hover:underline transition-colors">
              Daftar
            </Link>
          </div>
        </div>

        {/* Form area — vertically centered */}
        <div className="flex-1 flex items-center justify-center px-7 sm:px-10 lg:px-12 py-10">
          <div className="w-full max-w-md">

            {/* Header */}
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#006c49]/10 border border-[#006c49]/20 text-[#006c49] text-[11px] font-semibold mb-4">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} />
                </svg>
                Masuk ke Akun SMANU
              </div>
              <h2 className="text-[#0b1c30] text-[28px] font-bold tracking-tight leading-tight mb-1.5">
                Selamat datang kembali
              </h2>
              <p className="text-[#45464d] text-[14px] leading-relaxed">
                Masuk untuk melanjutkan perjalanan nutrisi personalmu.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>

              {/* Identifier */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="identifier" className="text-[#0b1c30] text-[13px] font-semibold">
                  Email atau Username
                </label>
                <div className="relative">
                  <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#76777d] pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} />
                  </svg>
                  <input
                    id="identifier"
                    type="text"
                    autoComplete="username email"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    disabled={isLoading}
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-[#c6c6cd] text-[#0b1c30] placeholder:text-[#76777d] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#006c49]/30 focus:border-[#006c49] transition-all shadow-sm disabled:opacity-50"
                    placeholder="contoh@email.com atau username"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="password" className="text-[#0b1c30] text-[13px] font-semibold">
                  Password
                </label>
                <div className="relative">
                  <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#76777d] pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} />
                  </svg>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="w-full pl-11 pr-11 py-3 rounded-xl bg-white border border-[#c6c6cd] text-[#0b1c30] placeholder:text-[#76777d] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#006c49]/30 focus:border-[#006c49] transition-all shadow-sm disabled:opacity-50"
                    placeholder="Masukkan password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#76777d] hover:text-[#0b1c30] transition-colors p-0.5"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} />
                      </svg>
                    ) : (
                      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} />
                        <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-red-50 border border-red-200">
                  <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path clipRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" fillRule="evenodd" />
                  </svg>
                  <p className="text-red-600 text-[13px] leading-snug">{error}</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-6 rounded-xl bg-[#006c49] hover:bg-[#005236] text-white font-semibold text-[14px] shadow-md hover:shadow-lg active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1"
              >
                {isLoading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Memverifikasi...
                  </>
                ) : (
                  <>
                    <span>Masuk Sekarang</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                    </svg>
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 my-1">
                <div className="flex-1 h-px bg-[#c6c6cd]" />
                <span className="text-[#76777d] text-[12px]">atau</span>
                <div className="flex-1 h-px bg-[#c6c6cd]" />
              </div>

              {/* Guest mode */}
              <button
                type="button"
                onClick={() => router.push("/")}
                className="w-full py-3 px-6 rounded-xl bg-white hover:bg-[#eff4ff] border border-[#c6c6cd] hover:border-[#006c49]/30 text-[#45464d] hover:text-[#0b1c30] font-medium text-[14px] transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} />
                </svg>
                Lanjutkan sebagai Tamu
              </button>
            </form>

          </div>
        </div>

        {/* Footer */}
        <div className="px-7 sm:px-10 lg:px-12 pb-7 lg:pb-10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[#45464d]">
            <svg className="w-3.5 h-3.5 text-[#006c49]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} />
            </svg>
            <span className="text-[11px]">Keamanan data terenkripsi bcrypt &amp; Auth.js v5</span>
          </div>
          <span className="text-[#76777d] text-[11px]">SMANU v1.0 · Status Sistem Normal</span>
        </div>

      </div>
    </div>
  );
}
