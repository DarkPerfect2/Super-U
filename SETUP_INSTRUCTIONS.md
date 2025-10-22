# 🚀 Instructions de configuration initiale

## Prérequis
- Node.js 18+ et npm
- Compte MongoDB Atlas
- Compte Gmail (2FA activée) pour SMTP
- Compte SMS.to
- Compte Cloudinary

---

## Étape 1: Installation
```bash
npm install
```

---

## Étape 2: MongoDB Atlas
1. Créez un cluster gratuit
2. Créez un utilisateur DB et autorisez votre IP
3. Récupérez l’URI
4. Dans `.env`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB_NAME=giantcasino
```

---

## Étape 3: Gmail SMTP
Activez la 2FA puis générez un mot de passe d’application:
```env
GMAIL_USER=votre-email@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
```

---

## Étape 4: SMS.to
```env
SMS_TO_API_KEY=votre-clé-api
```

---

## Étape 5: Cloudinary
```env
CLOUDINARY_CLOUD_NAME=votre-cloud-name
CLOUDINARY_API_KEY=votre-api-key
CLOUDINARY_API_SECRET=votre-api-secret
# (optionnel côté client)
REACT_APP_CLOUDINARY_CLOUD_NAME=votre-cloud-name
REACT_APP_CLOUDINARY_UPLOAD_PRESET=giantcasino
```

---

## Étape 6: Configuration Front/Back (séparé)

### Backend (.env)
```env
PORT=5000
# URL du front pour CORS et liens (reset password…)
FRONTEND_URL=http://localhost:3000
# Si plusieurs frontends: CORS_ALLOWED_ORIGINS=https://shop.example.com,https://admin.example.com
API_ONLY=true
SERVE_CLIENT=false
```

### Frontend (client/.env.development)
```env
VITE_API_URL=http://localhost:5000
```

---

## Étape 7: Lancer en développement (séparé)
Ouvrez deux terminaux:
```bash
npm run dev:api     # API sur http://localhost:5000
npm run dev:client  # Front sur http://localhost:3000
```

Le front consomme l’API via `VITE_API_URL`. Les préflights CORS et credentials doivent passer (Authorization, cookies si utilisés).

---

## Étape 8: Tester les fonctionnalités
- `/inscription`, `/connexion`, `/compte`
- `/mot-de-passe-oublie` → email de reset → `/reset-password?token=...`
- `/produits`, `/panier`, `/checkout`

---

## 🔐 Sécurité / Production
- Ne jamais committer `.env` avec des secrets
- Production séparée: `SERVE_CLIENT=false`, front servi par Nginx/CDN
- `client/.env.production`: `VITE_API_URL=https://api.example.com`
- Voir `ops/nginx.example.conf` et `ops/NGINX-PROD-GUIDE.md`

Variables utiles:
```env
# API
PORT=5000
API_ONLY=true
SERVE_CLIENT=false
FRONTEND_URL=https://shop.example.com
CORS_ALLOWED_ORIGINS=https://shop.example.com,https://admin.example.com
COOKIE_DOMAIN=.example.com
JWT_SECRET=change-me

# Client (dans client/.env.*)
VITE_API_URL=https://api.example.com
```

---

## Dépannage
- MongoDB: vérifier URI, droits réseau, utilisateur
- Emails: vérifier GMAIL_USER/GMAIL_APP_PASSWORD et les spams
- SMS: vérifier SMS_TO_API_KEY et le format des numéros (+242…)
- CORS: FRONTEND_URL/CORS_ALLOWED_ORIGINS et `credentials: "include"`
- Cloudinary: vérifier CLOUDINARY_* et/ ou l’upload preset du client
