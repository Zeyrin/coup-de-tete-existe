# COUP DE TETE

**Casse ta routine.** Une app web qui te propose des destinations de train spontanees au depart de Paris ou Nice. Tu definis ton temps de trajet max et ton budget, tu lances la roue, et tu decouvres ou tu pars.

## Concept

Coup de Tete s'adresse aux gens qui veulent sortir de leur quotidien sans planifier pendant des heures. En quelques clics : choisis ta gare de depart, pose tes limites (temps + budget), et laisse la roue decider pour toi.

## Fonctionnalites

- **Roulette de destinations** - Filtrage par gare de depart (Paris/Nice), temps de trajet max et budget max
- **Profil voyageur (Premium)** - Quiz de personnalite (5 archetypes) qui filtre les destinations selon ton profil
- **Leaderboard** - Classement des utilisateurs par nombre de spins
- **Mode invite** - Utilisable sans compte, avec persistance locale
- **Reservation SNCF** - Lien direct vers SNCF Connect pour la destination tiree
- **Abonnement Premium** - Paiement via Stripe pour debloquer le filtrage par profil

## Archetypes voyageur

| Archetype | Icone | Description |
|-----------|-------|-------------|
| L'Aristocrate | 👑 | Palais, luxe, experiences raffinees |
| L'Artiste | 🎨 | Art, musees, patrimoine culturel |
| L'Explorateur | 🏔️ | Aventure outdoor, randonnees, paysages |
| Le Gourmet | 🍷 | Gastronomie, vin, terroir |
| Le Reveur | 🏖️ | Plages, Mediterranee, detente |

## Stack technique

- **Framework** : Next.js 15 (App Router, Turbopack)
- **Langage** : TypeScript
- **Styling** : Tailwind CSS 4, design neo-brutaliste
- **Auth & DB** : Supabase (PostgreSQL + Auth)
- **Paiement** : Stripe (abonnement)
- **3D** : Three.js (roue de la roulette)
- **Tests** : Jest + React Testing Library
- **Deploy** : Vercel
- **Analytics** : Vercel Analytics

## Structure du projet

```
src/
├── app/
│   ├── page.tsx                 # Page principale (roulette)
│   ├── destinations.json        # Base de donnees destinations
│   ├── quiz/                    # Quiz profil voyageur
│   ├── subscription/            # Abonnement premium
│   ├── leaderboard/             # Classement
│   ├── profile/                 # Profil utilisateur
│   ├── login/ & signup/         # Authentification
│   └── api/                     # Routes API
├── components/
│   ├── RouletteWheel.tsx        # Animation roulette 3D
│   ├── ImageCarousel.tsx        # Carousel photos destination
│   ├── HelpDialog.tsx           # Tutoriel "Comment ca marche"
│   ├── TravelTimeCombobox.tsx   # Selecteur temps de trajet
│   ├── BudgetCombobox.tsx       # Selecteur budget
│   └── ui/                      # Composants Shadcn/Radix
├── data/
│   └── archetypes.ts            # Definitions des 5 archetypes
└── utils/
    ├── supabase/                # Client Supabase
    ├── stripe/                  # Utilitaires Stripe
    └── guestUser.ts             # Gestion utilisateur invite
```

## Lancer le projet

```bash
npm install
npm run dev
```

Le serveur demarre sur [http://localhost:3000](http://localhost:3000).

## Variables d'environnement

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PREMIUM_PRICE_ID=
```

## Scripts

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de dev (Turbopack) |
| `npm run build` | Build production |
| `npm run start` | Serveur production |
| `npm run test` | Lancer les tests |
| `npm run test:coverage` | Tests avec couverture |
| `npm run lint` | Linter ESLint |
