"use client";

import { useActionState } from "react";
import { findBooking, type FindState } from "@/app/[locale]/booking/actions";
import type { Dict, Locale } from "@/lib/i18n";

export default function FindBookingForm({ locale, t, emailLabel }: { locale: Locale; t: Dict["myBooking"]; emailLabel: string }) {
  const [state, action, pending] = useActionState<FindState, FormData>(findBooking, {});
  return (
    <form action={action} className="card space-y-4 p-6">
      <input type="hidden" name="locale" value={locale} />
      <div>
        <label className="label" htmlFor="reference">{t.ref}</label>
        <input id="reference" name="reference" placeholder="AT-XXXXXX" className="input font-mono uppercase" required />
      </div>
      <div>
        <label className="label" htmlFor="email">{emailLabel}</label>
        <input id="email" name="email" type="email" className="input" required />
      </div>
      {state.error && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm font-medium text-rose-700">{state.error}</p>}
      <button disabled={pending} className="btn-dark w-full">{t.find}</button>
    </form>
  );
}
