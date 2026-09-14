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
            Étude de cas académique — pas un dispositif médical
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Comment une IA de triage change QUAND un radiologue voit un cas —
            jamais QUI est responsable
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-600">
            Cette démo illustre, de façon simplifiée et fictive, le concept
            derrière Aidoc : une IA qui analyse les scanners en arrière-plan
            et réordonne la liste de lecture du radiologue pour faire
            remonter les cas urgents — sans jamais remplacer son jugement
            clinique.
          </p>
          <Link
            href="/worklist"
            className="mt-6 inline-flex items-center rounded-md bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
          >
            Lancer la démo interactive →
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
        Démonstration pédagogique indépendante, construite pour illustrer le
        concept public d&apos;Aidoc. Non affiliée à Aidoc Ltd.
      </footer>
    </div>
  );
}
