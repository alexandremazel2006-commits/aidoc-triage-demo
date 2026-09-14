import { Case } from "./types";

/**
 * Cas fictifs pour la démonstration. Aucun patient réel, aucune donnée
 * médicale réelle. `arrivalOffsetMinutes` fixe l'ordre FIFO d'arrivée dans
 * le PACS (plus la valeur est grande, plus le cas est arrivé tôt).
 */
export const CASES: Case[] = [
  {
    id: "c1",
    patientName: "Amara N.",
    age: 58,
    examType: "CT",
    bodyPart: "Thorax",
    scanKind: "chest-ct",
    arrivalOffsetMinutes: 95,
    clinicalContext:
      "Douleur thoracique brutale associée à une tachycardie et une légère désaturation ; suspicion d'embolie pulmonaire.",
  },
  {
    id: "c2",
    patientName: "Julien K.",
    age: 74,
    examType: "CT",
    bodyPart: "Crâne",
    scanKind: "head-ct",
    arrivalOffsetMinutes: 88,
    clinicalContext:
      "Chute à domicile avec perte de connaissance brève ; patient anticoagulé, céphalées croissantes depuis la chute.",
  },
  {
    id: "c3",
    patientName: "Sophie M.",
    age: 29,
    examType: "X-ray",
    bodyPart: "Poignet",
    scanKind: "limb-xray",
    arrivalOffsetMinutes: 82,
    clinicalContext:
      "Douleur au poignet après une chute à vélo la veille, contrôle avant reprise du sport.",
  },
  {
    id: "c4",
    patientName: "Marc T.",
    age: 61,
    examType: "X-ray",
    bodyPart: "Thorax",
    scanKind: "chest-xray",
    arrivalOffsetMinutes: 76,
    clinicalContext:
      "Bilan pré-opératoire systématique avant chirurgie programmée du genou.",
  },
  {
    id: "c5",
    patientName: "Elena R.",
    age: 67,
    examType: "CT",
    bodyPart: "Crâne",
    scanKind: "head-ct",
    arrivalOffsetMinutes: 70,
    clinicalContext:
      "Céphalée brutale et inhabituelle décrite comme 'la pire de sa vie', confusion transitoire ; suspicion d'AVC hémorragique.",
  },
  {
    id: "c6",
    patientName: "Karim B.",
    age: 45,
    examType: "CT",
    bodyPart: "Abdomen",
    scanKind: "abdomen-ct",
    arrivalOffsetMinutes: 63,
    clinicalContext:
      "Douleur abdominale diffuse d'apparition rapide, fièvre à 38,9°C, défense à la palpation.",
  },
  {
    id: "c7",
    patientName: "Nadia F.",
    age: 52,
    examType: "X-ray",
    bodyPart: "Rachis lombaire",
    scanKind: "spine-xray",
    arrivalOffsetMinutes: 57,
    clinicalContext:
      "Lombalgie chronique connue, contrôle de suivi programmé à 6 mois.",
  },
  {
    id: "c8",
    patientName: "Thomas L.",
    age: 70,
    examType: "CT",
    bodyPart: "Thorax",
    scanKind: "chest-ct",
    arrivalOffsetMinutes: 50,
    clinicalContext:
      "Dyspnée d'aggravation progressive sur 48h, antécédent de cancer colique ; suspicion d'embolie pulmonaire.",
  },
  {
    id: "c9",
    patientName: "Isabelle D.",
    age: 34,
    examType: "X-ray",
    bodyPart: "Cheville",
    scanKind: "limb-xray",
    arrivalOffsetMinutes: 44,
    clinicalContext:
      "Entorse de cheville lors d'un match de football, impossibilité d'appui.",
  },
  {
    id: "c10",
    patientName: "Youssef A.",
    age: 22,
    examType: "CT",
    bodyPart: "Crâne",
    scanKind: "head-ct",
    arrivalOffsetMinutes: 37,
    clinicalContext:
      "Traumatisme crânien léger sans perte de connaissance, bilan systématique aux urgences.",
  },
  {
    id: "c11",
    patientName: "Claire P.",
    age: 26,
    examType: "CT",
    bodyPart: "Abdomen",
    scanKind: "abdomen-ct",
    arrivalOffsetMinutes: 30,
    clinicalContext:
      "Douleur en fosse iliaque droite depuis 12h avec nausées ; suspicion d'appendicite.",
  },
  {
    id: "c12",
    patientName: "Hugo V.",
    age: 55,
    examType: "X-ray",
    bodyPart: "Thorax",
    scanKind: "chest-xray",
    arrivalOffsetMinutes: 18,
    clinicalContext:
      "Contrôle radiologique de routine post-opératoire, patient asymptomatique.",
  },
  {
    id: "c13",
    patientName: "Aisha O.",
    age: 63,
    examType: "CT",
    bodyPart: "Crâne",
    scanKind: "head-ct",
    arrivalOffsetMinutes: 8,
    clinicalContext:
      "Faiblesse brutale de l'hémicorps droit et trouble soudain de la parole débutés il y a 40 minutes ; suspicion d'AVC aigu.",
  },
];

export function formatArrival(offsetMinutes: number): string {
  const hours = Math.floor(offsetMinutes / 60);
  const minutes = offsetMinutes % 60;
  if (hours === 0) return `il y a ${minutes} min`;
  if (minutes === 0) return `il y a ${hours} h`;
  return `il y a ${hours} h ${minutes} min`;
}
