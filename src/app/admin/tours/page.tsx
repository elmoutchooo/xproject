import Link from "next/link";
import { db } from "@/lib/db";
import { formatPrice, tr } from "@/lib/i18n";
import Shell from "@/components/admin/Shell";

export const dynamic = "force-dynamic";

export default async function ToursAdmin() {
  const tours = await db.tour.findMany({ orderBy: [{ category: "asc" }, { createdAt: "asc" }] });
  return (
    <Shell title="Excursions & navettes" action={<Link href="/admin/tours/new" className="btn-primary">+ Nouvelle excursion</Link>}>
      <div className="card divide-y divide-ink-100">
        {tours.map((t) => (
          <Link key={t.id} href={`/admin/tours/${t.id}`} className={`flex flex-wrap items-center justify-between gap-3 p-4 hover:bg-ink-50 ${t.active ? "" : "opacity-60"}`}>
            <div>
              <p className="font-semibold">{tr(t.title, "fr")}</p>
              <p className="text-xs text-ink-500">{t.category === "SHUTTLE" ? "Navette" : "Journée"} · {t.fromCity} {t.departure} · {t.durationH}h · max {t.maxPeople} pers.{t.active ? "" : " · inactive"}</p>
            </div>
            <p className="font-bold">{formatPrice(t.price)}</p>
          </Link>
        ))}
      </div>
    </Shell>
  );
}
