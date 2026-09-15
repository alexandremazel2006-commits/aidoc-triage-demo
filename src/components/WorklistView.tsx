"use client";

import { useMemo, useState } from "react";

import { CASES } from "@/lib/cases";
import type { AnalyzedCase, Case, TriageResult } from "@/lib/types";

import { AddCaseForm } from "./AddCaseForm";
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
  const [showAddForm, setShowAddForm] = useState(false);

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
      const payload: Case[] = cases.map((c) => ({
        id: c.id,
        patientName: c.patientName,
        age: c.age,
        examType: c.examType,
        bodyPart: c.bodyPart,
        scanKind: c.scanKind,
        arrivalOffsetMinutes: c.arrivalOffsetMinutes,
        clinicalContext: c.clinicalContext,
      }));
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cases: payload }),
      });
      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.error ?? "Analysis failed.");
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
      setError(e instanceof Error ? e.message : "Unknown error.");
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

  function handleAddCase(newCase: Case) {
    setCases((prev) => [
      ...prev,
      { ...newCase, triage: null, radiologistDecision: "pending" },
    ]);
    setShowAddForm(false);
  }

  const selectedCase = cases.find((c) => c.id === selectedCaseId) ?? null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-slate-900">
            Radiology worklist
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
                Before (FIFO)
              </button>
              <button
                onClick={() => setSorted(true)}
                className={`px-3 py-1.5 ${
                  sorted
                    ? "bg-slate-900 text-white"
                    : "bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                After (AI triage)
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddForm(true)}
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          >
            + Add a case
          </button>
          <button
            onClick={runTriage}
            disabled={loading}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Analyzing…"
              : hasAnalysis
                ? "Re-run AI triage"
                : "Run AI triage (Claude)"}
          </button>
        </div>
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
            critical
          </span>
          <span>
            <span className="font-semibold text-amber-700">
              {summary.urgent}
            </span>{" "}
            urgent
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

      {showAddForm && (
        <AddCaseForm onAdd={handleAddCase} onClose={() => setShowAddForm(false)} />
      )}
    </div>
  );
}
