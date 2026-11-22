import Link from "next/link";
import { db } from "@/lib/db";
import { getDict, type Locale } from "@/lib/i18n";
import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import PageHeader from "@/components/PageHeader";
import TourCard from "@/components/TourCard";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = getDict(locale);
  return pageMeta(locale, "excursions", `${t.excursions.title} – Marrakech`, t.excursions.subtitle);
}

export default async function ExcursionsPage({ params, searchParams }: { params: Promise<{ locale: Locale }>; searchParams: Promise<{ cat?: string }> }) {
  const { locale } = await params;
  const { cat } = await searchParams;
  const t = getDict(locale);
  const category = cat === "FULL_DAY" || cat === "SHUTTLE" ? cat : undefined;
  const tours = await db.tour.findMany({ where: { active: true, ...(category ? { category } : {}) }, orderBy: [{ category: "asc" }, { createdAt: "asc" }] });
  const filters = [
    { v: undefined, label: t.excursions.all },
    { v: "FULL_DAY", label: t.excursions.fullDay },
    { v: "SHUTTLE", label: t.excursions.shuttle },
  ];

  return (
    <>
      <PageHeader title={t.excursions.title} subtitle={t.excursions.subtitle} />
      <div className="container-x">
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <Link key={f.label} href={`/${locale}/excursions${f.v ? `?cat=${f.v}` : ""}`}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${category === f.v ? "bg-coral-500 text-white" : "bg-ink-100 text-ink-600"}`}>{f.label}</Link>
          ))}
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tours.map((tour, i) => <TourCard key={tour.id} tour={tour} locale={locale} t={t.common} index={i} />)}
        </div>
        {tours.length === 0 && <p className="card p-8 text-center text-ink-500">{t.common.noResults}</p>}
      </div>
    </>
  );
}
