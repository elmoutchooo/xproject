import Link from "next/link";
import { db } from "@/lib/db";
import { tr } from "@/lib/i18n";
import { deleteReview, toggleReview } from "../actions";
import Shell from "@/components/admin/Shell";
import Stars from "@/components/admin/Stars";

export const dynamic = "force-dynamic";

export default async function ReviewsPage({ searchParams }: { searchParams: Promise<{ r?: string }> }) {
  const { r } = await searchParams;
  const filter = r ? Number(r) : null;
  const [reviews, agg, byRating] = await Promise.all([
    db.review.findMany({
      where: filter ? { rating: filter } : {},
      include: { driver: true, booking: { include: { busRoute: true, transfer: true, tour: true } } },
      orderBy: { createdAt: "desc" }, take: 200,
    }),
    db.review.aggregate({ _avg: { rating: true }, _count: true }),
    db.review.groupBy({ by: ["rating"], _count: true }),
  ]);
  const total = agg._count || 1;
  const trip = (b: (typeof reviews)[number]["booking"]) =>
    b.busRoute ? `${b.busRoute.fromCity} → ${b.busRoute.toCity}` : b.transfer ? `${b.transfer.airport} → ${b.transfer.destination}` : b.tour ? tr(b.tour.title, "fr") : "";

  return (
    <Shell title="Avis clients" subtitle="Les clients notent leur trajet une fois terminé, depuis la page de leur réservation.">
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="card h-fit p-6">
          <p className="text-sm text-ink-500">Note moyenne</p>
          <p className="mt-1 text-4xl font-semibold text-ink-900">{agg._avg.rating ? agg._avg.rating.toFixed(1).replace(".", ",") : "—"}<span className="text-lg text-ink-400">/5</span></p>
          <div className="mt-1"><Stars value={agg._avg.rating ?? 0} size="h-5 w-5" /></div>
          <p className="mt-1 text-sm text-ink-500">{agg._count} avis</p>
          <ul className="mt-5 space-y-2">
            {[5, 4, 3, 2, 1].map((n) => {
              const c = byRating.find((x) => x.rating === n)?._count ?? 0;
              return (
                <li key={n}>
                  <Link href={filter === n ? "/admin/reviews" : `/admin/reviews?r=${n}`} className={`flex items-center gap-3 rounded-lg px-2 py-1 text-sm hover:bg-ink-50 ${filter === n ? "bg-coral-50" : ""}`}>
                    <span className="w-8 text-ink-600">{n} ★</span>
                    <span className="h-2 flex-1 overflow-hidden rounded-full bg-ink-100"><span className="block h-full rounded-full bg-coral-500" style={{ width: `${(c / total) * 100}%` }} /></span>
                    <span className="w-8 text-right tabular-nums text-ink-700">{c}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
          {filter && <Link href="/admin/reviews" className="mt-4 inline-block text-sm font-semibold text-coral-600">Voir tous les avis</Link>}
        </aside>

        <div className="space-y-3">
          {reviews.length === 0 && <p className="card p-10 text-center text-ink-500">Aucun avis pour le moment. Les clients pourront noter leur trajet dès qu&apos;il sera marqué « Terminé ».</p>}
          {reviews.map((rv) => (
            <article key={rv.id} className={`card p-5 ${rv.published ? "" : "opacity-60"}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2"><Stars value={rv.rating} /><span className="text-sm font-semibold text-ink-900">{rv.name}</span><span className="text-xs text-ink-400">· {rv.createdAt.toLocaleDateString("fr-FR")} · {rv.locale.toUpperCase()}</span></div>
                  <p className="mt-1 text-xs text-ink-500">{trip(rv.booking)} · <span className="font-mono">{rv.booking.reference}</span>{rv.driver && <> · Chauffeur : <Link href={`/admin/drivers/${rv.driver.id}`} className="font-medium text-coral-600 hover:underline">{rv.driver.name}</Link></>}</p>
                </div>
                <div className="flex gap-2">
                  <form action={toggleReview}><input type="hidden" name="id" value={rv.id} /><button className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${rv.published ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : "bg-ink-100 text-ink-600 hover:bg-ink-200"}`}>{rv.published ? "Visible sur le site" : "Masqué"}</button></form>
                  <form action={deleteReview}><input type="hidden" name="id" value={rv.id} /><button className="rounded-lg px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50">Supprimer</button></form>
                </div>
              </div>
              {rv.comment && <p className="mt-3 text-ink-700">“{rv.comment}”</p>}
            </article>
          ))}
        </div>
      </div>
    </Shell>
  );
}
