"use client";

import { useActionState } from "react";
import { login } from "@/app/admin/actions";
import { LogoTile } from "@/components/brand/Logo";

export default function LoginForm() {
  const [state, action, pending] = useActionState<{ error?: string }, FormData>(login, {});
  return (
    <form action={action} className="card w-full max-w-sm space-y-4 p-8">
      <LogoTile className="h-14 w-14" />
      <h1 className="text-xl font-semibold text-ink-900">Connexion admin</h1>
      <div>
        <label className="label" htmlFor="password">Mot de passe</label>
        <input id="password" name="password" type="password" className="input" autoFocus required />
      </div>
      {state.error && <p role="alert" className="text-sm font-medium text-rose-600">{state.error}</p>}
      <button disabled={pending} className="btn-dark w-full">Se connecter</button>
    </form>
  );
}
