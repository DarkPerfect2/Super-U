# 🛒 Géant Casino Click & Collect - Brazzaville

Application e-commerce moderne pour Géant Casino permettant aux clients de commander leurs courses en ligne et de les retirer en magasin.

## ✨ Fonctionnalités

### 🔐 Authentification
- Inscription et connexion sécurisées avec JWT
- Gestion de session avec refresh token (15min access, 7 jours refresh)
- Profil utilisateur modifiable

### 📦 Catalogue Produits
- Navigation par catégories (Fruits & Légumes, Viandes, Épicerie, etc.)
- Recherche avec suggestions en temps réel (typeahead)
- Filtres : prix, popularité, nouveautés
- Pagination des résultats
- Pages produit détaillées avec galerie d'images
- Système de notation et avis clients

### 🛍️ Panier & Commande
- Panier persistant (localStorage + API serveur)
- Gestion des quantités avec validation du stock
- Checkout en 3 étapes :
  1. Informations client (nom, téléphone, email)
  2. Choix du créneau de retrait
  3. Paiement (Mobile Money / Carte)

### 💳 Paiement
- **Mobile Money** : MTN Money, Airtel Money
- **Carte bancaire** : Visa, Mastercard
- Mode sandbox/test intégré pour développement

### 📅 Créneaux de Retrait
- Sélection de plages horaires disponibles
- Affichage de la capacité restante
- Gestion automatique des réservations

### ⏰ Politique d'Expiration
- **24h maximum** pour produits périssables
- **48h maximum** pour produits non périssables
- Annulation automatique sans remboursement après expiration
- Affichage clair des politiques sur toutes les pages critiques

### ❤️ Autres Fonctionnalités
- Liste de favoris (authentification requise)
- Historique des commandes
- Codes de retrait (temporaire et final)
- Design responsive mobile-first
- Mode sombre (optionnel)

## 🚀 Technologies Utilisées

### Frontend
- **React 18** + **TypeScript**
- **Wouter** pour le routing
- **TanStack Query** (React Query) pour le data fetching
- **Zustand** pour la gestion du panier
- **Tailwind CSS** + **Shadcn/UI** pour l'interface
- **Zod** pour la validation
- **React Hook Form** pour les formulaires

### Backend
- **Node.js** + **Express**
- **PostgreSQL** (Neon serverless)
- **Drizzle ORM** pour la base de données
- **JWT** (jsonwebtoken) pour l'authentification
- **Bcrypt** pour le hachage des mots de passe
- **Zod** pour la validation côté serveur

## 📋 Prérequis

- **Node.js** 20+ et npm
- **PostgreSQL** (fourni automatiquement sur Replit)
- Compte développeur pour les fournisseurs de paiement (optionnel)

## 🛠️ Installation

### 1. Cloner le projet

```bash
git clone <url-du-repo>
cd geant-casino-click-collect
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configuration des variables d'environnement

Créez un fichier `.env` à la racine du projet :

```bash
# Database (fourni automatiquement sur Replit)
DATABASE_URL=postgresql://user:password@host:5432/database

# JWT Secret (changez en production)
JWT_SECRET=votre-cle-secrete-super-secure

# Payment Providers (voir section Configuration Paiement ci-dessous)
MTN_MOMO_API_KEY=your-key
MTN_MOMO_API_SECRET=your-secret
AIRTEL_MONEY_CLIENT_ID=your-id
AIRTEL_MONEY_CLIENT_SECRET=your-secret
STRIPE_SECRET_KEY=your-stripe-key
```

### 4. Initialiser la base de données

```bash
# Créer les tables
npm run db:push

# (Optionnel) Remplir avec des données de test
npx tsx server/seed.ts
```

### 5. Lancer l'application

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:5000`

## 💰 Configuration des Paiements

### Mobile Money MTN (Congo-Brazzaville)

1. **Créer un compte développeur**
   - Visitez : https://momodeveloper.mtn.com/
   - Inscrivez-vous et vérifiez votre email

2. **Enregistrer votre application**
   - Accédez au Dashboard
   - Créez une nouvelle application
   - Notez votre `API Key` et `API Secret`

3. **Obtenir une clé d'abonnement**
   - Souscrivez au produit "Collections" (Sandbox)
   - Récupérez votre `Subscription Key`

4. **Configurer dans `.env`**
   ```bash
   MTN_MOMO_API_KEY=votre-api-key
   MTN_MOMO_API_SECRET=votre-api-secret
   MTN_MOMO_SUBSCRIPTION_KEY=votre-subscription-key
   ```

### Mobile Money Airtel (Congo-Brazzaville)

1. **Créer un compte développeur**
   - Visitez : https://developers.airtel.africa/
   - Inscrivez-vous avec vos informations professionnelles

2. **Enregistrer votre application**
   - Créez une application dans le portail
   - Sélectionnez "Money" comme service
   - Choisissez "Congo-Brazzaville" comme pays

3. **Obtenir vos clés**
   - Récupérez `Client ID` et `Client Secret`
   - Activez le mode Sandbox pour les tests

4. **Configurer dans `.env`**
   ```bash
   AIRTEL_MONEY_CLIENT_ID=votre-client-id
   AIRTEL_MONEY_CLIENT_SECRET=votre-client-secret
   ```

### Cartes Bancaires (Visa/Mastercard)

#### Option 1 : Stripe (Recommandé)

1. **Créer un compte Stripe**
   - Visitez : https://dashboard.stripe.com/register
   - Complétez votre inscription

2. **Obtenir les clés API**
   - Accédez à "Developers" → "API keys"
   - Copiez la `Secret key` et la `Publishable key`
   - Utilisez les clés de test pour le développement

3. **Configurer dans `.env`**
   ```bash
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```

#### Option 2 : Flutterwave (Alternative africaine)

1. **Créer un compte**
   - Visitez : https://dashboard.flutterwave.com/signup
   - Vérifiez votre entreprise

2. **Obtenir les clés**
   - Dashboard → Settings → API Keys
   - Récupérez `Public Key` et `Secret Key`

3. **Configurer dans `.env`**
   ```bash
   FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-...
   FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-...
   ```

### Mode Test/Sandbox

L'application est configurée pour fonctionner en mode test par défaut. Pour passer en production :

1. Remplacez les clés de test par les clés de production
2. Modifiez `NODE_ENV=production` dans `.env`
3. Configurez les webhooks pour les notifications de paiement réel

## 📁 Structure du Projet

```
geant-casino-click-collect/
├── client/                    # Frontend React
│   ├── src/
│   │   ├── components/       # Composants réutilisables
│   │   │   ├── layout/       # Header, Footer
│   │   │   ├── products/     # ProductCard, etc.
│   │   │   └── ui/           # Shadcn components
│   │   ├── pages/            # Pages de l'application
│   │   ├── hooks/            # Custom hooks
│   │   ├── stores/           # Zustand stores
│   │   ├── lib/              # Utilities
│   │   └── App.tsx           # Application root
│   └── index.html
├── server/                    # Backend Express
│   ├── db.ts                 # Database connection
│   ├── storage.ts            # Database operations
│   ├── routes.ts             # API endpoints
│   ├── middleware/           # Auth middleware
│   └── seed.ts               # Database seeding
├── shared/                    # Code partagé
│   └── schema.ts             # Schémas Drizzle + Zod
├── .env.example              # Template variables d'environnement
├── package.json
├── drizzle.config.ts
└── README.md
```

## 🔌 API Endpoints

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Déconnexion
- `GET /api/auth/me` - Utilisateur courant
- `PATCH /api/auth/me` - Modifier profil

### Catalogue
- `GET /api/categories` - Liste des catégories
- `GET /api/products` - Liste paginée des produits
- `GET /api/products/suggest?q=` - Suggestions de recherche
- `GET /api/products/:id` - Détail produit

### Favoris
- `GET /api/favorites` - Liste favoris
- `POST /api/favorites/:productId` - Ajouter favori
- `DELETE /api/favorites/:productId` - Retirer favori

### Avis
- `GET /api/products/:id/ratings` - Avis produit
- `POST /api/products/:id/ratings` - Ajouter avis

### Panier
- `GET /api/cart` - Récupérer panier
- (Gestion côté client avec API future)

### Créneaux
- `GET /api/pickup-slots?date=YYYY-MM-DD` - Créneaux disponibles

### Commandes
- `GET /api/orders` - Historique commandes
- `GET /api/orders/:id` - Détail commande
- `POST /api/orders` - Créer commande

### Paiement
- `POST /api/payments/initiate` - Initier paiement (mock)

### Configuration
- `GET /api/config/policy` - Politique d'expiration

## 👤 Compte de Test

Un utilisateur de test est créé automatiquement :

```
Email: test@example.com
Mot de passe: password123
```

## 🧪 Tests

```bash
# Tests unitaires
npm test

# Tests e2e
npm run test:e2e
```

## 🚢 Déploiement

### Sur Replit

1. Cliquez sur "Run" - l'application se lance automatiquement
2. La base de données PostgreSQL est provisionnée automatiquement
3. Configurez les secrets dans l'onglet "Secrets" pour les clés API

### Sur Vercel/Netlify

```bash
# Build de production
npm run build

# Variables d'environnement à configurer :
# DATABASE_URL, JWT_SECRET, clés de paiement
```

## 🔒 Sécurité

- ✅ Mots de passe hachés avec bcrypt (10 rounds)
- ✅ JWT avec expiration courte (15min access)
- ✅ Refresh tokens sécurisés (7 jours)
- ✅ Validation stricte des inputs (Zod)
- ✅ CORS configuré
- ✅ Pas de secrets exposés côté client
- ✅ Protection CSRF via SameSite cookies (si utilisé)

## 📝 License

MIT

## 🤝 Support

Pour toute question ou problème :
- Email : support@geantcasino.cg
- Téléphone : +242 XX XX XX XX

---

Développé avec ❤️ pour Géant Casino Brazzaville
