const LOCALE_PREFIX_RE = /^\/[a-z]{2}(-[a-z0-9]+)?(?=\/|$)/i;

/**
 * Prefixes a clean relative path with /es for the Spanish locale.
 * Handles hash anchors: /#rankings + es → /es#rankings
 */
export function localizePath(path: string, locale?: string): string {
  if (locale !== 'es') return path;
  const hashIdx = path.indexOf('#');
  const base = hashIdx >= 0 ? path.slice(0, hashIdx) : path;
  const hash = hashIdx >= 0 ? path.slice(hashIdx) : '';
  const localizedBase = base === '/' || base === '' ? '/es' : `/es${base}`;
  return localizedBase + hash;
}

/**
 * Strips any legacy locale prefix from a CMS URL, then applies the active
 * locale prefix so links stay within the correct locale.
 */
export function localizeUrl(url: string | undefined | null, locale?: string): string {
  if (!url || url === '#') return '#';
  const clean = url.replace(LOCALE_PREFIX_RE, '') || url;
  return localizePath(clean, locale);
}
