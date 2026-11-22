import Link from "next/link";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/i18n";
import { summarize } from "@/lib/commission";
import { driverRanking, stars } from "@/lib/ranking";
import Shell from "@/components/admin/Shell";
import DriverForm from "@/components/admin/DriverForm";
import Balance from "@/components/admin/Balance";
import Stars from "@/components/admin/Stars";
import WarningDots from "@/components/admin/WarningDots";

export const dynamic = "force-dynamic";

const medal = ["🥇", "🥈", "🥉"];

export default async function DriversPage() {
  const [ranking, money] = await Promise.all([
    driverRanking(),
    db.driver.findMany({ include: { bookings: { where: { status: "COMPLETED" }, select: { total: true, commission: true, payment: true, settled: true } } } }),
  ]);
  const byId = Object.fromEntries(money.map((d) => [d.id, d]));
  const podium = ranking.filter((r) => r.count > 0).slice(0, 3);

  return (
    <Shell title="Chauffeurs" subtitle="Classement selon les avis clients, avertissements et comptes à régler.">
      {podium.length > 0 && (
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          {podium.map((r, i) => (
            <Link key={r.id} href={`/admin/drivers/${r.id}`} className={`card relative overflow-hidden p-5 transition hover:-translate-y-0.5 hover:shadow-lg ${i === 0 ? "bg-ink-900 text-white" : ""}`}>
              {i === 0 && <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-coral-500/30 blur-2xl" />}
              <p className="relative text-3xl">{medal[i]}</p>
              <p className={`relative mt-2 font-semibold ${i === 0 ? "text-white" : "text-ink-900"}`}>{r.name}</p>
              <p className="relative mt-1 flex items-center gap-2 text-sm"><Stars value={r.avg ?? 0} /><span className={i === 0 ? "text-ink-200" : "text-ink-600"}>{stars(r.avg)} · {r.count} avis</span></p>
            </Link>
          ))}
        </div>
      )}

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="border-b border-ink-100 text-xs uppercase tracking-wide text-ink-500">
            <tr>
              <th className="px-4 py-3">Rang</th><th className="px-4 py-3">Chauffeur</th><th className="px-4 py-3">Note clients</th><th className="px-4 py-3">Avertissements</th>
              <th className="px-4 py-3">Trajets</th><th className="px-4 py-3">Chiffre</th><th className="px-4 py-3">Commission agence</th><th className="px-4 py-3">Solde à régler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {ranking.map((r) => {
              const d = byId[r.id];
              const all = summarize(d.bookings);
              const open = summarize(d.bookings.filter((b) => !b.settled));
              return (
                <tr key={r.id} className={r.active ? "" : "bg-rose-50/40"}>
                  <td className="px-4 py-3 text-lg font-semibold tabular-nums text-ink-900">{r.count ? (medal[r.rank - 1] ?? `${r.rank}`) : <span className="text-sm font-normal text-ink-400">—</span>}</td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/drivers/${r.id}`} className="font-semibold text-coral-600 hover:underline">{r.name}</Link>
                    <p className="text-xs text-ink-500">{d.phone}{d.vehicle ? ` · ${d.vehicle}` : ""} · {d.commissionRate} %</p>
                    {!r.active && <span className="mt-1 inline-block rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-700">Bloqué{r.blockedReason ? ` · ${r.blockedReason}` : ""}</span>}
                  </td>
                  <td className="px-4 py-3">{r.count ? <span className="flex items-center gap-2"><Stars value={r.avg ?? 0} /><span className="font-semibold text-ink-900">{stars(r.avg)}</span><span className="text-xs text-ink-400">({r.count})</span></span> : <span className="text-xs text-ink-400">Pas encore d&apos;avis</span>}</td>
                  <td className="px-4 py-3"><WarningDots n={r.warnings} /></td>
                  <td className="px-4 py-3 tabular-nums">{all.trips}</td>
                  <td className="px-4 py-3 tabular-nums">{formatPrice(all.gross)}</td>
                  <td className="px-4 py-3 font-semibold tabular-nums text-emerald-700">{formatPrice(all.commission)}</td>
                  <td className="px-4 py-3"><Balance value={open.balance} /></td>
                </tr>
              );
            })}
            {ranking.length === 0 && <tr><td colSpan={8} className="px-4 py-10 text-center text-ink-400">Aucun chauffeur. Ajoutez-en un ci-dessous.</td></tr>}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-ink-500">
        Le classement tient compte du nombre d&apos;avis : un chauffeur avec un seul avis 5★ ne passe pas devant un chauffeur avec beaucoup d&apos;excellents avis.
        Au 3<sup>e</sup> avertissement, le compte est bloqué automatiquement.
      </p>

      <h2 className="mb-3 mt-10 text-lg font-semibold">Ajouter un chauffeur</h2>
      <DriverForm />
    </Shell>
  );
}
