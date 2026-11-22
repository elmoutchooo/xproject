"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BusIcon, GridIcon, MountainIcon, PlaneIcon, RouteIcon, SettingsIcon, TicketIcon, UsersIcon } from "@/components/Icons";

const groups = [
  { title: "Activité", links: [
    { href: "/admin", label: "Tableau de bord", icon: GridIcon },
    { href: "/admin/bookings", label: "Réservations", icon: TicketIcon },
  ] },
  { title: "Équipe", links: [
    { href: "/admin/drivers", label: "Chauffeurs", icon: UsersIcon },
  ] },
  { title: "Offre", links: [
    { href: "/admin/routes", label: "Lignes de bus", icon: BusIcon },
    { href: "/admin/transfers", label: "Transferts", icon: PlaneIcon },
    { href: "/admin/tours", label: "Excursions", icon: MountainIcon },
  ] },
  { title: "Compte", links: [
    { href: "/admin/settings", label: "Paramètres", icon: SettingsIcon },
  ] },
];

export default function AdminNav({ badges = {} }: { badges?: Record<string, number> }) {
  const pathname = usePathname();
  const active = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));
  return (
    <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:gap-5 lg:overflow-visible lg:pb-0">
      {groups.map((g) => (
        <div key={g.title} className="flex gap-1 lg:flex-col">
          <p className="hidden px-3 pb-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-ink-500 lg:block">{g.title}</p>
          {g.links.map(({ href, label, icon: Icon }) => {
            const on = active(href);
            return (
              <Link key={href} href={href}
                className={`group relative flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${on ? "bg-white/10 text-white" : "text-ink-300 hover:bg-white/5 hover:text-white"}`}>
                {on && <span className="absolute left-0 top-1/2 hidden h-5 w-1 -translate-y-1/2 rounded-r-full bg-coral-500 lg:block" />}
                <Icon className={`h-[18px] w-[18px] ${on ? "text-coral-400" : "text-ink-400 group-hover:text-ink-200"}`} />
                {label}
                {badges[href] ? <span className="ml-auto rounded-full bg-coral-500 px-2 py-0.5 text-[0.7rem] font-semibold text-white">{badges[href]}</span> : null}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
