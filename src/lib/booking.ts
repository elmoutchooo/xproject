import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

type Client = Prisma.TransactionClient;

const ACTIVE = { notIn: ["CANCELLED"] };

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function newReference() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return `CS-${s}`;
}

// Places restantes sur une ligne de bus pour une date donnée
export async function busSeatsLeft(routeId: string, seats: number, date: string, client: Client = db) {
  const agg = await client.booking.aggregate({
    _sum: { passengers: true },
    where: { busRouteId: routeId, date, status: ACTIVE },
  });
  return Math.max(0, seats - (agg._sum.passengers ?? 0));
}

// Places restantes sur une excursion pour une date donnée
export async function tourSpotsLeft(tourId: string, maxPeople: number, date: string, client: Client = db) {
  const agg = await client.booking.aggregate({
    _sum: { passengers: true },
    where: { tourId, date, status: ACTIVE },
  });
  return Math.max(0, maxPeople - (agg._sum.passengers ?? 0));
}

export function addMinutes(time: string, minutes: number) {
  const [h, m] = time.split(":").map(Number);
  const total = (h * 60 + m + minutes) % (24 * 60);
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

// Annulation en ligne possible jusqu'à 24 h avant le départ
export function canCancel(b: { status: string; date: string; time: string | null }) {
  if (b.status !== "PENDING" && b.status !== "CONFIRMED") return false;
  const departure = new Date(`${b.date}T${b.time ?? "00:00"}:00`);
  return departure.getTime() - Date.now() > 24 * 60 * 60 * 1000;
}
