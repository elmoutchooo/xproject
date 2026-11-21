import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { formatDate, formatPrice, getDict, tr, type Locale } from "@/lib/i18n";
import { canCancel } from "@/lib/booking";
import { AGENCY } from "@/config/agency";
import { cancelBooking } from "../actions";
import PrintButton from "@/components/PrintButton";
import { CheckIcon, WhatsAppIcon } from "@/components/Icons";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: false } };

const statusColor: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800", CONFIRMED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-rose-100 text-rose-800", COMPLETED: "bg-slate-100 text-slate-700",
};

export default async function BookingPage({ params }: { params: Promise<{ locale: Locale; id: string }> }) {
  const { locale, id } = await params;
  const t = getDict(locale);
  const b = await db.booking.findUnique({ where: { id }, include: { busRoute: true, transfer: true, tour: true } });
  if (!b) notFound();

  const trip = b.busRoute ? `${b.busRoute.fromCity} → ${b.busRoute.toCity}`
    : b.transfer ? `${b.transfer.airport} → ${b.transfer.destination}`
    : b.tour ? tr(b.tour.title, locale) : "";
  const s = t.confirm.statuses[b.status as keyof typeof t.confirm.statuses] ?? b.status;
  const rows: [string, string][] = [
    [t.book.date, `${formatDate(b.date, locale)}${b.time ? ` · ${b.time}` : ""}`],
    [t.book.passengers, String(b.passengers)],
    ...(b.pickup ? [[t.book.pickup, b.pickup] as [string, string]] : []),
    ...(b.flight ? [[t.book.flight, b.flight] as [string, string]] : []),
    [t.book.fullName, b.fullName],
    [t.book.phone, b.phone],
    [t.book.email, b.email],
    [t.book.payment, b.payment === "CASH" ? t.book.payCash : t.book.payTransfer],
  ];

  return (
    <div className="container-x max-w-3xl pt-10">
      {b.status !== "CANCELLED" ? (
        <div className="flex items-start gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-600"><CheckIcon className="h-7 w-7" /></span>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{t.confirm.title}</h1>
            <p className="mt-2 text-slate-600">{t.confirm.thanks}</p>
          </div>
        </div>
      ) : (
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{t.myBooking.cancelled}</h1>
      )}

      <div className="card mt-8 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 bg-brand-900 p-6 text-white">
          <div>
            <p className="text-xs uppercase tracking-wide text-brand-200">{t.confirm.reference}</p>
            <p className="font-mono text-2xl font-bold">{b.reference}</p>
          </div>
          <span className={`rounded-full px-3 py-1 text-sm font-semibold ${statusColor[b.status] ?? ""}`}>{s}</span>
        </div>
        <div className="p-6">
          <p className="text-lg font-bold text-slate-900">{trip}</p>
          <dl className="mt-4 divide-y divide-slate-100">
            {rows.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 py-2.5 text-sm">
                <dt className="text-slate-500">{k}</dt>
                <dd className="text-right font-medium text-slate-800">{v}</dd>
              </div>
            ))}
            <div className="flex justify-between gap-4 pt-4">
              <dt className="font-semibold text-slate-700">{t.common.total}</dt>
              <dd className="text-xl font-extrabold text-slate-900">{formatPrice(b.total)} <span className="ml-2 text-xs font-medium text-slate-500">{b.paid ? t.confirm.paid : t.confirm.unpaid}</span></dd>
            </div>
          </dl>
        </div>
      </div>

      {b.status !== "CANCELLED" && b.payment === "BANK_TRANSFER" && !b.paid && (
        <div className="card mt-6 border-amber-200 bg-amber-50 p-6">
          <h2 className="font-bold text-slate-900">{t.confirm.transferTitle}</h2>
          <p className="mt-1 text-sm text-slate-600">{t.confirm.transferText}</p>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div><dt className="text-slate-500">{t.confirm.bank}</dt><dd className="font-semibold">{AGENCY.bank.name}</dd></div>
            <div><dt className="text-slate-500">{t.confirm.holder}</dt><dd className="font-semibold">{AGENCY.bank.holder}</dd></div>
            <div><dt className="text-slate-500">{t.confirm.rib}</dt><dd className="font-mono font-semibold">{AGENCY.bank.rib}</dd></div>
            <div><dt className="text-slate-500">{t.confirm.swift}</dt><dd className="font-mono font-semibold">{AGENCY.bank.swift}</dd></div>
            <div className="sm:col-span-2"><dt className="text-slate-500">{t.confirm.reason}</dt><dd className="font-mono text-lg font-bold">{b.reference}</dd></div>
          </dl>
        </div>
      )}
      {b.status !== "CANCELLED" && b.payment === "CASH" && <p className="mt-6 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">{t.confirm.cashText}</p>}

      <p className="mt-6 text-sm text-slate-500">{t.confirm.keep}</p>

      <div className="no-print mt-6 flex flex-wrap gap-3">
        <a href={`https://wa.me/${AGENCY.whatsapp}?text=${encodeURIComponent(b.reference)}`} target="_blank" rel="noopener noreferrer" className="btn bg-[#25D366] text-white hover:brightness-95">
          <WhatsAppIcon className="h-5 w-5" />{t.confirm.whatsapp}
        </a>
        <PrintButton label={t.confirm.print} />
      </div>

      {b.status !== "CANCELLED" && (
        <div className="no-print card mt-8 p-6">
          <p className="text-sm text-slate-600">{canCancel(b) ? t.myBooking.cancelInfo : t.myBooking.tooLate}</p>
          {canCancel(b) && (
            <form action={cancelBooking} className="mt-3">
              <input type="hidden" name="id" value={b.id} />
              <input type="hidden" name="locale" value={locale} />
              <button className="btn border border-rose-200 bg-white text-rose-700 hover:bg-rose-50">{t.myBooking.cancel}</button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
