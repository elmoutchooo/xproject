import Link from "next/link";
import { db } from "@/lib/db";
import { getDict, type Locale } from "@/lib/i18n";
import { todayISO } from "@/lib/booking";
import { agencyJsonLd, JsonLd, pageMeta } from "@/lib/seo";
import type { Metadata } from "next";
import { AGENCY } from "@/config/agency";
import SearchBox from "@/components/SearchBox";
import TourCard from "@/components/TourCard";
import Reveal from "@/components/Reveal";
import AnimatedMark from "@/components/brand/AnimatedMark";
import Minibus from "@/components/brand/Minibus";
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
      <section className="relative overflow-hidden bg-ink-900">
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "28px 28px" }} />
        <div className="absolute -right-24 -top-32 h-[28rem] w-[28rem] animate-float rounded-full bg-coral-500/35 blur-3xl" />
        <div className="absolute -bottom-48 -left-24 h-[26rem] w-[26rem] animate-float-slow rounded-full bg-coral-700/30 blur-3xl" />
        <div className="container-x relative grid items-center gap-8 pb-28 pt-10 sm:pt-14 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <span className="inline-flex animate-fade-up items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-coral-100">
              <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-coral-400 opacity-75" /><span className="relative inline-flex h-2 w-2 rounded-full bg-coral-500" /></span>
              {t.hero.badge}
            </span>
            <h1 className="mt-4 animate-fade-up text-3xl font-semibold leading-[1.1] tracking-tight text-white [animation-delay:100ms] sm:text-4xl lg:text-5xl">{t.hero.title}</h1>
            <p className="mt-4 max-w-xl animate-fade-up text-base font-light text-ink-200 [animation-delay:220ms]">{t.hero.subtitle}</p>
            <div className="mt-6 flex animate-fade-up flex-wrap gap-3 [animation-delay:340ms]">
              <Link href={`/${locale}/excursions`} className="btn-primary px-5 py-3">{t.nav.bookNow}<ArrowIcon className="h-4 w-4" /></Link>
              <Link href={`/${locale}/transfers`} className="btn border border-white/20 px-5 py-3 text-white hover:bg-white/10">{t.nav.transfers}</Link>
            </div>
          </div>
          <div className="relative mx-auto hidden w-full max-w-[16rem] animate-fade-up lg:max-w-[17rem] [animation-delay:200ms] sm:block">
            <div className="absolute inset-6 rounded-[28%] bg-coral-500/40 blur-2xl" />
            <div className="relative grid aspect-square place-items-center rounded-[24%] bg-coral-500 shadow-2xl shadow-black/40">
              <AnimatedMark className="w-[80%]" />
            </div>
          </div>
        </div>
      </section>

      <div className="container-x relative z-10 -mt-20 animate-fade-up [animation-delay:450ms]">
        <SearchBox locale={locale} t={t.search} cities={cities} airports={transfers.map((x) => x.airport)} today={todayISO()} labels={{ fullDay: t.common.fullDay, shuttle: t.common.shuttle }} />
      </div>

      {/* Services */}
      <section className="container-x mt-24">
        <Reveal>
          <h2 className="h-section">{t.services.title}</h2>
          <p className="mt-2 text-ink-500">{t.services.subtitle}</p>
        </Reveal>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s, i) => (
            <Reveal key={s.href} delay={i * 90}>
              <Link href={`/${locale}/${s.href}`} className="card group block h-full p-6 transition duration-300 hover:-translate-y-1 hover:border-coral-200 hover:shadow-xl hover:shadow-coral-500/10">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-coral-50 text-coral-600 transition duration-300 group-hover:rotate-6 group-hover:scale-110 group-hover:bg-coral-500 group-hover:text-white">{s.icon}</span>
                <h3 className="mt-4 font-semibold text-ink-900">{s.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-500">{s.d}</p>
                <ArrowIcon className="mt-4 h-5 w-5 text-coral-500 transition duration-300 group-hover:translate-x-1.5" />
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Popular tours */}
      <section className="container-x mt-24">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="h-section">{t.popular.title}</h2>
          <Link href={`/${locale}/excursions`} className="group flex items-center gap-1 text-sm font-semibold text-coral-600 hover:text-coral-700">
            {t.popular.viewAll}<ArrowIcon className="h-4 w-4 transition group-hover:translate-x-1" />
          </Link>
        </Reveal>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tours.map((tour, i) => <Reveal key={tour.id} delay={i * 110}><TourCard tour={tour} locale={locale} t={t.common} index={i} /></Reveal>)}
        </div>
      </section>

      {/* Why us */}
      <section className="mt-24 bg-sand-50 py-20">
        <div className="container-x">
          <Reveal><h2 className="h-section text-center">{t.why.title}</h2></Reveal>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {t.why.items.map((w, i) => (
              <Reveal key={w.t} delay={i * 100} className="group text-center">
                <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-white text-coral-500 shadow-sm transition duration-300 group-hover:-translate-y-1 group-hover:shadow-lg group-hover:shadow-coral-500/20">{whyIcons[i]}</span>
                <h3 className="mt-4 font-semibold text-ink-900">{w.t}</h3>
                <p className="mt-1 text-sm text-ink-500">{w.d}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="container-x mt-24">
        <Reveal><h2 className="h-section">{t.reviews.title}</h2></Reveal>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {t.reviews.items.map((r, i) => (
            <Reveal key={r.n} delay={i * 110}>
              <figure className="card h-full p-6 transition duration-300 hover:-translate-y-1 hover:shadow-lg">
                <div className="flex gap-0.5 text-coral-500">{[0, 1, 2, 3, 4].map((k) => <StarIcon key={k} />)}</div>
                <blockquote className="mt-3 text-ink-700">“{r.t}”</blockquote>
                <figcaption className="mt-4 text-sm font-semibold text-ink-900">{r.n}</figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA avec la navette qui roule */}
      <section className="container-x mt-24">
        <Reveal className="relative overflow-hidden rounded-3xl bg-coral-500 text-white">
          <div className="absolute -right-16 -top-16 h-64 w-64 animate-float rounded-full bg-white/15 blur-2xl" />
          <div className="relative flex flex-col items-start justify-between gap-6 p-8 pb-6 sm:flex-row sm:items-center sm:p-12 sm:pb-8">
            <div>
              <h2 className="text-2xl font-semibold text-white sm:text-4xl">{t.cta.title}</h2>
              <p className="mt-2 text-coral-50">{t.cta.text}</p>
            </div>
            <Link href={`/${locale}/excursions`} className="btn shrink-0 bg-white px-6 py-3.5 text-coral-600 shadow-lg hover:-translate-y-0.5 hover:bg-coral-50">{t.cta.button}<ArrowIcon className="h-4 w-4" /></Link>
          </div>
          <div className="relative h-28 sm:h-36" aria-hidden>
            <div className="road-strip absolute inset-x-0 bottom-0 h-8 sm:h-10" />
            <div className="absolute bottom-5 left-0 w-40 animate-drive sm:bottom-7 sm:w-56"><Minibus className="w-full drop-shadow-xl" /></div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
