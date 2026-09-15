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
  title: "Aidoc Demo — AI Radiology Triage",
  description:
    "Educational demonstration of how Aidoc, an AI radiology triage system, works. Academic case study, not clinically validated.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-slate-50 text-slate-900">
        <DisclaimerBanner />
        {children}
      </body>
    </html>
  );
}
