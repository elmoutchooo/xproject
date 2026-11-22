import { MAX_WARNINGS } from "@/lib/ranking";

export default function WarningDots({ n }: { n: number }) {
  return (
    <span className="inline-flex items-center gap-1.5" title={`${n} avertissement(s) sur ${MAX_WARNINGS}`}>
      {Array.from({ length: MAX_WARNINGS }, (_, i) => (
        <span key={i} className={`h-2.5 w-2.5 rounded-full ${i < n ? (n >= MAX_WARNINGS ? "bg-rose-600" : "bg-amber-500") : "bg-ink-100"}`} />
      ))}
      <span className="ml-1 text-xs tabular-nums text-ink-500">{Math.min(n, MAX_WARNINGS)}/{MAX_WARNINGS}</span>
    </span>
  );
}
