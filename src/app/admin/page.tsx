import Link from "next/link";
import { db } from "@/lib/db";
import { formatPrice, tr } from "@/lib/i18n";
import { todayISO } from "@/lib/booking";
import { summarize } from "@/lib/commission";
import Shell, { STATUS_COLOR, STATUS_LABEL, TYPE_LABEL } from "@/components/admin/Shell";
import SalesChart from "@/components/admin/SalesChart";
import { HBars, Sparkline } from "@/components/admin/charts";
import { LogoMark } from "@/components/brand/Logo";
import { AlertIcon, ArrowIcon, BusIcon, CheckIcon, ClockIcon, MountainIcon, PlaneIcon, PlusIcon, TicketIcon, UsersIcon, WalletIcon } from "@/components/Icons";

export const dynamic = "force-dynamic";

const iso = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (s: string, n: number) => iso(new Date(Date.parse(`${s}T12:00:00Z`) + n * 864e5));

function delta(cur: number, prev: number) {
  if (!prev) return cur ? { text: "Nouveau", up: true } : null;
  const p = Math.round(((cur - prev) / prev) * 100);
  return { text: `${p > 0 ? "+" : ""}${p} %`, up: p >= 0 };
}

export default async function Dashboard() {
  const today = todayISO();
  const monthStart = today.slice(0, 8) + "01";
  const d = new Date(`${today}T12:00:00Z`);
  const prevStart = iso(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() - 1, 1, 12)));
  const prevEnd = iso(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() - 1, Math.min(d.getUTCDate(), 28), 12)));
  const since30 = addDays(today, -29);
  const notCancelled = { status: { not: "CANCELLED" } };
  const include = { busRoute: true, transfer: true, tour: true, driver: true };

  const [recent60, pending, unassigned, unpaidTransfers, unpaidAgg, todayTrips, latest, drivers, monthBookings] = await Promise.all([
    db.booking.findMany({ where: { createdAt: { gte: new Date(`${prevStart}T00:00:00`) } }, select: { total: true, createdAt: true, status: true, commission: true, completedAt: true } }),
    db.booking.count({ where: { status: "PENDING" } }),
    db.booking.count({ where: { driverId: null, date: { gte: today }, status: { in: ["PENDING", "CONFIRMED"] } } }),
    db.booking.count({ where: { payment: "BANK_TRANSFER", paid: false, status: { not: "CANCELLED" } } }),
    db.booking.aggregate({ _sum: { total: true }, _count: true, where: { paid: false, status: { in: ["PENDING", "CONFIRMED", "COMPLETED"] } } }),
    db.booking.findMany({ where: { date: today, ...notCancelled }, include, orderBy: { time: "asc" } }),
    db.booking.findMany({ include, orderBy: { createdAt: "desc" }, take: 6 }),
    db.driver.findMany({ where: { active: true }, include: { bookings: { where: { status: "COMPLETED" }, select: { total: true, commission: true, payment: true, settled: true, date: true } } } }),
    db.booking.findMany({ where: { createdAt: { gte: new Date(`${monthStart}T00:00:00`) } }, include: { busRoute: true, transfer: true, tour: true } }),
  ]);

  // --- Chiffres du mois et comparaison avec la même période du mois dernier ---
  const day = (b: { createdAt: Date }) => iso(b.createdAt);
  const live = recent60.filter((b) => b.status !== "CANCELLED");
  const cur = live.filter((b) => day(b) >= monthStart);
  const prev = live.filter((b) => day(b) >= prevStart && day(b) <= prevEnd);
  const sum = (a: { total: number }[]) => a.reduce((s, b) => s + b.total, 0);
  const comm = (a: typeof recent60, from: string, to = "9999") => a.filter((b) => b.completedAt && iso(b.completedAt) >= from && iso(b.completedAt) <= to).reduce((s, b) => s + (b.commission ?? 0), 0);
  const commCur = comm(recent60, monthStart), commPrev = comm(recent60, prevStart, prevEnd);

  // --- Séries quotidiennes ---
  const days30 = Array.from({ length: 30 }, (_, i) => addDays(since30, i));
  const salesDays = days30.map((date) => {
    const items = live.filter((b) => day(b) === date);
    return { date, total: sum(items), count: items.length };
  });
  const last14 = salesDays.slice(-14);
  const commDays = days30.slice(-14).map((date) => recent60.filter((b) => b.completedAt && iso(b.completedAt) === date).reduce((s, b) => s + (b.commission ?? 0), 0));
  const sales30 = sum(salesDays);

  // --- Comptes chauffeurs ---
  const driverStats = drivers.map((dr) => {
    const month = summarize(dr.bookings.filter((b) => b.date >= monthStart));
    const open = summarize(dr.bookings.filter((b) => !b.settled));
    return { id: dr.id, name: dr.name, rate: dr.commissionRate, month, open };
  });
  const toSettle = driverStats.filter((x) => x.open.balance !== 0).length;
  const topDrivers = [...driverStats].sort((a, b) => b.month.gross - a.month.gross).slice(0, 5);

  // --- Répartition du mois ---
  const monthLive = monthBookings.filter((b) => b.status !== "CANCELLED");
  const byType = (["BUS", "TRANSFER", "TOUR"] as const).map((t) => {
    const items = monthLive.filter((b) => b.type === t);
    return { type: t, total: sum(items), count: items.length };
  });
  const byStatus = (["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"] as const).map((s) => ({ s, n: monthBookings.filter((b) => b.status === s).length }));
  const statusTotal = Math.max(byStatus.reduce((a, b) => a + b.n, 0), 1);
  const tripName = (b: (typeof monthBookings)[number]) =>
    b.busRoute ? `${b.busRoute.fromCity} → ${b.busRoute.toCity}` : b.transfer ? `${b.transfer.airport.replace(/ \(.*\)/, "")} → ${b.transfer.destination}` : b.tour ? tr(b.tour.title, "fr") : "—";
  const topTrips = Object.values(
    monthLive.reduce<Record<string, { name: string; total: number; count: number; type: string }>>((acc, b) => {
      const k = b.busRouteId ?? b.transferId ?? b.tourId ?? b.id;
      acc[k] ??= { name: tripName(b), total: 0, count: 0, type: b.type };
      acc[k].total += b.total; acc[k].count += 1;
      return acc;
    }, {}),
  ).sort((a, b) => b.total - a.total).slice(0, 5);

  const typeIcon: Record<string, React.ReactNode> = {
    BUS: <BusIcon className="h-4 w-4 text-ink-400" />, TRANSFER: <PlaneIcon className="h-4 w-4 text-ink-400" />, TOUR: <MountainIcon className="h-4 w-4 text-ink-400" />,
  };
  const statusDot: Record<string, string> = { PENDING: "#fab219", CONFIRMED: "#0ca30c", COMPLETED: "#8e7f78", CANCELLED: "#d03b3b" };

  const kpis = [
    { label: "Chiffre d'affaires du mois", value: formatPrice(sum(cur)), d: delta(sum(cur), sum(prev)), spark: last14.map((x) => x.total), icon: <WalletIcon className="h-5 w-5" /> },
    { label: "Réservations du mois", value: String(cur.length), d: delta(cur.length, prev.length), spark: last14.map((x) => x.count), icon: <TicketIcon className="h-5 w-5" /> },
    { label: "Commissions chauffeurs", value: formatPrice(commCur), d: delta(commCur, commPrev), spark: commDays, icon: <UsersIcon className="h-5 w-5" /> },
    { label: "Reste à encaisser", value: formatPrice(unpaidAgg._sum.total ?? 0), hint: `${unpaidAgg._count} réservation${unpaidAgg._count > 1 ? "s" : ""} non payée${unpaidAgg._count > 1 ? "s" : ""}`, icon: <ClockIcon className="h-5 w-5" /> },
  ];

  const todo = [
    { n: pending, label: "à confirmer", text: "Réservations en attente de confirmation", href: "/admin/bookings?status=PENDING" },
    { n: unassigned, label: "sans chauffeur", text: "Trajets à venir sans chauffeur attribué", href: "/admin/bookings?driver=none" },
    { n: unpaidTransfers, label: "virements", text: "Virements bancaires pas encore reçus", href: "/admin/bookings?paid=false" },
    { n: toSettle, label: "chauffeurs", text: "Comptes chauffeurs à régler", href: "/admin/drivers" },
  ];
  const todoCount = todo.reduce((s, x) => s + x.n, 0);

  const now = new Date();
  const hello = now.getHours() < 18 ? "Bonjour" : "Bonsoir";
  const dateLong = now.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <Shell title="Tableau de bord" subtitle={`Vue d'ensemble de l'activité · ${dateLong}`}
      action={<div className="flex flex-wrap gap-2">
        <Link href="/admin/drivers" className="btn-ghost py-2.5"><PlusIcon className="h-4 w-4" />Chauffeur</Link>
        <Link href="/admin/tours/new" className="btn-primary py-2.5"><PlusIcon className="h-4 w-4" />Excursion</Link>
      </div>}>

      {/* Bandeau d'accueil */}
      <section className="relative mb-6 overflow-hidden rounded-3xl bg-ink-900 p-6 text-white sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-20 h-64 w-64 animate-float rounded-full bg-coral-500/30 blur-3xl" />
        <div className="pointer-events-none absolute -right-6 bottom-0 hidden w-72 opacity-[0.08] md:block"><LogoMark bg="#2B2220" /></div>
        <div className="relative">
          <p className="text-sm text-ink-300">{hello} 👋</p>
          <h2 className="mt-1 text-2xl font-semibold text-white sm:text-3xl">
            {todayTrips.length} départ{todayTrips.length > 1 ? "s" : ""} aujourd&apos;hui · {todoCount} action{todoCount > 1 ? "s" : ""} à traiter
          </h2>
          <p className="mt-2 max-w-2xl text-ink-300">
            {formatPrice(sales30)} de ventes sur les 30 derniers jours. {pending ? `${pending} réservation${pending > 1 ? "s attendent" : " attend"} votre confirmation.` : "Toutes les réservations sont confirmées."}
          </p>
        </div>
      </section>

      {/* Indicateurs */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k, i) => (
          <div key={k.label} className="card animate-fade-up p-5" style={{ animationDelay: `${i * 70}ms` }}>
            <div className="flex items-center justify-between">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-coral-50 text-coral-600">{k.icon}</span>
              {k.d && (
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${k.d.up ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                  {k.d.up ? "▲" : "▼"} {k.d.text}
                </span>
              )}
            </div>
            <p className="mt-4 text-sm text-ink-500">{k.label}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-ink-900">{k.value}</p>
            {k.spark ? (
              <div className="mt-3"><Sparkline values={k.spark} /><p className="mt-1 text-[0.7rem] text-ink-400">14 derniers jours · vs même période du mois dernier</p></div>
            ) : (
              <p className="mt-3 text-sm text-ink-400">{k.hint}</p>
            )}
          </div>
        ))}
      </div>

      {/* Ventes + À traiter */}
      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_360px]">
        <section className="card p-5 sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="font-semibold text-ink-900">Ventes des 30 derniers jours</h2>
              <p className="text-sm text-ink-500">Montant des réservations par jour de réservation (hors annulées)</p>
            </div>
            <p className="text-2xl font-semibold tabular-nums text-ink-900">{formatPrice(sales30)}</p>
          </div>
          <div className="mt-4"><SalesChart days={salesDays} /></div>
        </section>

        <section className="card p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-ink-900">À traiter</h2>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${todoCount ? "bg-coral-50 text-coral-700" : "bg-emerald-50 text-emerald-700"}`}>{todoCount ? `${todoCount} en attente` : "Tout est à jour"}</span>
          </div>
          <ul className="mt-4 space-y-2">
            {todo.map((x) => (
              <li key={x.label}>
                <Link href={x.href} className="group flex items-center gap-3 rounded-xl border border-ink-100 p-3 transition hover:border-coral-200 hover:bg-coral-50/40">
                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-sm font-semibold ${x.n ? "bg-coral-500 text-white" : "bg-ink-50 text-ink-400"}`}>
                    {x.n ? x.n : <CheckIcon className="h-4 w-4" />}
                  </span>
                  <span className="min-w-0 flex-1 text-sm text-ink-700">{x.text}</span>
                  <ArrowIcon className="h-4 w-4 shrink-0 text-ink-300 transition group-hover:translate-x-0.5 group-hover:text-coral-500" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Répartition du mois */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="card p-5 sm:p-6">
          <h2 className="font-semibold text-ink-900">Ventes par service</h2>
          <p className="mb-5 text-sm text-ink-500">Ce mois-ci</p>
          <HBars format={formatPrice} rows={byType.map((x) => ({ label: TYPE_LABEL[x.type], value: x.total, sub: `· ${x.count}`, icon: typeIcon[x.type] }))} />
        </section>

        <section className="card p-5 sm:p-6">
          <h2 className="font-semibold text-ink-900">Statut des réservations</h2>
          <p className="mb-5 text-sm text-ink-500">Réservations créées ce mois-ci</p>
          <ul className="space-y-3">
            {byStatus.map(({ s, n }) => (
              <li key={s}>
                <Link href={`/admin/bookings?status=${s}`} className="flex items-center gap-3 text-sm hover:opacity-80">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: statusDot[s] }} />
                  <span className="w-28 text-ink-700">{STATUS_LABEL[s]}</span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-ink-100/70"><span className="block h-full rounded-full" style={{ width: `${(n / statusTotal) * 100}%`, background: statusDot[s] }} /></span>
                  <span className="w-8 text-right font-semibold tabular-nums text-ink-900">{n}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="card p-5 sm:p-6">
          <h2 className="font-semibold text-ink-900">Trajets les plus vendus</h2>
          <p className="mb-4 text-sm text-ink-500">Ce mois-ci, par montant</p>
          {topTrips.length === 0 ? <Empty text="Les trajets les plus vendus apparaîtront ici." /> : (
            <ol className="space-y-3">
              {topTrips.map((t, i) => (
                <li key={t.name} className="flex items-center gap-3 text-sm">
                  <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg text-xs font-semibold ${i === 0 ? "bg-coral-500 text-white" : "bg-ink-50 text-ink-500"}`}>{i + 1}</span>
                  <span className="min-w-0 flex-1"><span className="block truncate font-medium text-ink-800">{t.name}</span><span className="text-xs text-ink-400">{TYPE_LABEL[t.type]} · {t.count} rés.</span></span>
                  <span className="font-semibold tabular-nums text-ink-900">{formatPrice(t.total)}</span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>

      {/* Aujourd'hui + chauffeurs */}
      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_400px]">
        <section className="card p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div><h2 className="font-semibold text-ink-900">Départs d&apos;aujourd&apos;hui</h2><p className="text-sm text-ink-500">{todayTrips.length} trajet{todayTrips.length > 1 ? "s" : ""}</p></div>
            <Link href={`/admin/bookings?date=${today}`} className="text-sm font-semibold text-coral-600 hover:text-coral-700">Tout voir →</Link>
          </div>
          {todayTrips.length === 0 ? <Empty text="Aucun départ prévu aujourd'hui." /> : (
            <ol className="relative mt-5 space-y-4 border-l border-ink-100 pl-6">
              {todayTrips.map((b) => (
                <li key={b.id} className="relative">
                  <span className="absolute -left-[31px] top-1 h-3 w-3 rounded-full border-2 border-white bg-coral-500 ring-1 ring-coral-200" />
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-ink-900"><span className="tabular-nums">{b.time ?? "--:--"}</span> · {tripName(b)}</p>
                      <p className="text-xs text-ink-500">{b.fullName} · {b.passengers} pers. · {formatPrice(b.total)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {b.driver ? <span className="rounded-full bg-ink-50 px-2.5 py-1 text-xs font-medium text-ink-700">{b.driver.name}</span>
                        : <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800"><AlertIcon className="h-3.5 w-3.5" />Sans chauffeur</span>}
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_COLOR[b.status]}`}>{STATUS_LABEL[b.status]}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section className="card p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div><h2 className="font-semibold text-ink-900">Chauffeurs du mois</h2><p className="text-sm text-ink-500">Par chiffre réalisé</p></div>
            <Link href="/admin/drivers" className="text-sm font-semibold text-coral-600 hover:text-coral-700">Gérer →</Link>
          </div>
          {topDrivers.length === 0 ? <Empty text="Ajoutez vos chauffeurs pour suivre leurs trajets." /> : (
            <ul className="mt-4 divide-y divide-ink-100">
              {topDrivers.map((x) => (
                <li key={x.id}>
                  <Link href={`/admin/drivers/${x.id}`} className="flex items-center gap-3 py-3 hover:opacity-80">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink-900 text-xs font-semibold text-white">{x.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}</span>
                    <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium text-ink-800">{x.name}</span><span className="text-xs text-ink-400">{x.month.trips} trajet{x.month.trips > 1 ? "s" : ""} · commission {formatPrice(x.month.commission)}</span></span>
                    <span className="text-sm font-semibold tabular-nums text-ink-900">{formatPrice(x.month.gross)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Dernières réservations */}
      <section className="card mt-6 p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-ink-900">Dernières réservations</h2>
          <Link href="/admin/bookings" className="text-sm font-semibold text-coral-600 hover:text-coral-700">Toutes les réservations →</Link>
        </div>
        {latest.length === 0 ? <Empty text="Les nouvelles réservations du site apparaîtront ici." /> : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-ink-400">
                <tr><th className="pb-2 font-medium">Client</th><th className="pb-2 font-medium">Trajet</th><th className="pb-2 font-medium">Départ</th><th className="pb-2 font-medium">Montant</th><th className="pb-2 font-medium">Statut</th></tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {latest.map((b) => (
                  <tr key={b.id}>
                    <td className="py-3"><p className="font-medium text-ink-800">{b.fullName}</p><p className="font-mono text-xs text-ink-400">{b.reference}</p></td>
                    <td className="py-3"><span className="flex items-center gap-2 text-ink-700">{typeIcon[b.type]}{tripName(b)}</span></td>
                    <td className="py-3 tabular-nums text-ink-600">{b.date}{b.time ? ` · ${b.time}` : ""}</td>
                    <td className="py-3 font-semibold tabular-nums text-ink-900">{formatPrice(b.total)}</td>
                    <td className="py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_COLOR[b.status]}`}>{STATUS_LABEL[b.status]}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </Shell>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="mt-4 grid place-items-center rounded-2xl border border-dashed border-ink-200 px-4 py-10 text-center">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-coral-50 text-coral-500"><ClockIcon className="h-5 w-5" /></span>
      <p className="mt-3 max-w-xs text-sm text-ink-500">{text}</p>
    </div>
  );
}
