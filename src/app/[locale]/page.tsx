import Link from "next/link";
import { db } from "@/lib/db";
import { getDict, type Locale } from "@/lib/i18n";
import { todayISO } from "@/lib/booking";
import { agencyJsonLd, JsonLd, pageMeta } from "@/lib/seo";
import type { Metadata } from "next";
import { AGENCY } from "@/config/agency";
import SearchBox from "@/components/SearchBox";
import TourCard from "@/components/TourCard";
import { ArrowIcon, BusIcon, CheckIcon, ClockIcon, MountainIcon, PlaneIcon, ShieldIcon, ShuttleIcon, StarIcon, UsersIcon } from "@/components/Icons";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = getDict(locale);
  const m = pageMeta(locale, "", t.hero.title, t.hero.subtitle);
  return { ...m, title: { absolute: `${t.hero.title} | ${AGENCY.name}` } };
}

export default async function Home({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = getDict(locale);
  const [routes, transfers, tours] = await Promise.all([
    db.busRoute.findMany({ where: { active: true }, select: { fromCity: true, toCity: true } }),
    db.transfer.findMany({ where: { active: true }, select: { airport: true }, distinct: ["airport"] }),
    db.tour.findMany({ where: { active: true, category: "FULL_DAY" }, take: 3, orderBy: { createdAt: "asc" } }),
  ]);
  const uniq = (a: string[]) => [...new Set(a)].sort();
  const cities = { from: uniq(routes.map((r) => r.fromCity)), to: uniq(routes.map((r) => r.toCity)) };

  const services = [
    { ...t.services.bus, icon: <BusIcon className="h-6 w-6" />, href: "bus" },
    { ...t.services.transfer, icon: <PlaneIcon className="h-6 w-6" />, href: "transfers" },
    { ...t.services.shuttle, icon: <ShuttleIcon className="h-6 w-6" />, href: "excursions?cat=SHUTTLE" },
    { ...t.services.tour, icon: <MountainIcon className="h-6 w-6" />, href: "excursions?cat=FULL_DAY" },
  ];
  const whyIcons = [<UsersIcon key="1" className="h-6 w-6" />, <ShieldIcon key="2" className="h-6 w-6" />, <CheckIcon key="3" className="h-6 w-6" />, <ClockIcon key="4" className="h-6 w-6" />];

  return (
    <>
      <JsonLd data={agencyJsonLd(locale, t.hero.subtitle)} />
      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-950">
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "28px 28px" }} />
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-accent-500/30 blur-3xl" />
        <div className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-brand-500/30 blur-3xl" />
        <div className="container-x relative pb-28 pt-16 sm:pt-24">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-brand-100">
            <ShieldIcon className="h-4 w-4" />{t.hero.badge}
          </span>
          <h1 className="mt-5 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">{t.hero.title}</h1>
          <p className="mt-5 max-w-2xl text-lg text-brand-100/90">{t.hero.subtitle}</p>
        </div>
      </section>

      <div className="container-x relative z-10 -mt-20">
        <SearchBox locale={locale} t={t.search} cities={cities} airports={transfers.map((x) => x.airport)} today={todayISO()} labels={{ fullDay: t.common.fullDay, shuttle: t.common.shuttle }} />
      </div>

      {/* Services */}
      <section className="container-x mt-20">
        <h2 className="h-section">{t.services.title}</h2>
        <p className="mt-2 text-slate-600">{t.services.subtitle}</p>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s) => (
            <Link key={s.href} href={`/${locale}/${s.href}`} className="card group p-6 transition hover:border-brand-200 hover:shadow-md">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-brand-700 transition group-hover:bg-brand-700 group-hover:text-white">{s.icon}</span>
              <h3 className="mt-4 font-bold text-slate-900">{s.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.d}</p>
              <ArrowIcon className="mt-4 h-5 w-5 text-brand-600 transition group-hover:translate-x-1" />
            </Link>
          ))}
        </div>
      </section>

      {/* Popular tours */}
      <section className="container-x mt-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="h-section">{t.popular.title}</h2>
          <Link href={`/${locale}/excursions`} className="flex items-center gap-1 text-sm font-semibold text-brand-700 hover:text-brand-900">
            {t.popular.viewAll}<ArrowIcon className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tours.map((tour, i) => <TourCard key={tour.id} tour={tour} locale={locale} t={t.common} index={i} />)}
        </div>
      </section>

      {/* Why us */}
      <section className="mt-20 bg-sand-50 py-16">
        <div className="container-x">
          <h2 className="h-section text-center">{t.why.title}</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {t.why.items.map((w, i) => (
              <div key={w.t} className="text-center">
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white text-accent-500 shadow-sm">{whyIcons[i]}</span>
                <h3 className="mt-4 font-bold text-slate-900">{w.t}</h3>
                <p className="mt-1 text-sm text-slate-600">{w.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="container-x mt-20">
        <h2 className="h-section">{t.reviews.title}</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {t.reviews.items.map((r) => (
            <figure key={r.n} className="card p-6">
              <div className="flex gap-0.5 text-amber-400">{[0, 1, 2, 3, 4].map((i) => <StarIcon key={i} />)}</div>
              <blockquote className="mt-3 text-slate-700">“{r.t}”</blockquote>
              <figcaption className="mt-4 text-sm font-semibold text-slate-900">{r.n}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container-x mt-20">
        <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-gradient-to-r from-brand-800 to-brand-600 p-8 text-white sm:flex-row sm:items-center sm:p-12">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">{t.cta.title}</h2>
            <p className="mt-2 text-brand-100">{t.cta.text}</p>
          </div>
          <Link href={`/${locale}/excursions`} className="btn-primary shrink-0 px-6 py-3.5">{t.cta.button}<ArrowIcon className="h-4 w-4" /></Link>
        </div>
      </section>
    </>
  );
}
