import { initPlasmicLoader } from '@plasmicapp/loader-nextjs';
import { getArticles, getArticleBySlug } from './directus';

// Initialize Plasmic loader
export const PLASMIC = initPlasmicLoader({
  projects: [
    {
      id: process.env.NEXT_PUBLIC_PLASMIC_PROJECT_ID || '',
      token: process.env.NEXT_PUBLIC_PLASMIC_PROJECT_API_TOKEN || '',
    },
  ],
  preview: process.env.NODE_ENV === 'development',
});

// Register custom data fetchers for Directus content
// This allows Plasmic to fetch data from Directus
PLASMIC.registerDataProvider({
  name: 'directus-articles',
  displayName: 'Directus Articles',
  credentials: {},
  async fetchData() {
    const articles = await getArticles();
    return articles;
  },
});

PLASMIC.registerDataProvider({
  name: 'directus-article',
  displayName: 'Directus Article by Slug',
  credentials: {},
  params: [
    {
      name: 'slug',
      type: 'string',
      displayName: 'Article Slug',
    },
  ],
  async fetchData({ params }) {
    const slug = params?.slug as string;
    if (!slug) return null;
    const article = await getArticleBySlug(slug);
    return article;
  },
});
