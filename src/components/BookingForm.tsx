"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { createBooking, type BookingState } from "@/app/[locale]/book/actions";
import { formatPrice, type Dict, type Locale } from "@/lib/i18n";

type Props = {
  locale: Locale;
  t: Dict["book"];
  type: "BUS" | "TRANSFER" | "TOUR";
  id: string;
  date: string;
  pax: number;
  today: string;
  unitPrice: number;
  perVehicle: boolean;
  maxPax: number;
  totalLabel: string;
  termsLabel: string;
};

export default function BookingForm(p: Props) {
  const [state, action, pending] = useActionState<BookingState, FormData>(createBooking, {});
  const [pax, setPax] = useState(p.pax);
  const [payment, setPayment] = useState("CASH");
  const t = p.t;
  const v = state.values ?? {};
  const total = p.perVehicle ? p.unitPrice : p.unitPrice * (pax || 0);

  return (
    <form key={JSON.stringify(v)} action={action} className="space-y-6">
      <input type="hidden" name="locale" value={p.locale} />
      <input type="hidden" name="type" value={p.type} />
      <input type="hidden" name="id" value={p.id} />

      <section className="card space-y-4 p-6">
        <h2 className="text-lg font-bold text-ink-900">{t.summary}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="date">{t.date} *</label>
            <input id="date" name="date" type="date" min={p.today} defaultValue={v.date ?? p.date} className="input" required />
          </div>
          <div>
            <label className="label" htmlFor="passengers">{t.passengers} *</label>
            <input id="passengers" name="passengers" type="number" min={1} max={p.maxPax} value={pax} onChange={(e) => setPax(Number(e.target.value))} className="input" required />
          </div>
          {p.type === "TRANSFER" && (
            <>
              <div>
                <label className="label" htmlFor="time">{t.time} *</label>
                <input id="time" name="time" type="time" defaultValue={v.time} className="input" required />
              </div>
              <div>
                <label className="label" htmlFor="flight">{t.flight}</label>
                <input id="flight" name="flight" placeholder={t.flightHint} defaultValue={v.flight} className="input" />
              </div>
            </>
          )}
          {p.type !== "BUS" && (
            <div className="sm:col-span-2">
              <label className="label" htmlFor="pickup">{t.pickup} *</label>
              <input id="pickup" name="pickup" placeholder={t.pickupHint} defaultValue={v.pickup} className="input" required />
            </div>
          )}
        </div>
      </section>

      <section className="card space-y-4 p-6">
        <h2 className="text-lg font-bold text-ink-900">{t.details}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label" htmlFor="fullName">{t.fullName} *</label>
            <input id="fullName" name="fullName" autoComplete="name" defaultValue={v.fullName} className="input" required />
          </div>
          <div>
            <label className="label" htmlFor="email">{t.email} *</label>
            <input id="email" name="email" type="email" autoComplete="email" defaultValue={v.email} className="input" required />
          </div>
          <div>
            <label className="label" htmlFor="phone">{t.phone} *</label>
            <input id="phone" name="phone" type="tel" autoComplete="tel" placeholder={t.phoneHint} defaultValue={v.phone} className="input" required />
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="notes">{t.notes}</label>
            <textarea id="notes" name="notes" rows={3} defaultValue={v.notes} className="input" />
          </div>
        </div>
      </section>

      <section className="card space-y-3 p-6">
        <h2 className="text-lg font-bold text-ink-900">{t.payment}</h2>
        {[
          { v: "CASH", title: t.payCash, text: t.payCashText },
          { v: "BANK_TRANSFER", title: t.payTransfer, text: t.payTransferText },
        ].map((o) => (
          <label key={o.v} className={`flex cursor-pointer gap-3 rounded-xl border p-4 transition ${payment === o.v ? "border-coral-500 bg-coral-50" : "border-ink-200 hover:bg-ink-50"}`}>
            <input type="radio" name="payment" value={o.v} checked={payment === o.v} onChange={() => setPayment(o.v)} className="mt-1 accent-coral-500" />
            <span>
              <span className="block font-semibold text-ink-900">{o.title}</span>
              <span className="block text-sm text-ink-600">{o.text}</span>
            </span>
          </label>
        ))}
      </section>

      <div className="card space-y-4 p-6">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-ink-600">{p.totalLabel}</span>
          <span className="text-2xl font-extrabold text-ink-900">{formatPrice(total)}</span>
        </div>
        <label className="flex items-start gap-2 text-sm text-ink-600">
          <input type="checkbox" name="accept" defaultChecked={v.accept === "on"} className="mt-0.5 accent-coral-500" required />
          <span>{t.accept} (<Link href={`/${p.locale}/terms`} target="_blank" className="text-coral-600 underline">{p.termsLabel}</Link>)</span>
        </label>
        {state.error && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm font-medium text-rose-700">{state.error}</p>}
        <button disabled={pending} className="btn-primary w-full py-3.5 text-base">{pending ? "…" : t.confirm}</button>
      </div>
    </form>
  );
}
