"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

import { formatArrival } from "@/lib/cases";
import type { AnalyzedCase } from "@/lib/types";

import { ImageLightbox } from "./ImageLightbox";
import { ScanIllustration } from "./ScanIllustration";
import { UrgencyBadge } from "./UrgencyBadge";

export function CaseDetailPanel({
  data,
  onClose,
  onDecision,
}: {
  data: AnalyzedCase | null;
  onClose: () => void;
  onDecision: (decision: "confirmed" | "rejected") => void;
}) {
  const [showLightbox, setShowLightbox] = useState(false);

  // Close the lightbox if the selected case changes underneath it (adjusting
  // state during render, per React's guidance — no effect needed here).
  const [lastCaseId, setLastCaseId] = useState(data?.id);
  if (data?.id !== lastCaseId) {
    setLastCaseId(data?.id);
    setShowLightbox(false);
  }

  return (
    <AnimatePresence>
      {data && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-slate-900/30"
            onClick={onClose}
          />
          <motion.div
            key="panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 340, damping: 36 }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-md overflow-y-auto border-l border-slate-200 bg-white shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h2 className="text-sm font-semibold text-slate-900">
                Case detail
              </h2>
              <button
                onClick={onClose}
                className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="space-y-5 px-5 py-5">
              <div className="flex items-center gap-4">
                <ScanIllustration
                  kind={data.scanKind}
                  image={data.image}
                  className="h-20 w-20 shrink-0"
                  onClick={() => setShowLightbox(true)}
                />
                <div>
                  <div className="text-base font-semibold text-slate-900">
                    {data.patientName}{" "}
                    <span className="text-sm font-normal text-slate-400">
                      ({data.age})
                    </span>
                  </div>
                  <div className="text-sm text-slate-500">
                    {data.examType} — {data.bodyPart}
                  </div>
                  <div className="text-xs text-slate-400">
                    Arrived {formatArrival(data.arrivalOffsetMinutes)}
                  </div>
                  <button
                    onClick={() => setShowLightbox(true)}
                    className="mt-0.5 text-xs text-blue-600 hover:underline"
                  >
                    🔍 Click photo to enlarge
                  </button>
                </div>
              </div>

              {data.attribution && (
                <p className="text-[11px] text-slate-400">
                  Photo: {data.attribution.license} ·{" "}
                  {data.attribution.author} — Wikimedia Commons
                </p>
              )}

              <div>
                <div className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">
                  Clinical context (fictional)
                </div>
                <p className="text-sm text-slate-700">
                  {data.clinicalContext}
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    AI triage score
                  </div>
                  {data.triage ? (
                    <UrgencyBadge
                      category={data.triage.category}
                      score={data.triage.urgency_score}
                    />
                  ) : (
                    <span className="text-xs text-slate-400">
                      Not analyzed yet
                    </span>
                  )}
                </div>
                {data.triage ? (
                  <>
                    <p className="text-sm leading-relaxed text-slate-700">
                      {data.triage.rationale}
                    </p>
                    <p className="mt-3 border-t border-slate-100 pt-3 text-xs italic text-slate-400">
                      {data.triage.disclaimer}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-slate-400">
                    Run the AI triage from the worklist to see this
                    case&apos;s score and rationale.
                  </p>
                )}
              </div>

              <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
                <div className="mb-2 text-xs font-medium uppercase tracking-wide text-blue-800">
                  Radiologist: human validation (human-in-the-loop)
                </div>
                <p className="mb-3 text-xs leading-relaxed text-blue-900/80">
                  The AI only proposes a priority order. The radiologist
                  always stays in control: they read the case, interpret it,
                  and sign the report.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => onDecision("confirmed")}
                    disabled={!data.triage}
                    className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                      data.radiologistDecision === "confirmed"
                        ? "bg-emerald-600 text-white"
                        : "bg-white text-emerald-700 ring-1 ring-inset ring-emerald-300 hover:bg-emerald-50"
                    }`}
                  >
                    ✓ Confirm priority
                  </button>
                  <button
                    onClick={() => onDecision("rejected")}
                    disabled={!data.triage}
                    className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                      data.radiologistDecision === "rejected"
                        ? "bg-slate-700 text-white"
                        : "bg-white text-slate-600 ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    ✕ Reject priority
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          <ImageLightbox
            open={showLightbox}
            image={data.image}
            scanKind={data.scanKind}
            attribution={data.attribution}
            caption={`${data.examType} — ${data.bodyPart}`}
            onClose={() => setShowLightbox(false)}
          />
        </>
      )}
    </AnimatePresence>
  );
}
