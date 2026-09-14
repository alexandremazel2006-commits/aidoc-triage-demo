# Démo interactive — Aidoc, IA de triage radiologique

Démonstration pédagogique et fictive du fonctionnement d'[Aidoc](https://www.aidoc.com), une
IA de triage radiologique, pour une présentation orale / étude de cas académique.

> ⚠️ **Ce n'est pas un dispositif médical.** Aucune donnée patient réelle n'est utilisée. Les
> cas, les images et les scores affichés sont fictifs et générés pour l'illustration. Les
> scores ne sont pas cliniquement validés.

## Le concept illustré

- Les radiologues traitent habituellement les scans dans l'ordre d'arrivée (FIFO), sans
  signal de priorité clinique.
- Aidoc analyse les images en arrière-plan et, en cas de signe de gravité détecté, fait
  remonter le cas en tête de la worklist — **il ne diagnostique jamais**.
- Le radiologue reste seul responsable de la lecture et de la signature du compte-rendu :
  l'IA change *quand* un cas est vu, jamais *qui* est responsable.

Cette démo montre une worklist de 13 cas fictifs, avant (ordre d'arrivée) puis après
(triée par un score d'urgence généré par Claude), avec un panneau de détail
"human-in-the-loop" où le radiologue confirme ou rejette la priorité proposée.

## Stack technique

- [Next.js](https://nextjs.org) (App Router) + TypeScript + Tailwind CSS
- [API Anthropic (Claude)](https://docs.claude.com) appelée uniquement côté serveur
  (`src/app/api/analyze/route.ts`) via une route API Next.js — la clé API n'est jamais
  exposée au client
- Images de scanner remplacées par des silhouettes SVG procédurales étiquetées "image
  illustrative" (aucune vraie imagerie médicale, pas de dataset externe à télécharger)

## Lancer en local

### Prérequis

- Node.js 18.18+ (testé avec Node 26)
- Une clé API Anthropic : [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys)

### Installation

```bash
npm install
```

### Variables d'environnement

Copie `.env.example` vers `.env.local` (déjà ignoré par git) et renseigne ta clé :

```bash
cp .env.example .env.local
```

```
ANTHROPIC_API_KEY=sk-ant-...
```

### Développement

```bash
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000). La page d'accueil explique le
concept ; `/worklist` contient la démo interactive (bouton "Lancer le tri IA").

### Build de production

```bash
npm run build
npm run start
```

## Structure du projet

```
src/
├── app/
│   ├── layout.tsx          # layout racine + bandeau disclaimer permanent
│   ├── page.tsx             # accueil : contexte Aidoc, stats, philosophie
│   ├── worklist/page.tsx    # démo principale avant/après
│   └── api/analyze/route.ts # appel serveur à Claude (jamais côté client)
├── components/               # UI (worklist, panneau détail, badges, SVG, nav)
└── lib/
    ├── cases.ts              # 13 cas fictifs (dataset statique)
    ├── claude.ts             # client Anthropic + sortie structurée (Zod)
    ├── prompts.ts             # system prompt du triage (outil de tri, pas de diagnostic)
    └── types.ts               # types partagés
```

## Déploiement sur Vercel

Voir les instructions étape par étape fournies séparément, ou en résumé :

1. Pousse ce repo sur GitHub.
2. Sur [vercel.com/new](https://vercel.com/new), importe le repo.
3. Ajoute la variable d'environnement `ANTHROPIC_API_KEY` dans Project Settings →
   Environment Variables (valeur secrète, jamais committée).
4. Déploie — Vercel détecte automatiquement Next.js.

## Licence / attribution

Aucune image médicale réelle n'est utilisée. Les vignettes de scanner sont des SVG
générés localement dans `src/components/ScanIllustration.tsx`.
