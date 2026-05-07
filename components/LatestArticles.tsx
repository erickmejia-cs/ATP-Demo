'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Article {
  uid?: string;
  title?: string;
  url?: string;
  hero_image?: { url?: string };
  publish_date?: string;
  cslpAttrs?: Record<string, string>;
}

interface Props {
  heading?: string;
  headingCslp?: Record<string, string>;
  ctaLabel?: string;
  ctaCslp?: Record<string, string>;
  ctaHref?: string;
  showRelated: boolean;
  showMostRecent: boolean;
  relatedTabHeading?: string;
  relatedTabHeadingCslp?: Record<string, string>;
  relatedArticles: Article[];
  relatedContainerCslp?: Record<string, string>;
  recentTabHeading?: string;
  recentTabHeadingCslp?: Record<string, string>;
  latestArticles: Article[];
}

export default function LatestArticles({
  heading,
  headingCslp,
  ctaLabel,
  ctaCslp,
  ctaHref,
  showRelated,
  showMostRecent,
  relatedTabHeading,
  relatedTabHeadingCslp,
  relatedArticles,
  relatedContainerCslp,
  recentTabHeading,
  recentTabHeadingCslp,
  latestArticles,
}: Props) {
  const bothTabs = showRelated && showMostRecent;
  const [activeTab, setActiveTab] = useState<'recent' | 'related'>(
    showMostRecent ? 'recent' : 'related'
  );

  const isRelated = bothTabs ? activeTab === 'related' : showRelated;
  const articles = isRelated ? relatedArticles : latestArticles;
  const featured = articles[0];
  const rest = articles.slice(1);

  if (!showRelated && !showMostRecent) return null;

  return (
    <aside className="la-card">
      <div className="la-header">
        <span className="la-title" {...headingCslp}>{heading || 'News'}</span>
        {ctaHref && (
          <Link href={ctaHref} className="la-view-all" {...ctaCslp}>
            {ctaLabel || 'View All'} →
          </Link>
        )}
      </div>

      {bothTabs && (
        <div className="la-tabs">
          <button
            className={`la-tab${activeTab === 'related' ? ' la-tab-active' : ''}`}
            onClick={() => setActiveTab('related')}
            {...relatedTabHeadingCslp}
          >
            {relatedTabHeading || 'Related'}
          </button>
          <button
            className={`la-tab${activeTab === 'recent' ? ' la-tab-active' : ''}`}
            onClick={() => setActiveTab('recent')}
            {...recentTabHeadingCslp}
          >
            {recentTabHeading || 'Most Recent'}
          </button>
        </div>
      )}

      {featured && (
        <Link
          href={featured.url || '#'}
          className="la-featured"
          {...(isRelated ? featured.cslpAttrs : undefined)}
        >
          {featured.hero_image?.url ? (
            <img src={featured.hero_image.url} alt={featured.title || ''} className="la-featured-img" />
          ) : (
            <div className="la-featured-img la-img-placeholder" />
          )}
          <p className="la-featured-title">{featured.title}</p>
        </Link>
      )}

      {rest.length > 0 && (
        <ul
          className="la-list"
          {...(isRelated ? relatedContainerCslp : undefined)}
        >
          {rest.map((article, i) => (
            <li
              key={article.uid || i}
              className="la-list-item"
              {...(isRelated ? article.cslpAttrs : undefined)}
            >
              <Link href={article.url || '#'} className="la-item-link">
                {article.hero_image?.url ? (
                  <img src={article.hero_image.url} alt={article.title || ''} className="la-thumb" />
                ) : (
                  <div className="la-thumb la-img-placeholder" />
                )}
                <p className="la-item-title">{article.title}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
