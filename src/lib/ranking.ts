import { db } from "@/lib/db";

export const MAX_WARNINGS = 3;

/**
 * Classement des chauffeurs selon les avis clients.
 * On utilise une moyenne « pondérée » : un chauffeur avec un seul avis 5★ ne passe pas
 * devant un chauffeur avec 30 avis à 4,8★. Chaque chauffeur part avec 3 avis « fictifs »
 * égaux à la moyenne de toute l'agence, qui comptent de moins en moins quand ses vrais avis arrivent.
 */
export async function driverRanking() {
  const drivers = await db.driver.findMany({
    include: { reviews: { select: { rating: true } }, _count: { select: { warnings: true } } },
    orderBy: { name: "asc" },
  });
  const all = drivers.flatMap((d) => d.reviews.map((r) => r.rating));
  const globalAvg = all.length ? all.reduce((a, b) => a + b, 0) / all.length : 4;
  const M = 3;

  const rows = drivers.map((d) => {
    const n = d.reviews.length;
    const sum = d.reviews.reduce((a, r) => a + r.rating, 0);
    return {
      id: d.id, name: d.name, active: d.active, blockedReason: d.blockedReason,
      warnings: d._count.warnings, count: n,
      avg: n ? sum / n : null,
      score: (sum + M * globalAvg) / (n + M),
    };
  });
  // Les chauffeurs sans avis sont classés après ceux qui en ont
  rows.sort((a, b) => (b.count ? 1 : 0) - (a.count ? 1 : 0) || b.score - a.score || b.count - a.count);
  return rows.map((r, i) => ({ ...r, rank: i + 1, total: rows.length }));
}

export function stars(avg: number | null) {
  return avg == null ? "—" : `${avg.toFixed(1).replace(".", ",")}`;
}
