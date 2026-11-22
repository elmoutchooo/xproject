import { db } from "@/lib/db";
import { saveTransfer } from "../actions";
import Shell from "@/components/admin/Shell";

export const dynamic = "force-dynamic";

type T = { id: string; airport: string; destination: string; vehicle: string; capacity: number; price: number; active: boolean };

function Fields({ x }: { x?: T }) {
  return (
    <>
      <input type="hidden" name="id" value={x?.id ?? ""} />
      <input name="airport" defaultValue={x?.airport} placeholder="Aéroport" className="input" required />
      <input name="destination" defaultValue={x?.destination} placeholder="Destination" className="input" required />
      <select name="vehicle" defaultValue={x?.vehicle ?? "CAR"} className="input">
        <option value="CAR">Voiture</option><option value="VAN">Van</option><option value="MINIBUS">Minibus</option>
      </select>
      <input name="capacity" type="number" min={1} defaultValue={x?.capacity ?? 3} title="Passagers max" className="input" />
      <input name="price" type="number" min={0} defaultValue={x?.price ?? 200} title="Prix (MAD)" className="input" />
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" defaultChecked={x?.active ?? true} />Actif</label>
    </>
  );
}

export default async function TransfersAdmin() {
  const list = await db.transfer.findMany({ orderBy: [{ airport: "asc" }, { destination: "asc" }] });
  const cols = "grid gap-2 sm:grid-cols-3 lg:grid-cols-[1.2fr_1.2fr_120px_90px_100px_80px_auto] lg:items-center";
  return (
    <Shell title="Transferts aéroport">
      <div className={`${cols} mb-2 hidden px-4 text-xs font-semibold uppercase tracking-wide text-ink-500 lg:grid`}>
        <span>Aéroport</span><span>Destination</span><span>Véhicule</span><span>Pass. max</span><span>Prix (MAD)</span><span>Actif</span><span />
      </div>
      <div className="space-y-2">
        {list.map((x) => (
          <form key={x.id} action={saveTransfer} className={`card p-3 ${cols} ${x.active ? "" : "opacity-60"}`}>
            <Fields x={x} />
            <button className="btn-ghost py-2">Enregistrer</button>
          </form>
        ))}
      </div>
      <h2 className="mb-3 mt-10 text-lg font-bold">Ajouter un transfert</h2>
      <form action={saveTransfer} className={`card p-3 ${cols}`}>
        <Fields />
        <button className="btn-primary py-2">Ajouter</button>
      </form>
    </Shell>
  );
}
