import type { Booking, BusRoute, Driver, Tour, Transfer } from "@prisma/client";
import { updateBooking } from "@/app/admin/actions";
import { DriverSelect, StatusSelect } from "./BookingControls";
import { formatPrice, tr } from "@/lib/i18n";
import { STATUS_COLOR, STATUS_LABEL, TYPE_LABEL } from "./Shell";

export type FullBooking = Booking & { busRoute: BusRoute | null; transfer: Transfer | null; tour: Tour | null; driver?: Driver | null };
export type DriverOption = { id: string; name: string };

export function tripLabel(b: FullBooking) {
  if (b.busRoute) return `${b.busRoute.fromCity} → ${b.busRoute.toCity}`;
  if (b.transfer) return `${b.transfer.airport} → ${b.transfer.destination}`;
  if (b.tour) return tr(b.tour.title, "fr");
  return "—";
}

export default function BookingRow({ b, drivers }: { b: FullBooking; drivers: DriverOption[] }) {
  const wa = b.phone.replace(/[^\d]/g, "");
  return (
    <tr className="align-top">
      <td className="px-4 py-3">
        <p className="font-mono text-xs font-bold">{b.reference}</p>
        <p className="text-xs text-ink-400">{b.createdAt.toLocaleDateString("fr-FR")}</p>
      </td>
      <td className="px-4 py-3">
        <p className="font-medium">{b.date}{b.time ? ` · ${b.time}` : ""}</p>
        <p className="text-xs text-ink-500">{TYPE_LABEL[b.type]} · {tripLabel(b)}</p>
        {(b.pickup || b.flight) && <p className="text-xs text-ink-500">{[b.pickup, b.flight && `Vol ${b.flight}`].filter(Boolean).join(" · ")}</p>}
        {b.notes && <p className="mt-1 max-w-xs text-xs italic text-ink-500">“{b.notes}”</p>}
      </td>
      <td className="px-4 py-3">
        <p className="font-medium">{b.fullName}</p>
        <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-700 hover:underline">{b.phone}</a>
        <p className="text-xs text-ink-500">{b.email} · {b.locale.toUpperCase()}</p>
      </td>
      <td className="px-4 py-3 text-center">{b.passengers}</td>
      <td className="px-4 py-3">
        <DriverSelect key={`${b.id}-${b.driverId}`} id={b.id} driverId={b.driverId} drivers={drivers} />
        {b.commission != null && <p className="mt-1 text-xs text-emerald-700">Commission {formatPrice(b.commission)}</p>}
      </td>
      <td className="px-4 py-3">
        <p className="font-semibold">{formatPrice(b.total)}</p>
        <p className="text-xs text-ink-500">{b.payment === "CASH" ? "Espèces" : "Virement"}</p>
        <form action={updateBooking}>
          <input type="hidden" name="id" value={b.id} />
          <input type="hidden" name="paid" value={String(!b.paid)} />
          <button className={`mt-1 rounded-full px-2 py-0.5 text-xs font-semibold ${b.paid ? "bg-emerald-100 text-emerald-800" : "bg-ink-100 text-ink-600"}`}>
            {b.paid ? "✓ Payée" : "Non payée"}
          </button>
        </form>
      </td>
      <td className="px-4 py-3">
        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_COLOR[b.status]}`}>{STATUS_LABEL[b.status]}</span>
        <div className="mt-2"><StatusSelect key={`${b.id}-${b.status}`} id={b.id} status={b.status} /></div>
      </td>
    </tr>
  );
}

export function BookingTable({ bookings, drivers }: { bookings: FullBooking[]; drivers: DriverOption[] }) {
  return (
    <div className="card overflow-x-auto">
      <table className="w-full min-w-[1050px] text-left text-sm">
        <thead className="border-b border-ink-100 text-xs uppercase tracking-wide text-ink-500">
          <tr><th className="px-4 py-3">Réf.</th><th className="px-4 py-3">Trajet</th><th className="px-4 py-3">Client</th><th className="px-4 py-3 text-center">Pers.</th><th className="px-4 py-3">Chauffeur</th><th className="px-4 py-3">Montant</th><th className="px-4 py-3">Statut</th></tr>
        </thead>
        <tbody className="divide-y divide-ink-100">
          {bookings.map((b) => <BookingRow key={b.id} b={b} drivers={drivers} />)}
          {bookings.length === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-ink-400">Aucune réservation.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
