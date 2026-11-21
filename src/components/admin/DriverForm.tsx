"use client";

import { useActionState } from "react";
import { saveDriver } from "@/app/admin/actions";

type D = { id: string; name: string; phone: string; vehicle: string | null; commissionRate: number; active: boolean };

export default function DriverForm({ driver }: { driver?: D }) {
  const [state, action, pending] = useActionState(saveDriver, {});
  const v = state.values;
  return (
    <form key={JSON.stringify(state)} action={action} className="card grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
      <input type="hidden" name="id" value={driver?.id ?? ""} />
      <div><label className="label">Nom complet *</label><input name="name" defaultValue={v?.name ?? driver?.name} className="input" required /></div>
      <div><label className="label">Téléphone (identifiant) *</label><input name="phone" type="tel" defaultValue={v?.phone ?? driver?.phone} placeholder="0600000000" className="input" required /></div>
      <div>
        <label className="label">{driver ? "Nouveau mot de passe" : "Mot de passe *"}</label>
        <input name="password" type="text" autoComplete="new-password" placeholder={driver ? "Laisser vide pour ne pas changer" : "6 caractères minimum"} className="input" required={!driver} />
      </div>
      <div><label className="label">Véhicule</label><input name="vehicle" defaultValue={v?.vehicle ?? driver?.vehicle ?? ""} placeholder="Mercedes Vito – 12345-A-7" className="input" /></div>
      <div><label className="label">Commission agence (%)</label><input name="commissionRate" type="number" min={0} max={100} defaultValue={v?.commissionRate ?? driver?.commissionRate ?? 10} className="input" /></div>
      <label className="flex items-center gap-2 self-end pb-2 text-sm font-medium"><input type="checkbox" name="active" defaultChecked={v ? v.active === "on" : driver?.active ?? true} />Compte actif</label>
      <div className="flex items-center gap-3 sm:col-span-2 lg:col-span-3">
        <button disabled={pending} className="btn-primary">{driver ? "Enregistrer" : "Créer le chauffeur"}</button>
        {state.error && <p role="alert" className="text-sm font-medium text-rose-600">{state.error}</p>}
        {state.ok && <p className="text-sm font-medium text-emerald-600">Enregistré ✓</p>}
      </div>
    </form>
  );
}
