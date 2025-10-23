# Déploiement Front/Back séparés (Render + Netlify/Vercel)

## 1) Backend sur Render (API)

Fichier: `ops/render/render.yaml`

Étapes:
1. Créez un nouveau service Web sur Render et importez le repo.
2. Ajoutez le fichier `render.yaml` depuis `ops/render/render.yaml`.
3. Configurez les variables d'environnement manquantes (sync: false) dans Render Dashboard:
   - `JWT_SECRET` (valeur forte)
   - `MONGODB_URI` (MongoDB Atlas, inclure user/pass et paramètres)
4. Déployez. Render exposera une URL du type: `https://super-u-api.onrender.com`.
5. (Optionnel) Ajoutez un domaine personnalisé `api.example.com` et pointez le DNS.

Vérifications:
- `GET https://<votre-api>/api/config/policy` doit répondre 200.
- CORS: `CORS_ALLOWED_ORIGINS` doit contenir les origines front (shop/admin).

## 2) Frontend (Netlify ou Vercel)

### Option A – Netlify
Fichier: `ops/netlify/netlify.toml`

Étapes:
1. Connectez le repo à Netlify.
2. Build command: `npm ci && npx vite build`
3. Publish directory: `dist/public`
4. Définissez `VITE_API_URL` dans Netlify → Site settings → Environment variables:
   - `VITE_API_URL=https://super-u-api.onrender.com` (ou votre domaine API)
5. Déployez. Le site sera disponible via `https://<site>.netlify.app` ou votre domaine (ex: `https://shop.example.com`).

### Option B – Vercel
Fichier: `ops/vercel/vercel.json`

Étapes:
1. Importez le repo dans Vercel.
2. Build command: `npm ci && npx vite build`
3. Output directory: `dist/public`
4. Env var: `VITE_API_URL=https://super-u-api.onrender.com`
5. Déployez et attachez votre domaine (ex: `shop.example.com`).

## 3) MongoDB Atlas
- Créez un cluster et un utilisateur DB.
- Autorisez l'IP de sortie Render (ou `0.0.0.0/0` pour tests, à restreindre ensuite).
- Renseignez `MONGODB_URI` dans Render.

## 4) CORS et sécurité
- Backend (Render):
  - `CORS_ALLOWED_ORIGINS=https://shop.example.com,https://admin.example.com`
  - `SERVE_CLIENT=false`, `LOG_LEVEL=warn`, `REFRESH_TOKEN_EXPIRY=7d`, `JWT_SECRET=<fort>`
- Frontend (Netlify/Vercel):
  - `VITE_API_URL=https://api.example.com` (ou l’URL Render)
- HTTPS seulement sur tous les domaines.

## 5) Flux de paiement Lygos (sandbox MTN MoMo CG)
- Initiation (POST `/api/payments/initiate`)
  - Requiert: `orderId`, `method="momo"`
  - Réponse: `{ paymentUrl, provider, transactionId }`
- Webhook (POST `/api/payments/lygos/webhook`)
  - Sécurité: signature HMAC SHA-256 (header `X-Lygos-Signature`), secret `LYGOS_WEBHOOK_SECRET`
  - Rate limiting: 20 requêtes / minute / IP (429 sinon)
  - Statuts gérés: `paid/success` → commande `paid` (email + SMS envoyés), `failed/canceled` → `canceled`
- Variables d’env:
  - `LYGOS_BASE_URL` (sandbox), `LYGOS_API_KEY`, `LYGOS_MERCHANT_ID`, `LYGOS_WEBHOOK_SECRET`

## 6) Écran de retour de paiement (Front)
- Rediriger l’utilisateur vers `/confirmation?orderId=<id>` après checkout
- La page front lit `orderId`, appelle `GET /api/orders/:id` et affiche le statut:
  - `paid`: confirmation + détails retrait
  - `pending_payment`: information d’attente / refresh périodique
  - `canceled`: échec du paiement (CTA réessayer)
- Recommandation: rafraîchir l’état toutes les 2-3s tant que `pending_payment`, ou utiliser un polling plus espacé + bouton “Rafraîchir”.

## 7) Checklists
- API: 200 sur `/api/categories` ou `/api/config/policy`
- FRONT: App OK, appels API OK (CORS passent)
- Auth: login/refresh/rotation OK depuis le front
- Commande: create → initiate paiement → redirection → webhook → statut `paid`

## 8) Débogage
- CORS: vérifiez `CORS_ALLOWED_ORIGINS` (origines exactes)
- 401 après refresh: vérifier `VITE_API_URL`, flux de refresh, heure serveur
- Webhook 401: vérifier `LYGOS_WEBHOOK_SECRET` et la signature (`sha256=`)
- Rate limit 429: ralentir l’envoi ou réduire le bruit côté provider
- Logs Render: pino (warn). DEV_PRETTY_LOGS en dev uniquement.
