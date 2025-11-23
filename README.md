# Site Web avec Directus, Plasmic, Next.js et Vercel

Ce projet est une intégration complète d'un site web moderne utilisant:
- **Directus** - CMS headless pour la gestion du contenu
- **Plasmic** - Constructeur visuel pour l'UI
- **Next.js** - Framework React pour le frontend
- **Vercel** - Plateforme de déploiement

## 🏗️ Architecture

```
┌─────────────────┐
│   Directus CMS  │ ← Gestion du contenu (Articles, données)
│  Docker Swarm   │
└────────┬────────┘
         │ REST/GraphQL API
         │
         ▼
┌─────────────────┐
│   Next.js App   │ ← Récupère les données via SDK Directus
│   + Plasmic     │ ← UI construite visuellement dans Plasmic
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│     Vercel      │ ← Déploiement automatique depuis GitHub
└─────────────────┘
```

## 🚀 Configuration

### 1. Directus (Backend)

Directus est déjà déployé sur Docker Swarm:
- **URL**: http://89.116.229.125:8055
- **Admin**: admin@example.com / admin
- **Database**: PostgreSQL

#### Accéder à Directus:
```bash
# Vérifier les services
docker service ls

# Voir les logs
docker service logs directus_directus
```

#### Créer votre collection "articles" dans Directus:
1. Accédez à http://89.116.229.125:8055/admin
2. Connectez-vous avec admin@example.com / admin
3. Allez dans Settings → Data Model
4. Créez une nouvelle collection "articles" avec les champs:
   - `title` (String)
   - `content` (WYSIWYG)
   - `slug` (String, unique)
   - `published_date` (DateTime)
   - `author` (String)
5. Créez quelques articles de test

### 2. Plasmic (UI Builder)

1. **Créez un projet Plasmic**:
   - Allez sur https://studio.plasmic.app
   - Créez un nouveau projet
   - Notez votre PROJECT_ID et API_TOKEN

2. **Configurez le fichier `.env.local`**:
   ```bash
   # Remplacez ces valeurs par vos vraies valeurs Plasmic
   NEXT_PUBLIC_PLASMIC_PROJECT_ID=votre-project-id
   NEXT_PUBLIC_PLASMIC_PROJECT_API_TOKEN=votre-api-token
   PLASMIC_PREVIEW_SECRET=un-secret-aleatoire

   # Directus (déjà configuré)
   NEXT_PUBLIC_DIRECTUS_URL=http://89.116.229.125:8055
   ```

3. **Configurez Plasmic Studio**:
   - Dans votre projet Plasmic, allez dans Settings
   - Ajoutez l'URL de votre app: `http://localhost:3000/plasmic-host`
   - Cela permettra à Plasmic de communiquer avec votre app locale

4. **Utilisez les data sources Directus dans Plasmic**:
   - Dans Plasmic Studio, vous verrez deux data sources:
     - "Directus Articles" - Liste tous les articles
     - "Directus Article by Slug" - Récupère un article par son slug
   - Vous pouvez les utiliser dans vos composants Plasmic

### 3. Next.js (Frontend)

Installation et démarrage:
```bash
cd /root/mon-site-directus-plasmic

# Installer les dépendances (déjà fait)
npm install

# Démarrer en mode développement
npm run dev
```

L'application sera accessible sur http://localhost:3000

#### Structure du projet:
```
mon-site-directus-plasmic/
├── app/
│   ├── [[...catchall]]/
│   │   └── page.tsx        # Route dynamique pour toutes les pages Plasmic
│   ├── plasmic-host/
│   │   └── page.tsx        # Page pour l'édition en direct dans Plasmic
│   └── layout.tsx
├── lib/
│   ├── directus.ts         # Client et helpers Directus
│   └── plasmic.ts          # Configuration Plasmic + data providers
├── .env.local              # Variables d'environnement
└── README.md
```

### 4. GitHub

```bash
cd /root/mon-site-directus-plasmic

# Initialiser le repo (déjà fait par create-next-app)
# git init

# Ajouter le remote GitHub
gh repo create mon-site-directus-plasmic --public --source=. --remote=origin

# Pousser le code
git add .
git commit -m "Initial commit: Directus + Plasmic + Next.js integration"
git push -u origin main
```

### 5. Vercel

Déploiement:
```bash
# Se connecter à Vercel
vercel login

# Déployer
vercel --prod

# Ou configurer depuis l'interface Vercel:
# 1. Allez sur https://vercel.com
# 2. Importez votre repo GitHub
# 3. Configurez les variables d'environnement:
#    - NEXT_PUBLIC_PLASMIC_PROJECT_ID
#    - NEXT_PUBLIC_PLASMIC_PROJECT_API_TOKEN
#    - PLASMIC_PREVIEW_SECRET
#    - NEXT_PUBLIC_DIRECTUS_URL
# 4. Déployez !
```

## 📝 Workflow de développement

### Créer une nouvelle page:

1. **Dans Plasmic Studio** (https://studio.plasmic.app):
   - Créez une nouvelle page
   - Concevez votre UI visuellement
   - Utilisez les data sources "Directus Articles" pour afficher le contenu
   - Publiez vos changements

2. **Dans Directus** (http://89.116.229.125:8055):
   - Créez/modifiez vos articles
   - Le contenu est automatiquement disponible via l'API

3. **Dans Next.js**:
   - Les pages sont automatiquement générées grâce au catch-all route
   - Redémarrez le serveur pour voir les nouvelles pages
   - Poussez sur GitHub, Vercel redéploiera automatiquement

### Ajouter de nouvelles collections Directus:

1. Créez la collection dans Directus
2. Mettez à jour `lib/directus.ts`:
   ```typescript
   interface MaCollection {
     id: number;
     champ1: string;
     // ...
   }

   interface Schema {
     articles: Article[];
     ma_collection: MaCollection[];
   }

   export async function getMaCollection() {
     return await directus.request(readItems('ma_collection'));
   }
   ```
3. Ajoutez un data provider dans `lib/plasmic.ts`:
   ```typescript
   PLASMIC.registerDataProvider({
     name: 'directus-ma-collection',
     displayName: 'Ma Collection Directus',
     credentials: {},
     async fetchData() {
       return await getMaCollection();
     },
   });
   ```

## 🔧 Commandes utiles

```bash
# Développement
npm run dev

# Build de production
npm run build

# Démarrer en production
npm start

# Vérifier Directus
docker service ps directus_directus
docker service logs directus_directus -f

# Redémarrer Directus
docker service update --force directus_directus
```

## 📚 Documentation

- [Directus Documentation](https://directus.io/docs)
- [Plasmic Documentation](https://docs.plasmic.app)
- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Documentation](https://vercel.com/docs)

## 🔗 Ressources utilisées

- [Get started with Next.js | Plasmic](https://docs.plasmic.app/learn/nextjs-quickstart/)
- [Fetch Data from Directus with Next.js](https://directus.io/docs/tutorials/getting-started/fetch-data-from-directus-with-nextjs)
- [Plasmic Data & App Integrations](https://www.plasmic.app/integrations)

## 🎯 Prochaines étapes

1. ✅ Directus déployé sur Docker Swarm
2. ✅ Next.js configuré avec Plasmic et Directus
3. ⏳ Créer votre projet Plasmic et ajouter les credentials dans `.env.local`
4. ⏳ Créer la collection "articles" dans Directus
5. ⏳ Pousser sur GitHub
6. ⏳ Déployer sur Vercel

Bon développement ! 🚀
