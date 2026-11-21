import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { locales } from "@/lib/i18n";
import { routeSlug, SITE_URL } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [routes, tours] = await Promise.all([
    db.busRoute.findMany({ where: { active: true }, select: { fromCity: true, toCity: true } }),
    db.tour.findMany({ where: { active: true }, select: { slug: true, createdAt: true } }),
  ]);

  const pages: { path: string; priority: number; freq: "daily" | "weekly" | "monthly" }[] = [
    { path: "", priority: 1, freq: "weekly" },
    { path: "bus", priority: 0.9, freq: "daily" },
    { path: "transfers", priority: 0.9, freq: "weekly" },
    { path: "excursions", priority: 0.9, freq: "weekly" },
    { path: "contact", priority: 0.5, freq: "monthly" },
    { path: "faq", priority: 0.5, freq: "monthly" },
    { path: "terms", priority: 0.2, freq: "monthly" },
    { path: "privacy", priority: 0.2, freq: "monthly" },
    ...[...new Set(routes.map((r) => routeSlug(r.fromCity, r.toCity)))].map((s) => ({ path: `bus/${s}`, priority: 0.8, freq: "weekly" as const })),
    ...tours.map((t) => ({ path: `excursions/${t.slug}`, priority: 0.8, freq: "weekly" as const })),
  ];

  const url = (l: string, p: string) => `${SITE_URL}/${l}${p ? `/${p}` : ""}`;
  return pages.flatMap((p) =>
    locales.map((l) => ({
      url: url(l, p.path),
      lastModified: new Date(),
      changeFrequency: p.freq,
      priority: p.priority,
      alternates: { languages: Object.fromEntries(locales.map((x) => [x, url(x, p.path)])) },
    })),
  );
}
