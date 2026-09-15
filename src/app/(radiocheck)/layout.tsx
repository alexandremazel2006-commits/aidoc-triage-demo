import type { Metadata } from "next";

import { Sidebar } from "@/components/radiocheck/Sidebar";

export const metadata: Metadata = {
  title: {
    template: "%s — RadioCheck AI",
    default: "RadioCheck AI",
  },
};

export default function RadioCheckLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-slate-50 px-6 py-6 sm:px-8">
        {children}
      </main>
    </div>
  );
}
