import "server-only";

import { ApiError, GoogleGenAI } from "@google/genai";
import { z } from "zod";

import { TRIAGE_SYSTEM_PROMPT } from "./prompts";
import type { Case, TriageResult } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const MODEL = "gemini-3.6-flash";

const TriageResultSchema = z.object({
  caseId: z.string(),
  urgency_score: z.number().min(0).max(100),
  category: z.enum(["critical", "urgent", "routine"]),
  rationale: z.string(),
  disclaimer: z.string(),
});

const TriageResponseSchema = z.object({
  results: z.array(TriageResultSchema),
});

// Sous-ensemble de JSON Schema accepté par l'API Gemini (pas
// d'additionalProperties, pas de $ref) — écrit à la main plutôt que dérivé
// du schéma Zod pour rester dans ce sous-ensemble supporté.
const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    results: {
      type: "array",
      items: {
        type: "object",
        properties: {
          caseId: { type: "string" },
          urgency_score: { type: "number" },
          category: { type: "string", enum: ["critical", "urgent", "routine"] },
          rationale: { type: "string" },
          disclaimer: { type: "string" },
        },
        required: ["caseId", "urgency_score", "category", "rationale", "disclaimer"],
      },
    },
  },
  required: ["results"],
};

export class MissingApiKeyError extends Error {
  constructor() {
    super(
      "GEMINI_API_KEY n'est pas configurée côté serveur (fichier .env.local en développement, variable d'environnement Vercel en production).",
    );
    this.name = "MissingApiKeyError";
  }
}

function buildUserPrompt(cases: Case[]): string {
  const casesBlock = cases
    .map(
      (c) =>
        `- caseId: ${c.id}\n  Examen: ${c.examType} — ${c.bodyPart}\n  Contexte clinique (fictif): ${c.clinicalContext}`,
    )
    .join("\n\n");

  return `Voici ${cases.length} cas radiologiques fictifs en attente de lecture, dans une worklist PACS. Pour CHAQUE cas, renvoie un objet de triage (caseId, urgency_score, category, rationale, disclaimer) dans le tableau "results". Garde le même caseId que celui fourni, et couvre bien tous les cas listés.

${casesBlock}`;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// L'API Gemini renvoie parfois un 503 "UNAVAILABLE" transitoire sous forte
// charge. On retente quelques fois avant d'abandonner, pour ne pas faire
// dépendre la démo live d'un seul essai.
const RETRY_DELAYS_MS = [800, 2000, 4000];

export async function analyzeCases(cases: Case[]): Promise<TriageResult[]> {
  if (!process.env.GEMINI_API_KEY) {
    throw new MissingApiKeyError();
  }

  let lastError: unknown;
  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: MODEL,
        contents: buildUserPrompt(cases),
        config: {
          systemInstruction: TRIAGE_SYSTEM_PROMPT,
          responseMimeType: "application/json",
          responseSchema: RESPONSE_SCHEMA,
          // Classification simple, pas besoin de raisonnement étendu — le
          // désactiver ramène la latence de dizaines de secondes à
          // quelques secondes, essentiel pour une démo en direct.
          thinkingConfig: { thinkingBudget: 0 },
        },
      });

      const raw = response.text;
      if (!raw) {
        throw new Error("Gemini n'a pas renvoyé de sortie exploitable.");
      }

      const parsed = TriageResponseSchema.parse(JSON.parse(raw));
      return parsed.results;
    } catch (error) {
      lastError = error;
      const isRetryable =
        error instanceof ApiError &&
        (error.status === 503 || error.status === 429);
      if (!isRetryable || attempt === RETRY_DELAYS_MS.length) {
        throw error;
      }
      console.warn(
        `Gemini indisponible (tentative ${attempt + 1}/${RETRY_DELAYS_MS.length + 1}), nouvel essai dans ${RETRY_DELAYS_MS[attempt]}ms…`,
      );
      await sleep(RETRY_DELAYS_MS[attempt]);
    }
  }
  throw lastError;
}
