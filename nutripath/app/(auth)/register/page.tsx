"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthLeftPanel } from "@/components/auth/AuthLeftPanel";

interface FieldErrors {
  fullName?: string;
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  _general?: string;
}

/** Evaluate password strength: returns 0–3 */
function passwordStrength(val: string): number {
  if (!val) return 0;
  if (val.length < 6) return 1;
  if (val.length < 10 || !/[A-Z]/.test(val) || !/[0-9]/.test(val)) return 2;
  return 3;
}

const STRENGTH_LABELS = ["Belum diisi", "Lemah", "Sedang", "Kuat & Aman"];
const STRENGTH_COLORS = [
  "",
  "bg-red-500",
  "bg-amber-400",
  "bg-[#006c49]",
];
const STRENGTH_TEXT = [
  "text-[#76777d]",
  "text-red-500",
  "text-amber-500",
  "text-[#006c49]",
];

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const pwStrength = passwordStrength(form.password);

  function setField(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isLoading || success) return;

    setErrors({});

    const clientErrors: FieldErrors = {};
    if (!form.fullName.trim() || form.fullName.trim().length < 2) clientErrors.fullName = "Nama lengkap minimal 2 karakter.";
    if (!form.username.trim()) { clientErrors.username = "Username wajib diisi."; }
    else if (!/^[a-zA-Z0-9_-]{3,30}$/.test(form.username.trim())) clientErrors.username = "Username 3–30 karakter, hanya huruf, angka, _ dan -.";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) clientErrors.email = "Format email tidak valid.";
    if (!form.password || form.password.length < 8) clientErrors.password = "Password minimal 8 karakter.";
    if (form.password !== form.confirmPassword) clientErrors.confirmPassword = "Password dan konfirmasi tidak cocok.";

    if (Object.keys(clientErrors).length > 0) { setErrors(clientErrors); return; }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          username: form.username.trim().toLowerCase(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
          confirmPassword: form.confirmPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push("/login"), 2200);
      } else if (data.errors) {
        setErrors(data.errors);
      } else {
        setErrors({ _general: data.error ?? "Terjadi kesalahan. Coba lagi." });
      }
    } catch {
      setErrors({ _general: "Tidak dapat terhubung ke server. Coba lagi." });
    } finally {
      setIsLoading(false);
    }
  }

  // ── Success state ──────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen w-full flex flex-col lg:flex-row">
        <AuthLeftPanel />
        <div className="w-full lg:w-[48%] bg-[#f8f9ff] flex items-center justify-center p-10">
          <div className="flex flex-col items-center gap-5 text-center max-w-sm">
            <div className="w-16 h-16 rounded-2xl bg-[#006c49]/10 border border-[#006c49]/25 flex items-center justify-center">
              <svg className="w-8 h-8 text-[#006c49]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
              </svg>
            </div>
            <div>
              <h2 className="text-[#0b1c30] text-xl font-bold mb-1">Akun berhasil dibuat!</h2>
              <p className="text-[#45464d] text-[14px]">Mengarahkan ke halaman masuk...</p>
            </div>
            <div className="flex items-center gap-2 text-[#006c49] text-[13px] font-medium">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Mengalihkan...
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Main form ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row">

      {/* Left panel */}
      <AuthLeftPanel />

      {/* Right panel — register form */}
      <div className="w-full lg:w-[48%] bg-[#f8f9ff] flex flex-col min-h-screen">

        {/* Top bar */}
        <div className="flex items-center justify-between px-7 sm:px-10 lg:px-12 pt-7 lg:pt-10">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-[#006c49]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} />
            </svg>
            <span className="text-[11px] font-semibold tracking-widest uppercase text-[#45464d]">Pendaftaran Akun Siswa</span>
          </div>
          <div>
            <span className="text-[13px] text-[#45464d]">Sudah punya akun? </span>
            <Link href="/login" className="text-[13px] text-[#006c49] font-semibold hover:underline transition-colors">
              Masuk
            </Link>
          </div>
        </div>

        {/* Scrollable form area */}
        <div className="flex-1 flex items-start lg:items-center justify-center px-7 sm:px-10 lg:px-12 py-8 overflow-y-auto">
          <div className="w-full max-w-md">

            {/* Header */}
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#006c49]/10 border border-[#006c49]/20 text-[#006c49] text-[11px] font-semibold mb-3">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM3 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 019.374 21c-2.331 0-4.512-.645-6.374-1.766z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} />
                </svg>
                Buat Akun Baru
              </div>
              <h2 className="text-[#0b1c30] text-[26px] font-bold tracking-tight leading-tight mb-1">
                Mulai Perjalanan Sehatmu
              </h2>
              <p className="text-[#45464d] text-[13px] leading-relaxed">
                Buat akun untuk pengalaman nutrisi yang lebih personal, akurat, dan terukur.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-3.5" noValidate>

              {/* Full name */}
              <FormField
                label="Nama Lengkap"
                id="fullName"
                type="text"
                autoComplete="name"
                icon={<path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} />}
                value={form.fullName}
                onChange={(v) => setField("fullName", v)}
                disabled={isLoading}
                error={errors.fullName}
                placeholder="Contoh: Alex Pratama"
              />

              {/* Username */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="username" className="text-[#0b1c30] text-[13px] font-semibold">Username</label>
                  <span className="text-[11px] text-[#76777d]">Unik &amp; tidak dapat diubah setelah daftar</span>
                </div>
                <div className="relative">
                  <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#76777d] pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} />
                  </svg>
                  <input
                    id="username"
                    type="text"
                    autoComplete="username"
                    value={form.username}
                    onChange={(e) => setField("username", e.target.value)}
                    disabled={isLoading}
                    className={`w-full pl-11 pr-4 py-3 rounded-xl bg-white border text-[#0b1c30] placeholder:text-[#76777d] text-[14px] focus:outline-none focus:ring-2 transition-all shadow-sm disabled:opacity-50 ${
                      errors.username ? "border-red-400 focus:ring-red-400/30" : "border-[#c6c6cd] focus:ring-[#006c49]/30 focus:border-[#006c49]"
                    }`}
                    placeholder="alexpratama"
                  />
                </div>
                {errors.username && <p className="text-red-500 text-[12px]">{errors.username}</p>}
                {!errors.username && <p className="text-[#76777d] text-[11px]">Digunakan untuk login dan profil kuis nutrisi.</p>}
              </div>

              {/* Email */}
              <FormField
                label="Email Sekolah / Pribadi"
                id="email"
                type="email"
                autoComplete="email"
                icon={<path d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} />}
                value={form.email}
                onChange={(v) => setField("email", v)}
                disabled={isLoading}
                error={errors.email}
                placeholder="alex@sekolah.sch.id"
              />

              {/* Password + strength */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="password" className="text-[#0b1c30] text-[13px] font-semibold">Password</label>
                <div className="relative">
                  <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#76777d] pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} />
                  </svg>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={form.password}
                    onChange={(e) => setField("password", e.target.value)}
                    disabled={isLoading}
                    className={`w-full pl-11 pr-11 py-3 rounded-xl bg-white border text-[#0b1c30] placeholder:text-[#76777d] text-[14px] focus:outline-none focus:ring-2 transition-all shadow-sm disabled:opacity-50 ${
                      errors.password ? "border-red-400 focus:ring-red-400/30" : "border-[#c6c6cd] focus:ring-[#006c49]/30 focus:border-[#006c49]"
                    }`}
                    placeholder="Minimal 8 karakter"
                  />
                  <button type="button" onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#76777d] hover:text-[#0b1c30] transition-colors p-0.5" tabIndex={-1}>
                    <EyeIcon show={showPassword} />
                  </button>
                </div>
                {/* Password strength bar */}
                {form.password && (
                  <div className="pt-0.5">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] text-[#76777d]">Kekuatan Sandi</span>
                      <span className={`text-[11px] font-semibold ${STRENGTH_TEXT[pwStrength]}`}>
                        {STRENGTH_LABELS[pwStrength]}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-[#e5eeff] rounded-full overflow-hidden flex gap-0.5">
                      {[1, 2, 3].map((seg) => (
                        <div key={seg}
                          className={`h-full flex-1 rounded-full transition-colors duration-300 ${pwStrength >= seg ? STRENGTH_COLORS[pwStrength] : "bg-[#dce9ff]"}`}
                        />
                      ))}
                    </div>
                  </div>
                )}
                {errors.password && <p className="text-red-500 text-[12px]">{errors.password}</p>}
              </div>

              {/* Confirm password */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="confirmPassword" className="text-[#0b1c30] text-[13px] font-semibold">Konfirmasi Password</label>
                <div className="relative">
                  <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#76777d] pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} />
                  </svg>
                  <input
                    id="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    autoComplete="new-password"
                    value={form.confirmPassword}
                    onChange={(e) => setField("confirmPassword", e.target.value)}
                    disabled={isLoading}
                    className={`w-full pl-11 pr-11 py-3 rounded-xl bg-white border text-[#0b1c30] placeholder:text-[#76777d] text-[14px] focus:outline-none focus:ring-2 transition-all shadow-sm disabled:opacity-50 ${
                      errors.confirmPassword ? "border-red-400 focus:ring-red-400/30" : "border-[#c6c6cd] focus:ring-[#006c49]/30 focus:border-[#006c49]"
                    }`}
                    placeholder="Ulangi kata sandi"
                  />
                  <button type="button" onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#76777d] hover:text-[#0b1c30] transition-colors p-0.5" tabIndex={-1}>
                    <EyeIcon show={showConfirm} />
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-[12px]">{errors.confirmPassword}</p>}
              </div>

              {/* General error */}
              {errors._general && (
                <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-red-50 border border-red-200">
                  <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path clipRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" fillRule="evenodd" />
                  </svg>
                  <p className="text-red-600 text-[13px] leading-snug">{errors._general}</p>
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
                    Membuat akun...
                  </>
                ) : (
                  <>
                    <span>Buat Akun Sekarang</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                    </svg>
                  </>
                )}
              </button>

            </form>

            {/* Guest option */}
            <div className="mt-5 text-center">
              <Link href="/" className="text-[#76777d] hover:text-[#45464d] text-[13px] transition-colors inline-flex items-center gap-1.5">
                Lanjutkan sebagai Tamu
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                </svg>
              </Link>
            </div>

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

// ── Shared sub-components ─────────────────────────────────────────────────────

function EyeIcon({ show }: { show: boolean }) {
  return show ? (
    <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} />
    </svg>
  ) : (
    <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} />
      <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} />
    </svg>
  );
}

function FormField({
  label, id, type, autoComplete, icon, value, onChange, disabled, error, placeholder,
}: {
  label: string; id: string; type: string; autoComplete?: string;
  icon: React.ReactNode;
  value: string; onChange: (v: string) => void; disabled: boolean;
  error?: string; placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[#0b1c30] text-[13px] font-semibold">{label}</label>
      <div className="relative">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#76777d] pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {icon}
        </svg>
        <input
          id={id}
          type={type}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={`w-full pl-11 pr-4 py-3 rounded-xl bg-white border text-[#0b1c30] placeholder:text-[#76777d] text-[14px] focus:outline-none focus:ring-2 transition-all shadow-sm disabled:opacity-50 ${
            error ? "border-red-400 focus:ring-red-400/30" : "border-[#c6c6cd] focus:ring-[#006c49]/30 focus:border-[#006c49]"
          }`}
          placeholder={placeholder}
        />
      </div>
      {error && <p className="text-red-500 text-[12px]">{error}</p>}
    </div>
  );
}
