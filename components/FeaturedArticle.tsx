'use client';

import { useEffect, useState } from 'react';
import { getArticles } from '@/lib/directus';
import Link from 'next/link';

interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  author?: string;
  published_date: string;
}

interface FeaturedArticleProps {
  className?: string;
  articleSlug?: string; // Si fourni, affiche cet article spécifique, sinon le plus récent
}

/**
 * Composant FeaturedArticle - Affiche un article mis en avant
 *
 * Affiche soit un article spécifique (par slug), soit le plus récent.
 * Parfait pour une hero section ou une mise en avant sur la homepage.
 *
 * @param className - Classes CSS personnalisées
 * @param articleSlug - Slug de l'article à afficher (optionnel, sinon prend le plus récent)
 */
export function FeaturedArticle({
  className = '',
  articleSlug
}: FeaturedArticleProps) {
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchArticle() {
      try {
        setLoading(true);
        const articles = await getArticles();

        let selectedArticle: Article | undefined;

        if (articleSlug) {
          // Chercher l'article par slug
          selectedArticle = articles.find(a => a.slug === articleSlug);
        } else {
          // Prendre le plus récent
          selectedArticle = articles[0];
        }

        if (selectedArticle) {
          setArticle(selectedArticle);
        } else {
          setError(articleSlug ? `Article "${articleSlug}" non trouvé` : 'Aucun article disponible');
        }
      } catch (err) {
        setError('Impossible de charger l\'article');
        console.error('Error fetching article:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchArticle();
  }, [articleSlug]);

  if (loading) {
    return (
      <div className={`featured-article-loading ${className}`}>
        <div className="animate-pulse">
          <div className="h-64 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg"></div>
          <div className="mt-6">
            <div className="h-8 bg-gray-300 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className={`featured-article-error ${className}`}>
        <div className="p-8 bg-red-50 border-2 border-red-200 rounded-lg text-center">
          <p className="text-red-800 text-lg font-semibold">
            {error || 'Article non trouvé'}
          </p>
        </div>
      </div>
    );
  }

  // Extraire le texte du HTML pour l'aperçu
  const getTextPreview = (html: string, maxLength: number = 200): string => {
    const text = html.replace(/<[^>]*>/g, '');
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <div className={`featured-article ${className}`}>
      <article className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 shadow-xl">
        {/* Badge "Featured" */}
        <div className="absolute top-6 left-6 z-10">
          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-yellow-400 text-gray-900 shadow-lg">
            ⭐ Article mis en avant
          </span>
        </div>

        <div className="p-8 md:p-12">
          {/* Metadata */}
          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
            {article.author && (
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                {article.author}
              </span>
            )}

            <time className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {new Date(article.published_date).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </time>
          </div>

          {/* Title */}
          <Link href={`/articles/${article.slug}`}>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 hover:text-blue-600 transition-colors leading-tight">
              {article.title}
            </h1>
          </Link>

          {/* Excerpt or Content Preview */}
          <p className="text-lg text-gray-700 mb-8 leading-relaxed">
            {article.excerpt || getTextPreview(article.content)}
          </p>

          {/* CTA */}
          <Link
            href={`/articles/${article.slug}`}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
          >
            Lire l'article complet
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        {/* Decorative elements */}
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full opacity-20 -mr-32 -mb-32"></div>
        <div className="absolute top-0 left-0 w-48 h-48 bg-gradient-to-br from-yellow-200 to-pink-200 rounded-full opacity-20 -ml-24 -mt-24"></div>
      </article>
    </div>
  );
}
