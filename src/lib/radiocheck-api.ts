"use client";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_RADIOCHECK_API_URL ?? "http://localhost:8000";

export interface Prediction {
  condition: string;
  score: number;
}

export interface AnalyzeResult {
  exam_id: string;
  patient_id: string;
  patient_age: number | null;
  patient_sex: string | null;
  clinical_indication: string | null;
  predictions: Prediction[];
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  processing_time_seconds: number;
}

export interface AnalyzeParams {
  file: File;
  patientId?: string;
  patientAge?: string;
  patientSex?: string;
  clinicalIndication?: string;
}

export class RadioCheckApiError extends Error {}

export async function analyzeExam(params: AnalyzeParams): Promise<AnalyzeResult> {
  const formData = new FormData();
  formData.append("file", params.file);
  if (params.patientId) formData.append("patient_id", params.patientId);
  if (params.patientAge) formData.append("patient_age", params.patientAge);
  if (params.patientSex) formData.append("patient_sex", params.patientSex);
  if (params.clinicalIndication) {
    formData.append("clinical_indication", params.clinicalIndication);
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/api/exams/analyze`, {
      method: "POST",
      body: formData,
    });
  } catch {
    throw new RadioCheckApiError(
      "Could not reach the RadioCheck AI backend. Is it running on http://localhost:8000?",
    );
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new RadioCheckApiError(
      body?.detail ?? `Analysis failed (HTTP ${response.status}).`,
    );
  }

  return response.json();
}
