import type { APIRoute } from 'astro';
import { passwordOk, makeSession, ADMIN_COOKIE } from '@/lib/admin-auth';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const form = await request.formData();
  const password = String(form.get('password') || '');
  if (!passwordOk(password)) return redirect('/admin?error=1', 303);

  cookies.set(ADMIN_COOKIE, makeSession(), {
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: 'lax',
    path: '/',
    maxAge: 30 * 24 * 60 * 60,
  });
  return redirect('/admin', 303);
};
