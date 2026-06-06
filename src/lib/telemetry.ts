// Lightweight custom-signal layer for the calculator funnel.
//
// Pageviews are already handled by the TelemetryDeck websdk in Layout.astro.
// That websdk auto-fires pageViews but exposes no global to call, so custom
// signals go through the official npm SDK here, reporting to the SAME app the
// websdk + iOS app use. Privacy posture matches the rest of Lanyard: anonymous,
// aggregate, never linked to a person. We capture what a pass is worth, not who.

import TelemetryDeck from '@telemetrydeck/sdk';

// Public by design (ships in the client) — same app id as the pageview websdk.
const APP_ID = '155A1765-42BE-4F22-B380-691BB80566D5';

// Keep non-production traffic out of the live numbers. PUBLIC_NOINDEX covers
// branch/preview deploys; the hostname check covers local `npm run dev` (the
// websdk auto-detects localhost, but the npm SDK does not, so we do it).
function isTestMode(): boolean {
  if (import.meta.env.PUBLIC_NOINDEX === 'true') return true;
  const h = window.location.hostname;
  return h === 'localhost' || h === '127.0.0.1' || h === '::1' || h.endsWith('.local');
}

// Anonymous per-session id. Not tied to identity and not persisted across
// sessions — it only links one visit's signals so a funnel is countable. The
// SDK hashes it before sending.
function sessionClientUser(): string {
  try {
    const KEY = 'lanyard_calc_session';
    let id = sessionStorage.getItem(KEY);
    if (!id) {
      id = window.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      sessionStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return 'anonymous';
  }
}

let td: TelemetryDeck | null = null;
function client(): TelemetryDeck | null {
  if (typeof window === 'undefined') return null;
  if (!td) {
    td = new TelemetryDeck({ appID: APP_ID, clientUser: sessionClientUser(), testMode: isTestMode() });
  }
  return td;
}

/**
 * Fire-and-forget custom signal. `value` becomes the single numeric floatValue
 * (TelemetryDeck allows exactly one per signal); everything in `dimensions` is a
 * string the TQL loop can group and count by. Never throws — analytics must
 * never break the UI.
 */
export function track(type: string, dimensions: Record<string, string> = {}, value?: number): void {
  const c = client();
  if (!c) return;
  const payload: Record<string, unknown> = { ...dimensions };
  if (typeof value === 'number' && Number.isFinite(value)) payload.floatValue = value;
  try {
    void c.signal(type, payload).catch(() => {});
  } catch {
    /* ignore */
  }
}

// ---- Band helpers — bucket numbers into categorical dimensions so the
//      free-tier TQL loop can group + count them (the raw number still rides
//      along as floatValue for averaging where it matters). ----

export function priceBand(n: number): string {
  if (n <= 0) return 'unknown';
  if (n < 300) return '<300';
  if (n < 500) return '300-499';
  if (n < 700) return '500-699';
  if (n < 1000) return '700-999';
  if (n < 1500) return '1000-1499';
  return '1500+';
}

export function visitsBand(n: number): string {
  if (n <= 0) return '0';
  if (n <= 3) return '1-3';
  if (n <= 6) return '4-6';
  if (n <= 10) return '7-10';
  if (n <= 20) return '11-20';
  return '21+';
}

export function paybackBand(pct: number): string {
  if (pct < 50) return '<50';
  if (pct < 100) return '50-99';
  if (pct < 150) return '100-149';
  if (pct < 200) return '150-199';
  return '200+';
}
