"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getDict } from "@/lib/i18n";

export type ReviewState = { error?: string; ok?: boolean };

/** Avis client : seulement sur un trajet terminé, un seul avis par réservation. */
export async function submitReview(_: ReviewState, fd: FormData): Promise<ReviewState> {
  const id = String(fd.get("id") ?? "");
  const locale = String(fd.get("locale") ?? "en");
  const t = getDict(locale).review.errors;
  const rating = Number(fd.get("rating"));
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return { error: t.rating };

  const b = await db.booking.findUnique({ where: { id }, include: { review: true } });
  if (!b || b.status !== "COMPLETED" || b.review) return { error: t.notAllowed };

  const name = String(fd.get("name") ?? "").trim().slice(0, 40) || b.fullName.split(" ")[0];
  const comment = String(fd.get("comment") ?? "").trim().slice(0, 1000) || null;
  await db.review.create({ data: { bookingId: b.id, driverId: b.driverId, rating, comment, name, locale } });
  revalidatePath(`/${locale}/booking/${id}`);
  revalidatePath(`/${locale}`);
  return { ok: true };
}
