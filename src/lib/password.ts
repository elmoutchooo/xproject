import { randomBytes, scrypt as _scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(_scrypt) as (pw: string, salt: string, len: number) => Promise<Buffer>;

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = await scrypt(password, salt, 64);
  return `${salt}:${hash.toString("hex")}`;
}

export async function checkPassword(password: string, stored: string) {
  const [salt, hex] = stored.split(":");
  if (!salt || !hex) return false;
  const hash = await scrypt(password, salt, 64);
  const expected = Buffer.from(hex, "hex");
  return expected.length === hash.length && timingSafeEqual(expected, hash);
}

/**
 * Numéro marocain sous une seule forme : 0XXXXXXXXX.
 * « 0622222222 », « +212 6 22 22 22 22 », « 212622222222 », « 00212622222222 » et « 622222222 »
 * donnent tous « 0622222222 ». Les numéros étrangers gardent leurs chiffres tels quels.
 */
export function normalizePhone(p: string) {
  let d = p.replace(/\D/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  if (d.startsWith("212") && d.length === 12) return `0${d.slice(3)}`;
  if (d.startsWith("2120") && d.length === 13) return d.slice(3); // +212 06... (0 en trop)
  if (/^[5-8]\d{8}$/.test(d)) return `0${d}`;
  return d;
}
