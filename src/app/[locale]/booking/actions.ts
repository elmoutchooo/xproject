"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getDict } from "@/lib/i18n";
import { canCancel } from "@/lib/booking";

export type FindState = { error?: string };

export async function findBooking(_: FindState, fd: FormData): Promise<FindState> {
  const locale = String(fd.get("locale") ?? "en");
  const reference = String(fd.get("reference") ?? "").trim().toUpperCase();
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  const b = reference && email ? await db.booking.findFirst({ where: { reference, email } }) : null;
  if (!b) return { error: getDict(locale).myBooking.notFound };
  redirect(`/${locale}/booking/${b.id}`);
}

export async function cancelBooking(fd: FormData) {
  const id = String(fd.get("id") ?? "");
  const locale = String(fd.get("locale") ?? "en");
  const b = await db.booking.findUnique({ where: { id } });
  if (b && canCancel(b)) {
    await db.booking.update({ where: { id }, data: { status: "CANCELLED" } });
  }
  revalidatePath(`/${locale}/booking/${id}`);
}
