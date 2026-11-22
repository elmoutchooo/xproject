// Réservations de démonstration pour voir le tableau de bord rempli.
//   npm run db:demo         → ajoute ~70 réservations fictives (références DM-…)
//   npm run db:demo:clear   → les supprime (vos vraies réservations ne sont pas touchées)
import { PrismaClient } from "@prisma/client";
import { randomBytes, scryptSync } from "node:crypto";

const db = new PrismaClient();
const clear = process.argv.includes("--clear");

const names = ["Emma Wilson", "Lucas Martin", "Sofia Rossi", "Lucía Gómez", "James Brown", "Chloé Bernard", "Marco Bianchi", "Ana López", "Oliver Smith", "Léa Dubois", "Giulia Ferrari", "Pablo Ruiz", "Youssef Alami", "Sara Benali"];
const hotels = ["Riad Dar Anika", "La Mamounia", "Riad Kniza", "Hôtel Les Jardins de la Koutoubia", "Riad Yasmine", "Four Seasons Marrakech"];
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const iso = (d) => d.toISOString().slice(0, 10);
const hash = (pw) => { const salt = randomBytes(16).toString("hex"); return `${salt}:${scryptSync(pw, salt, 64).toString("hex")}`; };

// Compte chauffeur de démonstration (supprimé par npm run db:demo:clear)
const DEMO_PHONE = "0600000001";
const DEMO_PASSWORD = "demo1234";

async function main() {
  const del = await db.booking.deleteMany({ where: { reference: { startsWith: "DM-" } } });
  const old = await db.driver.findUnique({ where: { phone: DEMO_PHONE } });
  if (old) {
    await db.booking.updateMany({ where: { driverId: old.id }, data: { driverId: null } });
    await db.review.updateMany({ where: { driverId: old.id }, data: { driverId: null } });
    await db.driver.delete({ where: { id: old.id } });
  }
  if (clear) { console.log(`${del.count} réservations de démonstration et le chauffeur de démo supprimés.`); return; }

  await db.driver.create({ data: { name: "Hamid Démo", phone: DEMO_PHONE, passwordHash: hash(DEMO_PASSWORD), vehicle: "Mercedes Vito – 12345-A-7", commissionRate: 10 } });

  const [routes, transfers, tours, drivers] = await Promise.all([
    db.busRoute.findMany(), db.transfer.findMany(), db.tour.findMany(), db.driver.findMany({ where: { active: true } }),
  ]);
  if (!routes.length || !tours.length) { console.log("Lancez d'abord npm run setup pour créer les trajets."); return; }

  // Chaque chauffeur a un « niveau » pour que le classement de démo soit parlant
  const level = Object.fromEntries(drivers.map((d, i) => [d.id, d.phone === DEMO_PHONE ? 4.6 : [4.7, 4.2, 3.6, 4.9, 3.1][i % 5]]));
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
  // Trajets à venir garantis pour le chauffeur de démo : 2 aujourd'hui, 2 demain
  const demo = await db.driver.findUnique({ where: { phone: DEMO_PHONE } });
  const today = iso(new Date()), tomorrow = iso(new Date(Date.now() + 864e5));
  const t1 = transfers[0], t2 = tours[0], r1 = routes[0], t3 = tours[1] ?? tours[0];
  const upcoming = [
    { type: "TRANSFER", date: today, time: "14:30", transferId: t1.id, total: t1.price, passengers: 3, fullName: "Emma Wilson", phone: "+447700900123", pickup: "Riad Dar Anika, Médina", flight: "BA2662", payment: "BANK_TRANSFER", paid: true, notes: "2 grosses valises + siège bébé" },
    { type: "TOUR", date: today, time: "16:00", tourId: t2.id, total: t2.price * 2, passengers: 2, fullName: "Lucas Martin", phone: "+33612345678", pickup: "Hôtel Les Jardins de la Koutoubia", payment: "CASH" },
    { type: "BUS", date: tomorrow, time: r1.departure, busRouteId: r1.id, total: r1.price * 2, passengers: 2, fullName: "Lucía Gómez", phone: "+34600111222", payment: "CASH" },
    { type: "TOUR", date: tomorrow, time: t3.departure, tourId: t3.id, total: t3.price * 4, passengers: 4, fullName: "Famille Rossi", phone: "+393330001122", pickup: "Riad Kniza", payment: "CASH" },
  ];
  for (const u of upcoming) {
    await db.booking.create({ data: { ...u, reference: `DM-${Math.random().toString(36).slice(2, 8).toUpperCase()}`, email: "demo@example.com", locale: "en", status: "CONFIRMED", driverId: demo.id } });
  }
  await db.warning.create({ data: { driverId: demo.id, reason: "Retard de 20 minutes à l'aéroport (exemple)" } });

  console.log(`\nChauffeur de démo → localhost:3000/driver · téléphone ${DEMO_PHONE} · mot de passe ${DEMO_PASSWORD}`);
  console.log(`${n} réservations et ${nr} avis de démonstration ajoutés (références DM-…). Pour les supprimer : npm run db:demo:clear`);
}

main().finally(() => db.$disconnect());
