export type ExamType = "CT" | "X-ray";

export type ScanKind =
  | "head-ct"
  | "chest-xray"
  | "chest-ct"
  | "abdomen-ct"
  | "limb-xray"
  | "spine-xray";

export type UrgencyCategory = "critical" | "urgent" | "routine";

export interface Case {
  id: string;
  patientName: string;
  age: number;
  examType: ExamType;
  bodyPart: string;
  scanKind: ScanKind;
  arrivalOffsetMinutes: number; // minutes before "now", for building a realistic FIFO queue
  clinicalContext: string; // brève note fictive (motif d'examen) fournie à l'IA
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
