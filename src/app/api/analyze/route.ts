import { ApiError } from "@google/genai";
import { NextResponse } from "next/server";

import { CASES } from "@/lib/cases";
import { analyzeCases, MissingApiKeyError } from "@/lib/gemini";

export async function POST() {
  try {
    const results = await analyzeCases(CASES);
    return NextResponse.json({ results });
  } catch (error) {
    if (error instanceof MissingApiKeyError) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (error instanceof ApiError) {
      if (error.status === 401 || error.status === 403) {
        return NextResponse.json(
          { error: "Clé API Gemini manquante ou invalide côté serveur." },
          { status: 500 },
        );
      }
      if (error.status === 429) {
        return NextResponse.json(
          { error: "Limite de débit API atteinte, réessaie dans un instant." },
          { status: 429 },
        );
      }
      return NextResponse.json(
        { error: `Erreur API Gemini : ${error.message}` },
        { status: 502 },
      );
    }
    console.error("Erreur d'analyse de triage:", error);
    return NextResponse.json(
      { error: "Erreur inattendue pendant l'analyse de triage." },
      { status: 500 },
    );
  }
}
