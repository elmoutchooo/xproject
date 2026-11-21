import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import Shell, { STATUS_LABEL } from "@/components/admin/Shell";
import { BookingTable } from "@/components/admin/BookingRow";

export const dynamic = "force-dynamic";

type SP = { status?: string; type?: string; date?: string; q?: string; paid?: string; driver?: string };

export default async function BookingsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const drivers = await db.driver.findMany({ where: { active: true }, select: { id: true, name: true }, orderBy: { name: "asc" } });
  const where: Prisma.BookingWhereInput = {};
  if (sp.status) where.status = sp.status;
  if (sp.type) where.type = sp.type;
  if (sp.date) where.date = sp.date;
  if (sp.driver === "none") where.driverId = null;
  else if (sp.driver) where.driverId = sp.driver;
  if (sp.paid === "false") { where.paid = false; where.status = { in: ["PENDING", "CONFIRMED", "COMPLETED"] }; }
  if (sp.q) where.OR = [{ reference: { contains: sp.q.toUpperCase() } }, { fullName: { contains: sp.q } }, { email: { contains: sp.q.toLowerCase() } }, { phone: { contains: sp.q } }];

  const bookings = await db.booking.findMany({
    where, include: { busRoute: true, transfer: true, tour: true }, orderBy: [{ date: "desc" }, { time: "asc" }], take: 200,
  });

  return (
    <Shell title={`Réservations (${bookings.length})`}>
      <form className="card mb-4 grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-7 lg:items-end">
        <div className="lg:col-span-2"><label className="label">Recherche</label><input name="q" defaultValue={sp.q} placeholder="Réf., nom, email, téléphone" className="input" /></div>
        <div><label className="label">Date</label><input name="date" type="date" defaultValue={sp.date} className="input" /></div>
        <div><label className="label">Type</label>
          <select name="type" defaultValue={sp.type ?? ""} className="input"><option value="">Tous</option><option value="BUS">Bus</option><option value="TRANSFER">Transfert</option><option value="TOUR">Excursion</option></select>
        </div>
        <div><label className="label">Statut</label>
          <select name="status" defaultValue={sp.status ?? ""} className="input"><option value="">Tous</option>{Object.entries(STATUS_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
        </div>
        <div><label className="label">Chauffeur</label>
          <select name="driver" defaultValue={sp.driver ?? ""} className="input"><option value="">Tous</option><option value="none">Sans chauffeur</option>{drivers.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select>
        </div>
        <button className="btn-dark h-[42px]">Filtrer</button>
      </form>
      <BookingTable bookings={bookings} drivers={drivers} />
    </Shell>
  );
}
