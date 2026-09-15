"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { ExamSummary, listExams, RadioCheckApiError } from "@/lib/radiocheck-api";

import { PriorityBadge } from "./PriorityBadge";
import { StatCard } from "./StatCard";

function isToday(isoDate: string): boolean {
  const d = new Date(isoDate);
  const now = new Date();
  return (
    d.getUTCFullYear() === now.getUTCFullYear() &&
    d.getUTCMonth() === now.getUTCMonth() &&
    d.getUTCDate() === now.getUTCDate()
  );
}

export function DashboardView() {
  const [exams, setExams] = useState<ExamSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listExams()
      .then(setExams)
      .catch((e) =>
        setError(e instanceof RadioCheckApiError ? e.message : "Failed to load exams."),
      );
  }, []);

  if (error) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (!exams) {
    return <p className="text-sm text-slate-400">Loading…</p>;
  }

  const todayCount = exams.filter((e) => isToday(e.created_at)).length;
  const pendingCount = exams.filter((e) => e.review_status === "Needs review").length;
  const highPriorityCount = exams.filter(
    (e) => e.priority === "CRITICAL" || e.priority === "HIGH",
  ).length;
  const avgTime =
    exams.length === 0
      ? 0
      : exams.reduce((sum, e) => sum + e.processing_time, 0) / exams.length;

  const recent = exams.slice(0, 10);

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-lg font-semibold text-slate-900">RadioCheck AI</h1>
      <p className="text-sm text-slate-500">Radiology Dashboard</p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Today's examinations" value={todayCount} />
        <StatCard label="Pending review" value={pendingCount} />
        <StatCard label="High priority" value={highPriorityCount} />
        <StatCard
          label="Average AI analysis time"
          value={exams.length === 0 ? "—" : `${avgTime.toFixed(1)}s`}
        />
      </div>

      <div className="mt-8">
        <h2 className="mb-3 text-sm font-semibold text-slate-900">
          Recent examinations
        </h2>
        {exams.length === 0 ? (
          <p className="text-sm text-slate-400">
            No examinations yet — run one from{" "}
            <Link href="/analyze" className="text-blue-600 hover:underline">
              Analyze X-ray
            </Link>
            .
          </p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-4 py-2 font-medium">Patient ID</th>
                  <th className="px-4 py-2 font-medium">Date</th>
                  <th className="px-4 py-2 font-medium">Exam type</th>
                  <th className="px-4 py-2 font-medium">AI finding</th>
                  <th className="px-4 py-2 font-medium">Priority</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((e) => (
                  <tr
                    key={e.id}
                    className="cursor-pointer border-b border-slate-50 last:border-b-0 hover:bg-slate-50"
                  >
                    <td className="px-4 py-2.5">
                      <Link href={`/exams/${e.id}`} className="block text-blue-700">
                        {e.patient_id}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 text-slate-500">
                      {new Date(e.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-2.5 text-slate-500">Chest X-ray</td>
                    <td className="px-4 py-2.5 text-slate-700">
                      {e.top_finding ?? "—"}
                    </td>
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
    </div>
  );
}
