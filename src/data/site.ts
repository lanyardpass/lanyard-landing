// Site-wide constants: nav, CTA copy/destination, meta.
// One CTA, repeated in three placements (header / hero / closing) — same
// label, same destination, per website_plan §3.

export const SITE = {
  name: 'Lanyard',
  tagline: 'You shall pass.',
  domain: 'lanyardpass.com',
  description:
    'Lanyard tracks what your theme-park annual pass is really worth — visits, perks, blockouts and events — all on your phone. Built by an Orlando passholder.',
};

/** The single repeated call to action. Beta now → App Store at launch. */
export const CTA = {
  label: 'Join the beta',
  href: '/beta',
};

export const NAV = [
  { label: 'What it does', href: '#everything' },
  { label: 'Your pass', href: '#coverage' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Privacy', href: '#privacy' },
];
