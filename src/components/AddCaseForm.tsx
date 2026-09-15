"use client";

import { useState } from "react";

import type { Case, ExamType, ScanKind } from "@/lib/types";

const SCAN_KIND_OPTIONS: { value: ScanKind; label: string }[] = [
  { value: "head-ct", label: "Head" },
  { value: "chest-xray", label: "Chest (X-ray)" },
  { value: "chest-ct", label: "Chest (CT)" },
  { value: "abdomen-ct", label: "Abdomen" },
  { value: "limb-xray", label: "Limb" },
  { value: "spine-xray", label: "Spine" },
];

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function AddCaseForm({
  onAdd,
  onClose,
}: {
  onAdd: (newCase: Case) => void;
  onClose: () => void;
}) {
  const [patientName, setPatientName] = useState("");
  const [age, setAge] = useState("");
  const [examType, setExamType] = useState<ExamType>("CT");
  const [bodyPart, setBodyPart] = useState("");
  const [scanKind, setScanKind] = useState<ScanKind>("head-ct");
  const [clinicalContext, setClinicalContext] = useState("");
  const [imagePreview, setImagePreview] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    setImagePreview(await fileToDataUrl(file));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsedAge = Number(age);
    if (!patientName.trim() || !bodyPart.trim() || !clinicalContext.trim()) {
      setError("Please fill in patient name, body part, and clinical context.");
      return;
    }
    if (!Number.isFinite(parsedAge) || parsedAge <= 0 || parsedAge > 120) {
      setError("Please enter a valid age.");
      return;
    }

    onAdd({
      id: `custom-${Date.now()}`,
      patientName: patientName.trim(),
      age: parsedAge,
      examType,
      bodyPart: bodyPart.trim(),
      scanKind,
      arrivalOffsetMinutes: 0,
      clinicalContext: clinicalContext.trim(),
      image: imagePreview,
      isCustom: true,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-sm font-semibold text-slate-900">
            Add a case to the worklist
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5">
          <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
            Fictional demo case only — do not enter any real patient
            information or a real medical image.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Patient name (fictional)
              </label>
              <input
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="e.g. Jordan P."
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Age
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="45"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Exam type
              </label>
              <select
                value={examType}
                onChange={(e) => setExamType(e.target.value as ExamType)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="CT">CT</option>
                <option value="X-ray">X-ray</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Region (for the icon)
              </label>
              <select
                value={scanKind}
                onChange={(e) => setScanKind(e.target.value as ScanKind)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              >
                {SCAN_KIND_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Body part (label shown on the case)
            </label>
            <input
              value={bodyPart}
              onChange={(e) => setBodyPart(e.target.value)}
              placeholder="e.g. Chest"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Clinical context (fictional) — this is what the AI reads
            </label>
            <textarea
              value={clinicalContext}
              onChange={(e) => setClinicalContext(e.target.value)}
              rows={3}
              placeholder="e.g. Sudden severe headache with confusion, suspected hemorrhage."
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Illustrative image (optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full text-xs text-slate-500 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-slate-700 hover:file:bg-slate-200"
            />
            {imagePreview && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imagePreview}
                alt="Preview"
                className="mt-2 h-24 w-24 rounded-md object-cover"
              />
            )}
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Add to worklist
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
