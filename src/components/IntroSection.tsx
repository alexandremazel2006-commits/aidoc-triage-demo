const POINTS = [
  {
    title: "Le problème : une file d'attente aveugle",
    body: "Dans un service de radiologie, les examens s'accumulent dans l'ordre d'arrivée (FIFO), sans aucun signal de priorité clinique. Un cas critique — AVC, embolie pulmonaire, hémorragie — peut donc attendre derrière plusieurs examens de routine, simplement parce qu'il est arrivé après eux.",
  },
  {
    title: "Ce qu'Aidoc fait : re-prioriser, jamais diagnostiquer",
    body: "Quelques minutes après l'acquisition d'un scanner, l'IA l'analyse en arrière-plan directement dans le PACS (le logiciel déjà utilisé par l'hôpital). Si elle détecte un signe de gravité, le cas remonte en tête de la worklist du radiologue. Elle ne fait que réordonner la file — elle ne pose jamais de diagnostic.",
  },
  {
    title: "Ce qui ne change pas : la responsabilité médicale",
    body: "Le radiologue continue de lire et d'interpréter chaque cas lui-même. C'est lui qui signe le compte-rendu final et reste seul responsable légalement. L'IA change QUAND un cas est vu — jamais QUI est responsable du diagnostic.",
  },
];

export function IntroSection() {
  return (
    <div className="space-y-8">
      <div className="rounded-lg border border-blue-100 bg-blue-50 px-5 py-4 text-sm text-blue-900">
        <span className="font-semibold">Philosophie centrale : </span>
        « augmentation, pas automatisation ». L&apos;IA apporte la vitesse de
        détection ; le radiologue apporte le jugement clinique et le contexte
        patient.
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
          Un enjeu réel : la généralisabilité
        </h3>
        <p className="mt-2 leading-relaxed">
          Sur son modèle de fondation 2026 (14 pathologies), Aidoc annonce
          97 % de sensibilité et 98 % de spécificité en validation interne.
          Ces chiffres baissent en validation externe — hors des hôpitaux
          d&apos;entraînement — où la spécificité peut chuter jusqu&apos;à 24
          points. C&apos;est un vrai sujet de recherche pour ce type de
          système, illustré ici de façon simplifiée.
        </p>
      </div>
    </div>
  );
}
