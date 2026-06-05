// Minimal admin auth: one password (ADMIN_PASSWORD) → an HMAC-signed session
// cookie (signed with SESSION_SECRET). No external deps, no magic-link rig —
// right-sized for a single solo admin. Both env vars are set in Netlify.

import crypto from 'node:crypto';
import type { AstroCookies } from 'astro';

export const ADMIN_COOKIE = 'lanyard_admin';
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function secret(): string {
  return process.env.SESSION_SECRET || '';
}

function hmac(value: string): string {
  return crypto.createHmac('sha256', secret()).update(value).digest('base64url');
}

/** Constant-time string compare via fixed-length digests. */
function safeEqual(a: string, b: string): boolean {
  const ha = crypto.createHash('sha256').update(a).digest();
  const hb = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(ha, hb);
}

export function passwordOk(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD || '';
  if (!expected || !input) return false;
  return safeEqual(input, expected);
}

/** Signed token value to store in the cookie. */
export function makeSession(): string {
  const payload = `admin:${Date.now()}`;
  return `${payload}.${hmac(payload)}`;
}

export function sessionValid(token: string | undefined): boolean {
  if (!token || !secret()) return false;
  const i = token.lastIndexOf('.');
  if (i < 0) return false;
  const payload = token.slice(0, i);
  const sig = token.slice(i + 1);
  const expected = hmac(payload);
  if (sig.length !== expected.length) return false;
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return false;
  if (!payload.startsWith('admin:')) return false;
  const ts = Number(payload.slice('admin:'.length));
  return Number.isFinite(ts) && Date.now() - ts < SESSION_TTL_MS;
}

export function isAuthed(cookies: AstroCookies): boolean {
  return sessionValid(cookies.get(ADMIN_COOKIE)?.value);
}

/** Whether admin is even usable (env configured). */
export function adminConfigured(): boolean {
  return !!process.env.ADMIN_PASSWORD && !!process.env.SESSION_SECRET;
}
