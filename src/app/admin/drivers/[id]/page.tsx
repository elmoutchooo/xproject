import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/i18n";
import { summarize } from "@/lib/commission";
import { settleDriver } from "../../actions";
import Shell from "@/components/admin/Shell";
import DriverForm from "@/components/admin/DriverForm";
import { tripLabel } from "@/components/admin/BookingRow";
import Balance from "@/components/admin/Balance";

export const dynamic = "force-dynamic";

export default async function DriverDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const d = await db.driver.findUnique({
    where: { id },
    include: { bookings: { include: { busRoute: true, transfer: true, tour: true, driver: true }, orderBy: [{ date: "desc" }, { time: "desc" }], take: 100 } },
  });
  if (!d) notFound();
  const done = d.bookings.filter((b) => b.status === "COMPLETED");
  const open = summarize(done.filter((b) => !b.settled));
  const all = summarize(done);

  return (
    <Shell title={d.name} action={<Link href="/admin/drivers" className="btn-ghost">← Chauffeurs</Link>}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-5"><p className="label">Trajets terminés</p><p className="text-2xl font-extrabold">{all.trips}</p></div>
        <div className="card p-5"><p className="label">Chiffre total</p><p className="text-2xl font-extrabold">{formatPrice(all.gross)}</p></div>
        <div className="card p-5"><p className="label">Commission agence ({d.commissionRate}%)</p><p className="text-2xl font-extrabold text-emerald-700">{formatPrice(all.commission)}</p></div>
        <div className="card p-5">
          <p className="label">Solde non réglé</p>
          <p className="text-lg"><Balance value={open.balance} /></p>
          {open.trips > 0 && (
            <form action={settleDriver} className="mt-2">
              <input type="hidden" name="driverId" value={d.id} />
              <button className="btn-dark py-2 text-xs">Marquer comme réglé</button>
            </form>
          )}
        </div>
      </div>
      {open.trips > 0 && (
        <p className="mt-3 text-sm text-ink-500">
          Détail non réglé : {open.trips} trajet(s) · commission sur espèces due par le chauffeur {formatPrice(open.driverOwes)} · part chauffeur sur virements due par l&apos;agence {formatPrice(open.agencyOwes)}.
        </p>
      )}

      <h2 className="mb-3 mt-10 text-lg font-bold">Trajets</h2>
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-ink-100 text-xs uppercase tracking-wide text-ink-500">
            <tr><th className="px-4 py-3">Date</th><th className="px-4 py-3">Trajet</th><th className="px-4 py-3">Paiement</th><th className="px-4 py-3">Montant</th><th className="px-4 py-3">Commission</th><th className="px-4 py-3">Statut</th></tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {d.bookings.map((b) => (
              <tr key={b.id}>
                <td className="px-4 py-3">{b.date}{b.time ? ` · ${b.time}` : ""}<p className="font-mono text-xs text-ink-400">{b.reference}</p></td>
                <td className="px-4 py-3">{tripLabel(b)}</td>
                <td className="px-4 py-3">{b.payment === "CASH" ? "Espèces" : "Virement"}</td>
                <td className="px-4 py-3 font-semibold">{formatPrice(b.total)}</td>
                <td className="px-4 py-3">{b.commission != null ? formatPrice(b.commission) : "—"}</td>
                <td className="px-4 py-3 text-xs">
                  {b.status === "COMPLETED" ? (b.settled ? <span className="text-ink-400">Terminé · réglé</span> : <span className="font-semibold text-amber-700">Terminé · à régler</span>) : b.status === "CANCELLED" ? "Annulé" : "À venir"}
                </td>
              </tr>
            ))}
            {d.bookings.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-ink-400">Aucun trajet attribué.</td></tr>}
          </tbody>
        </table>
      </div>

      <h2 className="mb-3 mt-10 text-lg font-bold">Modifier le chauffeur</h2>
      <DriverForm driver={d} />
    </Shell>
  );
}
