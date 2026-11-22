import type { Metadata } from "next";
import { getDict, type Locale } from "@/lib/i18n";
import { JsonLd, pageMeta } from "@/lib/seo";
import PageHeader from "@/components/PageHeader";

type P = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { locale } = await params;
  const t = getDict(locale);
  return pageMeta(locale, "faq", t.faq.title, t.faq.items.map((i) => i.q).join(" "));
}

export default async function FaqPage({ params }: P) {
  const { locale } = await params;
  const t = getDict(locale);
  return (
    <>
      <JsonLd data={{
        "@context": "https://schema.org", "@type": "FAQPage",
        mainEntity: t.faq.items.map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a } })),
      }} />
      <PageHeader title={t.faq.title} />
      <div className="container-x max-w-3xl space-y-3">
        {t.faq.items.map((i) => (
          <details key={i.q} className="card group p-5 open:shadow-md">
            <summary className="cursor-pointer list-none font-semibold text-ink-900 marker:hidden">
              <span className="flex items-center justify-between gap-4">{i.q}<span className="text-coral-600 transition group-open:rotate-45">+</span></span>
            </summary>
            <p className="mt-3 text-ink-600">{i.a}</p>
          </details>
        ))}
      </div>
    </>
  );
}
