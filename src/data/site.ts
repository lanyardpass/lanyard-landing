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
// FILL BEFORE MERGE: the numeric Apple ID from App Store Connect → App
// Information. The CTA, smart banner, and JSON-LD all derive from it. The
// placeholder href is deliberately loud so an unfilled merge is caught in
// review, not by users.
export const APP_STORE_ID = ''; // e.g. '6741234567'
export const APP_STORE_URL = APP_STORE_ID
  ? `https://apps.apple.com/app/id${APP_STORE_ID}`
  : '#APP-STORE-ID-MISSING';

/** The single repeated call to action. App Store at launch; the beta lives on
 * as a footer link + FinalCTA fine print (early builds for enthusiasts). */
export const CTA = {
  label: 'Get the app',
  href: APP_STORE_URL,
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
