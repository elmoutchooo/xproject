import Link from "next/link";
import { logout } from "@/app/admin/actions";
import { db } from "@/lib/db";
import { LogoTile, Wordmark } from "@/components/brand/Logo";
import { AreaGuard } from "@/components/SessionGuard";
import { ExternalIcon, LogoutIcon, SearchIcon } from "@/components/Icons";
import AdminNav from "./AdminNav";
import AutoRefresh from "@/components/AutoRefresh";

export default async function Shell({ title, subtitle, children, action }: { title: string; subtitle?: string; children: React.ReactNode; action?: React.ReactNode }) {
  const pending = await db.booking.count({ where: { status: "PENDING" } });
  return (
    <div className="min-h-screen bg-[#f7f4f2] lg:flex">
      <AreaGuard area="admin" />
      <AutoRefresh />
      <aside className="relative bg-ink-950 text-ink-100 lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-64 lg:shrink-0 lg:flex-col">
        <div className="pointer-events-none absolute -left-16 top-1/3 hidden h-56 w-56 rounded-full bg-coral-500/10 blur-3xl lg:block" />
        <div className="logo-hover relative flex items-center justify-between gap-3 p-5">
          <div className="flex items-center gap-2.5"><LogoTile className="h-10 w-10" /><Wordmark dark compact /></div>
        </div>
        <div className="relative lg:flex-1 lg:overflow-y-auto lg:pt-2"><AdminNav badges={{ "/admin/bookings": pending }} /></div>
        <div className="relative hidden space-y-1 border-t border-white/5 p-3 lg:block">
          <Link href="/fr" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-ink-300 hover:bg-white/5 hover:text-white"><ExternalIcon className="h-[18px] w-[18px]" />Voir le site</Link>
          <Link href="/driver" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-ink-300 hover:bg-white/5 hover:text-white"><ExternalIcon className="h-[18px] w-[18px]" />Espace chauffeurs</Link>
          <div className="mt-2 flex items-center gap-3 rounded-xl bg-white/5 p-3">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-coral-500 text-sm font-semibold text-white">A</span>
            <div className="min-w-0 flex-1"><p className="text-sm font-semibold text-white">Administrateur</p><p className="text-xs text-ink-400">Super admin</p></div>
            <form action={logout}><button title="Déconnexion" aria-label="Déconnexion" className="rounded-lg p-2 text-ink-300 hover:bg-white/10 hover:text-white"><LogoutIcon className="h-[18px] w-[18px]" /></button></form>
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 border-b border-ink-100/70 bg-[#f7f4f2]/85 backdrop-blur">
          <div className="flex items-center gap-3 px-4 py-3 sm:px-8">
            <form action="/admin/bookings" className="relative max-w-md flex-1">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input name="q" placeholder="Rechercher une réservation, un client, un téléphone…" className="w-full rounded-xl border border-ink-100 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition placeholder:text-ink-300 focus:border-coral-400 focus:ring-2 focus:ring-coral-100" />
            </form>
            <form action={logout} className="lg:hidden"><button className="btn-ghost px-3 py-2 text-xs">Déconnexion</button></form>
          </div>
        </header>
        <main className="p-4 sm:p-8">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-ink-900 sm:text-3xl">{title}</h1>
              {subtitle && <p className="mt-1 text-sm text-ink-500">{subtitle}</p>}
            </div>
            {action}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}

export const STATUS_LABEL: Record<string, string> = { PENDING: "En attente", CONFIRMED: "Confirmée", CANCELLED: "Annulée", COMPLETED: "Terminée" };
export const STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800", CONFIRMED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-rose-100 text-rose-800", COMPLETED: "bg-ink-100 text-ink-700",
};
export const TYPE_LABEL: Record<string, string> = { BUS: "Bus", TRANSFER: "Transfert", TOUR: "Excursion" };
