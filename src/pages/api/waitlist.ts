import type { APIRoute } from 'astro';
import { addSignup, getSettings } from '@/lib/signups';
import { emailWaitlistSignup } from '@/lib/email';
import { resolveSource } from '@/lib/source';

export const prerender = false;

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const POST: APIRoute = async ({ request }) => {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  // Honeypot: bots fill hidden fields; silently accept + drop.
  if (body.botField) return json({ ok: true });

  const email = String(body.email || '').trim();
  if (!email || !/.+@.+\..+/.test(email)) {
    return json({ error: 'A valid email is required.' }, 400);
  }

  const source = resolveSource(body.source, body.referrer);
  const signup = await addSignup({
    type: 'waitlist',
    email,
    source,
    createdAt: Date.now(),
  });

  const settings = await getSettings();
  if (settings.waitlistEmails) await emailWaitlistSignup(signup);

  return json({ ok: true });
};
