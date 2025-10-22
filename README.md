# 🛒 Géant Casino Click & Collect – Séparation Front/Back (React + Express)

Application e‑commerce moderne pour Géant Casino (Brazzaville) avec Frontend React/Vite et Backend Express séparés en dev et en prod.

## ✨ Fonctionnalités
- 🔐 Authentification JWT (access/refresh), profil utilisateur
- 📦 Catalogue (catégories, recherche, tri, pagination)
- 🛍️ Panier & Commande (mock paiement), créneaux de retrait
- 📧 Emails (Gmail SMTP): reset password, confirmation commande, 2FA
- 💬 SMS (SMS.to – Congo): confirmation commande, 2FA
- 🖼️ Images Cloudinary (optimisation et upload signé)

## 🧱 Stack
- Front: React 18 + TypeScript, Vite, TanStack Query, Zustand, Tailwind + Shadcn/UI, Zod
- Back: Node.js + Express, MongoDB (Atlas), JWT, Bcrypt
- Partage: `shared/schema.ts`

## 🔀 Séparation Front/Back
- Dev
  - API: http://localhost:5000 → `npm run dev:api`
  - Front: http://localhost:3000 → `npm run dev:client`
  - Le front utilise `VITE_API_URL` (client/.env.development)
- Prod
  - API Node indépendante (`SERVE_CLIENT=false`)
  - Front (build Vite) servi par Nginx/CDN
  - CORS activé + credentials (origines autorisées)
  - Voir `ops/nginx.example.conf` et `ops/NGINX-PROD-GUIDE.md`

## ⚙️ Installation
```bash
npm install
```

### Variables d’environnement (extraits)
Créer `.env` (backend):
```env
PORT=5000
FRONTEND_URL=http://localhost:3000
# OU CORS_ALLOWED_ORIGINS=https://shop.example.com,https://admin.example.com
API_ONLY=true
SERVE_CLIENT=false
COOKIE_DOMAIN=.example.com
JWT_SECRET=change-me

MONGODB_URI=...
MONGODB_DB_NAME=giantcasino
GMAIL_USER=...
GMAIL_APP_PASSWORD=...
SMS_TO_API_KEY=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

Créer `client/.env.development` (frontend):
```env
VITE_API_URL=http://localhost:5000
```

## ▶️ Démarrage (dev)
```bash
# Terminal 1
npm run dev:api   # API  : http://localhost:5000
# Terminal 2
npm run dev:client  # Front: http://localhost:3000
```

## 🔌 Endpoints (extraits)
- Auth: `POST /api/auth/register | login | refresh | logout`
- Profil: `GET /api/auth/me`, `PATCH /api/auth/me`
- Reset: `POST /api/auth/forgot-password`, `POST /api/auth/reset-password`
- 2FA: `POST /api/auth/request-2fa`, `POST /api/auth/verify-2fa`
- Catalogue: `GET /api/categories`, `GET /api/products`, `GET /api/products/:id`
- Panier: `GET /api/cart`
- Commandes: `POST /api/orders`, `GET /api/orders`, `GET /api/orders/:id`, `POST /api/orders/:id/resend-confirmation`
- Upload Cloudinary: `GET /api/upload/cloudinary-signature`

## 📚 Documentation
- `QUICK_START.md` – Démarrage rapide
- `SETUP_INSTRUCTIONS.md` – Configuration complète
- `IMPLEMENTATION_GUIDE.md` – Guide détaillé
- `RESUME_IMPLEMENTATION_FR.md` – Résumé
- `CHANGELOG_IMPLEMENTATION.md` – Journal des changements

## 🔐 Sécurité
- Ne commitez pas `.env` avec des secrets
- Utilisez `SameSite=None; Secure` si vous posez des cookies cross‑site
- Configurez CORS (`FRONTEND_URL`/`CORS_ALLOWED_ORIGINS`) et `credentials: "include"` côté front

## 📝 Licence
MIT
