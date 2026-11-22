"use client";

import { useEffect, useId, useState } from "react";
import { Car, CORAL, ROAD, ROAD_INNER } from "./Logo";

/**
 * Symbole animé : la route se dessine, puis la navette parcourt le C et le S en boucle.
 * Respecte « réduire les animations » du système.
 */
export default function AnimatedMark({ className, bg = CORAL, fg = "#fff", duration = 9 }: { className?: string; bg?: string; fg?: string; duration?: number }) {
  const id = useId().replace(/:/g, "");
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  return (
    <svg viewBox="0 0 750 520" className={className} aria-hidden>
      <defs>
        <mask id={`m${id}`} maskUnits="userSpaceOnUse" x="-50" y="-50" width="850" height="620">
          <path d={ROAD} stroke="#fff" strokeWidth="110" fill="none" pathLength={1} className={reduced ? "" : "road-draw"} />
        </mask>
        <path id={`p${id}`} d={ROAD_INNER} />
      </defs>
      <g mask={`url(#m${id})`} fill="none">
        <path d={ROAD} stroke={fg} strokeWidth="96" />
        <path d={ROAD_INNER} stroke={bg} strokeWidth="68" />
        <path d={ROAD_INNER} stroke={fg} strokeWidth="9" strokeDasharray="22 24" strokeLinecap="round" />
      </g>
      {reduced ? (
        <g transform="translate(419 456)"><Car bg={bg} fg={fg} /></g>
      ) : (
        <g opacity="0">
          <g transform="scale(0.82)"><Car bg={bg} fg={fg} /></g>
          <animateMotion dur={`${duration}s`} begin="1.6s" repeatCount="indefinite" rotate="auto" keyPoints="0;1" keyTimes="0;1" calcMode="linear">
            <mpath href={`#p${id}`} />
          </animateMotion>
          <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.06;0.94;1" dur={`${duration}s`} begin="1.6s" repeatCount="indefinite" />
        </g>
      )}
    </svg>
  );
}
