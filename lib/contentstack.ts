import Contentstack from 'contentstack';
import { slugify } from './slug';

const environment = process.env.CONTENTSTACK_ENVIRONMENT;
const branch = process.env.CONTENTSTACK_BRANCH;
const previewToken = process.env.CONTENTSTACK_PREVIEW_TOKEN;
const managementToken = process.env.CONTENTSTACK_MANAGEMENT_TOKEN;

const livePreviewConfig: Record<string, any> = {
  enable: Boolean(previewToken),
  preview_token: previewToken || '',
  host: 'rest-preview.contentstack.com',
};

if (managementToken) {
  livePreviewConfig.management_token = managementToken;
}

const stackConfig: Record<string, any> = {
  api_key: process.env.CONTENTSTACK_API_KEY || '',
  delivery_token: process.env.CONTENTSTACK_DELIVERY_TOKEN || '',
  live_preview: livePreviewConfig,
};

if (environment) stackConfig.environment = environment;
if (branch) stackConfig.branch = branch;

const stack = Contentstack.Stack(stackConfig as any);

const defaultLanguage = 'en-us';

/**
 * Contentstack SDK v3 find() resolves with [entriesArray, count].
 * This helper unwraps both that format and a flat [entry1, ...] format.
 */
async function fetchEntry(query: any) {
  const result = await query.toJSON().find();

  if (!Array.isArray(result) || result.length === 0) return null;

  const firstElement = result[0];

  // result = [[entry1, entry2, ...], count]
  if (Array.isArray(firstElement)) {
    return firstElement[0] ?? null;
  }

  // result = [entry1, entry2, ...] (flat)
  return firstElement ?? null;
}

export async function getHomepage(locale = defaultLanguage, hash?: string) {
  if (hash) {
    (stack as any).livePreviewQuery({ live_preview: hash });
  }
  const query = stack.ContentType('homepage').Query();
  query.language(locale);
  // Use leaf field UIDs — modular-block dot paths are not reliably supported
  // across SDK versions. The SDK will include any matching reference field.
  query.includeReference([
    'hero_banner.primary_cta.page',
    'hero_banner.secondary_cta.page',
    'sections.featured_news.articles',
    'sections.rankings_module.top_players',
    'sections.head2head_module.player_1',
    'sections.head2head_module.player_2',
    'sections.featured_tournaments.tournaments',
  ]);
  return fetchEntry(query);
}

export async function getLatestNewsPage(locale = defaultLanguage) {
  const query = stack.ContentType('latest_news_page').Query();
  query.language(locale);
  query.includeReference(['featured_articles']);
  return fetchEntry(query);
}

export async function getNavigation(locale = defaultLanguage) {
  const query = stack.ContentType('navigation').Query();
  query.language(locale);
  return fetchEntry(query);
}

export async function getLatestArticles(count = 5, locale = defaultLanguage, excludeUrl?: string) {
  const query = stack.ContentType('news_article').Query();
  query.language(locale);
  query.descending('publish_date');
  query.limit(count + 1);
  const result = await query.toJSON().find();
  if (!Array.isArray(result) || result.length === 0) return [];
  const first = result[0];
  const articles: any[] = Array.isArray(first) ? first : result;
  return articles
    .filter((a: any) => !excludeUrl || a.url !== excludeUrl)
    .slice(0, count);
}

export async function getNewsArticles(locale = defaultLanguage) {
  const query = stack.ContentType('news_article').Query();
  query.language(locale);
  query.includeReference(['author', 'related_players', 'related_tournaments', 'topics']);
  query.limit(100);
  const result = await query.toJSON().find();
  // Unwrap [entriesArray, count] → entriesArray
  if (!Array.isArray(result) || result.length === 0) return [];
  const first = result[0];
  return Array.isArray(first) ? first : result;
}

export async function getNewsArticleBySlug(slug: string, locale = defaultLanguage, hash?: string) {
  if (hash) {
    (stack as any).livePreviewQuery({ live_preview: hash });
  }
  // Strip any leading locale/news/ prefix the slug may already contain
  const normalizedSlug = slug
    .replace(/^\//, '')
    .replace(/^[a-z]{2}(?:-[a-z0-9]+)?\/news\//i, '')
    .replace(/^news\//, '');

  const urlValue = `/news/${normalizedSlug}`;
  const query = stack.ContentType('news_article').Query();
  query.language(locale);
  query.where('url', urlValue);
  query.limit(1);
  query.includeReference([
    'author',
    'sidebar.related_players.related_players',
    'sidebar.related_tournaments.related_tournaments',
    'sidebar.news.related_news_section.related_news',
    'sidebar.news.cta.page',
  ]);
  const item = await fetchEntry(query);

  if (item) return item;

  const allArticles = await getNewsArticles(locale);
  const fallbackSlug = slugify(normalizedSlug);
  return (
    allArticles.find((entry: any) => {
      const urlCandidate = (entry.url || '').toString().toLowerCase();
      const titleSlug = slugify(entry.title || '');
      return (
        urlCandidate.includes(`/news/${fallbackSlug}`) ||
        urlCandidate === fallbackSlug ||
        titleSlug === fallbackSlug
      );
    }) || null
  );
}

export async function getNewsArticleSlugs(locale = defaultLanguage): Promise<string[]> {
  const entries = await getNewsArticles(locale);
  return entries
    .filter((entry: any) => Boolean(entry?.url || entry?.title))
    .map((entry: any) => {
      const rawUrl = entry.url || '';
      // Strip locale-prefixed URLs: /en-us/news/slug → slug
      const localeMatch = rawUrl.match(/^\/[a-z]{2}(?:-[a-z0-9]+)?\/news\/(.+)$/i);
      if (localeMatch) return localeMatch[1];
      if (rawUrl.startsWith('/news/')) return rawUrl.replace('/news/', '');
      return slugify(entry.title || rawUrl);
    });
}

/** Build a data-cslp attribute object for Contentstack Visual Builder. */
export function cslp(
  contentType: string,
  entryUid: string | undefined,
  locale: string,
  fieldPath: string
): Record<string, string> {
  if (!entryUid) return {};
  return { 'data-cslp': `${contentType}.${entryUid}.${locale}.${fieldPath}` };
}
