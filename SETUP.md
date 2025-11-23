# Guide de Configuration Rapide

## 🎯 Ce qui a été fait automatiquement

✅ **Directus déployé sur Docker Swarm**
- URL: http://89.116.229.125:8055
- Admin: admin@example.com / admin
- Base de données PostgreSQL configurée

✅ **Next.js + Plasmic + Directus SDK installés**
- Tous les packages nécessaires installés
- Configuration des data providers pour Directus dans Plasmic
- Routes dynamiques configurées pour Plasmic

✅ **Repository GitHub créé**
- https://github.com/Thillion/mon-site-directus-plasmic
- Code poussé sur la branche main

## ⚡ Ce que VOUS devez faire maintenant

### Étape 1: Créer un projet Plasmic (5 minutes)

1. Allez sur https://studio.plasmic.app
2. Créez un compte ou connectez-vous
3. Créez un nouveau projet (ou utilisez un projet existant)
4. Dans votre projet, cliquez sur le bouton **"Code"** (en haut à droite)
5. Copiez votre **Project ID** et **Public API Token**

### Étape 2: Configurer les variables d'environnement locales

1. Ouvrez le fichier `.env.local` dans `/root/mon-site-directus-plasmic/`
2. Remplacez les valeurs Plasmic par celles que vous venez de copier:
   ```bash
   NEXT_PUBLIC_PLASMIC_PROJECT_ID=votre-vrai-project-id
   NEXT_PUBLIC_PLASMIC_PROJECT_API_TOKEN=votre-vrai-api-token
   PLASMIC_PREVIEW_SECRET=un-secret-aleatoire-de-votre-choix
   ```

### Étape 3: Tester localement

```bash
cd /root/mon-site-directus-plasmic
npm run dev
```

Ouvrez http://localhost:3000 - vous devriez voir votre app Next.js

### Étape 4: Configurer Plasmic Studio

1. Dans Plasmic Studio, allez dans **Settings** (icône engrenage)
2. Dans **App host**, ajoutez: `http://localhost:3000/plasmic-host`
3. Cliquez sur **"Save"**
4. Vous pouvez maintenant éditer votre site en direct dans Plasmic!

### Étape 5: Créer la collection "articles" dans Directus

1. Accédez à http://89.116.229.125:8055/admin
2. Connectez-vous avec: **admin@example.com** / **admin**
3. Allez dans **Settings** → **Data Model**
4. Créez une collection "**articles**" avec ces champs:
   - `title` - String (required)
   - `content` - WYSIWYG
   - `slug` - String (unique, required)
   - `published_date` - DateTime
   - `author` - String
5. Rendez la collection **publique** (Settings → Access Control → Public → Read)
6. Créez 2-3 articles de test

### Étape 6: Déployer sur Vercel

**Option A: Interface Web (Recommandé)**
1. Allez sur https://vercel.com
2. Connectez-vous avec votre compte GitHub
3. Cliquez sur **"Import Project"**
4. Sélectionnez le repository **mon-site-directus-plasmic**
5. Ajoutez les variables d'environnement:
   - `NEXT_PUBLIC_PLASMIC_PROJECT_ID`
   - `NEXT_PUBLIC_PLASMIC_PROJECT_API_TOKEN`
   - `PLASMIC_PREVIEW_SECRET`
   - `NEXT_PUBLIC_DIRECTUS_URL` = `http://89.116.229.125:8055`
6. Cliquez sur **"Deploy"**

**Option B: CLI**
```bash
cd /root/mon-site-directus-plasmic
vercel login
vercel --prod
# Suivez les instructions et configurez les variables d'environnement
```

### Étape 7: Mettre à jour l'App Host dans Plasmic

Une fois déployé sur Vercel:
1. Copiez l'URL de votre déploiement (ex: https://mon-site-directus-plasmic.vercel.app)
2. Dans Plasmic Studio → Settings → App host
3. Ajoutez: `https://votre-url-vercel.app/plasmic-host`
4. Maintenant vous pouvez éditer en production!

## 🎨 Utiliser les données Directus dans Plasmic

Dans Plasmic Studio, vous avez accès à 2 data sources:

1. **"Directus Articles"** - Récupère tous les articles
   - Utilisez-le pour créer une liste d'articles
   - Ajoutez un composant, liez-le à cette data source
   - Affichez les champs: title, content, author, etc.

2. **"Directus Article by Slug"** - Récupère un article spécifique
   - Utilisez-le pour créer une page article détaillée
   - Passez le slug en paramètre

## 📝 Workflow quotidien

1. **Modifier le contenu**: Allez dans Directus, créez/éditez vos articles
2. **Modifier le design**: Allez dans Plasmic Studio, modifiez l'UI
3. **Publier**: Plasmic publie automatiquement, Vercel redéploie automatiquement

## 🔧 Commandes utiles

```bash
# Développement local
cd /root/mon-site-directus-plasmic
npm run dev

# Voir les logs Directus
docker service logs directus_directus -f

# Redémarrer Directus
docker service update --force directus_directus

# Pousser les changements
git add .
git commit -m "Update"
git push
```

## 🆘 Problèmes courants

**Problème**: "Plasmic data source not found"
- Solution: Vérifiez que vous avez bien configuré les variables d'environnement Plasmic dans `.env.local`

**Problème**: "Cannot fetch articles from Directus"
- Solution: Vérifiez que la collection "articles" existe et qu'elle est publique

**Problème**: Vercel build fails
- Solution: Assurez-vous d'avoir configuré TOUTES les variables d'environnement dans Vercel

## 🎯 Ressources

- **Repository GitHub**: https://github.com/Thillion/mon-site-directus-plasmic
- **Directus Admin**: http://89.116.229.125:8055/admin
- **Plasmic Studio**: https://studio.plasmic.app
- **Documentation complète**: Voir README.md

Bon développement ! 🚀
