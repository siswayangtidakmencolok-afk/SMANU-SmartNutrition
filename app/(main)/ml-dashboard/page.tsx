"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

// ── Types ─────────────────────────────────────────────────────────────────────

interface CandidateStat {
  status: string;
  cnt: number;
}

interface PhotoStat {
  status: string;
  cnt: number;
}

interface ModelStat {
  modelUsed: string | null;
  cnt: number;
}

interface ScanLogsSummary {
  total: number;
  withFoodId: number;
  uniqueUsers: number;
  avgPortionG: number;
  byModel: ModelStat[];
}

interface RecentScan {
  id: string;
  recognizedFoodName: string;
  portionG: number | null;
  dataSourceUsed: string | null;
  modelUsed: string | null;
  confidenceNote: string | null;
  scannedAt: string;
}

interface MlStats {
  candidateFoods: CandidateStat[];
  scanLogs: ScanLogsSummary;
  photoContributions: PhotoStat[];
  recentScans: RecentScan[];
  generatedAt: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n: number | undefined | null, fallback = "—") {
  if (n == null) return fallback;
  return n.toLocaleString("id-ID");
}

function relTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "baru saja";
  if (mins < 60) return `${mins} menit lalu`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} jam lalu`;
  return `${Math.floor(hrs / 24)} hari lalu`;
}

const STATUS_BADGE: Record<string, string> = {
  pending:  "bg-amber-100 text-amber-700 border-amber-200",
  approved: "bg-emerald-100 text-emerald-700 border-emerald-200",
  rejected: "bg-red-100 text-red-700 border-red-200",
  analyzed: "bg-blue-100 text-blue-700 border-blue-200",
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function MlDashboardPage() {
  const { isLoading } = useAuth();
  const [stats, setStats] = useState<MlStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoading) return;
    fetch("/api/admin/ml-stats")
      .then(async (r) => {
        if (!r.ok) {
          const body = await r.json().catch(() => ({ error: r.statusText }));
          throw new Error(body.error ?? r.statusText);
        }
        return r.json() as Promise<MlStats>;
      })
      .then(setStats)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [isLoading]);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading || isLoading) {
    return (
      <div className="flex flex-col gap-4 animate-pulse">
        <div className="h-10 bg-slate-200 rounded-xl w-48" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-100 rounded-xl" />
          ))}
        </div>
        <div className="h-64 bg-slate-100 rounded-xl" />
      </div>
    );
  }

  // ── Access denied ──────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center">
          <span className="material-symbols-outlined text-red-500 text-[28px]">lock</span>
        </div>
        <h1 className="text-lg font-bold text-slate-900">Akses Ditolak</h1>
        <p className="text-sm text-slate-500 max-w-sm">{error}</p>
        <Link href="/" className="mt-2 px-4 py-2 rounded-lg bg-[#131b2e] text-white text-sm font-semibold">
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  if (!stats) return null;

  const totalCandidates = stats.candidateFoods.reduce((s, c) => s + c.cnt, 0);
  const totalPhotos = stats.photoContributions.reduce((s, p) => s + p.cnt, 0);
  const matchRate = stats.scanLogs.total > 0
    ? Math.round((stats.scanLogs.withFoodId / stats.scanLogs.total) * 100)
    : 0;

  return (
    <div className="flex flex-col gap-5 pb-8">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#131b2e] text-white text-[11px] font-bold tracking-wide uppercase mb-2">
            <span className="material-symbols-outlined text-[13px]">admin_panel_settings</span>
            Internal · Tim SMANU
          </div>
          <h1 className="text-xl font-bold text-slate-900">ML Dashboard</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Data aktual dari database — bukan prediksi. Diperbarui setiap load.
          </p>
        </div>
        <div className="text-[11px] text-slate-400 sm:text-right">
          Dihasilkan: {new Date(stats.generatedAt).toLocaleString("id-ID")}
        </div>
      </div>

      {/* ── Disclaimer ─────────────────────────────────────────────────── */}
      <div className="flex items-start gap-2.5 p-3.5 bg-amber-50 border border-amber-200 rounded-xl">
        <span className="material-symbols-outlined text-amber-500 text-[18px] shrink-0 mt-0.5">warning</span>
        <p className="text-xs text-amber-800 leading-relaxed">
          <strong>Halaman ini hanya untuk tim internal SMANU.</strong> Data di sini adalah statistik sistem nyata.
          Jangan menggunakan angka ini sebagai klaim akurasi model kepada pengguna.
          Fine-tuning model BELUM boleh dilakukan sampai baseline eval selesai.
        </p>
      </div>

      {/* ── 4 Metric Cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            label: "Total Scan Tersimpan",
            value: fmt(stats.scanLogs.total),
            sub: `dari ${fmt(stats.scanLogs.uniqueUsers)} pengguna unik`,
            icon: "photo_camera",
            iconBg: "bg-teal-100 text-teal-700",
          },
          {
            label: "Match Rate ke DB",
            value: `${matchRate}%`,
            sub: `${fmt(stats.scanLogs.withFoodId)} dari ${fmt(stats.scanLogs.total)} scan`,
            icon: "check_circle",
            iconBg: matchRate >= 70 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700",
          },
          {
            label: "Kandidat Makanan",
            value: fmt(totalCandidates),
            sub: `${stats.candidateFoods.find(c => c.status === "pending")?.cnt ?? 0} pending review`,
            icon: "pending_actions",
            iconBg: "bg-orange-100 text-orange-700",
          },
          {
            label: "Kontribusi Foto",
            value: fmt(totalPhotos),
            sub: `${stats.photoContributions.find(p => p.status === "pending")?.cnt ?? 0} pending analisis`,
            icon: "collections",
            iconBg: "bg-purple-100 text-purple-700",
          },
        ].map((card) => (
          <div key={card.label} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] text-slate-500 mb-0.5">{card.label}</span>
                <span className="text-2xl font-bold text-slate-900">{card.value}</span>
              </div>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${card.iconBg}`}>
                <span className="material-symbols-outlined text-[20px]">{card.icon}</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-400">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Two-column: Candidate foods + Photo contributions ──────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Candidate foods */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h2 className="text-sm font-bold text-slate-900 mb-1">Candidate Foods per Status</h2>
          <p className="text-[11px] text-slate-500 mb-4">
            Makanan yang dilaporkan pengguna saat tidak ditemukan di knowledge base.
          </p>
          {stats.candidateFoods.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">Belum ada kandidat.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {stats.candidateFoods.map((c) => (
                <div key={c.status} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_BADGE[c.status] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}>
                    {c.status}
                  </span>
                  <span className="text-sm font-bold text-slate-900">{fmt(c.cnt)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Photo contributions */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h2 className="text-sm font-bold text-slate-900 mb-1">Photo Contributions per Status</h2>
          <p className="text-[11px] text-slate-500 mb-4">
            Hanya metadata — foto aktual disimpan di object storage (jika sudah dikonfigurasi).
          </p>
          {stats.photoContributions.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">Belum ada kontribusi foto.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {stats.photoContributions.map((p) => (
                <div key={p.status} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_BADGE[p.status] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}>
                    {p.status}
                  </span>
                  <span className="text-sm font-bold text-slate-900">{fmt(p.cnt)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Model usage ────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <h2 className="text-sm font-bold text-slate-900 mb-1">Model Vision yang Digunakan</h2>
        <p className="text-[11px] text-slate-500 mb-4">
          Distribusi scan berdasarkan model Gemini. Confidence bukan probabilitas terkalibrasi.
        </p>
        {stats.scanLogs.byModel.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">Belum ada data model.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {stats.scanLogs.byModel.map((m) => {
              const pct = stats.scanLogs.total > 0
                ? Math.round((m.cnt / stats.scanLogs.total) * 100)
                : 0;
              return (
                <div key={m.modelUsed ?? "unknown"} className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-xs font-mono text-slate-700 truncate flex-1">
                    {m.modelUsed ?? "(unknown)"}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-24 h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className="h-full bg-[#006c49] rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-slate-900 w-10 text-right">{fmt(m.cnt)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Recent scans ───────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">10 Scan Terbaru</h2>
            <p className="text-[11px] text-slate-500">Anonim — user_id tidak ditampilkan.</p>
          </div>
          <span className="text-[11px] text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">Live</span>
        </div>

        {stats.recentScans.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">Belum ada scan tersimpan.</p>
        ) : (
          <div className="overflow-x-auto -mx-5">
            <table className="min-w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100">
                  {["Makanan", "Porsi (g)", "Sumber Data", "Model", "Kepercayaan", "Waktu"].map((h) => (
                    <th key={h} className="px-5 py-2 text-left text-[11px] font-semibold text-slate-500 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.recentScans.map((s, i) => (
                  <tr key={s.id} className={`border-b border-slate-50 ${i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}`}>
                    <td className="px-5 py-2.5 font-medium text-slate-800 max-w-[160px] truncate">
                      {s.recognizedFoodName}
                    </td>
                    <td className="px-5 py-2.5 text-slate-600">{s.portionG ?? "—"}</td>
                    <td className="px-5 py-2.5 text-slate-500 font-mono text-[11px]">
                      {s.dataSourceUsed ?? "—"}
                    </td>
                    <td className="px-5 py-2.5 text-slate-500 font-mono text-[11px] max-w-[120px] truncate">
                      {s.modelUsed ?? "—"}
                    </td>
                    <td className="px-5 py-2.5">
                      {s.confidenceNote ? (
                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                          s.confidenceNote === "high"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : s.confidenceNote === "medium"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-red-50 text-red-700 border-red-200"
                        }`}>
                          {s.confidenceNote}
                        </span>
                      ) : "—"}
                    </td>
                    <td className="px-5 py-2.5 text-slate-400 whitespace-nowrap">{relTime(s.scannedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Fine-tuning gate status ─────────────────────────────────────── */}
      <div className="bg-[#131b2e] rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
            <span className="material-symbols-outlined text-white text-[20px]">science</span>
          </div>
          <div>
            <h2 className="text-sm font-bold text-white mb-1">Status Fine-Tuning Gate</h2>
            <div className="flex flex-col gap-1.5">
              {[
                { label: "Baseline eval dengan eval-samples.json",   done: false },
                { label: "Human-verified dataset (≥50 images/class)", done: false },
                { label: "Dataset lisensi & labels diaudit",          done: false },
                { label: "Baseline accuracy ≥ 50% per kelas",         done: false },
              ].map((gate) => (
                <div key={gate.label} className="flex items-center gap-2">
                  <span className={`material-symbols-outlined text-[16px] ${gate.done ? "text-[#6cf8bb]" : "text-white/30"}`}>
                    {gate.done ? "check_circle" : "radio_button_unchecked"}
                  </span>
                  <span className={`text-[11px] ${gate.done ? "text-[#6cf8bb]" : "text-white/50"}`}>
                    {gate.label}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-white/40 mt-3 italic">
              Fine-tuning TIDAK boleh dilakukan sampai semua gate terpenuhi.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
