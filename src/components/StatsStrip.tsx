const STATS = [
  { value: "~2 000", label: "hôpitaux équipés" },
  { value: "~60M", label: "cas analysés / an" },
  { value: "31+", label: "autorisations FDA (510(k))" },
  { value: "14", label: "pathologies couvertes (modèle 2026)" },
];

export function StatsStrip() {
  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-slate-200 bg-slate-200 sm:grid-cols-4">
      {STATS.map((s) => (
        <div key={s.label} className="bg-white px-4 py-5 text-center">
          <div className="text-2xl font-semibold text-slate-900">
            {s.value}
          </div>
          <div className="mt-1 text-xs text-slate-500">{s.label}</div>
        </div>
      ))}
    </div>
  );
}
