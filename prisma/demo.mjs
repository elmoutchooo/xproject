// Réservations de démonstration pour voir le tableau de bord rempli.
//   npm run db:demo         → ajoute ~70 réservations fictives (références DM-…)
//   npm run db:demo:clear   → les supprime (vos vraies réservations ne sont pas touchées)
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const clear = process.argv.includes("--clear");

const names = ["Emma Wilson", "Lucas Martin", "Sofia Rossi", "Lucía Gómez", "James Brown", "Chloé Bernard", "Marco Bianchi", "Ana López", "Oliver Smith", "Léa Dubois", "Giulia Ferrari", "Pablo Ruiz", "Youssef Alami", "Sara Benali"];
const hotels = ["Riad Dar Anika", "La Mamounia", "Riad Kniza", "Hôtel Les Jardins de la Koutoubia", "Riad Yasmine", "Four Seasons Marrakech"];
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const iso = (d) => d.toISOString().slice(0, 10);

async function main() {
  const del = await db.booking.deleteMany({ where: { reference: { startsWith: "DM-" } } });
  if (clear) { console.log(`${del.count} réservations de démonstration supprimées.`); return; }

  const [routes, transfers, tours, drivers] = await Promise.all([
    db.busRoute.findMany(), db.transfer.findMany(), db.tour.findMany(), db.driver.findMany({ where: { active: true } }),
  ]);
  if (!routes.length || !tours.length) { console.log("Lancez d'abord npm run setup pour créer les trajets."); return; }

  // Chaque chauffeur a un « niveau » pour que le classement de démo soit parlant
  const level = Object.fromEntries(drivers.map((d, i) => [d.id, [4.7, 4.2, 3.6, 4.9, 3.1][i % 5]]));
  const comments = {
    5: ["Chauffeur adorable et très ponctuel, je recommande !", "Perfect transfer, driver was waiting with a sign.", "Excursión increíble, conductor muy amable.", "Autista puntualissimo e gentile."],
    4: ["Très bien, véhicule propre et confortable.", "Good trip, a bit of traffic but all fine.", "Todo correcto, buen servicio."],
    3: ["Correct, mais un peu de retard au départ.", "OK overall, the van could be cleaner."],
    2: ["Chauffeur en retard de 30 minutes.", "Conduite un peu brusque."],
    1: ["Le chauffeur n'est jamais venu, très déçu."],
  };
  let n = 0, nr = 0;
  for (let i = -45; i <= 10; i++) {
    const perDay = i > 0 ? 1 : 1 + Math.floor(Math.random() * 3);
    for (let k = 0; k < perDay; k++) {
      const created = new Date(Date.now() + (i > 0 ? -Math.floor(Math.random() * 20) : i) * 864e5 - Math.random() * 6e6);
      const travel = new Date(created.getTime() + Math.floor(Math.random() * 4) * 864e5);
      if (i > 0) travel.setTime(Date.now() + i * 864e5);
      const date = iso(travel);
      const past = date < iso(new Date());
      const kind = pick(["BUS", "BUS", "TRANSFER", "TOUR", "TOUR"]);
      const driver = drivers.length && Math.random() > 0.2 ? pick(drivers) : null;
      const payment = Math.random() > 0.35 ? "CASH" : "BANK_TRANSFER";
      const status = past ? (Math.random() > 0.1 ? "COMPLETED" : "CANCELLED") : Math.random() > 0.4 ? "CONFIRMED" : "PENDING";
      const pax = 1 + Math.floor(Math.random() * 4);
      let data = {};
      if (kind === "BUS") { const r = pick(routes); data = { busRouteId: r.id, time: r.departure, total: r.price * pax }; }
      if (kind === "TRANSFER") { const t = pick(transfers); data = { transferId: t.id, time: pick(["09:30", "13:15", "17:40", "22:05"]), total: t.price, pickup: pick(hotels), flight: pick(["AT800", "FR4512", "U27713", "BA2662"]) }; }
      if (kind === "TOUR") { const t = pick(tours); data = { tourId: t.id, time: t.departure, total: t.price * pax, pickup: pick(hotels) }; }
      const completed = status === "COMPLETED" && driver;
      const booking = await db.booking.create({
        data: {
          ...data, reference: `DM-${Math.random().toString(36).slice(2, 8).toUpperCase()}`, type: kind, date, passengers: pax,
          fullName: pick(names), email: "demo@example.com", phone: "+212600000000", locale: pick(["en", "fr", "es", "it"]),
          payment, status, createdAt: created,
          paid: status === "COMPLETED" ? Math.random() > 0.1 : payment === "BANK_TRANSFER" && Math.random() > 0.5,
          driverId: status === "PENDING" ? null : driver?.id ?? null,
          completedAt: completed ? travel : null,
          commission: completed ? Math.round((data.total * driver.commissionRate) / 100) : null,
          settled: completed ? Math.random() > 0.5 : false,
        },
      });
      n++;
      if (completed && Math.random() > 0.35) {
        const rating = Math.max(1, Math.min(5, Math.round(level[driver.id] + (Math.random() - 0.5) * 1.6)));
        await db.review.create({ data: { bookingId: booking.id, driverId: driver.id, rating, comment: pick(comments[rating]), name: booking.fullName.split(" ")[0], locale: booking.locale, createdAt: travel } });
        nr++;
      }
    }
  }
  console.log(`${n} réservations et ${nr} avis de démonstration ajoutés (références DM-…). Pour les supprimer : npm run db:demo:clear`);
}

main().finally(() => db.$disconnect());
