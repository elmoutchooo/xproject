import DriverLoginForm from "@/components/driver/LoginForm";
import AnimatedMark from "@/components/brand/AnimatedMark";
import { AGENCY } from "@/config/agency";

export default function DriverLogin() {
  return (
    <div className="relative grid min-h-screen overflow-hidden bg-ink-900 lg:grid-cols-2">
      <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 animate-float rounded-full bg-coral-500/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 right-1/3 h-96 w-96 animate-float-slow rounded-full bg-coral-700/25 blur-3xl" />
      <div className="relative hidden flex-col justify-between p-12 text-white lg:flex">
        <p className="text-sm font-medium tracking-[0.25em] text-ink-300">CS TOURS · TRANSPORT TOURISTIQUE</p>
        <div>
          <div className="w-72 rounded-[24%] bg-coral-500 p-10 shadow-2xl shadow-black/40"><AnimatedMark className="w-full" /></div>
          <h2 className="mt-10 max-w-md text-4xl font-semibold leading-tight text-white">Vos trajets, vos clients et vos gains au même endroit.</h2>
          <p className="mt-3 max-w-md text-ink-300">Retrouvez chaque trajet attribué par l&apos;agence, contactez vos clients et suivez ce que vous avez gagné ce mois-ci.</p>
        </div>
        <p className="text-xs text-ink-400">© {new Date().getFullYear()} {AGENCY.name}</p>
      </div>
      <div className="relative grid place-items-center p-4 sm:p-8">
        <DriverLoginForm agency={AGENCY.name} />
      </div>
    </div>
  );
}
