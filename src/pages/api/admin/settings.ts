import type { APIRoute } from 'astro';
import { isAuthed } from '@/lib/admin-auth';
import { setSettings, type Settings } from '@/lib/signups';

export const prerender = false;

const FIELDS: (keyof Settings)[] = ['betaEmails', 'waitlistEmails'];

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  if (!isAuthed(cookies)) return redirect('/admin', 303);

  const form = await request.formData();
  const field = String(form.get('field') || '') as keyof Settings;
  if (!FIELDS.includes(field)) return redirect('/admin', 303);

  await setSettings({ [field]: form.get('value') === 'on' });
  return redirect('/admin', 303);
};
