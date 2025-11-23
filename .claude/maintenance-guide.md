# Guide de Maintenance - Mon Site Directus + Plasmic

## 📋 Table des matières

1. [Maintenance Quotidienne](#maintenance-quotidienne)
2. [Mises à jour](#mises-à-jour)
3. [Monitoring](#monitoring)
4. [Sauvegardes](#sauvegardes)
5. [Scaling](#scaling)
6. [Incidents Courants](#incidents-courants)

---

## Maintenance Quotidienne

### Vérifications de Routine

#### 1. Health Check Automatique

Créez un script de monitoring quotidien `/root/scripts/daily-check.sh` :

```bash
#!/bin/bash

echo "🔍 Daily Health Check - $(date)"
echo "================================"

# 1. Directus Health
echo "1. Checking Directus..."
DIRECTUS_STATUS=$(curl -s http://89.116.229.125:8055/server/health)
if echo "$DIRECTUS_STATUS" | grep -q "ok"; then
  echo "✅ Directus is healthy"
else
  echo "❌ Directus is down!"
  # Envoyer une alerte (email, Slack, etc.)
fi

# 2. Docker Services
echo "2. Checking Docker services..."
docker service ls --format "table {{.Name}}\t{{.Replicas}}\t{{.Image}}"

# 3. Disk Space
echo "3. Checking disk space..."
df -h | grep -E '/$|/var'

# 4. Memory Usage
echo "4. Checking memory..."
free -h

# 5. Vercel Status (via leur API)
echo "5. Checking Vercel deployment..."
curl -s https://apps.thillion.fr > /dev/null && echo "✅ Site accessible" || echo "❌ Site inaccessible"

echo "================================"
```

Ajoutez à votre crontab :
```bash
crontab -e
# Ajouter :
0 9 * * * /root/scripts/daily-check.sh >> /var/log/health-check.log 2>&1
```

#### 2. Logs à Surveiller

**Directus** :
```bash
# Voir les derniers logs
docker service logs directus_directus --tail 100

# Suivre en temps réel
docker service logs directus_directus -f

# Rechercher des erreurs
docker service logs directus_directus --tail 1000 | grep -i error
```

**Système** :
```bash
# Logs système
tail -f /var/log/syslog

# Logs Docker
journalctl -u docker -f
```

---

## Mises à jour

### 1. Mise à jour de Directus

#### Méthode Safe (Zero Downtime)

```bash
# 1. Backup de la base de données AVANT
docker exec $(docker ps -q -f name=directus_postgres) \
  pg_dump -U directus directus > /root/backups/directus-$(date +%Y%m%d).sql

# 2. Mettre à jour l'image
cd /root
nano directus-stack.yml

# Changer:
# image: directus/directus:latest
# Par:
# image: directus/directus:11.0.0  # Version spécifique

# 3. Redéployer
docker stack deploy -c directus-stack.yml directus

# 4. Vérifier
docker service ps directus_directus
curl http://89.116.229.125:8055/server/health

# 5. Rollback si problème
# Revenir à l'ancienne version dans directus-stack.yml
# Et redéployer
```

#### Changelog Directus

Avant chaque mise à jour, consultez :
- https://github.com/directus/directus/releases
- https://docs.directus.io/getting-started/updates

### 2. Mise à jour de Next.js et des Dépendances

```bash
cd /root/mon-site-directus-plasmic

# 1. Vérifier les mises à jour disponibles
npm outdated

# 2. Mettre à jour les dépendances mineures/patch
npm update

# 3. Pour les mises à jour majeures (ATTENTION)
npm install next@latest react@latest react-dom@latest

# 4. Tester localement
npm run build
npm run dev

# 5. Si OK, pousser
git add package.json package-lock.json
git commit -m "Update dependencies"
git push

# Vercel redéploiera automatiquement
```

### 3. Mise à jour de Plasmic

Les mises à jour Plasmic sont généralement automatiques côté Plasmic Studio.

**Pour le SDK** :
```bash
npm install @plasmicapp/loader-nextjs@latest
npm run build
```

---

## Monitoring

### 1. Métriques Importantes

#### Directus / Docker

```bash
# CPU et Mémoire par service
docker stats --no-stream

# Nombre de requêtes (approximatif)
docker service logs directus_directus --since 1h | wc -l

# Taille de la base de données
docker exec $(docker ps -q -f name=directus_postgres) \
  psql -U directus -c "SELECT pg_size_pretty(pg_database_size('directus'));"
```

#### Vercel

Dans le dashboard Vercel :
- **Analytics** → Voir le trafic, temps de réponse
- **Logs** → Erreurs runtime
- **Bandwidth** → Consommation de bande passante

### 2. Alertes

#### Uptime Monitoring (Gratuit)

Utilisez **UptimeRobot** (gratuit) :
1. Allez sur https://uptimerobot.com
2. Ajoutez 2 monitors :
   - HTTP : `https://apps.thillion.fr`
   - HTTP : `http://89.116.229.125:8055/server/health`
3. Configurez les alertes email

#### Logs Monitoring

Pour surveiller les logs Directus en temps réel avec alertes :

```bash
# Script d'alerte /root/scripts/alert-on-error.sh
#!/bin/bash

docker service logs directus_directus -f | while read line; do
  if echo "$line" | grep -iE "(error|critical|fatal)"; then
    echo "[ALERT] $(date): $line" >> /var/log/directus-alerts.log
    # Envoyer notification (ex: via curl vers webhook Slack/Discord)
    # curl -X POST https://hooks.slack.com/... -d "{\"text\":\"$line\"}"
  fi
done
```

Lancer en background :
```bash
nohup /root/scripts/alert-on-error.sh &
```

---

## Sauvegardes

### 1. Backup Automatique de Directus

#### Script de Backup Complet

`/root/scripts/backup-directus.sh` :

```bash
#!/bin/bash

BACKUP_DIR="/root/backups"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

mkdir -p $BACKUP_DIR

echo "🔄 Starting Directus backup - $DATE"

# 1. Backup PostgreSQL
echo "  - Backing up database..."
docker exec $(docker ps -q -f name=directus_postgres) \
  pg_dump -U directus directus | gzip > $BACKUP_DIR/directus_db_$DATE.sql.gz

# 2. Backup uploads (fichiers)
echo "  - Backing up uploads..."
docker run --rm -v directus_directus_uploads:/data -v $BACKUP_DIR:/backup \
  alpine tar czf /backup/directus_uploads_$DATE.tar.gz -C /data .

# 3. Backup extensions
echo "  - Backing up extensions..."
docker run --rm -v directus_directus_extensions:/data -v $BACKUP_DIR:/backup \
  alpine tar czf /backup/directus_extensions_$DATE.tar.gz -C /data .

# 4. Nettoyer les vieux backups (> RETENTION_DAYS)
echo "  - Cleaning old backups..."
find $BACKUP_DIR -name "directus_*" -type f -mtime +$RETENTION_DAYS -delete

# 5. Afficher l'espace disque
echo "  - Disk usage:"
du -sh $BACKUP_DIR

echo "✅ Backup completed: $BACKUP_DIR"
ls -lh $BACKUP_DIR | tail -5
```

#### Automatiser avec Cron

```bash
chmod +x /root/scripts/backup-directus.sh

crontab -e
# Backup quotidien à 2h du matin
0 2 * * * /root/scripts/backup-directus.sh >> /var/log/backup.log 2>&1
```

### 2. Restauration depuis Backup

```bash
# 1. Arrêter Directus
docker service scale directus_directus=0

# 2. Restaurer la base de données
gunzip -c /root/backups/directus_db_YYYYMMDD.sql.gz | \
  docker exec -i $(docker ps -q -f name=directus_postgres) \
  psql -U directus directus

# 3. Restaurer les uploads
docker run --rm -v directus_directus_uploads:/data -v /root/backups:/backup \
  alpine tar xzf /backup/directus_uploads_YYYYMMDD.tar.gz -C /data

# 4. Redémarrer Directus
docker service scale directus_directus=1

# 5. Vérifier
curl http://89.116.229.125:8055/server/health
```

### 3. Backup Hors Site (Recommandé)

**Option 1 : AWS S3**

```bash
# Installer AWS CLI
apt-get install awscli

# Configurer
aws configure

# Script de sync
aws s3 sync /root/backups s3://your-bucket/directus-backups/ --delete
```

**Option 2 : rsync vers un autre serveur**

```bash
rsync -avz /root/backups/ user@backup-server:/backups/directus/
```

---

## Scaling

### 1. Scaling Vertical (Plus de Ressources)

#### Directus

Si Directus est lent, augmentez les ressources :

```yaml
# Dans directus-stack.yml
services:
  directus:
    # ...
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 4G
        reservations:
          cpus: '1.0'
          memory: 2G
```

Redéployer :
```bash
docker stack deploy -c directus-stack.yml directus
```

#### PostgreSQL

Optimiser PostgreSQL :

```bash
# Se connecter au conteneur
docker exec -it $(docker ps -q -f name=directus_postgres) psql -U directus

-- Vérifier les stats
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 10;

-- Vacuum pour libérer de l'espace
VACUUM ANALYZE;
```

### 2. Scaling Horizontal (Plus de Réplicas)

#### Directus Read Replicas

Pour les sites à fort trafic :

```yaml
services:
  directus:
    # ...
    deploy:
      replicas: 3  # 3 instances de Directus
      update_config:
        parallelism: 1
        delay: 10s
```

#### Load Balancer

Docker Swarm fait automatiquement du load balancing entre les réplicas.

Pour un load balancer externe (Nginx) :

```nginx
upstream directus {
    server 89.116.229.125:8055;
    # Ajouter d'autres serveurs si nécessaire
}

server {
    listen 80;
    server_name api.thillion.fr;

    location / {
        proxy_pass http://directus;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 3. Vercel Scaling

Vercel scale automatiquement. Vérifiez vos limites :
- Dashboard Vercel → Settings → Usage
- Si vous dépassez le plan gratuit, considérez un upgrade

---

## Incidents Courants

### 1. Directus ne répond plus

**Symptômes** : 502/504 errors, timeout

**Diagnostic** :
```bash
docker service ps directus_directus
docker service logs directus_directus --tail 100
```

**Solutions** :

a) **Redémarrage simple** :
```bash
docker service update --force directus_directus
```

b) **Out of Memory** :
```bash
# Vérifier la mémoire
docker stats --no-stream

# Augmenter les limites
# Éditer directus-stack.yml
# Redéployer
```

c) **Database lock** :
```bash
# Se connecter à PostgreSQL
docker exec -it $(docker ps -q -f name=directus_postgres) psql -U directus

-- Voir les locks
SELECT * FROM pg_locks WHERE NOT granted;

-- Terminer les requêtes bloquantes (ATTENTION)
SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'idle in transaction';
```

### 2. Vercel Build Fails

**Solutions** :

a) **Plasmic non publié** :
- Aller sur Plasmic Studio
- Publier le projet (bouton "Publish")

b) **Variables d'environnement manquantes** :
- Vercel Dashboard → Settings → Environment Variables
- Vérifier que les 4 variables sont présentes

c) **Erreur TypeScript** :
```bash
# Localement
npm run build

# Corriger les erreurs
# Push
git push
```

### 3. Contenu Directus ne s'affiche pas

**Diagnostic** :
```bash
# Test API directement
curl http://89.116.229.125:8055/items/articles

# Si erreur 403 : Permissions
# Si erreur 404 : Collection n'existe pas
# Si timeout : Directus down
```

**Solutions** :

a) **Problème de permissions** :
- Directus Admin → Settings → Roles & Permissions
- Public role → articles → Read ✓

b) **CORS** :
```yaml
# Dans directus-stack.yml
environment:
  CORS_ENABLED: 'true'
  CORS_ORIGIN: '*'  # ou 'https://apps.thillion.fr'
```

c) **Cache ISR** :
Attendre 60 secondes (durée du revalidate) ou purger :
```bash
# Trigger un nouveau déploiement Vercel
git commit --allow-empty -m "Trigger rebuild"
git push
```

### 4. SSL/HTTPS Issues

**Vercel** :
- Le SSL est automatique
- Vérifier que le domaine est bien configuré
- Attendre jusqu'à 24h pour la première génération du certificat

**Directus** :
Si vous voulez HTTPS sur Directus :
1. Installer Nginx reverse proxy
2. Utiliser Certbot pour Let's Encrypt

---

## Checklist de Maintenance Mensuelle

- [ ] Vérifier l'espace disque : `df -h`
- [ ] Vérifier les backups : `ls -lh /root/backups | tail -10`
- [ ] Vérifier les mises à jour Directus disponibles
- [ ] Vérifier les mises à jour npm : `npm outdated`
- [ ] Examiner les logs pour erreurs récurrentes
- [ ] Vérifier les métriques Vercel Analytics
- [ ] Tester la restauration d'un backup (tous les 3 mois)
- [ ] Auditer les permissions Directus
- [ ] Réviser les variables d'environnement
- [ ] Vérifier la sécurité : `docker scan directus/directus:latest`

---

## Contacts et Ressources

### Support

- **Directus** : https://github.com/directus/directus/discussions
- **Plasmic** : https://forum.plasmic.app
- **Next.js** : https://github.com/vercel/next.js/discussions
- **Vercel** : https://vercel.com/support

### Documentation

- Directus : https://docs.directus.io
- Plasmic : https://docs.plasmic.app
- Next.js : https://nextjs.org/docs
- Docker : https://docs.docker.com

### Logs Importants

- Health checks : `/var/log/health-check.log`
- Backups : `/var/log/backup.log`
- Directus alerts : `/var/log/directus-alerts.log`
- System : `/var/log/syslog`

---

**Dernière mise à jour** : 2025-11-23
**Version** : 1.0.0
