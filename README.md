# CS Tours – Site de réservation

Site de réservation pour une agence de transport au Maroc : **bus entre les villes**, **transferts aéroport**, **navettes touristiques** et **excursions à la journée** (ex. Marrakech → Essaouira).

- 4 langues : English, Français, Español, Italiano (`/en`, `/fr`, `/es`, `/it`)
- Paiement : espèces au chauffeur ou virement bancaire (coordonnées affichées après la réservation)
- Gestion des places en temps réel (impossible de vendre deux fois la même place)
- Le client retrouve ou annule sa réservation avec sa référence + email (annulation gratuite jusqu'à 24 h avant)
- Dashboard admin en français sur `/admin`
- Espace chauffeurs sur `/driver` (mobile) avec commission de l'agence sur chaque trajet

## Chauffeurs et commissions

1. Dans `/admin/drivers` (menu **Chauffeurs**), créez un compte pour chaque chauffeur : nom, téléphone, mot de passe et taux de commission (10 % par défaut).
2. Dans **Réservations**, attribuez chaque trajet à un chauffeur.
3. Le chauffeur se connecte sur `/driver` avec son téléphone et son mot de passe. Il voit ses trajets (client, adresse, vol, montant), peut appeler le client ou lui écrire sur WhatsApp, et appuie sur **Terminé** à la fin du trajet.
4. La commission est calculée automatiquement quand le trajet est terminé :
   - **Espèces** : le chauffeur a encaissé le client, il doit la commission à l'agence.
   - **Virement** : l'agence a reçu l'argent, elle doit au chauffeur le montant moins la commission.
5. La page du chauffeur dans l'admin affiche le solde. Une fois les comptes faits, cliquez sur **Marquer comme réglé**.

Chauffeur de démonstration (données d'exemple) : téléphone `0611111111`, mot de passe `chauffeur123`.

## Démarrer

```bash
npm install
cp .env.example .env      # puis modifiez ADMIN_PASSWORD et AUTH_SECRET
npm run setup             # crée la base de données + données d'exemple
npm run dev               # http://localhost:3000
```

Admin : http://localhost:3000/admin (mot de passe de départ = `ADMIN_PASSWORD` dans `.env`, à changer ensuite dans **Paramètres**).
Chauffeurs : http://localhost:3000/driver

Pour voir le tableau de bord rempli : `npm run db:demo` ajoute des réservations et avis fictifs (références `DM-…`) et un chauffeur de démo (`/driver`, téléphone `0600000001`, mot de passe `demo1234`). `npm run db:demo:clear` supprime tout cela sans toucher aux vraies données.

Après une mise à jour du code (`git pull`), lancez `npm install` puis `npm run db:push` pour mettre la base de données à jour sans perdre vos réservations. Attention : `npm run setup` remet les données d'exemple et **efface** les réservations.

## À personnaliser

| Quoi | Où |
|---|---|
| Nom, téléphone, WhatsApp, email, adresse, RIB | `src/config/agency.ts` |
| Textes du site (4 langues) | `src/dictionaries/*.ts` |
| Couleurs (charte CS Tours : corail, blanc, brun encre) | `tailwind.config.ts` |
| Logo (SVG) | `src/components/brand/Logo.tsx` et `src/app/icon.svg` |
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
