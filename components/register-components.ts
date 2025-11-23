/**
 * Fichier d'enregistrement des composants personnalisés dans Plasmic
 *
 * Ce fichier permet d'enregistrer vos composants React pour qu'ils soient
 * disponibles dans l'éditeur visuel Plasmic Studio.
 *
 * Usage:
 * 1. Importez vos composants
 * 2. Enregistrez-les avec PLASMIC.registerComponent()
 * 3. Définissez les props éditables dans Plasmic Studio
 */

import { PLASMIC } from '@/lib/plasmic';
import { ArticleList } from './ArticleList';
import { FeaturedArticle } from './FeaturedArticle';

// Enregistrer le composant ArticleList
PLASMIC.registerComponent(ArticleList, {
  name: 'ArticleList',
  displayName: 'Liste d\'Articles',
  description: 'Affiche une liste d\'articles depuis Directus',
  props: {
    className: {
      type: 'string',
      displayName: 'CSS Classes',
      description: 'Classes CSS personnalisées',
      defaultValue: '',
    },
    limit: {
      type: 'number',
      displayName: 'Limite',
      description: 'Nombre maximum d\'articles à afficher',
      defaultValue: 10,
    },
    showExcerpt: {
      type: 'boolean',
      displayName: 'Afficher l\'extrait',
      description: 'Afficher ou non l\'extrait de chaque article',
      defaultValue: true,
    },
  },
  importPath: './components/ArticleList',
});

// Enregistrer le composant FeaturedArticle
PLASMIC.registerComponent(FeaturedArticle, {
  name: 'FeaturedArticle',
  displayName: 'Article Mis en Avant',
  description: 'Affiche un article en hero/featured section',
  props: {
    className: {
      type: 'string',
      displayName: 'CSS Classes',
      description: 'Classes CSS personnalisées',
      defaultValue: '',
    },
    articleSlug: {
      type: 'string',
      displayName: 'Slug de l\'article',
      description: 'Slug de l\'article à afficher (laissez vide pour le plus récent)',
      defaultValue: '',
    },
  },
  importPath: './components/FeaturedArticle',
});

/**
 * Pour utiliser ces composants dans Plasmic Studio:
 *
 * 1. Importez ce fichier dans lib/plasmic.ts:
 *    import './components/register-components';
 *
 * 2. Démarrez le serveur dev:
 *    npm run dev
 *
 * 3. Dans Plasmic Studio, configurez l'App Host:
 *    http://localhost:3000/plasmic-host
 *
 * 4. Les composants apparaîtront dans le panneau "Insert" sous "Custom Components"
 *
 * 5. Glissez-déposez les composants dans vos pages
 *
 * 6. Configurez les props dans le panneau de droite
 */

// Export pour TypeScript
export { ArticleList, FeaturedArticle };
