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

// Subset of JSON Schema accepted by the Gemini API (no additionalProperties,
// no $ref) — written by hand rather than derived from the Zod schema so it
// stays within that supported subset.
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
      "GEMINI_API_KEY is not configured on the server (.env.local file in development, Vercel environment variable in production).",
    );
    this.name = "MissingApiKeyError";
  }
}

function buildUserPrompt(cases: Case[]): string {
  const casesBlock = cases
    .map(
      (c) =>
        `- caseId: ${c.id}\n  Exam: ${c.examType} — ${c.bodyPart}\n  Clinical context (fictional): ${c.clinicalContext}`,
    )
    .join("\n\n");

  return `Here are ${cases.length} fictional radiology cases waiting to be read, in a PACS worklist. For EACH case, return a triage object (caseId, urgency_score, category, rationale, disclaimer) in the "results" array. Keep the same caseId as provided, and make sure to cover every case listed.

${casesBlock}`;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// The Gemini API sometimes returns a transient 503 "UNAVAILABLE" under heavy
// load. Retry a few times before giving up, so a live demo doesn't depend on
// a single attempt.
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
          // Simple classification task, no need for extended reasoning —
          // disabling it cuts latency from tens of seconds down to a few
          // seconds, which matters for a live demo.
          thinkingConfig: { thinkingBudget: 0 },
        },
      });

      const raw = response.text;
      if (!raw) {
        throw new Error("Gemini did not return a usable response.");
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
        `Gemini unavailable (attempt ${attempt + 1}/${RETRY_DELAYS_MS.length + 1}), retrying in ${RETRY_DELAYS_MS[attempt]}ms…`,
      );
      await sleep(RETRY_DELAYS_MS[attempt]);
    }
  }
  throw lastError;
}
