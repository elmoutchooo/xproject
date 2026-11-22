import Link from "next/link";
import type { Tour } from "@prisma/client";
import { formatPrice, tr, type Dict, type Locale } from "@/lib/i18n";
import { ClockIcon, MountainIcon, PinIcon, ShuttleIcon } from "./Icons";

const gradients = [
  "from-coral-400 via-coral-500 to-coral-700",
  "from-ink-700 via-ink-800 to-ink-950",
  "from-[#f0b49e] via-coral-400 to-coral-600",
  "from-coral-600 via-coral-700 to-ink-900",
  "from-ink-500 via-ink-700 to-ink-900",
  "from-coral-300 via-coral-500 to-ink-800",
];

export default function TourCard({ tour, locale, t, index = 0 }: { tour: Tour; locale: Locale; t: Dict["common"]; index?: number }) {
  const href = `/${locale}/excursions/${tour.slug}`;
  const isShuttle = tour.category === "SHUTTLE";
  return (
    <Link href={href} className="card group flex flex-col overflow-hidden transition duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-ink-900/10">
      <div className={`relative h-44 overflow-hidden bg-gradient-to-br ${gradients[index % gradients.length]}`}>
        {tour.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={tour.imageUrl} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
        ) : (
          <div className="grid h-full place-items-center text-white/80 transition duration-500 group-hover:scale-110">
            {isShuttle ? <ShuttleIcon className="h-16 w-16" /> : <MountainIcon className="h-16 w-16" />}
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-ink-700">
          {isShuttle ? t.shuttle : t.fullDay}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-bold text-ink-900 group-hover:text-coral-600">{tr(tour.title, locale)}</h3>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-500">
          <span className="flex items-center gap-1"><ClockIcon className="h-4 w-4" />{tour.durationH}{t.hours}</span>
          <span className="flex items-center gap-1"><PinIcon className="h-4 w-4" />{tour.fromCity}</span>
        </div>
        <div className="mt-auto flex items-end justify-between pt-4">
          <p className="text-xs text-ink-500">{t.from}<br /><span className="text-lg font-bold text-ink-900">{formatPrice(tour.price)}</span> <span>{t.perPerson}</span></p>
          <span className="rounded-lg bg-coral-50 px-3 py-1.5 text-sm font-semibold text-coral-600">{t.details}</span>
        </div>
      </div>
    </Link>
  );
}
