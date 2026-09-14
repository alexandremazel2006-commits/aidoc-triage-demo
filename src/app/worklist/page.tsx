import { TopNav } from "@/components/TopNav";
import { WorklistView } from "@/components/WorklistView";
import { CASES } from "@/lib/cases";

export default function WorklistPage() {
  return (
    <div className="flex min-h-full flex-col">
      <TopNav />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6">
        <p className="mb-4 text-sm text-slate-500">
          Clique sur un cas pour voir son score de triage détaillé. Le bouton
          ci-dessous appelle Claude côté serveur pour simuler l&apos;analyse
          de triage d&apos;Aidoc sur les {CASES.length} cas fictifs de cette
          worklist.
        </p>
        <WorklistView />
      </main>
    </div>
  );
}
