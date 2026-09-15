"use client";

import { AnimatePresence, motion } from "framer-motion";

import type { ImageAttribution, ScanKind } from "@/lib/types";

import { ScanIllustration } from "./ScanIllustration";

export function ImageLightbox({
  open,
  image,
  scanKind,
  attribution,
  caption,
  onClose,
}: {
  open: boolean;
  image?: string;
  scanKind: ScanKind;
  attribution?: ImageAttribution;
  caption?: string;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-slate-950/90 px-4 py-8"
          onClick={onClose}
        >
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-md p-2 text-slate-300 hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            ✕
          </button>

          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-full max-w-3xl flex-col items-center"
          >
            <ScanIllustration
              kind={scanKind}
              image={image}
              fit="contain"
              hideLabel
              className="h-[70vh] w-[85vw] max-w-2xl"
            />
            {caption && (
              <p className="mt-4 text-center text-sm text-slate-300">
                {caption}
              </p>
            )}
            {attribution && (
              <p className="mt-1 text-center text-xs text-slate-500">
                Photo: {attribution.license} · {attribution.author} —
                Wikimedia Commons
              </p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
