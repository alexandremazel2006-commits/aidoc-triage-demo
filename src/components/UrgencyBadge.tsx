import type { UrgencyCategory } from "@/lib/types";

const STYLES: Record<UrgencyCategory, string> = {
  critical: "bg-red-100 text-red-800 border-red-300",
  urgent: "bg-amber-100 text-amber-800 border-amber-300",
  routine: "bg-slate-100 text-slate-700 border-slate-300",
};

const LABELS: Record<UrgencyCategory, string> = {
  critical: "Critical",
  urgent: "Urgent",
  routine: "Routine",
};

export function UrgencyBadge({
  category,
  score,
}: {
  category: UrgencyCategory;
  score?: number;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${STYLES[category]}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          category === "critical"
            ? "bg-red-600"
            : category === "urgent"
              ? "bg-amber-600"
              : "bg-slate-500"
        }`}
      />
      {LABELS[category]}
      {typeof score === "number" && (
        <span className="opacity-70">· {score}</span>
      )}
    </span>
  );
}
