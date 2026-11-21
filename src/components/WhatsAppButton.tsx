import { AGENCY } from "@/config/agency";
import { WhatsAppIcon } from "./Icons";

export default function WhatsAppButton() {
  return (
    <a href={`https://wa.me/${AGENCY.whatsapp}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"
      className="no-print fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-105">
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  );
}
