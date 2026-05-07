'use client';

import { useState, useEffect } from 'react';
import SectionBlocks from './SectionBlocks';

interface Props {
  initialData: any;
  locale: string;
}

function cslp(
  contentType: string,
  entryUid: string | undefined,
  locale: string,
  fieldPath: string
): Record<string, string> {
  if (!entryUid) return {};
  return { 'data-cslp': `${contentType}.${entryUid}.${locale}.${fieldPath}` };
}

export default function HomepageLiveView({ initialData, locale }: Props) {
  const [homepage, setHomepage] = useState<any>(initialData);

  useEffect(() => {
    async function setupLivePreview() {
      const [{ default: ContentstackLivePreview }, { default: Contentstack }] =
        await Promise.all([
          import('@contentstack/live-preview-utils'),
          import('contentstack'),
        ]);

      ContentstackLivePreview.onEntryChange(async () => {
        try {
          // The SDK wrote the current preview hash onto the stackSdk it was
          // initialized with (via setConfigFromParams). Read it back directly.
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

          const query = clientStack.ContentType('homepage').Query();
          query.language(locale);
          query.includeReference([
            'hero_banner.primary_cta.page',
            'hero_banner.secondary_cta.page',
            'sections.featured_news.articles',
            'sections.rankings_module.top_players',
            'sections.head2head_module.player_1',
            'sections.head2head_module.player_2',
            'sections.featured_tournaments.tournaments',
          ]);

          const result = await query.toJSON().find();
          let entry: any = null;
          if (Array.isArray(result) && result.length > 0) {
            const first = result[0];
            entry = Array.isArray(first) ? first[0] : first;
          }
          if (entry) setHomepage(entry);
        } catch (err) {
          console.warn('[HomepageLiveView] live refresh failed:', err);
        }
      });
    }

    setupLivePreview();
  }, [locale]);

  const { title, hero_banner, sections } = homepage;
  const entryUid: string | undefined = homepage.uid;

  const imageUrl = hero_banner?.background_media?.background_image?.url;
  const imageAlt = hero_banner?.background_media?.image_alt_text || title;
  const headline = hero_banner?.headline;
  const subhead = hero_banner?.subhead;
  const primaryCta = hero_banner?.primary_cta;
  const secondaryCta = hero_banner?.secondary_cta;
  const textTheme = hero_banner?.text_theme || 'light';
  const alignment = hero_banner?.content_alignment || 'left';

  function getCtaHref(cta: any): string {
    const page = Array.isArray(cta?.page) ? cta.page[0] : cta?.page;
    return page?.url || '#';
  }

  const heroBodyClass = [
    'hero-body',
    `hero-align-${alignment}`,
    textTheme === 'dark' ? 'hero-theme-dark' : '',
  ].filter(Boolean).join(' ');

  return (
    <>
      <section className="hero-banner">
        {imageUrl ? (
          <>
            <img
              src={imageUrl}
              alt={imageAlt}
              {...cslp('homepage', entryUid, locale, 'hero_banner.background_media.background_image')}
            />
            <div className="hero-overlay" />
            <div className={heroBodyClass}>
              {headline && (
                <h2
                  className="hero-title"
                  {...cslp('homepage', entryUid, locale, 'hero_banner.headline')}
                >
                  {headline}
                </h2>
              )}
              {subhead && (
                <p
                  className="hero-subhead"
                  {...cslp('homepage', entryUid, locale, 'hero_banner.subhead')}
                >
                  {subhead}
                </p>
              )}
              <div className="hero-ctas">
                {primaryCta?.label && (
                  <a
                    href={getCtaHref(primaryCta)}
                    className="hero-cta hero-cta-primary"
                    {...cslp('homepage', entryUid, locale, 'hero_banner.primary_cta.label')}
                  >
                    {primaryCta.label} &rarr;
                  </a>
                )}
                {secondaryCta?.label && (
                  <a
                    href={getCtaHref(secondaryCta)}
                    className="hero-cta hero-cta-secondary"
                    {...cslp('homepage', entryUid, locale, 'hero_banner.secondary_cta.label')}
                  >
                    {secondaryCta.label}
                  </a>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className={`hero-no-image ${heroBodyClass}`}>
            {headline && (
              <h2
                className="hero-title"
                {...cslp('homepage', entryUid, locale, 'hero_banner.headline')}
              >
                {headline}
              </h2>
            )}
            {subhead && (
              <p
                className="hero-subhead"
                {...cslp('homepage', entryUid, locale, 'hero_banner.subhead')}
              >
                {subhead}
              </p>
            )}
            <div className="hero-ctas">
              {primaryCta?.label && (
                <a
                  href={getCtaHref(primaryCta)}
                  className="hero-cta hero-cta-primary"
                  {...cslp('homepage', entryUid, locale, 'hero_banner.primary_cta.label')}
                >
                  {primaryCta.label} &rarr;
                </a>
              )}
              {secondaryCta?.label && (
                <a
                  href={getCtaHref(secondaryCta)}
                  className="hero-cta hero-cta-secondary"
                  {...cslp('homepage', entryUid, locale, 'hero_banner.secondary_cta.label')}
                >
                  {secondaryCta.label}
                </a>
              )}
            </div>
          </div>
        )}
      </section>

      {Array.isArray(sections) && sections.length > 0 && (
        <div
          {...(entryUid
            ? { 'data-cslp': `homepage.${entryUid}.${locale}.sections` }
            : {})}
        >
          {sections.map((block: any, index: number) => (
            <SectionBlocks
              key={index}
              block={block}
              index={index}
              locale={locale}
              parentEntryUid={entryUid}
              parentContentType="homepage"
            />
          ))}
        </div>
      )}
    </>
  );
}
