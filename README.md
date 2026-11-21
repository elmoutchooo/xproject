# Atlas Transport – Site de réservation

Site de réservation pour une agence de transport au Maroc : **bus entre les villes**, **transferts aéroport**, **navettes touristiques** et **excursions à la journée** (ex. Marrakech → Essaouira).

- 4 langues : English, Français, Español, Italiano (`/en`, `/fr`, `/es`, `/it`)
- Paiement : espèces au chauffeur ou virement bancaire (coordonnées affichées après la réservation)
- Gestion des places en temps réel (impossible de vendre deux fois la même place)
- Le client retrouve ou annule sa réservation avec sa référence + email (annulation gratuite jusqu'à 24 h avant)
- Dashboard admin en français sur `/admin`

## Démarrer

```bash
npm install
cp .env.example .env      # puis modifiez ADMIN_PASSWORD et AUTH_SECRET
npm run setup             # crée la base de données + données d'exemple
npm run dev               # http://localhost:3000
```

Admin : http://localhost:3000/admin (mot de passe = `ADMIN_PASSWORD` dans `.env`).

## À personnaliser

| Quoi | Où |
|---|---|
| Nom, téléphone, WhatsApp, email, adresse, RIB | `src/config/agency.ts` |
| Textes du site (4 langues) | `src/dictionaries/*.ts` |
| Couleurs | `tailwind.config.ts` |
| Lignes de bus, transferts, excursions, prix | Dashboard `/admin` |

## SEO

- Balises `title`, `description`, `canonical` et `hreflang` sur chaque page, dans les 4 langues
- Une page par ligne de bus (ex. `/fr/bus/marrakech-to-essaouira`) pour se positionner sur « bus Marrakech Essaouira »
- Données structurées JSON-LD : `TravelAgency`, `TouristTrip`, `BusTrip`, `FAQPage`, `BreadcrumbList`
- `sitemap.xml` et `robots.txt` générés automatiquement (les pages de réservation et l'admin ne sont pas indexés)
- Image de partage Open Graph générée pour chaque langue (WhatsApp, Facebook…)

En production, définissez `NEXT_PUBLIC_SITE_URL` (votre nom de domaine), puis ajoutez le site et le sitemap dans **Google Search Console** et créez une fiche **Google Business Profile** pour l'agence.

## Mise en ligne

SQLite suffit pour démarrer sur un VPS. Pour Vercel ou un hébergement sans disque persistant, passez à PostgreSQL : changez `provider = "postgresql"` dans `prisma/schema.prisma` et mettez l'URL dans `DATABASE_URL`.

## Technologies

Next.js 15 (App Router, Server Actions) · React 19 · Tailwind CSS · Prisma
