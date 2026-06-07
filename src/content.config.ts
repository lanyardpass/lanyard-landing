// Content collections for the marketing site.
//
// `guides` is the evergreen, "Last verified"-dated guide section. The blog,
// when it lands, is just a second collection on this same machinery — define
// it here with its own glob + schema and reuse the GuideLayout patterns.
//
// Content/code split (build brief): prose lives in the MDX body, structured
// bits (the answer box, the FAQ that powers both the accordion AND the FAQPage
// JSON-LD, the byline, the verified date) live in frontmatter. Components are
// passed in by the page template, so a content file stays editable as prose.

import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const guides = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/guides' }),
  schema: ({ image }) =>
    z.object({
      // Core identity
      title: z.string(), // the H1 (coach voice)
      // SEO <title> / meta description — distinct from the on-page H1 so each
      // can be tuned for its job (search snippet vs. on-page headline).
      seoTitle: z.string().optional(),
      description: z.string(), // meta description
      dek: z.string(), // the one-line answer under the H1

      // The TL;DR rendered in the AnswerBox directly under the hero (§1).
      answer: z.string(),

      // Freshness: drives the LastVerifiedBadge and the Article schema dates.
      lastVerified: z.coerce.date(),
      published: z.coerce.date().optional(),

      byline: z.string().default('By Dan, Orlando passholder'),

      // Hero image (astro:assets — responsive + optimized at build).
      hero: image(),
      heroAlt: z.string(),
      // Social card. Falls back to the hero in the layout if omitted.
      ogImage: image().optional(),

      // Powers the FAQ accordion AND the FAQPage JSON-LD from one source.
      faq: z
        .array(z.object({ question: z.string(), answer: z.string() }))
        .default([]),

      // Sort/lifecycle
      draft: z.boolean().default(false),
    }),
});

export const collections = { guides };
