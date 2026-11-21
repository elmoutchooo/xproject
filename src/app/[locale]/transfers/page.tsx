import Link from "next/link";
import { db } from "@/lib/db";
import { formatPrice, getDict, type Locale } from "@/lib/i18n";
import type { Metadata } from "next";
import { JsonLd, pageMeta, SITE_URL } from "@/lib/seo";
import PageHeader from "@/components/PageHeader";
import { ArrowIcon, PlaneIcon, UsersIcon } from "@/components/Icons";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = getDict(locale);
  return pageMeta(locale, "transfers", `${t.transfers.title}: Marrakech, Casablanca, Agadir`, t.transfers.subtitle);
}

export default async function TransfersPage({ params, searchParams }: { params: Promise<{ locale: Locale }>; searchParams: Promise<{ airport?: string }> }) {
  const { locale } = await params;
  const { airport } = await searchParams;
  const t = getDict(locale);
  const all = await db.transfer.findMany({ where: { active: true }, orderBy: [{ airport: "asc" }, { destination: "asc" }, { price: "asc" }] });
  const airports = [...new Set(all.map((x) => x.airport))];
  const list = airport ? all.filter((x) => x.airport === airport) : all;
  const groups = airports.filter((a) => !airport || a === airport).map((a) => ({ airport: a, items: list.filter((x) => x.airport === a) }));

  return (
    <>
      <JsonLd data={{
        "@context": "https://schema.org", "@type": "ItemList",
        itemListElement: all.map((x, i) => ({
          "@type": "ListItem", position: i + 1,
          item: {
            "@type": "Service", serviceType: "Airport transfer", name: `${x.airport} → ${x.destination}`,
            provider: { "@id": `${SITE_URL}/#agency` }, areaServed: "Morocco",
            offers: { "@type": "Offer", price: x.price, priceCurrency: "MAD", url: `${SITE_URL}/${locale}/transfers` },
          },
        })),
      }} />
      <PageHeader title={t.transfers.title} subtitle={t.transfers.subtitle} />
      <div className="container-x">
        <ol className="grid gap-4 sm:grid-cols-3">
          {t.transfers.steps.map((s, i) => (
            <li key={s} className="card flex items-center gap-4 p-5">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent-500 font-bold text-white">{i + 1}</span>
              <span className="text-sm font-medium text-slate-700">{s}</span>
            </li>
          ))}
        </ol>

        <div className="mt-10 flex flex-wrap gap-2">
          <Link href={`/${locale}/transfers`} className={`rounded-full px-4 py-2 text-sm font-semibold ${!airport ? "bg-brand-700 text-white" : "bg-slate-100 text-slate-600"}`}>{t.search.any}</Link>
          {airports.map((a) => (
            <Link key={a} href={`/${locale}/transfers?airport=${encodeURIComponent(a)}`} className={`rounded-full px-4 py-2 text-sm font-semibold ${airport === a ? "bg-brand-700 text-white" : "bg-slate-100 text-slate-600"}`}>{a}</Link>
          ))}
        </div>

        {groups.map((g) => (
          <section key={g.airport} className="mt-8">
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900"><PlaneIcon className="h-5 w-5 text-brand-600" />{g.airport}</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {g.items.map((x) => (
                <div key={x.id} className="card flex items-center justify-between gap-4 p-5">
                  <div>
                    <p className="font-semibold text-slate-900">{x.destination}</p>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                      <UsersIcon className="h-4 w-4" />{t.common.vehicles[x.vehicle as keyof typeof t.common.vehicles] ?? x.vehicle} · {x.capacity} {t.transfers.capacity}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-lg font-bold text-slate-900">{formatPrice(x.price)}</p>
                      <p className="text-xs text-slate-500">{t.common.perVehicle}</p>
                    </div>
                    <Link href={`/${locale}/book?type=TRANSFER&id=${x.id}`} className="btn-primary px-4" aria-label={t.common.book}>
                      {t.common.book}<ArrowIcon className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
