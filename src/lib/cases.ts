import { Case } from "./types";

/**
 * Fictional cases for this demonstration. No real patients, no real medical
 * data. `arrivalOffsetMinutes` fixes the FIFO order in which cases arrived
 * in the PACS (the larger the value, the earlier the case arrived).
 *
 * Photos: real, open-license radiology images (normal anatomy, no visible
 * pathology) sourced from Wikimedia Commons. Full credits in README.md.
 */
export const CASES: Case[] = [
  {
    id: "c1",
    patientName: "Amara N.",
    age: 58,
    examType: "CT",
    bodyPart: "Chest",
    scanKind: "chest-ct",
    arrivalOffsetMinutes: 95,
    clinicalContext:
      "Sudden-onset chest pain with tachycardia and mild desaturation; suspected pulmonary embolism.",
    image: "/images/cases/c1.jpg",
    attribution: {
      author: "Mikael Häggström, M.D.",
      license: "CC0",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/Scrollable_high-resolution_computed_tomography_images_of_a_normal_thorax",
    },
  },
  {
    id: "c2",
    patientName: "Julien K.",
    age: 74,
    examType: "CT",
    bodyPart: "Head",
    scanKind: "head-ct",
    arrivalOffsetMinutes: 88,
    clinicalContext:
      "Fall at home with brief loss of consciousness; patient on anticoagulants, worsening headache since the fall.",
    image: "/images/cases/c2.png",
    attribution: {
      author: "Mikael Häggström, M.D.",
      license: "CC0",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:CT_of_a_normal_brain,_axial_10.png",
    },
  },
  {
    id: "c3",
    patientName: "Sophie M.",
    age: 29,
    examType: "X-ray",
    bodyPart: "Wrist",
    scanKind: "limb-xray",
    arrivalOffsetMinutes: 82,
    clinicalContext:
      "Wrist pain after a cycling fall the day before; check-up before returning to sport.",
    image: "/images/cases/c3.jpg",
    attribution: {
      author: "Mikael Häggström, M.D.",
      license: "CC0",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:X-ray_of_normal_wrist_by_lateral_projection.jpg",
    },
  },
  {
    id: "c4",
    patientName: "Marc T.",
    age: 61,
    examType: "X-ray",
    bodyPart: "Chest",
    scanKind: "chest-xray",
    arrivalOffsetMinutes: 76,
    clinicalContext: "Routine pre-operative work-up before scheduled knee surgery.",
    image: "/images/cases/c4.png",
    attribution: {
      author: "Stillwaterising",
      license: "CC0",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Chest_Xray_PA_3-8-2010.png",
    },
  },
  {
    id: "c5",
    patientName: "Elena R.",
    age: 67,
    examType: "CT",
    bodyPart: "Head",
    scanKind: "head-ct",
    arrivalOffsetMinutes: 70,
    clinicalContext:
      "Sudden, unusual headache described as 'the worst of her life', transient confusion; suspected hemorrhagic stroke.",
    image: "/images/cases/c5.png",
    attribution: {
      author: "Mikael Häggström, M.D.",
      license: "CC0",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:CT_of_a_normal_brain_(thumbnail).png",
    },
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
      "Rapid-onset diffuse abdominal pain, fever at 38.9°C, guarding on palpation.",
    image: "/images/cases/c6.png",
    attribution: {
      author: "Mikael Häggström, M.D.",
      license: "CC0",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:CT_of_a_normal_abdomen_and_pelvis,_axial_plane_94.png",
    },
  },
  {
    id: "c7",
    patientName: "Nadia F.",
    age: 52,
    examType: "X-ray",
    bodyPart: "Lumbar spine",
    scanKind: "spine-xray",
    arrivalOffsetMinutes: 57,
    clinicalContext: "Known chronic lower back pain, scheduled 6-month follow-up.",
    image: "/images/cases/c7.jpg",
    attribution: {
      author: "Bonepit Collection, UC San Diego",
      license: "Public Domain",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:X-ray_of_the_cervical_spine_of_a_20_year_old_male_-_lateral.jpg",
    },
  },
  {
    id: "c8",
    patientName: "Thomas L.",
    age: 70,
    examType: "CT",
    bodyPart: "Chest",
    scanKind: "chest-ct",
    arrivalOffsetMinutes: 50,
    clinicalContext:
      "Progressively worsening shortness of breath over 48h, history of colon cancer; suspected pulmonary embolism.",
    image: "/images/cases/c8.jpg",
    attribution: {
      author: "Mikael Häggström, M.D.",
      license: "CC0",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/Scrollable_high-resolution_computed_tomography_images_of_a_normal_thorax",
    },
  },
  {
    id: "c9",
    patientName: "Isabelle D.",
    age: 34,
    examType: "X-ray",
    bodyPart: "Ankle",
    scanKind: "limb-xray",
    arrivalOffsetMinutes: 44,
    clinicalContext: "Ankle sprain during a football match, unable to bear weight.",
    image: "/images/cases/c9.jpg",
    attribution: {
      author: "Mikael Häggström, M.D.",
      license: "CC0",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:X-ray_of_normal_ankle_-_lateral.jpg",
    },
  },
  {
    id: "c10",
    patientName: "Youssef A.",
    age: 22,
    examType: "CT",
    bodyPart: "Head",
    scanKind: "head-ct",
    arrivalOffsetMinutes: 37,
    clinicalContext:
      "Mild head trauma with no loss of consciousness; routine work-up in the emergency department.",
    image: "/images/cases/c10.jpg",
    attribution: {
      author: "Andrew Ciscel",
      license: "CC BY-SA 2.0",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Head_CT_scan.jpg",
    },
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
      "Right lower quadrant pain for 12 hours with nausea; suspected appendicitis.",
    image: "/images/cases/c11.png",
    attribution: {
      author: "Mikael Häggström, M.D.",
      license: "CC0",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:CT_of_a_normal_abdomen_and_pelvis,_axial_plane_22.png",
    },
  },
  {
    id: "c12",
    patientName: "Hugo V.",
    age: 55,
    examType: "X-ray",
    bodyPart: "Chest",
    scanKind: "chest-xray",
    arrivalOffsetMinutes: 18,
    clinicalContext: "Routine post-operative check, asymptomatic patient.",
    image: "/images/cases/c12.jpg",
    attribution: {
      author: "Mikael Häggström, M.D.",
      license: "CC0",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Normal_posteroanterior_(PA)_chest_radiograph_(X-ray).jpg",
    },
  },
  {
    id: "c13",
    patientName: "Aisha O.",
    age: 63,
    examType: "CT",
    bodyPart: "Head",
    scanKind: "head-ct",
    arrivalOffsetMinutes: 8,
    clinicalContext:
      "Sudden right-sided weakness and slurred speech that started 40 minutes ago; suspected acute stroke.",
    image: "/images/cases/c13.jpg",
    attribution: {
      author: "Goleisureintl",
      license: "CC BY 4.0",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:CT_Brain_Scan.jpg",
    },
  },
];

export function formatArrival(offsetMinutes: number): string {
  if (offsetMinutes <= 0) return "just now";
  const hours = Math.floor(offsetMinutes / 60);
  const minutes = offsetMinutes % 60;
  if (hours === 0) return `${minutes} min ago`;
  if (minutes === 0) return `${hours} h ago`;
  return `${hours} h ${minutes} min ago`;
}
