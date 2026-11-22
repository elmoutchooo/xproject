"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { completeBooking } from "@/lib/commission";
import { hashPassword, normalizePhone } from "@/lib/password";
import { checkAdminPassword, setAdminPassword } from "@/lib/adminAuth";
import { createSessionToken, SESSION_COOKIE, sessionCookieOptions, verifySessionToken } from "@/lib/session";

async function requireAdmin() {
  const ok = await verifySessionToken((await cookies()).get(SESSION_COOKIE)?.value);
  if (!ok) redirect("/admin/login");
}

const s = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const n = (fd: FormData, k: string) => Math.max(0, Math.round(Number(fd.get(k)) || 0));

export async function login(_: { error?: string }, fd: FormData): Promise<{ error?: string }> {
  if (!(await checkAdminPassword(s(fd, "password")))) return { error: "Mot de passe incorrect." };
  (await cookies()).set(SESSION_COOKIE, await createSessionToken(), sessionCookieOptions);
  redirect("/admin");
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/admin/login");
}

// ---- Réservations ----
export async function updateBooking(fd: FormData) {
  await requireAdmin();
  const id = s(fd, "id");
  const data: { status?: string; paid?: boolean } = {};
  const status = s(fd, "status");
  if (status === "COMPLETED") await completeBooking(id);
  else if (["PENDING", "CONFIRMED", "CANCELLED"].includes(status)) data.status = status;
  if (fd.has("paid")) data.paid = s(fd, "paid") === "true";
  if (Object.keys(data).length) await db.booking.update({ where: { id }, data });
  revalidatePath("/admin", "layout");
}

export async function assignDriver(fd: FormData) {
  await requireAdmin();
  const driverId = s(fd, "driverId") || null;
  const b = await db.booking.findUnique({ where: { id: s(fd, "id") } });
  if (!b) return;
  // Un trajet déjà terminé garde sa commission ; on la recalcule seulement si le chauffeur change
  let commission = b.commission;
  if (b.status === "COMPLETED" && driverId !== b.driverId) {
    const d = driverId ? await db.driver.findUnique({ where: { id: driverId } }) : null;
    commission = d ? Math.round((b.total * d.commissionRate) / 100) : null;
  }
  await db.booking.update({ where: { id: b.id }, data: { driverId, commission } });
  revalidatePath("/admin", "layout");
}

// ---- Chauffeurs ----
type DriverState = { error?: string; ok?: boolean; values?: Record<string, string> };

export async function saveDriver(_: DriverState, fd: FormData): Promise<DriverState> {
  const res = await saveDriverInner(fd);
  if (res.ok) return res;
  return { ...res, values: { name: s(fd, "name"), phone: s(fd, "phone"), vehicle: s(fd, "vehicle"), commissionRate: s(fd, "commissionRate"), active: fd.get("active") === "on" ? "on" : "" } };
}

async function saveDriverInner(fd: FormData): Promise<DriverState> {
  await requireAdmin();
  const id = s(fd, "id");
  const phone = normalizePhone(s(fd, "phone"));
  const password = s(fd, "password");
  const rate = Math.min(100, n(fd, "commissionRate"));
  if (!s(fd, "name") || phone.length < 8) return { error: "Nom et téléphone obligatoires." };
  if (!id && password.length < 6) return { error: "Mot de passe : 6 caractères minimum." };
  if (password && password.length < 6) return { error: "Mot de passe : 6 caractères minimum." };
  const other = await db.driver.findUnique({ where: { phone } });
  if (other && other.id !== id) return { error: "Ce numéro est déjà utilisé par un autre chauffeur." };

  const data = {
    name: s(fd, "name"), phone, vehicle: s(fd, "vehicle") || null, commissionRate: rate, active: fd.get("active") === "on",
    ...(password ? { passwordHash: await hashPassword(password) } : {}),
  };
  if (id) await db.driver.update({ where: { id }, data });
  else await db.driver.create({ data: { ...data, passwordHash: data.passwordHash! } });
  revalidatePath("/admin/drivers", "layout");
  return { ok: true };
}

/** Marque comme réglés tous les trajets terminés d'un chauffeur (comptes faits). */
export async function settleDriver(fd: FormData) {
  await requireAdmin();
  await db.booking.updateMany({ where: { driverId: s(fd, "driverId"), status: "COMPLETED", settled: false }, data: { settled: true } });
  revalidatePath("/admin/drivers", "layout");
}

// ---- Lignes de bus ----
export async function saveRoute(fd: FormData) {
  await requireAdmin();
  const id = s(fd, "id");
  const data = {
    fromCity: s(fd, "fromCity"), toCity: s(fd, "toCity"), departure: s(fd, "departure"),
    durationMin: n(fd, "durationMin"), price: n(fd, "price"), seats: n(fd, "seats"), active: fd.get("active") === "on",
  };
  if (!data.fromCity || !data.toCity || !data.departure) return;
  if (id) await db.busRoute.update({ where: { id }, data });
  else await db.busRoute.create({ data });
  revalidatePath("/admin/routes");
}

// ---- Transferts ----
export async function saveTransfer(fd: FormData) {
  await requireAdmin();
  const id = s(fd, "id");
  const data = {
    airport: s(fd, "airport"), destination: s(fd, "destination"), vehicle: s(fd, "vehicle") || "CAR",
    capacity: n(fd, "capacity"), price: n(fd, "price"), active: fd.get("active") === "on",
  };
  if (!data.airport || !data.destination) return;
  if (id) await db.transfer.update({ where: { id }, data });
  else await db.transfer.create({ data });
  revalidatePath("/admin/transfers");
}

// ---- Excursions ----
const LOCALES = ["en", "fr", "es", "it"];
const multi = (fd: FormData, k: string) => JSON.stringify(Object.fromEntries(LOCALES.map((l) => [l, s(fd, `${k}_${l}`)])));
const multiList = (fd: FormData, k: string) =>
  JSON.stringify(Object.fromEntries(LOCALES.map((l) => [l, s(fd, `${k}_${l}`).split("\n").map((x) => x.trim()).filter(Boolean)])));

export async function saveTour(fd: FormData) {
  await requireAdmin();
  const id = s(fd, "id");
  const slug = s(fd, "slug").toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/(^-|-$)/g, "");
  if (!slug || !s(fd, "title_en")) return;
  const data = {
    slug, category: s(fd, "category") === "SHUTTLE" ? "SHUTTLE" : "FULL_DAY",
    title: multi(fd, "title"), description: multi(fd, "description"), includes: multiList(fd, "includes"),
    durationH: n(fd, "durationH"), departure: s(fd, "departure"), fromCity: s(fd, "fromCity"),
    price: n(fd, "price"), maxPeople: n(fd, "maxPeople"), imageUrl: s(fd, "imageUrl") || null, active: fd.get("active") === "on",
  };
  if (id) await db.tour.update({ where: { id }, data });
  else await db.tour.create({ data });
  revalidatePath("/admin/tours");
  redirect("/admin/tours");
}

// ---- Paramètres : changer le mot de passe admin ----
export async function changeAdminPassword(_: { error?: string; ok?: boolean }, fd: FormData): Promise<{ error?: string; ok?: boolean }> {
  await requireAdmin();
  const current = String(fd.get("current") ?? "");
  const next = String(fd.get("next") ?? "");
  const confirm = String(fd.get("confirm") ?? "");
  if (!(await checkAdminPassword(current))) return { error: "L'ancien mot de passe est incorrect." };
  if (next.length < 8) return { error: "Le nouveau mot de passe doit faire au moins 8 caractères." };
  if (next !== confirm) return { error: "Les deux nouveaux mots de passe ne sont pas identiques." };
  if (next === current) return { error: "Le nouveau mot de passe doit être différent de l'ancien." };
  await setAdminPassword(next);
  return { ok: true };
}
