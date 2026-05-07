'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import SidebarBlocks from './SidebarBlocks';

interface Props {
  initialArticle: any;
  latestArticles: any[];
  locale: string;
  slug: string;
}

function cslpAttr(entryUid: string | undefined, locale: string, field: string) {
  if (!entryUid) return {};
  return { 'data-cslp': `news_article.${entryUid}.${locale}.${field}` };
}

export default function ArticleLiveView({ initialArticle, latestArticles, locale, slug }: Props) {
  const [article, setArticle] = useState<any>(initialArticle);

  useEffect(() => {
    async function setup() {
      const [{ default: ContentstackLivePreview }, { default: Contentstack }] =
        await Promise.all([
          import('@contentstack/live-preview-utils'),
          import('contentstack'),
        ]);

      ContentstackLivePreview.onEntryChange(async () => {
        try {
          const hash = ContentstackLivePreview.hash;

          const clientStack = (Contentstack as any).Stack({
            api_key: process.env.NEXT_PUBLIC_CONTENTSTACK_API_KEY ?? '',
            delivery_token: process.env.NEXT_PUBLIC_CONTENTSTACK_DELIVERY_TOKEN ?? '',
            environment: process.env.NEXT_PUBLIC_CONTENTSTACK_ENVIRONMENT ?? 'dev',
            branch: process.env.NEXT_PUBLIC_CONTENTSTACK_BRANCH ?? 'main',
            live_preview: {
              enable: true,
              preview_token: process.env.NEXT_PUBLIC_CONTENTSTACK_PREVIEW_TOKEN ?? '',
              host: 'rest-preview.contentstack.com',
            },
          });

          if (hash && hash !== 'init') {
            clientStack.livePreviewQuery({ live_preview: hash });
          }

          const query = clientStack.ContentType('news_article').Query();
          query.language(locale);
          query.where('url', `/${locale}/news/${slug}`);
          query.limit(1);
          query.includeReference([
            'author',
            'sidebar.related_players.related_players',
            'sidebar.related_tournaments.related_tournaments',
            'sidebar.news.related_news_section.related_news',
            'sidebar.news.cta.page',
          ]);

          const result = await query.toJSON().find();
          let entry: any = null;
          if (Array.isArray(result) && result.length > 0) {
            const first = result[0];
            entry = Array.isArray(first) ? first[0] : first;
          }
          if (entry) setArticle(entry);
        } catch (err) {
          console.warn('[ArticleLiveView] live refresh failed:', err);
        }
      });
    }
    setup();
  }, [locale, slug]);

  const entryUid: string | undefined = article.uid;
  const sidebar: any[] = Array.isArray(article.sidebar) ? article.sidebar : [];
  const filteredLatest = latestArticles.filter((a: any) => a.uid !== article.uid);

  return (
    <>
      <nav className="article-breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link> › <Link href={`/${locale}/news`}>News</Link> › {article.title}
      </nav>

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

      <div className="article-layout">
        <div className="article-main">
          {article.hero_image?.url && (
            <div className="article-hero">
              <img
                src={article.hero_image.url}
                alt={article.title}
                {...cslpAttr(entryUid, locale, 'hero_image')}
              />
            </div>
          )}
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
        </div>

        {sidebar.length > 0 && (
          <SidebarBlocks
            blocks={sidebar}
            latestArticles={filteredLatest}
            entryUid={entryUid}
            locale={locale}
          />
        )}
      </div>

      <div style={{ marginTop: 24 }}>
        <Link
          href={`/${locale}/news`}
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
