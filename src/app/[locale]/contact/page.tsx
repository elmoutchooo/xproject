import type { Metadata } from "next";
import { getDict, type Locale } from "@/lib/i18n";
import { pageMeta } from "@/lib/seo";
import { AGENCY } from "@/config/agency";
import PageHeader from "@/components/PageHeader";
import { ClockIcon, MailIcon, PhoneIcon, PinIcon, WhatsAppIcon } from "@/components/Icons";

type P = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { locale } = await params;
  const t = getDict(locale);
  return pageMeta(locale, "contact", t.contact.title, `${t.contact.text} ${AGENCY.phone} · ${AGENCY.address}`);
}

export default async function ContactPage({ params }: P) {
  const { locale } = await params;
  const t = getDict(locale);
  const items = [
    { icon: <PhoneIcon />, label: t.contact.phone, value: AGENCY.phone, href: `tel:${AGENCY.phone.replace(/\s/g, "")}` },
    { icon: <MailIcon />, label: t.contact.email, value: AGENCY.email, href: `mailto:${AGENCY.email}` },
    { icon: <PinIcon />, label: t.contact.address, value: AGENCY.address },
    { icon: <ClockIcon />, label: t.contact.hours, value: AGENCY.hours },
  ];
  return (
    <>
      <PageHeader title={t.contact.title} subtitle={t.contact.text} />
      <div className="container-x grid gap-8 lg:grid-cols-2">
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((i) => (
            <div key={i.label} className="card p-5">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-coral-50 text-coral-600">{i.icon}</span>
              <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-ink-500">{i.label}</p>
              {i.href ? <a href={i.href} className="mt-1 block font-semibold text-ink-900 hover:text-coral-600">{i.value}</a> : <p className="mt-1 font-semibold text-ink-900">{i.value}</p>}
            </div>
          ))}
          <a href={`https://wa.me/${AGENCY.whatsapp}`} target="_blank" rel="noopener noreferrer" className="btn bg-[#25D366] py-4 text-white hover:brightness-95 sm:col-span-2">
            <WhatsAppIcon className="h-5 w-5" />{t.contact.whatsapp}
          </a>
        </div>
        <iframe title="Map" className="h-80 w-full rounded-2xl border-0 lg:h-full" loading="lazy"
          src={`https://www.google.com/maps?q=${encodeURIComponent(AGENCY.address)}&output=embed`} />
      </div>
    </>
  );
}
