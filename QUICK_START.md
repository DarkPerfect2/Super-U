# 🚀 Guide de démarrage rapide

Vous venez de recevoir une application Géant Casino entièrement configurée. Voici comment démarrer en 15 minutes.

---

## ⏱️ Étape 1: Installation (2 minutes)

```bash
npm install
```

---

## ⚙️ Étape 2: Configuration MongoDB (3 minutes)

1) Créez un cluster gratuit sur MongoDB Atlas et récupérez l’URI.
2) Copiez `.env.example` vers `.env` et renseignez:

```bash
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB_NAME=giantcasino
```

---

## 📧 Étape 3: Configuration Gmail (3 minutes)

Activez la 2FA sur votre compte Google puis générez un mot de passe d’application:

```bash
GMAIL_USER=votre-email@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
```

---

## 💬 Étape 4: Configuration SMS (2 minutes)

Créez un compte sur sms.to et renseignez votre clé API:

```bash
SMS_TO_API_KEY=votre-cle-api
```

---

## 🖼️ Étape 5: Configuration Cloudinary (3 minutes)

Créez un compte Cloudinary et renseignez:

```bash
CLOUDINARY_CLOUD_NAME=votre-cloud-name
CLOUDINARY_API_KEY=votre-api-key
CLOUDINARY_API_SECRET=votre-api-secret
# (optionnel côté client)
REACT_APP_CLOUDINARY_CLOUD_NAME=votre-cloud-name
REACT_APP_CLOUDINARY_UPLOAD_PRESET=giantcasino
```

---

## ▶️ Étape 6: Configuration Front/Back (séparé)

- Backend (.env):
```bash
PORT=5000
FRONTEND_URL=http://localhost:3000
# (facultatif) CORS_ALLOWED_ORIGINS=https://shop.example.com,https://admin.example.com
API_ONLY=true
SERVE_CLIENT=false
```

- Frontend (client/.env.development):
```bash
VITE_API_URL=http://localhost:5000
```

---

## ▶️ Étape 7: Démarrer en développement (séparé)

Ouvrez deux terminaux:

```bash
# Terminal 1 (API)
npm run dev:api   # http://localhost:5000

# Terminal 2 (Front)
npm run dev:client  # http://localhost:3000
```

---

## 🎯 Étape 8: Tester (5 minutes)

- Ouvrez le front: http://localhost:3000
- Le front consomme l’API via VITE_API_URL (http://localhost:5000)

### Tests rapides
- Inscription: `/inscription`
- Connexion: `/connexion`
- Mot de passe oublié: `/mot-de-passe-oublie`
- Reset mot de passe: `/reset-password?token=...`
- Produits: `/produits`
- Panier: `/panier`
- Commande: `/checkout`

---

## 📁 Fichiers à configurer

```
.env (racine)
├── MONGODB_URI, MONGODB_DB_NAME
├── GMAIL_USER, GMAIL_APP_PASSWORD
├── SMS_TO_API_KEY
├── CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
├── FRONTEND_URL ou CORS_ALLOWED_ORIGINS
├── API_ONLY, SERVE_CLIENT, PORT

client/.env.development
└── VITE_API_URL
```

---

## ✨ Fonctionnalités disponibles maintenant

| Fonctionnalité | Status | URL |
|---|---|---|
| Inscription | ✅ | `/inscription` |
| Connexion | ✅ | `/connexion` |
| Voir le compte | ✅ | `/compte` |
| Modifier le profil | ✅ | `/compte` (modal) |
| Mot de passe oublié | ✅ | `/mot-de-passe-oublie` |
| Réinitialiser mot de passe | ✅ | `/reset-password?token=...` |
| Produits | ✅ | `/produits` |
| Catégories | ✅ | `/categories/:slug` |
| Panier | ✅ | `/panier` |
| Commander | ✅ | `/checkout` |
| Favoris | ✅ | `/favoris` |
| À propos | ✅ | `/a-propos` |

---

## 🐛 Troubleshooting rapide

- Failed to fetch: vérifiez MongoDB et .env, puis relancez les deux services
- Email: vérifiez GMAIL_USER/GMAIL_APP_PASSWORD (et spams)
- SMS: vérifiez SMS_TO_API_KEY et le format du numéro (+242...)
- Cloudinary: vérifiez CLOUDINARY_* et (si besoin) l’upload preset client
- CORS: vérifiez FRONTEND_URL/CORS_ALLOWED_ORIGINS et que `credentials: "include"` est activé côté front

---

## 📚 Documentation complète

- `RESUME_IMPLEMENTATION_FR.md` - Résumé complet
- `IMPLEMENTATION_GUIDE.md` - Guide détaillé
- `SETUP_INSTRUCTIONS.md` - Instructions complètes
- `CHANGELOG_IMPLEMENTATION.md` - Tous les changements

---

## 🔐 Pour la production (séparée)

- API: `SERVE_CLIENT=false`, Nginx/ CDN sert le front
- Front: `VITE_API_URL=https://api.example.com`
- Voir `ops/nginx.example.conf` et `ops/NGINX-PROD-GUIDE.md`

---

## 🎉 C'est prêt!

Votre application est fonctionnelle avec emails, SMS, Cloudinary, compte utilisateur et API/Front séparés.
