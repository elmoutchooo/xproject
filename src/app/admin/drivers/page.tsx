import Link from "next/link";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/i18n";
import { summarize } from "@/lib/commission";
import Shell from "@/components/admin/Shell";
import DriverForm from "@/components/admin/DriverForm";
import Balance from "@/components/admin/Balance";

export const dynamic = "force-dynamic";

export default async function DriversPage() {
  const drivers = await db.driver.findMany({
    orderBy: { name: "asc" },
    include: { bookings: { where: { status: "COMPLETED" }, select: { total: true, commission: true, payment: true, settled: true } } },
  });

  return (
    <Shell title="Chauffeurs">
      <p className="mb-4 max-w-3xl text-sm text-ink-600">
        Les chauffeurs se connectent sur <span className="font-mono font-semibold">/driver</span> avec leur numéro de téléphone.
        Sur chaque trajet terminé, l&apos;agence prend sa commission : en espèces le chauffeur la doit à l&apos;agence, par virement l&apos;agence doit la part du chauffeur.
      </p>
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="border-b border-ink-100 text-xs uppercase tracking-wide text-ink-500">
            <tr><th className="px-4 py-3">Chauffeur</th><th className="px-4 py-3">Commission</th><th className="px-4 py-3">Trajets terminés</th><th className="px-4 py-3">Chiffre total</th><th className="px-4 py-3">Commission agence</th><th className="px-4 py-3">Solde à régler</th></tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {drivers.map((d) => {
              const all = summarize(d.bookings);
              const open = summarize(d.bookings.filter((b) => !b.settled));
              return (
                <tr key={d.id} className={d.active ? "" : "opacity-50"}>
                  <td className="px-4 py-3">
                    <Link href={`/admin/drivers/${d.id}`} className="font-semibold text-coral-600 hover:underline">{d.name}</Link>
                    <p className="text-xs text-ink-500">{d.phone}{d.vehicle ? ` · ${d.vehicle}` : ""}{d.active ? "" : " · inactif"}</p>
                  </td>
                  <td className="px-4 py-3">{d.commissionRate}%</td>
                  <td className="px-4 py-3">{all.trips}</td>
                  <td className="px-4 py-3">{formatPrice(all.gross)}</td>
                  <td className="px-4 py-3 font-semibold text-emerald-700">{formatPrice(all.commission)}</td>
                  <td className="px-4 py-3"><Balance value={open.balance} /></td>
                </tr>
              );
            })}
            {drivers.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-ink-400">Aucun chauffeur. Ajoutez-en un ci-dessous.</td></tr>}
          </tbody>
        </table>
      </div>
      <h2 className="mb-3 mt-10 text-lg font-bold">Ajouter un chauffeur</h2>
      <DriverForm />
    </Shell>
  );
}
