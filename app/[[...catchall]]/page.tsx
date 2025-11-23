import { PLASMIC } from '@/lib/plasmic';
import { PlasmicComponent } from '@plasmicapp/loader-nextjs';
import { notFound } from 'next/navigation';

export const dynamic = 'force-static';
export const revalidate = 60; // Revalidate every 60 seconds

// Generate static paths for all Plasmic pages
export async function generateStaticParams() {
  const pages = await PLASMIC.fetchPages();
  return pages.map((page) => ({
    catchall: page.path.substring(1).split('/'),
  }));
}

// Fetch Plasmic data for the page
async function getPlasmicData(path: string) {
  const plasmicData = await PLASMIC.maybeFetchComponentData(path);
  if (!plasmicData) {
    return null;
  }
  return plasmicData;
}

// Main page component
export default async function CatchallPage({
  params,
}: {
  params: Promise<{ catchall?: string[] }>;
}) {
  const resolvedParams = await params;
  const path = '/' + (resolvedParams.catchall?.join('/') ?? '');

  const plasmicData = await getPlasmicData(path);

  if (!plasmicData) {
    notFound();
  }

  const { prefetchedData } = plasmicData;

  return (
    <PlasmicComponent
      component={path}
      prefetchedData={prefetchedData}
    />
  );
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ catchall?: string[] }>;
}) {
  const resolvedParams = await params;
  const path = '/' + (resolvedParams.catchall?.join('/') ?? '');

  const plasmicData = await getPlasmicData(path);

  if (!plasmicData) {
    return {
      title: 'Page Not Found',
    };
  }

  const { pageMetadata } = plasmicData;

  return {
    title: pageMetadata?.title || 'My Site',
    description: pageMetadata?.description,
    openGraph: pageMetadata?.openGraphImageUrl
      ? {
          images: [pageMetadata.openGraphImageUrl],
        }
      : undefined,
  };
}
