"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PageHeader } from "@/components/ui/PageHeader";
import { useAuth } from "@/context/AuthContext";

interface ProfileForm {
  displayName: string;
  fullName: string;
  username: string;
  email: string;
  age: string;
  school: string;
  grade: string;
}

interface FormErrors {
  displayName?: string;
  fullName?: string;
  username?: string;
  email?: string;
  age?: string;
  _general?: string;
}

export default function SettingsPage() {
  const { user, isGuest, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState<ProfileForm>({
    displayName: "",
    fullName: "",
    username: "",
    email: "",
    age: "",
    school: "",
    grade: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Load profile from API when authenticated
  useEffect(() => {
    if (!isAuthenticated || isLoading) return;

    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setForm({
            displayName: data.user.displayName ?? "",
            fullName: data.user.fullName ?? "",
            username: data.user.username ?? "",
            email: data.user.email ?? "",
            age: data.user.age != null ? String(data.user.age) : "",
            school: data.user.school ?? "",
            grade: data.user.grade ?? "",
          });
        }
      })
      .catch(() => {}); // Silently fail — form stays at auth context values
  }, [isAuthenticated, isLoading]);

  // Pre-fill from context when it loads (before API responds)
  useEffect(() => {
    if (isAuthenticated && user.displayName) {
      setForm((f) => ({
        ...f,
        displayName: f.displayName || user.displayName,
        fullName: f.fullName || user.fullName,
        username: f.username || user.username,
        email: f.email || user.email,
      }));
    }
  }, [isAuthenticated, user]);

  function setField(field: keyof ProfileForm, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((e) => ({ ...e, [field]: undefined }));
    }
    setSaveStatus("idle");
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (isSaving || !isAuthenticated) return;

    setErrors({});
    setIsSaving(true);
    setSaveStatus("idle");

    try {
      const payload: Record<string, string | number | null> = {
        displayName: form.displayName.trim(),
        fullName: form.fullName.trim(),
        username: form.username.trim().toLowerCase(),
        email: form.email.trim().toLowerCase(),
        school: form.school.trim() || null,
        grade: form.grade.trim() || null,
      };

      if (form.age.trim()) {
        payload.age = parseInt(form.age.trim(), 10);
      } else {
        payload.age = null;
      }

      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 3000);
      } else if (data.errors) {
        setErrors(data.errors);
        setSaveStatus("error");
      } else {
        setErrors({ _general: data.error ?? "Gagal menyimpan perubahan." });
        setSaveStatus("error");
      }
    } catch {
      setErrors({ _general: "Tidak dapat terhubung ke server." });
      setSaveStatus("error");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSignOut() {
    if (isSigningOut) return;
    setIsSigningOut(true);
    try {
      await signOut({ redirect: false });
      router.push("/login");
      router.refresh();
    } catch {
      setIsSigningOut(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <PageHeader
        badge="Preferences"
        title="Settings"
        subtitle="Kelola preferensi dan profil akun SMANU kamu."
      />

      {/* ── Account / Profile Section ────────────────────────────────────────── */}
      <Card>
        <div className="flex items-center gap-2 mb-5">
          <span className="material-symbols-outlined text-[--color-on-surface-variant] text-[20px] overflow-hidden" style={{width:20,height:20,fontSize:20}}>
            account_circle
          </span>
          <h2 className="text-sm font-semibold text-[--color-on-surface]">Akun &amp; Profil</h2>
          <div className="ml-auto">
            <Badge variant={isGuest ? "neutral" : "success"}>
              {isGuest ? "Mode Tamu" : "Akun Terdaftar"}
            </Badge>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <svg className="w-6 h-6 animate-spin text-emerald-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : isGuest ? (
          // Guest mode — show login/register CTA
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3 p-3.5 bg-blue-50 border border-blue-200 rounded-xl">
              <svg className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path clipRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" fillRule="evenodd" />
              </svg>
              <p className="text-xs text-blue-700 leading-relaxed">
                Kamu sedang menggunakan SMANU sebagai <strong>Tamu</strong>. Buat akun untuk menyimpan profil dan progress kamu.
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href="/register"
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm text-center transition-colors"
              >
                Buat Akun
              </Link>
              <Link
                href="/login"
                className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm text-center transition-colors"
              >
                Masuk
              </Link>
            </div>
          </div>
        ) : (
          // Authenticated — show editable profile form
          <form onSubmit={handleSave} className="flex flex-col gap-4" noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Display Name */}
              <ProfileField
                label="Nama Tampilan"
                id="displayName"
                value={form.displayName}
                onChange={(v) => setField("displayName", v)}
                error={errors.displayName}
                disabled={isSaving}
                required
              />
              {/* Full Name */}
              <ProfileField
                label="Nama Lengkap"
                id="fullName"
                value={form.fullName}
                onChange={(v) => setField("fullName", v)}
                error={errors.fullName}
                disabled={isSaving}
                required
              />
              {/* Username */}
              <ProfileField
                label="Username"
                id="username"
                value={form.username}
                onChange={(v) => setField("username", v)}
                error={errors.username}
                disabled={isSaving}
                required
              />
              {/* Email */}
              <ProfileField
                label="Email"
                id="email"
                type="email"
                value={form.email}
                onChange={(v) => setField("email", v)}
                error={errors.email}
                disabled={isSaving}
                required
              />
            </div>

            {/* Optional fields */}
            <div className="border-t border-[--color-outline-variant]/50 pt-3">
              <p className="text-xs text-[--color-on-surface-variant] mb-3">
                Informasi tambahan (opsional) — tidak wajib diisi.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <ProfileField
                  label="Umur"
                  id="age"
                  type="number"
                  value={form.age}
                  onChange={(v) => setField("age", v)}
                  error={errors.age}
                  disabled={isSaving}
                  placeholder="Cth: 17"
                />
                <ProfileField
                  label="Sekolah / Institusi"
                  id="school"
                  value={form.school}
                  onChange={(v) => setField("school", v)}
                  disabled={isSaving}
                  placeholder="Nama sekolah / kampus"
                />
                <ProfileField
                  label="Kelas / Tingkat"
                  id="grade"
                  value={form.grade}
                  onChange={(v) => setField("grade", v)}
                  disabled={isSaving}
                  placeholder="Cth: 11 IPA / Semester 3"
                />
              </div>
            </div>

            {/* General error */}
            {errors._general && (
              <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-red-50 border border-red-200">
                <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path clipRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" fillRule="evenodd" />
                </svg>
                <p className="text-red-600 text-xs">{errors._general}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between gap-3 pt-1">
              <button
                type="button"
                onClick={handleSignOut}
                disabled={isSigningOut || isSaving}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                {isSigningOut ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                  </svg>
                )}
                {isSigningOut ? "Keluar..." : "Keluar"}
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Menyimpan...
                  </>
                ) : saveStatus === "success" ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                    </svg>
                    Tersimpan!
                  </>
                ) : (
                  "Simpan Perubahan"
                )}
              </button>
            </div>
          </form>
        )}
      </Card>

      {/* ── Appearance ───────────────────────────────────────────────────────── */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-[--color-on-surface-variant] text-[20px] overflow-hidden" style={{width:20,height:20,fontSize:20}}>
            palette
          </span>
          <h2 className="text-sm font-semibold text-[--color-on-surface]">Tampilan</h2>
        </div>
        <div className="flex flex-col divide-y divide-[--color-outline-variant]/50">
          {[
            { label: "Tema", value: "System default" },
            { label: "Bahasa", value: "Bahasa Indonesia" },
            { label: "Ukuran font", value: "Medium" },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between py-3">
              <div>
                <span className="text-sm text-[--color-on-surface]">{item.label}</span>
                <p className="text-xs text-[--color-on-surface-variant]">{item.value}</p>
              </div>
              <Badge variant="neutral">Coming soon</Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* ── Notifications ────────────────────────────────────────────────────── */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-[--color-on-surface-variant] text-[20px] overflow-hidden" style={{width:20,height:20,fontSize:20}}>
            notifications
          </span>
          <h2 className="text-sm font-semibold text-[--color-on-surface]">Notifikasi</h2>
        </div>
        <div className="flex flex-col divide-y divide-[--color-outline-variant]/50">
          {[
            { label: "Pengingat belajar", value: "Off" },
            { label: "Update knowledge base", value: "Off" },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between py-3">
              <div>
                <span className="text-sm text-[--color-on-surface]">{item.label}</span>
                <p className="text-xs text-[--color-on-surface-variant]">{item.value}</p>
              </div>
              <Badge variant="neutral">Coming soon</Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* ── Privacy ──────────────────────────────────────────────────────────── */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-[--color-on-surface-variant] text-[20px] overflow-hidden" style={{width:20,height:20,fontSize:20}}>
            lock
          </span>
          <h2 className="text-sm font-semibold text-[--color-on-surface]">Privasi &amp; Data</h2>
        </div>
        <div className="flex flex-col divide-y divide-[--color-outline-variant]/50">
          {[
            { label: "Penyimpanan konteks", value: "Sesi saja (Phase 1)" },
            { label: "Analitik penggunaan", value: "Off" },
            { label: "Export data saya", value: "—" },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between py-3">
              <div>
                <span className="text-sm text-[--color-on-surface]">{item.label}</span>
                <p className="text-xs text-[--color-on-surface-variant]">{item.value}</p>
              </div>
              <Badge variant="neutral">Coming soon</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── Field component ───────────────────────────────────────────────────────────

function ProfileField({
  label, id, type = "text", value, onChange, error, disabled, placeholder, required,
}: {
  label: string; id: string; type?: string;
  value: string; onChange: (v: string) => void;
  error?: string; disabled?: boolean; placeholder?: string; required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs font-medium text-[--color-on-surface-variant]">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className={`w-full px-3 py-2 rounded-lg border bg-[--color-surface-container-low] text-[--color-on-surface] text-sm focus:outline-none focus:ring-2 transition-all disabled:opacity-60 ${
          error
            ? "border-red-400 focus:ring-red-400/30"
            : "border-[--color-outline-variant] focus:ring-[--color-secondary]/30 focus:border-[--color-secondary]"
        }`}
      />
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
}
