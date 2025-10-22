# Guide d'implémentation - Email, SMS, Cloudinary, Compte & Séparation Front/Back

## 📋 Vue d'ensemble
Ce guide explique comment configurer et utiliser:
- 📧 Emails (Gmail SMTP)
- 💬 SMS (SMS.to - Congo)
- 🖼️ Cloudinary (images)
- 👤 Gestion du profil utilisateur
- 🔀 Séparation Backend/API et Frontend (dev et prod)

---

## 1️⃣ Email (Gmail SMTP)
### Préparation
- Activer 2FA: https://myaccount.google.com/security
- Créer un mot de passe d’application: https://myaccount.google.com/apppasswords

```env
GMAIL_USER=votre-email@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
```

Fonctionnalités:
- Réinitialisation de mot de passe: `POST /api/auth/forgot-password`, `POST /api/auth/reset-password`
- Confirmation de commande (envoi auto)
- Code 2FA: `POST /api/auth/request-2fa`

---

## 2️⃣ SMS (SMS.to - Congo Brazzaville)
```env
SMS_TO_API_KEY=votre-clé-api-sms-to
```
- Confirmation de commande (envoi auto)
- 2FA par SMS: `POST /api/auth/request-2fa` (method: "sms")
- Formats acceptés: `+242 06 ...`, `06 ...`, `0612345678`

---

## 3️⃣ Cloudinary (Images)
```env
CLOUDINARY_CLOUD_NAME=votre-cloud-name
CLOUDINARY_API_KEY=votre-api-key
CLOUDINARY_API_SECRET=votre-api-secret
# (optionnel) REACT_APP_CLOUDINARY_* côté client
```
- Upload côté client via composant `CloudinaryUpload` (si utilisé)
- Affichage optimisé via `ProductImage` (w_600,h_600,q_auto,f_auto)
- Signature upload côté serveur: `GET /api/upload/cloudinary-signature`

---

## 4️⃣ Gestion du Profil Utilisateur
Pages:
- `/compte` (profil, commandes, liens rapides)
- `/mot-de-passe-oublie` → email de reset
- `/reset-password?token=...`

APIs:
- `GET /api/auth/me` (infos)
- `PATCH /api/auth/me` (username, email, phone, password)
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `POST /api/auth/request-2fa` (email/sms)
- `POST /api/auth/verify-2fa`

---

## 5️⃣ Séparation Front/Back

### Développement
- API: http://localhost:5000 → `npm run dev:api`
- Front: http://localhost:3000 → `npm run dev:client`
- Front consomme l’API via `VITE_API_URL`

### Production
- API Node indépendante (PORT=5000), `SERVE_CLIENT=false`
- Front (build Vite) servi par Nginx/CDN
- CORS activé (origines autorisées) + credentials
- Exemple et guide: `ops/nginx.example.conf`, `ops/NGINX-PROD-GUIDE.md`

### Variables utiles
```env
# Backend (.env)
PORT=5000
FRONTEND_URL=https://shop.example.com
# OU CORS_ALLOWED_ORIGINS=https://shop.example.com,https://admin.example.com
API_ONLY=true
SERVE_CLIENT=false
COOKIE_DOMAIN=.example.com
JWT_SECRET=change-me

# Frontend (client/.env.*)
VITE_API_URL=http://localhost:5000   # dev
VITE_API_URL=https://api.example.com # prod
```

---

## 6️⃣ Dépannage
- Emails: vérifier GMAIL_USER/GMAIL_APP_PASSWORD, spams
- SMS: vérifier SMS_TO_API_KEY, crédit et format des numéros
- Cloudinary: vérifier CLOUDINARY_*
- CORS: FRONTEND_URL/CORS_ALLOWED_ORIGINS, `credentials: "include"` côté front
- MongoDB: URI valide, IP whitelisting, utilisateur DB créé

---

## 7️⃣ Références
- `server/services/email.ts`, `server/services/sms.ts`, `server/services/cloudinary.ts`
- `server/routes.ts` (auth, commandes, uploads, etc.)
- `client/src/components/ui/edit-profile-modal.tsx`
- `client/src/components/ui/product-image.tsx`
- `client/src/pages/forgot-password.tsx` & `reset-password.tsx`

