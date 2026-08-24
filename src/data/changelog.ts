// /changelog content — the version history, newest first.
// One entry per MARKETED version (ASC point releases fold into the version
// users actually experienced: 1.1.1 is "1.1", 1.2.1 is "1.2"). Month-level
// dates on purpose — the page tells the progression story, not the ops log.
// Copy is distilled from each version's locked App Store What's New
// (marketing/appstore_submission_spec.md) — each feature appears once, under
// the version that shipped it, even where a later release's notes re-ran a
// headline for users jumping versions.
// When a version ships: add its entry here, and only then retire the
// homepage band (acts.ts NEW_FEATURE_BEAT) to the next feature.

export interface ChangelogEntry {
  /** Marketed version string, e.g. '1.3'. */
  version: string;
  /** Month-level date, e.g. 'August 2026'. */
  date: string;
  /** The hook line — Dan-voiced, mirrors the What's New opener. */
  headline: string;
  /** Short beats; keep to 2–4, distilled not exhaustive. */
  points: string[];
  /** Optional pill, e.g. 'Launch' on 1.0. */
  tag?: string;
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: '1.3.1',
    date: 'August 2026',
    headline: 'The Halloween build opens its doors faster.',
    points: [
      'Faster, smoother cold launches, especially on busy phones and the first open after an update.',
      'Links into Lanyard land where they point. Tap the Halloween event card on the App Store and you walk straight into the house tracker demo.',
    ],
  },
  {
    version: '1.3',
    date: 'August 2026',
    headline: 'The Halloween build.',
    points: [
      'Halloween Horror Nights and Howl-O-Scream passes now track your whole season. Log each event night, stamp every house you walk, rate your walks in Nightmares, and build your Nightmare Tally across the season. Done nights get a share card.',
      'Perks show how many uses you have left and when more arrive. Multi-use perks return after you claim them, and quarterly perks reopen each quarter.',
      'Arrival notifications no longer get dropped when the app wakes in the background.',
    ],
  },
  {
    version: '1.2.3',
    date: 'August 2026',
    headline: 'A tune-up. Nothing new to learn, everything a little quicker.',
    points: [
      'Perk suggestions and the Perks tab stay fast no matter how many visits and redemptions you have logged.',
      'Park data updates land without a stutter, and the location permission flow became one clear question at a time.',
    ],
  },
  {
    version: '1.2',
    date: 'July 2026',
    headline: 'Lanyard reads the crowd.',
    points: [
      'Crowd Intelligence. Every park on your Home screen wears one of three honest words. Quiet, normal, or packed, judged against that park’s own typical day and updated live through the day.',
      'Meet the Parkfolk. The little figures in each park match the real crowd, gather at rope drop, and stream out at close.',
      'More passes in the vault. SeaWorld and Busch Gardens Fun Cards, the Military Freedom Pass, and the Florida Resident 2-Park pass.',
      'Park-hopper days count honestly, and quarterly perks count by quarter.',
    ],
  },
  {
    version: '1.1',
    date: 'July 2026',
    headline: 'Your parks put on a show.',
    points: [
      'Live weather over every park. The Home horizon renders the real sky. Clouds build with the forecast, rain and lightning arrive with the storm, and the sun and moon ride their true arcs.',
      'Night comes alive. Fireworks near park close, drone shows, and each park’s own lights, from EPCOT’s ring to the Sky Tower’s slow red pulse.',
      'Refreshed pass cards in the vault, with richer artwork for every operator.',
    ],
  },
  {
    version: '1.0',
    date: 'July 2026',
    headline: 'You shall pass.',
    tag: 'Launch',
    points: [
      'Lanyard arrives on the App Store. Every pass in one vault, payback tracking, blockout dates, perks and the value they save, park hours and events on one timeline, and arrival detection. No account, no sign-up, everything on your phone.',
    ],
  },
];
