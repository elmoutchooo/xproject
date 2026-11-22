// Logo CS Tours : le C et le S dessinés comme une route, avec la navette en bas.
// Couleurs de la charte : Corail #E0654F · Blanc #FFFFFF · Brun encre #2B2220

export const CORAL = "#E0654F";
export const INK = "#2B2220";

// Axe de la route (viewBox 0 0 750 520)
export const ROAD =
  "M387 113 A197 197 0 0 0 58 259 A197 197 0 0 0 255 456 L595 456 A95 95 0 0 0 690 361 A95 95 0 0 0 595 266 L592 266 A98 98 0 0 1 494 168 A98 98 0 0 1 592 70 A98 98 0 0 1 677 119";
// Même axe, raccourci aux deux bouts pour que les extrémités de la route restent fermées
export const ROAD_INNER =
  "M376.1 103.6 A197 197 0 0 0 58 259 A197 197 0 0 0 255 456 L595 456 A95 95 0 0 0 690 361 A95 95 0 0 0 595 266 L592 266 A98 98 0 0 1 494 168 A98 98 0 0 1 592 70 A98 98 0 0 1 669 107.4";

export function Car({ bg, fg }: { bg: string; fg: string }) {
  return (
    <>
      <rect x="-72" y="-34" width="144" height="68" fill={bg} />
      <rect x="-59" y="-28" width="118" height="56" rx="13" fill={fg} />
      <rect x="-47" y="-15" width="9" height="30" rx="4.5" fill={bg} />
      <rect x="22" y="-17" width="16" height="34" rx="6" fill={bg} />
      <path d="M-30 0 H12" stroke={bg} strokeWidth="5" strokeLinecap="round" />
    </>
  );
}

/** Le symbole seul (sans fond). `bg` = couleur du fond sur lequel il est posé. */
export function LogoMark({ className, bg = CORAL, fg = "#fff", title }: { className?: string; bg?: string; fg?: string; title?: string }) {
  return (
    <svg viewBox="0 0 750 520" className={className} role={title ? "img" : undefined} aria-hidden={title ? undefined : true} aria-label={title}>
      <g fill="none">
        <path d={ROAD} stroke={fg} strokeWidth="96" />
        <path d={ROAD_INNER} stroke={bg} strokeWidth="68" />
        <path d={ROAD_INNER} stroke={fg} strokeWidth="9" strokeDasharray="22 24" strokeLinecap="round" className="road-dashes" />
      </g>
      <g transform="translate(419 456)"><Car bg={bg} fg={fg} /></g>
    </svg>
  );
}

/** Icône d'application : carré corail arrondi avec le symbole blanc. */
export function LogoTile({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <span className={`logo-tile inline-grid shrink-0 place-items-center rounded-[24%] bg-[#E0654F] ${className}`}>
      <LogoMark className="w-[76%]" />
    </span>
  );
}

/** Logo complet : icône + « CS TOURS » + « TRANSPORT TOURISTIQUE ». */
export function Wordmark({ dark = false, compact = false }: { dark?: boolean; compact?: boolean }) {
  return (
    <span className="flex flex-col leading-none">
      <span className={`font-semibold tracking-[0.02em] ${compact ? "text-lg" : "text-xl"}`}>
        <span className="text-[#E0654F]">CS</span> <span className={dark ? "text-white" : "text-[#2B2220]"}>TOURS</span>
      </span>
      <span className={`mt-1 text-[0.55rem] font-medium tracking-[0.28em] ${dark ? "text-white/70" : "text-[#2B2220]/80"}`}>TRANSPORT TOURISTIQUE</span>
    </span>
  );
}
