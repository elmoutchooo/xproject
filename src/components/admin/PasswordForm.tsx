"use client";

import { useActionState, useState } from "react";
import { changeAdminPassword } from "@/app/admin/actions";

function Field({ name, label, show, autoComplete }: { name: string; label: string; show: boolean; autoComplete: string }) {
  return (
    <div>
      <label className="label" htmlFor={name}>{label}</label>
      <input id={name} name={name} type={show ? "text" : "password"} autoComplete={autoComplete} className="input" required />
    </div>
  );
}

export default function PasswordForm() {
  const [state, action, pending] = useActionState(changeAdminPassword, {});
  const [show, setShow] = useState(false);
  return (
    <form action={action} className="card max-w-lg space-y-4 p-6">
      <div>
        <h2 className="text-lg font-semibold text-ink-900">Changer le mot de passe admin</h2>
        <p className="mt-1 text-sm text-ink-500">Pour confirmer que c&apos;est bien vous, saisissez d&apos;abord l&apos;ancien mot de passe.</p>
      </div>
      <Field name="current" label="Ancien mot de passe" show={show} autoComplete="current-password" />
      <Field name="next" label="Nouveau mot de passe (8 caractères minimum)" show={show} autoComplete="new-password" />
      <Field name="confirm" label="Confirmer le nouveau mot de passe" show={show} autoComplete="new-password" />
      <label className="flex items-center gap-2 text-sm text-ink-600">
        <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} className="accent-coral-500" />
        Afficher les mots de passe
      </label>
      {state.error && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm font-medium text-rose-700">{state.error}</p>}
      {state.ok && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm font-medium text-emerald-700">Mot de passe changé ✓ Utilisez le nouveau à votre prochaine connexion.</p>}
      <button disabled={pending} className="btn-primary">{pending ? "…" : "Enregistrer le nouveau mot de passe"}</button>
    </form>
  );
}
