# Documentation Technique - Directus + Plasmic + Next.js

Ce dossier `.claude/` contient toute la documentation technique du projet.

## 📚 Fichiers de Documentation

### 1. [claude.md](./claude.md) - Documentation Complète
**816 lignes** - Documentation exhaustive enterprise-grade

**Contenu** :
- Vue d'ensemble de l'architecture
- Installation et configuration détaillée
- Explication de chaque composant et fichier
- Workflow de développement
- Troubleshooting approfondi
- Références et liens utiles

**À consulter pour** :
- Comprendre l'architecture globale
- Configuration initiale
- Développement de nouvelles features
- Résolution de problèmes techniques

---

### 2. [deployment-guide.md](./deployment-guide.md) - Guide de Déploiement
**800+ lignes** - Guide complet du déploiement en production

**Contenu** :
- Checklist pré-déploiement
- Déploiement sur Vercel (CLI + Web Interface)
- Configuration du domaine personnalisé
- Monitoring post-déploiement
- Workflow CI/CD
- Optimisations performance
- Tests avant production

**À consulter pour** :
- Déployer en production
- Configurer le domaine
- Optimiser les performances
- Mettre en place le monitoring

---

### 3. [maintenance-guide.md](./maintenance-guide.md) - Guide de Maintenance
**600+ lignes** - Guide d'exploitation et maintenance

**Contenu** :
- Maintenance quotidienne
- Mises à jour (Directus, Next.js, dépendances)
- Monitoring et alertes
- Sauvegardes automatiques
- Scaling (vertical et horizontal)
- Résolution d'incidents courants

**À consulter pour** :
- Maintenir le système en production
- Faire des backups
- Mettre à jour les composants
- Répondre aux incidents

---

## 🚀 Quick Start

### Pour démarrer le développement :

1. Lisez [claude.md](./claude.md) sections "Installation et Configuration"
2. Configurez vos `.env.local` avec les bonnes credentials
3. Lancez `npm run dev`
4. Consultez [claude.md](./claude.md) section "Workflow de Développement"

### Pour déployer en production :

1. Suivez [deployment-guide.md](./deployment-guide.md) étape par étape
2. Vérifiez la checklist pré-déploiement
3. Déployez sur Vercel
4. Configurez le monitoring selon [maintenance-guide.md](./maintenance-guide.md)

### En cas de problème :

1. Consultez la section "Troubleshooting" de [claude.md](./claude.md)
2. Vérifiez les "Incidents Courants" dans [maintenance-guide.md](./maintenance-guide.md)
3. Examinez les logs : `docker service logs directus_directus -f`

---

## 📊 Informations du Projet

### URLs

- **Production** : https://apps.thillion.fr (à configurer)
- **Directus Admin** : http://89.116.229.125:8055/admin
- **Directus API** : http://89.116.229.125:8055
- **Plasmic Studio** : https://studio.plasmic.app
- **GitHub Repository** : https://github.com/Thillion/mon-site-directus-plasmic

### Credentials

#### Plasmic
- **Project ID** : `tVGGkV4yyGYS35ncErQYxR`
- **Project Name** : "CMS starter"
- **API Token** : Voir `.env.local`

#### Directus (Par défaut - À CHANGER EN PRODUCTION)
- **URL** : http://89.116.229.125:8055
- **Admin Email** : admin@example.com
- **Admin Password** : admin
- **Database** : PostgreSQL 16

### Stack Technique

**Backend** :
- Directus 11+ (Headless CMS)
- PostgreSQL 16
- Docker Swarm

**Frontend** :
- Next.js 16 (App Router)
- React 19
- TypeScript 5
- Tailwind CSS 4

**Services** :
- Plasmic (Visual Builder)
- Vercel (Hosting & CDN)
- GitHub (Version Control)

---

## 🔧 Scripts Utiles

### Développement

```bash
# Démarrer en développement
npm run dev

# Build de production
npm run build

# Linter
npm run lint
```

### Directus

```bash
# Vérifier le statut
docker service ps directus_directus

# Voir les logs
docker service logs directus_directus -f

# Redémarrer
docker service update --force directus_directus

# Setup la collection articles (automatique)
./scripts/setup-directus-collection.sh
```

### Backups

```bash
# Backup manuel
/root/scripts/backup-directus.sh

# Lister les backups
ls -lh /root/backups

# Restaurer depuis backup
# Voir maintenance-guide.md section "Restauration"
```

---

## 📝 Conventions de Commit

Suivez ces conventions pour les commits :

```bash
# Features
git commit -m "feat: add article pagination component"

# Fixes
git commit -m "fix: resolve Plasmic data fetching issue"

# Documentation
git commit -m "docs: update deployment guide with new steps"

# Refactoring
git commit -m "refactor: simplify Directus SDK usage"

# Chores
git commit -m "chore: update dependencies"
```

---

## 🐛 Debugging

### Logs Importants

```bash
# Directus logs
docker service logs directus_directus --tail 100

# Vercel logs
# Dashboard Vercel → Deployments → [deployment] → Functions

# Next.js build logs (local)
npm run build
```

### Variables d'Environnement

```bash
# Vérifier les variables
cat .env.local

# Tester avec les bonnes variables
npm run build
```

### Plasmic

```bash
# Vérifier la connexion à Plasmic
curl -H "x-plasmic-api-project-tokens: tVGGkV4yyGYS35ncErQYxR:gpSwtw0U00tH9uJbeSKkqrcNxJSG28HkgPSh7ANmfhi6kgMtA9MPEWzqel8UIAMbMjuuZNYqtVDMW10Iw" \
  "https://api.plasmic.app/api/v1/loader/code/versioning/tVGGkV4yyGYS35ncErQYxR"
```

---

## 🔒 Sécurité

### Secrets à Protéger

⚠️ **NE JAMAIS committer** :
- `.env.local`
- Credentials Directus
- Tokens Plasmic
- Clés API

### Déjà protégés par `.gitignore` :
- `.env*` (sauf `.env.example`)
- `node_modules/`
- `.next/`
- Backups

### Bonnes Pratiques

1. ✅ Utiliser des variables d'environnement
2. ✅ Changer les credentials par défaut en production
3. ✅ Activer HTTPS (Vercel le fait automatiquement)
4. ✅ Limiter les permissions Directus au strict minimum
5. ✅ Faire des backups réguliers

---

## 📞 Support et Communauté

### Documentation Officielle

- **Directus** : https://docs.directus.io
- **Plasmic** : https://docs.plasmic.app
- **Next.js** : https://nextjs.org/docs
- **Vercel** : https://vercel.com/docs

### Forums et Communautés

- **Directus** : https://github.com/directus/directus/discussions
- **Plasmic** : https://forum.plasmic.app
- **Next.js** : https://github.com/vercel/next.js/discussions

### En cas de problème critique

1. Consultez [maintenance-guide.md](./maintenance-guide.md) section "Incidents"
2. Vérifiez les logs
3. Recherchez dans les forums officiels
4. Créez une issue sur GitHub si c'est un bug

---

## 🎯 Roadmap et Améliorations Futures

### À court terme
- [ ] Déployer sur Vercel avec le domaine apps.thillion.fr
- [ ] Créer des articles de contenu dans Directus
- [ ] Designer les pages dans Plasmic Studio
- [ ] Activer le monitoring automatique

### À moyen terme
- [ ] Ajouter l'authentification utilisateur
- [ ] Implémenter la recherche full-text
- [ ] Ajouter des catégories et tags
- [ ] Intégrer Google Analytics

### À long terme
- [ ] Multi-langue (i18n)
- [ ] API GraphQL pour Directus
- [ ] Progressive Web App (PWA)
- [ ] Optimisation SEO avancée

---

**Maintenu par** : Claude Code
**Dernière mise à jour** : 2025-11-23
**Version** : 1.0.0

---

## 📄 Licence

Voir le fichier LICENSE à la racine du projet.
