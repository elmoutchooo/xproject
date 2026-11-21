// Sessions signées HMAC (fonctionnent aussi dans le middleware Edge)
// Jeton : "<sujet>.<expiration>.<signature>" ; sujet = "admin" ou "driver:<id>"
export const SESSION_COOKIE = "admin_session";
export const DRIVER_COOKIE = "driver_session";
const MAX_AGE_S = 60 * 60 * 12;
export const DRIVER_MAX_AGE_S = 60 * 60 * 24 * 30;

async function hmac(data: string) {
  const secret = process.env.AUTH_SECRET || "dev-secret-change-me";
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function createToken(subject: string, maxAge = MAX_AGE_S) {
  const exp = Math.floor(Date.now() / 1000) + maxAge;
  const body = `${subject}.${exp}`;
  return `${body}.${await hmac(body)}`;
}

/** Renvoie le sujet du jeton s'il est valide, sinon null. */
export async function readToken(token?: string) {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [subject, exp, sig] = parts;
  if (Number(exp) < Date.now() / 1000) return null;
  return (await hmac(`${subject}.${exp}`)) === sig ? subject : null;
}

export const createSessionToken = () => createToken("admin");
export const verifySessionToken = async (token?: string) => (await readToken(token)) === "admin";
export const sessionMaxAge = MAX_AGE_S;
