"use client";

import { useMemo, useState } from "react";

import { CASES } from "@/lib/cases";
import type { AnalyzedCase, TriageResult } from "@/lib/types";

import { CaseDetailPanel } from "./CaseDetailPanel";
import { CaseRow } from "./CaseRow";

function initialCases(): AnalyzedCase[] {
  return CASES.map((c) => ({
    ...c,
    triage: null,
    radiologistDecision: "pending" as const,
  }));
}

export function WorklistView() {
  const [cases, setCases] = useState<AnalyzedCase[]>(initialCases);
  const [sorted, setSorted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

  const hasAnalysis = cases.some((c) => c.triage !== null);

  const fifoOrder = useMemo(
    () => [...cases].sort((a, b) => b.arrivalOffsetMinutes - a.arrivalOffsetMinutes),
    [cases],
  );

  const fifoRank = useMemo(() => {
    const map = new Map<string, number>();
    fifoOrder.forEach((c, i) => map.set(c.id, i + 1));
    return map;
  }, [fifoOrder]);

  const aiOrder = useMemo(
    () =>
      [...cases].sort((a, b) => {
        const scoreA = a.triage?.urgency_score ?? -1;
        const scoreB = b.triage?.urgency_score ?? -1;
        if (scoreB !== scoreA) return scoreB - scoreA;
        return b.arrivalOffsetMinutes - a.arrivalOffsetMinutes;
      }),
    [cases],
  );

  const displayed = sorted ? aiOrder : fifoOrder;

  const summary = useMemo(() => {
    const counts = { critical: 0, urgent: 0, routine: 0 };
    for (const c of cases) {
      if (c.triage) counts[c.triage.category] += 1;
    }
    return counts;
  }, [cases]);

  async function runTriage() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/analyze", { method: "POST" });
      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.error ?? "Échec de l'analyse.");
      }
      const results: TriageResult[] = body.results;
      setCases((prev) =>
        prev.map((c) => {
          const triage = results.find((r) => r.caseId === c.id) ?? null;
          return { ...c, triage };
        }),
      );
      setSorted(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue.");
    } finally {
      setLoading(false);
    }
  }

  function handleDecision(decision: "confirmed" | "rejected") {
    if (!selectedCaseId) return;
    setCases((prev) =>
      prev.map((c) =>
        c.id === selectedCaseId ? { ...c, radiologistDecision: decision } : c,
      ),
    );
  }

  const selectedCase = cases.find((c) => c.id === selectedCaseId) ?? null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-slate-900">
            Worklist radiologie
          </h1>
          {hasAnalysis && (
            <div className="flex overflow-hidden rounded-md border border-slate-300 text-xs font-medium">
              <button
                onClick={() => setSorted(false)}
                className={`px-3 py-1.5 ${
                  !sorted
                    ? "bg-slate-900 text-white"
                    : "bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                Avant (FIFO)
              </button>
              <button
                onClick={() => setSorted(true)}
                className={`px-3 py-1.5 ${
                  sorted
                    ? "bg-slate-900 text-white"
                    : "bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                Après (triage IA)
              </button>
            </div>
          )}
        </div>

        <button
          onClick={runTriage}
          disabled={loading}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading
            ? "Analyse en cours…"
            : hasAnalysis
              ? "Relancer le tri IA"
              : "Lancer le tri IA (Gemini)"}
        </button>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {hasAnalysis && (
        <div className="flex gap-4 text-xs text-slate-500">
          <span>
            <span className="font-semibold text-red-700">
              {summary.critical}
            </span>{" "}
            critique(s)
          </span>
          <span>
            <span className="font-semibold text-amber-700">
              {summary.urgent}
            </span>{" "}
            urgent(s)
          </span>
          <span>
            <span className="font-semibold text-slate-600">
              {summary.routine}
            </span>{" "}
            routine
          </span>
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-slate-200">
        {displayed.map((c, idx) => (
          <CaseRow
            key={c.id}
            data={c}
            rank={idx + 1}
            rankDelta={
              sorted && c.triage ? fifoRank.get(c.id)! - (idx + 1) : undefined
            }
            onClick={() => setSelectedCaseId(c.id)}
          />
        ))}
      </div>

      <CaseDetailPanel
        data={selectedCase}
        onClose={() => setSelectedCaseId(null)}
        onDecision={handleDecision}
      />
    </div>
  );
}
