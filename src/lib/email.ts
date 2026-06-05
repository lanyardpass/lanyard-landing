// Resend email notifications. Uses the same env vars the old beta function did:
//   RESEND_API_KEY, FROM_ADDRESS, TO_ADDRESS
// (set in Netlify → Site configuration → Environment variables).
// Returns true on success; never throws — a failed notification must not fail
// the signup (it's already safely stored in Blobs).

import type { Signup } from './signups';

const RESEND_ENDPOINT = 'https://api.resend.com/emails';

async function send(opts: { subject: string; text: string; replyTo?: string }): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.FROM_ADDRESS || 'Lanyard <hello@lanyardpass.com>';
  const to = process.env.TO_ADDRESS || 'dan@lanyardpass.com';
  if (!apiKey) {
    console.error('RESEND_API_KEY missing — skipping notification');
    return false;
  }
  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to,
        reply_to: opts.replyTo,
        subject: opts.subject,
        text: opts.text,
      }),
    });
    if (!res.ok) {
      console.error('Resend error', res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error('Resend fetch failed', err);
    return false;
  }
}

export async function emailWaitlistSignup(s: Signup): Promise<boolean> {
  const sourceLine = s.source || 'direct / unknown';
  return send({
    subject: `Waitlist signup — ${s.email}`,
    replyTo: s.email,
    text: [
      'New Lanyard waitlist signup',
      '',
      `Email:  ${s.email}`,
      `Source: ${sourceLine}`,
    ].join('\n'),
  });
}

export async function emailBetaApplication(s: Signup): Promise<boolean> {
  const passLines = s.passes && s.passes.length
    ? s.passes
        .map((p) => {
          let line = `  • ${p.operatorName} — ${p.tierName}`;
          if (p.parkCount) line += ` (${p.parkCount}-park)`;
          return line;
        })
        .join('\n')
    : '  (none selected)';

  const text = [
    'New Lanyard beta application',
    '',
    `Name:    ${s.name || '(no name given)'}`,
    `Email:   ${s.email}`,
    `iPhone:  ${s.iphone || '—'}`,
    `iOS:     ${s.ios || '—'}`,
    `Visits:  ${s.cadence || '—'}`,
    `TestFlight: ${s.testflight || '—'}`,
    `Source:  ${s.source || 'direct / unknown'}`,
    '',
    'Passes:',
    passLines,
    '',
    'Why they want to test:',
    s.why ? `  ${s.why}` : '  (blank)',
  ].join('\n');

  return send({ subject: `Beta application — ${s.name || s.email}`, replyTo: s.email, text });
}
