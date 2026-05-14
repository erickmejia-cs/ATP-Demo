import './globals.css';
import { cookies } from 'next/headers';
import { headers } from 'next/headers';
import Link from 'next/link';
import type { Metadata } from 'next';
import CSLivePreview from '@/components/CSLivePreview';
import LocalePicker from '@/components/LocalePicker';
import { getNavigation } from '@/lib/contentstack';
import { localizePath, localizeUrl } from '@/lib/url';

export const metadata: Metadata = {
  title: 'ATP Tour',
  description: "Official ATP Tour demo – men's professional tennis.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies();
  const isPreview = Boolean(
    cookieStore.get('__next_preview_data') || cookieStore.get('cs_preview')
  );

  const locale = headers().get('x-locale') ?? 'en-us';
  const nav = await getNavigation(locale);
  const logoUrl: string | undefined = nav?.logo?.url;
  const navUid: string | undefined = nav?.uid;
  const navLocale = locale;
  const navItems: { title: string; external_url?: string; page?: any }[] =
    Array.isArray(nav?.nav_items) ? nav.nav_items : [];

  function navCslp(fieldPath: string): Record<string, string> {
    if (!navUid) return {};
    return { 'data-cslp': `navigation.${navUid}.${navLocale}.${fieldPath}` };
  }

  return (
    <html lang="en">
      <body>
        <CSLivePreview />
        <div className="site-shell">

          <header className="site-header">
            <div className="header-inner">

              <Link href={localizePath('/', locale)} className="header-logo">
                {logoUrl ? (
                  <img src={logoUrl} alt="ATP Tour" className="header-logo-img" {...navCslp('logo')} />
                ) : (
                  <span className="header-logo-fallback" {...navCslp('logo')}>ATP</span>
                )}
              </Link>

              <nav className="site-nav" aria-label="Main navigation" {...navCslp('nav_items')}>
                {navItems.length > 0 ? (
                  navItems.map((item, i) => {
                    const rawHref = item.external_url ?? item.page?.url ?? '/';
                    const href = item.external_url ? rawHref : localizeUrl(rawHref, locale);
                    const isAbsolute = href.startsWith('http');
                    return (
                      <a
                        key={i}
                        href={href}
                        {...(isAbsolute ? { target: '_blank', rel: 'noreferrer' } : {})}
                        {...navCslp(`nav_items.${i}.title`)}
                      >
                        {item.title}
                      </a>
                    );
                  })
                ) : (
                  // Fallback while nav entry is loading or not configured
                  <>
                    <Link href={localizePath('/', locale)}>Home</Link>
                    <Link href={localizePath('/news', locale)}>News</Link>
                    <Link href={localizePath('/#rankings', locale)}>Rankings</Link>
                    <Link href={localizePath('/#tournaments', locale)}>Tournaments</Link>
                  </>
                )}
              </nav>

              <div className="header-actions">
                <LocalePicker currentLocale={locale} />
                {isPreview && <span className="preview-badge">Preview</span>}
              </div>

            </div>
          </header>

          <main className="page-content">{children}</main>

          <footer className="site-footer">
            <div className="footer-inner">
              <div className="footer-top">
                <div className="footer-brand">
                  {logoUrl ? (
                    <img src={logoUrl} alt="ATP Tour" className="footer-logo-img" />
                  ) : (
                    <div className="footer-brand-name">ATP Tour</div>
                  )}
                  <div className="footer-brand-sub">Men&apos;s Professional Tennis</div>
                </div>

                <div className="footer-nav-group">
                  <h3 className="footer-nav-heading">News</h3>
                  <ul>
                    <li><Link href={localizePath('/news', locale)}>Latest News</Link></li>
                    <li><Link href={localizePath('/news', locale)}>Match Reports</Link></li>
                    <li><Link href={localizePath('/news', locale)}>Features</Link></li>
                  </ul>
                </div>

                <div className="footer-nav-group">
                  <h3 className="footer-nav-heading">Players</h3>
                  <ul>
                    <li><Link href={localizePath('/#rankings', locale)}>Rankings</Link></li>
                    <li><Link href={localizePath('/#players', locale)}>Player Profiles</Link></li>
                    <li><Link href={localizePath('/#head2head', locale)}>Head to Head</Link></li>
                  </ul>
                </div>

                <div className="footer-nav-group">
                  <h3 className="footer-nav-heading">Tournaments</h3>
                  <ul>
                    <li><Link href={localizePath('/#tournaments', locale)}>Schedule</Link></li>
                    <li><Link href={localizePath('/#tournaments', locale)}>Results</Link></li>
                    <li><Link href={localizePath('/#tournaments', locale)}>Grand Slams</Link></li>
                  </ul>
                </div>
              </div>

              <div className="footer-bottom">
                <p style={{ margin: 0 }}>
                  © {new Date().getFullYear()} ATP Tour. Powered by{' '}
                  <Link href="https://www.contentstack.com" style={{ color: 'rgba(255,255,255,0.55)' }}>
                    Contentstack
                  </Link>
                </p>
                <div style={{ display: 'flex', gap: 16 }}>
                  <Link href="#">Privacy Policy</Link>
                  <Link href="#">Terms of Use</Link>
                  <Link href="#">Cookie Settings</Link>
                </div>
              </div>
            </div>
          </footer>

        </div>
      </body>
    </html>
  );
}
