"use client";

import { useEffect, useState } from "react";

import { getReport, RadioCheckApiError, saveReport } from "@/lib/radiocheck-api";

export function ReportPanel({ examId }: { examId: string }) {
  const [text, setText] = useState("");
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getReport(examId)
      .then((res) => {
        setText(res.edited_text ?? res.draft_text);
        setSavedAt(res.created_at);
      })
      .catch((e) =>
        setError(e instanceof RadioCheckApiError ? e.message : "Failed to load report."),
      )
      .finally(() => setLoading(false));
  }, [examId]);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const res = await saveReport(examId, text);
      setSavedAt(res.created_at);
    } catch (e) {
      setError(e instanceof RadioCheckApiError ? e.message : "Failed to save report.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Draft AI Report
        </h2>
        {savedAt && (
          <span className="text-[11px] text-slate-400">
            Saved {new Date(savedAt).toLocaleString()}
          </span>
        )}
      </div>

      {error && (
        <div className="mb-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-xs text-slate-400">Generating draft…</p>
      ) : (
        <>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={12}
            className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 font-mono text-xs leading-relaxed text-slate-700"
          />
          <div className="mt-3 flex items-center justify-between">
            <p className="text-[11px] leading-relaxed text-slate-400">
              Generated deterministically from model scores only — not
              written by an LLM. Freely editable by the radiologist below.
            </p>
            <button
              onClick={handleSave}
              disabled={saving}
              className="shrink-0 rounded-md bg-blue-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save report"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
