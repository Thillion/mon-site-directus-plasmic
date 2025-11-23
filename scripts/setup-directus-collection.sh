#!/bin/bash

# Script de configuration automatique de la collection Articles dans Directus
# Usage: ./scripts/setup-directus-collection.sh

set -e

DIRECTUS_URL="http://89.116.229.125:8055"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="admin"

echo "🚀 Configuration de la collection Articles dans Directus"
echo "========================================================="
echo ""

# 1. Authentification
echo "📝 Étape 1/4: Authentification..."
AUTH_RESPONSE=$(curl -s -X POST "$DIRECTUS_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")

ACCESS_TOKEN=$(echo $AUTH_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$ACCESS_TOKEN" ]; then
  echo "❌ Erreur d'authentification. Vérifiez vos credentials."
  echo "Response: $AUTH_RESPONSE"
  exit 1
fi

echo "✅ Authentification réussie"
echo ""

# 2. Créer la collection "articles"
echo "📝 Étape 2/4: Création de la collection 'articles'..."

# Vérifier si la collection existe déjà
EXISTING_COLLECTION=$(curl -s -X GET "$DIRECTUS_URL/collections/articles" \
  -H "Authorization: Bearer $ACCESS_TOKEN" 2>&1)

if echo "$EXISTING_COLLECTION" | grep -q '"collection":"articles"'; then
  echo "⚠️  La collection 'articles' existe déjà. On passe à l'étape suivante."
else
  # Créer la collection
  CREATE_COLLECTION=$(curl -s -X POST "$DIRECTUS_URL/collections" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "collection": "articles",
      "meta": {
        "collection": "articles",
        "icon": "article",
        "note": "Collection pour les articles du blog",
        "display_template": "{{title}}",
        "hidden": false,
        "singleton": false,
        "translations": null,
        "archive_field": "status",
        "archive_value": "archived",
        "unarchive_value": "draft",
        "sort_field": "sort"
      },
      "schema": {
        "name": "articles"
      }
    }')

  echo "✅ Collection 'articles' créée"
fi

echo ""

# 3. Créer les champs
echo "📝 Étape 3/4: Création des champs..."

# Champ: title
echo "  - Création du champ 'title'..."
curl -s -X POST "$DIRECTUS_URL/fields/articles" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "field": "title",
    "type": "string",
    "meta": {
      "interface": "input",
      "options": {
        "placeholder": "Titre de l'\''article"
      },
      "display": "formatted-value",
      "display_options": {},
      "required": true,
      "readonly": false,
      "hidden": false,
      "sort": 1,
      "width": "full",
      "translations": null,
      "note": "Le titre de l'\''article"
    },
    "schema": {
      "name": "title",
      "data_type": "varchar",
      "max_length": 255,
      "is_nullable": false
    }
  }' > /dev/null

# Champ: slug
echo "  - Création du champ 'slug'..."
curl -s -X POST "$DIRECTUS_URL/fields/articles" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "field": "slug",
    "type": "string",
    "meta": {
      "interface": "input",
      "options": {
        "slug": true,
        "placeholder": "url-de-l-article"
      },
      "display": "formatted-value",
      "display_options": {},
      "required": true,
      "readonly": false,
      "hidden": false,
      "sort": 2,
      "width": "full",
      "translations": null,
      "note": "URL slug (unique)"
    },
    "schema": {
      "name": "slug",
      "data_type": "varchar",
      "max_length": 255,
      "is_nullable": false,
      "is_unique": true
    }
  }' > /dev/null

# Champ: content
echo "  - Création du champ 'content'..."
curl -s -X POST "$DIRECTUS_URL/fields/articles" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "field": "content",
    "type": "text",
    "meta": {
      "interface": "input-rich-text-html",
      "options": {
        "toolbar": [
          "bold",
          "italic",
          "underline",
          "h1",
          "h2",
          "h3",
          "numlist",
          "bullist",
          "blockquote",
          "link",
          "media",
          "code",
          "removeformat"
        ]
      },
      "display": "formatted-value",
      "display_options": {},
      "required": false,
      "readonly": false,
      "hidden": false,
      "sort": 3,
      "width": "full",
      "translations": null,
      "note": "Contenu de l'\''article (HTML)"
    },
    "schema": {
      "name": "content",
      "data_type": "text",
      "is_nullable": true
    }
  }' > /dev/null

# Champ: excerpt
echo "  - Création du champ 'excerpt'..."
curl -s -X POST "$DIRECTUS_URL/fields/articles" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "field": "excerpt",
    "type": "text",
    "meta": {
      "interface": "input-multiline",
      "options": {
        "placeholder": "Résumé de l'\''article..."
      },
      "display": "formatted-value",
      "display_options": {},
      "required": false,
      "readonly": false,
      "hidden": false,
      "sort": 4,
      "width": "full",
      "translations": null,
      "note": "Court résumé pour l'\''aperçu"
    },
    "schema": {
      "name": "excerpt",
      "data_type": "text",
      "is_nullable": true
    }
  }' > /dev/null

# Champ: author
echo "  - Création du champ 'author'..."
curl -s -X POST "$DIRECTUS_URL/fields/articles" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "field": "author",
    "type": "string",
    "meta": {
      "interface": "input",
      "options": {
        "placeholder": "Nom de l'\''auteur"
      },
      "display": "formatted-value",
      "display_options": {},
      "required": false,
      "readonly": false,
      "hidden": false,
      "sort": 5,
      "width": "half",
      "translations": null,
      "note": "Auteur de l'\''article"
    },
    "schema": {
      "name": "author",
      "data_type": "varchar",
      "max_length": 255,
      "is_nullable": true
    }
  }' > /dev/null

# Champ: published_date
echo "  - Création du champ 'published_date'..."
curl -s -X POST "$DIRECTUS_URL/fields/articles" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "field": "published_date",
    "type": "timestamp",
    "meta": {
      "interface": "datetime",
      "options": {},
      "display": "datetime",
      "display_options": {
        "relative": true
      },
      "required": false,
      "readonly": false,
      "hidden": false,
      "sort": 6,
      "width": "half",
      "translations": null,
      "note": "Date de publication"
    },
    "schema": {
      "name": "published_date",
      "data_type": "timestamp",
      "is_nullable": true,
      "default_value": "CURRENT_TIMESTAMP"
    }
  }' > /dev/null

# Champ: status
echo "  - Création du champ 'status'..."
curl -s -X POST "$DIRECTUS_URL/fields/articles" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "field": "status",
    "type": "string",
    "meta": {
      "interface": "select-dropdown",
      "options": {
        "choices": [
          {"text": "Brouillon", "value": "draft"},
          {"text": "Publié", "value": "published"},
          {"text": "Archivé", "value": "archived"}
        ]
      },
      "display": "labels",
      "display_options": {
        "choices": [
          {"text": "Brouillon", "value": "draft", "foreground": "#FFFFFF", "background": "#FFA500"},
          {"text": "Publié", "value": "published", "foreground": "#FFFFFF", "background": "#00C897"},
          {"text": "Archivé", "value": "archived", "foreground": "#FFFFFF", "background": "#263238"}
        ],
        "format": false
      },
      "required": true,
      "readonly": false,
      "hidden": false,
      "sort": 7,
      "width": "half",
      "translations": null,
      "note": "Statut de publication"
    },
    "schema": {
      "name": "status",
      "data_type": "varchar",
      "max_length": 20,
      "is_nullable": false,
      "default_value": "draft"
    }
  }' > /dev/null

echo "✅ Tous les champs ont été créés"
echo ""

# 4. Configurer les permissions publiques
echo "📝 Étape 4/4: Configuration des permissions publiques..."

# Récupérer l'ID du rôle Public
PUBLIC_ROLE=$(curl -s -X GET "$DIRECTUS_URL/roles?filter[name][_eq]=Public" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

PUBLIC_ROLE_ID=$(echo $PUBLIC_ROLE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -z "$PUBLIC_ROLE_ID" ]; then
  echo "❌ Impossible de trouver le rôle Public"
  exit 1
fi

# Donner les permissions de lecture
curl -s -X POST "$DIRECTUS_URL/permissions" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"role\": \"$PUBLIC_ROLE_ID\",
    \"collection\": \"articles\",
    \"action\": \"read\",
    \"fields\": [\"*\"],
    \"permissions\": {
      \"status\": {
        \"_eq\": \"published\"
      }
    },
    \"validation\": null
  }" > /dev/null

echo "✅ Permissions publiques configurées (lecture seule des articles publiés)"
echo ""

# 5. Créer des articles de test
echo "📝 Bonus: Création d'articles de test..."

curl -s -X POST "$DIRECTUS_URL/items/articles" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Bienvenue sur notre site",
    "slug": "bienvenue",
    "content": "<h2>Bienvenue !</h2><p>Ceci est votre premier article créé avec Directus et Plasmic.</p><p>Vous pouvez modifier ce contenu dans l'\''interface d'\''administration Directus.</p>",
    "excerpt": "Découvrez notre nouveau site propulsé par Directus et Plasmic",
    "author": "Admin",
    "published_date": "2025-11-23T10:00:00Z",
    "status": "published"
  }' > /dev/null

curl -s -X POST "$DIRECTUS_URL/items/articles" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Guide de démarrage rapide",
    "slug": "guide-demarrage",
    "content": "<h2>Comment utiliser ce système</h2><p>Ce site utilise une stack moderne :</p><ul><li><strong>Directus</strong> pour gérer le contenu</li><li><strong>Plasmic</strong> pour designer l'\''interface</li><li><strong>Next.js</strong> pour le rendu et les performances</li></ul><p>Vous pouvez créer de nouveaux articles directement depuis l'\''interface Directus !</p>",
    "excerpt": "Apprenez à utiliser Directus et Plasmic ensemble",
    "author": "Admin",
    "published_date": "2025-11-23T11:00:00Z",
    "status": "published"
  }' > /dev/null

curl -s -X POST "$DIRECTUS_URL/items/articles" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Article en brouillon",
    "slug": "article-brouillon",
    "content": "<p>Cet article est en brouillon et ne sera pas visible publiquement.</p>",
    "excerpt": "Un exemple d'\''article en brouillon",
    "author": "Admin",
    "published_date": "2025-11-23T12:00:00Z",
    "status": "draft"
  }' > /dev/null

echo "✅ 3 articles de test créés (2 publiés, 1 brouillon)"
echo ""

echo "========================================================="
echo "✨ Configuration terminée avec succès !"
echo ""
echo "📍 Prochaines étapes :"
echo "   1. Accédez à $DIRECTUS_URL/admin"
echo "   2. Allez dans Content → Articles"
echo "   3. Vous verrez 3 articles de test"
echo "   4. Testez l'API : curl $DIRECTUS_URL/items/articles"
echo ""
echo "🎉 Votre collection Articles est prête à l'emploi !"
