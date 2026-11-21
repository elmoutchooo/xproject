"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Dict, Locale } from "@/lib/i18n";
import { BusIcon, MountainIcon, PlaneIcon } from "./Icons";

type Props = {
  locale: Locale;
  t: Dict["search"];
  cities: { from: string[]; to: string[] };
  airports: string[];
  today: string;
  labels: { fullDay: string; shuttle: string };
};

export default function SearchBox({ locale, t, cities, airports, today, labels }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<"bus" | "transfer" | "tour">("bus");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState(today);
  const [pax, setPax] = useState(1);
  const [airport, setAirport] = useState("");
  const [cat, setCat] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = new URLSearchParams();
    if (tab === "bus") {
      if (from) q.set("from", from);
      if (to) q.set("to", to);
      q.set("date", date);
      q.set("pax", String(pax));
      router.push(`/${locale}/bus?${q}`);
    } else if (tab === "transfer") {
      if (airport) q.set("airport", airport);
      router.push(`/${locale}/transfers?${q}`);
    } else {
      if (cat) q.set("cat", cat);
      router.push(`/${locale}/excursions?${q}`);
    }
  }

  const tabs = [
    { id: "bus" as const, label: t.tabBus, icon: <BusIcon className="h-4 w-4" /> },
    { id: "transfer" as const, label: t.tabTransfer, icon: <PlaneIcon className="h-4 w-4" /> },
    { id: "tour" as const, label: t.tabTour, icon: <MountainIcon className="h-4 w-4" /> },
  ];

  return (
    <div className="card p-2 shadow-xl shadow-brand-900/10">
      <div className="flex gap-1 overflow-x-auto p-1" role="tablist">
        {tabs.map((x) => (
          <button key={x.id} type="button" role="tab" aria-selected={tab === x.id} onClick={() => setTab(x.id)}
            className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${tab === x.id ? "bg-brand-700 text-white" : "text-slate-600 hover:bg-slate-100"}`}>
            {x.icon}{x.label}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="grid gap-3 p-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_0.7fr_auto] lg:items-end">
        {tab === "bus" && (
          <>
            <div>
              <label className="label" htmlFor="s-from">{t.from}</label>
              <select id="s-from" className="input" value={from} onChange={(e) => setFrom(e.target.value)}>
                <option value="">{t.any}</option>
                {cities.from.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="s-to">{t.to}</label>
              <select id="s-to" className="input" value={to} onChange={(e) => setTo(e.target.value)}>
                <option value="">{t.any}</option>
                {cities.to.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="s-date">{t.date}</label>
              <input id="s-date" type="date" min={today} className="input" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
            <div>
              <label className="label" htmlFor="s-pax">{t.passengers}</label>
              <input id="s-pax" type="number" min={1} max={20} className="input" value={pax} onChange={(e) => setPax(Number(e.target.value))} />
            </div>
          </>
        )}
        {tab === "transfer" && (
          <div className="sm:col-span-2 lg:col-span-4">
            <label className="label" htmlFor="s-airport">{t.airport}</label>
            <select id="s-airport" className="input" value={airport} onChange={(e) => setAirport(e.target.value)}>
              <option value="">{t.any}</option>
              {airports.map((a) => <option key={a}>{a}</option>)}
            </select>
          </div>
        )}
        {tab === "tour" && (
          <div className="sm:col-span-2 lg:col-span-4">
            <label className="label" htmlFor="s-cat">{t.category}</label>
            <select id="s-cat" className="input" value={cat} onChange={(e) => setCat(e.target.value)}>
              <option value="">{t.any}</option>
              <option value="FULL_DAY">{labels.fullDay}</option>
              <option value="SHUTTLE">{labels.shuttle}</option>
            </select>
          </div>
        )}
        <button type="submit" className="btn-primary h-[42px] sm:col-span-2 lg:col-span-1">{t.search}</button>
      </form>
    </div>
  );
}
