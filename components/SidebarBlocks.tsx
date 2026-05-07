'use client';

import LatestArticles from './LatestArticles';

const SIDEBAR_BLOCK_TYPES = ['related_players', 'related_tournaments', 'news'] as const;
type SidebarBlockType = (typeof SIDEBAR_BLOCK_TYPES)[number];

function resolveBlock(raw: any): { blockType: SidebarBlockType; data: any } | null {
  if (!raw || typeof raw !== 'object') return null;
  if (SIDEBAR_BLOCK_TYPES.includes(raw.uid)) return { blockType: raw.uid, data: raw };
  for (const type of SIDEBAR_BLOCK_TYPES) {
    if (raw[type] && typeof raw[type] === 'object') return { blockType: type, data: raw[type] };
  }
  return null;
}

function resolveRef(raw: any): any {
  if (!raw) return null;
  const item = Array.isArray(raw) ? raw[0] : raw;
  return item?.item ?? item?.entry ?? item;
}

function blockCslp(entryUid: string | undefined, locale: string, index: number): Record<string, string> {
  if (!entryUid) return {};
  return { 'data-cslp': `news_article.${entryUid}.${locale}.sidebar.${index}` };
}

function fieldCslp(entryUid: string | undefined, locale: string, index: number, blockType: string, field: string): Record<string, string> {
  if (!entryUid) return {};
  return { 'data-cslp': `news_article.${entryUid}.${locale}.sidebar.${index}.${blockType}.${field}` };
}

interface Props {
  blocks: any[];
  latestArticles: any[];
  entryUid?: string;
  locale: string;
}

export default function SidebarBlocks({ blocks, latestArticles, entryUid, locale }: Props) {
  if (!blocks.length) return null;

  const containerCslp = entryUid
    ? { 'data-cslp': `news_article.${entryUid}.${locale}.sidebar` }
    : {};

  return (
    <div className="sidebar-blocks" {...containerCslp}>
      {blocks.map((raw, index) => {
        const resolved = resolveBlock(raw);
        if (!resolved) return null;
        const { blockType, data } = resolved;
        const bCslp = blockCslp(entryUid, locale, index);
        const fCslp = (field: string) => fieldCslp(entryUid, locale, index, blockType, field);

        switch (blockType) {
          case 'related_players': {
            const players: any[] = Array.isArray(data.related_players) ? data.related_players : [];
            if (!players.length) return null;
            return (
              <div key={index} className="article-sidebar-card" {...bCslp}>
                <h3 className="article-sidebar-title" {...fCslp('heading')}>
                  {data.heading || 'Related Players'}
                </h3>
                <ul className="rankings-list">
                  {players.map((raw: any, i: number) => {
                    const p = resolveRef(raw);
                    const name = p?.title || p?.name || p?.display_name || p?.player_code || 'Player';
                    const imageUrl = p?.headshot?.url || p?.profile_image?.url || p?.photo?.url;
                    const initials = name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
                    return (
                      <li
                        key={i}
                        className="rankings-row"
                        {...fieldCslp(entryUid, locale, index, blockType, `related_players.${i}`)}
                      >
                        <div className="rankings-avatar">
                          {imageUrl ? (
                            <img src={imageUrl} alt={name} />
                          ) : (
                            initials
                          )}
                        </div>
                        <span className="rankings-name">{name}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          }

          case 'related_tournaments': {
            const tournaments: any[] = Array.isArray(data.related_tournaments) ? data.related_tournaments : [];
            if (!tournaments.length) return null;
            const items = tournaments.map((raw: any) => resolveRef(raw)).filter(Boolean);
            return (
              <div key={index} className="article-sidebar-card" {...bCslp}>
                <h3 className="article-sidebar-title" {...fCslp('heading')}>
                  {data.heading || 'Related Tournaments'}
                </h3>
                <div
                  className="tc-stack"
                  {...(entryUid ? { 'data-cslp': `news_article.${entryUid}.${locale}.sidebar.${index}.related_tournaments.related_tournaments` } : {})}
                >
                  {items.map((t: any, i: number) => (
                    <a
                      key={i}
                      href={t.overview_link?.href ?? '#'}
                      target="_blank"
                      rel="noreferrer"
                      className="tc-card tc-card-full"
                      {...(entryUid ? { 'data-cslp': `news_article.${entryUid}.${locale}.sidebar.${index}.related_tournaments.related_tournaments.${i}` } : {})}
                    >
                      <div className="tc-badge-wrap">
                        {t.category_badge?.url ? (
                          <img src={t.category_badge.url} alt={t.category_badge?.title || ''} className="tc-badge-img" />
                        ) : (
                          <span className="tc-badge-fallback">ATP {t.category}</span>
                        )}
                      </div>
                      <div className="tc-name">{t.title || t.name}</div>
                      {t.location && <div className="tc-loc">{t.location}</div>}
                    </a>
                  ))}
                </div>
              </div>
            );
          }

          case 'news': {
            const showRelated = data.show_related === true;
            const showMostRecent = data.show_most_recent !== false;
            const newsAmount: number = data.recent_news_section?.news_amount ?? 5;
            const ctaPage = resolveRef(data.cta?.page);
            const ctaHref = ctaPage?.url || undefined;

            const relatedRaw: any[] = Array.isArray(data.related_news_section?.related_news)
              ? data.related_news_section.related_news
              : [];
            const relatedArticles = relatedRaw.map((r: any, i: number) => ({
              ...resolveRef(r),
              cslpAttrs: fieldCslp(entryUid, locale, index, blockType, `related_news_section.related_news.${i}`),
            })).filter((a: any) => a.uid);
            const recentArticles = latestArticles.slice(0, newsAmount);

            return (
              <div key={index} {...bCslp}>
                <LatestArticles
                  heading={data.heading}
                  headingCslp={fCslp('heading')}
                  ctaLabel={data.cta?.label}
                  ctaCslp={fCslp('cta.label')}
                  ctaHref={ctaHref}
                  showRelated={showRelated}
                  showMostRecent={showMostRecent}
                  relatedTabHeading={data.related_news_section?.related_news_heading}
                  relatedTabHeadingCslp={fCslp('related_news_section.related_news_heading')}
                  relatedArticles={relatedArticles}
                  relatedContainerCslp={fCslp('related_news_section.related_news')}
                  recentTabHeading={data.recent_news_section?.recent_news_heading}
                  recentTabHeadingCslp={fCslp('recent_news_section.recent_news_heading')}
                  latestArticles={recentArticles}
                />
              </div>
            );
          }

          default:
            return null;
        }
      })}
    </div>
  );
}
