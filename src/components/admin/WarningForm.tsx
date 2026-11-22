"use client";

import { useActionState } from "react";
import { addWarning } from "@/app/admin/actions";

export default function WarningForm({ driverId, next }: { driverId: string; next: number }) {
  const [state, action, pending] = useActionState(addWarning, {});
  return (
    <form key={state.ok} action={action} className="mt-4 space-y-2">
      <input type="hidden" name="driverId" value={driverId} />
      <label className="label" htmlFor="reason">Nouvel avertissement ({next}/3)</label>
      <textarea id="reason" name="reason" rows={2} maxLength={300} placeholder="Motif : retard, comportement, véhicule sale…" className="input" required />
      {next >= 3 && <p className="text-xs font-medium text-rose-600">Attention : ce 3e avertissement bloquera le compte du chauffeur.</p>}
      {state.error && <p role="alert" className="text-sm font-medium text-rose-600">{state.error}</p>}
      {state.ok && <p role="status" className="text-sm font-medium text-emerald-700">{state.ok}</p>}
      <button disabled={pending} className={`btn py-2 text-xs text-white ${next >= 3 ? "bg-rose-600 hover:bg-rose-700" : "bg-amber-500 hover:bg-amber-600"}`}>Donner l&apos;avertissement</button>
    </form>
  );
}
