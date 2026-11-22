import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { formatPrice, getDict, tr, type Locale } from "@/lib/i18n";
import { todayISO } from "@/lib/booking";
import BookingForm from "@/components/BookingForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false } };

type SP = { type?: string; id?: string; date?: string; pax?: string };

export default async function BookPage({ params, searchParams }: { params: Promise<{ locale: Locale }>; searchParams: Promise<SP> }) {
  const { locale } = await params;
  const sp = await searchParams;
  const t = getDict(locale);
  const today = todayISO();
  const date = sp.date && sp.date >= today ? sp.date : today;
  const pax = Math.max(1, Number(sp.pax) || 1);

  let title = "", sub = "", unitPrice = 0, perVehicle = false, maxPax = 20;
  const type = sp.type as "BUS" | "TRANSFER" | "TOUR";

  if (type === "BUS" && sp.id) {
    const r = await db.busRoute.findUnique({ where: { id: sp.id } });
    if (!r) notFound();
    title = `${r.fromCity} → ${r.toCity}`;
    sub = `${t.bus.title} · ${t.common.departure} ${r.departure}`;
    unitPrice = r.price;
    maxPax = r.seats;
  } else if (type === "TRANSFER" && sp.id) {
    const x = await db.transfer.findUnique({ where: { id: sp.id } });
    if (!x) notFound();
    title = `${x.airport} → ${x.destination}`;
    sub = `${t.common.vehicles[x.vehicle as keyof typeof t.common.vehicles] ?? x.vehicle} · ${t.common.upTo} ${x.capacity} ${t.common.people}`;
    unitPrice = x.price;
    perVehicle = true;
    maxPax = x.capacity;
  } else if (type === "TOUR" && sp.id) {
    const x = await db.tour.findUnique({ where: { id: sp.id } });
    if (!x) notFound();
    title = tr(x.title, locale);
    sub = `${t.common.departure} ${x.fromCity} · ${x.departure} · ${x.durationH}${t.common.hours}`;
    unitPrice = x.price;
    maxPax = x.maxPeople;
  } else {
    notFound();
  }

  return (
    <div className="container-x max-w-3xl pt-10">
      <Link href={`/${locale}`} className="text-sm font-medium text-coral-600 hover:underline">← {t.common.back}</Link>
      <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-ink-900">{t.book.title}</h1>
      <div className="mt-6 rounded-2xl bg-ink-900 p-6 text-white">
        <p className="text-xl font-bold">{title}</p>
        <p className="mt-1 text-sm text-ink-200">{sub}</p>
        <p className="mt-3 text-sm"><span className="text-lg font-bold">{formatPrice(unitPrice)}</span> {perVehicle ? t.common.perVehicle : t.common.perPerson}</p>
      </div>
      <div className="mt-6">
        <BookingForm locale={locale} t={t.book} type={type} id={sp.id!} date={date} pax={Math.min(pax, maxPax)} today={today}
          unitPrice={unitPrice} perVehicle={perVehicle} maxPax={maxPax} totalLabel={t.common.total} termsLabel={t.legal.terms} />
      </div>
    </div>
  );
}
