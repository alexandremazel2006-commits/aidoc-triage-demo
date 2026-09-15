"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { ExamSummary, listExams, Priority, RadioCheckApiError } from "@/lib/radiocheck-api";

import { PriorityBadge } from "./PriorityBadge";

const PRIORITIES: Array<Priority | "All"> = ["All", "CRITICAL", "HIGH", "MEDIUM", "LOW"];
const STATUSES = ["All", "Needs review", "Reviewed"];

export function HistoryView() {
  const [exams, setExams] = useState<ExamSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState<Priority | "All">("All");
  const [status, setStatus] = useState("All");

  useEffect(() => {
    listExams()
      .then(setExams)
      .catch((e) =>
        setError(e instanceof RadioCheckApiError ? e.message : "Failed to load exams."),
      );
  }, []);

  const filtered = useMemo(() => {
    if (!exams) return [];
    return exams.filter((e) => {
      if (priority !== "All" && e.priority !== priority) return false;
      if (status !== "All" && e.review_status !== status) return false;
      if (search && !e.patient_id.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [exams, search, priority, status]);

  if (error) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-lg font-semibold text-slate-900">History</h1>
      <p className="text-sm text-slate-500">All saved analyses.</p>

      <div className="mt-4 flex flex-wrap gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by Patient ID"
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm"
        />
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as Priority | "All")}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm"
        >
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {p === "All" ? "All priorities" : p}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s === "All" ? "All statuses" : s}
            </option>
          ))}
        </select>
      </div>

      {!exams ? (
        <p className="mt-6 text-sm text-slate-400">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="mt-6 text-sm text-slate-400">No matching examinations.</p>
      ) : (
        <div className="mt-4 overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-2 font-medium">Patient ID</th>
                <th className="px-4 py-2 font-medium">Date</th>
                <th className="px-4 py-2 font-medium">AI finding</th>
                <th className="px-4 py-2 font-medium">Priority</th>
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
                    <Link href={`/exams/${e.id}`} className="text-blue-700">
                      {e.patient_id}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 text-slate-500">
                    {new Date(e.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 text-slate-700">{e.top_finding ?? "—"}</td>
                  <td className="px-4 py-2.5">
                    <PriorityBadge priority={e.priority} />
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
