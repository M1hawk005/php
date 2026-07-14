import 'server-only';

import { createHash, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';

const ADMIN_COOKIE = 'portfolio_forum_admin';

function digest(value: string) {
  return createHash('sha256').update(value).digest('hex');
}

function adminToken() {
  const password = process.env.FORUM_ADMIN_PASSWORD;
  const sessionSecret = process.env.FORUM_ADMIN_SESSION_SECRET;
  if (!password || !sessionSecret) return null;
  return digest(`${password}:${sessionSecret}`);
}

function safeEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function verifyAdminPassword(password: string) {
  const expected = process.env.FORUM_ADMIN_PASSWORD;
  return Boolean(expected && safeEqual(digest(password), digest(expected)));
}

export async function isForumAdmin() {
  const expected = adminToken();
  if (!expected) return false;
  const value = (await cookies()).get(ADMIN_COOKIE)?.value;
  return Boolean(value && safeEqual(value, expected));
}

export async function setForumAdminSession() {
  const token = adminToken();
  if (!token) throw new Error('Forum admin credentials are not configured.');
  (await cookies()).set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/forum',
    maxAge: 60 * 60 * 12,
  });
}

export async function clearForumAdminSession() {
  (await cookies()).set(ADMIN_COOKIE, '', {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/forum',
    expires: new Date(0),
    maxAge: 0,
  });
}
