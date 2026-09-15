"use client";

export const RADIOCHECK_API_BASE_URL =
  process.env.NEXT_PUBLIC_RADIOCHECK_API_URL ?? "http://localhost:8000";

export type Priority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

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
  priority: Priority;
  processing_time_seconds: number;
}

export interface AnalyzeParams {
  file: File;
  patientId?: string;
  patientAge?: string;
  patientSex?: string;
  clinicalIndication?: string;
}

export interface ExamSummary {
  id: string;
  patient_id: string;
  created_at: string;
  priority: Priority;
  review_status: string;
  top_finding: string | null;
  top_score: number | null;
  processing_time: number;
}

export interface ExamDetail {
  id: string;
  patient_id: string;
  patient_age: number | null;
  patient_sex: string | null;
  clinical_indication: string | null;
  image_url: string;
  created_at: string;
  processing_time: number;
  priority: Priority;
  review_status: string;
  predictions: Prediction[];
}

export interface HeatmapResult {
  condition: string;
  image_base64: string;
  heatmap_base64: string;
  available_conditions: string[];
}

export class RadioCheckApiError extends Error {}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${RADIOCHECK_API_BASE_URL}${path}`, init);
  } catch {
    throw new RadioCheckApiError(
      "Could not reach the RadioCheck AI backend. Is it running on http://localhost:8000?",
    );
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new RadioCheckApiError(
      body?.detail ?? `Request failed (HTTP ${response.status}).`,
    );
  }

  return response.json();
}

export async function analyzeExam(params: AnalyzeParams): Promise<AnalyzeResult> {
  const formData = new FormData();
  formData.append("file", params.file);
  if (params.patientId) formData.append("patient_id", params.patientId);
  if (params.patientAge) formData.append("patient_age", params.patientAge);
  if (params.patientSex) formData.append("patient_sex", params.patientSex);
  if (params.clinicalIndication) {
    formData.append("clinical_indication", params.clinicalIndication);
  }

  return request<AnalyzeResult>("/api/exams/analyze", {
    method: "POST",
    body: formData,
  });
}

export function listExams(): Promise<ExamSummary[]> {
  return request<ExamSummary[]>("/api/exams");
}

export function getExam(id: string): Promise<ExamDetail> {
  return request<ExamDetail>(`/api/exams/${id}`);
}

export function getHeatmap(id: string, condition: string): Promise<HeatmapResult> {
  return request<HeatmapResult>(
    `/api/exams/${id}/heatmap?condition=${encodeURIComponent(condition)}`,
  );
}
