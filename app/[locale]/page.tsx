import { notFound } from 'next/navigation';
import { getHomepage } from '@/lib/contentstack';
import HomepageLiveView from '@/components/HomepageLiveView';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  if (params.locale !== 'es') return {};
  const homepage = await getHomepage('es');
  return {
    title: homepage?.seo?.meta_title || "ATP Tour – Men's Professional Tennis",
    description:
      homepage?.seo?.meta_description ||
      'Live scores, rankings, player profiles and tournament schedules.',
    alternates: { canonical: homepage?.seo?.canonical_url },
  };
}

export default async function LocaleHomePage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams: { live_preview?: string; [key: string]: string | string[] | undefined };
}) {
  if (params.locale !== 'es') notFound();

  const hash =
    typeof searchParams?.live_preview === 'string'
      ? searchParams.live_preview
      : undefined;

  const homepage = await getHomepage('es', hash);

  if (!homepage) {
    return (
      <div style={{ padding: '48px 0', textAlign: 'center' }}>
        <h2>Unable to load homepage content</h2>
        <p>Check your Contentstack configuration.</p>
      </div>
    );
  }

  return <HomepageLiveView initialData={homepage} locale="es" />;
}
