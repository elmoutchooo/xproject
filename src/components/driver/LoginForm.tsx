"use client";

import { useActionState } from "react";
import { driverLogin } from "@/app/driver/actions";
import { LogoTile } from "@/components/brand/Logo";
import { markTab } from "@/components/SessionGuard";

export default function DriverLoginForm({ agency }: { agency: string }) {
  const [state, action, pending] = useActionState<{ error?: string; phone?: string }, FormData>(driverLogin, {});
  return (
    <form key={state.error ? `${state.phone}-err` : "form"} action={action} onSubmit={() => markTab("driver")} className="card w-full max-w-sm animate-fade-up space-y-5 p-8 shadow-2xl shadow-black/30">
      <LogoTile className="h-14 w-14" />
      <div>
        <p className="text-sm font-semibold text-coral-600">{agency}</p>
        <h1 className="text-2xl font-semibold text-ink-900">Espace chauffeurs</h1>
        <p className="mt-1 text-sm text-ink-500">Connectez-vous avec votre numéro de téléphone.</p>
      </div>
      <div>
        <label className="label" htmlFor="phone">Numéro de téléphone</label>
        <input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="username" placeholder="0600000000" defaultValue={state.phone} className="input text-base" required />
      </div>
      <div>
        <label className="label" htmlFor="password">Mot de passe</label>
        <input id="password" name="password" type="password" autoComplete="current-password" className="input text-base" required />
      </div>
      {state.error && <p role="alert" className="text-sm font-medium text-rose-600">{state.error}</p>}
      <button disabled={pending} className="btn-dark w-full py-3.5 text-base">Se connecter</button>
    </form>
  );
}
