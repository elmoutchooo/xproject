import { db } from "@/lib/db";

/** Marque un trajet comme terminé et calcule la commission de l'agence. */
export async function completeBooking(id: string) {
  const b = await db.booking.findUnique({ where: { id }, include: { driver: true } });
  if (!b || b.status === "CANCELLED") return;
  const commission = b.driver ? Math.round((b.total * b.driver.commissionRate) / 100) : null;
  await db.booking.update({
    where: { id },
    data: {
      status: "COMPLETED",
      completedAt: b.completedAt ?? new Date(),
      commission: b.commission ?? commission,
      // En espèces, c'est le chauffeur qui encaisse le client
      ...(b.payment === "CASH" ? { paid: true } : {}),
    },
  });
}

type Row = { total: number; commission: number | null; payment: string };

/**
 * Comptes entre l'agence et un chauffeur sur des trajets terminés.
 * - Espèces : le chauffeur a encaissé le total, il doit la commission à l'agence.
 * - Virement : l'agence a encaissé le total, elle doit (total - commission) au chauffeur.
 * balance > 0 : le chauffeur doit cette somme à l'agence ; balance < 0 : l'agence doit au chauffeur.
 */
export function summarize(rows: Row[]) {
  let gross = 0, commission = 0, driverOwes = 0, agencyOwes = 0;
  for (const r of rows) {
    const c = r.commission ?? 0;
    gross += r.total;
    commission += c;
    if (r.payment === "CASH") driverOwes += c;
    else agencyOwes += r.total - c;
  }
  return { trips: rows.length, gross, commission, net: gross - commission, driverOwes, agencyOwes, balance: driverOwes - agencyOwes };
}
