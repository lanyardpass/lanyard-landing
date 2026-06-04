// Act 3 (the detail / rational closer) content.
// Each section is data-driven so copy is editable without touching layout.
// MVP-core sections per website_plan §1b: everything-it-does,
// works-with-your-pass, pricing, privacy, social-proof, CTA.

// ---- 1. Everything it does (capability grid) ----
export interface Capability {
  icon: string; // emoji stand-in; swap for SF-Symbol-style SVG at polish
  title: string;
  body: string;
}
export const CAPABILITIES: Capability[] = [
  { icon: '🎟️', title: 'Every pass in one vault', body: 'All your passes and add-ons across Universal, Disney and United Parks — held in one place.' },
  { icon: '📈', title: 'Payback tracking', body: 'See cost-per-visit and the day your pass breaks even, counting both visits and perk savings.' },
  { icon: '🚫', title: 'Blockout dates', body: 'Per tier, per park — know before you drive whether today’s blocked out for your pass.' },
  { icon: '💸', title: 'Perks + value saved', body: 'Track the discounts, parking and freebies you use, and the running total they’ve saved you.' },
  { icon: '🗓️', title: 'Hours & events', body: 'Park hours and the season’s events on one timeline, across all your passes.' },
  { icon: '🔁', title: 'Renewal-save nudges', body: 'Quiet reminders when there’s a smarter way to renew or pay — advice, never pressure.' },
  { icon: '📓', title: 'Visit history', body: 'A clean record of every visit, so the cost-per-visit math is always honest.' },
  { icon: '🎃', title: 'Special-event passes', body: 'HHN, Howl-O-Scream and more — tracked alongside your everyday pass.' },
];

// ---- 2. Works with your pass (coverage) ----
export interface Coverage {
  operator: string;
  detail: string;
}
export const COVERAGE: Coverage[] = [
  { operator: 'Universal Orlando', detail: '2-park & 3-park passes, Florida-resident pricing, every tier from Power to Premier.' },
  { operator: 'Walt Disney World', detail: 'Every Annual Pass tier — Incredi-Pass down to Pixie Dust.' },
  { operator: 'United Parks', detail: 'SeaWorld, Busch Gardens & Aquatica — Platinum and home-park passes.' },
];

// ---- 3. Pricing (Free vs Pro) ----
export const PRICING = {
  free: {
    name: 'Free',
    price: 'Free',
    tagline: 'Your first pass, full features.',
    points: ['One active pass', 'Payback, perks, blockouts, events — all of it', 'No account, no sign-up'],
  },
  pro: {
    name: 'Pro',
    price: '$29.99/yr',
    sub: 'or $3.49/mo · Family Sharing included',
    tagline: 'For multi-pass households and special events.',
    points: ['Unlimited passes', 'Special-event pass types (HHN, Howl-O-Scream…)', 'Everything in Free'],
  },
  note: 'No trial gate — the free tier is the trial. Restore Purchases lives in Settings.',
};

// ---- 4. Privacy (promise-based, per memory) ----
export const PRIVACY_POINTS = [
  'Your pass data lives on your phone, not our servers.',
  'No account. No login. Nothing to leak.',
  'Works offline — the parking lot with no signal is exactly when you need it.',
];

// ---- 5. Social proof ----
// PLACEHOLDER — do NOT ship fabricated testimonials (website_plan §4:
// "seed it real, never fabricated"). Replace with real, attributed quotes
// from the validated r/SeaWorld post and early beta testers before launch.
export interface Quote {
  text: string;
  attribution: string;
  placeholder?: boolean;
}
export const QUOTES: Quote[] = [
  { text: 'Real passholder quote goes here once the beta seeds it.', attribution: 'Beta tester', placeholder: true },
  { text: 'A second real quote — value math or daily-utility moment.', attribution: 'r/SeaWorld', placeholder: true },
];
