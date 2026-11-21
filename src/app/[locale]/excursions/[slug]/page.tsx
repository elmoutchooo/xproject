import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { formatPrice, getDict, tr, type Locale } from "@/lib/i18n";
import { todayISO } from "@/lib/booking";
import { breadcrumbJsonLd, JsonLd, pageMeta, SITE_URL } from "@/lib/seo";
import { CheckIcon, ClockIcon, MountainIcon, PinIcon, ShuttleIcon, UsersIcon } from "@/components/Icons";

export const dynamic = "force-dynamic";

type Params = Promise<{ locale: Locale; slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, slug } = await params;
  const tour = await db.tour.findUnique({ where: { slug } });
  if (!tour) return {};
  const m = pageMeta(locale, `excursions/${slug}`, `${tr(tour.title, locale)} – ${tour.price} MAD`, tr(tour.description, locale));
  return tour.imageUrl ? { ...m, openGraph: { ...m.openGraph, images: [tour.imageUrl] } } : m;
}

export default async function TourPage({ params }: { params: Params }) {
  const { locale, slug } = await params;
  const t = getDict(locale);
  const tour = await db.tour.findUnique({ where: { slug } });
  if (!tour || !tour.active) notFound();
  const includes = tr<string[]>(tour.includes, locale);
  const isShuttle = tour.category === "SHUTTLE";

  const url = `${SITE_URL}/${locale}/excursions/${tour.slug}`;
  return (
    <div className="container-x pt-8">
      <JsonLd data={{
        "@context": "https://schema.org", "@type": "TouristTrip",
        name: tr(tour.title, locale), description: tr(tour.description, locale), url,
        ...(tour.imageUrl ? { image: tour.imageUrl } : {}),
        touristType: isShuttle ? "Shuttle" : "Day trip",
        provider: { "@id": `${SITE_URL}/#agency` },
        offers: { "@type": "Offer", price: tour.price, priceCurrency: "MAD", availability: "https://schema.org/InStock", url },
      }} />
      <JsonLd data={breadcrumbJsonLd([
        { name: t.nav.home, url: `${SITE_URL}/${locale}` },
        { name: t.nav.excursions, url: `${SITE_URL}/${locale}/excursions` },
        { name: tr(tour.title, locale), url },
      ])} />
      <Link href={`/${locale}/excursions`} className="text-sm font-medium text-brand-700 hover:underline">← {t.common.back}</Link>
      <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div>
          <div className="relative h-64 overflow-hidden rounded-3xl bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 sm:h-80">
            {tour.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={tour.imageUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full place-items-center text-white/80">{isShuttle ? <ShuttleIcon className="h-24 w-24" /> : <MountainIcon className="h-24 w-24" />}</div>
            )}
          </div>
          <span className="mt-6 inline-block rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">{isShuttle ? t.common.shuttle : t.common.fullDay}</span>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">{tr(tour.title, locale)}</h1>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
            <span className="flex items-center gap-1.5"><ClockIcon className="h-4 w-4" />{t.common.duration}: {tour.durationH}{t.common.hours}</span>
            <span className="flex items-center gap-1.5"><PinIcon className="h-4 w-4" />{t.excursions.meeting} {tour.fromCity} · {tour.departure}</span>
            <span className="flex items-center gap-1.5"><UsersIcon className="h-4 w-4" />{t.common.upTo} {tour.maxPeople} {t.common.people}</span>
          </div>
          <p className="mt-6 leading-relaxed text-slate-700">{tr(tour.description, locale)}</p>
          {includes.length > 0 && (
            <>
              <h2 className="mt-8 text-lg font-bold text-slate-900">{t.common.includes}</h2>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {includes.map((i) => <li key={i} className="flex items-start gap-2 text-slate-700"><CheckIcon className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />{i}</li>)}
              </ul>
            </>
          )}
        </div>

        <aside className="lg:pt-0">
          <form action={`/${locale}/book`} className="card sticky top-24 space-y-4 p-6">
            <input type="hidden" name="type" value="TOUR" />
            <input type="hidden" name="id" value={tour.id} />
            <p className="text-sm text-slate-500">{t.common.from}</p>
            <p className="-mt-3"><span className="text-3xl font-extrabold text-slate-900">{formatPrice(tour.price)}</span> <span className="text-sm text-slate-500">{t.common.perPerson}</span></p>
            <div>
              <label className="label" htmlFor="date">{t.book.date}</label>
              <input id="date" name="date" type="date" min={todayISO()} defaultValue={todayISO()} className="input" required />
            </div>
            <div>
              <label className="label" htmlFor="pax">{t.book.passengers}</label>
              <input id="pax" name="pax" type="number" min={1} max={tour.maxPeople} defaultValue={2} className="input" required />
            </div>
            <button className="btn-primary w-full">{t.common.book}</button>
          </form>
        </aside>
      </div>
    </div>
  );
}
