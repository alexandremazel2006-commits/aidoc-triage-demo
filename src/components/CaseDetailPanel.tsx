"use client";

import { AnimatePresence, motion } from "framer-motion";

import { formatArrival } from "@/lib/cases";
import type { AnalyzedCase } from "@/lib/types";

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
                Détail du cas
              </h2>
              <button
                onClick={onClose}
                className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                aria-label="Fermer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-5 px-5 py-5">
              <div className="flex items-center gap-4">
                <ScanIllustration
                  kind={data.scanKind}
                  className="h-20 w-20 shrink-0"
                />
                <div>
                  <div className="text-base font-semibold text-slate-900">
                    {data.patientName}{" "}
                    <span className="text-sm font-normal text-slate-400">
                      ({data.age} ans)
                    </span>
                  </div>
                  <div className="text-sm text-slate-500">
                    {data.examType} — {data.bodyPart}
                  </div>
                  <div className="text-xs text-slate-400">
                    Arrivé {formatArrival(data.arrivalOffsetMinutes)}
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">
                  Contexte clinique (fictif)
                </div>
                <p className="text-sm text-slate-700">
                  {data.clinicalContext}
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Score de triage IA
                  </div>
                  {data.triage ? (
                    <UrgencyBadge
                      category={data.triage.category}
                      score={data.triage.urgency_score}
                    />
                  ) : (
                    <span className="text-xs text-slate-400">
                      Pas encore analysé
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
                    Lance le tri IA depuis la worklist pour voir le score et
                    la justification de ce cas.
                  </p>
                )}
              </div>

              <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
                <div className="mb-2 text-xs font-medium uppercase tracking-wide text-blue-800">
                  Radiologue : validation humaine (human-in-the-loop)
                </div>
                <p className="mb-3 text-xs leading-relaxed text-blue-900/80">
                  L&apos;IA ne fait que proposer un ordre de priorité. Le
                  radiologue garde toujours la main : c&apos;est lui qui lit
                  le cas, l&apos;interprète et signe le compte-rendu.
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
                    ✓ Confirmer la priorité
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
                    ✕ Rejeter la priorité
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
