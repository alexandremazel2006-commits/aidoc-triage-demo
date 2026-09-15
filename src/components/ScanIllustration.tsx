import type { ScanKind } from "@/lib/types";

// Abstract vector silhouettes used as a fallback when no photo is
// available — not real medical imagery.
function Silhouette({ kind }: { kind: ScanKind }) {
  const stroke = "#93a5c4";
  const fill = "none";
  switch (kind) {
    case "head-ct":
      return (
        <g stroke={stroke} strokeWidth={2} fill={fill} strokeLinecap="round">
          <ellipse cx="50" cy="46" rx="26" ry="30" />
          <path d="M30 62 q20 14 40 0" />
          <path d="M38 38 q12 -8 24 0" />
          <circle cx="50" cy="48" r="10" strokeDasharray="3 3" />
        </g>
      );
    case "chest-xray":
    case "chest-ct":
      return (
        <g stroke={stroke} strokeWidth={2} fill={fill} strokeLinecap="round">
          <path d="M50 20 v54" />
          <path d="M50 26 q-22 2 -26 30 q-1 14 8 18 q10 4 18 -10" />
          <path d="M50 26 q22 2 26 30 q1 14 -8 18 q-10 4 -18 -10" />
          <path d="M32 40 q18 -4 36 0" opacity="0.5" />
          <path d="M30 50 q20 -4 40 0" opacity="0.5" />
        </g>
      );
    case "abdomen-ct":
      return (
        <g stroke={stroke} strokeWidth={2} fill={fill} strokeLinecap="round">
          <rect x="26" y="24" width="48" height="52" rx="20" />
          <circle cx="50" cy="50" r="14" strokeDasharray="3 3" />
          <path d="M38 50 h24" opacity="0.5" />
        </g>
      );
    case "limb-xray":
      return (
        <g stroke={stroke} strokeWidth={2} fill={fill} strokeLinecap="round">
          <path d="M40 18 L44 46 L38 82" />
          <path d="M60 18 L56 46 L62 82" />
          <path d="M38 46 h24" opacity="0.6" />
          <path d="M36 30 h8 M56 30 h8" opacity="0.6" />
        </g>
      );
    case "spine-xray":
      return (
        <g stroke={stroke} strokeWidth={2} fill={fill} strokeLinecap="round">
          <path d="M50 16 q6 8 0 16 q-6 8 0 16 q6 8 0 16 q-6 8 0 16 q6 8 0 4" />
          {Array.from({ length: 6 }).map((_, i) => (
            <line
              key={i}
              x1="38"
              x2="62"
              y1={22 + i * 11}
              y2={22 + i * 11}
              opacity="0.4"
            />
          ))}
        </g>
      );
    default:
      return null;
  }
}

export function ScanIllustration({
  kind,
  image,
  className = "",
}: {
  kind: ScanKind;
  image?: string;
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-md bg-slate-900 ${className}`}
      aria-hidden
    >
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt="" className="h-full w-full object-cover" />
      ) : (
        <svg viewBox="0 0 100 100" className="h-full w-full">
          <rect x="0" y="0" width="100" height="100" fill="#0f172a" />
          <Silhouette kind={kind} />
        </svg>
      )}
      <span className="absolute bottom-0.5 left-0.5 right-0.5 rounded-sm bg-black/50 px-1 py-0.5 text-center text-[6px] uppercase tracking-wide text-slate-300">
        Illustrative image
      </span>
    </div>
  );
}
