import type { Metadata } from "next";
import { getDict, type Locale } from "@/lib/i18n";
import { pageMeta } from "@/lib/seo";
import PageHeader from "@/components/PageHeader";

type P = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { locale } = await params;
  const t = getDict(locale);
  return pageMeta(locale, "privacy", t.legal.privacy, t.legal.privacyBody[0]);
}

export default async function Page({ params }: P) {
  const { locale } = await params;
  const t = getDict(locale);
  return (
    <>
      <PageHeader title={t.legal.privacy} />
      <div className="container-x max-w-3xl">
        <ol className="list-decimal space-y-3 pl-5 text-ink-700">
          {t.legal.privacyBody.map((p) => <li key={p}>{p}</li>)}
        </ol>
      </div>
    </>
  );
}
