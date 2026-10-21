"use client";

/**
 * /scan-history — Food Scan History Page
 *
 * Displays all food scan results saved by the authenticated user.
 * Data is fetched from /api/food-scanner/history (server-enforced auth).
 *
 * Each card shows:
 *  - Food name + data source badge
 *  - Scan timestamp
 *  - Macronutrients (null shown as "—")
 *  - Portion details
 *  - Delete button (ownership verified on server)
 *
 * Guest users see a login prompt — no data is shown or fabricated.
 */

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import type { ScanLogEntry } from "@/app/api/food-scanner/history/route";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatRelTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.floor(ms / 60000);
  if (min < 1) return "baru saja";
  if (min < 60) return `${min} menit lalu`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} jam lalu`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} hari lalu`;
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

function NullSafe({ v, unit }: { v: number | null; unit: string }) {
  if (v == null) return <span className="text-slate-300">—</span>;
  return <span>{v} {unit}</span>;
}

function DataSourceBadge({ source, dataStatus }: { source: string | null; dataStatus?: string | null }) {
  // AI estimate badge takes priority
  if (dataStatus === "ai_estimate") {
    return (
      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium border bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-0.5">
        <span className="text-[10px]">✦</span> Estimasi AI
      </span>
    );
  }
  if (!source || source === "—") return null;
  const color = source === "TKPI-2017"
    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : source === "USDA-FDC"
    ? "bg-blue-50 text-blue-700 border-blue-200"
    : "bg-slate-50 text-slate-500 border-slate-200";
  const label = source === "TKPI-2017" ? "TKPI-2017" : source === "USDA-FDC" ? "USDA FDC" : source;
  return (
    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${color}`}>
      {label}
    </span>
  );
}

// ── Scan Card ────────────────────────────────────────────────────────────────

type AiSections = {
  whatIsIt: string;
  composition: string;
  nutritionExplain: string;
  portionContext: string;
  variations: string;
  sourceLimits: string;
  eduSummary: string;
};

function ScanCard({
  scan,
  onDelete,
}: {
  scan: ScanLogEntry;
  onDelete: (id: string) => void;
}) {
  const [confirming, setConfirming]           = useState(false);
  const [deleting, setDeleting]               = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const isAiEstimate = scan.dataStatus === "ai_estimate";
  const sections = scan.explanationJson as AiSections | null;

  const SECTION_META: { key: keyof AiSections; label: string }[] = [
    { key: "whatIsIt",         label: "Pengertian Makanan" },
    { key: "composition",      label: "Komposisi & Bahan" },
    { key: "nutritionExplain", label: "Penjelasan Nutrisi" },
    { key: "portionContext",   label: "Konteks Porsi" },
    { key: "variations",       label: "Variasi & Faktor" },
    { key: "sourceLimits",     label: "Sumber & Keterbatasan" },
    { key: "eduSummary",       label: "Kesimpulan Edukatif" },
  ];

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/food-scanner/history?id=${encodeURIComponent(scan.id)}`, {
        method: "DELETE",
      });
      if (res.ok) onDelete(scan.id);
    } finally {
      setDeleting(false);
      setConfirming(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Header row */}
      <div className="flex items-start gap-3 p-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
          isAiEstimate ? "bg-blue-50" : "bg-[#006c49]/10"
        }`}>
          <span className={`material-symbols-outlined text-[20px] ${isAiEstimate ? "text-blue-500" : "text-[#006c49]"}`}>
            {isAiEstimate ? "smart_toy" : "restaurant"}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 flex-wrap">
              <p className="text-sm font-bold text-slate-800 leading-snug">
                {scan.recognizedFoodName}
              </p>
              <DataSourceBadge source={scan.dataSourceUsed} dataStatus={scan.dataStatus} />
              {scan.confidenceNote && (
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${
                  scan.confidenceNote === "high"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : scan.confidenceNote === "medium"
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : "bg-slate-50 text-slate-500 border-slate-200"
                }`}>
                  {scan.confidenceNote === "high" ? "Sangat yakin"
                    : scan.confidenceNote === "medium" ? "Cukup yakin"
                    : "Kurang yakin"}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 shrink-0">{formatRelTime(scan.scannedAt)}</p>
          </div>
          {scan.portionLabel && (
            <p className="text-xs text-slate-500 mt-0.5">{scan.portionLabel}</p>
          )}
        </div>
      </div>

      {/* Nutrient grid */}
      <div className="px-4 pb-3 grid grid-cols-4 gap-2">
        {[
          { label: "Energi",  value: scan.energyRange ?? scan.estimatedEnergyKcal, unit: scan.energyRange ? "" : "kkal", isRange: !!scan.energyRange },
          { label: "Protein", value: scan.estimatedProteinG,   unit: "g" },
          { label: "Lemak",   value: scan.estimatedFatG,       unit: "g" },
          { label: "Karbo",   value: scan.estimatedCarbG,      unit: "g" },
        ].map(({ label, value, unit, isRange }) => (
          <div key={label} className={`rounded-lg p-2 text-center border ${
            isAiEstimate
              ? "bg-blue-50/50 border-blue-100"
              : "bg-slate-50 border-slate-100"
          }`}>
            <p className="text-[9px] text-slate-400 font-medium">{label}</p>
            <p className="text-xs font-bold text-slate-700 mt-0.5">
              {isRange
                ? <span className="text-[10px]">{String(value)}</span>
                : <NullSafe v={typeof value === "number" ? value : null} unit={unit} />
              }
            </p>
          </div>
        ))}
      </div>

      {/* AI explanation accordion — only for ai_estimate with saved sections */}
      {isAiEstimate && sections && (
        <div className="px-4 pb-3">
          <div className="flex flex-col gap-1 border border-blue-100 rounded-xl overflow-hidden">
            <div className="px-3 py-2 bg-blue-50 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-blue-500 text-[13px]">smart_toy</span>
              <p className="text-[10px] font-semibold text-blue-700">Laporan AI tersimpan — klik untuk baca</p>
            </div>
            {SECTION_META.map(({ key, label }) => {
              const text = sections[key];
              if (!text) return null;
              const isOpen = expandedSection === key;
              return (
                <div key={key} className="border-t border-blue-50">
                  <button
                    onClick={() => setExpandedSection(isOpen ? null : key)}
                    className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-white hover:bg-slate-50 text-left transition-colors"
                  >
                    <span className="text-[11px] font-medium text-slate-700">{label}</span>
                    <span className={`material-symbols-outlined text-[14px] text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}>
                      expand_more
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-3 pb-2.5 pt-1 bg-slate-50">
                      <p className="text-[11px] text-slate-600 leading-relaxed">{text}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer: assumptions + delete */}
      <div className="px-4 pb-4 flex items-end justify-between gap-3">
        {scan.assumptions ? (
          <p className="text-[10px] text-slate-400 leading-relaxed flex-1 line-clamp-2">
            {scan.assumptions}
          </p>
        ) : <span />}

        {!confirming ? (
          <button
            onClick={() => setConfirming(true)}
            className="text-[11px] text-slate-400 hover:text-red-500 transition-colors shrink-0 flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[14px]">delete</span>
            Hapus
          </button>
        ) : (
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[11px] text-red-600 font-medium">Hapus scan ini?</span>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-2 py-1 rounded-md bg-red-600 text-white text-[11px] font-semibold hover:bg-red-700 disabled:opacity-60"
            >
              {deleting ? "…" : "Ya"}
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="px-2 py-1 rounded-md bg-slate-200 text-slate-700 text-[11px] font-semibold hover:bg-slate-300"
            >
              Batal
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ScanHistoryPage() {
  const { data: session, status } = useSession();
  const isLoggedIn = !!session?.user?.id;

  const [scans, setScans]         = useState<ScanLogEntry[]>([]);
  const [total, setTotal]         = useState(0);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string>("");
  const [offset, setOffset]       = useState(0);
  const LIMIT = 20;

  const fetchScans = useCallback(async (off: number) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/food-scanner/history?limit=${LIMIT}&offset=${off}`);
      if (res.status === 401) {
        setError("Kamu harus login untuk melihat riwayat scan.");
        return;
      }
      if (!res.ok) {
        setError("Gagal memuat riwayat. Coba lagi.");
        return;
      }
      const data = await res.json() as {
        scans: ScanLogEntry[];
        total: number;
        limit: number;
        offset: number;
      };
      if (off === 0) {
        setScans(data.scans);
      } else {
        setScans((prev) => [...prev, ...data.scans]);
      }
      setTotal(data.total);
    } catch {
      setError("Tidak dapat menghubungi server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetchScans(0);
    }
  }, [isLoggedIn, fetchScans]);

  function handleDelete(id: string) {
    setScans((prev) => prev.filter((s) => s.id !== id));
    setTotal((t) => Math.max(0, t - 1));
  }

  function loadMore() {
    const next = offset + LIMIT;
    setOffset(next);
    fetchScans(next);
  }

  // ── Not yet authenticated ──────────────────────────────────────────────────
  if (status === "loading") {
    return (
      <div className="max-w-2xl mx-auto py-16 flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-4 border-[#006c49] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-500">Memuat…</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="max-w-2xl mx-auto py-16 flex flex-col items-center gap-6 text-center px-4">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
          <span className="material-symbols-outlined text-[32px] text-slate-400">lock</span>
        </div>
        <div>
          <p className="text-lg font-bold text-slate-800">Login diperlukan</p>
          <p className="text-sm text-slate-500 mt-1">
            Riwayat scan disimpan per akun. Login untuk melihat hasil scan kamu.
          </p>
        </div>
        <Link
          href="/login"
          className="px-6 py-2.5 rounded-xl bg-[#006c49] text-white text-sm font-semibold hover:bg-[#005a3c] transition-colors"
        >
          Login
        </Link>
      </div>
    );
  }

  // ── Authenticated ──────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Page header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-slate-900">Riwayat Scan Makanan</h1>
            {total > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-[#006c49]/10 text-[#006c49] text-xs font-bold border border-[#006c49]/20">
                {total}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500">
            Hasil scan yang kamu simpan. Foto tidak disimpan — hanya metadata gizi.
          </p>
        </div>
      </div>

      {/* Storage policy notice */}
      <div className="flex items-start gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
        <span className="material-symbols-outlined text-slate-400 text-[18px] shrink-0 mt-0.5">info</span>
        <p className="text-xs text-slate-500 leading-relaxed">
          <span className="font-semibold text-slate-600">Kebijakan privasi foto:</span>{" "}
          Foto asli tidak disimpan di server — hanya nama makanan, porsi, estimasi nilai gizi,
          dan sumbernya. Hasil ini adalah estimasi edukatif, bukan pengukuran klinis.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px]">error</span>
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading && scans.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-12">
          <div className="w-8 h-8 border-4 border-[#006c49] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Memuat riwayat scan…</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && scans.length === 0 && !error && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-[32px] text-slate-300">document_scanner</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700">Belum ada scan tersimpan</p>
            <p className="text-xs text-slate-400 mt-1">
              Gunakan AI Food Scanner di halaman Nutrition Knowledge untuk memulai.
            </p>
          </div>
          <Link
            href="/nutrition-knowledge"
            className="px-4 py-2 rounded-xl bg-[#006c49] text-white text-xs font-semibold hover:bg-[#005a3c] transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[15px]">document_scanner</span>
            Buka Food Scanner
          </Link>
        </div>
      )}

      {/* Scan list */}
      {scans.length > 0 && (
        <div className="space-y-3">
          {scans.map((scan) => (
            <ScanCard key={scan.id} scan={scan} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* Load more */}
      {scans.length < total && (
        <div className="flex justify-center pb-4">
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-5 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors disabled:opacity-60"
          >
            {loading ? "Memuat…" : `Tampilkan lebih banyak (${total - scans.length} tersisa)`}
          </button>
        </div>
      )}

      {/* Footer note */}
      {scans.length > 0 && (
        <p className="text-center text-xs text-slate-400 pb-2">
          {total} scan tersimpan · Nilai dari database TKPI-2017/USDA-FDC atau estimasi AI (ditandai ✦) · Hanya referensi edukatif
        </p>
      )}
    </div>
  );
}
