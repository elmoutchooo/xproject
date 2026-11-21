import Link from "next/link";
import { db } from "@/lib/db";
import { formatDate, formatPrice, getDict, type Locale } from "@/lib/i18n";
import { addMinutes, busSeatsLeft, todayISO } from "@/lib/booking";
import type { Metadata } from "next";
import { pageMeta, routeSlug } from "@/lib/seo";
import PageHeader from "@/components/PageHeader";
import { ArrowIcon, ClockIcon } from "@/components/Icons";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = getDict(locale);
  return pageMeta(locale, "bus", t.bus.seo, t.bus.subtitle);
}

type SP = { from?: string; to?: string; date?: string; pax?: string };

export default async function BusPage({ params, searchParams }: { params: Promise<{ locale: Locale }>; searchParams: Promise<SP> }) {
  const { locale } = await params;
  const sp = await searchParams;
  const t = getDict(locale);
  const today = todayISO();
  const date = sp.date && sp.date >= today ? sp.date : today;
  const pax = Math.max(1, Math.min(20, Number(sp.pax) || 1));

  const all = await db.busRoute.findMany({ where: { active: true }, orderBy: [{ fromCity: "asc" }, { departure: "asc" }] });
  const routes = all.filter((r) => (!sp.from || r.fromCity === sp.from) && (!sp.to || r.toCity === sp.to));
  const withSeats = await Promise.all(routes.map(async (r) => ({ ...r, left: await busSeatsLeft(r.id, r.seats, date) })));
  const fromCities = [...new Set(all.map((r) => r.fromCity))].sort();
  const toCities = [...new Set(all.map((r) => r.toCity))].sort();

  return (
    <>
      <PageHeader title={t.bus.title} subtitle={t.bus.subtitle} />
      <div className="container-x">
        <form className="card grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-5 lg:items-end">
          <div>
            <label className="label" htmlFor="from">{t.search.from}</label>
            <select id="from" name="from" defaultValue={sp.from ?? ""} className="input">
              <option value="">{t.search.any}</option>
              {fromCities.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="to">{t.search.to}</label>
            <select id="to" name="to" defaultValue={sp.to ?? ""} className="input">
              <option value="">{t.search.any}</option>
              {toCities.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="date">{t.search.date}</label>
            <input id="date" name="date" type="date" min={today} defaultValue={date} className="input" />
          </div>
          <div>
            <label className="label" htmlFor="pax">{t.search.passengers}</label>
            <input id="pax" name="pax" type="number" min={1} max={20} defaultValue={pax} className="input" />
          </div>
          <button className="btn-dark h-[42px]">{t.search.search}</button>
        </form>

        <nav aria-label={t.bus.allRoutes} className="mt-6 flex flex-wrap gap-2">
          {all.map((r) => (
            <Link key={r.id} href={`/${locale}/bus/${routeSlug(r.fromCity, r.toCity)}`} className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-brand-50 hover:text-brand-700">
              {r.fromCity} → {r.toCity}
            </Link>
          ))}
        </nav>

        <p className="mt-8 text-sm font-medium capitalize text-slate-500">{formatDate(date, locale)}</p>
        <div className="mt-3 space-y-3">
          {withSeats.length === 0 && <p className="card p-8 text-center text-slate-500">{t.common.noResults}</p>}
          {withSeats.map((r) => {
            const enough = r.left >= pax;
            return (
              <div key={r.id} className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                <div className="flex flex-1 items-center gap-4">
                  <div className="text-center">
                    <p className="text-xl font-bold text-slate-900">{r.departure}</p>
                    <p className="text-sm text-slate-500">{r.fromCity}</p>
                  </div>
                  <div className="flex flex-1 flex-col items-center px-2 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><ClockIcon className="h-3.5 w-3.5" />{Math.floor(r.durationMin / 60)}{t.common.hours}{r.durationMin % 60 ? String(r.durationMin % 60).padStart(2, "0") : ""}</span>
                    <span className="my-1 h-px w-full bg-slate-200" />
                    <span>{t.bus.daily}</span>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-slate-900">{addMinutes(r.departure, r.durationMin)}</p>
                    <p className="text-sm text-slate-500">{r.toCity}</p>
                  </div>
                </div>
                <Link href={`/${locale}/bus/${routeSlug(r.fromCity, r.toCity)}`} className="text-xs font-medium text-brand-700 hover:underline sm:hidden">{t.common.details}</Link>
                <div className="flex items-center justify-between gap-6 border-t border-slate-100 pt-4 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
                  <div>
                    <p className="text-lg font-bold text-slate-900">{formatPrice(r.price)}</p>
                    <p className={`text-xs font-medium ${r.left === 0 ? "text-rose-600" : r.left < 10 ? "text-amber-600" : "text-emerald-600"}`}>
                      {r.left === 0 ? t.common.soldOut : `${r.left} ${t.common.seatsLeft}`}
                    </p>
                  </div>
                  {enough ? (
                    <Link href={`/${locale}/book?type=BUS&id=${r.id}&date=${date}&pax=${pax}`} className="btn-primary">{t.common.book}<ArrowIcon className="h-4 w-4" /></Link>
                  ) : (
                    <span className="btn-ghost cursor-not-allowed opacity-60">{t.common.soldOut}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
