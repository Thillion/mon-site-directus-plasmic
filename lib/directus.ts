import { createDirectus, rest, readItems, readItem } from '@directus/sdk';

// Define your Directus schema types here
interface Article {
  id: number;
  title: string;
  content: string;
  slug: string;
  published_date: string;
  author: string;
}

interface Global {
  title: string;
  description: string;
}

interface Schema {
  articles: Article[];
  global: Global;
}

// Create a Directus client
const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://89.116.229.125:8055';

export const directus = createDirectus<Schema>(directusUrl).with(rest());

// Helper functions for fetching data
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

export async function getArticleBySlug(slug: string) {
  try {
    const articles = await directus.request(
      readItems('articles', {
        filter: {
          slug: {
            _eq: slug,
          },
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

export async function getGlobalData() {
  try {
    const global = await directus.request(
      readItem('global', 1)
    );
    return global;
  } catch (error) {
    console.error('Error fetching global data:', error);
    return null;
  }
}
