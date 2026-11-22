"use client";

import { useEffect, useState } from "react";
import { endSessions } from "@/app/session-actions";

// Marqueur posé dans l'onglet (sessionStorage) : effacé quand l'onglet est fermé
const TAB_KEY = { admin: "cs_admin_tab", driver: "cs_driver_tab" } as const;

const get = (k: string) => { try { return sessionStorage.getItem(k); } catch { return null; } };
const del = (k: string) => { try { sessionStorage.removeItem(k); } catch { /* ignoré */ } };

/**
 * Dans l'admin ou l'espace chauffeur : si cet onglet ne s'est pas connecté lui-même
 * (onglet fermé puis rouvert, nouveau navigateur...), on ferme la session et on renvoie vers la connexion.
 */
export function AreaGuard({ area }: { area: "admin" | "driver" }) {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    const check = () => {
      if (get(TAB_KEY[area]) === "1") return setOk(true);
      setOk(false);
      endSessions({ [area]: true }).finally(() => window.location.replace(`/${area}/login`));
    };
    check();
    // Retour arrière vers une page gardée en cache par le navigateur
    const onShow = (e: PageTransitionEvent) => { if (e.persisted) check(); };
    window.addEventListener("pageshow", onShow);
    return () => window.removeEventListener("pageshow", onShow);
  }, [area]);
  // Cache la page tant que l'onglet n'est pas vérifié
  return ok ? null : <div className="fixed inset-0 z-[100] bg-white" aria-hidden />;
}

/** Sur le site public : quitter l'admin ou l'espace chauffeur ferme la session. */
export function LeaveGuard() {
  useEffect(() => {
    const admin = get(TAB_KEY.admin) === "1";
    const driver = get(TAB_KEY.driver) === "1";
    if (!admin && !driver) return;
    del(TAB_KEY.admin);
    del(TAB_KEY.driver);
    endSessions({ admin, driver });
  }, []);
  return null;
}

/** À la connexion : marque l'onglet comme connecté. */
export function markTab(area: "admin" | "driver") {
  try { sessionStorage.setItem(TAB_KEY[area], "1"); } catch { /* navigation privée stricte */ }
}

export function clearTab(area: "admin" | "driver") {
  del(TAB_KEY[area]);
}
