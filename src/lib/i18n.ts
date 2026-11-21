import { en } from "@/dictionaries/en";
import { fr } from "@/dictionaries/fr";
import { es } from "@/dictionaries/es";
import { it } from "@/dictionaries/it";

export const locales = ["en", "fr", "es", "it"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export const localeNames: Record<Locale, string> = {
  en: "English",
  fr: "Français",
  es: "Español",
  it: "Italiano",
};

const dictionaries = { en, fr, es, it };
export type Dict = typeof en;

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function getDict(locale: string): Dict {
  return dictionaries[isLocale(locale) ? locale : defaultLocale];
}

// Champs traduits stockés en JSON dans la base : {"en": "...", "fr": "..."}
export function tr<T = string>(json: string, locale: string): T {
  try {
    const obj = JSON.parse(json) as Record<string, T>;
    return obj[locale] ?? obj[defaultLocale] ?? (Object.values(obj)[0] as T);
  } catch {
    return json as unknown as T;
  }
}

const intlLocale: Record<Locale, string> = { en: "en-GB", fr: "fr-FR", es: "es-ES", it: "it-IT" };

export function formatDate(date: string, locale: string) {
  const d = new Date(`${date}T12:00:00`);
  return d.toLocaleDateString(intlLocale[isLocale(locale) ? locale : defaultLocale], {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

export function formatPrice(amount: number) {
  return `${amount.toLocaleString("fr-FR")} MAD`;
}

export function fill(template: string, vars: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));
}
