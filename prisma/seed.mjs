// Données d'exemple : node prisma/seed.mjs
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const j = (o) => JSON.stringify(o);

const routes = [
  ["Marrakech", "Essaouira", "08:00", 180, 120],
  ["Essaouira", "Marrakech", "17:00", 180, 120],
  ["Marrakech", "Casablanca", "07:00", 210, 150],
  ["Casablanca", "Marrakech", "15:00", 210, 150],
  ["Marrakech", "Agadir", "09:00", 180, 160],
  ["Agadir", "Marrakech", "16:00", 180, 160],
];

const transfers = [
  ["Marrakech Menara (RAK)", "Marrakech – Médina", "CAR", 3, 150],
  ["Marrakech Menara (RAK)", "Marrakech – Médina", "VAN", 7, 250],
  ["Marrakech Menara (RAK)", "Marrakech – Palmeraie", "CAR", 3, 200],
  ["Marrakech Menara (RAK)", "Marrakech – Palmeraie", "VAN", 7, 300],
  ["Marrakech Menara (RAK)", "Essaouira", "VAN", 7, 1100],
  ["Casablanca Mohammed V (CMN)", "Casablanca – Centre", "CAR", 3, 300],
  ["Casablanca Mohammed V (CMN)", "Marrakech", "VAN", 7, 1300],
  ["Agadir Al Massira (AGA)", "Agadir – Centre", "CAR", 3, 200],
  ["Agadir Al Massira (AGA)", "Taghazout", "VAN", 7, 400],
];

const tours = [
  {
    slug: "essaouira-day-trip", category: "FULL_DAY", durationH: 12, departure: "07:30", fromCity: "Marrakech", price: 350, maxPeople: 30,
    title: { en: "Essaouira Full Day Trip", fr: "Excursion journée à Essaouira", es: "Excursión de un día a Essaouira", it: "Gita di un giorno a Essaouira" },
    description: {
      en: "Leave Marrakech for the Atlantic coast: argan cooperative stop, free time in the medina, the port and the ramparts of Essaouira, then back in the evening.",
      fr: "Départ de Marrakech vers la côte atlantique : arrêt dans une coopérative d'argan, temps libre dans la médina, le port et les remparts d'Essaouira, retour le soir.",
      es: "Salida de Marrakech hacia la costa atlántica: parada en una cooperativa de argán, tiempo libre en la medina, el puerto y las murallas de Essaouira, regreso por la tarde.",
      it: "Partenza da Marrakech verso la costa atlantica: sosta in una cooperativa di argan, tempo libero nella medina, il porto e i bastioni di Essaouira, rientro la sera.",
    },
    includes: {
      en: ["Hotel pickup & drop-off", "Air-conditioned vehicle", "Argan cooperative visit", "Professional driver"],
      fr: ["Prise en charge à l'hôtel", "Véhicule climatisé", "Visite d'une coopérative d'argan", "Chauffeur professionnel"],
      es: ["Recogida y regreso al hotel", "Vehículo con aire acondicionado", "Visita a una cooperativa de argán", "Conductor profesional"],
      it: ["Prelievo e rientro in hotel", "Veicolo climatizzato", "Visita a una cooperativa di argan", "Autista professionista"],
    },
  },
  {
    slug: "ourika-valley", category: "FULL_DAY", durationH: 8, departure: "09:00", fromCity: "Marrakech", price: 250, maxPeople: 30,
    title: { en: "Ourika Valley & Atlas Mountains", fr: "Vallée de l'Ourika & Atlas", es: "Valle de Ourika y Atlas", it: "Valle dell'Ourika e Atlante" },
    description: {
      en: "A day in the Atlas Mountains: Berber villages, a traditional house visit, and a walk to the Setti Fatma waterfalls.",
      fr: "Une journée dans l'Atlas : villages berbères, visite d'une maison traditionnelle et balade jusqu'aux cascades de Setti Fatma.",
      es: "Un día en el Atlas: pueblos bereberes, visita a una casa tradicional y paseo hasta las cascadas de Setti Fatma.",
      it: "Una giornata sull'Atlante: villaggi berberi, visita a una casa tradizionale e passeggiata fino alle cascate di Setti Fatma.",
    },
    includes: {
      en: ["Hotel pickup & drop-off", "Air-conditioned vehicle", "Berber house visit with tea"],
      fr: ["Prise en charge à l'hôtel", "Véhicule climatisé", "Visite d'une maison berbère avec thé"],
      es: ["Recogida y regreso al hotel", "Vehículo con aire acondicionado", "Visita a una casa bereber con té"],
      it: ["Prelievo e rientro in hotel", "Veicolo climatizzato", "Visita a una casa berbera con tè"],
    },
  },
  {
    slug: "ouzoud-waterfalls", category: "FULL_DAY", durationH: 10, departure: "08:00", fromCity: "Marrakech", price: 300, maxPeople: 30,
    title: { en: "Ouzoud Waterfalls", fr: "Cascades d'Ouzoud", es: "Cascadas de Ouzoud", it: "Cascate di Ouzoud" },
    description: {
      en: "The highest waterfalls in North Africa, with olive groves, wild monkeys and an optional boat ride at the bottom of the falls.",
      fr: "Les plus hautes cascades d'Afrique du Nord, entre oliveraies et singes sauvages, avec balade en barque possible au pied des chutes.",
      es: "Las cascadas más altas del norte de África, entre olivares y monos salvajes, con paseo en barca opcional al pie de las cataratas.",
      it: "Le cascate più alte del Nord Africa, tra uliveti e scimmie selvatiche, con giro in barca facoltativo ai piedi delle cascate.",
    },
    includes: {
      en: ["Hotel pickup & drop-off", "Air-conditioned vehicle", "Local guide at the falls"],
      fr: ["Prise en charge à l'hôtel", "Véhicule climatisé", "Guide local aux cascades"],
      es: ["Recogida y regreso al hotel", "Vehículo con aire acondicionado", "Guía local en las cascadas"],
      it: ["Prelievo e rientro in hotel", "Veicolo climatizzato", "Guida locale alle cascate"],
    },
  },
  {
    slug: "agafay-desert-sunset", category: "FULL_DAY", durationH: 6, departure: "15:00", fromCity: "Marrakech", price: 450, maxPeople: 24,
    title: { en: "Agafay Desert Sunset & Dinner", fr: "Coucher de soleil & dîner à Agafay", es: "Atardecer y cena en el desierto de Agafay", it: "Tramonto e cena nel deserto di Agafay" },
    description: {
      en: "Camel ride at sunset in the Agafay stone desert, followed by a traditional dinner and music under the stars.",
      fr: "Balade à dos de dromadaire au coucher du soleil dans le désert d'Agafay, suivie d'un dîner traditionnel et de musique sous les étoiles.",
      es: "Paseo en camello al atardecer en el desierto de Agafay, seguido de una cena tradicional y música bajo las estrellas.",
      it: "Giro in cammello al tramonto nel deserto di Agafay, seguito da una cena tradizionale e musica sotto le stelle.",
    },
    includes: {
      en: ["Hotel pickup & drop-off", "Camel ride", "Dinner & show"],
      fr: ["Prise en charge à l'hôtel", "Balade à dos de dromadaire", "Dîner & spectacle"],
      es: ["Recogida y regreso al hotel", "Paseo en camello", "Cena y espectáculo"],
      it: ["Prelievo e rientro in hotel", "Giro in cammello", "Cena e spettacolo"],
    },
  },
  {
    slug: "marrakech-imlil-shuttle", category: "SHUTTLE", durationH: 2, departure: "09:00", fromCity: "Marrakech", price: 120, maxPeople: 16,
    title: { en: "Shuttle Marrakech → Imlil", fr: "Navette Marrakech → Imlil", es: "Lanzadera Marrakech → Imlil", it: "Navetta Marrakech → Imlil" },
    description: {
      en: "Shared shuttle to Imlil, the starting point for Toubkal treks.",
      fr: "Navette partagée vers Imlil, point de départ des treks du Toubkal.",
      es: "Lanzadera compartida a Imlil, punto de partida de los treks al Toubkal.",
      it: "Navetta condivisa per Imlil, punto di partenza dei trekking sul Toubkal.",
    },
    includes: {
      en: ["Shared air-conditioned minibus", "Luggage included"],
      fr: ["Minibus climatisé partagé", "Bagages inclus"],
      es: ["Minibús compartido con aire acondicionado", "Equipaje incluido"],
      it: ["Minibus condiviso climatizzato", "Bagagli inclusi"],
    },
  },
  {
    slug: "marrakech-ouarzazate-shuttle", category: "SHUTTLE", durationH: 4, departure: "08:00", fromCity: "Marrakech", price: 200, maxPeople: 16,
    title: { en: "Shuttle Marrakech → Ouarzazate", fr: "Navette Marrakech → Ouarzazate", es: "Lanzadera Marrakech → Ouarzazate", it: "Navetta Marrakech → Ouarzazate" },
    description: {
      en: "Cross the Tizi n'Tichka pass with a photo stop at Aït Ben Haddou.",
      fr: "Traversée du col du Tizi n'Tichka avec arrêt photo à Aït Ben Haddou.",
      es: "Cruce del puerto de Tizi n'Tichka con parada para fotos en Aït Ben Haddou.",
      it: "Attraversamento del passo Tizi n'Tichka con sosta fotografica ad Aït Ben Haddou.",
    },
    includes: {
      en: ["Shared air-conditioned minibus", "Photo stop at Aït Ben Haddou"],
      fr: ["Minibus climatisé partagé", "Arrêt photo à Aït Ben Haddou"],
      es: ["Minibús compartido con aire acondicionado", "Parada para fotos en Aït Ben Haddou"],
      it: ["Minibus condiviso climatizzato", "Sosta fotografica ad Aït Ben Haddou"],
    },
  },
];

async function main() {
  await db.booking.deleteMany();
  await db.busRoute.deleteMany();
  await db.transfer.deleteMany();
  await db.tour.deleteMany();

  for (const [fromCity, toCity, departure, durationMin, price] of routes) {
    await db.busRoute.create({ data: { fromCity, toCity, departure, durationMin, price, seats: 50 } });
  }
  for (const [airport, destination, vehicle, capacity, price] of transfers) {
    await db.transfer.create({ data: { airport, destination, vehicle, capacity, price } });
  }
  for (const t of tours) {
    await db.tour.create({
      data: { ...t, title: j(t.title), description: j(t.description), includes: j(t.includes) },
    });
  }
  console.log(`Seed OK: ${routes.length} lignes, ${transfers.length} transferts, ${tours.length} excursions`);
}

main().finally(() => db.$disconnect());
