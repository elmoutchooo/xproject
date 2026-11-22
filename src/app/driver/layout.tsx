import type { Metadata } from "next";
import "../globals.css";
import { AGENCY } from "@/config/agency";

export const metadata: Metadata = { title: `Chauffeurs – ${AGENCY.name}`, robots: { index: false, follow: false } };
export const viewport = { themeColor: "#2B2220" };

export default function DriverRoot({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-ink-100">{children}</body>
    </html>
  );
}
