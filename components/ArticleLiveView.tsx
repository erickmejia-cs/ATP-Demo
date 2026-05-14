'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import SidebarBlocks from './SidebarBlocks';
import { jsonToHTML } from '@contentstack/utils';
import { localizePath } from '@/lib/url';

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

function brightcoveEmbed(node: any): string {
  const attrs = node?.attrs ?? {};
  const videoId = attrs['video-id'] || attrs.videoId || attrs.video_id || '';
  const accountId = attrs['account-id'] || attrs.accountId || attrs.account_id || '';
  const playerId = attrs['player-id'] || attrs.playerId || attrs.player_id || 'default';
  if (!videoId || !accountId) return '';
  return `<div class="brightcove-player-wrapper"><video-js data-account="${accountId}" data-player="${playerId}" data-embed="default" controls="" data-video-id="${videoId}" class="vjs-fluid"></video-js><script src="https://players.brightcove.net/${accountId}/${playerId}_default/index.min.js"></script></div>`;
}

function parseBrightcoveVideo(heroVideo: any): { videoId: string; accountId: string; playerId: string } | null {
  const video = Array.isArray(heroVideo) ? heroVideo[0] : heroVideo;
  if (!video) return null;
  const videoId = video.id || video.videoId || video.video_id || '';
  const accountId = video.account_id || video.accountId || '';
  const playerId = video.player_id || video.playerId || 'default';
  if (!videoId || !accountId) return null;
  return { videoId, accountId, playerId };
}

function BrightcoveHeroPlayer({ videoId, accountId, playerId, cslpProps }: {
  videoId: string;
  accountId: string;
  playerId: string;
  cslpProps: Record<string, string | undefined>;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Set innerHTML via DOM API — React never tracks this div's contents,
    // so re-renders won't wipe the Brightcove player.
    container.innerHTML = `<video-js data-account="${accountId}" data-player="${playerId}" data-embed="default" controls="" data-video-id="${videoId}" class="vjs-fluid"></video-js>`;

    const scriptId = `bc-player-${accountId}-${playerId}`;
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://players.brightcove.net/${accountId}/${playerId}_default/index.min.js`;
      script.async = true;
      document.head.appendChild(script);
    }

    return () => {
      if (container) container.innerHTML = '';
    };
  }, [videoId, accountId, playerId]);

  return (
    <div
      ref={containerRef}
      className="article-hero article-hero--video"
      {...cslpProps}
    />
  );
}

function articleBodyToHTML(articleBody: any): string {
  if (!articleBody) return '';
  try {
    const entry: any = { article_body: JSON.parse(JSON.stringify(articleBody)) };
    jsonToHTML({
      entry,
      paths: ['article_body'],
      renderOption: {
        bltcde9873f79808626: (node: any) => brightcoveEmbed(node),
        bltd74fc75623a2f131: (node: any) => brightcoveEmbed(node),
      },
    });
    return typeof entry.article_body === 'string' ? entry.article_body : '';
  } catch {
    return '';
  }
}

export default function ArticleLiveView({ initialArticle, latestArticles, locale, slug }: Props) {
  const [article, setArticle] = useState<any>(initialArticle);
  const heroVideoRef = useRef<any>(initialArticle.hero_video);

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
          query.where('url', `/news/${slug}`);
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
          if (entry) {
            // hero_video is an extension field the SDK strips from its response.
            // Only overwrite the ref when the fetch returns parseable video data.
            if (parseBrightcoveVideo(entry.hero_video)) {
              heroVideoRef.current = entry.hero_video;
            }
            setArticle(entry);
          }
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
  const bodyHTML = articleBodyToHTML(article.article_body);
  const heroVideo = parseBrightcoveVideo(heroVideoRef.current);

  return (
    <>
      <nav className="article-breadcrumb" aria-label="Breadcrumb">
        <Link href={localizePath('/', locale)}>Home</Link> › <Link href={localizePath('/news', locale)}>News</Link> › {article.title}
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
          {heroVideo ? (
            <BrightcoveHeroPlayer
              videoId={heroVideo.videoId}
              accountId={heroVideo.accountId}
              playerId={heroVideo.playerId}
              cslpProps={cslpAttr(entryUid, locale, 'hero_video')}
            />
          ) : article.hero_image?.url ? (
            <div className="article-hero">
              <img
                src={article.hero_image.url}
                alt={article.title}
                {...cslpAttr(entryUid, locale, 'hero_image')}
              />
            </div>
          ) : null}
          {bodyHTML ? (
            <div
              className="article-body"
              dangerouslySetInnerHTML={{ __html: bodyHTML }}
              {...cslpAttr(entryUid, locale, 'article_body')}
            />
          ) : (
            <div className="article-body" style={{ color: 'var(--atp-text-muted)' }} {...cslpAttr(entryUid, locale, 'article_body')}>
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
          href={localizePath('/news', locale)}
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
