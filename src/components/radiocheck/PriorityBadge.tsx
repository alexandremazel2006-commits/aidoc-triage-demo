const STYLES: Record<string, string> = {
  CRITICAL: "bg-red-100 text-red-800 border-red-300",
  HIGH: "bg-red-50 text-red-700 border-red-200",
  MEDIUM: "bg-amber-100 text-amber-800 border-amber-300",
  LOW: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export function PriorityBadge({ priority }: { priority: string }) {
  const style = STYLES[priority] ?? "bg-slate-100 text-slate-700 border-slate-300";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${style}`}
    >
      {priority}
    </span>
  );
}
