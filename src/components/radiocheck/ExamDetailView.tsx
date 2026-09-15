"use client";

import { useEffect, useState } from "react";

import {
  ExamDetail,
  getExam,
  RADIOCHECK_API_BASE_URL,
  RadioCheckApiError,
} from "@/lib/radiocheck-api";

import { GradCamPanel } from "./GradCamPanel";
import { PriorityBadge } from "./PriorityBadge";
import { ReportPanel } from "./ReportPanel";
import { ReviewPanel } from "./ReviewPanel";

const RESULTS_PREVIEW_COUNT = 5;

export function ExamDetailView({ examId }: { examId: string }) {
  const [exam, setExam] = useState<ExamDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  function reload() {
    getExam(examId)
      .then(setExam)
      .catch((e) =>
        setError(e instanceof RadioCheckApiError ? e.message : "Failed to load exam."),
      );
  }

  useEffect(reload, [examId]);

  if (error) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (!exam) {
    return <p className="text-sm text-slate-400">Loading…</p>;
  }

  const visible = showAll
    ? exam.predictions
    : exam.predictions.slice(0, RESULTS_PREVIEW_COUNT);

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">{exam.patient_id}</h1>
          <p className="text-xs text-slate-400">
            {exam.patient_age ? `${exam.patient_age} y/o ` : ""}
            {exam.patient_sex ?? ""}
            {exam.clinical_indication ? ` — ${exam.clinical_indication}` : ""}
          </p>
        </div>
        <PriorityBadge priority={exam.priority} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${RADIOCHECK_API_BASE_URL}${exam.image_url}`}
            alt="Chest X-ray"
            className="w-full rounded-md object-contain"
          />
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-slate-200 bg-white p-4 text-xs text-slate-500">
            <div className="flex justify-between border-b border-slate-100 py-1.5">
              <span>Exam date</span>
              <span>{new Date(exam.created_at).toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 py-1.5">
              <span>Processing time</span>
              <span>{exam.processing_time}s</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span>Review status</span>
              <span>{exam.review_status}</span>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              AI Findings
            </h2>
            <ul className="space-y-2">
              {visible.map((p) => (
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
            {exam.predictions.length > RESULTS_PREVIEW_COUNT && (
              <button
                onClick={() => setShowAll((v) => !v)}
                className="mt-3 text-xs font-medium text-blue-600 hover:underline"
              >
                {showAll ? "Show top 5 only" : "Show all predictions"}
              </button>
            )}
            <p className="mt-3 border-t border-slate-100 pt-3 text-[11px] leading-relaxed text-slate-400">
              Scores are raw model confidence outputs, not calibrated clinical
              probabilities. Priority is a demo workflow label, not
              clinically validated.
            </p>
          </div>

          <ReviewPanel examId={exam.id} onReviewed={reload} />
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <GradCamPanel
          examId={exam.id}
          defaultCondition={exam.predictions[0]?.condition ?? ""}
          conditionOptions={exam.predictions.map((p) => p.condition)}
        />
        <ReportPanel examId={exam.id} />
      </div>
    </div>
  );
}
