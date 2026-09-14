import "server-only";

import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";

import { TRIAGE_SYSTEM_PROMPT } from "./prompts";
import type { Case, TriageResult } from "./types";

const client = new Anthropic();

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

export async function analyzeCases(cases: Case[]): Promise<TriageResult[]> {
  const response = await client.messages.parse({
    model: "claude-opus-5",
    max_tokens: 4096,
    system: TRIAGE_SYSTEM_PROMPT,
    output_config: {
      format: zodOutputFormat(TriageResponseSchema),
      effort: "low",
    },
    messages: [{ role: "user", content: buildUserPrompt(cases) }],
  });

  if (!response.parsed_output) {
    throw new Error("Claude n'a pas renvoyé de sortie structurée exploitable.");
  }

  return response.parsed_output.results;
}
