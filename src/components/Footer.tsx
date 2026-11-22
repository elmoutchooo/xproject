import Link from "next/link";
import type { Dict, Locale } from "@/lib/i18n";
import { AGENCY } from "@/config/agency";
import { MailIcon, PhoneIcon, PinIcon } from "./Icons";
import { LogoTile, Wordmark } from "./brand/Logo";

export default function Footer({ locale, t }: { locale: Locale; t: Dict }) {
  return (
    <footer className="mt-24 bg-ink-900 text-ink-200">
      <div className="container-x grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <div className="logo-hover flex items-center gap-3"><LogoTile className="h-12 w-12" /><Wordmark dark /></div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-300">{t.footer.about}</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{t.footer.links}</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link className="hover:text-white" href={`/${locale}/bus`}>{t.nav.bus}</Link></li>
            <li><Link className="hover:text-white" href={`/${locale}/transfers`}>{t.nav.transfers}</Link></li>
            <li><Link className="hover:text-white" href={`/${locale}/excursions`}>{t.nav.excursions}</Link></li>
            <li><Link className="hover:text-white" href={`/${locale}/faq`}>{t.faq.title}</Link></li>
            <li><Link className="hover:text-white" href={`/${locale}/terms`}>{t.legal.terms}</Link></li>
            <li><Link className="hover:text-white" href={`/${locale}/privacy`}>{t.legal.privacy}</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{t.nav.contact}</p>
          <ul className="mt-3 space-y-3 text-sm">
            <li className="flex gap-2"><PhoneIcon className="h-4 w-4 shrink-0 translate-y-0.5" />{AGENCY.phone}</li>
            <li className="flex gap-2"><MailIcon className="h-4 w-4 shrink-0 translate-y-0.5" />{AGENCY.email}</li>
            <li className="flex gap-2"><PinIcon className="h-4 w-4 shrink-0 translate-y-0.5" />{AGENCY.address}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-ink-800">
        <p className="container-x py-5 text-xs text-ink-400">© {new Date().getFullYear()} {AGENCY.name}. {t.footer.rights}</p>
      </div>
    </footer>
  );
}
