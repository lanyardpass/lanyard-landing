// Act 2 content — the three feature beats the C→A scroll-morph tours.
// Order mirrors the locked flow.html spike: lead with the value math
// (Payback), then the two daily-utility tentpoles. Copy and screenshots
// are data, not markup — swapping a beat or a headline is a one-line edit.
//
// NOTE (for Dan): website_plan §1b lists the Act-2 order as
// Calendar → Perks → Payback (ending on the value tentpole), but the
// de-risked flow.html spike leads with Payback as the hook. This build
// follows the spike. Flag if you want the §1b ordering instead.

export interface Act {
  id: string;
  kicker: string;
  headline: string;
  body: string;
  /** Screenshot shown inside the pinned phone for this beat. */
  screen: string;
  screenAlt: string;
}

export const ACTS: Act[] = [
  {
    id: 'payback',
    kicker: 'Worth every visit',
    headline: 'Watch your pass pay for itself.',
    body:
      'Every visit and perk adds up to a number you can actually see. The day it breaks even, you’ll know.',
    screen: '/assets/screen-payback.webp',
    screenAlt: 'Lanyard payback screen showing a pass that has paid back 105% of its cost.',
  },
  {
    id: 'calendar',
    kicker: 'Before you go',
    headline: 'Your whole season on one timeline.',
    body:
      'Events, blockouts and park hours across all your passes — so you always know if today’s a good day to go.',
    screen: '/assets/screen-calendar.webp',
    screenAlt: 'Lanyard calendar screen showing events, blockouts and hours on one timeline.',
  },
  {
    id: 'perks',
    kicker: 'At the park',
    headline: 'Every perk. Every dollar back.',
    body:
      'Track the discounts, parking and freebies you actually use, and what they’ve saved you.',
    screen: '/assets/screen-perks.webp',
    screenAlt: 'Lanyard perks screen listing passholder discounts and the value each one has saved.',
  },
];
