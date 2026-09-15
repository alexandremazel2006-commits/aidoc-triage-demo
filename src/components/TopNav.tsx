import Link from "next/link";

export function TopNav() {
  return (
    <header className="border-b border-slate-200 bg-slate-900">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded bg-blue-600 text-sm font-bold text-white">
            A
          </span>
          <span className="text-sm font-semibold text-white">
            Aidoc Demo — AI Radiology Triage
          </span>
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/" className="text-slate-300 hover:text-white">
            Background
          </Link>
          <Link
            href="/worklist"
            className="rounded-md bg-blue-600 px-3 py-1.5 font-medium text-white hover:bg-blue-500"
          >
            View the demo
          </Link>
        </nav>
      </div>
    </header>
  );
}
