import { formatPrice } from "@/lib/i18n";

export default function Balance({ value }: { value: number }) {
  if (value === 0) return <span className="text-slate-400">Rien à régler</span>;
  return value > 0
    ? <span className="font-semibold text-amber-700">Le chauffeur doit {formatPrice(value)}</span>
    : <span className="font-semibold text-rose-700">L&apos;agence doit {formatPrice(-value)}</span>;
}
