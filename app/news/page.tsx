import Link from 'next/link';
import { getLatestNewsPage, getNewsArticles } from '@/lib/contentstack';
import { localizeUrl } from '@/lib/url';
import NewsCard from '@/components/NewsCard';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

const locale = 'en-us';

function cslpAttr(entryUid: string | undefined, locale: string, field: string) {
  if (!entryUid) return {};
  return { 'data-cslp': `latest_news_page.${entryUid}.${locale}.${field}` };
}

function sortArticles(articles: any[], sortOrder: string): any[] {
  const sorted = [...articles];
  switch (sortOrder) {
    case 'publish_date_asc':
      return sorted.sort((a, b) => new Date(a.publish_date || 0).getTime() - new Date(b.publish_date || 0).getTime());
    case 'title_asc':
      return sorted.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    case 'title_desc':
      return sorted.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
    case 'publish_date_desc':
    default:
      return sorted.sort((a, b) => new Date(b.publish_date || 0).getTime() - new Date(a.publish_date || 0).getTime());
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const newsPage = await getLatestNewsPage(locale);
  return {
    title: newsPage?.seo?.meta_title || `${newsPage?.title || 'Latest News'} – ATP Tour`,
    description: newsPage?.seo?.meta_description || newsPage?.intro || 'ATP Tour latest news.',
    alternates: { canonical: newsPage?.seo?.canonical_url },
  };
}

export default async function LatestNewsPage({
  searchParams,
}: {
  searchParams: { page?: string; [key: string]: string | string[] | undefined };
}) {
  const currentPage = Math.max(1, Number(searchParams?.page) || 1);

  const [newsPage, allArticles] = await Promise.all([
    getLatestNewsPage(locale),
    getNewsArticles(locale),
  ]);

  const entryUid: string | undefined = newsPage?.uid;
  const config = newsPage?.listing_configuration;
  const itemsPerPage: number = config?.items_per_page || 9;
  const sortOrder: string = config?.sort_order || 'publish_date_desc';
  const showFeatured: boolean = config?.show_featured_section === true;

  const featuredArticles: any[] = showFeatured && Array.isArray(newsPage?.featured_articles)
    ? newsPage.featured_articles.filter(Boolean)
    : [];
  const featuredUids = new Set(featuredArticles.map((a: any) => a?.uid).filter(Boolean));

  const sorted = sortArticles(allArticles, sortOrder);
  const listingArticles = showFeatured
    ? sorted.filter((a: any) => !featuredUids.has(a.uid))
    : sorted;

  const totalPages = Math.max(1, Math.ceil(listingArticles.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const pageArticles = listingArticles.slice((safePage - 1) * itemsPerPage, safePage * itemsPerPage);

  return (
    <>
      <div className="news-listing-header">
        <h1 className="news-listing-title" {...cslpAttr(entryUid, locale, 'title')}>
          {newsPage?.title || 'Latest News'}
        </h1>
        {newsPage?.intro && (
          <p className="news-listing-intro" {...cslpAttr(entryUid, locale, 'intro')}>
            {newsPage.intro}
          </p>
        )}
      </div>

      {featuredArticles.length > 0 && (
        <section className="news-listing-section">
          <div className="news-grid" {...cslpAttr(entryUid, locale, 'featured_articles')}>
            {featuredArticles.map((article: any, i: number) => (
              <NewsCard
                key={article?.uid || i}
                title={article?.title || ''}
                summary={article?.summary}
                imageUrl={article?.hero_image?.url}
                publishDate={article?.publish_date}
                url={localizeUrl(article?.url, locale)}
                entryUid={article?.uid}
                locale={locale}
                cslpAttrs={{ 'data-cslp': `latest_news_page.${entryUid}.${locale}.featured_articles.${i}` }}
              />
            ))}
          </div>
        </section>
      )}

      <section className="news-listing-section">
        {featuredArticles.length > 0 && (
          <div className="atp-section-header" style={{ marginBottom: 20 }}>
            <h2 className="atp-section-title">All Articles</h2>
          </div>
        )}
        <div className="news-grid">
          {pageArticles.map((article: any, i: number) => (
            <NewsCard
              key={article?.uid || i}
              title={article?.title || ''}
              summary={article?.summary}
              imageUrl={article?.hero_image?.url}
              publishDate={article?.publish_date}
              url={localizeUrl(article?.url, locale)}
              entryUid={article?.uid}
              locale={locale}
            />
          ))}
        </div>

        {totalPages > 1 && (
          <nav className="news-pagination" aria-label="Pagination">
            {safePage > 1 && (
              <Link href={`/news?page=${safePage - 1}`} className="news-pagination-btn">
                ← Previous
              </Link>
            )}
            <span className="news-pagination-info">Page {safePage} of {totalPages}</span>
            {safePage < totalPages && (
              <Link href={`/news?page=${safePage + 1}`} className="news-pagination-btn">
                Next →
              </Link>
            )}
          </nav>
        )}
      </section>
    </>
  );
}
