import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { DisclaimerBanner } from "@/components/DisclaimerBanner";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Démo Aidoc — Triage radiologique IA",
  description:
    "Démonstration pédagogique du fonctionnement d'Aidoc, une IA de triage radiologique. Étude de cas académique, non cliniquement validée.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-slate-50 text-slate-900">
        <DisclaimerBanner />
        {children}
      </body>
    </html>
  );
}
