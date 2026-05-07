import Link from 'next/link';

interface NewsCardProps {
  title: string;
  summary?: string;
  imageUrl?: string;
  publishDate?: string;
  url: string;
  entryUid?: string;
  locale?: string;
  cslpAttrs?: Record<string, string>;
}

export default function NewsCard({
  title,
  summary,
  imageUrl,
  publishDate,
  url,
  entryUid,
  locale = 'en-us',
  cslpAttrs,
}: NewsCardProps) {
  const cslpAttr = (field: string) =>
    entryUid ? { 'data-cslp': `news_article.${entryUid}.${locale}.${field}` } : {};

  return (
    <article className="news-card" {...(cslpAttrs ?? {})}>
      {imageUrl ? (
        <img
          className="news-card-image"
          src={imageUrl}
          alt={title}
          {...cslpAttr('hero_image')}
        />
      ) : (
        <div className="news-card-image-placeholder" aria-hidden="true">
          🎾
        </div>
      )}

      <div className="news-card-body">
        <div className="news-card-category">Tennis</div>

        <h3 className="news-card-title" {...cslpAttr('title')}>
          {title}
        </h3>

        {summary && (
          <p className="news-card-summary" {...cslpAttr('summary')}>
            {summary}
          </p>
        )}

        <div className="news-card-footer">
          {publishDate ? (
            <span className="news-card-date">
              {new Date(publishDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          ) : (
            <span />
          )}
          <Link href={url} className="news-card-link">
            Read more →
          </Link>
        </div>
      </div>
    </article>
  );
}
