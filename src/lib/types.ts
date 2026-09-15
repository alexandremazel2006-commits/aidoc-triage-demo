export type ExamType = "CT" | "X-ray";

export type ScanKind =
  | "head-ct"
  | "chest-xray"
  | "chest-ct"
  | "abdomen-ct"
  | "limb-xray"
  | "spine-xray";

export type UrgencyCategory = "critical" | "urgent" | "routine";

export interface ImageAttribution {
  author: string;
  license: string;
  sourceUrl: string;
}

export interface Case {
  id: string;
  patientName: string;
  age: number;
  examType: ExamType;
  bodyPart: string;
  scanKind: ScanKind;
  arrivalOffsetMinutes: number; // minutes before "now", used to build a realistic FIFO queue
  clinicalContext: string; // short fictional note (reason for exam) fed to the AI
  image?: string; // path or data URL for the illustrative photo; falls back to an SVG silhouette
  attribution?: ImageAttribution; // credit for real photos sourced from an open-license dataset
  isCustom?: boolean; // true for cases added live through the "Add a case" form
}

export interface TriageResult {
  caseId: string;
  urgency_score: number; // 0-100
  category: UrgencyCategory;
  rationale: string;
  disclaimer: string;
}

export interface AnalyzedCase extends Case {
  triage: TriageResult | null;
  radiologistDecision: "pending" | "confirmed" | "rejected";
}
