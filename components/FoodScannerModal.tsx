"use client";

/**
 * FoodScannerModal.tsx
 *
 * AI Food Scanner — prototype modal for SMANU SmartNutrition.
 *
 * FLOW:
 *  idle → capturing (camera / upload) → analyzing → candidates
 *       → portion → result → [save if logged in] → done
 *
 * NUTRITION RESOLUTION (in handleConfirmPortion):
 *  1. Try /api/food-scanner/nutrition?foodId=&portionG= (TKPI-2017 + USDA-FDC)
 *  2. If 404 or foodId=null → call POST /api/food-scanner/explain (AI fallback)
 *  3. If explain also fails → show explicit error with retry button
 *
 * LIMITATIONS (displayed to user):
 *  - Vision model can ONLY suggest names based on visual appearance.
 *  - Weight, recipe, hidden ingredients cannot be determined from a photo.
 *  - Nutrition values are ESTIMATIONS from TKPI-2017 reference data.
 *  - Guest users' results are NOT saved to the database.
 */

import { useState, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { getFoodById } from "@/lib/food-database";
import type { NutritionApiResponse } from "@/app/api/food-scanner/nutrition/route";
import type { ExplainApiResponse }   from "@/app/api/food-scanner/explain/route";

// ── Types ────────────────────────────────────────────────────────────────────

type Step =
  | "idle"
  | "capturing"
  | "analyzing"
  | "candidates"
  | "portion"
  | "loadingNutrition"   // fetching DB or AI explain
  | "result"
  | "done";

interface Candidate {
  foodId: string | null;
  namePrimary: string;
  confidence: "high" | "medium" | "low";
  reason: string;
}

interface NutritionResult {
  energyKcal:   number | null;
  proteinG:     number | null;
  fatG:         number | null;
  carbG:        number | null;
  fiberG:       number | null;
  portionG:     number;
  portionLabel: string;
  dataSource:   string;
  dataStatus:   "database_verified" | "ai_estimate" | "unavailable";
  isEstimate:   boolean;
  assumptions:  string;
  foodName:     string;
  energyRange:  string | null;
  // Full AI explanation — only present when dataStatus === "ai_estimate"
  aiSections:   ExplainApiResponse["sections"] | null;
  aiDisclaimer: string | null;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const CONFIDENCE_LABEL: Record<string, string> = {
  high:   "Sangat yakin",
  medium: "Cukup yakin",
  low:    "Kurang yakin",
};
const CONFIDENCE_COLOR: Record<string, string> = {
  high:   "text-emerald-700 bg-emerald-50 border-emerald-200",
  medium: "text-amber-700 bg-amber-50 border-amber-200",
  low:    "text-slate-600 bg-slate-50 border-slate-200",
};

const SECTION_LABELS: { key: keyof ExplainApiResponse["sections"]; label: string; icon: string }[] = [
  { key: "whatIsIt",         label: "Apa ini?",              icon: "help"             },
  { key: "composition",      label: "Komposisi",             icon: "grain"            },
  { key: "nutritionExplain", label: "Kandungan Gizi",        icon: "monitor_heart"    },
  { key: "portionContext",   label: "Konteks Porsi",         icon: "scale"            },
  { key: "variations",       label: "Variasi & Pengaruh",    icon: "device_hub"       },
  { key: "sourceLimits",     label: "Sumber & Keterbatasan", icon: "policy"           },
  { key: "eduSummary",       label: "Ringkasan Edukatif",    icon: "school"           },
];

function fileToBase64(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const [header, base64] = result.split(",");
      const mimeType = header.split(":")[1].split(";")[0];
      resolve({ base64, mimeType });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ── Component ─────────────────────────────────────────────────────────────────

interface FoodScannerModalProps {
  onClose: () => void;
}

export default function FoodScannerModal({ onClose }: FoodScannerModalProps) {
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user?.id;

  const [step, setStep]                   = useState<Step>("idle");
  const [previewUrl, setPreviewUrl]       = useState<string | null>(null);
  const [candidates, setCandidates]       = useState<Candidate[]>([]);
  const [imageQuality, setImageQuality]   = useState<"ok" | "unclear" | "not_food">("ok");
  const [qualityMessage, setQualityMessage] = useState<string>("");
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [portionG, setPortionG]           = useState<number>(0);
  const [portionLabel, setPortionLabel]   = useState<string>("");
  const [customPortion, setCustomPortion] = useState<string>("");
  const [result, setResult]               = useState<NutritionResult | null>(null);
  const [error, setError]                 = useState<string>("");
  const [saving, setSaving]               = useState(false);
  const [savedId, setSavedId]             = useState<string>("");
  // Tracks which AI accordion section is open
  const [openSection, setOpenSection]     = useState<string | null>(null);
  // Stores last portion for retry-explain without re-running recognition
  const lastPortionForRetry               = useRef<{ g: number; label: string; candidate: Candidate } | null>(null);

  const fileInputRef   = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // ── Analysis ────────────────────────────────────────────────────────────────

  const runAnalysis = useCallback(async (data: { base64: string; mimeType: string }) => {
    setStep("analyzing");
    setError("");
    try {
      const res = await fetch("/api/food-scanner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: data.base64, mimeType: data.mimeType }),
      });
      const json = await res.json() as {
        candidates?: Candidate[];
        imageQuality?: string;
        message?: string;
        error?: string;
      };
      if (!res.ok || json.error) {
        setError(json.error ?? "Analisis gagal. Coba lagi.");
        setStep("idle");
        return;
      }
      setImageQuality((json.imageQuality ?? "ok") as "ok" | "unclear" | "not_food");
      setQualityMessage(json.message ?? "");
      setCandidates(json.candidates ?? []);
      setStep("candidates");
    } catch {
      setError("Tidak dapat menghubungi server. Periksa koneksi internet.");
      setStep("idle");
    }
  }, []);

  // ── Image selection ─────────────────────────────────────────────────────────

  const handleFileSelect = useCallback(async (file: File) => {
    setError("");
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Format tidak didukung. Gunakan JPEG, PNG, atau WebP.");
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setError("Ukuran gambar terlalu besar. Maksimal 4 MB.");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    const data = await fileToBase64(file);
    setStep("analyzing");
    await runAnalysis(data);
  }, [runAnalysis]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  // ── Candidate selection ──────────────────────────────────────────────────────

  function handleSelectCandidate(c: Candidate) {
    setSelectedCandidate(c);
    // Pre-fill default portion from in-memory DB if available
    const food = c.foodId ? getFoodById(c.foodId) : null;
    if (food) {
      setPortionG(food.typicalPortionG);
      setPortionLabel(food.typicalPortionLabel);
    } else {
      setPortionG(100);
      setPortionLabel("perkiraan 100 g");
    }
    setCustomPortion("");
    setStep("portion");
  }

  // ── Nutrition resolution — DB lookup then AI fallback ───────────────────────

  async function resolveNutrition(candidate: Candidate, g: number, label: string): Promise<void> {
    setStep("loadingNutrition");
    setError("");

    // Store for retry-explain
    lastPortionForRetry.current = { g, label, candidate };

    // --- Path A: food has a known foodId → try DB (TKPI + USDA-FDC via API) ---
    if (candidate.foodId) {
      try {
        const res = await fetch(
          `/api/food-scanner/nutrition?foodId=${encodeURIComponent(candidate.foodId)}&portionG=${g}`
        );
        if (res.ok) {
          const data = await res.json() as NutritionApiResponse;
          setResult({
            energyKcal:   data.energyKcal,
            proteinG:     data.proteinG,
            fatG:         data.fatG,
            carbG:        data.carbG,
            fiberG:       data.fiberG,
            portionG:     data.portionG,
            portionLabel: label,
            dataSource:   data.dataSource,
            dataStatus:   "database_verified",
            isEstimate:   data.isEstimate,
            assumptions:  data.assumptions,
            foodName:     candidate.namePrimary,
            energyRange:  null,
            aiSections:   null,
            aiDisclaimer: null,
          });
          setStep("result");
          return;
        }
        // 404 = not in DB → fall through to AI explain
        if (res.status !== 404) {
          // Network or server error — not just "not found"
          const errJson = await res.json() as { error?: string };
          console.warn("[FoodScannerModal] nutrition API error:", errJson.error);
          // Fall through to AI explain anyway
        }
      } catch (e) {
        console.warn("[FoodScannerModal] nutrition fetch failed:", e);
        // Fall through to AI explain
      }
    }

    // --- Path B: no foodId or DB returned 404 → AI explain fallback ---
    await callExplainApi(candidate, g, label);
  }

  async function callExplainApi(candidate: Candidate, g: number, label: string): Promise<void> {
    // Find recognition context from candidates array
    const ctx = candidate.reason?.slice(0, 300);

    try {
      const res = await fetch("/api/food-scanner/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          foodName:            candidate.namePrimary,
          portionG:            g,
          recognitionContext:  ctx,
          weightIsAiEstimate:  false,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json() as { error?: string };
        console.error("[FoodScannerModal] explain API error:", res.status, errJson.error);
        setResult({
          energyKcal:   null,
          proteinG:     null,
          fatG:         null,
          carbG:        null,
          fiberG:       null,
          portionG:     g,
          portionLabel: label,
          dataSource:   "—",
          dataStatus:   "unavailable",
          isEstimate:   false,
          assumptions:  errJson.error ?? "Penjelasan AI tidak berhasil dibuat.",
          foodName:     candidate.namePrimary,
          energyRange:  null,
          aiSections:   null,
          aiDisclaimer: null,
        });
        setError(errJson.error ?? "Penjelasan AI gagal. Coba lagi.");
        setStep("result");
        return;
      }

      const data = await res.json() as ExplainApiResponse;
      setResult({
        energyKcal:   data.energyKcal,
        proteinG:     data.proteinG,
        fatG:         data.fatG,
        carbG:        data.carbG,
        fiberG:       data.fiberG,
        portionG:     data.portionG,
        portionLabel: label,
        dataSource:   "Estimasi AI",
        dataStatus:   "ai_estimate",
        isEstimate:   true,
        assumptions:  data.assumptions,
        foodName:     data.foodName,
        energyRange:  data.energyRange,
        aiSections:   data.sections,
        aiDisclaimer: data.disclaimer,
      });
      setStep("result");
    } catch (e) {
      console.error("[FoodScannerModal] explain fetch exception:", e);
      setResult({
        energyKcal:   null,
        proteinG:     null,
        fatG:         null,
        carbG:        null,
        fiberG:       null,
        portionG:     g,
        portionLabel: label,
        dataSource:   "—",
        dataStatus:   "unavailable",
        isEstimate:   false,
        assumptions:  "Tidak dapat menghubungi server untuk penjelasan AI.",
        foodName:     candidate.namePrimary,
        energyRange:  null,
        aiSections:   null,
        aiDisclaimer: null,
      });
      setError("Tidak dapat menghubungi server. Periksa koneksi internet.");
      setStep("result");
    }
  }

  // ── Portion confirmation ────────────────────────────────────────────────────

  async function handleConfirmPortion() {
    if (!selectedCandidate) return;
    const g = customPortion ? parseFloat(customPortion) : portionG;
    if (!g || g <= 0 || g > 5000) {
      setError("Masukkan berat porsi yang valid (1–5000 g).");
      return;
    }
    setError("");
    const label = customPortion ? `${g} g (dimasukkan manual)` : portionLabel;
    await resolveNutrition(selectedCandidate, g, label);
  }

  // ── Retry AI explain (without re-scanning) ──────────────────────────────────

  async function handleRetryExplain() {
    const ctx = lastPortionForRetry.current;
    if (!ctx) return;
    setError("");
    await callExplainApi(ctx.candidate, ctx.g, ctx.label);
  }

  // ── Save result ──────────────────────────────────────────────────────────────

  async function handleSave() {
    if (!result || !selectedCandidate || !isLoggedIn) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/food-scanner/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recognizedFoodId:   selectedCandidate.foodId,
          recognizedFoodName: result.foodName,
          candidatesJson:     candidates,
          portionG:           result.portionG,
          portionLabel:       result.portionLabel,
          confidenceNote:     selectedCandidate.confidence,
          modelUsed:          "gemini-flash-lite-latest",
          // AI estimate fields — included when dataStatus is ai_estimate
          dataStatus:         result.dataStatus,
          energyRange:        result.energyRange,
          estimatedFiberG:    result.fiberG,
          explanationJson:    result.aiSections
            ? {
                sections:    result.aiSections,
                assumptions: result.assumptions,
                disclaimer:  result.aiDisclaimer,
              }
            : null,
          estimatedEnergyKcal: result.energyKcal,
          estimatedProteinG:   result.proteinG,
          estimatedFatG:       result.fatG,
          estimatedCarbG:      result.carbG,
          dataSourceUsed:      result.dataSource,
          assumptions:         result.assumptions,
        }),
      });
      const json = await res.json() as { id?: string; error?: string };
      if (!res.ok || json.error) {
        setError(json.error ?? "Gagal menyimpan.");
      } else {
        setSavedId(json.id ?? "");
        // Record EXP (fire-and-forget, only for DB saves)
        if (json.id) {
          fetch("/api/user/activity", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              activityType:   "scan_save",
              activityLabel:  `Scan: ${result.foodName}`,
              idempotencyKey: `scan_save:${json.id}`,
              sourceRef:      json.id,
            }),
          }).catch(() => {/* non-fatal */});
        }
        setStep("done");
      }
    } catch {
      setError("Tidak dapat menghubungi server.");
    } finally {
      setSaving(false);
    }
  }

  // ── Reset ────────────────────────────────────────────────────────────────────

  function handleReset() {
    setStep("idle");
    setPreviewUrl(null);
    setCandidates([]);
    setSelectedCandidate(null);
    setResult(null);
    setError("");
    setSavedId("");
    setOpenSection(null);
    lastPortionForRetry.current = null;
    if (fileInputRef.current)   fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[#006c49] text-[22px]">
              document_scanner
            </span>
            <div>
              <p className="text-sm font-bold text-slate-800">AI Food Scanner</p>
              <p className="text-[10px] text-slate-400 leading-tight">Prototype • Estimasi Edukatif</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Tutup scanner"
          >
            <span className="material-symbols-outlined text-[20px] text-slate-500">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">

          {/* Error banner */}
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
              <span className="material-symbols-outlined text-[16px] shrink-0 mt-0.5">error</span>
              <span>{error}</span>
            </div>
          )}

          {/* ── STEP: idle ─────────────────────────────────────────────── */}
          {step === "idle" && (
            <div className="flex flex-col gap-4">
              {/* Drop zone */}
              <div
                className="border-2 border-dashed border-[--color-outline-variant] rounded-xl p-6 flex flex-col items-center gap-3 cursor-pointer hover:border-[#006c49] hover:bg-emerald-50/30 transition-all group"
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
              >
                <span className="material-symbols-outlined text-[40px] text-slate-300 group-hover:text-[#006c49] transition-colors">
                  add_photo_alternate
                </span>
                <div className="text-center">
                  <p className="text-sm font-semibold text-slate-700">Unggah foto makanan</p>
                  <p className="text-xs text-slate-400 mt-0.5">JPEG, PNG, WebP · Maks. 4 MB</p>
                  <p className="text-xs text-slate-400 hidden sm:block">atau seret &amp; lepas di sini</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  className="py-2.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <span className="material-symbols-outlined text-[16px] text-slate-500">photo_library</span>
                  Pilih dari Galeri
                </button>
                <button
                  type="button"
                  className="py-2.5 px-3 rounded-xl bg-[#006c49] hover:bg-[#005a3c] text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                  onClick={() => cameraInputRef.current?.click()}
                >
                  <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                  Buka Kamera
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileInputChange}
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                capture="environment"
                className="hidden"
                onChange={handleFileInputChange}
              />

              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-800 leading-relaxed">
                <span className="font-semibold">⚠ Catatan prototype:</span>{" "}
                AI hanya menganalisis tampilan visual. Berat, bahan, dan kandungan gizi tidak dapat
                diketahui dari foto — semua nilai adalah <em>estimasi edukatif</em> berdasarkan data
                referensi TKPI-2017 atau pengetahuan umum AI. Bukan pengganti saran ahli gizi.
              </div>
            </div>
          )}

          {/* ── STEP: analyzing ────────────────────────────────────────── */}
          {step === "analyzing" && (
            <div className="flex flex-col items-center gap-4 py-8">
              {previewUrl && (
                <div className="w-40 h-40 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previewUrl} alt="Preview makanan" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 rounded-full border-4 border-[#006c49] border-t-transparent animate-spin" />
                <p className="text-sm font-semibold text-slate-700">Menganalisis gambar…</p>
                <p className="text-xs text-slate-400">Model AI sedang mengenali makanan</p>
              </div>
            </div>
          )}

          {/* ── STEP: loadingNutrition ─────────────────────────────────── */}
          {step === "loadingNutrition" && (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="w-8 h-8 rounded-full border-4 border-[#006c49] border-t-transparent animate-spin" />
              <p className="text-sm font-semibold text-slate-700">Mencari informasi gizi…</p>
              <p className="text-xs text-slate-400 text-center">
                Memeriksa database TKPI &amp; USDA, lalu meminta penjelasan AI jika diperlukan.
              </p>
            </div>
          )}

          {/* ── STEP: candidates — image quality issues ─────────────────── */}
          {step === "candidates" && imageQuality !== "ok" && (
            <div className="flex flex-col items-center gap-4 py-4">
              {previewUrl && (
                <div className="w-40 h-40 rounded-xl overflow-hidden border border-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex flex-col gap-2 w-full">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-500 text-[20px]">
                    {imageQuality === "not_food" ? "no_food" : "camera_enhance"}
                  </span>
                  <p className="text-sm font-semibold text-amber-800">
                    {imageQuality === "not_food" ? "Bukan makanan" : "Foto kurang jelas"}
                  </p>
                </div>
                <p className="text-xs text-amber-700">{qualityMessage}</p>
              </div>
              <button
                onClick={handleReset}
                className="px-4 py-2 rounded-lg bg-[#006c49] text-white text-xs font-semibold hover:bg-[#005a3c] transition-colors flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[15px]">refresh</span>
                Coba Foto Ulang
              </button>
              <button onClick={() => { handleReset(); }} className="text-xs text-slate-400 underline underline-offset-2">
                Pilih makanan manual
              </button>
            </div>
          )}

          {/* ── STEP: candidates — ok, show list ───────────────────────── */}
          {step === "candidates" && imageQuality === "ok" && (
            <div className="flex flex-col gap-3">
              {previewUrl && (
                <div className="w-full h-36 rounded-xl overflow-hidden border border-slate-100 shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previewUrl} alt="Preview makanan" className="w-full h-full object-cover" />
                </div>
              )}

              <p className="text-sm font-semibold text-slate-800">Pilih makanan yang tepat:</p>
              <p className="text-xs text-slate-400 -mt-1">
                AI mengusulkan kandidat berdasarkan tampilan. Pilih yang paling sesuai atau koreksi jika salah.
              </p>

              {candidates.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 text-center">
                  AI tidak dapat mengenali makanan dari foto ini.
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {candidates.map((c, i) => (
                    <button
                      key={i}
                      onClick={() => handleSelectCandidate(c)}
                      className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:border-[#006c49] hover:bg-emerald-50/30 transition-all text-left group"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-slate-800 group-hover:text-[#006c49] transition-colors">
                            {c.namePrimary}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${CONFIDENCE_COLOR[c.confidence]}`}>
                            {CONFIDENCE_LABEL[c.confidence]}
                          </span>
                          {!c.foodId && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-50 text-blue-600 border border-blue-200">
                              akan dianalisis AI
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{c.reason}</p>
                      </div>
                      <span className="material-symbols-outlined text-slate-300 group-hover:text-[#006c49] text-[18px] shrink-0 mt-1 transition-colors">
                        chevron_right
                      </span>
                    </button>
                  ))}
                </div>
              )}

              <ManualFoodSearch onSelect={handleSelectCandidate} />

              <button
                onClick={handleReset}
                className="text-xs text-slate-400 underline underline-offset-2 self-center mt-1"
              >
                Coba foto lain
              </button>
            </div>
          )}

          {/* ── STEP: portion ──────────────────────────────────────────── */}
          {step === "portion" && selectedCandidate && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="material-symbols-outlined text-[#006c49] text-[20px]">check_circle</span>
                <div>
                  <p className="text-xs text-slate-500">Makanan dipilih:</p>
                  <p className="text-sm font-bold text-slate-800">{selectedCandidate.namePrimary}</p>
                  {!selectedCandidate.foodId && (
                    <p className="text-[10px] text-blue-600 mt-0.5">✦ Akan dianalisis menggunakan AI</p>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <p className="text-sm font-semibold text-slate-700">Berapa porsinya?</p>
                <p className="text-xs text-slate-400">
                  AI tidak dapat mengukur berat dari foto. Pilih estimasi atau masukkan berat sendiri.
                </p>

                {selectedCandidate.foodId && (() => {
                  const food = getFoodById(selectedCandidate.foodId!);
                  if (!food) return null;
                  const opts = [
                    { label: `½ porsi (${Math.round(food.typicalPortionG * 0.5)} g)`, g: Math.round(food.typicalPortionG * 0.5) },
                    { label: `${food.typicalPortionLabel}`,                            g: food.typicalPortionG },
                    { label: `2× porsi (${Math.round(food.typicalPortionG * 2)} g)`,  g: Math.round(food.typicalPortionG * 2) },
                  ];
                  return (
                    <div className="flex flex-col gap-1.5">
                      {opts.map((opt) => (
                        <button
                          key={opt.g}
                          onClick={() => { setPortionG(opt.g); setPortionLabel(opt.label); setCustomPortion(""); }}
                          className={`flex items-center justify-between p-2.5 rounded-lg border text-xs font-medium transition-all ${
                            portionG === opt.g && !customPortion
                              ? "border-[#006c49] bg-emerald-50 text-[#006c49]"
                              : "border-slate-200 hover:border-[#006c49]/50 text-slate-700"
                          }`}
                        >
                          <span>{opt.label}</span>
                          {portionG === opt.g && !customPortion && (
                            <span className="material-symbols-outlined text-[16px]">check</span>
                          )}
                        </button>
                      ))}
                    </div>
                  );
                })()}

                {/* For foods without foodId, show common portion shortcuts */}
                {!selectedCandidate.foodId && (
                  <div className="flex flex-wrap gap-1.5">
                    {[50, 100, 150, 200, 300].map((g) => (
                      <button
                        key={g}
                        onClick={() => { setPortionG(g); setPortionLabel(`${g} g`); setCustomPortion(""); }}
                        className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                          portionG === g && !customPortion
                            ? "border-[#006c49] bg-emerald-50 text-[#006c49]"
                            : "border-slate-200 text-slate-700 hover:border-[#006c49]/50"
                        }`}
                      >
                        {g} g
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="number"
                    min="1"
                    max="5000"
                    placeholder="Berat lain (gram)"
                    value={customPortion}
                    onChange={(e) => setCustomPortion(e.target.value)}
                    className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#006c49] focus:ring-2 focus:ring-[#006c49]/20 transition-all"
                  />
                  <span className="text-xs text-slate-400 shrink-0">gram</span>
                </div>
              </div>

              <button
                onClick={handleConfirmPortion}
                className="py-2.5 px-4 rounded-xl bg-[#006c49] text-white text-sm font-semibold hover:bg-[#005a3c] transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">calculate</span>
                Hitung Estimasi Nutrisi
              </button>
            </div>
          )}

          {/* ── STEP: result ────────────────────────────────────────────── */}
          {step === "result" && result && (
            <div className="flex flex-col gap-4">
              {/* Food identity header */}
              <div className="flex items-start gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="material-symbols-outlined text-[#006c49] text-[20px] shrink-0">restaurant</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-500">Hasil analisis untuk:</p>
                  <p className="text-sm font-bold text-slate-800">{result.foodName}</p>
                  <p className="text-[11px] text-slate-500">{result.portionLabel}</p>
                  {/* Data source badge */}
                  <div className="mt-1">
                    {result.dataStatus === "database_verified" ? (
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border ${
                        result.dataSource === "TKPI-2017"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-blue-50 text-blue-700 border-blue-200"
                      }`}>
                        ✓ {result.dataSource === "TKPI-2017" ? "TKPI-2017 Verified" : "USDA FDC Verified"}
                      </span>
                    ) : result.dataStatus === "ai_estimate" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border bg-blue-50 text-blue-700 border-blue-200">
                        ✦ Estimasi AI — bukan data terverifikasi
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border bg-slate-50 text-slate-500 border-slate-200">
                        ⚠ Data tidak tersedia
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Nutrition tiles (DB verified or AI estimate with values) ── */}
              {result.dataStatus !== "unavailable" && (
                result.energyKcal != null || result.proteinG != null || result.fatG != null || result.carbG != null
              ) && (
                <div className="grid grid-cols-2 gap-2">
                  <NutrientTile
                    label="Energi"
                    value={result.energyRange
                      ? result.energyRange
                      : result.energyKcal != null
                        ? `${result.energyKcal} kkal`
                        : "—"}
                    accent="emerald"
                    isEstimate={result.dataStatus === "ai_estimate"}
                  />
                  <NutrientTile label="Protein"       value={result.proteinG != null ? `${result.proteinG} g` : "—"}  accent="blue"   isEstimate={result.dataStatus === "ai_estimate"} />
                  <NutrientTile label="Lemak"         value={result.fatG    != null ? `${result.fatG} g`     : "—"}   accent="orange" isEstimate={result.dataStatus === "ai_estimate"} />
                  <NutrientTile label="Karbohidrat"   value={result.carbG   != null ? `${result.carbG} g`    : "—"}   accent="violet" isEstimate={result.dataStatus === "ai_estimate"} />
                  {result.fiberG != null && (
                    <NutrientTile label="Serat" value={`${result.fiberG} g`} accent="slate" isEstimate={result.dataStatus === "ai_estimate"} />
                  )}
                </div>
              )}

              {/* ── AI estimate: unavailable state with retry ── */}
              {result.dataStatus === "unavailable" && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-400 text-[20px]">cloud_off</span>
                    <p className="text-sm font-semibold text-slate-700">Penjelasan AI belum berhasil dibuat</p>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {result.assumptions || "Layanan AI tidak merespons. Ini mungkin terjadi karena beban server tinggi atau koneksi internet terganggu."}
                  </p>
                  <button
                    onClick={handleRetryExplain}
                    className="self-start px-3 py-1.5 rounded-lg bg-[#006c49] text-white text-xs font-semibold hover:bg-[#005a3c] transition-colors flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[15px]">refresh</span>
                    Coba Lagi Penjelasan AI
                  </button>
                </div>
              )}

              {/* ── AI estimate: 7-section accordion ── */}
              {result.dataStatus === "ai_estimate" && result.aiSections && (
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="material-symbols-outlined text-blue-600 text-[15px]">auto_awesome</span>
                    <p className="text-xs font-bold text-slate-700">Laporan Edukatif AI (7 Bagian)</p>
                  </div>
                  {SECTION_LABELS.map((s) => {
                    const content = result.aiSections![s.key];
                    const isOpen = openSection === s.key;
                    return (
                      <div key={s.key} className="rounded-xl border border-slate-200 overflow-hidden">
                        <button
                          onClick={() => setOpenSection(isOpen ? null : s.key)}
                          className="w-full flex items-center justify-between px-3 py-2.5 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
                        >
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#006c49] text-[16px]">{s.icon}</span>
                            <span className="text-xs font-semibold text-slate-700">{s.label}</span>
                          </div>
                          <span className="material-symbols-outlined text-slate-400 text-[18px]">
                            {isOpen ? "expand_less" : "expand_more"}
                          </span>
                        </button>
                        {isOpen && (
                          <div className="px-3 py-3 text-[12px] text-slate-600 leading-relaxed bg-white border-t border-slate-100">
                            {content}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ── Assumptions & source panel ── */}
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-amber-500 text-[15px]">info</span>
                  <p className="text-[11px] font-semibold text-amber-800">Asumsi &amp; Sumber Data</p>
                </div>
                <p className="text-[11px] text-amber-700 leading-relaxed">{result.assumptions}</p>
                {result.dataStatus === "database_verified" && (
                  <p className="text-[10px] text-amber-600 font-medium">
                    Sumber: {result.dataSource === "TKPI-2017"
                      ? "Tabel Komposisi Pangan Indonesia 2017, Kemenkes RI"
                      : result.dataSource === "USDA-FDC"
                      ? "USDA FoodData Central (SR Legacy)"
                      : result.dataSource}
                  </p>
                )}
              </div>

              {/* ── AI disclaimer ── */}
              {result.aiDisclaimer && (
                <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-[10px] text-blue-700 leading-relaxed">
                  <span className="font-semibold">⚠ Disclaimer AI: </span>{result.aiDisclaimer}
                </div>
              )}

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[10px] text-slate-500 leading-relaxed text-center">
                Nilai ini adalah <strong>estimasi edukatif</strong>, bukan pengukuran aktual.
                Tidak dapat digunakan untuk diagnosis atau pengelolaan kondisi medis.
              </div>

              {/* Save / guest notice */}
              {result.dataStatus !== "unavailable" && (
                isLoggedIn ? (
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="py-2.5 px-4 rounded-xl bg-[#006c49] text-white text-sm font-semibold hover:bg-[#005a3c] transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {saving ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span className="material-symbols-outlined text-[18px]">bookmark</span>
                    )}
                    {saving ? "Menyimpan…" : "Simpan ke Riwayat"}
                  </button>
                ) : (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 text-center">
                    <span className="font-medium text-slate-700">Login</span> untuk menyimpan hasil scan ke riwayatmu.
                  </div>
                )
              )}

              <button
                onClick={handleReset}
                className="py-2 text-xs text-slate-400 underline underline-offset-2"
              >
                Scan makanan lain
              </button>
            </div>
          )}

          {/* ── STEP: done ──────────────────────────────────────────────── */}
          {step === "done" && (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-[32px] text-[#006c49]">check_circle</span>
              </div>
              <p className="text-sm font-bold text-slate-800">Tersimpan!</p>
              <p className="text-xs text-slate-400 text-center">
                Hasil scan telah disimpan ke riwayatmu.{savedId && ` (ID: ${savedId.slice(0, 8)}…)`}
              </p>
              <button
                onClick={handleReset}
                className="px-4 py-2 rounded-lg bg-[#006c49] text-white text-xs font-semibold hover:bg-[#005a3c] transition-colors"
              >
                Scan Makanan Lain
              </button>
              <button onClick={onClose} className="text-xs text-slate-400 underline underline-offset-2">
                Selesai
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── NutrientTile ─────────────────────────────────────────────────────────────

function NutrientTile({
  label,
  value,
  accent,
  isEstimate = false,
}: {
  label: string;
  value: string;
  accent: "emerald" | "blue" | "orange" | "violet" | "slate";
  isEstimate?: boolean;
}) {
  const colors: Record<string, string> = {
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-700",
    blue:    "bg-blue-50   border-blue-200   text-blue-700",
    orange:  "bg-orange-50 border-orange-200 text-orange-700",
    violet:  "bg-violet-50 border-violet-200 text-violet-700",
    slate:   "bg-slate-50  border-slate-200  text-slate-600",
  };
  return (
    <div className={`p-3 rounded-xl border flex flex-col gap-0.5 ${colors[accent]}`}>
      <span className="text-[10px] font-medium uppercase tracking-wide opacity-70">{label}</span>
      <span className="text-sm font-bold leading-tight">{value}</span>
      {isEstimate && <span className="text-[9px] opacity-60">estimasi AI</span>}
    </div>
  );
}

// ── ManualFoodSearch ──────────────────────────────────────────────────────────

function ManualFoodSearch({ onSelect }: { onSelect: (c: Candidate) => void }) {
  const [query,   setQuery]   = useState("");
  const [results, setResults] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/food-scanner/nutrition?foodId=${encodeURIComponent(query.trim())}&portionG=100`
      );
      if (res.ok) {
        const data = await res.json() as { foodId: string; namePrimary: string };
        setResults([{ foodId: data.foodId, namePrimary: data.namePrimary, confidence: "high", reason: "Dipilih manual dari database" }]);
      } else {
        // Not found — allow user to use name as AI-only candidate
        setResults([{ foodId: null, namePrimary: query.trim(), confidence: "low", reason: "Tidak ada di database — akan dianalisis menggunakan AI" }]);
      }
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border-t border-slate-100 pt-3 mt-1 flex flex-col gap-2">
      <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Atau cari manual:</p>
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          placeholder="Ketik nama makanan…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 text-xs rounded-lg border border-slate-200 px-2.5 py-1.5 outline-none focus:border-[#006c49] transition-all"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-3 py-1.5 rounded-lg bg-slate-700 text-white text-xs font-semibold hover:bg-slate-800 transition-colors disabled:opacity-50"
        >
          {loading ? "…" : "Cari"}
        </button>
      </form>
      {results.map((r, i) => (
        <button
          key={i}
          onClick={() => { onSelect(r); setResults([]); setQuery(""); }}
          className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:border-[#006c49] text-left transition-all"
        >
          <div>
            <p className="text-xs font-semibold text-slate-700">{r.namePrimary}</p>
            <p className="text-[10px] text-slate-400">{r.reason}</p>
          </div>
          <span className="material-symbols-outlined text-slate-400 text-[16px]">chevron_right</span>
        </button>
      ))}
    </div>
  );
}
