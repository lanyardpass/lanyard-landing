import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

// Marketing site for lanyardpass.com.
// Static output (best Lighthouse/SEO); the beta form runs as a standalone
// Netlify Function (netlify/functions/beta.mjs), so no SSR adapter is needed.
// React is loaded only as an island (the Act 2 scroll-morph).
// https://astro.build/config
export default defineConfig({
  site: 'https://lanyardpass.com',
  output: 'static',
  integrations: [react()],
});
