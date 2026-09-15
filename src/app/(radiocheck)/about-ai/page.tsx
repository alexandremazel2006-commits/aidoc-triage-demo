export const metadata = { title: "About AI" };

const PATHOLOGIES = [
  "Atelectasis",
  "Consolidation",
  "Infiltration",
  "Pneumothorax",
  "Edema",
  "Emphysema",
  "Fibrosis",
  "Effusion",
  "Pneumonia",
  "Pleural_Thickening",
  "Cardiomegaly",
  "Nodule",
  "Mass",
  "Hernia",
  "Lung Lesion",
  "Fracture",
  "Lung Opacity",
  "Enlarged Cardiomediastinum",
];

const DATASETS = [
  { code: "nih", name: "NIH ChestX-ray14", note: "NIH Clinical Center — ~112,000 images" },
  { code: "pc", name: "PadChest", note: "Hospital San Juan, Spain — ~160,000 images" },
  { code: "chex", name: "CheXpert", note: "Stanford — ~224,000 images" },
  { code: "mimic_ch", name: "MIMIC-CXR", note: "MIT / Beth Israel — ~377,000 images" },
  { code: "google", name: "NIH (Google-relabeled)", note: "Radiologist re-annotation, 2019 paper" },
  { code: "openi", name: "Open-I", note: "Indiana University — ~7,500 images" },
  { code: "kaggle", name: "RSNA Pneumonia Challenge", note: "Kaggle / RSNA" },
];

export default function AboutAiPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">About the AI</h1>
        <p className="mt-1 text-sm text-slate-500">
          What model this demo uses, what it was trained on, and — just as
          important — what it can&apos;t do.
        </p>
      </div>

      <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
        This application is a university prototype and is not a certified
        medical device.
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900">The model</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          <a
            href="https://github.com/mlmed/torchxrayvision"
            className="text-blue-600 hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            TorchXRayVision
          </a>{" "}
          (open source), weights <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">densenet121-res224-all</code> —
          a DenseNet121 convolutional network. It runs entirely on this
          machine (CPU, or GPU/MPS if available) — no external API call, no
          data leaves your computer.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Reference: <em>&quot;TorchXRayVision: A library of chest X-ray
          datasets and models&quot;</em> —{" "}
          <a
            href="https://arxiv.org/abs/2111.00595"
            className="text-blue-600 hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            arXiv:2111.00595
          </a>
        </p>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900">
          Training data
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          The &quot;all&quot; weights are jointly trained on 7 public chest
          X-ray datasets combined — well over 800,000 images in total:
        </p>
        <ul className="mt-3 space-y-1.5 text-sm text-slate-600">
          {DATASETS.map((d) => (
            <li key={d.code} className="flex justify-between border-b border-slate-50 py-1">
              <span className="font-medium text-slate-800">{d.name}</span>
              <span className="text-xs text-slate-400">{d.note}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900">
          Supported pathologies ({PATHOLOGIES.length})
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Only these — the app never shows a pathology the model doesn&apos;t
          actually predict:
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {PATHOLOGIES.map((p) => (
            <span
              key={p}
              className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600"
            >
              {p}
            </span>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-red-100 bg-red-50 p-5">
        <h2 className="text-sm font-semibold text-red-900">Limitations</h2>
        <ul className="mt-3 space-y-3 text-sm leading-relaxed text-red-900/90">
          <li>
            <strong>Chest X-rays only.</strong> The model has never seen a
            skull, limb, spine, or abdomen image. Running it on anything
            other than a chest X-ray produces a meaningless score, not a
            valid &quot;no finding&quot;.
          </li>
          <li>
            <strong>Reported accuracy varies a lot by pathology and by
            dataset.</strong> Per the library&apos;s own published{" "}
            <a
              href="https://github.com/mlmed/torchxrayvision/blob/master/BENCHMARKS.md"
              className="underline"
              target="_blank"
              rel="noreferrer"
            >
              benchmarks
            </a>
            : on the NIH test set, AUC ranges from 0.91 (Hernia) and 0.88
            (Cardiomegaly) down to 0.68 (Infiltration) and 0.69 (Nodule). On
            CheXpert it&apos;s roughly 0.91–0.94; on PadChest, 0.69–0.97.
            These are research-split numbers from the library&apos;s
            authors — not a validation of this specific demo deployment.
          </li>
          <li>
            <strong>Scores are not calibrated clinical probabilities.</strong>{" "}
            A high score is not a diagnosis; a low score does not rule
            anything out. Both false positives and false negatives are
            expected and common — this is exactly why the radiologist
            review step exists.
          </li>
          <li>
            <strong>No clinical validation of this application.</strong>{" "}
            Nobody has evaluated this specific pipeline (preprocessing +
            model + priority thresholds + UI) against real clinical
            outcomes. It is a teaching tool illustrating how such a system
            could be built, not evidence that it works safely in practice.
          </li>
        </ul>
      </section>

      <p className="text-center text-xs text-slate-400">
        Built for an academic case study. Not affiliated with the
        TorchXRayVision authors or any dataset provider listed above.
      </p>
    </div>
  );
}
