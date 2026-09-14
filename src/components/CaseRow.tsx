"use client";

import { motion } from "framer-motion";

import { formatArrival } from "@/lib/cases";
import type { AnalyzedCase } from "@/lib/types";

import { ScanIllustration } from "./ScanIllustration";
import { UrgencyBadge } from "./UrgencyBadge";

export function CaseRow({
  data,
  rank,
  rankDelta,
  onClick,
}: {
  data: AnalyzedCase;
  rank: number;
  rankDelta?: number;
  onClick: () => void;
}) {
  return (
    <motion.button
      layout
      layoutId={data.id}
      transition={{ type: "spring", stiffness: 400, damping: 32 }}
      onClick={onClick}
      className="flex w-full items-center gap-4 border-b border-slate-100 bg-white px-4 py-3 text-left last:border-b-0 hover:bg-slate-50"
    >
      <div className="w-6 shrink-0 text-center text-sm font-medium text-slate-400">
        {rank}
      </div>

      <ScanIllustration kind={data.scanKind} className="h-12 w-12 shrink-0" />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium text-slate-900">
            {data.patientName}
          </span>
          <span className="text-xs text-slate-400">({data.age} ans)</span>
        </div>
        <div className="truncate text-xs text-slate-500">
          {data.examType} — {data.bodyPart} · arrivé {formatArrival(data.arrivalOffsetMinutes)}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {typeof rankDelta === "number" && rankDelta !== 0 && (
          <span
            className={`text-xs font-medium ${
              rankDelta > 0 ? "text-emerald-600" : "text-slate-400"
            }`}
          >
            {rankDelta > 0 ? `▲ +${rankDelta}` : `▼ ${rankDelta}`}
          </span>
        )}
        {data.triage ? (
          <UrgencyBadge
            category={data.triage.category}
            score={data.triage.urgency_score}
          />
        ) : (
          <span className="text-xs text-slate-300">en attente</span>
        )}
      </div>
    </motion.button>
  );
}
