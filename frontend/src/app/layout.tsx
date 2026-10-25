import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lucina AI - Technical Healthcare & Athletic Suite",
  description: "Interdisciplinary Endocrine & Athletic Intelligence Engine for recHERsion 2026",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-800 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
