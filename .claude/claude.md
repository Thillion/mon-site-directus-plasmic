# Documentation Complète - Intégration Directus + Plasmic + Next.js + Vercel

## 📋 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture](#architecture)
3. [Installation et Configuration](#installation-et-configuration)
4. [Composants et Fichiers Clés](#composants-et-fichiers-clés)
5. [Workflow de Développement](#workflow-de-développement)
6. [Déploiement](#déploiement)
7. [Troubleshooting](#troubleshooting)
8. [Références](#références)

---

## Vue d'ensemble

Ce projet implémente une stack moderne pour la création de sites web dynamiques avec :

- **Backend** : Directus CMS (headless) sur Docker Swarm
- **Frontend** : Next.js 16 avec App Router
- **UI Builder** : Plasmic (constructeur visuel)
- **Hébergement** : Vercel
- **Version Control** : GitHub

### Avantages de cette stack

✅ **Séparation des préoccupations** : Le contenu (Directus), le design (Plasmic) et le code (Next.js) sont découplés
✅ **Scalabilité** : Docker Swarm pour le backend, Vercel pour le frontend
✅ **Expérience développeur** : Édition visuelle avec Plasmic, APIs REST/GraphQL avec Directus
✅ **Performance** : SSG/ISR avec Next.js, CDN global avec Vercel

---

## Architecture

```
┌────────────────────────────────────────────────────────────┐
│                       USERS                                 │
└─────────────────────┬──────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                  VERCEL CDN                                  │
│           (apps.thillion.fr)                                │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│               NEXT.JS APP (SSG/ISR)                          │
│   ┌──────────────────┐         ┌──────────────────┐         │
│   │  Plasmic Loader  │◄────────┤  Directus SDK    │         │
│   │  (UI Components) │         │  (Content Data)  │         │
│   └────────┬─────────┘         └────────┬─────────┘         │
│            │                             │                   │
└────────────┼─────────────────────────────┼───────────────────┘
             │                             │
             │                             │
    ┌────────▼──────────┐       ┌──────────▼────────────┐
    │  PLASMIC STUDIO   │       │   DIRECTUS CMS        │
    │  (Design System)  │       │   (Docker Swarm)      │
    │  studio.plasmic   │       │   89.116.229.125:8055 │
    └───────────────────┘       └───────────────────────┘
```

### Flux de données

1. **Création de contenu** : Les éditeurs créent du contenu dans Directus
2. **Design UI** : Les designers créent des composants visuels dans Plasmic Studio
3. **Build** : Next.js récupère les données de Directus et les composants de Plasmic
4. **Déploiement** : Vercel déploie automatiquement depuis GitHub
5. **Delivery** : Les utilisateurs accèdent au site via le CDN Vercel

---

## Installation et Configuration

### Prérequis

- Node.js 20+
- npm ou yarn
- Docker (pour Directus)
- Compte GitHub
- Compte Vercel
- Compte Plasmic

### 1. Directus (Backend)

#### Déploiement sur Docker Swarm

Directus est déjà déployé sur le serveur `srv1003913` :

```bash
# Vérifier le statut
docker service ls
docker service ps directus_directus

# Voir les logs
docker service logs directus_directus -f

# Redémarrer si nécessaire
docker service update --force directus_directus
```

**Configuration** :
- URL : `http://89.116.229.125:8055`
- Admin : `admin@example.com` / `admin`
- Database : PostgreSQL 16

#### Stack Directus (directus-stack.yml)

```yaml
version: '3.8'

services:
  directus:
    image: directus/directus:latest
    ports:
      - "8055:8055"
    environment:
      KEY: '255d861b-5ea1-5996-9aa3-922530ec40b1'
      SECRET: 'your-secret-key-change-this-in-production'
      DB_CLIENT: 'postgres'
      DB_HOST: 'postgres'
      DB_PORT: '5432'
      DB_DATABASE: 'directus'
      DB_USER: 'directus'
      DB_PASSWORD: 'directus'
      ADMIN_EMAIL: 'admin@example.com'
      ADMIN_PASSWORD: 'admin'
      PUBLIC_URL: 'http://89.116.229.125:8055'
      CORS_ENABLED: 'true'
      CORS_ORIGIN: 'true'
    volumes:
      - directus_uploads:/directus/uploads
      - directus_extensions:/directus/extensions
    networks:
      - directus_network
    depends_on:
      - postgres

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: 'directus'
      POSTGRES_PASSWORD: 'directus'
      POSTGRES_DB: 'directus'
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - directus_network

networks:
  directus_network:
    driver: overlay

volumes:
  postgres_data:
  directus_uploads:
  directus_extensions:
```

#### Créer une collection dans Directus

1. Accédez à http://89.116.229.125:8055/admin
2. **Settings** → **Data Model** → **Create Collection**
3. Créez la collection "**articles**" :

| Champ | Type | Options |
|-------|------|---------|
| `id` | UUID | Primary Key, Auto-generated |
| `title` | String | Required |
| `content` | WYSIWYG | Rich text editor |
| `slug` | String | Required, Unique |
| `published_date` | DateTime | Default: Now |
| `author` | String | |
| `status` | String | draft/published |

4. **Access Control** : Rendre la collection publique
   - Settings → Access Control → Public Role
   - Activer "Read" pour la collection "articles"

5. Créer des articles de test

### 2. Next.js (Frontend)

#### Installation

```bash
cd /root/mon-site-directus-plasmic
npm install
```

#### Packages installés

```json
{
  "dependencies": {
    "@directus/sdk": "^18.0.3",
    "@plasmicapp/loader-nextjs": "^1.0.445",
    "next": "16.0.3",
    "react": "19.2.0",
    "react-dom": "19.2.0"
  }
}
```

#### Configuration des variables d'environnement

Créez/modifiez `.env.local` :

```bash
# Plasmic Configuration
NEXT_PUBLIC_PLASMIC_PROJECT_ID=tVGGkV4yyGYS35ncErQYxR
NEXT_PUBLIC_PLASMIC_PROJECT_API_TOKEN=gpSwtw0U00tH9uJbeSKkqrcNxJSG28HkgPSh7ANmfhi6kgMtA9MPEWzqel8UIAMbMjuuZNYqtVDMW10Iw
PLASMIC_PREVIEW_SECRET=thillion-plasmic-secret-2025

# Directus Configuration
NEXT_PUBLIC_DIRECTUS_URL=http://89.116.229.125:8055
DIRECTUS_ADMIN_EMAIL=admin@example.com
DIRECTUS_ADMIN_PASSWORD=admin
```

### 3. Plasmic (UI Builder)

#### Étapes de configuration

1. **Créer/Accéder à votre projet** sur https://studio.plasmic.app
   - Project ID déjà configuré : `tVGGkV4yyGYS35ncErQYxR`

2. **Publier votre projet**
   - ⚠️ **IMPORTANT** : Vous devez publier au moins une fois dans Plasmic Studio
   - Cliquez sur le bouton "**Publish**" en haut à droite

3. **Configurer l'App Host**
   - Settings → App host
   - Pour dev local : `http://localhost:3000/plasmic-host`
   - Pour production : `https://apps.thillion.fr/plasmic-host`

4. **Créer des pages**
   - Créez une page d'accueil avec le chemin `/`
   - Créez d'autres pages (ex: `/about`, `/contact`)
   - Utilisez les composants Plasmic pour designer l'UI

### 4. GitHub

#### Repository

Repository créé : https://github.com/Thillion/mon-site-directus-plasmic

```bash
# Pousser des changements
git add .
git commit -m "Your commit message"
git push origin main
```

### 5. Vercel

#### Déploiement

**Option A : Interface Web (Recommandé)**

1. Allez sur https://vercel.com
2. Connectez-vous avec GitHub
3. **Import Project** → sélectionnez `mon-site-directus-plasmic`
4. **Environment Variables** :
   ```
   NEXT_PUBLIC_PLASMIC_PROJECT_ID=tVGGkV4yyGYS35ncErQYxR
   NEXT_PUBLIC_PLASMIC_PROJECT_API_TOKEN=gpSwtw0U00tH9uJbeSKkqrcNxJSG28HkgPSh7ANmfhi6kgMtA9MPEWzqel8UIAMbMjuuZNYqtVDMW10Iw
   PLASMIC_PREVIEW_SECRET=thillion-plasmic-secret-2025
   NEXT_PUBLIC_DIRECTUS_URL=http://89.116.229.125:8055
   ```
5. **Deploy**

**Option B : CLI**

```bash
vercel login
vercel --prod
```

#### Configurer le domaine personnalisé

1. Dans Vercel → Project Settings → Domains
2. Ajouter `apps.thillion.fr`
3. Configurer les DNS chez votre registrar :
   ```
   Type: CNAME
   Name: apps
   Value: cname.vercel-dns.com
   ```

---

## Composants et Fichiers Clés

### Structure du projet

```
mon-site-directus-plasmic/
├── .claude/
│   └── claude.md              # Cette documentation
├── app/
│   ├── [[...catchall]]/
│   │   └── page.tsx          # Route dynamique pour pages Plasmic
│   ├── plasmic-host/
│   │   └── page.tsx          # Page d'édition Plasmic en direct
│   ├── layout.tsx            # Layout racine
│   └── globals.css           # Styles globaux
├── lib/
│   ├── directus.ts           # Client Directus + helpers
│   └── plasmic.ts            # Configuration Plasmic
├── .env.local                # Variables d'environnement (non versionné)
├── .env.example              # Template des variables
├── next.config.ts            # Configuration Next.js
├── package.json              # Dépendances
├── tailwind.config.ts        # Configuration Tailwind
├── tsconfig.json             # Configuration TypeScript
├── vercel.json               # Configuration Vercel
├── README.md                 # Documentation utilisateur
└── SETUP.md                  # Guide de setup rapide
```

### lib/plasmic.ts

**Responsabilité** : Initialiser le loader Plasmic

```typescript
import { initPlasmicLoader } from '@plasmicapp/loader-nextjs/react-server-conditional';

export const PLASMIC = initPlasmicLoader({
  projects: [
    {
      id: process.env.NEXT_PUBLIC_PLASMIC_PROJECT_ID || '',
      token: process.env.NEXT_PUBLIC_PLASMIC_PROJECT_API_TOKEN || '',
    },
  ],
  preview: false, // false pour production
});
```

**Points clés** :
- ✅ Import depuis `/react-server-conditional` pour compatibilité App Router
- ✅ `preview: false` en production pour ne charger que les versions publiées
- ✅ Peut enregistrer des composants React personnalisés avec `PLASMIC.registerComponent()`

### lib/directus.ts

**Responsabilité** : Client Directus et fonctions helper

```typescript
import { createDirectus, rest, readItems, readItem } from '@directus/sdk';

interface Article {
  id: number;
  title: string;
  content: string;
  slug: string;
  published_date: string;
  author: string;
}

interface Schema {
  articles: Article[];
}

const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://89.116.229.125:8055';

export const directus = createDirectus<Schema>(directusUrl).with(rest());

// Récupérer tous les articles
export async function getArticles() {
  try {
    const articles = await directus.request(
      readItems('articles', {
        fields: ['*'],
        sort: ['-published_date'],
      })
    );
    return articles;
  } catch (error) {
    console.error('Error fetching articles:', error);
    return [];
  }
}

// Récupérer un article par son slug
export async function getArticleBySlug(slug: string) {
  try {
    const articles = await directus.request(
      readItems('articles', {
        filter: {
          slug: { _eq: slug },
        },
        limit: 1,
      })
    );
    return articles[0] || null;
  } catch (error) {
    console.error('Error fetching article:', error);
    return null;
  }
}
```

**Points clés** :
- ✅ SDK Directus v18 avec types TypeScript
- ✅ Interface `Schema` pour typage fort
- ✅ Gestion d'erreurs pour robustesse
- ✅ Fonctions réutilisables pour différentes queries

### app/[[...catchall]]/page.tsx

**Responsabilité** : Route catch-all pour toutes les pages Plasmic

```typescript
import { PLASMIC } from '@/lib/plasmic';
import { PlasmicComponent } from '@plasmicapp/loader-nextjs';
import { notFound } from 'next/navigation';

export const revalidate = 60; // ISR : revalider toutes les 60 secondes

// Génération statique des chemins
export async function generateStaticParams() {
  const pages = await PLASMIC.fetchPages();
  return pages.map((page) => ({
    catchall: page.path === '/' ? [] : page.path.substring(1).split('/').filter(Boolean),
  }));
}

// Composant de page
export default async function CatchallPage({
  params,
}: {
  params: Promise<{ catchall?: string[] }>;
}) {
  const resolvedParams = await params;
  const catchall = resolvedParams.catchall || [];
  const path = '/' + catchall.join('/');

  const plasmicData = await PLASMIC.maybeFetchComponentData(path);

  if (!plasmicData) {
    notFound();
  }

  const pageMeta = plasmicData.entryCompMetas[0];

  return <PlasmicComponent component={pageMeta.displayName} componentProps={pageMeta.params} />;
}

// Métadonnées SEO
export async function generateMetadata({ params }: { params: Promise<{ catchall?: string[] }> }) {
  const resolvedParams = await params;
  const catchall = resolvedParams.catchall || [];
  const path = '/' + catchall.join('/');

  const plasmicData = await PLASMIC.maybeFetchComponentData(path);

  if (!plasmicData) {
    return { title: 'Page Not Found' };
  }

  const pageMeta = plasmicData.entryCompMetas[0];

  return {
    title: pageMeta.pageMetadata?.title || 'My Site',
    description: pageMeta.pageMetadata?.description,
    openGraph: pageMeta.pageMetadata?.openGraphImageUrl
      ? { images: [pageMeta.pageMetadata.openGraphImageUrl] }
      : undefined,
  };
}
```

**Points clés** :
- ✅ `generateStaticParams()` : SSG de toutes les pages Plasmic
- ✅ `revalidate: 60` : ISR pour mise à jour incrémentale
- ✅ `generateMetadata()` : SEO automatique depuis Plasmic
- ✅ Gestion 404 avec `notFound()`

### app/plasmic-host/page.tsx

**Responsabilité** : Endpoint pour édition en direct dans Plasmic Studio

```typescript
'use client';

import * as React from 'react';
import { PlasmicCanvasHost } from '@plasmicapp/loader-nextjs';

export default function PlasmicHost() {
  return <PlasmicCanvasHost />;
}
```

**Points clés** :
- ✅ `'use client'` : composant client obligatoire
- ✅ `PlasmicCanvasHost` : iframe pour Plasmic Studio
- ✅ Accessible à `/plasmic-host` pour l'édition en direct

---

## Workflow de Développement

### 1. Développement Local

```bash
cd /root/mon-site-directus-plasmic
npm run dev
```

Accédez à :
- App locale : http://localhost:3000
- Plasmic host : http://localhost:3000/plasmic-host

### 2. Créer du contenu dans Directus

1. Accédez à http://89.116.229.125:8055/admin
2. Créez/modifiez des articles
3. Le contenu est immédiatement disponible via l'API

### 3. Designer l'UI dans Plasmic

1. Ouvrez Plasmic Studio : https://studio.plasmic.app
2. Configurez l'App Host : `http://localhost:3000/plasmic-host`
3. Créez vos composants et pages visuellement
4. **Publiez** vos changements (bouton "Publish")

### 4. Utiliser les données Directus dans Plasmic

#### Méthode 1 : Composants Code Personnalisés

Créez un composant React dans `/components/ArticleList.tsx` :

```typescript
'use client';

import { useEffect, useState } from 'react';
import { getArticles } from '@/lib/directus';

interface Article {
  id: number;
  title: string;
  slug: string;
}

export function ArticleList() {
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    getArticles().then(setArticles);
  }, []);

  return (
    <div>
      {articles.map((article) => (
        <div key={article.id}>
          <h2>{article.title}</h2>
          <a href={`/articles/${article.slug}`}>Lire plus</a>
        </div>
      ))}
    </div>
  );
}
```

Enregistrez-le dans `lib/plasmic.ts` :

```typescript
import { ArticleList } from '@/components/ArticleList';

PLASMIC.registerComponent(ArticleList, {
  name: 'ArticleList',
  props: {},
});
```

Utilisez-le ensuite dans Plasmic Studio comme n'importe quel composant.

#### Méthode 2 : Server Components avec Dynamic Routes

Créez une route dynamique `/app/articles/[slug]/page.tsx` :

```typescript
import { getArticleBySlug } from '@/lib/directus';
import { notFound } from 'next/navigation';

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  return (
    <article>
      <h1>{article.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: article.content }} />
      <p>Par {article.author}</p>
    </article>
  );
}
```

### 5. Build et Test

```bash
# Build de production
npm run build

# Tester le build localement
npm start
```

### 6. Déploiement

```bash
# Pousser sur GitHub (déploiement automatique sur Vercel)
git add .
git commit -m "Add new features"
git push origin main
```

Vercel détecte automatiquement le push et redéploie.

---

## Déploiement

### Variables d'environnement Vercel

Dans le dashboard Vercel, configurez :

| Variable | Valeur | Environment |
|----------|--------|-------------|
| `NEXT_PUBLIC_PLASMIC_PROJECT_ID` | `tVGGkV4yyGYS35ncErQYxR` | Production, Preview, Development |
| `NEXT_PUBLIC_PLASMIC_PROJECT_API_TOKEN` | `gpSwtw0U00tH9uJbeSKkqrcNxJSG28HkgPSh7ANmfhi6kgMtA9MPEWzqel8UIAMbMjuuZNYqtVDMW10Iw` | Production, Preview, Development |
| `PLASMIC_PREVIEW_SECRET` | `thillion-plasmic-secret-2025` | Production, Preview, Development |
| `NEXT_PUBLIC_DIRECTUS_URL` | `http://89.116.229.125:8055` | Production, Preview, Development |

### Domaine personnalisé

1. **Vercel** : Settings → Domains → Add `apps.thillion.fr`
2. **DNS** : Configurez un CNAME chez votre registrar
   ```
   apps.thillion.fr -> cname.vercel-dns.com
   ```

### Mise à jour de l'App Host Plasmic

Une fois déployé sur Vercel :

1. Plasmic Studio → Settings → App host
2. Ajoutez : `https://apps.thillion.fr/plasmic-host`

---

## Troubleshooting

### Erreur : "Project has not been published yet"

**Cause** : Le projet Plasmic n'a pas été publié
**Solution** : Dans Plasmic Studio, cliquez sur "**Publish**" en haut à droite

### Erreur : "Attempted to call initPlasmicLoader() from the server"

**Cause** : Mauvais import du loader
**Solution** : Utiliser `/react-server-conditional` dans l'import

```typescript
// ✅ Correct
import { initPlasmicLoader } from '@plasmicapp/loader-nextjs/react-server-conditional';

// ❌ Incorrect
import { initPlasmicLoader } from '@plasmicapp/loader-nextjs';
```

### Erreur : "Cannot fetch articles from Directus"

**Causes possibles** :
1. La collection n'existe pas dans Directus
2. La collection n'est pas publique
3. L'URL Directus est incorrecte

**Solutions** :
1. Créer la collection "articles" dans Directus
2. Settings → Access Control → Public → Read pour "articles"
3. Vérifier `NEXT_PUBLIC_DIRECTUS_URL` dans `.env.local`

### Plasmic Studio ne se connecte pas à /plasmic-host

**Causes possibles** :
1. Le serveur dev n'est pas démarré
2. L'URL de l'App Host est incorrecte
3. CORS bloqué

**Solutions** :
1. `npm run dev` doit être en cours d'exécution
2. Vérifier l'URL : `http://localhost:3000/plasmic-host`
3. Vérifier que Directus a `CORS_ENABLED: 'true'`

### Build Vercel échoue

**Vérifications** :
1. ✅ Toutes les variables d'environnement sont configurées
2. ✅ Le projet Plasmic est publié
3. ✅ Les types TypeScript sont corrects

**Logs** :
Consultez les logs de build dans Vercel → Deployments → [votre déploiement] → Build Logs

### Directus ne répond pas

```bash
# Vérifier le statut
docker service ps directus_directus

# Redémarrer
docker service update --force directus_directus

# Voir les logs
docker service logs directus_directus -f
```

---

## Références

### Documentation officielle

- **Next.js** : https://nextjs.org/docs
- **Plasmic** : https://docs.plasmic.app
  - [Get started with Next.js | Plasmic](https://docs.plasmic.app/learn/nextjs-quickstart/)
  - [Host Plasmic Studio in your app](https://docs.plasmic.app/learn/app-hosting/)
- **Directus** : https://directus.io/docs
  - [Fetch Data from Directus with Next.js](https://directus.io/docs/tutorials/getting-started/fetch-data-from-directus-with-nextjs)
  - [Directus SDK Reference](https://directus.io/docs/getting-started/use-the-api)
- **Vercel** : https://vercel.com/docs

### Packages npm

- **@plasmicapp/loader-nextjs** : https://www.npmjs.com/package/@plasmicapp/loader-nextjs
- **@directus/sdk** : https://www.npmjs.com/package/@directus/sdk

### Repositories GitHub

- **Ce projet** : https://github.com/Thillion/mon-site-directus-plasmic
- **Plasmic Next.js Starter** : https://github.com/plasmicapp/nextjs-starter
- **Directus** : https://github.com/directus/directus

### URLs du projet

- **Directus Admin** : http://89.116.229.125:8055/admin
- **Directus API** : http://89.116.229.125:8055
- **Plasmic Studio** : https://studio.plasmic.app
- **App Production** : https://apps.thillion.fr (à configurer)
- **Repository GitHub** : https://github.com/Thillion/mon-site-directus-plasmic

---

## Changelog

### 2025-11-23 - Initial Setup

- ✅ Docker Swarm initialisé
- ✅ Directus déployé sur Docker Swarm avec PostgreSQL
- ✅ Next.js 16 configuré avec App Router
- ✅ Plasmic loader intégré (`@plasmicapp/loader-nextjs`)
- ✅ Directus SDK intégré (`@directus/sdk`)
- ✅ Repository GitHub créé et code poussé
- ✅ Documentation complète créée
- ⏳ À venir : Déploiement Vercel, configuration domaine

---

**Maintenu par** : Claude Code
**Dernière mise à jour** : 2025-11-23
**Version** : 1.0.0
