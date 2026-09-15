"use client";

import { useEffect, useState } from "react";

import { getHeatmap, HeatmapResult, RadioCheckApiError } from "@/lib/radiocheck-api";

type ViewMode = "Original" | "Heatmap" | "Overlay";

export function GradCamPanel({
  examId,
  defaultCondition,
  conditionOptions,
}: {
  examId: string;
  defaultCondition: string;
  conditionOptions: string[];
}) {
  const [condition, setCondition] = useState(defaultCondition);
  const [viewMode, setViewMode] = useState<ViewMode>("Overlay");
  const [opacity, setOpacity] = useState(60);
  const [data, setData] = useState<HeatmapResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard fetch-on-mount/dependency-change pattern; guarded by `cancelled` below
    setLoading(true);
    setError(null);
    getHeatmap(examId, condition)
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof RadioCheckApiError ? e.message : "Failed to compute heatmap.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [examId, condition]);

  const options = data?.available_conditions ?? conditionOptions;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          AI Heatmap
        </h2>
        <label className="flex items-center gap-2 text-xs text-slate-600">
          Explain:
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className="rounded-md border border-slate-300 px-2 py-1 text-xs"
          >
            {options.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mb-3 flex overflow-hidden rounded-md border border-slate-300 text-xs font-medium">
        {(["Original", "Heatmap", "Overlay"] as ViewMode[]).map((mode) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`flex-1 px-3 py-1.5 ${
              viewMode === mode
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {mode}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}

      {!error && (
        <div className="relative aspect-square w-full overflow-hidden rounded-md bg-slate-900">
          {loading || !data ? (
            <div className="flex h-full items-center justify-center text-xs text-slate-400">
              Computing Grad-CAM…
            </div>
          ) : (
            <>
              {(viewMode === "Original" || viewMode === "Overlay") && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`data:image/png;base64,${data.image_base64}`}
                  alt="Preprocessed chest X-ray"
                  className="absolute inset-0 h-full w-full object-contain"
                />
              )}
              {(viewMode === "Heatmap" || viewMode === "Overlay") && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`data:image/png;base64,${data.heatmap_base64}`}
                  alt={`Grad-CAM heatmap for ${data.condition}`}
                  className="absolute inset-0 h-full w-full object-contain"
                  style={
                    viewMode === "Overlay" ? { opacity: opacity / 100 } : undefined
                  }
                />
              )}
            </>
          )}
        </div>
      )}

      {viewMode === "Overlay" && (
        <div className="mt-3">
          <label className="mb-1 flex justify-between text-xs text-slate-500">
            <span>Heatmap opacity</span>
            <span>{opacity}%</span>
          </label>
          <input
            type="range"
            min={0}
            max={100}
            value={opacity}
            onChange={(e) => setOpacity(Number(e.target.value))}
            className="w-full"
          />
        </div>
      )}

      <p className="mt-3 border-t border-slate-100 pt-3 text-[11px] leading-relaxed text-slate-400">
        Real Grad-CAM, computed from the model&apos;s actual gradients for
        the selected pathology — not a simulated or hand-drawn
        localization. It shows which pixels influenced this specific
        score, not a diagnosis or lesion boundary.
      </p>
    </div>
  );
}
