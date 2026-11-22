"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { checkPassword, normalizePhone } from "@/lib/password";
import { createToken, DRIVER_COOKIE, DRIVER_MAX_AGE_S, readToken, sessionCookieOptions } from "@/lib/session";
import { completeBooking } from "@/lib/commission";

/** Chauffeur connecté (ou redirection vers la page de connexion). */
export async function currentDriver() {
  const subject = await readToken((await cookies()).get(DRIVER_COOKIE)?.value);
  const id = subject?.startsWith("driver:") ? subject.slice(7) : null;
  const driver = id ? await db.driver.findUnique({ where: { id } }) : null;
  if (!driver || !driver.active) redirect("/driver/login");
  return driver;
}

export async function driverLogin(_: { error?: string; phone?: string }, fd: FormData): Promise<{ error?: string; phone?: string }> {
  const phone = normalizePhone(String(fd.get("phone") ?? ""));
  const password = String(fd.get("password") ?? "");
  const d = phone ? await db.driver.findUnique({ where: { phone } }) : null;
  if (!d || !d.active || !(await checkPassword(password, d.passwordHash))) {
    return { error: "Numéro ou mot de passe incorrect.", phone: String(fd.get("phone") ?? "") };
  }
  (await cookies()).set(DRIVER_COOKIE, await createToken(`driver:${d.id}`, DRIVER_MAX_AGE_S), sessionCookieOptions);
  redirect("/driver");
}

export async function driverLogout() {
  (await cookies()).delete(DRIVER_COOKIE);
  redirect("/driver/login");
}

/** Le chauffeur signale que le trajet est terminé. */
export async function driverCompleteTrip(fd: FormData) {
  const driver = await currentDriver();
  const id = String(fd.get("id") ?? "");
  const b = await db.booking.findUnique({ where: { id } });
  if (!b || b.driverId !== driver.id || !["PENDING", "CONFIRMED"].includes(b.status)) return;
  await completeBooking(id);
  revalidatePath("/driver");
}
