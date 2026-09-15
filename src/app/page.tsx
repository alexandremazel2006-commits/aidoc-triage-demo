import Link from "next/link";

import { IntroSection } from "@/components/IntroSection";
import { StatsStrip } from "@/components/StatsStrip";
import { TopNav } from "@/components/TopNav";

export default function Home() {
  return (
    <div className="flex min-h-full flex-col">
      <TopNav />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
        <div className="max-w-3xl">
          <p className="text-sm font-medium text-blue-600">
            Academic case study — not a medical device
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            How an AI triage system changes WHEN a radiologist sees a case —
            never WHO is responsible
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-600">
            This demo illustrates, in a simplified and fictional way, the
            concept behind Aidoc: an AI that analyzes scans in the
            background and reorders the radiologist&apos;s reading list to
            surface urgent cases — without ever replacing their clinical
            judgment.
          </p>
          <Link
            href="/worklist"
            className="mt-6 inline-flex items-center rounded-md bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
          >
            Launch the interactive demo →
          </Link>
        </div>

        <div className="mt-10">
          <StatsStrip />
        </div>

        <div className="mt-10">
          <IntroSection />
        </div>
      </main>
      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        Independent educational demonstration built to illustrate Aidoc&apos;s
        publicly described concept. Not affiliated with Aidoc Ltd.
      </footer>
    </div>
  );
}
