import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import netlify from '@astrojs/netlify';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';

// Marketing site for lanyardpass.com.
// SSR via the Netlify adapter so we can run server routes (signup capture,
// admin, CSV export) with Netlify Blobs storage — all zero-config on Netlify.
// The content pages (home, privacy) opt back into static with
// `export const prerender = true`, so they stay as fast as before; only the
// /api and /admin routes run server-side. The app's "no backend" rule is
// app-only and doesn't apply to this marketing site.
// https://astro.build/config
export default defineConfig({
  site: 'https://lanyardpass.com',
  output: 'server',
  adapter: netlify(),
  // Canonical URLs are slash-LESS (`/beta`, not `/beta/`) — the predominant
  // modern convention (Next/Vercel/Jamstack), and Google only cares that we pick
  // one and stay consistent. `trailingSlash: 'never'` aligns the dev server +
  // Astro.url (so canonical tags + the sitemap emit the slashless form), and
  // `build.format: 'file'` makes Astro emit `/beta.html` (served clean at `/beta`
  // by Netlify, which 301s `/beta/` → `/beta`) instead of `/beta/index.html`.
  // NOTE: Astro's trailingSlash only governs dev/routing; production redirect
  // behavior is Netlify's — verify on the deploy.
  trailingSlash: 'never',
  build: { format: 'file' },
  integrations: [
    react(),
    // Guides (and the future blog) author prose in MDX so content + components
    // coexist — Dan edits copy without touching components, per the build brief.
    mdx(),
    // Generates /sitemap-index.xml from public pages. Excludes the admin
    // dashboard + API routes (never indexable). Submit the sitemap URL in
    // Google Search Console — the robots.txt is Cloudflare-managed, so we
    // don't reference it there.
    sitemap({
      // /crowds is dark-launched until Crowd Intelligence ships (1.2) — the
      // page carries noindex AND stays out of the sitemap. ⚠ 1.2 GATE: remove
      // the /crowds exclusion (and the page's noindex) when the feature goes
      // live.
      filter: (page) => !page.includes('/admin') && !page.includes('/crowds'),
    }),
  ],
});
