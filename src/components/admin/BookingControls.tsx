"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { assignDriver, updateBooking } from "@/app/admin/actions";

const STATUS: [string, string][] = [["PENDING", "En attente"], ["CONFIRMED", "Confirmée"], ["COMPLETED", "Terminée"], ["CANCELLED", "Annulée"]];

/** Statut et chauffeur d'une réservation : enregistrés dès qu'on change la valeur. */
export function StatusSelect({ id, status }: { id: string; status: string }) {
  const [value, setValue] = useState(status);
  const save = useSaver();
  return (
    <span className="flex items-center gap-2">
      <select value={value} aria-label="Statut" className="rounded-lg border border-ink-200 bg-white px-2 py-1.5 text-xs font-medium"
        onChange={(e) => { setValue(e.target.value); save.run(() => updateBooking(form({ id, status: e.target.value }))); }}>
        {STATUS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
      <Saved state={save.state} />
    </span>
  );
}

export function DriverSelect({ id, driverId, drivers }: { id: string; driverId: string | null; drivers: { id: string; name: string }[] }) {
  const [value, setValue] = useState(driverId ?? "");
  const save = useSaver();
  return (
    <span className="flex items-center gap-2">
      <select value={value} aria-label="Chauffeur" className={`max-w-[150px] rounded-lg border px-2 py-1.5 text-xs font-medium ${value ? "border-ink-200 bg-white" : "border-amber-300 bg-amber-50 text-amber-900"}`}
        onChange={(e) => { setValue(e.target.value); save.run(() => assignDriver(form({ id, driverId: e.target.value }))); }}>
        <option value="">— Aucun —</option>
        {drivers.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
      </select>
      <Saved state={save.state} />
    </span>
  );
}

function form(o: Record<string, string>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(o)) fd.set(k, v);
  return fd;
}

function useSaver() {
  const router = useRouter();
  const [, start] = useTransition();
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  return {
    state,
    run(fn: () => Promise<unknown>) {
      setState("saving");
      start(async () => {
        try { await fn(); setState("saved"); router.refresh(); setTimeout(() => setState("idle"), 2000); }
        catch { setState("error"); }
      });
    },
  };
}

function Saved({ state }: { state: string }) {
  if (state === "saving") return <span className="text-xs text-ink-400">…</span>;
  if (state === "saved") return <span className="text-xs font-semibold text-emerald-600">✓</span>;
  if (state === "error") return <span className="text-xs font-semibold text-rose-600">Erreur</span>;
  return null;
}
