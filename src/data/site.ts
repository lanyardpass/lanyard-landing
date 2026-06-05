// Site-wide constants: nav, CTA copy/destination, meta.
// One CTA, repeated in three placements (header / hero / closing) — same
// label, same destination, per website_plan §3.

export const SITE = {
  name: 'Lanyard',
  tagline: 'You shall pass.',
  domain: 'lanyardpass.com',
  description:
    'Lanyard helps you get the most out of your theme-park annual pass: track visits, perks, blockouts and events, and watch it pay for itself. Built by an Orlando passholder.',
};

/** The single repeated call to action. Beta now → App Store at launch. */
export const CTA = {
  label: 'Join the beta',
  href: '/beta',
};

// Root-relative so they work from any page (e.g. /privacy), not just home —
// they jump to the homepage and scroll to the section. "Privacy" is NOT here:
// it would collide with the legal "Privacy Policy" link in the footer (two
// different destinations, same word). The local-first section still lives in
// the scroll; the footer owns the legal Privacy Policy link.
export const NAV = [
  { label: 'What it does', href: '/#everything' },
  { label: 'Your pass', href: '/#coverage' },
  { label: 'Pricing', href: '/#pricing' },
];
