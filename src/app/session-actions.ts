"use server";

import { cookies } from "next/headers";
import { DRIVER_COOKIE, SESSION_COOKIE } from "@/lib/session";

/** Ferme la session admin et/ou chauffeur sans redirection (appelé par les gardes côté navigateur). */
export async function endSessions(which: { admin?: boolean; driver?: boolean }) {
  const jar = await cookies();
  if (which.admin) jar.delete(SESSION_COOKIE);
  if (which.driver) jar.delete(DRIVER_COOKIE);
}
