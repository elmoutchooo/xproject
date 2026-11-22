import { NextResponse, type NextRequest } from "next/server";
import { createToken, DRIVER_COOKIE, DRIVER_MAX_AGE_S, readToken, SESSION_COOKIE, sessionCookieOptions, sessionMaxAge } from "@/lib/session";

const locales = ["en", "fr", "es", "it"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Dashboard admin protégé par mot de passe
  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") return NextResponse.next();
    const subject = await readToken(req.cookies.get(SESSION_COOKIE)?.value);
    if (subject !== "admin") return NextResponse.redirect(new URL("/admin/login", req.url));
    // Chaque page visitée repousse la déconnexion automatique
    const res = NextResponse.next();
    res.cookies.set(SESSION_COOKIE, await createToken("admin", sessionMaxAge), sessionCookieOptions);
    return res;
  }

  // Espace chauffeurs
  if (pathname.startsWith("/driver")) {
    if (pathname === "/driver/login") return NextResponse.next();
    const subject = await readToken(req.cookies.get(DRIVER_COOKIE)?.value);
    if (!subject?.startsWith("driver:")) return NextResponse.redirect(new URL("/driver/login", req.url));
    const res = NextResponse.next();
    res.cookies.set(DRIVER_COOKIE, await createToken(subject, DRIVER_MAX_AGE_S), sessionCookieOptions);
    return res;
  }

  // Site public : toujours préfixé par la langue (/en, /fr, /es, /it)
  const first = pathname.split("/")[1];
  if (locales.includes(first)) return NextResponse.next();

  const accept = req.headers.get("accept-language") ?? "";
  const preferred =
    accept.split(",").map((p) => p.trim().slice(0, 2).toLowerCase()).find((l) => locales.includes(l)) ?? "en";
  const url = req.nextUrl.clone();
  url.pathname = `/${preferred}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico|.*\\..*).*)"],
};
