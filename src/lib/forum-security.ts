import 'server-only';

import { createHash } from 'crypto';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { FORUM_LIMITS } from '@/lib/forum-limits';

export function validateForumText(title: string, content: string) {
  const cleanTitle = title.trim() || 'Untitled Thread';
  const cleanContent = content.trim();
  if (!cleanContent) return { error: 'Content is required.' } as const;
  if (cleanTitle.length > FORUM_LIMITS.title) {
    return { error: `Subject must be ${FORUM_LIMITS.title} characters or fewer.` } as const;
  }
  if (cleanContent.length > FORUM_LIMITS.content) {
    return { error: `Content must be ${FORUM_LIMITS.content} characters or fewer.` } as const;
  }
  return { title: cleanTitle, content: cleanContent } as const;
}

export function validateAsciiImage(value: FormDataEntryValue | null) {
  if (!value) return { imageUrl: null } as const;
  if (typeof value !== 'string') return { error: 'Invalid attachment.' } as const;
  if (!/^data:image\/(png|webp);base64,[a-z0-9+/=]+$/i.test(value)) {
    return { error: 'Only generated PNG or WebP ASCII images are accepted.' } as const;
  }
  if (value.length > FORUM_LIMITS.imageDataUrl) return { error: 'Generated ASCII image is too large.' } as const;
  return { imageUrl: value } as const;
}

async function fingerprint() {
  const requestHeaders = await headers();
  const forwarded = requestHeaders.get('x-forwarded-for')?.split(',')[0]?.trim();
  const ip = forwarded || requestHeaders.get('x-real-ip') || 'unknown';
  const agent = requestHeaders.get('user-agent') || 'unknown';
  const salt = process.env.RATE_LIMIT_SALT || process.env.FORUM_ADMIN_SESSION_SECRET || 'local-development';
  return createHash('sha256').update(`${salt}:${ip}:${agent}`).digest('hex');
}

export async function enforceRateLimit(action: string, limit: number, windowSeconds: number) {
  const key = await fingerprint();
  const since = new Date(Date.now() - windowSeconds * 1000);
  return prisma.$transaction(async (tx) => {
    const count = await tx.rateLimitEvent.count({
      where: { fingerprint: key, action, created_at: { gte: since } },
    });
    if (count >= limit) return false;
    await tx.rateLimitEvent.create({ data: { fingerprint: key, action } });
    return true;
  });
}
