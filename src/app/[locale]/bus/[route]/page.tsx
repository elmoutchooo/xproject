import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { fill, formatPrice, getDict, type Locale } from "@/lib/i18n";
import { addMinutes, todayISO } from "@/lib/booking";
import { breadcrumbJsonLd, JsonLd, pageMeta, routeSlug, SITE_URL } from "@/lib/seo";
import { ArrowIcon, BusIcon, ClockIcon } from "@/components/Icons";

export const dynamic = "force-dynamic";

type P = { params: Promise<{ locale: Locale; route: string }> };

async function findRoutes(slug: string) {
  const all = await db.busRoute.findMany({ where: { active: true }, orderBy: { departure: "asc" } });
  return { all, matches: all.filter((r) => routeSlug(r.fromCity, r.toCity) === slug) };
}

const dur = (m: number) => `${Math.floor(m / 60)}h${m % 60 ? String(m % 60).padStart(2, "0") : ""}`;

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { locale, route } = await params;
  const t = getDict(locale);
  const { matches } = await findRoutes(route);
  const r = matches[0];
  if (!r) return {};
  const vars = { from: r.fromCity, to: r.toCity, time: r.departure, duration: dur(r.durationMin), price: formatPrice(r.price) };
  return pageMeta(locale, `bus/${route}`, `${fill(t.bus.routeTitle, vars)} – ${formatPrice(r.price)}`, fill(t.bus.routeDesc, vars));
}

export default async function BusRoutePage({ params }: P) {
  const { locale, route } = await params;
  const t = getDict(locale);
  const { all, matches } = await findRoutes(route);
  if (matches.length === 0) notFound();
  const r = matches[0];
  const vars = { from: r.fromCity, to: r.toCity, time: r.departure, duration: dur(r.durationMin), price: formatPrice(r.price) };
  const title = fill(t.bus.routeTitle, vars);
  const url = `${SITE_URL}/${locale}/bus/${route}`;
  const today = todayISO();
  const others = all.filter((x) => routeSlug(x.fromCity, x.toCity) !== route);

  return (
    <div className="container-x pt-8">
      <JsonLd data={{
        "@context": "https://schema.org", "@type": "BusTrip", name: title, url,
        departureBusStop: { "@type": "BusStop", name: r.fromCity }, arrivalBusStop: { "@type": "BusStop", name: r.toCity },
        provider: { "@id": `${SITE_URL}/#agency` },
        offers: { "@type": "Offer", price: r.price, priceCurrency: "MAD", availability: "https://schema.org/InStock", url },
      }} />
      <JsonLd data={breadcrumbJsonLd([
        { name: t.nav.home, url: `${SITE_URL}/${locale}` },
        { name: t.nav.bus, url: `${SITE_URL}/${locale}/bus` },
        { name: title, url },
      ])} />

      <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
        <Link href={`/${locale}`} className="hover:text-brand-700">{t.nav.home}</Link> / <Link href={`/${locale}/bus`} className="hover:text-brand-700">{t.nav.bus}</Link> / <span className="text-slate-700">{r.fromCity} → {r.toCity}</span>
      </nav>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-700 text-white"><BusIcon className="h-6 w-6" /></span>{title}
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-slate-600">{fill(t.bus.routeDesc, vars)}</p>

          <div className="mt-8 space-y-3">
            {matches.map((m) => (
              <div key={m.id} className="card flex items-center gap-4 p-5">
                <div className="text-center"><p className="text-xl font-bold">{m.departure}</p><p className="text-sm text-slate-500">{m.fromCity}</p></div>
                <div className="flex flex-1 flex-col items-center text-xs text-slate-400">
                  <span className="flex items-center gap-1"><ClockIcon className="h-3.5 w-3.5" />{dur(m.durationMin)}</span>
                  <span className="my-1 h-px w-full bg-slate-200" />
                  <span>{t.bus.daily}</span>
                </div>
                <div className="text-center"><p className="text-xl font-bold">{addMinutes(m.departure, m.durationMin)}</p><p className="text-sm text-slate-500">{m.toCity}</p></div>
                <p className="ml-4 hidden text-lg font-bold sm:block">{formatPrice(m.price)}</p>
              </div>
            ))}
          </div>

          {others.length > 0 && (
            <>
              <h2 className="mt-10 text-lg font-bold text-slate-900">{t.bus.otherRoutes}</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {others.map((o) => (
                  <li key={o.id}><Link href={`/${locale}/bus/${routeSlug(o.fromCity, o.toCity)}`} className="block rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-brand-50 hover:text-brand-700">{o.fromCity} → {o.toCity}</Link></li>
                ))}
              </ul>
            </>
          )}
        </div>

        <aside>
          <form action={`/${locale}/bus`} className="card sticky top-24 space-y-4 p-6">
            <input type="hidden" name="from" value={r.fromCity} />
            <input type="hidden" name="to" value={r.toCity} />
            <p className="font-bold text-slate-900">{t.bus.chooseDate}</p>
            <div>
              <label className="label" htmlFor="date">{t.book.date}</label>
              <input id="date" name="date" type="date" min={today} defaultValue={today} className="input" required />
            </div>
            <div>
              <label className="label" htmlFor="pax">{t.book.passengers}</label>
              <input id="pax" name="pax" type="number" min={1} max={20} defaultValue={1} className="input" />
            </div>
            <button className="btn-primary w-full">{t.search.search}<ArrowIcon className="h-4 w-4" /></button>
          </form>
        </aside>
      </div>
    </div>
  );
}
