import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/i18n";
import { summarize } from "@/lib/commission";
import { blockDriver, removeWarning, settleDriver, unblockDriver } from "../../actions";
import { driverRanking, MAX_WARNINGS, stars } from "@/lib/ranking";
import Stars from "@/components/admin/Stars";
import WarningDots from "@/components/admin/WarningDots";
import WarningForm from "@/components/admin/WarningForm";
import Shell from "@/components/admin/Shell";
import DriverForm from "@/components/admin/DriverForm";
import { tripLabel } from "@/components/admin/BookingRow";
import Balance from "@/components/admin/Balance";

export const dynamic = "force-dynamic";

export default async function DriverDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const d = await db.driver.findUnique({
    where: { id },
    include: {
      bookings: { include: { busRoute: true, transfer: true, tour: true, driver: true }, orderBy: [{ date: "desc" }, { time: "desc" }], take: 100 },
      warnings: { orderBy: { createdAt: "desc" } },
      reviews: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });
  if (!d) notFound();
  const rk = (await driverRanking()).find((r) => r.id === d.id)!;
  const done = d.bookings.filter((b) => b.status === "COMPLETED");
  const open = summarize(done.filter((b) => !b.settled));
  const all = summarize(done);

  return (
    <Shell title={d.name} action={<Link href="/admin/drivers" className="btn-ghost">← Chauffeurs</Link>}>
      {!d.active && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-rose-200 bg-rose-50 p-5">
          <div>
            <p className="font-semibold text-rose-800">Compte bloqué{d.blockedReason ? ` · ${d.blockedReason}` : ""}</p>
            <p className="text-sm text-rose-700">Le chauffeur ne peut plus se connecter et ne reçoit plus de trajets. Ses trajets à venir ont été remis « sans chauffeur ».</p>
          </div>
          <form action={unblockDriver}><input type="hidden" name="driverId" value={d.id} /><button className="btn-dark py-2.5">Débloquer (remet les avertissements à 0)</button></form>
        </div>
      )}
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

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="card p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-semibold text-ink-900">Avis clients</h2>
              <p className="mt-1 flex items-center gap-2 text-sm text-ink-600"><Stars value={rk.avg ?? 0} />{rk.count ? `${stars(rk.avg)}/5 · ${rk.count} avis` : "Pas encore d'avis"}</p>
            </div>
            {rk.count > 0 && <div className="rounded-xl bg-ink-900 px-4 py-2 text-center text-white"><p className="text-xs text-ink-300">Classement</p><p className="text-xl font-semibold">{rk.rank}<span className="text-sm text-ink-300">/{rk.total}</span></p></div>}
          </div>
          <ul className="mt-4 divide-y divide-ink-100">
            {d.reviews.map((r) => (
              <li key={r.id} className="py-3 text-sm">
                <div className="flex items-center gap-2"><Stars value={r.rating} /><span className="font-medium text-ink-800">{r.name}</span><span className="text-xs text-ink-400">{r.createdAt.toLocaleDateString("fr-FR")}</span></div>
                {r.comment && <p className="mt-1 text-ink-600">“{r.comment}”</p>}
              </li>
            ))}
            {d.reviews.length === 0 && <li className="py-6 text-center text-sm text-ink-400">Les avis apparaîtront ici après les trajets terminés.</li>}
          </ul>
        </section>

        <section className="card p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-semibold text-ink-900">Avertissements</h2>
            <WarningDots n={d.warnings.length} />
          </div>
          <ul className="mt-3 space-y-2">
            {d.warnings.map((w, i) => (
              <li key={w.id} className="flex items-start justify-between gap-3 rounded-xl bg-amber-50 p-3 text-sm">
                <span><span className="font-semibold text-amber-900">#{d.warnings.length - i}</span> <span className="text-amber-900">{w.reason}</span><span className="block text-xs text-amber-700">{w.createdAt.toLocaleDateString("fr-FR", { dateStyle: "long" })}</span></span>
                <form action={removeWarning}><input type="hidden" name="id" value={w.id} /><button className="text-xs font-semibold text-amber-800 hover:underline">Retirer</button></form>
              </li>
            ))}
            {d.warnings.length === 0 && <li className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">Aucun avertissement.</li>}
          </ul>
          {d.active ? (
            <>
              <WarningForm driverId={d.id} next={d.warnings.length + 1} />
              <form action={blockDriver} className="mt-4 border-t border-ink-100 pt-4">
                <input type="hidden" name="driverId" value={d.id} />
                <button className="text-sm font-semibold text-rose-600 hover:underline">Bloquer ce chauffeur maintenant</button>
              </form>
            </>
          ) : (
            <p className="mt-4 text-sm text-ink-500">Compte bloqué : débloquez-le pour donner de nouveaux avertissements.</p>
          )}
          <p className="mt-3 text-xs text-ink-400">Au {MAX_WARNINGS}<sup>e</sup> avertissement, le compte est bloqué automatiquement.</p>
        </section>
      </div>

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
      <DriverForm key={`${d.active}-${d.warnings.length}`} driver={d} />
    </Shell>
  );
}
