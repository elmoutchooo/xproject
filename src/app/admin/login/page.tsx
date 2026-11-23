import Link from "next/link";
import LoginForm from "@/components/admin/LoginForm";
import AnimatedMark from "@/components/brand/AnimatedMark";
import { AGENCY } from "@/config/agency";
import { GridIcon, StarIcon, UsersIcon } from "@/components/Icons";

const points = [
  { icon: GridIcon, text: "Réservations, ventes et départs du jour en un coup d'œil" },
  { icon: UsersIcon, text: "Chauffeurs, commissions et comptes à régler" },
  { icon: StarIcon, text: "Avis clients, classement et avertissements" },
];

export default function LoginPage() {
  return (
    <div className="relative grid min-h-screen overflow-hidden bg-ink-900 lg:grid-cols-2">
      <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "28px 28px" }} />
      <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 animate-float rounded-full bg-coral-500/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 right-1/3 h-96 w-96 animate-float-slow rounded-full bg-coral-700/25 blur-3xl" />

      <div className="relative hidden flex-col justify-between p-12 text-white lg:flex">
        <p className="text-sm font-medium tracking-[0.25em] text-ink-300">CS TOURS · TRANSPORT TOURISTIQUE</p>
        <div>
          <div className="w-64 rounded-[24%] bg-coral-500 p-9 shadow-2xl shadow-black/40"><AnimatedMark className="w-full" /></div>
          <h2 className="mt-10 max-w-md text-4xl font-semibold leading-tight text-white">Pilotez toute votre agence depuis un seul écran.</h2>
          <ul className="mt-6 space-y-3">
            {points.map(({ icon: Icon, text }, i) => (
              <li key={text} className="flex animate-fade-up items-center gap-3 text-ink-200" style={{ animationDelay: `${300 + i * 120}ms` }}>
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/10 text-coral-400"><Icon className="h-[18px] w-[18px]" /></span>{text}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-ink-400">© {new Date().getFullYear()} {AGENCY.name}</p>
      </div>

      <div className="relative grid place-items-center p-4 sm:p-8">
        <div className="w-full max-w-sm">
          <LoginForm />
          <Link href="/" className="mt-5 block text-center text-sm text-ink-300 hover:text-white">← Retour au site</Link>
        </div>
      </div>
    </div>
  );
}
