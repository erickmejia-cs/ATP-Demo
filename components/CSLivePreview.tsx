'use client';

import { useEffect } from 'react';

export default function CSLivePreview() {
  useEffect(() => {
    async function init() {
      try {
        const [{ default: ContentstackLivePreview }, { default: Contentstack }] =
          await Promise.all([
            import('@contentstack/live-preview-utils'),
            import('contentstack'),
          ]);

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

        // ssr: false → the SDK fires onChange() on every Builder change event,
        // which triggers onEntryChange callbacks registered by page components.
        // With ssr: true the SDK skips onChange() in iframe mode entirely.
        await (ContentstackLivePreview as any).init({
          enable: true,
          ssr: false,
          stackSdk: clientStack,
          editButton: {
            enable: true,
            exclude: ['outsideLivePreviewPortal'],
          },
          stackDetails: {
            apiKey: process.env.NEXT_PUBLIC_CONTENTSTACK_API_KEY ?? '',
            environment: process.env.NEXT_PUBLIC_CONTENTSTACK_ENVIRONMENT ?? 'dev',
            branch: process.env.NEXT_PUBLIC_CONTENTSTACK_BRANCH ?? 'main',
            locale: 'en-us',
          },
          mode: 'builder',
          clientUrlParams: {
            host: 'app.contentstack.com',
          },
        });
      } catch (err) {
        console.warn('[CSLivePreview] init failed:', err);
      }
    }

    init();
  }, []);

  return null;
}
