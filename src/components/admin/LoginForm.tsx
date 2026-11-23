"use client";

import { useActionState, useState } from "react";
import { login } from "@/app/admin/actions";
import { LogoTile } from "@/components/brand/Logo";
import { markTab } from "@/components/SessionGuard";
import { ArrowIcon, ShieldIcon } from "@/components/Icons";

export default function LoginForm() {
  const [state, action, pending] = useActionState<{ error?: string }, FormData>(login, {});
  const [show, setShow] = useState(false);
  return (
    <form action={action} onSubmit={() => markTab("admin")} className="card w-full max-w-sm animate-fade-up space-y-5 p-8 shadow-2xl shadow-black/30">
      <LogoTile className="h-14 w-14" />
      <div>
        <p className="text-sm font-semibold text-coral-600">CS Tours</p>
        <h1 className="text-2xl font-semibold text-ink-900">Administration</h1>
        <p className="mt-1 text-sm text-ink-500">Saisissez votre mot de passe pour accéder au tableau de bord.</p>
      </div>
      <div>
        <label className="label" htmlFor="password">Mot de passe</label>
        <div className="relative">
          <input id="password" name="password" type={show ? "text" : "password"} autoComplete="current-password" className="input pr-20 text-base" autoFocus required />
          <button type="button" onClick={() => setShow(!show)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-semibold text-ink-500 hover:bg-ink-50 hover:text-ink-800">
            {show ? "Masquer" : "Afficher"}
          </button>
        </div>
      </div>
      {state.error && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm font-medium text-rose-700">{state.error}</p>}
      <button disabled={pending} className="btn-primary w-full py-3.5 text-base">{pending ? "Connexion…" : "Se connecter"}{!pending && <ArrowIcon className="h-4 w-4" />}</button>
      <p className="flex items-center gap-2 border-t border-ink-100 pt-4 text-xs text-ink-400"><ShieldIcon className="h-4 w-4 shrink-0" />Accès réservé. Déconnexion automatique après 30 minutes d&apos;inactivité.</p>
    </form>
  );
}
