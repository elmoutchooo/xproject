import { db } from "@/lib/db";
import { checkPassword, hashPassword } from "@/lib/password";

const KEY = "admin_password_hash";

/**
 * Vérifie le mot de passe admin.
 * Tant qu'il n'a pas été changé depuis l'admin, c'est ADMIN_PASSWORD du fichier .env qui sert.
 */
export async function checkAdminPassword(password: string) {
  const row = await db.setting.findUnique({ where: { key: KEY } });
  if (row) return checkPassword(password, row.value);
  const fromEnv = process.env.ADMIN_PASSWORD;
  return !!fromEnv && password === fromEnv;
}

export async function setAdminPassword(password: string) {
  const value = await hashPassword(password);
  await db.setting.upsert({ where: { key: KEY }, create: { key: KEY, value }, update: { value } });
}

export async function adminPasswordChangedAt() {
  return (await db.setting.findUnique({ where: { key: KEY } }))?.updatedAt ?? null;
}
