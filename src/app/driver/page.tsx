import { db } from "@/lib/db";
import { formatPrice, tr } from "@/lib/i18n";
import { todayISO } from "@/lib/booking";
import { summarize } from "@/lib/commission";
import { AGENCY } from "@/config/agency";
import { LogoTile, Wordmark } from "@/components/brand/Logo";
import Minibus from "@/components/brand/Minibus";
import { AreaGuard } from "@/components/SessionGuard";
import AutoRefresh from "@/components/AutoRefresh";
import { currentDriver, driverCompleteTrip, driverLogout } from "./actions";
import { BusIcon, CheckIcon, ClockIcon, MountainIcon, PhoneIcon, PinIcon, PlaneIcon, ShieldIcon, UsersIcon, WhatsAppIcon } from "@/components/Icons";

export const dynamic = "force-dynamic";

const TYPE: Record<string, { label: string; icon: React.ReactNode; tone: string }> = {
  BUS: { label: "Bus", icon: <BusIcon className="h-4 w-4" />, tone: "bg-sky-50 text-sky-700" },
  TRANSFER: { label: "Transfert aéroport", icon: <PlaneIcon className="h-4 w-4" />, tone: "bg-violet-50 text-violet-700" },
  TOUR: { label: "Excursion", icon: <MountainIcon className="h-4 w-4" />, tone: "bg-emerald-50 text-emerald-700" },
};

const dayLabel = (d: string, today: string) => {
  const tomorrow = new Date(Date.parse(`${today}T12:00:00Z`) + 864e5).toISOString().slice(0, 10);
  if (d === today) return "Aujourd'hui";
  if (d === tomorrow) return "Demain";
  return new Date(`${d}T12:00:00`).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
};

export default async function DriverHome({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab = "upcoming" } = await searchParams;
  const history = tab === "history";
  const driver = await currentDriver();
  const today = todayISO();
  const monthStart = today.slice(0, 8) + "01";
  const include = { busRoute: true, transfer: true, tour: true };

  const [upcoming, done, monthDone, unsettled] = await Promise.all([
    db.booking.findMany({ where: { driverId: driver.id, status: { in: ["PENDING", "CONFIRMED"] } }, include, orderBy: [{ date: "asc" }, { time: "asc" }] }),
    db.booking.findMany({ where: { driverId: driver.id, status: "COMPLETED" }, include, orderBy: [{ date: "desc" }, { time: "desc" }], take: 50 }),
    db.booking.findMany({ where: { driverId: driver.id, status: "COMPLETED", date: { gte: monthStart } }, select: { total: true, commission: true, payment: true } }),
    db.booking.findMany({ where: { driverId: driver.id, status: "COMPLETED", settled: false }, select: { total: true, commission: true, payment: true } }),
  ]);
  const month = summarize(monthDone);
  const open = summarize(unsettled);
  const list = history ? done : upcoming;
  const todayCount = upcoming.filter((b) => b.date === today).length;
  const next = upcoming[0];

  // Regroupement des trajets par jour
  const groups: { date: string; items: typeof list }[] = [];
  for (const b of list) {
    const g = groups.at(-1);
    if (g && g.date === b.date) g.items.push(b);
    else groups.push({ date: b.date, items: [b] });
  }

  const trip = (b: (typeof list)[number]) =>
    b.busRoute ? `${b.busRoute.fromCity} → ${b.busRoute.toCity}` : b.transfer ? `${b.transfer.airport} → ${b.transfer.destination}` : b.tour ? tr(b.tour.title, "fr") : "";
  const initials = driver.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const firstName = driver.name.split(" ")[0];
  const todayLong = new Date(`${today}T12:00:00`).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const balance =
    open.balance > 0 ? { label: "À remettre à l'agence", value: formatPrice(open.balance), tone: "text-amber-600", hint: "Commission sur les trajets payés en espèces" }
    : open.balance < 0 ? { label: "L'agence vous doit", value: formatPrice(-open.balance), tone: "text-emerald-600", hint: "Votre part sur les trajets payés par virement" }
    : { label: "Solde avec l'agence", value: "À jour", tone: "text-ink-900", hint: "Aucun compte en attente" };

  const stats = [
    { label: "Trajets ce mois", value: String(month.trips), hint: `${todayCount} aujourd'hui · ${upcoming.length} à venir`, icon: <BusIcon className="h-5 w-5" /> },
    { label: "Mon gain ce mois", value: formatPrice(month.net), hint: `Sur ${formatPrice(month.gross)} encaissés`, icon: <CheckIcon className="h-5 w-5" /> },
    { label: `Commission agence (${driver.commissionRate} %)`, value: formatPrice(month.commission), hint: "Ce mois-ci", icon: <ShieldIcon className="h-5 w-5" /> },
    { label: balance.label, value: balance.value, hint: balance.hint, icon: <ClockIcon className="h-5 w-5" />, tone: balance.tone },
  ];

  return (
    <div className="min-h-screen bg-sand-50">
      <AreaGuard area="driver" />
      <AutoRefresh seconds={30} />

      {/* En-tête */}
      <header className="relative overflow-hidden bg-ink-900 text-white">
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 animate-float rounded-full bg-coral-500/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 animate-float-slow rounded-full bg-coral-700/25 blur-3xl" />
        <div className="relative mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="logo-hover flex items-center gap-3">
            <LogoTile className="h-10 w-10" />
            <span className="hidden sm:block"><Wordmark dark compact /></span>
            <span className="ml-1 hidden rounded-full border border-white/15 px-2.5 py-0.5 text-xs font-medium text-ink-200 md:inline">Espace chauffeur</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold">{driver.name}</p>
              <p className="text-xs text-ink-300">{driver.vehicle ?? driver.phone}</p>
            </div>
            <span className="grid h-10 w-10 place-items-center rounded-full bg-coral-500 text-sm font-semibold">{initials}</span>
            <form action={driverLogout}>
              <button className="rounded-xl border border-white/15 px-3 py-2 text-xs font-semibold text-ink-100 transition hover:bg-white/10">Déconnexion</button>
            </form>
          </div>
        </div>

        <div className="relative mx-auto grid max-w-6xl gap-6 px-4 pb-24 pt-6 sm:px-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="animate-fade-up">
            <p className="text-sm capitalize text-ink-300">{todayLong}</p>
            <h1 className="mt-1 text-3xl font-semibold text-white sm:text-4xl">Salam, {firstName} 👋</h1>
            <p className="mt-2 text-ink-200">
              {todayCount > 0 ? `Vous avez ${todayCount} trajet${todayCount > 1 ? "s" : ""} aujourd'hui. Bonne route !` : "Aucun trajet aujourd'hui. Vos prochains trajets apparaîtront ici."}
            </p>
          </div>
          {next && (
            <div className="animate-fade-up rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur [animation-delay:120ms] lg:min-w-[320px]">
              <p className="text-xs font-semibold uppercase tracking-wide text-coral-400">Prochain trajet</p>
              <p className="mt-1 font-semibold text-white">{trip(next)}</p>
              <p className="mt-0.5 text-sm text-ink-300">{dayLabel(next.date, today)}{next.time ? ` · ${next.time}` : ""} · {next.fullName}</p>
            </div>
          )}
        </div>
      </header>

      <main className="relative mx-auto -mt-16 max-w-6xl px-4 pb-16 sm:px-6">
        {/* Chiffres */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          {stats.map((s, i) => (
            <div key={s.label} className="card animate-fade-up p-4 sm:p-5" style={{ animationDelay: `${150 + i * 70}ms` }}>
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-medium text-ink-500">{s.label}</p>
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-coral-50 text-coral-600">{s.icon}</span>
              </div>
              <p className={`mt-2 text-xl font-semibold sm:text-2xl ${s.tone ?? "text-ink-900"}`}>{s.value}</p>
              <p className="mt-1 text-xs text-ink-400">{s.hint}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Trajets */}
          <section>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">Mes trajets</h2>
              <nav className="flex rounded-xl bg-white p-1 shadow-sm ring-1 ring-ink-100">
                <a href="/driver" className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${!history ? "bg-ink-900 text-white" : "text-ink-500 hover:text-ink-900"}`}>À venir <span className="ml-1 opacity-70">{upcoming.length}</span></a>
                <a href="/driver?tab=history" className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${history ? "bg-ink-900 text-white" : "text-ink-500 hover:text-ink-900"}`}>Terminés <span className="ml-1 opacity-70">{done.length}</span></a>
              </nav>
            </div>

            {list.length === 0 && (
              <div className="card mt-4 overflow-hidden text-center">
                <div className="relative h-36 overflow-hidden bg-gradient-to-b from-coral-50 to-white" aria-hidden>
                  <div className="road-strip absolute inset-x-0 bottom-4 h-6 opacity-90" />
                  <div className="absolute bottom-8 left-0 w-32 animate-drive"><Minibus className="w-full" /></div>
                </div>
                <div className="p-8 pt-4">
                  <p className="text-lg font-semibold text-ink-900">{history ? "Aucun trajet terminé pour l'instant" : "Aucun trajet prévu pour le moment"}</p>
                  <p className="mx-auto mt-1 max-w-sm text-sm text-ink-500">
                    {history ? "Vos trajets terminés et vos gains s'afficheront ici." : "Dès que l'agence vous attribue un trajet, il apparaît ici avec toutes les infos du client."}
                  </p>
                </div>
              </div>
            )}

            <div className="mt-4 space-y-6">
              {groups.map((g) => (
                <div key={g.date}>
                  <p className={`mb-2 text-sm font-semibold capitalize ${g.date === today && !history ? "text-coral-600" : "text-ink-500"}`}>{dayLabel(g.date, today)}</p>
                  <div className="space-y-3">
                    {g.items.map((b) => {
                      const wa = b.phone.replace(/\D/g, "");
                      const type = TYPE[b.type];
                      const isToday = b.date === today && !history;
                      return (
                        <article key={b.id} className={`card overflow-hidden transition hover:shadow-md ${isToday ? "ring-2 ring-coral-400/70" : ""}`}>
                          <div className="flex flex-col sm:flex-row">
                            <div className={`flex items-center justify-between gap-3 px-5 py-3 sm:w-28 sm:flex-col sm:justify-center sm:py-5 ${isToday ? "bg-coral-500 text-white" : "bg-ink-50 text-ink-900"}`}>
                              <p className="text-2xl font-semibold">{b.time ?? "--:--"}</p>
                              <p className={`font-mono text-[0.7rem] ${isToday ? "text-white/80" : "text-ink-400"}`}>{b.reference}</p>
                            </div>
                            <div className="flex-1 p-5">
                              <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${type.tone}`}>{type.icon}{type.label}</span>
                                  <p className="mt-2 text-lg font-semibold text-ink-900">{trip(b)}</p>
                                </div>
                                <div className="sm:text-right">
                                  <p className="text-xl font-semibold text-ink-900">{formatPrice(b.total)}</p>
                                  <p className={`text-xs font-semibold ${b.payment === "CASH" ? "text-amber-600" : "text-ink-400"}`}>
                                    {b.payment === "CASH" ? "À encaisser en espèces" : b.paid ? "Payé par virement" : "Virement en attente"}
                                  </p>
                                </div>
                              </div>
                              <dl className="mt-3 grid gap-x-6 gap-y-1.5 text-sm text-ink-600 sm:grid-cols-2">
                                <div className="flex items-center gap-2"><UsersIcon className="h-4 w-4 text-ink-400" />{b.fullName} · {b.passengers} pers.</div>
                                {b.pickup && <div className="flex items-center gap-2"><PinIcon className="h-4 w-4 text-ink-400" />{b.pickup}</div>}
                                {b.flight && <div className="flex items-center gap-2"><PlaneIcon className="h-4 w-4 text-ink-400" />Vol {b.flight}</div>}
                              </dl>
                              {b.notes && <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-900">“{b.notes}”</p>}
                              {history ? (
                                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 border-t border-ink-100 pt-3 text-sm">
                                  <span className="text-ink-500">Commission agence : <b className="text-ink-800">{formatPrice(b.commission ?? 0)}</b></span>
                                  <span className="text-ink-500">Mon gain : <b className="text-emerald-700">{formatPrice(b.total - (b.commission ?? 0))}</b></span>
                                  <span className={b.settled ? "text-ink-400" : "font-medium text-amber-600"}>{b.settled ? "Réglé" : "À régler"}</span>
                                </div>
                              ) : (
                                <div className="mt-4 grid grid-cols-2 gap-2 border-t border-ink-100 pt-4 sm:flex sm:flex-wrap">
                                  <a href={`tel:+${wa}`} className="btn-ghost px-4 py-2.5"><PhoneIcon className="h-4 w-4" />Appeler</a>
                                  <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className="btn bg-[#25D366] px-4 py-2.5 text-white hover:brightness-95"><WhatsAppIcon className="h-4 w-4" />WhatsApp</a>
                                  <form action={driverCompleteTrip} className="col-span-2 sm:ml-auto">
                                    <input type="hidden" name="id" value={b.id} />
                                    <button className="btn-primary w-full px-5 py-3 sm:w-auto sm:py-2.5"><CheckIcon className="h-4 w-4" />Trajet terminé</button>
                                  </form>
                                </div>
                              )}
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Colonne d'infos */}
          <aside className="space-y-4">
            <div className="card p-5">
              <p className="text-sm font-semibold text-ink-900">Mon compte</p>
              <dl className="mt-3 space-y-2.5 text-sm">
                <div className="flex justify-between gap-4"><dt className="text-ink-500">Téléphone</dt><dd className="font-medium text-ink-800">{driver.phone}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-ink-500">Véhicule</dt><dd className="text-right font-medium text-ink-800">{driver.vehicle ?? "—"}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-ink-500">Commission agence</dt><dd className="font-medium text-ink-800">{driver.commissionRate} %</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-ink-500">Trajets terminés</dt><dd className="font-medium text-ink-800">{done.length}</dd></div>
              </dl>
            </div>

            <div className="card p-5">
              <p className="text-sm font-semibold text-ink-900">Comment ça marche</p>
              <ol className="mt-3 space-y-3 text-sm text-ink-600">
                {["L'agence vous attribue un trajet : il apparaît dans « À venir ».", "Contactez le client par appel ou WhatsApp avant le départ.", "À la fin, appuyez sur « Trajet terminé » : votre gain est calculé automatiquement."].map((s, i) => (
                  <li key={s} className="flex gap-3"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-coral-50 text-xs font-semibold text-coral-600">{i + 1}</span>{s}</li>
                ))}
              </ol>
            </div>

            <a href={`https://wa.me/${AGENCY.whatsapp}`} target="_blank" rel="noopener noreferrer" className="card group flex items-center gap-4 bg-ink-900 p-5 text-white transition hover:-translate-y-0.5 hover:shadow-lg">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#25D366]"><WhatsAppIcon className="h-6 w-6" /></span>
              <span>
                <span className="block text-sm font-semibold">Contacter l&apos;agence</span>
                <span className="block text-xs text-ink-300">{AGENCY.phone}</span>
              </span>
            </a>
          </aside>
        </div>
      </main>
    </div>
  );
}
