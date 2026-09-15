import "server-only";

import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";

import { TRIAGE_SYSTEM_PROMPT } from "./prompts";
import type { Case, TriageResult } from "./types";

const client = new Anthropic();

const MODEL = "claude-opus-5";

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

export class MissingApiKeyError extends Error {
  constructor() {
    super(
      "ANTHROPIC_API_KEY is not configured on the server (.env.local file in development, Vercel environment variable in production).",
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

// The Anthropic API sometimes returns a transient rate-limit or overload
// error under heavy load. Retry a few times before giving up, so a live
// demo doesn't depend on a single attempt.
const RETRY_DELAYS_MS = [800, 2000, 4000];

function isRetryable(error: unknown): boolean {
  if (error instanceof Anthropic.RateLimitError) return true;
  if (error instanceof Anthropic.APIError && typeof error.status === "number") {
    return error.status >= 500;
  }
  return false;
}

export async function analyzeCases(cases: Case[]): Promise<TriageResult[]> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new MissingApiKeyError();
  }

  let lastError: unknown;
  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    try {
      const response = await client.messages.parse({
        model: MODEL,
        max_tokens: 4096,
        system: TRIAGE_SYSTEM_PROMPT,
        output_config: {
          format: zodOutputFormat(TriageResponseSchema),
          effort: "low",
        },
        messages: [{ role: "user", content: buildUserPrompt(cases) }],
      });

      if (!response.parsed_output) {
        throw new Error("Claude did not return a usable structured response.");
      }

      return response.parsed_output.results;
    } catch (error) {
      lastError = error;
      if (!isRetryable(error) || attempt === RETRY_DELAYS_MS.length) {
        throw error;
      }
      console.warn(
        `Claude unavailable (attempt ${attempt + 1}/${RETRY_DELAYS_MS.length + 1}), retrying in ${RETRY_DELAYS_MS[attempt]}ms…`,
      );
      await sleep(RETRY_DELAYS_MS[attempt]);
    }
  }
  throw lastError;
}
