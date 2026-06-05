import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import netlify from '@astrojs/netlify';
import sitemap from '@astrojs/sitemap';

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
  integrations: [
    react(),
    // Generates /sitemap-index.xml from public pages. Excludes the admin
    // dashboard + API routes (never indexable). Submit the sitemap URL in
    // Google Search Console — the robots.txt is Cloudflare-managed, so we
    // don't reference it there.
    sitemap({
      filter: (page) => !page.includes('/admin'),
    }),
  ],
});
