import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { saveTour } from "../../actions";
import Shell from "@/components/admin/Shell";

export const dynamic = "force-dynamic";

const LANGS = [["en", "English"], ["fr", "Français"], ["es", "Español"], ["it", "Italiano"]] as const;
const parse = (json?: string): Record<string, unknown> => { try { return json ? JSON.parse(json) : {}; } catch { return {}; } };

export default async function TourEdit({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tour = id === "new" ? null : await db.tour.findUnique({ where: { id } });
  if (id !== "new" && !tour) notFound();
  const title = parse(tour?.title), desc = parse(tour?.description), inc = parse(tour?.includes);

  return (
    <Shell title={tour ? "Modifier l'excursion" : "Nouvelle excursion"} action={<Link href="/admin/tours" className="btn-ghost">← Retour</Link>}>
      <form action={saveTour} className="space-y-6">
        <input type="hidden" name="id" value={tour?.id ?? ""} />
        <div className="card grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2"><label className="label">Slug (URL)</label><input name="slug" defaultValue={tour?.slug} placeholder="essaouira-day-trip" className="input" required /></div>
          <div><label className="label">Type</label>
            <select name="category" defaultValue={tour?.category ?? "FULL_DAY"} className="input"><option value="FULL_DAY">Excursion journée</option><option value="SHUTTLE">Navette</option></select>
          </div>
          <div><label className="label">Ville de départ</label><input name="fromCity" defaultValue={tour?.fromCity ?? "Marrakech"} className="input" required /></div>
          <div><label className="label">Heure de départ</label><input name="departure" type="time" defaultValue={tour?.departure ?? "08:00"} className="input" required /></div>
          <div><label className="label">Durée (heures)</label><input name="durationH" type="number" min={1} defaultValue={tour?.durationH ?? 8} className="input" /></div>
          <div><label className="label">Prix / pers. (MAD)</label><input name="price" type="number" min={0} defaultValue={tour?.price ?? 300} className="input" /></div>
          <div><label className="label">Places max / jour</label><input name="maxPeople" type="number" min={1} defaultValue={tour?.maxPeople ?? 20} className="input" /></div>
          <div className="sm:col-span-2 lg:col-span-3"><label className="label">Image (URL)</label><input name="imageUrl" defaultValue={tour?.imageUrl ?? ""} placeholder="https://..." className="input" /></div>
          <label className="flex items-center gap-2 self-end pb-2 text-sm font-medium"><input type="checkbox" name="active" defaultChecked={tour?.active ?? true} />Active (visible sur le site)</label>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {LANGS.map(([l, name]) => (
            <div key={l} className="card space-y-3 p-6">
              <p className="font-bold">{name}{l === "en" && " *"}</p>
              <div><label className="label">Titre</label><input name={`title_${l}`} defaultValue={String(title[l] ?? "")} className="input" required={l === "en"} /></div>
              <div><label className="label">Description</label><textarea name={`description_${l}`} rows={4} defaultValue={String(desc[l] ?? "")} className="input" /></div>
              <div><label className="label">Inclus (une ligne par élément)</label><textarea name={`includes_${l}`} rows={4} defaultValue={Array.isArray(inc[l]) ? (inc[l] as string[]).join("\n") : ""} className="input" /></div>
            </div>
          ))}
        </div>
        <button className="btn-primary px-8">Enregistrer</button>
      </form>
    </Shell>
  );
}
