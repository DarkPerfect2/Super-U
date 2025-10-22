# Déploiement production séparé (Nginx + API Node)

Ce guide part sur deux domaines distincts:
- Front: https://shop.example.com (sert le build Vite)
- API:   https://api.example.com (reverse proxy vers Node sur 127.0.0.1:5000)

Vous pouvez adapter les noms de domaines et chemins selon votre infra.

---

## 1) Variables d’environnement

Backend (.env.production):

- NODE_ENV=production
- PORT=5000
- SERVE_CLIENT=false
- FRONTEND_URL=https://shop.example.com
- CORS_ALLOWED_ORIGINS=https://shop.example.com
- COOKIE_DOMAIN=.example.com (si cookies cross-site)
- JWT_SECRET=valeur-secrète
- MONGODB_URI=...
- MONGODB_DB_NAME=...
- GMAIL_USER / GMAIL_APP_PASSWORD (optionnel)
- SMS_TO_API_KEY (optionnel)
- CLOUDINARY_* (optionnel)

Frontend (client/.env.production):

- VITE_API_URL=https://api.example.com

Note: dans ce repo, des fichiers *.example sont fournis. Copiez-les et remplissez vos valeurs réelles.

---

## 2) Build et artefacts

- Construire le front: `npm run build` (dossier dist/public généré)
- Servir le front en statique via Nginx (ou uploader sur CDN). Exemple ci-dessous.
- Démarrer l’API Node (process manager conseillé: systemd, pm2, docker, etc.)

---

## 3) Configuration Nginx (exemple)

Un exemple générique existe ici: `ops/nginx.example.conf`.
Copiez-le en `ops/nginx.<votre-env>.conf` et remplacez les domaines/chemins.

Exemple adapté:

```
# --------- FRONT (shop.example.com) ---------
server {
    listen 80;
    server_name shop.example.com;

    root /var/www/shop;           # placer ici le contenu de dist/public
    index index.html;

    location / {
        try_files $uri /index.html;
    }

    location ~* \.(?:js|css|svg|png|jpg|jpeg|gif|ico|woff2?)$ {
        expires 30d;
        add_header Cache-Control "public, max-age=2592000, immutable";
    }
}

# --------- API (api.example.com) ---------
server {
    listen 80;
    server_name api.example.com;

    location / {
        proxy_pass http://127.0.0.1:5000; # API Node locale

        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;

        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

CORS est géré côté Express (voir server/index.ts). Aucun en-tête CORS à ajouter dans Nginx.

---

## 4) HTTPS avec Let’s Encrypt (certbot)

Une fois les DNS pointés vers le serveur:

```
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y certbot python3-certbot-nginx

# Obtenir des certificats et éditer la conf automatiquement
sudo certbot --nginx -d shop.example.com -d api.example.com

# Renouvellement automatique
sudo systemctl status certbot.timer
```

Assurez-vous que vos serveurs Nginx répondent sur 80 avant d’exécuter certbot.

---

## 5) Démarrage de l’API Node

### Option A: systemd (exemple)

```
[Unit]
Description=Super-U API
After=network.target

[Service]
Environment=NODE_ENV=production
EnvironmentFile=/opt/super-u/.env.production
WorkingDirectory=/opt/super-u
ExecStart=/usr/bin/node dist/index.js
Restart=always
RestartSec=5
User=www-data
Group=www-data

[Install]
WantedBy=multi-user.target
```

Commandes:

```
sudo systemctl daemon-reload
sudo systemctl enable super-u.service
sudo systemctl start super-u.service
sudo systemctl status super-u.service
```

### Option B: PM2

```
pm i -g pm2
pm2 start dist/index.js --name super-u
pm2 save
pm2 startup
```

---

## 6) Checklist de vérification

- Front accessible sur https://shop.example.com
- API accessible sur https://api.example.com/health (ou une route /api/*)
- Depuis le front, appels XHR vers https://api.example.com/api/... OK
- CORS OK (préflights 204/200), Authorization et credentials inclus
- Cookies cross-site (si utilisés) posés avec SameSite=None; Secure; domaine conforme

---

## 7) Points d’attention

- Dans `.env.production`: mettez `SERVE_CLIENT=false` pour ne pas servir le build statique via Node.
- Définissez `FRONTEND_URL` et/ou `CORS_ALLOWED_ORIGINS` avec vos domaines exacts en https.
- Dans `client/.env.production`: définissez `VITE_API_URL=https://api.example.com`.
- Re-build du front requis si vous changez VITE_API_URL.
- JWT_SECRET doit être identique entre redéploiements pour éviter d’invalider les sessions.
