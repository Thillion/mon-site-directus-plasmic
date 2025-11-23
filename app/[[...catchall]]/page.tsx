import { PLASMIC } from '@/lib/plasmic';
import { PlasmicComponent } from '@plasmicapp/loader-nextjs';
import { notFound } from 'next/navigation';

export const revalidate = 60; // Revalidate every 60 seconds

// Generate static paths for all Plasmic pages
export async function generateStaticParams() {
  const pages = await PLASMIC.fetchPages();
  return pages.map((page) => ({
    catchall: page.path === '/' ? [] : page.path.substring(1).split('/').filter(Boolean),
  }));
}

// Main page component
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

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ catchall?: string[] }>;
}) {
  const resolvedParams = await params;
  const catchall = resolvedParams.catchall || [];
  const path = '/' + catchall.join('/');

  const plasmicData = await PLASMIC.maybeFetchComponentData(path);

  if (!plasmicData) {
    return {
      title: 'Page Not Found',
    };
  }

  const pageMeta = plasmicData.entryCompMetas[0];

  return {
    title: pageMeta.pageMetadata?.title || 'My Site',
    description: pageMeta.pageMetadata?.description,
    openGraph: pageMeta.pageMetadata?.openGraphImageUrl
      ? {
          images: [pageMeta.pageMetadata.openGraphImageUrl],
        }
      : undefined,
  };
}
