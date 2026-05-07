import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getNewsArticleBySlug } from '@/lib/contentstack';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const article = await getNewsArticleBySlug(params.slug, 'en-us');
  if (!article) return { title: 'Article not found – ATP Tour' };
  return {
    title: article.seo?.meta_title || `${article.title} – ATP Tour`,
    description:
      article.seo?.meta_description || article.summary || 'ATP Tour news article.',
    alternates: { canonical: article.seo?.canonical_url },
  };
}

function cslpAttr(entryUid: string | undefined, locale: string, field: string) {
  if (!entryUid) return {};
  return { 'data-cslp': `news_article.${entryUid}.${locale}.${field}` };
}

export default async function NewsArticlePage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { live_preview?: string; [key: string]: string | string[] | undefined };
}) {
  const hash = typeof searchParams?.live_preview === 'string' ? searchParams.live_preview : undefined;
  const article = await getNewsArticleBySlug(params.slug, 'en-us', hash);
  if (!article) notFound();

  const locale = 'en-us';
  const entryUid: string | undefined = article.uid;
  const relatedPlayers: any[] = Array.isArray(article.related_players)
    ? article.related_players
    : [];
  const relatedTournaments: any[] = Array.isArray(article.related_tournaments)
    ? article.related_tournaments
    : [];

  return (
    <>
      {/* Breadcrumb */}
      <nav className="article-breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link> › <Link href="/news">News</Link> › {article.title}
      </nav>

      {/* Article header */}
      <div className="article-header">
        <div className="article-meta">
          {article.publish_date && (
            <span>
              {new Date(article.publish_date).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          )}
          {Array.isArray(article.author) && article.author.length > 0 && (
            <span>
              By{' '}
              {article.author
                .map((a: any) => a?.title || a?.name)
                .filter(Boolean)
                .join(', ')}
            </span>
          )}
        </div>

        <h1 className="article-title" {...cslpAttr(entryUid, locale, 'title')}>
          {article.title}
        </h1>

        {article.summary && (
          <p className="article-summary" {...cslpAttr(entryUid, locale, 'summary')}>
            {article.summary}
          </p>
        )}
      </div>

      {/* Hero image */}
      {article.hero_image?.url && (
        <div className="article-hero">
          <img
            src={article.hero_image.url}
            alt={article.title}
            {...cslpAttr(entryUid, locale, 'hero_image')}
          />
        </div>
      )}

      {/* Two-column layout: body + sidebar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: relatedPlayers.length || relatedTournaments.length
            ? '1fr 280px'
            : '1fr',
          gap: '24px',
          alignItems: 'start',
        }}
      >
        {/* Article body */}
        {article.body ? (
          <div
            className="article-body"
            dangerouslySetInnerHTML={{ __html: article.body }}
            {...cslpAttr(entryUid, locale, 'body')}
          />
        ) : (
          <div className="article-body" style={{ color: 'var(--atp-text-muted)' }}>
            <p>Article body coming soon.</p>
          </div>
        )}

        {/* Sidebar */}
        {(relatedPlayers.length > 0 || relatedTournaments.length > 0) && (
          <aside>
            {relatedPlayers.length > 0 && (
              <div className="article-sidebar-card">
                <h3 className="article-sidebar-title">Related Players</h3>
                <ul className="article-sidebar-list">
                  {relatedPlayers.map((player: any, i: number) => (
                    <li key={i}>
                      {player?.title || player?.name || 'Player'}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {relatedTournaments.length > 0 && (
              <div className="article-sidebar-card">
                <h3 className="article-sidebar-title">Related Tournaments</h3>
                <ul className="article-sidebar-list">
                  {relatedTournaments.map((t: any, i: number) => (
                    <li key={i}>
                      {t?.title || t?.name || 'Tournament'}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        )}
      </div>

      {/* Back link */}
      <div style={{ marginTop: 24 }}>
        <Link
          href="/news"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            color: 'var(--atp-blue)',
            fontWeight: 600,
            fontSize: '0.9rem',
          }}
        >
          ← Back to News
        </Link>
      </div>
    </>
  );
}
