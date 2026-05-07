import { getHomepage } from '@/lib/contentstack';
import HomepageLiveView from '@/components/HomepageLiveView';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const homepage = await getHomepage('en-us');
  return {
    title: homepage?.seo?.meta_title || "ATP Tour – Men's Professional Tennis",
    description:
      homepage?.seo?.meta_description ||
      'Live scores, rankings, player profiles and tournament schedules.',
    alternates: { canonical: homepage?.seo?.canonical_url },
  };
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: { live_preview?: string; [key: string]: string | string[] | undefined };
}) {
  // Pass the preview hash on the initial server render so the first paint
  // already shows draft content when opened from inside the Builder.
  const hash =
    typeof searchParams?.live_preview === 'string'
      ? searchParams.live_preview
      : undefined;

  const homepage = await getHomepage('en-us', hash);

  if (!homepage) {
    return (
      <div style={{ padding: '48px 0', textAlign: 'center' }}>
        <h2>Unable to load homepage content</h2>
        <p>Check your Contentstack configuration.</p>
      </div>
    );
  }

  // HomepageLiveView is a client component that:
  // - renders the initial server-fetched data immediately
  // - subscribes to onEntryChange and re-fetches client-side on every edit
  //   using ContentstackLivePreview.hash so the preview API returns drafts
  return <HomepageLiveView initialData={homepage} locale="en-us" />;
}
