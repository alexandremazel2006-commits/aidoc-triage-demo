# RadioCheck AI — backend

FastAPI backend for RadioCheck AI: runs a real, locally-hosted chest X-ray
classification model (no external API, no API key) and serves it to the
Next.js frontend.

> ⚠️ Research & educational use only — not intended for clinical diagnosis.
> This is a university prototype, not a certified medical device.

## Architecture

```
Next.js frontend  →  FastAPI (this backend)  →  image preprocessing
                                              →  TorchXRayVision model (local)
                                              →  Grad-CAM / SQLite / report
```

```
backend/
├── app/
│   ├── main.py              # FastAPI app, CORS, static /uploads mount, startup
│   ├── config.py             # Settings (upload dir, DB path, CORS origins)
│   ├── database.py           # SQLAlchemy engine/session
│   ├── models/exam.py        # Exam, Prediction, Report, Review tables
│   ├── schemas/exam.py       # Pydantic request/response models
│   ├── api/exams.py          # All /api/exams/* routes
│   └── services/
│       ├── ai_model.py        # Loads the model once at startup (CUDA>MPS>CPU)
│       ├── preprocessing.py   # Image decode + TorchXRayVision's exact pipeline
│       ├── prediction.py      # Runs inference, returns sorted scores
│       ├── gradcam.py         # Real Grad-CAM (hooks model.features)
│       ├── priority_engine.py # Demo-only urgency thresholds (documented, editable)
│       └── report_generator.py# Deterministic report text — no LLM
├── tests/                    # pytest suite (real model, real SQLite)
├── uploads/                  # Saved images (gitignored)
├── test_model.py             # Standalone sanity-check script (see below)
└── requirements.txt
```

## AI model

- **Library**: [TorchXRayVision](https://github.com/mlmed/torchxrayvision) (open source)
- **Weights**: `densenet121-res224-all` — DenseNet121 jointly trained on 7
  public chest X-ray datasets: NIH ChestX-ray14, PadChest, CheXpert,
  MIMIC-CXR, a Google-relabeled NIH subset, Open-I, and the RSNA Pneumonia
  (Kaggle) challenge set — combined, well over 800,000 images.
- **Downloaded automatically** on first run, from the library's official
  GitHub releases, and cached at `~/.torchxrayvision/models_data/` (~30 MB).
  No manual download step needed.
- **Supported pathologies** (only these are ever shown — never invented):
  Atelectasis, Consolidation, Infiltration, Pneumothorax, Edema, Emphysema,
  Fibrosis, Effusion, Pneumonia, Pleural_Thickening, Cardiomegaly, Nodule,
  Mass, Hernia, Lung Lesion, Fracture, Lung Opacity, Enlarged
  Cardiomediastinum.
- **Reported AUC** (source: the library's own
  [BENCHMARKS.md](https://github.com/mlmed/torchxrayvision/blob/master/BENCHMARKS.md)):
  varies widely by dataset and pathology — e.g. on the NIH test set, Hernia
  0.91 and Cardiomegaly 0.88 vs. Infiltration 0.68 and Nodule 0.69. No
  metric is specific to *this* deployment/configuration — see `/about-ai`
  in the app for the full picture, including limitations.
- **Scope**: chest X-rays only. Feeding it any other body part (skull,
  limb, spine...) is out-of-distribution — scores on such images are not
  meaningful. See `/about-ai`.

Paper: *"TorchXRayVision: A library of chest X-ray datasets and models"*
([arXiv:2111.00595](https://arxiv.org/abs/2111.00595)).

## Setup (Apple Silicon and others)

### Prerequisites

A **Python 3.9+ virtual environment**. On this project's dev machine, the
Homebrew-bottled Python 3.12 hit two unrelated macOS-sandbox issues
(a `platform.mac_ver()` bug breaking `pip`, and a `libexpat` ABI mismatch
in the bottle) — Python 3.9 (Xcode's bundled interpreter) worked without
any of that. If you hit similar `pip`/`ensurepip` failures on a fresh
Python install, either use a different Python 3.9-3.12 you already have,
or create the venv with [`virtualenv`](https://virtualenv.pypa.io) instead
of the stdlib `venv` module — it bundles its own pip and sidesteps the
`ensurepip` bootstrap entirely:
```bash
pip install --user virtualenv
python -m virtualenv -p python3.9 venv
```

### Install

```bash
cd backend
python3 -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Sanity-check the model (do this before anything else)

```bash
python test_model.py tests/fixtures/sample_chest_xray.png
```

This loads the model, runs one real inference, and prints all 18 scores to
the terminal. If this doesn't work, nothing downstream will either — fix
this first.

### Run the API

```bash
uvicorn app.main:app --reload --port 8000
```

The model loads once at startup (see the `[RadioCheck AI] Model loaded on
device: ...` log line — `mps` on Apple Silicon, `cuda` if available, `cpu`
otherwise). First request after startup is fast; there's no per-request
reload.

- Interactive API docs: http://localhost:8000/docs
- Health check: http://localhost:8000/health

### Run the tests

```bash
python -m pytest -v
```

Real integration tests — the real model, a real (temporary, auto-cleaned)
SQLite database, no mocked AI output except the one test that
intentionally simulates a model failure to check error handling.

## Database

SQLite file `radiocheck.db`, created automatically on first startup.
Tables: `exams`, `predictions`, `reports`, `reviews` (see
`app/models/exam.py`). No real patient data — see the disclaimer above.

## Priority thresholds (demo only)

`app/services/priority_engine.py` centralizes the urgency thresholds used
to label CRITICAL/HIGH/MEDIUM/LOW. They are **not clinically validated** —
edit that one file to change the demo's behavior.

## Troubleshooting

- **`pip install` / `ensurepip` fails with a `platform.mac_ver()` or
  `truststore` error**: see the virtualenv workaround above.
- **`ImportError: ... pyexpat ...` / `Symbol not found`**: a Homebrew
  Python bottle built against a different libexpat than your macOS ships.
  Switch to a different Python 3.9-3.12 interpreter for the venv.
- **CORS errors in the browser**: confirm the frontend origin is listed in
  `app/config.py`'s `cors_origins` (defaults to `http://localhost:3000`).
- **Model download fails**: check your network; the weights come from
  `github.com/mlmed/torchxrayvision/releases`. Delete
  `~/.torchxrayvision/models_data/` to force a re-download.
- **Grad-CAM looks empty/flat**: expected for low-confidence predictions —
  weak gradients produce a diffuse heatmap. Try a pathology with a higher
  AI score.
