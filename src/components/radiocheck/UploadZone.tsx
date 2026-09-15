"use client";

import { useRef, useState } from "react";

export function UploadZone({
  onFileSelected,
  selectedFile,
  previewUrl,
}: {
  onFileSelected: (file: File) => void;
  selectedFile: File | null;
  previewUrl: string | null;
}) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onFileSelected(file);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onFileSelected(file);
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors ${
        dragActive
          ? "border-blue-500 bg-blue-50"
          : "border-slate-300 bg-white hover:border-slate-400"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg"
        className="hidden"
        onChange={handleInputChange}
      />
      {previewUrl ? (
        <div className="flex flex-col items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="Selected chest X-ray"
            className="max-h-56 rounded-md object-contain"
          />
          <p className="text-sm text-slate-600">{selectedFile?.name}</p>
          <p className="text-xs text-slate-400">Click or drop to replace</p>
        </div>
      ) : (
        <>
          <p className="text-base font-medium text-slate-700">
            Drop chest X-ray here
          </p>
          <p className="mt-1 text-sm text-slate-400">
            or click to browse — PNG, JPG, JPEG
          </p>
        </>
      )}
    </div>
  );
}
