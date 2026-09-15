"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/analyze", label: "Analyze X-ray" },
  { href: "/queue", label: "Radiology Queue" },
  { href: "/history", label: "History" },
  { href: "/about-ai", label: "About AI" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-slate-200 bg-white">
      <Link
        href="/radiocheck"
        className="flex items-center gap-2 border-b border-slate-100 px-5 py-4 hover:bg-slate-50"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded bg-blue-600 text-sm font-bold text-white">
          R
        </span>
        <span className="text-sm font-semibold text-slate-900">
          RadioCheck AI
        </span>
      </Link>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-slate-100 px-4 py-3 text-[11px] leading-relaxed text-slate-400">
        Research &amp; educational use only — not intended for clinical
        diagnosis.
      </div>
    </aside>
  );
}
