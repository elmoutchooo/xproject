"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getDict } from "@/lib/i18n";
import { busSeatsLeft, newReference, todayISO, tourSpotsLeft } from "@/lib/booking";

export type BookingState = { error?: string };

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();

export async function createBooking(_: BookingState, fd: FormData): Promise<BookingState> {
  const locale = str(fd, "locale");
  const e = getDict(locale).book.errors;

  const type = str(fd, "type");
  const id = str(fd, "id");
  const date = str(fd, "date");
  const time = str(fd, "time") || null;
  const passengers = Number(str(fd, "passengers"));
  const fullName = str(fd, "fullName");
  const email = str(fd, "email").toLowerCase();
  const phone = str(fd, "phone");
  const pickup = str(fd, "pickup") || null;
  const flight = str(fd, "flight") || null;
  const notes = str(fd, "notes").slice(0, 1000) || null;
  const payment = str(fd, "payment") === "BANK_TRANSFER" ? "BANK_TRANSFER" : "CASH";

  if (!fullName || !email || !phone || !date || !Number.isInteger(passengers) || passengers < 1 || fd.get("accept") !== "on") {
    return { error: e.required };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: e.email };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date < todayISO()) return { error: e.past };
  if ((type === "TRANSFER" && (!pickup || !time)) || (type === "TOUR" && !pickup)) return { error: e.required };

  const base = { reference: newReference(), type, date, time, passengers, fullName, email, phone, pickup, flight, notes, locale, payment };

  // Transaction : on vérifie les places et on enregistre en une seule opération
  const result = await db.$transaction(async (tx) => {
    if (type === "BUS") {
      const r = await tx.busRoute.findUnique({ where: { id } });
      if (!r || !r.active) return { error: e.notFound };
      if ((await busSeatsLeft(r.id, r.seats, date, tx)) < passengers) return { error: e.seats };
      return { booking: await tx.booking.create({ data: { ...base, time: r.departure, total: r.price * passengers, busRouteId: r.id } }) };
    }
    if (type === "TRANSFER") {
      const x = await tx.transfer.findUnique({ where: { id } });
      if (!x || !x.active) return { error: e.notFound };
      if (passengers > x.capacity) return { error: e.capacity };
      return { booking: await tx.booking.create({ data: { ...base, total: x.price, transferId: x.id } }) };
    }
    if (type === "TOUR") {
      const x = await tx.tour.findUnique({ where: { id } });
      if (!x || !x.active) return { error: e.notFound };
      if ((await tourSpotsLeft(x.id, x.maxPeople, date, tx)) < passengers) return { error: e.seats };
      return { booking: await tx.booking.create({ data: { ...base, time: x.departure, total: x.price * passengers, tourId: x.id } }) };
    }
    return { error: e.notFound };
  });

  if ("error" in result) return { error: result.error };
  redirect(`/${locale}/booking/${result.booking.id}`);
}
