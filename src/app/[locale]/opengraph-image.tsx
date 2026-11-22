import { ImageResponse } from "next/og";
import { getDict } from "@/lib/i18n";
import { AGENCY } from "@/config/agency";
import { ICON_SVG } from "@/components/brand/iconSvg";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = AGENCY.name;

// Image de partage (Facebook, WhatsApp, LinkedIn...) aux couleurs CS Tours
export default async function OgImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = getDict(locale);
  const icon = `data:image/svg+xml;base64,${Buffer.from(ICON_SVG).toString("base64")}`;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: "#2B2220", color: "white", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={icon} width={96} height={96} alt="" />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 44, fontWeight: 700 }}><span style={{ color: "#E0654F" }}>CS</span><span>&nbsp;TOURS</span></div>
            <div style={{ fontSize: 16, letterSpacing: 6, opacity: 0.75 }}>TRANSPORT TOURISTIQUE</div>
          </div>
        </div>
        <div style={{ fontSize: 60, fontWeight: 700, lineHeight: 1.1, maxWidth: 1000 }}>{t.hero.title}</div>
        <div style={{ display: "flex", gap: 24, fontSize: 28, color: "#E0654F" }}>
          <span>{t.nav.bus}</span><span>·</span><span>{t.nav.transfers}</span><span>·</span><span>{t.nav.excursions}</span>
        </div>
      </div>
    ),
    size,
  );
}
