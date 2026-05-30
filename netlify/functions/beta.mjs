// Beta-tester application handler.
// Receives the /beta form POST and emails the application to TO_ADDRESS via
// Resend. No external deps — uses global fetch to call the Resend REST API,
// so the static site stays build-free (no package.json / npm install).
//
// Env vars (set in Netlify → Site configuration → Environment variables):
//   RESEND_API_KEY  — sending-only key scoped to lanyardpass.com
//   FROM_ADDRESS    — e.g. "Lanyard <hello@lanyardpass.com>"
//   TO_ADDRESS      — where applications land, e.g. "dan@lanyardpass.com"

const RESEND_ENDPOINT = 'https://api.resend.com/emails';

export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  let body;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  // Honeypot: bots fill hidden fields, humans don't. Silently accept + drop.
  if (body.botField) return json({ ok: true });

  const email = String(body.email || '').trim();
  if (!email || !/.+@.+\..+/.test(email)) {
    return json({ error: 'A valid email is required.' }, 400);
  }

  const name = String(body.name || '').trim() || '(no name given)';
  const passes = Array.isArray(body.passes) ? body.passes : [];
  const iphone = String(body.iphone || '').trim();
  const ios = String(body.ios || '').trim();
  const cadence = String(body.cadence || '').trim();
  const testflight = String(body.testflight || '').trim();
  const why = String(body.why || '').trim();

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.FROM_ADDRESS || 'Lanyard <hello@lanyardpass.com>';
  const to = process.env.TO_ADDRESS || 'dan@lanyardpass.com';
  if (!apiKey) {
    console.error('RESEND_API_KEY missing');
    return json({ error: 'Server not configured.' }, 500);
  }

  const passLines = passes.length
    ? passes
        .map((p) => {
          let line = `  • ${p.operatorName} — ${p.tierName}`;
          const extras = [];
          if (p.parkCount) extras.push(`${p.parkCount}-park`);
          if (extras.length) line += ` (${extras.join(', ')})`;
          return line;
        })
        .join('\n')
    : '  (none selected)';

  const text = [
    'New Lanyard beta application',
    '',
    `Name:    ${name}`,
    `Email:   ${email}`,
    `iPhone:  ${iphone || '—'}`,
    `iOS:     ${ios || '—'}`,
    `Visits:  ${cadence || '—'}`,
    `TestFlight: ${testflight || '—'}`,
    '',
    'Passes:',
    passLines,
    '',
    'Why they want to test:',
    why ? `  ${why}` : '  (blank)',
  ].join('\n');

  let res;
  try {
    res = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to,
        reply_to: email, // reply straight to the applicant
        subject: `Beta application — ${name}`,
        text,
      }),
    });
  } catch (err) {
    console.error('Resend fetch failed', err);
    return json({ error: 'Could not send. Please try again.' }, 502);
  }

  if (!res.ok) {
    console.error('Resend error', res.status, await res.text());
    return json({ error: 'Could not send. Please try again.' }, 502);
  }

  return json({ ok: true });
};

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
