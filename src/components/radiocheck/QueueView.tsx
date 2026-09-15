"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { ExamSummary, listExams, Priority, RadioCheckApiError } from "@/lib/radiocheck-api";

import { PriorityBadge } from "./PriorityBadge";

const PRIORITY_ORDER: Priority[] = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];

type Filter = "All" | "Critical" | "High" | "Pending" | "Reviewed";
const FILTERS: Filter[] = ["All", "Critical", "High", "Pending", "Reviewed"];

export function QueueView() {
  const [exams, setExams] = useState<ExamSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("All");

  useEffect(() => {
    listExams()
      .then(setExams)
      .catch((e) =>
        setError(e instanceof RadioCheckApiError ? e.message : "Failed to load exams."),
      );
  }, []);

  const sorted = useMemo(() => {
    if (!exams) return [];
    return [...exams].sort((a, b) => {
      const pa = PRIORITY_ORDER.indexOf(a.priority);
      const pb = PRIORITY_ORDER.indexOf(b.priority);
      if (pa !== pb) return pa - pb;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [exams]);

  const filtered = useMemo(() => {
    switch (filter) {
      case "Critical":
        return sorted.filter((e) => e.priority === "CRITICAL");
      case "High":
        return sorted.filter((e) => e.priority === "HIGH");
      case "Pending":
        return sorted.filter((e) => e.review_status === "Needs review");
      case "Reviewed":
        return sorted.filter((e) => e.review_status === "Reviewed");
      default:
        return sorted;
    }
  }, [sorted, filter]);

  if (error) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-lg font-semibold text-slate-900">Radiology Queue</h1>
      <p className="text-sm text-slate-500">
        Sorted by AI workflow priority — demonstration only.
      </p>

      <div className="mt-4 flex gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium ${
              filter === f
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-600 ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {!exams ? (
        <p className="mt-6 text-sm text-slate-400">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="mt-6 text-sm text-slate-400">No examinations match this filter.</p>
      ) : (
        <div className="mt-4 overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-2 font-medium">Priority</th>
                <th className="px-4 py-2 font-medium">Patient</th>
                <th className="px-4 py-2 font-medium">Exam</th>
                <th className="px-4 py-2 font-medium">Top AI Finding</th>
                <th className="px-4 py-2 font-medium">AI Score</th>
                <th className="px-4 py-2 font-medium">Time</th>
                <th className="px-4 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr
                  key={e.id}
                  className="border-b border-slate-50 last:border-b-0 hover:bg-slate-50"
                >
                  <td className="px-4 py-2.5">
                    <PriorityBadge priority={e.priority} />
                  </td>
                  <td className="px-4 py-2.5">
                    <Link href={`/exams/${e.id}`} className="text-blue-700">
                      {e.patient_id}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 text-slate-500">Chest X-ray</td>
                  <td className="px-4 py-2.5 text-slate-700">
                    {e.top_finding ?? "—"}
                  </td>
                  <td className="px-4 py-2.5 text-slate-700">
                    {e.top_score != null ? `${(e.top_score * 100).toFixed(0)}%` : "—"}
                  </td>
                  <td className="px-4 py-2.5 text-slate-500">
                    {new Date(e.created_at).toLocaleTimeString()}
                  </td>
                  <td className="px-4 py-2.5 text-slate-500">{e.review_status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
