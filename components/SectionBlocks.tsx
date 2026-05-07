import Link from 'next/link';
import NewsCard from './NewsCard';
import TournamentCarousel from './TournamentCarousel';

interface BlockProps {
  block: any;
  index: number;
  locale: string;
  parentEntryUid?: string;
  parentContentType?: string;
}

const KNOWN_BLOCK_TYPES = [
  'featured_news',
  'rankings_module',
  'head2head_module',
  'featured_tournaments',
  'app_download',
] as const;

type BlockType = (typeof KNOWN_BLOCK_TYPES)[number];

/**
 * Contentstack SDK v3 returns modular blocks in one of two shapes:
 *   Flat:   { uid: 'featured_news', heading: '...', articles: [...] }
 *   Nested: { featured_news: { heading: '...', articles: [...] }, _metadata: {...} }
 *
 * This function resolves whichever shape is present into { blockType, data }.
 */
function resolveBlock(raw: any): { blockType: BlockType; data: any } | null {
  if (!raw || typeof raw !== 'object') return null;

  // Flat format – uid is the block type.
  if (KNOWN_BLOCK_TYPES.includes(raw.uid)) {
    return { blockType: raw.uid as BlockType, data: raw };
  }

  // Nested format – block type is a top-level key.
  for (const type of KNOWN_BLOCK_TYPES) {
    if (raw[type] && typeof raw[type] === 'object') {
      return {
        blockType: type,
        data: raw[type],
      };
    }
  }

  return null;
}

function getSlug(entry: any): string {
  const rawUrl = entry?.url || '';
  // Strip locale-prefixed URLs: /en-us/news/slug or /es/news/slug → slug
  const localeMatch = rawUrl.match(/^\/[a-z]{2}(?:-[a-z0-9]+)?\/news\/(.+)$/i);
  if (localeMatch) return localeMatch[1];
  if (rawUrl.startsWith('/news/')) return rawUrl.replace('/news/', '');
  // Fall back to slugifying the title
  const title = entry?.title || '';
  return title
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

function getPlayerInitials(player: any): string {
  const name: string = player?.title || player?.name || player?.display_name || player?.player_code || '?';
  return name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function resolveReferenceItem(raw: any): any {
  if (!raw || typeof raw !== 'object') return raw;
  return raw.item ?? raw.player ?? raw.article ?? raw.entry ?? raw;
}


/**
 * Block-level data-cslp:  contentType.entryUid.locale.sections.index
 * Tells Visual Builder this element IS the block instance — enables drag/delete/add handles.
 */
function blockCslp(
  parentContentType: string,
  parentEntryUid: string | undefined,
  locale: string,
  blockIndex: number
): Record<string, string> {
  if (!parentEntryUid) return {};
  return {
    'data-cslp': `${parentContentType}.${parentEntryUid}.${locale}.sections.${blockIndex}`,
  };
}

/**
 * Field-level data-cslp:  contentType.entryUid.locale.sections.index.blockType.fieldUid
 * Tells Visual Builder which specific field this text belongs to — enables inline editing.
 */
function fieldCslp(
  parentContentType: string,
  parentEntryUid: string | undefined,
  locale: string,
  blockIndex: number,
  blockType: string,
  field: string
): Record<string, string> {
  if (!parentEntryUid) return {};
  return {
    'data-cslp': `${parentContentType}.${parentEntryUid}.${locale}.sections.${blockIndex}.${blockType}.${field}`,
  };
}

export default function SectionBlocks({
  block,
  index,
  locale,
  parentEntryUid,
  parentContentType = 'homepage',
}: BlockProps) {
  const resolved = resolveBlock(block);
  if (!resolved) return null;

  const { blockType, data } = resolved;
  const bCslp = blockCslp(parentContentType, parentEntryUid, locale, index);
  const fCslp = (field: string) =>
    fieldCslp(parentContentType, parentEntryUid, locale, index, blockType, field);

  switch (blockType) {
    case 'featured_news': {
      const articles: any[] = Array.isArray(data.articles) ? data.articles : [];
      const articlesFieldPath = parentEntryUid
        ? `${parentContentType}.${parentEntryUid}.${locale}.sections.${index}.${blockType}.articles`
        : undefined;
      return (
        <section className="atp-section" id="news" {...bCslp}>
          <div className="atp-section-header">
            <h2 className="atp-section-title" {...fCslp('heading')}>
              {data.heading}
            </h2>
            <Link href="/news" className="atp-section-link">
              All News →
            </Link>
          </div>

          <div
            className="news-grid"
            {...(articlesFieldPath
              ? {
                  'data-cslp': articlesFieldPath,
                  'data-cslp-parent-field': articlesFieldPath,
                }
              : {})}
          >
            {articles.map((article: any, i: number) => {
              const a = resolveReferenceItem(article);
              const itemCslp = articlesFieldPath
                ? { 'data-cslp': `${articlesFieldPath}.${i}` }
                : undefined;
              return (
                <NewsCard
                  key={i}
                  title={a?.title || a?.headline || 'News Article'}
                  summary={a?.summary}
                  imageUrl={a?.hero_image?.url}
                  publishDate={a?.publish_date}
                  url={a?.url || `/news/${getSlug(a)}`}
                  entryUid={a?.uid}
                  locale={locale}
                  cslpAttrs={itemCslp}
                />
              );
            })}
          </div>
        </section>
      );
    }

    case 'rankings_module': {
      const players: any[] = Array.isArray(data.top_players) ? data.top_players : [];
      const playersFieldPath = parentEntryUid
        ? `${parentContentType}.${parentEntryUid}.${locale}.sections.${index}.${blockType}.top_players`
        : undefined;
      return (
        <section className="atp-section" id="rankings" {...bCslp}>
          <div className="atp-section-header">
            <h2 className="atp-section-title" {...fCslp('heading')}>
              {data?.heading}
            </h2>
            <Link href="/#rankings" className="atp-section-link">
              Full Rankings →
            </Link>
          </div>

          <ul
            className="rankings-list"
            {...(playersFieldPath
              ? {
                  'data-cslp': playersFieldPath,
                  'data-cslp-parent-field': playersFieldPath,
                }
              : {})}
          >
            {players.map((player: any, i: number) => {
              const p = resolveReferenceItem(player);
              const name = p?.title || p?.name || p?.display_name || p?.player_code || 'Player';
              const rank = p?.singles_rank ?? p?.ranking_position ?? i + 1;
              const points = p?.singles_points ?? p?.ranking_points ?? p?.points;
              const imageUrl = p?.profile_image?.url || p?.photo?.url;
              const itemCslp = playersFieldPath
                ? { 'data-cslp': `${playersFieldPath}.${i}` }
                : undefined;
              return (
                <li className="rankings-row" key={i} {...(itemCslp ?? {})}>
                  <span className="rankings-rank">{rank}</span>
                  <div className="rankings-avatar">
                    {p?.headshot?.url ? (
                      <img src={p.headshot.url} alt={name} />
                    ) : imageUrl ? (
                      <img src={imageUrl} alt={name} />
                    ) : (
                      getPlayerInitials(p)
                    )}
                  </div>
                  <span className="rankings-name">{name}</span>
                  {data.show_points && points != null && (
                    <span className="rankings-points">
                      {Number(points).toLocaleString()} pts
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      );
    }

    case 'head2head_module': {
      const rawP1 = Array.isArray(data.player_1) ? data.player_1[0] : data.player_1;
      const rawP2 = Array.isArray(data.player_2) ? data.player_2[0] : data.player_2;
      const p1 = rawP1?.item ?? rawP1;
      const p2 = rawP2?.item ?? rawP2;
      const player1Cslp = fCslp('player_1');
      const player2Cslp = fCslp('player_2');
      return (
        <section className="atp-section" id="head2head" {...bCslp}>
          <div className="atp-section-header">
            <h2 className="atp-section-title" {...fCslp('heading')}>
              {data.heading}
            </h2>
          </div>

          <div className="h2h-grid">
            <div className="h2h-player" {...player1Cslp}>
              <div className="h2h-player-avatar">
                {p1?.headshot?.url ? (
                  <img src={p1.headshot.url} alt={p1?.title || p1?.name || 'Player 1'} />
                ) : (
                  getPlayerInitials(p1)
                )}
              </div>
              <div className="h2h-player-name">
                {p1?.title || p1?.name || 'Player 1'}
              </div>
            </div>
            <div className="h2h-vs">VS</div>
            <div className="h2h-player" {...player2Cslp}>
              <div className="h2h-player-avatar">
                {p2?.headshot?.url ? (
                  <img src={p2.headshot.url} alt={p2?.title || p2?.name || 'Player 2'} />
                ) : (
                  getPlayerInitials(p2)
                )}
              </div>
              <div className="h2h-player-name">
                {p2?.title || p2?.name || 'Player 2'}
              </div>
            </div>
          </div>

          {data.enable_player_picker && (
            <p
              style={{
                textAlign: 'center',
                marginTop: 12,
                fontSize: '0.82rem',
                color: 'var(--atp-text-muted)',
              }}
            >
              Select any two players to compare their head-to-head record.
            </p>
          )}
        </section>
      );
    }

    case 'featured_tournaments': {
      const tournaments: any[] = Array.isArray(data.tournaments) ? data.tournaments : [];
      const cslpField = parentEntryUid
        ? `${parentContentType}.${parentEntryUid}.${locale}.sections.${index}.${blockType}.tournaments`
        : undefined;
      const items = tournaments.map((t: any) => resolveReferenceItem(t?.item ?? t));
      return (
        <section className="atp-section" id="tournaments" {...bCslp}>
          <div className="atp-section-header">
            <h2 className="atp-section-title" {...fCslp('heading')}>
              {data.heading}
            </h2>
            <Link href="/#tournaments" className="atp-section-link">
              Full Schedule →
            </Link>
          </div>
          <TournamentCarousel tournaments={items} cslpField={cslpField} />
        </section>
      );
    }

    case 'app_download':
      return (
        <section className="atp-section app-download" {...bCslp}>
          <h2 {...fCslp('heading')}>{data.heading}</h2>
          <p {...fCslp('description')}>{data.description}</p>
          <div className="app-download-buttons">
            {data.apple_app_store_link && (
              <a
                href={data.apple_app_store_link.href || '#'}
                className="app-download-btn"
                {...fCslp('apple_app_store_link')}
              >
                🍎 {data.apple_app_store_link.title || 'App Store'}
              </a>
            )}
            {data.google_play_link && (
              <a
                href={data.google_play_link.href || '#'}
                className="app-download-btn"
                {...fCslp('google_play_link')}
              >
                ▶ {data.google_play_link.title || 'Google Play'}
              </a>
            )}
          </div>
        </section>
      );

    default:
      return null;
  }
}
