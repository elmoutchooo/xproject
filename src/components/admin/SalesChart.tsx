"use client";

import { useState } from "react";

type Day = { date: string; total: number; count: number };

const fmt = (n: number) => `${n.toLocaleString("fr-FR")} MAD`;
const short = (d: string) => new Date(`${d}T12:00:00`).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });

/** Colonnes des ventes par jour, avec infobulle au survol. Une seule série : pas de légende. */
export default function SalesChart({ days }: { days: Day[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 720, H = 240, L = 52, R = 8, T = 12, B = 28;
  const iw = W - L - R, ih = H - T - B;
  const rawMax = Math.max(...days.map((d) => d.total), 0);
  const step = niceStep(rawMax / 3 || 100);
  const max = Math.max(step * 3, step);
  const ticks = [0, step, step * 2, step * 3];
  const slot = iw / days.length;
  const bw = Math.min(18, slot * 0.62);
  const y = (v: number) => T + ih - (v / max) * ih;
  const hd = hover != null ? days[hover] : null;

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Ventes des 30 derniers jours" onMouseLeave={() => setHover(null)}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} stroke="#ede7e5" strokeWidth="1" />
            <text x={L - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill="#8e7f78">{t >= 10000 ? `${t / 1000}K` : t.toLocaleString("fr-FR")}</text>
          </g>
        ))}
        {days.map((d, i) => {
          const x = L + i * slot + (slot - bw) / 2;
          const h = Math.max(T + ih - y(d.total), d.total ? 2 : 0);
          const r = Math.min(4, h);
          const top = T + ih - h;
          return (
            <g key={d.date}>
              {h > 0 && (
                <path d={`M${x} ${T + ih} V${top + r} Q${x} ${top} ${x + r} ${top} H${x + bw - r} Q${x + bw} ${top} ${x + bw} ${top + r} V${T + ih} Z`}
                  fill="#E0654F" opacity={hover == null || hover === i ? 1 : 0.35} className="transition-opacity" />
              )}
              {i % 5 === 0 || i === days.length - 1 ? (
                <text x={L + i * slot + slot / 2} y={H - 8} textAnchor="middle" fontSize="11" fill="#8e7f78">{i === days.length - 1 ? "Auj." : short(d.date)}</text>
              ) : null}
              <rect x={L + i * slot} y={T} width={slot} height={ih} fill="transparent" onMouseEnter={() => setHover(i)} />
            </g>
          );
        })}
        <line x1={L} x2={W - R} y1={T + ih} y2={T + ih} stroke="#d8cfcb" strokeWidth="1" />
      </svg>
      {hd && hover != null && (
        <div className="pointer-events-none absolute top-2 z-10 -translate-x-1/2 rounded-xl bg-ink-900 px-3 py-2 text-xs text-white shadow-xl"
          style={{ left: `${((L + hover * slot + slot / 2) / W) * 100}%` }}>
          <p className="font-semibold capitalize">{new Date(`${hd.date}T12:00:00`).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "long" })}</p>
          <p className="mt-0.5 text-ink-200">{fmt(hd.total)} · {hd.count} réservation{hd.count > 1 ? "s" : ""}</p>
        </div>
      )}
    </div>
  );
}

function niceStep(raw: number) {
  const p = Math.pow(10, Math.floor(Math.log10(raw)));
  const n = raw / p;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p;
}
