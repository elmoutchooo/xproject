import Link from "next/link";
import type { Tour } from "@prisma/client";
import { formatPrice, tr, type Dict, type Locale } from "@/lib/i18n";
import { ClockIcon, MountainIcon, PinIcon, ShuttleIcon } from "./Icons";

const gradients = [
  "from-amber-400 via-orange-500 to-rose-500",
  "from-emerald-400 via-teal-500 to-cyan-600",
  "from-sky-400 via-blue-500 to-indigo-600",
  "from-orange-300 via-amber-500 to-yellow-600",
  "from-teal-400 via-emerald-500 to-green-700",
  "from-fuchsia-400 via-purple-500 to-indigo-600",
];

export default function TourCard({ tour, locale, t, index = 0 }: { tour: Tour; locale: Locale; t: Dict["common"]; index?: number }) {
  const href = `/${locale}/excursions/${tour.slug}`;
  const isShuttle = tour.category === "SHUTTLE";
  return (
    <Link href={href} className="card group flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className={`relative h-44 bg-gradient-to-br ${gradients[index % gradients.length]}`}>
        {tour.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={tour.imageUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full place-items-center text-white/80">
            {isShuttle ? <ShuttleIcon className="h-16 w-16" /> : <MountainIcon className="h-16 w-16" />}
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700">
          {isShuttle ? t.shuttle : t.fullDay}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-bold text-slate-900 group-hover:text-brand-700">{tr(tour.title, locale)}</h3>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
          <span className="flex items-center gap-1"><ClockIcon className="h-4 w-4" />{tour.durationH}{t.hours}</span>
          <span className="flex items-center gap-1"><PinIcon className="h-4 w-4" />{tour.fromCity}</span>
        </div>
        <div className="mt-auto flex items-end justify-between pt-4">
          <p className="text-xs text-slate-500">{t.from}<br /><span className="text-lg font-bold text-slate-900">{formatPrice(tour.price)}</span> <span>{t.perPerson}</span></p>
          <span className="rounded-lg bg-brand-50 px-3 py-1.5 text-sm font-semibold text-brand-700">{t.details}</span>
        </div>
      </div>
    </Link>
  );
}
