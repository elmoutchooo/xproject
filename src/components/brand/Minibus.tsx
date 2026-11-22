import { LogoMark, CORAL, INK } from "./Logo";

/** La navette CS Tours (vue de côté), comme sur la charte graphique. */
export default function Minibus({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 700 300" className={className} aria-hidden>
      <ellipse cx="340" cy="282" rx="320" ry="9" fill="#000" opacity="0.12" />
      <path d="M40 40 Q40 10 70 10 H470 Q500 10 520 30 L600 110 Q610 120 625 122 L640 125 Q675 132 675 165 V225 Q675 240 660 240 H55 Q40 240 40 225 Z" fill="#fff" stroke="#d9dee5" strokeWidth="3" />
      <path d="M40 205 H675 V225 Q675 240 660 240 H55 Q40 240 40 225 Z" fill={CORAL} />
      {[70, 170, 270, 370].map((x) => <rect key={x} x={x} y="40" width="80" height="80" rx="10" fill="#262b35" />)}
      <path d="M470 40 H500 Q508 40 514 46 L585 120 H470 Z" fill="#262b35" />
      <rect x="630" y="140" width="22" height="12" rx="6" fill="#d9dee5" />
      <g transform="translate(175 145)">
        <rect width="56" height="56" rx="13" fill={CORAL} />
        <g transform="translate(5 10) scale(0.062)"><LogoMark /></g>
      </g>
      <text x="245" y="178" fontFamily="Outfit, sans-serif" fontWeight="600" fontSize="38"><tspan fill={CORAL}>CS</tspan><tspan fill={INK}> TOURS</tspan></text>
      <text x="246" y="198" fontFamily="Outfit, sans-serif" fontWeight="500" fontSize="11.5" letterSpacing="3.2" fill={INK}>TRANSPORT TOURISTIQUE</text>
      {[150, 560].map((cx) => (
        <g key={cx} transform={`translate(${cx} 240)`}>
          <circle r="46" fill="#d9dee5" />
          <g className="wheel">
            <circle r="40" fill="#1f2329" />
            <circle r="20" fill="#c5cbd3" />
            <circle r="6" fill="#1f2329" />
            <rect x="-2" y="-20" width="4" height="12" fill="#1f2329" />
          </g>
        </g>
      ))}
    </svg>
  );
}
