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
  { label: 'Calculator', href: '/calculator' },
  { label: 'Guides', href: '/guides' },
  { label: 'Pricing', href: '/#pricing' },
];
