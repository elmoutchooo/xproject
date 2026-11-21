import { ImageResponse } from "next/og";
import { getDict } from "@/lib/i18n";
import { AGENCY } from "@/config/agency";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = AGENCY.name;

// Image de partage (Facebook, WhatsApp, LinkedIn...) générée automatiquement
export default async function OgImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = getDict(locale);
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: "linear-gradient(135deg, #0a2524 0%, #1f5f5b 60%, #d9733b 140%)", color: "white", fontFamily: "sans-serif" }}>
        <div style={{ fontSize: 36, fontWeight: 700, opacity: 0.9 }}>{AGENCY.name}</div>
        <div style={{ fontSize: 64, fontWeight: 800, lineHeight: 1.1, maxWidth: 1000 }}>{t.hero.title}</div>
        <div style={{ display: "flex", gap: 24, fontSize: 28, opacity: 0.85 }}>
          <span>{t.nav.bus}</span><span>·</span><span>{t.nav.transfers}</span><span>·</span><span>{t.nav.excursions}</span>
        </div>
      </div>
    ),
    size,
  );
}
