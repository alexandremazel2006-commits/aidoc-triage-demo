import { TopNav } from "@/components/TopNav";
import { WorklistView } from "@/components/WorklistView";
import { CASES } from "@/lib/cases";

export default function WorklistPage() {
  return (
    <div className="flex min-h-full flex-col">
      <TopNav />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6">
        <p className="mb-4 text-sm text-slate-500">
          Click a case to see its detailed triage score. The button below
          calls Gemini on the server to simulate Aidoc&apos;s triage analysis
          on the {CASES.length} fictional cases in this worklist — you can
          also add your own case before running it.
        </p>
        <WorklistView />
      </main>
    </div>
  );
}
