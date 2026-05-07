# ATP Tour Contentstack Launch Demo

A Next.js demo site powered by Contentstack with a homepage and news article pages.

## Features

- Contentstack Delivery API integration
- Homepage singleton rendering
- News article detail pages
- Visual Experience / preview route support
- SEO metadata handling

## Setup

1. Copy `.env.local.example` to `.env.local`
2. Add your `CONTENTSTACK_MANAGEMENT_TOKEN` if using preview or visual editing
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run locally:
   ```bash
   npm run dev
   ```

## Contentstack settings

- API Key: `blt79254e1f9a1ecfb7`
- Delivery Token: `csd925935b7e807b30c41c9826`
- Preview Token: `cs9373481fe923a03c9bf37d86`
- Branch: `main`

## Visual Experience

Open the preview route with the configured preview token to enable Contentstack preview mode:

```text
http://localhost:3000/api/preview?token=cs9373481fe923a03c9bf37d86&slug=/
```

Then navigate the site to see preview content.
