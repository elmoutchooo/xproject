import type { Metadata } from "next";
import { notFound } from "next/navigation";
import "../globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { getDict, isLocale, locales } from "@/lib/i18n";
import { AGENCY } from "@/config/agency";
import { pageMeta, SITE_URL } from "@/lib/seo";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const l = isLocale(locale) ? locale : "en";
  const t = getDict(l);
  return {
    ...pageMeta(l, "", `${AGENCY.name} – ${t.hero.title}`, t.hero.subtitle),
    metadataBase: new URL(SITE_URL),
    title: { default: `${AGENCY.name} – ${t.hero.title}`, template: `%s | ${AGENCY.name}` },
    applicationName: AGENCY.name,
    formatDetection: { telephone: true },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
    // Collez ici le code de Google Search Console après avoir ajouté votre site
    verification: { google: process.env.GOOGLE_SITE_VERIFICATION },
  };
}

export const viewport = { themeColor: "#E0654F" };

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDict(locale);

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="flex min-h-screen flex-col">
        <Header locale={locale} t={t.nav} />
        <main className="flex-1">{children}</main>
        <Footer locale={locale} t={t} />
        <WhatsAppButton />
      </body>
    </html>
  );
}
