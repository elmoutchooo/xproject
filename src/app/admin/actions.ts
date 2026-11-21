"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { createSessionToken, SESSION_COOKIE, sessionMaxAge, verifySessionToken } from "@/lib/session";

async function requireAdmin() {
  const ok = await verifySessionToken((await cookies()).get(SESSION_COOKIE)?.value);
  if (!ok) redirect("/admin/login");
}

const s = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const n = (fd: FormData, k: string) => Math.max(0, Math.round(Number(fd.get(k)) || 0));

export async function login(_: { error?: string }, fd: FormData): Promise<{ error?: string }> {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || s(fd, "password") !== expected) return { error: "Mot de passe incorrect." };
  (await cookies()).set(SESSION_COOKIE, await createSessionToken(), {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: sessionMaxAge, path: "/",
  });
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
  if (["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"].includes(status)) data.status = status;
  if (fd.has("paid")) data.paid = s(fd, "paid") === "true";
  await db.booking.update({ where: { id }, data });
  revalidatePath("/admin", "layout");
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
