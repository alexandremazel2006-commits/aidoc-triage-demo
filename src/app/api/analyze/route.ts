import { ApiError } from "@google/genai";
import { NextResponse } from "next/server";
import { z } from "zod";

import { analyzeCases, MissingApiKeyError } from "@/lib/gemini";

const CaseInputSchema = z.object({
  id: z.string(),
  patientName: z.string(),
  age: z.number(),
  examType: z.enum(["CT", "X-ray"]),
  bodyPart: z.string(),
  scanKind: z.enum([
    "head-ct",
    "chest-xray",
    "chest-ct",
    "abdomen-ct",
    "limb-xray",
    "spine-xray",
  ]),
  arrivalOffsetMinutes: z.number(),
  clinicalContext: z.string().min(1).max(2000),
});

const RequestSchema = z.object({
  cases: z.array(CaseInputSchema).min(1).max(50),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsedBody = RequestSchema.safeParse(body);
  if (!parsedBody.success) {
    return NextResponse.json(
      { error: "Invalid case list.", details: parsedBody.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const results = await analyzeCases(parsedBody.data.cases);
    return NextResponse.json({ results });
  } catch (error) {
    if (error instanceof MissingApiKeyError) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (error instanceof ApiError) {
      if (error.status === 401 || error.status === 403) {
        return NextResponse.json(
          { error: "Missing or invalid Gemini API key on the server." },
          { status: 500 },
        );
      }
      if (error.status === 429) {
        return NextResponse.json(
          { error: "API rate limit reached, please try again shortly." },
          { status: 429 },
        );
      }
      console.error("Gemini API error:", error.status, error.message);
      return NextResponse.json(
        { error: `Gemini API error: ${error.message}` },
        { status: 502 },
      );
    }
    console.error("Triage analysis error:", error);
    return NextResponse.json(
      { error: "Unexpected error during triage analysis." },
      { status: 500 },
    );
  }
}
