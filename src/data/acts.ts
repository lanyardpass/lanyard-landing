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
    // The kicker is the skippable wink; headline + body carry the story. A
    // cold visitor who never reads the kicker must still learn what Lanyard
    // is from the white type alone (hence "annual passes" in the body).
    kicker: 'Open the app, look outside',
    headline: 'Your annual pass companion.',
    body:
      'Make every park day worth it. Blockouts, perks, events, crowds, and payback for Disney, Universal, and SeaWorld. One glance reads the whole day.',
    screen: '/assets/screen-home.webp',
    screenAlt:
      'Lanyard home screen at night: fireworks over your parks with live sky, weather, park hours, crowd words and good-to-go status.',
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

// The "New in Lanyard" green band between Capabilities and the Perks
// spotlight — the standing slot where the newest headline feature gets its
// announcement. Swap the content here when the next big feature ships; the
// version in the kicker is deliberate, so a reader still on the previous
// build understands why their app doesn't show it yet.
export const NEW_FEATURE_BEAT: Act & { cta: { label: string; href: string } } = {
  id: 'crowd-intelligence',
  kicker: 'New in 1.2',
  headline: 'Crowd Intelligence is here.',
  body:
    'Every park on your Home screen now wears one of three honest words. Quiet, normal, or packed, judged against that park’s own typical day and updated live. One glance tells you how the day will feel before you commit to the drive.',
  screen: '/assets/screen-home.webp',
  screenAlt:
    'Lanyard home screen at night showing crowd words under each park: Magic Kingdom packed, Epcot normal, Hollywood Studios quiet.',
  cta: { label: 'See how it works', href: '/crowds' },
};
