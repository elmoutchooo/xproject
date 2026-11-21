import type { Metadata } from "next";
import { AGENCY } from "@/config/agency";
import { locales, type Locale } from "@/lib/i18n";

// URL publique du site (à définir en production : NEXT_PUBLIC_SITE_URL=https://www.votre-domaine.ma)
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

const ogLocale: Record<Locale, string> = { en: "en_GB", fr: "fr_FR", es: "es_ES", it: "it_IT" };

/** Métadonnées SEO d'une page : title, description, canonical, hreflang et Open Graph. */
export function pageMeta(locale: Locale, path: string, title: string, description: string, extra: Partial<Metadata> = {}): Metadata {
  const p = path ? `/${path.replace(/^\//, "")}` : "";
  const url = `${SITE_URL}/${locale}${p}`;
  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: { ...Object.fromEntries(locales.map((l) => [l, `${SITE_URL}/${l}${p}`])), "x-default": `${SITE_URL}/en${p}` },
    },
    openGraph: {
      type: "website",
      url,
      title,
      description,
      siteName: AGENCY.name,
      locale: ogLocale[locale],
      alternateLocale: locales.filter((l) => l !== locale).map((l) => ogLocale[l]),
    },
    twitter: { card: "summary_large_image", title, description },
    ...extra,
  };
}

/** Slug d'une ligne de bus : "marrakech-essaouira" */
export function routeSlug(from: string, to: string) {
  const s = (x: string) => x.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return `${s(from)}-to-${s(to)}`;
}

export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

export function agencyJsonLd(locale: Locale, description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    "@id": `${SITE_URL}/#agency`,
    name: AGENCY.name,
    description,
    url: `${SITE_URL}/${locale}`,
    telephone: AGENCY.phone,
    email: AGENCY.email,
    image: `${SITE_URL}/${locale}/opengraph-image`,
    priceRange: "120 MAD – 1300 MAD",
    currenciesAccepted: "MAD",
    paymentAccepted: "Cash, Bank transfer",
    address: { "@type": "PostalAddress", streetAddress: AGENCY.address, addressLocality: "Marrakech", addressCountry: "MA" },
    areaServed: { "@type": "Country", name: "Morocco" },
    openingHours: "Mo-Su 08:00-20:00",
    sameAs: [`https://wa.me/${AGENCY.whatsapp}`],
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: it.url })),
  };
}
