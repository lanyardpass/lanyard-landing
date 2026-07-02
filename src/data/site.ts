// Site-wide constants: nav, CTA copy/destination, meta.
// One CTA, repeated in three placements (header / hero / closing) — same
// label, same destination, per website_plan §3.

export const SITE = {
  name: 'Lanyard',
  tagline: 'You shall pass.',
  domain: 'lanyardpass.com',
  description:
    'Lanyard is your annual pass companion: blockouts, perks, events, and payback for Disney, Universal, and SeaWorld. Track every visit and watch your pass pay for itself. Built by an Orlando passholder.',
};

// ---- App Store (launch cutover) ----
// Apple ID from ASC → App Information (filled 2026-07-02). Deliberately
// COUNTRY-LESS URL: apps.apple.com without a storefront geo-routes each
// visitor to their own store (all 175 territories are enabled); the slug is
// cosmetic — the id governs. NOTE: the URL 404s until the app is Ready for
// Sale, which is why this branch merges only on approval day.
export const APP_STORE_ID = '6766682128';
export const APP_STORE_URL = `https://apps.apple.com/app/lanyard-annual-pass-companion/id${APP_STORE_ID}`;

// Apple App Analytics campaign attribution. FILL AT (OR AFTER) LAUNCH: the
// numeric provider token from ASC → App Analytics → Acquisition → Campaigns.
// With it set, every site link carries ?pt&ct so App Analytics reports
// DOWNLOADS per placement (ct mirrors the TelemetryDeck placement names).
// Empty = clean links; TelemetryDeck still counts the clicks.
export const APP_STORE_PT = '';

/** App Store URL, campaign-tagged when APP_STORE_PT is set. `campaign` should
 * be the placement name (site-header, final, calculator, beta-page…). */
export function appStoreUrl(campaign?: string): string {
  if (campaign && APP_STORE_PT) return `${APP_STORE_URL}?pt=${APP_STORE_PT}&ct=${campaign}&mt=8`;
  return APP_STORE_URL;
}

/** The single repeated call to action. App Store at launch; the beta lives on
 * as a footer link + FinalCTA fine print (early builds for enthusiasts). */
export const CTA = {
  label: 'Get the app',
  href: appStoreUrl('site-cta'),
};

// Root-relative so they work from any page (e.g. /privacy), not just home —
// they jump to the homepage and scroll to the section. "Privacy" is NOT here:
// it would collide with the legal "Privacy Policy" link in the footer (two
// different destinations, same word). The local-first section still lives in
// the scroll; the footer owns the legal Privacy Policy link.
export const NAV = [
  { label: 'What it does', href: '/#everything' },
  { label: 'Your pass', href: '/#coverage' },
  { label: 'Calculator', href: '/calculator' },
  { label: 'Guides', href: '/guides' },
  { label: 'Pricing', href: '/#pricing' },
];
