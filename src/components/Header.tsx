"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { Dict, Locale } from "@/lib/i18n";
import { AGENCY } from "@/config/agency";
import { BusIcon } from "./Icons";

const LANGS: { code: Locale; label: string }[] = [
  { code: "en", label: "EN" }, { code: "fr", label: "FR" }, { code: "es", label: "ES" }, { code: "it", label: "IT" },
];

export default function Header({ locale, t }: { locale: Locale; t: Dict["nav"] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const rest = pathname.split("/").slice(2).join("/");
  const links = [
    { href: `/${locale}/bus`, label: t.bus },
    { href: `/${locale}/transfers`, label: t.transfers },
    { href: `/${locale}/excursions`, label: t.excursions },
    { href: `/${locale}/my-booking`, label: t.myBooking },
    { href: `/${locale}/contact`, label: t.contact },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/90 backdrop-blur">
      <div className="container-x flex h-16 items-center justify-between gap-4">
        <Link href={`/${locale}`} className="flex items-center gap-2 font-bold text-brand-900">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-700 text-white"><BusIcon /></span>
          <span className="text-lg">{AGENCY.name}</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition hover:bg-brand-50 hover:text-brand-800 ${pathname.startsWith(l.href) ? "text-brand-700" : "text-slate-600"}`}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden items-center rounded-lg border border-slate-200 p-0.5 sm:flex">
            {LANGS.map((l) => (
              <Link key={l.code} href={`/${l.code}${rest ? `/${rest}` : ""}`}
                className={`rounded-md px-2 py-1 text-xs font-semibold ${l.code === locale ? "bg-brand-700 text-white" : "text-slate-500 hover:text-slate-800"}`}>
                {l.label}
              </Link>
            ))}
          </div>
          <Link href={`/${locale}/excursions`} className="btn-primary hidden py-2 sm:inline-flex">{t.bookNow}</Link>
          <button onClick={() => setOpen(!open)} className="rounded-lg p-2 text-slate-700 lg:hidden" aria-label="Menu" aria-expanded={open}>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {open ? <path d="M6 6l12 12M6 18L18 6" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-slate-100 bg-white lg:hidden">
          <nav className="container-x flex flex-col py-3">
            {links.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 font-medium text-slate-700 hover:bg-slate-50">{l.label}</Link>
            ))}
            <div className="mt-2 flex gap-2 px-3">
              {LANGS.map((l) => (
                <Link key={l.code} href={`/${l.code}${rest ? `/${rest}` : ""}`} onClick={() => setOpen(false)}
                  className={`rounded-md px-3 py-1.5 text-sm font-semibold ${l.code === locale ? "bg-brand-700 text-white" : "bg-slate-100 text-slate-600"}`}>{l.label}</Link>
              ))}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
