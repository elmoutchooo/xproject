import Shell from "@/components/admin/Shell";
import PasswordForm from "@/components/admin/PasswordForm";
import { adminPasswordChangedAt } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const changedAt = await adminPasswordChangedAt();
  return (
    <Shell title="Paramètres">
      <PasswordForm />
      <p className="mt-4 text-sm text-ink-500">
        {changedAt
          ? `Dernier changement : ${changedAt.toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" })}.`
          : "Le mot de passe actuel est celui du fichier .env (ADMIN_PASSWORD). Changez-le ici pour en choisir un à vous."}
      </p>
    </Shell>
  );
}
