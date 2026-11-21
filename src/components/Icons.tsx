type P = { className?: string };
const base = (className = "h-5 w-5") => ({
  className, fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 1.8,
  strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true,
});

export const BusIcon = ({ className }: P) => (
  <svg {...base(className)}><rect x="4" y="3" width="16" height="14" rx="2" /><path d="M4 11h16M8 21v-4M16 21v-4M8 14h.01M16 14h.01" /></svg>
);
export const PlaneIcon = ({ className }: P) => (
  <svg {...base(className)}><path d="M2 16l20-6-3-3-7 2-5-5-2 1 3 6-4 1-2-2-1 1 2 4z" /></svg>
);
export const MountainIcon = ({ className }: P) => (
  <svg {...base(className)}><path d="M3 20l6-10 4 6 3-4 5 8z" /><circle cx="17" cy="6" r="2" /></svg>
);
export const ShuttleIcon = ({ className }: P) => (
  <svg {...base(className)}><path d="M3 7h13l5 5v5H3z" /><circle cx="7" cy="17" r="2" /><circle cx="17" cy="17" r="2" /><path d="M3 12h18" /></svg>
);
export const ClockIcon = ({ className }: P) => (
  <svg {...base(className)}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
);
export const UsersIcon = ({ className }: P) => (
  <svg {...base(className)}><circle cx="9" cy="8" r="3" /><path d="M3 20c0-3 3-5 6-5s6 2 6 5M16 5a3 3 0 010 6M21 20c0-2-1-4-4-4.5" /></svg>
);
export const CheckIcon = ({ className }: P) => (
  <svg {...base(className)}><path d="M5 12l5 5 9-10" /></svg>
);
export const ArrowIcon = ({ className }: P) => (
  <svg {...base(className)}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);
export const PinIcon = ({ className }: P) => (
  <svg {...base(className)}><path d="M12 21s7-6 7-12a7 7 0 10-14 0c0 6 7 12 7 12z" /><circle cx="12" cy="9" r="2.5" /></svg>
);
export const ShieldIcon = ({ className }: P) => (
  <svg {...base(className)}><path d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6z" /><path d="M9 12l2 2 4-4" /></svg>
);
export const StarIcon = ({ className }: P) => (
  <svg className={className ?? "h-4 w-4"} viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M12 2l3 7 7 .6-5.3 4.7 1.6 7.2L12 17.8 5.7 21.5l1.6-7.2L2 9.6 9 9z" /></svg>
);
export const PhoneIcon = ({ className }: P) => (
  <svg {...base(className)}><path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z" /></svg>
);
export const MailIcon = ({ className }: P) => (
  <svg {...base(className)}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></svg>
);
export const WhatsAppIcon = ({ className }: P) => (
  <svg className={className ?? "h-6 w-6"} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M12 2a10 10 0 00-8.6 15.1L2 22l5-1.3A10 10 0 1012 2zm0 18.2a8.2 8.2 0 01-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1112 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 01-3.3-2.9c-.3-.4.3-.4.7-1.4a.5.5 0 000-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 00-.7.3 3 3 0 00-.9 2.2 5.2 5.2 0 001.1 2.7 11.8 11.8 0 004.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 001.8-1.2 2.2 2.2 0 00.1-1.2c0-.2-.2-.2-.5-.4z" />
  </svg>
);
