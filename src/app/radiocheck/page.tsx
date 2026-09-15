import Link from "next/link";

const INDICATORS = [
  "AI-assisted analysis",
  "Explainable predictions",
  "Automated report draft",
  "Radiology workflow",
];

export const metadata = {
  title: "RadioCheck AI",
  description: "AI-powered chest X-ray analysis for research and education.",
};

export default function RadioCheckLandingPage() {
  return (
    <div className="flex min-h-full flex-col bg-white">
      <header className="border-b border-slate-200">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded bg-blue-600 text-sm font-bold text-white">
              R
            </span>
            <span className="text-sm font-semibold text-slate-900">
              RadioCheck AI
            </span>
          </div>
          <Link
            href="/"
            className="text-sm text-slate-500 hover:text-slate-700"
          >
            ← Aidoc demo
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center px-6 py-16 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          RadioCheck AI
        </h1>
        <p className="mt-3 text-base text-slate-500">
          AI-powered chest X-ray analysis for research and education
        </p>

        <p className="mt-6 max-w-xl rounded-md bg-amber-50 px-4 py-2.5 text-xs font-medium text-amber-800">
          Research &amp; educational use only — Not intended for clinical
          diagnosis.
        </p>

        <Link
          href="/analyze"
          className="mt-8 inline-flex items-center rounded-md bg-blue-600 px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
        >
          Analyze X-ray →
        </Link>

        <div className="mt-14 grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
          {INDICATORS.map((label) => (
            <div
              key={label}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-4 text-xs font-medium text-slate-600"
            >
              {label}
            </div>
          ))}
        </div>

        <Link
          href="/dashboard"
          className="mt-14 text-sm text-blue-600 hover:underline"
        >
          Go to Radiology Dashboard →
        </Link>
      </main>
    </div>
  );
}
