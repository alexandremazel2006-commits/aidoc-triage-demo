const POINTS = [
  {
    title: "The problem: a queue with no clinical priority",
    body: "In a radiology department, exams pile up in the order they arrive (FIFO), with no signal of clinical urgency. A critical case — stroke, pulmonary embolism, hemorrhage — can end up waiting behind several routine exams simply because it arrived after them.",
  },
  {
    title: "What Aidoc does: re-prioritize, never diagnose",
    body: "A few minutes after a scan is acquired, the AI analyzes it in the background, directly inside the PACS (the software the hospital already uses). If it detects a sign of severity, the case moves to the top of the radiologist's worklist. It only reorders the queue — it never makes a diagnosis.",
  },
  {
    title: "What doesn't change: medical accountability",
    body: "The radiologist still reads and interprets every case themselves. They sign the final report and remain solely legally responsible. The AI changes WHEN a case is seen — never WHO is responsible for the diagnosis.",
  },
];

export function IntroSection() {
  return (
    <div className="space-y-8">
      <div className="rounded-lg border border-blue-100 bg-blue-50 px-5 py-4 text-sm text-blue-900">
        <span className="font-semibold">Core philosophy: </span>
        &ldquo;augmentation, not automation&rdquo;. The AI brings speed of detection; the
        radiologist brings clinical judgment and patient context.
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        {POINTS.map((p) => (
          <div
            key={p.title}
            className="rounded-lg border border-slate-200 bg-white p-5"
          >
            <h3 className="text-sm font-semibold text-slate-900">
              {p.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {p.body}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-600">
        <h3 className="text-sm font-semibold text-slate-900">
          A real challenge: generalizability
        </h3>
        <p className="mt-2 leading-relaxed">
          On its 2026 foundation model (14 pathologies), Aidoc reports 97%
          sensitivity and 98% specificity in internal validation. These
          figures drop in external validation — outside the training
          hospitals — where specificity can fall by up to 24 points. This is
          a genuine research challenge for this type of system, illustrated
          here in a simplified way.
        </p>
      </div>
    </div>
  );
}
