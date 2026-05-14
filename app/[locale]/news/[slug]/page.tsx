import { notFound } from 'next/navigation';
import { getNewsArticleBySlug, getLatestArticles } from '@/lib/contentstack';
import ArticleLiveView from '@/components/ArticleLiveView';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: { locale: string; slug: string };
}): Promise<Metadata> {
  if (params.locale !== 'es') return {};
  const article = await getNewsArticleBySlug(params.slug, 'es');
  if (!article) return { title: 'Article not found – ATP Tour' };
  return {
    title: article.seo?.meta_title || `${article.title} – ATP Tour`,
    description:
      article.seo?.meta_description || article.summary || 'ATP Tour news article.',
    alternates: { canonical: article.seo?.canonical_url },
  };
}

export default async function LocaleNewsArticlePage({
  params,
  searchParams,
}: {
  params: { locale: string; slug: string };
  searchParams: { live_preview?: string; [key: string]: string | string[] | undefined };
}) {
  if (params.locale !== 'es') notFound();

  const locale = 'es';
  const { slug } = params;
  const hash =
    typeof searchParams?.live_preview === 'string'
      ? searchParams.live_preview
      : undefined;

  const [article, latestArticles] = await Promise.all([
    getNewsArticleBySlug(slug, locale, hash),
    getLatestArticles(10, locale),
  ]);
  if (!article) notFound();

  return (
    <ArticleLiveView
      initialArticle={article}
      latestArticles={latestArticles}
      locale={locale}
      slug={slug}
    />
  );
}
