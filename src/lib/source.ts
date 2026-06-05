// Resolve a clean, single-token signup source for /admin + CSV.
//
// Priority:
//   1. An explicit campaign tag (?src= / ?utm_source= / ?ref=) — links we control.
//   2. The referring site's host, for untagged inbound (organic Google, a blog
//      linking us, etc.). Known search engines collapse to a clean label
//      ("google", "bing"); everyone else keeps their bare host ("reddit.com").
//   3. "direct" — no tag, no referrer (typed URL, bookmark, app with referrer
//      stripped), OR an internal click from our own pages (homepage → /beta),
//      which is navigation, not a traffic source.
//
// Caveat (documented for future readers): document.referrer from Google is
// lossy — often just "https://www.google.com/" with no query, and frequently
// absent entirely (referrer-policy, in-app browsers). This captures a real
// chunk of organic, not all of it. There is no per-signup search-term signal;
// that lives only in Google Search Console, unlinked to individuals.

// Hosts that are "us" — an inbound referrer from these is internal navigation.
const OWN_HOSTS = ['lanyardpass.com', 'netlify.app', 'localhost'];

// Search-engine host fragments → clean label.
const SEARCH_ENGINES: Array<[fragment: string, label: string]> = [
  ['google', 'google'],
  ['bing', 'bing'],
  ['duckduckgo', 'duckduckgo'],
  ['yahoo', 'yahoo'],
  ['ecosia', 'ecosia'],
  ['search.brave', 'brave'],
];

export function resolveSource(rawSrc?: string, rawReferrer?: string): string {
  const src = (rawSrc || '').trim();
  if (src) return src.toLowerCase();

  const ref = (rawReferrer || '').trim();
  if (!ref) return 'direct';

  let host = '';
  try {
    host = new URL(ref).hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return 'direct';
  }
  if (!host) return 'direct';

  // Internal navigation from our own domain (or a Netlify preview) isn't a source.
  if (OWN_HOSTS.some((h) => host === h || host.endsWith('.' + h))) return 'direct';

  for (const [fragment, label] of SEARCH_ENGINES) {
    if (host.includes(fragment)) return label;
  }

  return host;
}
