// Act 2 content — the feature beats the C→A scroll-morph tours.
// Order: lead with Home (the parallax "window into your parks"), then the
// value math (Payback), then the planning tentpole (Calendar).
//
// ⚠️ NOT a pure one-line add/remove: ScrollMorph hardcodes the dwell windows
// and scroll-track height for exactly THREE beats — the idx math in
// ScrollMorph.tsx update() (thresholds at 1.4vh / 2.5vh) and
// `.morph { height: 400vh }` in ScrollMorph.css. Reordering or swapping the
// THREE beats below is a one-line edit here; going to 4+ requires generalizing
// both off ACTS.length first.
//
// Perks was the old 3rd morph beat. It moved OUT of the morph (kept tight) and
// is slated for its own lower-page feature section. Its draft copy is parked
// below as PERKS_BEAT so it's ready to drop in when that section is built.

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
    id: 'home',
    kicker: 'Your annual pass companion',
    headline: 'Make every park day worth it.',
    body:
      'Blockouts, perks, events, and payback for Disney, Universal, and SeaWorld. Live hours, real weather, every park you hold. One glance reads the whole day.',
    screen: '/assets/screen-home.webp',
    screenAlt:
      'Lanyard home screen: a parallax window onto your parks with live sky, weather, park hours and good-to-go status.',
  },
  {
    id: 'payback',
    kicker: 'Worth every visit',
    headline: 'Watch your pass pay for itself.',
    body:
      'Every visit and perk adds up to a number you can actually see. The day it breaks even, you’ll know.',
    screen: '/assets/screen-payback.webp',
    screenAlt: 'Lanyard payback screen showing a pass that has paid back 71% of its cost.',
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
];

// Parked: the former Perks morph beat, pending its own lower-page section.
// Not rendered by ScrollMorph. Kept here so the copy isn't lost.
export const PERKS_BEAT: Act = {
  id: 'perks',
  kicker: 'At the park',
  headline: 'Every perk. Every dollar back.',
  body:
    'Track the discounts, parking and freebies you actually use, and what they’ve saved you.',
  screen: '/assets/screen-perks.webp',
  screenAlt: 'Lanyard perks screen listing passholder discounts and the value each one has saved.',
};
