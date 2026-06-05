import type { APIRoute } from 'astro';
import { addSignup, getSettings, type PassEntry } from '@/lib/signups';
import { emailBetaApplication } from '@/lib/email';

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

  if (body.botField) return json({ ok: true });

  const email = String(body.email || '').trim();
  if (!email || !/.+@.+\..+/.test(email)) {
    return json({ error: 'A valid email is required.' }, 400);
  }

  const passes: PassEntry[] = Array.isArray(body.passes)
    ? body.passes.map((p: any) => ({
        operatorName: String(p.operatorName || ''),
        tierName: String(p.tierName || ''),
        parkCount: p.parkCount ? String(p.parkCount) : undefined,
      }))
    : [];

  const source = String(body.source || '').trim();
  const referrer = String(body.referrer || '').trim();

  const signup = await addSignup({
    type: 'beta',
    email,
    name: String(body.name || '').trim() || undefined,
    passes,
    iphone: String(body.iphone || '').trim() || undefined,
    ios: String(body.ios || '').trim() || undefined,
    cadence: String(body.cadence || '').trim() || undefined,
    testflight: String(body.testflight || '').trim() || undefined,
    why: String(body.why || '').trim() || undefined,
    source: source || (referrer ? `(referrer) ${referrer}` : undefined),
    createdAt: Date.now(),
  });

  const settings = await getSettings();
  if (settings.betaEmails) await emailBetaApplication(signup);

  return json({ ok: true });
};
