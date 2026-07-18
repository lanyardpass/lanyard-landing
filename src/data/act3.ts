// Act 3 (the detail / rational closer) content.
// Each section is data-driven so copy is editable without touching layout.
// MVP-core sections per website_plan §1b: everything-it-does,
// works-with-your-pass, pricing, privacy, social-proof, CTA.

// ---- 1. Everything it does (capability grid) ----
export interface Capability {
  icon: string; // emoji stand-in; swap for SF-Symbol-style SVG at polish
  title: string;
  body: string;
  pro?: boolean; // true = Pro-only feature; renders a "Pro" pill on the card
  soon?: boolean; // true = in development; renders a dashed "Coming soon" pill (never combine with pro)
  newIn?: string; // version string (e.g. '1.2') — renders a solid "New in X" pill; use one of pro/soon/newIn
}
export const CAPABILITIES: Capability[] = [
  { icon: '🎟️', title: 'Every pass in one vault', body: 'Your passes and add-ons across Universal, Disney and United Parks, held in one place.' },
  { icon: '📈', title: 'Payback tracking', body: 'See cost-per-visit and the day your pass breaks even, counting both visits and perk savings.' },
  { icon: '🚫', title: 'Blockout dates', body: 'Per tier, per park — know before you drive whether today’s blocked out for your pass.' },
  { icon: '💸', title: 'Perks + value saved', body: 'Track the discounts, parking and freebies you use, and the running total they’ve saved you.' },
  { icon: '🗓️', title: 'Hours & events', body: 'Park hours and the season’s events on one timeline, with a heads-up when a park closes early.' },
  { icon: '🌤️', title: 'Weather for your parks', body: 'Live conditions and today’s forecast for the parks your passes cover, right on the home screen.' },
  { icon: '🔁', title: 'Renewal-save nudges', body: 'Quiet reminders when there’s a smarter way to renew or pay — advice, never pressure.' },
  { icon: '📍', title: 'Arrival detection', body: 'Reach a park and Lanyard offers to log your visit. Opt-in, and all on your phone.' },
  { icon: '📓', title: 'Visit history', body: 'A clean record of every visit, so the cost-per-visit math is always honest.' },
  { icon: '🎃', title: 'Special-event passes', body: 'HHN, Howl-O-Scream and more — tracked alongside your everyday pass.', pro: true },
  { icon: '👥', title: 'Crowd Intelligence', body: 'Quiet, normal, or packed: how each park day will actually feel, before you commit to the drive.', newIn: '1.2' },
];

// ---- 2. Works with your pass (coverage) ----
export interface Coverage {
  operator: string;
  detail: string;
}
export const COVERAGE: Coverage[] = [
  { operator: 'Universal Orlando', detail: '2-park & 3-park passes, Florida-resident pricing, every tier from Power to Premier.' },
  { operator: 'Walt Disney World', detail: 'Every Annual Pass tier — Incredi-Pass down to Pixie Dust.' },
  { operator: 'SeaWorld & Busch Gardens', detail: 'SeaWorld Orlando, Busch Gardens Tampa & Aquatica — Platinum and home-park passes under United Parks.' },
];

// ---- 3. Pricing (Free vs Pro) ----
export const PRICING = {
  free: {
    name: 'Free',
    price: 'Free',
    tagline: 'Your first pass, full features.',
    points: ['One active pass', 'Payback, perks, blockouts, events — all of it', 'No ads, anywhere', 'No account, no sign-up'],
  },
  pro: {
    name: 'Pro',
    price: '$29.99/yr',
    sub: 'or $3.49/mo · Family Sharing included',
    tagline: 'For multi-pass households and special events.',
    points: ['Unlimited passes', 'Special-event pass types (HHN, Howl-O-Scream…)', 'Everything in Free'],
  },
  note: 'Your first pass stays free for as long as you want it. No trial timer, no expiry.',
};

// ---- 4. Privacy (promise-based, per memory) ----
export const PRIVACY_POINTS = [
  'No name, no email, no sign-up. Nothing that ties Lanyard to you.',
  'Never linked to your identity, and never sold.',
  'Works offline — the parking lot with no signal is exactly when you need it.',
];

// ---- 5. Social proof ----
// Real beta-tester quotes (verbatim, lightly punctuated for readability; "…"
// marks omitted middle). Kept ANONYMOUS for now so they can go live without
// waiting on permission — attach first names later if/when testers approve.
export interface Quote {
  text: string;
  attribution: string;
  placeholder?: boolean;
}
export const QUOTES: Quote[] = [
  {
    text: 'It’s such a W. It’s so clean and easy to navigate. You’re doing an amazing job on it!',
    attribution: 'Beta tester',
  },
  {
    text: 'First of all, this is incredible! … overall the app looks great.',
    attribution: 'Beta tester',
  },
];

// ---- 6. FAQ (also feeds FAQPage JSON-LD on the homepage) ----
// Leads with the companion definition (value is one pillar, not the headline);
// see product_decisions.md → brand voice and LAN-102 (positioning).
export interface FaqItem { question: string; answer: string; }
export const HOME_FAQ: FaqItem[] = [
  {
    question: 'What is Lanyard?',
    answer:
      'Lanyard is a companion app for theme park annual passholders. It brings everything about your passes into one place: today’s park hours and blockouts, every event across your parks on one timeline, the perks you’re owed, and what your pass is actually worth.',
  },
  {
    question: 'Is it free?',
    answer:
      'Yes. One active pass with every feature, free, no trial countdown. Pro ($29.99/yr or $3.49/mo) adds unlimited passes and special-event passes like Halloween Horror Nights, and it’s covered by Family Sharing.',
  },
  {
    question: 'Do I need an account?',
    answer: 'No sign-up, no email, no password. Open the app and start tracking.',
  },
  {
    question: 'Is my pass data private?',
    answer:
      'Your pass details live on your phone. There’s no account, and your pass data isn’t sold or shared. Optional, anonymous usage analytics can be turned off anytime.',
  },
  {
    question: 'Which parks and passes does it support?',
    answer:
      'Universal Orlando, Walt Disney World, SeaWorld Orlando, and Busch Gardens Tampa, plus their water parks. It models the real tiers, park counts, resident pricing, and home-park rules the way operators sell them.',
  },
  {
    question: 'What are “perks”?',
    answer:
      'The benefits your pass includes beyond getting in: food and merch discounts, parking, free guest days, seasonal extras. Lanyard surfaces the ones you can use and totals what they’ve saved you, so they don’t go to waste.',
  },
  {
    question: 'Are you affiliated with Disney, Universal, or SeaWorld?',
    answer:
      'Lanyard is independent, and the parks don’t endorse or sponsor it. It just helps you get more from the pass you already bought.',
  },
];
