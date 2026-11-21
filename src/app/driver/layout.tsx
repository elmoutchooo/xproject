import type { Metadata } from "next";
import "../globals.css";
import { AGENCY } from "@/config/agency";

export const metadata: Metadata = { title: `Chauffeurs – ${AGENCY.name}`, robots: { index: false, follow: false } };
export const viewport = { themeColor: "#0a2524" };

export default function DriverRoot({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-slate-100">{children}</body>
    </html>
  );
}
