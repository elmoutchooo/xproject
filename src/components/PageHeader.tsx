export default function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-sand-100 to-white">
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 animate-float rounded-full bg-coral-500/10 blur-3xl" />
      <div className="container-x relative py-12 sm:py-16">
        <h1 className="animate-fade-up text-3xl font-semibold tracking-tight text-ink-900 sm:text-5xl">{title}</h1>
        {subtitle && <p className="mt-3 max-w-2xl animate-fade-up text-ink-500 [animation-delay:120ms]">{subtitle}</p>}
      </div>
    </section>
  );
}
