"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface FieldErrors {
  fullName?: string;
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  _general?: string;
}

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

  function setField(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    // Clear field-level error when user starts typing
    if (errors[field]) {
      setErrors((e) => ({ ...e, [field]: undefined }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isLoading || success) return;

    setErrors({});

    // Client-side pre-validation (server also validates)
    const clientErrors: FieldErrors = {};
    if (!form.fullName.trim() || form.fullName.trim().length < 2) {
      clientErrors.fullName = "Nama lengkap minimal 2 karakter.";
    }
    if (!form.username.trim()) {
      clientErrors.username = "Username wajib diisi.";
    } else if (!/^[a-zA-Z0-9_-]{3,30}$/.test(form.username.trim())) {
      clientErrors.username = "Username 3–30 karakter, hanya huruf, angka, _ dan -.";
    }
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      clientErrors.email = "Format email tidak valid.";
    }
    if (!form.password || form.password.length < 8) {
      clientErrors.password = "Password minimal 8 karakter.";
    }
    if (form.password !== form.confirmPassword) {
      clientErrors.confirmPassword = "Password dan konfirmasi tidak cocok.";
    }

    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }

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
        setTimeout(() => router.push("/login"), 2000);
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

  if (success) {
    return (
      <div className="w-full max-w-sm flex flex-col gap-6">
        <div className="bg-slate-800/80 border border-emerald-500/30 rounded-2xl p-8 flex flex-col items-center gap-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
            <svg className="w-7 h-7 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
            </svg>
          </div>
          <div>
            <h2 className="text-white text-lg font-semibold">Akun berhasil dibuat!</h2>
            <p className="text-slate-400 text-sm mt-1">Mengarahkan ke halaman masuk...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm flex flex-col gap-6">
      {/* Logo */}
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white font-bold text-xl">
          S
        </div>
        <div>
          <h1 className="text-white text-xl font-bold">SMANU</h1>
          <p className="text-slate-400 text-sm">Buat akun baru</p>
        </div>
      </div>

      {/* Card */}
      <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 flex flex-col gap-4">
        <div>
          <h2 className="text-white text-lg font-semibold">Daftar</h2>
          <p className="text-slate-400 text-sm mt-0.5">Buat akun SMANU untuk menyimpan progress kamu.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5" noValidate>
          {/* Full name */}
          <FormField
            label="Nama Lengkap"
            id="fullName"
            type="text"
            autoComplete="name"
            value={form.fullName}
            onChange={(v) => setField("fullName", v)}
            disabled={isLoading}
            error={errors.fullName}
            placeholder="Nama kamu"
          />

          {/* Username */}
          <FormField
            label="Username"
            id="username"
            type="text"
            autoComplete="username"
            value={form.username}
            onChange={(v) => setField("username", v)}
            disabled={isLoading}
            error={errors.username}
            placeholder="huruf, angka, _ atau -"
          />

          {/* Email */}
          <FormField
            label="Email"
            id="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(v) => setField("email", v)}
            disabled={isLoading}
            error={errors.email}
            placeholder="contoh@email.com"
          />

          {/* Password */}
          <PasswordField
            label="Password"
            id="password"
            autoComplete="new-password"
            value={form.password}
            onChange={(v) => setField("password", v)}
            show={showPassword}
            onToggle={() => setShowPassword((v) => !v)}
            disabled={isLoading}
            error={errors.password}
            placeholder="Minimal 8 karakter"
          />

          {/* Confirm Password */}
          <PasswordField
            label="Konfirmasi Password"
            id="confirmPassword"
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={(v) => setField("confirmPassword", v)}
            show={showConfirm}
            onToggle={() => setShowConfirm((v) => !v)}
            disabled={isLoading}
            error={errors.confirmPassword}
            placeholder="Ulangi password"
          />

          {/* General error */}
          {errors._general && (
            <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30">
              <svg className="w-4 h-4 text-red-400 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path clipRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" fillRule="evenodd" />
              </svg>
              <p className="text-red-400 text-sm">{errors._general}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1"
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
              "Buat Akun"
            )}
          </button>
        </form>

        {/* Login link */}
        <p className="text-center text-slate-400 text-sm">
          Sudah punya akun?{" "}
          <Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors">
            Masuk
          </Link>
        </p>
      </div>

      {/* Guest option */}
      <div className="text-center">
        <Link href="/" className="text-slate-500 hover:text-slate-400 text-sm transition-colors">
          Lanjutkan sebagai Tamu →
        </Link>
      </div>
    </div>
  );
}

// ── Field components ──────────────────────────────────────────────────────────

function FormField({
  label, id, type, autoComplete, value, onChange, disabled, error, placeholder,
}: {
  label: string; id: string; type: string; autoComplete?: string;
  value: string; onChange: (v: string) => void; disabled: boolean;
  error?: string; placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-slate-300 text-sm font-medium">{label}</label>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full px-3 py-2.5 rounded-xl bg-slate-700/60 border text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 transition-all disabled:opacity-50 ${
          error
            ? "border-red-500/60 focus:ring-red-500/30"
            : "border-slate-600 focus:ring-emerald-500/40 focus:border-emerald-500"
        }`}
        placeholder={placeholder}
      />
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  );
}

function PasswordField({
  label, id, autoComplete, value, onChange, show, onToggle, disabled, error, placeholder,
}: {
  label: string; id: string; autoComplete?: string;
  value: string; onChange: (v: string) => void;
  show: boolean; onToggle: () => void; disabled: boolean;
  error?: string; placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-slate-300 text-sm font-medium">{label}</label>
      <div className="relative">
        <input
          id={id}
          type={show ? "text" : "password"}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={`w-full px-3 py-2.5 pr-10 rounded-xl bg-slate-700/60 border text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 transition-all disabled:opacity-50 ${
            error
              ? "border-red-500/60 focus:ring-red-500/30"
              : "border-slate-600 focus:ring-emerald-500/40 focus:border-emerald-500"
          }`}
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
          tabIndex={-1}
        >
          {show ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
              <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
            </svg>
          )}
        </button>
      </div>
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  );
}
