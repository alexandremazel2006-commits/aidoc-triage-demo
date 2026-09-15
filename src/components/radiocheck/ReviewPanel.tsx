"use client";

import { useEffect, useState } from "react";

import {
  getReview,
  RadioCheckApiError,
  ReviewDecision,
  saveReview,
} from "@/lib/radiocheck-api";

const DECISIONS: { value: ReviewDecision; label: string }[] = [
  { value: "confirmed", label: "✓ Confirm AI finding" },
  { value: "rejected", label: "✕ Reject AI finding" },
  { value: "needs_further_review", label: "? Needs further review" },
];

export function ReviewPanel({
  examId,
  onReviewed,
}: {
  examId: string;
  onReviewed?: () => void;
}) {
  const [decision, setDecision] = useState<ReviewDecision | null>(null);
  const [notes, setNotes] = useState("");
  const [reviewedAt, setReviewedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getReview(examId)
      .then((res) => {
        setDecision(res.decision);
        setNotes(res.notes ?? "");
        setReviewedAt(res.reviewed_at);
      })
      .catch((e) =>
        setError(e instanceof RadioCheckApiError ? e.message : "Failed to load review."),
      )
      .finally(() => setLoading(false));
  }, [examId]);

  async function handleSave(chosen: ReviewDecision) {
    setDecision(chosen);
    setSaving(true);
    setError(null);
    try {
      const res = await saveReview(examId, chosen, notes);
      setReviewedAt(res.reviewed_at);
      onReviewed?.();
    } catch (e) {
      setError(e instanceof RadioCheckApiError ? e.message : "Failed to save review.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-blue-800">
          Radiologist Review
        </h2>
        {reviewedAt && (
          <span className="text-[11px] text-blue-700/70">
            Reviewed {new Date(reviewedAt).toLocaleString()}
          </span>
        )}
      </div>

      <p className="mb-3 text-xs leading-relaxed text-blue-900/80">
        The AI only proposes a priority and possible findings. The
        radiologist reads the case and makes the final call.
      </p>

      {error && (
        <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Radiologist notes (optional)"
        rows={2}
        disabled={loading}
        className="mb-3 w-full rounded-md border border-blue-200 bg-white px-3 py-2 text-sm"
      />

      <div className="flex flex-wrap gap-2">
        {DECISIONS.map((d) => (
          <button
            key={d.value}
            onClick={() => handleSave(d.value)}
            disabled={loading || saving}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
              decision === d.value
                ? "bg-blue-700 text-white"
                : "bg-white text-blue-700 ring-1 ring-inset ring-blue-300 hover:bg-blue-100"
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>
    </div>
  );
}
