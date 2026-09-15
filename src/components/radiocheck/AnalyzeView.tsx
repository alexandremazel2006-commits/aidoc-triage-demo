"use client";

import { useState } from "react";

import {
  analyzeExam,
  AnalyzeResult,
  RadioCheckApiError,
} from "@/lib/radiocheck-api";

import { PriorityBadge } from "./PriorityBadge";
import { UploadZone } from "./UploadZone";

const RESULTS_PREVIEW_COUNT = 5;

export function AnalyzeView() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [patientId, setPatientId] = useState("");
  const [patientAge, setPatientAge] = useState("");
  const [patientSex, setPatientSex] = useState("");
  const [clinicalIndication, setClinicalIndication] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [showAll, setShowAll] = useState(false);

  function handleFileSelected(selected: File) {
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
    setResult(null);
    setError(null);
  }

  async function handleRunAnalysis() {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const res = await analyzeExam({
        file,
        patientId: patientId || undefined,
        patientAge: patientAge || undefined,
        patientSex: patientSex || undefined,
        clinicalIndication: clinicalIndication || undefined,
      });
      setResult(res);
      setShowAll(false);
    } catch (e) {
      setError(
        e instanceof RadioCheckApiError ? e.message : "Unexpected error during analysis.",
      );
    } finally {
      setLoading(false);
    }
  }

  const visiblePredictions = result
    ? showAll
      ? result.predictions
      : result.predictions.slice(0, RESULTS_PREVIEW_COUNT)
    : [];

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-lg font-semibold text-slate-900">Analyze X-ray</h1>
      <p className="mt-1 text-sm text-slate-500">
        Upload a chest X-ray to run the local AI model. Research &amp;
        educational use only — not intended for clinical diagnosis.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <UploadZone
            onFileSelected={handleFileSelected}
            selectedFile={file}
            previewUrl={previewUrl}
          />

          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Optional details
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Patient ID
                </label>
                <input
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  placeholder="Auto-generated if empty"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Age
                </label>
                <input
                  type="number"
                  value={patientAge}
                  onChange={(e) => setPatientAge(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Sex
                </label>
                <select
                  value={patientSex}
                  onChange={(e) => setPatientSex(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="">—</option>
                  <option value="F">F</option>
                  <option value="M">M</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Clinical indication
                </label>
                <input
                  value={clinicalIndication}
                  onChange={(e) => setClinicalIndication(e.target.value)}
                  placeholder="e.g. Shortness of breath"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleRunAnalysis}
            disabled={!file || loading}
            className="w-full rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Analyzing…" : "Run AI Analysis"}
          </button>

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        <div>
          {result ? (
            <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    {result.patient_id}
                  </div>
                  <div className="text-xs text-slate-400">
                    {result.patient_age ? `${result.patient_age} y/o ` : ""}
                    {result.patient_sex ?? ""}
                    {result.clinical_indication ? ` — ${result.clinical_indication}` : ""}
                  </div>
                </div>
                <PriorityBadge priority={result.priority} />
              </div>

              <p className="text-xs text-slate-400">
                Analysis completed in {result.processing_time_seconds}s ·{" "}
                <span className="italic">
                  AI workflow priority — demonstration only, demo thresholds,
                  not clinically validated.
                </span>
              </p>

              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  AI Findings
                </h3>
                <ul className="space-y-2">
                  {visiblePredictions.map((p) => (
                    <li
                      key={p.condition}
                      className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2 text-sm"
                    >
                      <span className="text-slate-700">{p.condition}</span>
                      <span className="font-medium text-slate-900">
                        AI score: {(p.score * 100).toFixed(0)}%
                      </span>
                    </li>
                  ))}
                </ul>
                {result.predictions.length > RESULTS_PREVIEW_COUNT && (
                  <button
                    onClick={() => setShowAll((v) => !v)}
                    className="mt-3 text-xs font-medium text-blue-600 hover:underline"
                  >
                    {showAll ? "Show top 5 only" : "Show all predictions"}
                  </button>
                )}
              </div>

              <p className="border-t border-slate-100 pt-3 text-[11px] leading-relaxed text-slate-400">
                Scores are raw model confidence outputs, not calibrated
                clinical probabilities. This is a university research
                prototype, not a certified diagnostic device.
              </p>
            </div>
          ) : (
            <div className="flex h-full min-h-64 items-center justify-center rounded-lg border border-dashed border-slate-200 text-sm text-slate-400">
              Results will appear here after analysis.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
