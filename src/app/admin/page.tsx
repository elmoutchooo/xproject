import Link from "next/link";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/i18n";
import { todayISO } from "@/lib/booking";
import Shell from "@/components/admin/Shell";
import { BookingTable } from "@/components/admin/BookingRow";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const drivers = await db.driver.findMany({ where: { active: true }, select: { id: true, name: true }, orderBy: { name: "asc" } });
  const today = todayISO();
  const monthStart = today.slice(0, 8) + "01";
  const notCancelled = { status: { not: "CANCELLED" } };
  const include = { busRoute: true, transfer: true, tour: true };

  const [pending, todayTrips, monthAgg, unpaidAgg, upcoming, byType, commAgg, unassigned] = await Promise.all([
    db.booking.count({ where: { status: "PENDING" } }),
    db.booking.findMany({ where: { date: today, ...notCancelled }, include, orderBy: { time: "asc" } }),
    db.booking.aggregate({ _sum: { total: true }, _count: true, where: { date: { gte: monthStart }, ...notCancelled } }),
    db.booking.aggregate({ _sum: { total: true }, where: { paid: false, status: { in: ["PENDING", "CONFIRMED", "COMPLETED"] } } }),
    db.booking.findMany({ where: { date: { gt: today }, ...notCancelled }, include, orderBy: [{ date: "asc" }, { time: "asc" }], take: 10 }),
    db.booking.groupBy({ by: ["type"], _count: true, _sum: { total: true }, where: { date: { gte: monthStart }, ...notCancelled } }),
    db.booking.aggregate({ _sum: { commission: true }, where: { status: "COMPLETED", date: { gte: monthStart } } }),
    db.booking.count({ where: { driverId: null, date: { gte: today }, status: { in: ["PENDING", "CONFIRMED"] } } }),
  ]);

  const stats = [
    { label: "À confirmer", value: String(pending), href: "/admin/bookings?status=PENDING", tone: "text-amber-600" },
    { label: "Trajets aujourd'hui", value: String(todayTrips.length), href: `/admin/bookings?date=${today}`, tone: "text-coral-600" },
    { label: "Réservations ce mois", value: String(monthAgg._count), href: "/admin/bookings", tone: "text-ink-900" },
    { label: "Chiffre d'affaires du mois", value: formatPrice(monthAgg._sum.total ?? 0), href: "/admin/bookings", tone: "text-emerald-700" },
    { label: "Sans chauffeur", value: String(unassigned), href: "/admin/bookings?driver=none", tone: unassigned ? "text-rose-600" : "text-ink-900" },
    { label: "Commissions chauffeurs (mois)", value: formatPrice(commAgg._sum.commission ?? 0), href: "/admin/drivers", tone: "text-emerald-700" },
    { label: "Reste à encaisser", value: formatPrice(unpaidAgg._sum.total ?? 0), href: "/admin/bookings?paid=false", tone: "text-rose-600" },
  ];
  const typeLabel: Record<string, string> = { BUS: "Bus", TRANSFER: "Transferts", TOUR: "Excursions" };

  return (
    <Shell title="Tableau de bord">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="card p-5 transition hover:shadow-md">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">{s.label}</p>
            <p className={`mt-2 text-2xl font-extrabold ${s.tone}`}>{s.value}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {["BUS", "TRANSFER", "TOUR"].map((k) => {
          const g = byType.find((x) => x.type === k);
          return (
            <div key={k} className="card p-5">
              <p className="text-sm font-semibold text-ink-600">{typeLabel[k]} (ce mois)</p>
              <p className="mt-1 text-lg font-bold">{g?._count ?? 0} réservations · {formatPrice(g?._sum.total ?? 0)}</p>
            </div>
          );
        })}
      </div>

      <h2 className="mb-3 mt-10 text-lg font-bold">Aujourd&apos;hui</h2>
      <BookingTable bookings={todayTrips} drivers={drivers} />
      <h2 className="mb-3 mt-10 text-lg font-bold">Prochains départs</h2>
      <BookingTable bookings={upcoming} drivers={drivers} />
    </Shell>
  );
}
