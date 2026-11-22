import { db } from "@/lib/db";
import { formatPrice, tr } from "@/lib/i18n";
import { todayISO } from "@/lib/booking";
import { summarize } from "@/lib/commission";
import { LogoTile } from "@/components/brand/Logo";
import { currentDriver, driverCompleteTrip, driverLogout } from "./actions";
import { PhoneIcon, PinIcon, PlaneIcon, UsersIcon, WhatsAppIcon } from "@/components/Icons";

export const dynamic = "force-dynamic";

const TYPE: Record<string, string> = { BUS: "Bus", TRANSFER: "Transfert aéroport", TOUR: "Excursion" };
const fmtDay = (d: string) => new Date(`${d}T12:00:00`).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });

export default async function DriverHome({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab = "upcoming" } = await searchParams;
  const driver = await currentDriver();
  const today = todayISO();
  const monthStart = today.slice(0, 8) + "01";
  const include = { busRoute: true, transfer: true, tour: true };

  const [upcoming, history, monthDone, unsettled] = await Promise.all([
    db.booking.findMany({ where: { driverId: driver.id, status: { in: ["PENDING", "CONFIRMED"] } }, include, orderBy: [{ date: "asc" }, { time: "asc" }] }),
    db.booking.findMany({ where: { driverId: driver.id, status: "COMPLETED" }, include, orderBy: [{ date: "desc" }, { time: "desc" }], take: 50 }),
    db.booking.findMany({ where: { driverId: driver.id, status: "COMPLETED", date: { gte: monthStart } }, select: { total: true, commission: true, payment: true } }),
    db.booking.findMany({ where: { driverId: driver.id, status: "COMPLETED", settled: false }, select: { total: true, commission: true, payment: true } }),
  ]);
  const month = summarize(monthDone);
  const open = summarize(unsettled);
  const list = tab === "history" ? history : upcoming;

  const trip = (b: (typeof upcoming)[number]) =>
    b.busRoute ? `${b.busRoute.fromCity} → ${b.busRoute.toCity}` : b.transfer ? `${b.transfer.airport} → ${b.transfer.destination}` : b.tour ? tr(b.tour.title, "fr") : "";

  return (
    <div className="mx-auto max-w-lg pb-16">
      <header className="bg-ink-950 px-4 pb-6 pt-5 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LogoTile className="h-10 w-10" />
            <div>
            <p className="text-xs text-ink-300">CS Tours</p>
            <p className="text-lg font-semibold">Salam, {driver.name.split(" ")[0]} 👋</p>
            </div>
          </div>
          <form action={driverLogout}><button className="rounded-lg border border-white/20 px-3 py-1.5 text-xs font-semibold">Déconnexion</button></form>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl bg-white/10 p-3"><p className="text-xs text-ink-200">Trajets ce mois</p><p className="text-xl font-extrabold">{month.trips}</p></div>
          <div className="rounded-xl bg-white/10 p-3"><p className="text-xs text-ink-200">Mon gain ce mois</p><p className="text-lg font-extrabold">{formatPrice(month.net)}</p></div>
          <div className="rounded-xl bg-white/10 p-3"><p className="text-xs text-ink-200">Commission {driver.commissionRate}%</p><p className="text-lg font-extrabold">{formatPrice(month.commission)}</p></div>
        </div>
        {open.trips > 0 && (
          <p className={`mt-3 rounded-xl p-3 text-sm font-semibold ${open.balance > 0 ? "bg-amber-400/20 text-amber-100" : "bg-emerald-400/20 text-emerald-100"}`}>
            {open.balance > 0 ? `À remettre à l'agence : ${formatPrice(open.balance)}` : open.balance < 0 ? `L'agence vous doit : ${formatPrice(-open.balance)}` : "Comptes à jour"}
          </p>
        )}
      </header>

      <nav className="sticky top-0 z-10 flex gap-1 bg-ink-100 p-3">
        <a href="/driver" className={`flex-1 rounded-xl py-2.5 text-center text-sm font-semibold ${tab !== "history" ? "bg-white text-brand-800 shadow-sm" : "text-ink-500"}`}>À venir ({upcoming.length})</a>
        <a href="/driver?tab=history" className={`flex-1 rounded-xl py-2.5 text-center text-sm font-semibold ${tab === "history" ? "bg-white text-brand-800 shadow-sm" : "text-ink-500"}`}>Terminés</a>
      </nav>

      <div className="space-y-3 px-3">
        {list.length === 0 && <p className="card p-8 text-center text-ink-500">{tab === "history" ? "Aucun trajet terminé." : "Aucun trajet prévu pour le moment."}</p>}
        {list.map((b) => {
          const wa = b.phone.replace(/\D/g, "");
          const isToday = b.date === today;
          return (
            <article key={b.id} className={`card overflow-hidden ${isToday && tab !== "history" ? "ring-2 ring-coral-400" : ""}`}>
              <div className="flex items-center justify-between bg-ink-50 px-4 py-2.5 text-sm">
                <span className="font-semibold capitalize text-ink-800">{isToday ? "Aujourd'hui" : fmtDay(b.date)}{b.time ? ` · ${b.time}` : ""}</span>
                <span className="font-mono text-xs text-ink-400">{b.reference}</span>
              </div>
              <div className="space-y-2 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-coral-600">{TYPE[b.type]}</p>
                <p className="font-bold text-ink-900">{trip(b)}</p>
                <p className="flex items-center gap-2 text-sm text-ink-600"><UsersIcon className="h-4 w-4" />{b.fullName} · {b.passengers} pers.</p>
                {b.pickup && <p className="flex items-center gap-2 text-sm text-ink-600"><PinIcon className="h-4 w-4" />{b.pickup}</p>}
                {b.flight && <p className="flex items-center gap-2 text-sm text-ink-600"><PlaneIcon className="h-4 w-4" />Vol {b.flight}</p>}
                {b.notes && <p className="rounded-lg bg-amber-50 p-2 text-sm text-amber-900">“{b.notes}”</p>}
                <div className="flex items-center justify-between border-t border-ink-100 pt-3">
                  <div>
                    <p className="text-lg font-extrabold">{formatPrice(b.total)}</p>
                    <p className={`text-xs font-semibold ${b.payment === "CASH" ? "text-amber-700" : "text-ink-500"}`}>
                      {b.payment === "CASH" ? "À encaisser en espèces" : b.paid ? "Déjà payé par virement" : "Virement (en attente)"}
                    </p>
                  </div>
                  {b.status === "COMPLETED" && <p className="text-right text-xs text-ink-500">Commission {formatPrice(b.commission ?? 0)}<br /><span className="font-semibold text-ink-800">Mon gain {formatPrice(b.total - (b.commission ?? 0))}</span></p>}
                </div>
                {tab !== "history" && (
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <a href={`tel:+${wa}`} className="btn-ghost px-2 py-2.5 text-xs"><PhoneIcon className="h-4 w-4" />Appeler</a>
                    <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className="btn bg-[#25D366] px-2 py-2.5 text-xs text-white"><WhatsAppIcon className="h-4 w-4" />WhatsApp</a>
                    <form action={driverCompleteTrip}>
                      <input type="hidden" name="id" value={b.id} />
                      <button className="btn-dark w-full px-2 py-2.5 text-xs">✓ Terminé</button>
                    </form>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
