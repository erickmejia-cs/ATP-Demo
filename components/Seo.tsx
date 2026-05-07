import Head from 'next/head';

interface SeoProps {
  title?: string;
  description?: string;
  image?: string;
  canonical?: string;
  noIndex?: boolean;
  noFollow?: boolean;
}

export default function Seo({ title, description, image, canonical, noIndex, noFollow }: SeoProps) {
  const metaTitle = title || 'ATP Tour Demo';
  const metaDescription = description || 'A Contentstack-powered ATP Tour demo site.';
  const robots = `${noIndex ? 'noindex' : 'index'}, ${noFollow ? 'nofollow' : 'follow'}`;

  return (
    <Head>
      <title>{metaTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta name="robots" content={robots} />
      {canonical ? <link rel="canonical" href={canonical} /> : null}
      <meta property="og:title" content={metaTitle} />
      <meta property="og:description" content={metaDescription} />
      {image ? <meta property="og:image" content={image} /> : null}
    </Head>
  );
}
