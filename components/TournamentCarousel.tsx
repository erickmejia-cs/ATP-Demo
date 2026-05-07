'use client';

import { useRef } from 'react';

interface Tournament {
  uid?: string;
  title?: string;
  name?: string;
  location?: string;
  category?: string;
  category_badge?: { url?: string; title?: string };
  overview_link?: { href?: string };
  [key: string]: any;
}

interface Props {
  tournaments: Tournament[];
  cslpField?: string; // data-cslp for the list container
}

export default function TournamentCarousel({ tournaments, cslpField }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);

  function scroll(dir: 'left' | 'right') {
    trackRef.current?.scrollBy({ left: dir === 'left' ? -540 : 540, behavior: 'smooth' });
  }

  return (
    <div className="tc-wrapper">
      <button className="tc-btn" onClick={() => scroll('left')} aria-label="Scroll left">
        &#8249;
      </button>

      <div
        className="tc-track"
        ref={trackRef}
        {...(cslpField ? { 'data-cslp': cslpField } : {})}
      >
        {tournaments.map((t, i) => {
          const name = t.title || t.name || 'Tournament';
          const href = t.overview_link?.href ?? '#';
          const badgeUrl = t.category_badge?.url;
          const badgeAlt = t.category_badge?.title || `ATP ${t.category ?? ''} badge`;

          return (
            <a
              key={i}
              href={href}
              target="_blank"
              rel="noreferrer"
              className="tc-card"
              {...(cslpField ? { 'data-cslp': `${cslpField}.${i}` } : {})}
            >
              <div className="tc-badge-wrap">
                {badgeUrl ? (
                  <img src={badgeUrl} alt={badgeAlt} className="tc-badge-img" />
                ) : (
                  <span className="tc-badge-fallback">ATP {t.category}</span>
                )}
              </div>

              <div className="tc-name">{name}</div>
              {t.location && <div className="tc-loc">{t.location}</div>}
            </a>
          );
        })}
      </div>

      <button className="tc-btn" onClick={() => scroll('right')} aria-label="Scroll right">
        &#8250;
      </button>
    </div>
  );
}
