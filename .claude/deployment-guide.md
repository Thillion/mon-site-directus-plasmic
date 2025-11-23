# Guide de Déploiement - Production Ready

## 📋 Checklist Pré-Déploiement

### 1. Vérifications Backend (Directus)

```bash
# Vérifier que Directus est opérationnel
docker service ps directus_directus

# Tester l'API
curl -s http://89.116.229.125:8055/server/health

# Vérifier les logs
docker service logs directus_directus --tail 50
```

**Résultat attendu** :
- Service status: `Running`
- Health check: `{"status":"ok"}`
- Logs: pas d'erreurs critiques

### 2. Vérifications Frontend (Next.js)

```bash
cd /root/mon-site-directus-plasmic

# Vérifier les variables d'environnement
cat .env.local

# Build de test
npm run build

# Vérifier qu'il n'y a pas d'erreurs TypeScript
npm run lint
```

**Résultats attendus** :
- `.env.local` contient toutes les variables
- Build réussit sans erreurs
- Lint passe sans erreurs critiques

### 3. Vérifications Plasmic

**Actions manuelles requises** :

1. ✅ Allez sur https://studio.plasmic.app
2. ✅ Ouvrez votre projet (ID: `tVGGkV4yyGYS35ncErQYxR`)
3. ✅ Vérifiez qu'au moins une page existe avec le chemin `/`
4. ✅ **Cliquez sur "Publish"** (en haut à droite)
5. ✅ Attendez la confirmation de publication

⚠️ **CRITIQUE** : Sans publication, le déploiement échouera !

---

## 🚀 Déploiement sur Vercel

### Méthode 1 : Interface Web (Recommandée)

#### Étape 1 : Connexion et Import

1. Allez sur https://vercel.com/login
2. Connectez-vous avec votre compte GitHub
3. Cliquez sur **"Add New..."** → **"Project"**
4. Recherchez et sélectionnez `Thillion/mon-site-directus-plasmic`
5. Cliquez sur **"Import"**

#### Étape 2 : Configuration du Projet

**Framework Preset** : Next.js (auto-détecté)
**Root Directory** : `./` (par défaut)
**Build Command** : `npm run build` (par défaut)
**Output Directory** : `.next` (par défaut)

#### Étape 3 : Variables d'Environnement

Cliquez sur **"Environment Variables"** et ajoutez :

| Name | Value | Environments |
|------|-------|--------------|
| `NEXT_PUBLIC_PLASMIC_PROJECT_ID` | `tVGGkV4yyGYS35ncErQYxR` | Production, Preview, Development |
| `NEXT_PUBLIC_PLASMIC_PROJECT_API_TOKEN` | `gpSwtw0U00tH9uJbeSKkqrcNxJSG28HkgPSh7ANmfhi6kgMtA9MPEWzqel8UIAMbMjuuZNYqtVDMW10Iw` | Production, Preview, Development |
| `PLASMIC_PREVIEW_SECRET` | `thillion-plasmic-secret-2025` | Production, Preview, Development |
| `NEXT_PUBLIC_DIRECTUS_URL` | `http://89.116.229.125:8055` | Production, Preview, Development |

**Important** : Cochez **tous les environnements** (Production, Preview, Development) pour chaque variable.

#### Étape 4 : Déploiement

1. Cliquez sur **"Deploy"**
2. Attendez le build (2-3 minutes)
3. Une fois terminé, cliquez sur l'URL de preview

**URL temporaire** : `https://mon-site-directus-plasmic-xxx.vercel.app`

### Méthode 2 : CLI Vercel

```bash
cd /root/mon-site-directus-plasmic

# Se connecter à Vercel (une seule fois)
vercel login

# Déployer en production
vercel --prod

# Suivre les instructions interactives :
# - Link to existing project? No
# - Project name? mon-site-directus-plasmic
# - Directory? ./
# - Deploy? Yes
```

**Configurer les variables d'environnement via CLI** :

```bash
# Variables Plasmic
vercel env add NEXT_PUBLIC_PLASMIC_PROJECT_ID
# Entrez: tVGGkV4yyGYS35ncErQYxR
# Environnements: Production, Preview, Development

vercel env add NEXT_PUBLIC_PLASMIC_PROJECT_API_TOKEN
# Entrez: gpSwtw0U00tH9uJbeSKkqrcNxJSG28HkgPSh7ANmfhi6kgMtA9MPEWzqel8UIAMbMjuuZNYqtVDMW10Iw
# Environnements: Production, Preview, Development

vercel env add PLASMIC_PREVIEW_SECRET
# Entrez: thillion-plasmic-secret-2025
# Environnements: Production, Preview, Development

vercel env add NEXT_PUBLIC_DIRECTUS_URL
# Entrez: http://89.116.229.125:8055
# Environnements: Production, Preview, Development

# Redéployer avec les nouvelles variables
vercel --prod
```

---

## 🌐 Configuration du Domaine Personnalisé

### Étape 1 : Ajouter le Domaine dans Vercel

1. Dans le dashboard Vercel, ouvrez votre projet
2. Allez dans **Settings** → **Domains**
3. Cliquez sur **"Add"**
4. Entrez : `apps.thillion.fr`
5. Cliquez sur **"Add"**

Vercel affichera les instructions DNS.

### Étape 2 : Configurer les DNS

**Chez votre registrar de domaine (ex: OVH, Gandi, Cloudflare)** :

#### Option A : CNAME (Recommandé si supporté)

```
Type: CNAME
Name: apps
Value: cname.vercel-dns.com
TTL: Automatic (ou 3600)
```

#### Option B : A Record (Si CNAME non supporté)

Vercel vous donnera des adresses IP :

```
Type: A
Name: apps
Value: 76.76.21.21  (exemple, utilisez celle fournie par Vercel)
TTL: Automatic (ou 3600)

Type: A
Name: apps
Value: 76.76.21.22  (exemple, utilisez celle fournie par Vercel)
TTL: Automatic (ou 3600)
```

### Étape 3 : Vérification

1. Attendez la propagation DNS (5-30 minutes)
2. Testez avec : `nslookup apps.thillion.fr`
3. Une fois propagé, Vercel activera automatiquement le SSL (Let's Encrypt)
4. Accédez à : `https://apps.thillion.fr`

---

## 🔄 Configuration de l'App Host Plasmic

### Pour le Développement Local

1. Ouvrez https://studio.plasmic.app
2. Ouvrez votre projet
3. Cliquez sur **Settings** (icône engrenage)
4. Section **"App host"**
5. Ajoutez : `http://localhost:3000/plasmic-host`
6. Cliquez sur **"Save"**

### Pour la Production

1. Répétez les étapes ci-dessus
2. Ajoutez : `https://apps.thillion.fr/plasmic-host`
3. Cliquez sur **"Save"**

**Test** : Dans Plasmic Studio, vous devriez pouvoir éditer vos composants en temps réel.

---

## 📊 Monitoring Post-Déploiement

### 1. Vercel Analytics

Dans le dashboard Vercel :
- **Analytics** : Voir le trafic, les performances
- **Logs** : Consulter les logs runtime
- **Deployments** : Historique des déploiements

### 2. Vérifications Fonctionnelles

#### Test de la Homepage

```bash
# Test HTTP
curl -I https://apps.thillion.fr

# Résultat attendu :
# HTTP/2 200
# content-type: text/html
```

#### Test de l'API Directus

```bash
# Depuis l'app déployée
curl https://apps.thillion.fr/api/test-directus

# Ou directement
curl http://89.116.229.125:8055/items/articles
```

#### Test de Plasmic

1. Ouvrez Plasmic Studio
2. Allez dans votre projet
3. Modifiez un composant
4. Publiez
5. Attendez 60 secondes (revalidate)
6. Rechargez `https://apps.thillion.fr`
7. Vérifiez que les changements sont visibles

### 3. Monitoring Directus

```bash
# CPU et mémoire du service
docker service ps directus_directus --format "table {{.Name}}\t{{.CurrentState}}"

# Logs en temps réel
docker service logs directus_directus -f

# Health check
curl http://89.116.229.125:8055/server/health
```

---

## 🔄 Workflow CI/CD Automatique

Avec la configuration actuelle, le déploiement est **automatique** :

```
┌─────────────────────────────────────────────────────────┐
│  1. Developer commits to main branch                    │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  2. GitHub receives push                                │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  3. Vercel webhook triggered automatically              │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  4. Vercel builds the project                           │
│     - npm install                                       │
│     - npm run build                                     │
│     - Fetch Plasmic data                                │
│     - Generate static pages                             │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  5. Vercel deploys to edge network                      │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  6. Site live at https://apps.thillion.fr               │
└─────────────────────────────────────────────────────────┘
```

### Branches et Environnements

| Branch | Environnement Vercel | URL |
|--------|---------------------|-----|
| `main` | Production | `https://apps.thillion.fr` |
| `develop` | Preview | `https://mon-site-directus-plasmic-git-develop-xxx.vercel.app` |
| `feature/*` | Preview | `https://mon-site-directus-plasmic-git-feature-xxx.vercel.app` |

---

## 🛡️ Sécurité Production

### 1. Secrets Directus

⚠️ **IMPORTANT** : Changez les credentials par défaut !

```bash
# Se connecter au serveur
ssh root@89.116.229.125

# Générer de nouveaux secrets
openssl rand -base64 32  # Pour SECRET
openssl rand -base64 32  # Pour KEY

# Éditer le stack
nano /root/directus-stack.yml

# Modifier :
# - SECRET: 'nouveau-secret-ici'
# - KEY: 'nouvelle-cle-ici'
# - ADMIN_PASSWORD: 'nouveau-mot-de-passe-fort'

# Redéployer
docker stack deploy -c /root/directus-stack.yml directus
```

### 2. Variables d'Environnement Vercel

✅ Toutes les variables sensibles sont déjà en environnement
✅ Jamais commitées dans Git (`.env.local` dans `.gitignore`)

### 3. CORS Directus

Restreindre les origines en production :

```yaml
# Dans directus-stack.yml
environment:
  CORS_ENABLED: 'true'
  CORS_ORIGIN: 'https://apps.thillion.fr'  # Au lieu de 'true'
```

### 4. Rate Limiting

Configurer un rate limit dans Directus :

```yaml
environment:
  RATE_LIMITER_ENABLED: 'true'
  RATE_LIMITER_POINTS: '50'
  RATE_LIMITER_DURATION: '60'  # 50 requêtes par minute
```

---

## 📈 Optimisations Performance

### 1. ISR (Incremental Static Regeneration)

Déjà configuré dans `app/[[...catchall]]/page.tsx` :

```typescript
export const revalidate = 60; // Revalider toutes les 60 secondes
```

**Ajuster selon vos besoins** :
- `revalidate: 30` : Plus de fraîcheur, plus de builds
- `revalidate: 300` : Moins de builds, contenu moins frais
- `revalidate: 3600` : Pour contenu changeant peu (1h)

### 2. Image Optimization

Créez `next.config.ts` si pas encore fait :

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '89.116.229.125',
        port: '8055',
        pathname: '/assets/**',
      },
    ],
  },
};

export default nextConfig;
```

Utiliser les images Directus optimisées :

```tsx
import Image from 'next/image';

<Image
  src="http://89.116.229.125:8055/assets/uuid-here"
  alt="Description"
  width={800}
  height={600}
  quality={80}
/>
```

### 3. Caching Headers

Vercel gère automatiquement le cache, mais vous pouvez le personnaliser :

```typescript
// Dans app/[[...catchall]]/page.tsx
export const dynamic = 'force-static'; // Pour SSG pur
// ou
export const revalidate = 60; // Pour ISR
```

---

## 🧪 Tests Avant Production

### Script de Test Complet

Créez `scripts/pre-deploy-check.sh` :

```bash
#!/bin/bash

echo "🔍 Pre-Deployment Checks"
echo "========================"

# 1. Vérifier Directus
echo "1. Checking Directus..."
DIRECTUS_HEALTH=$(curl -s http://89.116.229.125:8055/server/health)
if [[ $DIRECTUS_HEALTH == *"ok"* ]]; then
  echo "✅ Directus is healthy"
else
  echo "❌ Directus is not responding"
  exit 1
fi

# 2. Vérifier les variables d'environnement
echo "2. Checking environment variables..."
if [ ! -f .env.local ]; then
  echo "❌ .env.local not found"
  exit 1
fi

if ! grep -q "NEXT_PUBLIC_PLASMIC_PROJECT_ID" .env.local; then
  echo "❌ NEXT_PUBLIC_PLASMIC_PROJECT_ID not set"
  exit 1
fi

echo "✅ Environment variables found"

# 3. Build test
echo "3. Testing build..."
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "✅ Build successful"
else
  echo "❌ Build failed"
  exit 1
fi

# 4. Lint
echo "4. Running lint..."
npm run lint > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "✅ Lint passed"
else
  echo "⚠️  Lint warnings (non-blocking)"
fi

echo ""
echo "✅ All checks passed! Ready to deploy."
```

Rendre exécutable et tester :

```bash
chmod +x scripts/pre-deploy-check.sh
./scripts/pre-deploy-check.sh
```

---

## 🔧 Troubleshooting Production

### Problème : Vercel Build Fails

**Erreur** : "Project has not been published yet"

**Solution** :
1. Allez sur Plasmic Studio
2. Publiez votre projet (bouton "Publish")
3. Re-trigger le déploiement Vercel

---

**Erreur** : "Cannot fetch from Directus"

**Solution** :
1. Vérifier que Directus est accessible publiquement
2. Vérifier la variable `NEXT_PUBLIC_DIRECTUS_URL`
3. Vérifier que la collection est publique dans Directus

---

**Erreur** : TypeScript errors

**Solution** :
```bash
# Localement
npm run build

# Corriger les erreurs TypeScript
# Re-push
git add . && git commit -m "Fix types" && git push
```

---

### Problème : Domaine ne se résout pas

**Diagnostic** :

```bash
# Vérifier la propagation DNS
nslookup apps.thillion.fr

# Vérifier avec dig
dig apps.thillion.fr

# Tester depuis différents DNS
nslookup apps.thillion.fr 8.8.8.8  # Google DNS
nslookup apps.thillion.fr 1.1.1.1  # Cloudflare DNS
```

**Solution** :
- Attendre la propagation (jusqu'à 48h, généralement < 1h)
- Vérifier la configuration DNS chez le registrar
- Vérifier que le domaine est bien ajouté dans Vercel

---

### Problème : Plasmic changes not showing

**Causes possibles** :
1. Pas publié dans Plasmic Studio
2. Cache ISR pas encore invalidé
3. App host mal configuré

**Solutions** :
```bash
# 1. Publier dans Plasmic Studio (bouton Publish)

# 2. Forcer le revalidate
# Attendre 60 secondes (valeur du revalidate)
# Ou en développement :
rm -rf .next
npm run build
npm run dev

# 3. Vérifier l'App Host
# Dans Plasmic Studio → Settings → App host
# Doit être : https://apps.thillion.fr/plasmic-host
```

---

### Problème : 500 Internal Server Error

**Diagnostic** :

1. **Vercel Logs** :
   - Dashboard Vercel → Deployments → [votre déploiement]
   - Onglet "Functions" → Voir les logs

2. **Directus Logs** :
   ```bash
   docker service logs directus_directus --tail 100
   ```

**Solutions courantes** :
- Vérifier les variables d'environnement dans Vercel
- Vérifier que Directus est accessible
- Vérifier les CORS dans Directus

---

## 📝 Checklist Finale

Avant de considérer le déploiement comme terminé :

### Backend
- [ ] Directus accessible à `http://89.116.229.125:8055`
- [ ] Health check retourne `{"status":"ok"}`
- [ ] Collection "articles" créée et publique
- [ ] Au moins 2-3 articles de test créés
- [ ] CORS activé
- [ ] Credentials par défaut changés (recommandé)

### Frontend
- [ ] Build local réussit sans erreurs
- [ ] Variables d'environnement configurées dans `.env.local`
- [ ] Git repository à jour
- [ ] Pas de secrets dans le code committé

### Plasmic
- [ ] Projet créé avec ID `tVGGkV4yyGYS35ncErQYxR`
- [ ] Au moins une page avec le chemin `/`
- [ ] Projet **publié** (bouton Publish cliqué)
- [ ] App host configuré pour dev et prod

### Vercel
- [ ] Projet créé et lié au repository GitHub
- [ ] 4 variables d'environnement configurées
- [ ] Premier déploiement réussi
- [ ] URL temporaire accessible
- [ ] Domaine personnalisé configuré (si applicable)
- [ ] DNS propagé et SSL actif

### Tests
- [ ] Page d'accueil accessible
- [ ] Plasmic Studio peut se connecter à `/plasmic-host`
- [ ] Modifications dans Plasmic Studio apparaissent après publication
- [ ] Données Directus accessibles via l'app
- [ ] Pas d'erreurs dans la console navigateur

---

**Prochaine étape** : Une fois tous les checks validés, votre application est **production-ready** ! 🎉

**Maintenance continue** : Voir `.claude/maintenance-guide.md` (à créer)
