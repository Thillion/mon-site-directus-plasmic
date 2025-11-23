'use client';

import { useEffect, useState } from 'react';
import { getArticles } from '@/lib/directus';
import Link from 'next/link';

interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  author?: string;
  published_date: string;
  status: string;
}

interface ArticleListProps {
  className?: string;
  limit?: number;
  showExcerpt?: boolean;
}

/**
 * Composant ArticleList - Affiche une liste d'articles depuis Directus
 *
 * Ce composant peut être enregistré dans Plasmic pour être utilisé visuellement.
 * Il récupère automatiquement les articles depuis Directus via l'API.
 *
 * @param className - Classes CSS personnalisées
 * @param limit - Nombre maximum d'articles à afficher
 * @param showExcerpt - Afficher ou non l'extrait de l'article
 */
export function ArticleList({
  className = '',
  limit,
  showExcerpt = true
}: ArticleListProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchArticles() {
      try {
        setLoading(true);
        const data = await getArticles();
        const displayedArticles = limit ? data.slice(0, limit) : data;
        setArticles(displayedArticles);
      } catch (err) {
        setError('Impossible de charger les articles');
        console.error('Error fetching articles:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchArticles();
  }, [limit]);

  if (loading) {
    return (
      <div className={`article-list-loading ${className}`}>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-6 bg-gray-100 rounded-lg">
              <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`article-list-error ${className}`}>
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-red-800">
          <p className="font-semibold">❌ {error}</p>
          <p className="text-sm mt-2">
            Vérifiez que Directus est accessible et que la collection "articles" existe.
          </p>
        </div>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className={`article-list-empty ${className}`}>
        <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg text-gray-600">
          <p className="text-lg">📝 Aucun article pour le moment</p>
          <p className="text-sm mt-2">
            Créez votre premier article dans l'interface Directus.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`article-list ${className}`}>
      <div className="space-y-6">
        {articles.map((article) => (
          <article
            key={article.id}
            className="article-card p-6 bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow"
          >
            <Link href={`/articles/${article.slug}`}>
              <h2 className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
                {article.title}
              </h2>
            </Link>

            {showExcerpt && article.excerpt && (
              <p className="mt-2 text-gray-600 line-clamp-2">
                {article.excerpt}
              </p>
            )}

            <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center space-x-4">
                {article.author && (
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
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

              <Link
                href={`/articles/${article.slug}`}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Lire plus →
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
