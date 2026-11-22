import { db } from "@/lib/db";
import { saveRoute } from "../actions";
import Shell from "@/components/admin/Shell";

export const dynamic = "force-dynamic";

function RouteFields({ r }: { r?: { id: string; fromCity: string; toCity: string; departure: string; durationMin: number; price: number; seats: number; active: boolean } }) {
  return (
    <>
      <input type="hidden" name="id" value={r?.id ?? ""} />
      <input name="fromCity" defaultValue={r?.fromCity} placeholder="Départ" className="input" required />
      <input name="toCity" defaultValue={r?.toCity} placeholder="Arrivée" className="input" required />
      <input name="departure" type="time" defaultValue={r?.departure ?? "08:00"} className="input" required />
      <input name="durationMin" type="number" min={1} defaultValue={r?.durationMin ?? 180} title="Durée (minutes)" className="input" />
      <input name="price" type="number" min={0} defaultValue={r?.price ?? 100} title="Prix (MAD)" className="input" />
      <input name="seats" type="number" min={1} defaultValue={r?.seats ?? 50} title="Places" className="input" />
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" defaultChecked={r?.active ?? true} />Actif</label>
    </>
  );
}

export default async function RoutesPage() {
  const routes = await db.busRoute.findMany({ orderBy: [{ fromCity: "asc" }, { departure: "asc" }] });
  const cols = "grid gap-2 sm:grid-cols-4 lg:grid-cols-[1fr_1fr_110px_100px_100px_90px_80px_auto] lg:items-center";
  return (
    <Shell title="Lignes de bus">
      <div className={`${cols} mb-2 hidden px-4 text-xs font-semibold uppercase tracking-wide text-ink-500 lg:grid`}>
        <span>Départ</span><span>Arrivée</span><span>Heure</span><span>Durée (min)</span><span>Prix (MAD)</span><span>Places</span><span>Actif</span><span />
      </div>
      <div className="space-y-2">
        {routes.map((r) => (
          <form key={r.id} action={saveRoute} className={`card p-3 ${cols} ${r.active ? "" : "opacity-60"}`}>
            <RouteFields r={r} />
            <button className="btn-ghost py-2">Enregistrer</button>
          </form>
        ))}
      </div>
      <h2 className="mb-3 mt-10 text-lg font-bold">Ajouter une ligne</h2>
      <form action={saveRoute} className={`card p-3 ${cols}`}>
        <RouteFields />
        <button className="btn-primary py-2">Ajouter</button>
      </form>
    </Shell>
  );
}
