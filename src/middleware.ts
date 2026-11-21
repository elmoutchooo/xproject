import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

const locales = ["en", "fr", "es", "it"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Dashboard admin protégé par mot de passe
  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") return NextResponse.next();
    const ok = await verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value);
    if (!ok) return NextResponse.redirect(new URL("/admin/login", req.url));
    return NextResponse.next();
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
