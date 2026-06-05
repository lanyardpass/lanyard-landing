import type { APIRoute } from 'astro';
import { isAuthed } from '@/lib/admin-auth';
import { listSignups, type Signup, type SignupType } from '@/lib/signups';

export const prerender = false;

const COLUMNS: (keyof Signup)[] = [
  'createdAt', 'type', 'email', 'name', 'iphone', 'ios',
  'cadence', 'testflight', 'source', 'passes', 'why',
];

function cell(value: unknown): string {
  let s: string;
  if (Array.isArray(value)) {
    s = (value as Signup['passes'])!
      .map((p) => `${p.operatorName} ${p.tierName}${p.parkCount ? ` (${p.parkCount}-park)` : ''}`)
      .join(' | ');
  } else if (value == null) {
    s = '';
  } else {
    s = String(value);
  }
  // Always quote; escape embedded quotes.
  return `"${s.replace(/"/g, '""')}"`;
}

export const GET: APIRoute = async ({ cookies, url }) => {
  if (!isAuthed(cookies)) return new Response('Unauthorized', { status: 401 });

  const t = url.searchParams.get('type');
  const type: SignupType | undefined = t === 'beta' || t === 'waitlist' ? t : undefined;
  const rows = await listSignups(type);

  const header = COLUMNS.join(',');
  const body = rows
    .map((r) =>
      COLUMNS.map((c) =>
        c === 'createdAt' ? cell(new Date(r.createdAt).toISOString()) : cell(r[c]),
      ).join(','),
    )
    .join('\n');

  return new Response(`${header}\n${body}\n`, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="lanyard-signups-${type || 'all'}.csv"`,
    },
  });
};
