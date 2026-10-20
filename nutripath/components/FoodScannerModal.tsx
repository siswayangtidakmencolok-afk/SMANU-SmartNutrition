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
 * CHANGES (v2):
 *  - generateScanInsights() from nutrition-knowledge-engine integrated in result panel.
 *  - DRI % bars shown for each macronutrient.
 *  - "Laporkan makanan" button in result panel for foodId=null foods.
 *  - foodId=null handled gracefully: clear message + candidate submission offer.
 *
 * LIMITATIONS (displayed to user):
 *  - Vision model can ONLY suggest names based on visual appearance.
 *  - Weight, recipe, hidden ingredients cannot be determined from a photo.
 *  - Nutrition values are ESTIMATIONS from TKPI-2017 / USDA-FDC reference data.
 *  - Guest users' results are NOT saved to the database.
 */

import { useState, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { getFoodById, FOOD_DATABASE } from "@/lib/food-database";
import {
  generateScanInsights,
  SCAN_DISCLAIMER,
  type ScanNutritionSummary,
  type NutritionInsight,
} from "@/lib/nutrition-knowledge-engine";
import type { NutritionApiResponse } from "@/app/api/food-scanner/nutrition/route";

// ── Types ────────────────────────────────────────────────────────────────────

type Step =
  | "idle"
  | "capturing"
  | "analyzing"
  | "candidates"
  | "portion"
  | "result"
  | "done";

interface Candidate {
  foodId: string | null;
  namePrimary: string;
  confidence: "high" | "medium" | "low";
  reason: string;
}

interface NutritionResult {
  energyKcal:  number | null;
  proteinG:    number | null;
  fatG:        number | null;
  carbG:       number | null;
  fiberG:      number | null;
  portionG:    number;
  portionLabel: string;
  isEstimate:  boolean;
  dataSource:  string;
  assumptions: string;
  foodName:    string;
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

const LEVEL_COLOR: Record<string, string> = {
  "Tinggi":         "bg-emerald-500",
  "Sedang":         "bg-amber-400",
  "Rendah":         "bg-slate-300",
  "Tidak diketahui": "bg-slate-200",
};

function fileToBase64(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // result = "data:image/jpeg;base64,<data>"
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
  const [insights, setInsights]           = useState<NutritionInsight[]>([]);
  const [error, setError]                 = useState<string>("");
  const [calculatingNutrition, setCalcNutrition] = useState(false);
  const [saving, setSaving]               = useState(false);
  const [savedId, setSavedId]             = useState<string>("");
  const [reportingCandidate, setReportingCandidate] = useState(false);
  const [candidateReported, setCandidateReported]   = useState(false);

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

  async function handleSelectCandidate(c: Candidate) {
    setSelectedCandidate(c);
    setCandidateReported(false);
    setCustomPortion("");

    // Pre-fill default portion.
    // TKPI foods have typicalPortionG in-memory; USDA foods need an API call.
    const memFood = c.foodId ? getFoodById(c.foodId) : null;
    if (memFood) {
      setPortionG(memFood.typicalPortionG);
      setPortionLabel(memFood.typicalPortionLabel);
    } else if (c.foodId) {
      // USDA record — fetch typical portion from server
      try {
        const res = await fetch(
          `/api/food-scanner/nutrition?foodId=${encodeURIComponent(c.foodId)}&portionG=100`
        );
        if (res.ok) {
          const data = await res.json() as NutritionApiResponse;
          if (data.typicalPortionG) {
            setPortionG(data.typicalPortionG);
            setPortionLabel(data.typicalPortionLabel ?? `${data.typicalPortionG} g`);
          } else {
            setPortionG(100);
            setPortionLabel("perkiraan 100 g");
          }
        } else {
          setPortionG(100);
          setPortionLabel("perkiraan 100 g");
        }
      } catch {
        setPortionG(100);
        setPortionLabel("perkiraan 100 g");
      }
    } else {
      setPortionG(100);
      setPortionLabel("perkiraan 100 g");
    }

    setStep("portion");
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
    const actualPortionLabel = customPortion ? `${g} g (dimasukkan manual)` : portionLabel;

    if (!selectedCandidate.foodId) {
      // Not in any DB — show "not found" result + candidate report option
      setResult({
        energyKcal:   null,
        proteinG:     null,
        fatG:         null,
        carbG:        null,
        fiberG:       null,
        portionG:     g,
        portionLabel: actualPortionLabel,
        isEstimate:   true,
        dataSource:   "—",
        assumptions:
          "Makanan ini belum tersedia dalam database gizi SMANU. " +
          "Informasi nutrisi tidak dapat dihitung saat ini.",
        foodName: selectedCandidate.namePrimary,
      });
      setInsights([]);
      setStep("result");
      return;
    }

    // Fetch nutrition from server (covers both TKPI and USDA-FDC via Neon)
    setCalcNutrition(true);
    try {
      const res = await fetch(
        `/api/food-scanner/nutrition?foodId=${encodeURIComponent(selectedCandidate.foodId)}&portionG=${g}`
      );

      if (res.status === 404) {
        // foodId was returned by scanner but not found in DB on recheck
        setResult({
          energyKcal:   null,
          proteinG:     null,
          fatG:         null,
          carbG:        null,
          fiberG:       null,
          portionG:     g,
          portionLabel: actualPortionLabel,
          isEstimate:   true,
          dataSource:   "—",
          assumptions:
            "Makanan ini tidak ditemukan dalam database gizi SMANU. " +
            "Nilai nutrisi tidak dapat dihitung.",
          foodName: selectedCandidate.namePrimary,
        });
        setInsights([]);
        setStep("result");
        return;
      }

      if (!res.ok) {
        setError("Gagal mengambil data nutrisi. Coba lagi.");
        return;
      }

      const data = await res.json() as NutritionApiResponse;

      const newResult: NutritionResult = {
        energyKcal:   data.energyKcal,
        proteinG:     data.proteinG,
        fatG:         data.fatG,
        carbG:        data.carbG,
        fiberG:       data.fiberG,
        portionG:     data.portionG,
        portionLabel: actualPortionLabel,
        isEstimate:   data.isEstimate,
        dataSource:   data.dataSource,
        assumptions:  data.assumptions,
        foodName:     selectedCandidate.namePrimary,
      };
      setResult(newResult);

      // Generate educational insights — generateScanInsights safely handles nulls
      const summary: ScanNutritionSummary = {
        foodName:     selectedCandidate.namePrimary,
        portionG:     data.portionG,
        portionLabel: actualPortionLabel,
        energyKcal:   data.energyKcal,
        proteinG:     data.proteinG,
        fatG:         data.fatG,
        carbG:        data.carbG,
        fiberG:       data.fiberG,
        dataSource:   data.dataSource,
        isEstimate:   data.isEstimate,
        assumptions:  data.assumptions,
      };
      setInsights(generateScanInsights(summary));
      setStep("result");
    } catch {
      setError("Tidak dapat menghubungi server. Coba lagi.");
    } finally {
      setCalcNutrition(false);
    }
  }

  // ── Report unknown food (candidate submission) ────────────────────────────

  async function handleReportUnknown() {
    if (!selectedCandidate || reportingCandidate || candidateReported) return;
    setReportingCandidate(true);
    try {
      const res = await fetch("/api/food-scanner/candidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          foodNameRaw:        selectedCandidate.namePrimary,
          submissionSource:   "vision_unmatched",
          originalVisionName: selectedCandidate.namePrimary,
          originalConfidence: selectedCandidate.confidence,
        }),
      });
      if (res.ok) {
        setCandidateReported(true);
      } else {
        setError("Gagal melaporkan makanan. Coba lagi.");
      }
    } catch {
      setError("Tidak dapat menghubungi server.");
    } finally {
      setReportingCandidate(false);
    }
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
          recognizedFoodId:    selectedCandidate.foodId,
          recognizedFoodName:  result.foodName,
          candidatesJson:      candidates,
          portionG:            result.portionG,
          portionLabel:        result.portionLabel,
          confidenceNote:      selectedCandidate.confidence,
          modelUsed:           "gemini-flash-lite-latest",
          // Pass pre-computed nutrition so save route doesn't need to re-query
          estimatedEnergyKcal: result.energyKcal,
          estimatedProteinG:   result.proteinG,
          estimatedFatG:       result.fatG,
          estimatedCarbG:      result.carbG,
          dataSourceUsed:      result.dataSource !== "—" ? result.dataSource : undefined,
          assumptions:         result.assumptions,
        }),
      });
      const json = await res.json() as { id?: string; error?: string };
      if (!res.ok || json.error) {
        setError(json.error ?? "Gagal menyimpan.");
      } else {
        setSavedId(json.id ?? "");
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
    setInsights([]);
    setError("");
    setSavedId("");
    setCandidateReported(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
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
              {/* Drop zone — click to open gallery picker */}
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

              {/* Two action buttons — gallery + camera */}
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

              {/* Hidden file inputs */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileInputChange}
              />
              {/* capture="environment" = rear camera on mobile; falls back to file picker on desktop */}
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
                referensi TKPI-2017. Bukan pengganti saran ahli gizi.
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
              <button
                onClick={() => { handleReset(); }}
                className="text-xs text-slate-400 underline underline-offset-2"
              >
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
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-500 border border-slate-200">
                              tidak ada di database
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

              {/* Manual fallback */}
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
                    <p className="text-[10px] text-amber-600 mt-0.5">
                      Makanan ini belum ada di database — estimasi nutrisi tidak tersedia.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <p className="text-sm font-semibold text-slate-700">Berapa porsinya?</p>
                <p className="text-xs text-slate-400">
                  AI tidak dapat mengukur berat dari foto. Pilih estimasi atau masukkan berat sendiri.
                </p>

                {/* Quick portion options */}
                {selectedCandidate.foodId && (() => {
                  const food = getFoodById(selectedCandidate.foodId!);
                  if (!food) return null;
                  const opts = [
                    { label: `½ porsi (${Math.round(food.typicalPortionG * 0.5)} g)`, g: Math.round(food.typicalPortionG * 0.5) },
                    { label: `${food.typicalPortionLabel}`, g: food.typicalPortionG },
                    { label: `2× porsi (${Math.round(food.typicalPortionG * 2)} g)`, g: Math.round(food.typicalPortionG * 2) },
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

                {/* Custom input */}
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
                disabled={calculatingNutrition}
                className="py-2.5 px-4 rounded-xl bg-[#006c49] text-white text-sm font-semibold hover:bg-[#005a3c] transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {calculatingNutrition ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span className="material-symbols-outlined text-[18px]">calculate</span>
                )}
                {calculatingNutrition
                  ? "Mengambil data nutrisi…"
                  : selectedCandidate.foodId
                    ? "Hitung Estimasi Nutrisi"
                    : "Lihat Info & Lanjutkan"}
              </button>
            </div>
          )}

          {/* ── STEP: result ────────────────────────────────────────────── */}
          {step === "result" && result && (
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="material-symbols-outlined text-[#006c49] text-[20px] shrink-0">restaurant</span>
                <div>
                  <p className="text-xs text-slate-500">Hasil analisis untuk:</p>
                  <p className="text-sm font-bold text-slate-800">{result.foodName}</p>
                  <p className="text-[11px] text-slate-500">{result.portionLabel}</p>
                </div>
              </div>

              {result.dataSource === "—" ? (
                /* ── Not in DB — clear message + candidate report ─────── */
                <div className="flex flex-col gap-3">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-slate-400 text-[20px]">
                        help_outline
                      </span>
                      <p className="text-sm font-semibold text-slate-700">
                        Belum ada di database gizi SMANU
                      </p>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Makanan <strong>{result.foodName}</strong> belum tersedia dalam database referensi
                      (TKPI-2017 maupun USDA-FDC). Nilai nutrisi tidak dapat dihitung saat ini.
                    </p>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Kamu bisa melaporkannya agar tim SMANU dapat menambahkannya ke database di masa mendatang.
                    </p>
                  </div>

                  {/* Report unknown food button */}
                  {!candidateReported ? (
                    <button
                      onClick={handleReportUnknown}
                      disabled={reportingCandidate}
                      className="py-2.5 px-4 rounded-xl border border-[#006c49] text-[#006c49] text-sm font-semibold hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {reportingCandidate ? (
                        <span className="w-4 h-4 border-2 border-[#006c49] border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <span className="material-symbols-outlined text-[18px]">add_circle</span>
                      )}
                      {reportingCandidate ? "Melaporkan…" : "Laporkan Makanan Ini"}
                    </button>
                  ) : (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2">
                      <span className="material-symbols-outlined text-emerald-600 text-[18px]">check_circle</span>
                      <p className="text-xs text-emerald-700 font-medium">
                        Terima kasih! Laporan diterima. Tim SMANU akan meninjau{" "}
                        <strong>{result.foodName}</strong>.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                /* ── Has nutrition data — macros + insight bars ──────── */
                <div className="flex flex-col gap-3">
                  {/* Macro grid — null values shown as "—" (partial USDA data) */}
                  <div className="grid grid-cols-2 gap-2">
                    <NutrientTile
                      label="Energi"
                      value={result.energyKcal != null ? `${result.energyKcal} kkal` : "—"}
                      accent="emerald"
                      unavailable={result.energyKcal == null}
                    />
                    <NutrientTile
                      label="Protein"
                      value={result.proteinG != null ? `${result.proteinG} g` : "—"}
                      accent="blue"
                      unavailable={result.proteinG == null}
                    />
                    <NutrientTile
                      label="Lemak"
                      value={result.fatG != null ? `${result.fatG} g` : "—"}
                      accent="orange"
                      unavailable={result.fatG == null}
                    />
                    <NutrientTile
                      label="Karbohidrat"
                      value={result.carbG != null ? `${result.carbG} g` : "—"}
                      accent="violet"
                      unavailable={result.carbG == null}
                    />
                    {result.fiberG != null && (
                      <NutrientTile label="Serat" value={`${result.fiberG} g`} accent="slate" />
                    )}
                  </div>
                  {/* Note if any macros are missing */}
                  {(result.energyKcal == null || result.proteinG == null ||
                    result.fatG == null || result.carbG == null) && (
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      "—" menunjukkan data tidak tersedia dalam sumber {result.dataSource}.
                      USDA Foundation Foods mengukur nutrisi secara selektif.
                    </p>
                  )}

                  {/* DRI insight bars */}
                  {insights.length > 0 && (
                    <div className="flex flex-col gap-0">
                      <p className="text-[11px] font-semibold text-slate-600 mb-1.5">
                        Kontribusi terhadap kebutuhan harian (AKG remaja ~15 th):
                      </p>
                      <div className="flex flex-col gap-2">
                        {insights.map((ins) => (
                          <InsightBar key={ins.nutrient} insight={ins} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Assumptions & data source */}
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-amber-500 text-[15px]">info</span>
                  <p className="text-[11px] font-semibold text-amber-800">Asumsi &amp; Sumber Data</p>
                </div>
                <p className="text-[11px] text-amber-700 leading-relaxed">{result.assumptions}</p>
                {result.dataSource !== "—" && (
                  <p className="text-[10px] text-amber-600 font-medium">
                    Sumber: {result.dataSource === "TKPI-2017"
                      ? "Tabel Komposisi Pangan Indonesia 2017, Kemenkes RI"
                      : result.dataSource === "USDA-FDC"
                      ? "USDA FoodData Central (Foundation Foods)"
                      : "Estimasi — tidak ada data terverifikasi"}
                  </p>
                )}
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[10px] text-slate-500 leading-relaxed text-center">
                {SCAN_DISCLAIMER}
              </div>

              {/* Save / guest notice */}
              {result.dataSource !== "—" && (
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

// ── Sub-components ────────────────────────────────────────────────────────────

const ACCENT_MAP: Record<string, string> = {
  emerald: "bg-emerald-50 border-emerald-100 text-emerald-800",
  blue:    "bg-blue-50 border-blue-100 text-blue-800",
  orange:  "bg-orange-50 border-orange-100 text-orange-800",
  violet:  "bg-violet-50 border-violet-100 text-violet-800",
  slate:   "bg-slate-50 border-slate-200 text-slate-700",
};

function NutrientTile({
  label,
  value,
  accent,
  unavailable = false,
}: {
  label:        string;
  value:        string;
  accent:       string;
  unavailable?: boolean;
}) {
  const cls = unavailable
    ? "bg-slate-50 border-slate-200 text-slate-400"
    : (ACCENT_MAP[accent] ?? ACCENT_MAP.slate);
  return (
    <div className={`rounded-xl border p-3 flex flex-col gap-0.5 ${cls}`}>
      <p className="text-[10px] font-medium opacity-70">{label}</p>
      <p className={`text-base font-bold leading-tight ${unavailable ? "text-slate-300" : ""}`}>
        {value}
      </p>
    </div>
  );
}

/**
 * DRI insight bar — shows nutrient name, insight text, and a progress bar.
 */
function InsightBar({ insight }: { insight: NutritionInsight }) {
  const barWidth = insight.driPct !== null ? Math.min(insight.driPct, 100) : 0;
  const barColor = LEVEL_COLOR[insight.level] ?? "bg-slate-300";

  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold text-slate-700">{insight.nutrient}</p>
        <span className="text-[10px] text-slate-400 shrink-0">
          {insight.driPct !== null ? `${insight.driPct}% AKG` : "—"}
        </span>
      </div>
      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${barWidth}%` }}
        />
      </div>
      <p className="text-[10px] text-slate-500 leading-relaxed">{insight.insight}</p>
    </div>
  );
}

function ManualFoodSearch({ onSelect }: { onSelect: (c: Candidate) => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<typeof FOOD_DATABASE>([]);
  const [open, setOpen] = useState(false);

  function handleSearch(q: string) {
    setQuery(q);
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    const lower = q.toLowerCase();
    setResults(
      FOOD_DATABASE.filter(
        (f) =>
          f.namePrimary.toLowerCase().includes(lower) ||
          f.nameAliases.some((a) => a.toLowerCase().includes(lower))
      ).slice(0, 6)
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-xs text-[#006c49] font-medium self-start"
      >
        <span className="material-symbols-outlined text-[15px]">search</span>
        Cari makanan secara manual
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2 border border-slate-200 rounded-xl p-3">
      <p className="text-xs font-semibold text-slate-700">Cari nama makanan:</p>
      <input
        autoFocus
        type="text"
        placeholder="mis. nasi putih, tempe goreng…"
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#006c49] focus:ring-2 focus:ring-[#006c49]/20"
      />
      {results.length > 0 && (
        <div className="flex flex-col gap-1">
          {results.map((f) => (
            <button
              key={f.foodId}
              onClick={() =>
                onSelect({
                  foodId:      f.foodId,
                  namePrimary: f.namePrimary,
                  confidence:  "high",
                  reason:      "Dipilih manual dari database",
                })
              }
              className="text-left px-3 py-2 rounded-lg hover:bg-emerald-50 hover:text-[#006c49] text-xs text-slate-700 transition-colors"
            >
              {f.namePrimary}
              <span className="text-slate-400 ml-1">— {f.category}</span>
            </button>
          ))}
        </div>
      )}
      {query.length >= 2 && results.length === 0 && (
        <p className="text-[11px] text-slate-400 text-center py-1">
          Tidak ditemukan dalam database lokal.
        </p>
      )}
      <button
        onClick={() => { setOpen(false); setQuery(""); setResults([]); }}
        className="text-[11px] text-slate-400 underline underline-offset-2 self-end"
      >
        Tutup
      </button>
    </div>
  );
}
