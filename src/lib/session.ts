// Session admin : cookie signé HMAC (fonctionne aussi dans le middleware Edge)
export const SESSION_COOKIE = "admin_session";
const MAX_AGE_S = 60 * 60 * 12;

async function hmac(data: string) {
  const secret = process.env.AUTH_SECRET || "dev-secret-change-me";
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function createSessionToken() {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE_S;
  return `${exp}.${await hmac(String(exp))}`;
}

export async function verifySessionToken(token?: string) {
  if (!token) return false;
  const [exp, sig] = token.split(".");
  if (!exp || !sig || Number(exp) < Date.now() / 1000) return false;
  return (await hmac(exp)) === sig;
}

export const sessionMaxAge = MAX_AGE_S;
