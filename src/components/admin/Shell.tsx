import Link from "next/link";
import { logout } from "@/app/admin/actions";
import { AGENCY } from "@/config/agency";

const links = [
  { href: "/admin", label: "Tableau de bord" },
  { href: "/admin/bookings", label: "Réservations" },
  { href: "/admin/drivers", label: "Chauffeurs" },
  { href: "/admin/routes", label: "Lignes de bus" },
  { href: "/admin/transfers", label: "Transferts" },
  { href: "/admin/tours", label: "Excursions" },
];

export default function Shell({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="lg:flex">
      <aside className="border-b border-slate-200 bg-brand-950 text-brand-100 lg:min-h-screen lg:w-60 lg:border-b-0">
        <div className="flex items-center justify-between p-5 lg:block">
          <p className="font-bold text-white">{AGENCY.name}</p>
          <p className="text-xs text-brand-300 lg:mt-1">Administration</p>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:pb-0">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="shrink-0 rounded-lg px-3 py-2 text-sm font-medium hover:bg-white/10 hover:text-white">{l.label}</Link>
          ))}
          <Link href="/driver" target="_blank" className="shrink-0 rounded-lg px-3 py-2 text-sm font-medium hover:bg-white/10 hover:text-white">Espace chauffeurs ↗</Link>
          <Link href="/fr" target="_blank" className="shrink-0 rounded-lg px-3 py-2 text-sm font-medium hover:bg-white/10 hover:text-white">Voir le site ↗</Link>
          <form action={logout}><button className="w-full shrink-0 rounded-lg px-3 py-2 text-left text-sm font-medium text-brand-300 hover:bg-white/10 hover:text-white">Déconnexion</button></form>
        </nav>
      </aside>
      <main className="flex-1 p-4 sm:p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-extrabold text-slate-900">{title}</h1>
          {action}
        </div>
        {children}
      </main>
    </div>
  );
}

export const STATUS_LABEL: Record<string, string> = { PENDING: "En attente", CONFIRMED: "Confirmée", CANCELLED: "Annulée", COMPLETED: "Terminée" };
export const STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800", CONFIRMED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-rose-100 text-rose-800", COMPLETED: "bg-slate-200 text-slate-700",
};
export const TYPE_LABEL: Record<string, string> = { BUS: "Bus", TRANSFER: "Transfert", TOUR: "Excursion" };
