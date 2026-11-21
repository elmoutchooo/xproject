export default function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <section className="bg-gradient-to-b from-sand-100 to-white">
      <div className="container-x py-12 sm:py-16">
        <h1 className="text-3xl font-extrabold tracking-tight text-brand-950 sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-3 max-w-2xl text-slate-600">{subtitle}</p>}
      </div>
    </section>
  );
}
