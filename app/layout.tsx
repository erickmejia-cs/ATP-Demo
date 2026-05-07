import './globals.css';
import { cookies } from 'next/headers';
import Link from 'next/link';
import type { Metadata } from 'next';
import CSLivePreview from '@/components/CSLivePreview';
import { getNavigation } from '@/lib/contentstack';

export const metadata: Metadata = {
  title: 'ATP Tour',
  description: "Official ATP Tour demo – men's professional tennis.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies();
  const isPreview = Boolean(
    cookieStore.get('__next_preview_data') || cookieStore.get('cs_preview')
  );

  const nav = await getNavigation('en-us');
  const logoUrl: string | undefined = nav?.logo?.url;
  const navUid: string | undefined = nav?.uid;
  const navLocale = 'en-us';
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

              <Link href="/" className="header-logo">
                {logoUrl ? (
                  <img src={logoUrl} alt="ATP Tour" className="header-logo-img" {...navCslp('logo')} />
                ) : (
                  <span className="header-logo-fallback" {...navCslp('logo')}>ATP</span>
                )}
              </Link>

              <nav className="site-nav" aria-label="Main navigation" {...navCslp('nav_items')}>
                {navItems.length > 0 ? (
                  navItems.map((item, i) => {
                    const href = item.external_url ?? item.page?.url ?? '/';
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
                    <Link href="/">Home</Link>
                    <Link href="/news">News</Link>
                    <Link href="/#rankings">Rankings</Link>
                    <Link href="/#tournaments">Tournaments</Link>
                  </>
                )}
              </nav>

              <div className="header-actions">
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
                    <li><Link href="/news">Latest News</Link></li>
                    <li><Link href="/news">Match Reports</Link></li>
                    <li><Link href="/news">Features</Link></li>
                  </ul>
                </div>

                <div className="footer-nav-group">
                  <h3 className="footer-nav-heading">Players</h3>
                  <ul>
                    <li><Link href="/#rankings">Rankings</Link></li>
                    <li><Link href="/#players">Player Profiles</Link></li>
                    <li><Link href="/#head2head">Head to Head</Link></li>
                  </ul>
                </div>

                <div className="footer-nav-group">
                  <h3 className="footer-nav-heading">Tournaments</h3>
                  <ul>
                    <li><Link href="/#tournaments">Schedule</Link></li>
                    <li><Link href="/#tournaments">Results</Link></li>
                    <li><Link href="/#tournaments">Grand Slams</Link></li>
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
