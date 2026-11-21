import type { Metadata } from "next";
import { getDict, type Locale } from "@/lib/i18n";
import PageHeader from "@/components/PageHeader";
import FindBookingForm from "@/components/FindBookingForm";

export const metadata: Metadata = { robots: { index: false } };

export default async function MyBookingPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = getDict(locale);
  return (
    <>
      <PageHeader title={t.myBooking.title} subtitle={t.myBooking.text} />
      <div className="container-x max-w-lg"><FindBookingForm locale={locale} t={t.myBooking} emailLabel={t.book.email} /></div>
    </>
  );
}
