// Petits graphiques SVG du tableau de bord (sans dépendance)
// Règles : traits 2px, voile 10 %, point final r=4 avec anneau de la couleur du fond.

export function Sparkline({ values, color = "#E0654F", className = "h-10 w-full" }: { values: number[]; color?: string; className?: string }) {
  const w = 120, h = 36, pad = 5;
  const max = Math.max(...values, 1);
  const pts = values.map((v, i) => [pad + (i * (w - 2 * pad)) / Math.max(values.length - 1, 1), h - pad - (v / max) * (h - 2 * pad)] as const);
  const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const [lx, ly] = pts[pts.length - 1];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className={className} aria-hidden>
      <path d={`${line} L${lx} ${h - pad} L${pad} ${h - pad} Z`} fill={color} opacity="0.1" />
      <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      <circle cx={lx} cy={ly} r="4" fill={color} stroke="#fff" strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/** Barres horizontales étiquetées (une seule couleur : le libellé porte l'identité). */
export function HBars({ rows, format }: { rows: { label: string; value: number; sub?: string; icon?: React.ReactNode }[]; format: (n: number) => string }) {
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <ul className="space-y-4">
      {rows.map((r) => (
        <li key={r.label}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="flex items-center gap-2 font-medium text-ink-800">{r.icon}{r.label}</span>
            <span className="font-semibold tabular-nums text-ink-900">{format(r.value)}{r.sub && <span className="ml-1.5 font-normal text-ink-400">{r.sub}</span>}</span>
          </div>
          <div className="mt-2 h-2.5 rounded-full bg-ink-100/70">
            <div className="h-full rounded-full bg-coral-500 transition-[width] duration-700" style={{ width: `${Math.max((r.value / max) * 100, r.value ? 2 : 0)}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
