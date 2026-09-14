import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

import { CASES } from "@/lib/cases";
import { analyzeCases } from "@/lib/claude";

export async function POST() {
  try {
    const results = await analyzeCases(CASES);
    return NextResponse.json({ results });
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      return NextResponse.json(
        { error: "Clé API Anthropic manquante ou invalide côté serveur." },
        { status: 500 },
      );
    }
    if (error instanceof Anthropic.RateLimitError) {
      return NextResponse.json(
        { error: "Limite de débit API atteinte, réessaie dans un instant." },
        { status: 429 },
      );
    }
    if (error instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: `Erreur API Claude : ${error.message}` },
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
