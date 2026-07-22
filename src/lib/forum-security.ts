import 'server-only';

import { createHash } from 'crypto';
import { headers } from 'next/headers';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { FORUM_LIMITS } from '@/lib/forum-limits';

export function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function forumSecuritySalt() {
  const salt = process.env.RATE_LIMIT_SALT || process.env.FORUM_ADMIN_SESSION_SECRET;
  if (!salt && process.env.NODE_ENV === 'production') {
    throw new Error('RATE_LIMIT_SALT or FORUM_ADMIN_SESSION_SECRET must be configured in production.');
  }
  return salt || 'local-development';
}

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
  const match = /^data:image\/(png|webp);base64,([a-z0-9+/=]+)$/i.exec(value);
  if (!match) {
    return { error: 'Only generated PNG or WebP ASCII images are accepted.' } as const;
  }
  if (value.length > FORUM_LIMITS.imageDataUrl) return { error: 'Generated ASCII image is too large.' } as const;

  const bytes = Buffer.from(match[2], 'base64');
  if (!bytes.length || bytes.length > FORUM_LIMITS.imageBytes) return { error: 'Generated ASCII image is too large.' } as const;
  const dimensions = match[1].toLowerCase() === 'png' ? pngDimensions(bytes) : webpDimensions(bytes);
  if (!dimensions) return { error: 'Attachment data is not a valid PNG or WebP image.' } as const;
  if (
    dimensions.width > FORUM_LIMITS.imageWidth
    || dimensions.height > FORUM_LIMITS.imageHeight
    || dimensions.width * dimensions.height > FORUM_LIMITS.imagePixels
  ) {
    return { error: 'Generated ASCII image dimensions are too large.' } as const;
  }
  return { imageUrl: value } as const;
}

function pngDimensions(bytes: Buffer) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (bytes.length < 45 || !bytes.subarray(0, 8).equals(signature)) return null;
  let offset = 8;
  let dimensions: { width: number; height: number } | null = null;
  while (offset + 12 <= bytes.length) {
    const length = bytes.readUInt32BE(offset);
    const type = bytes.toString('ascii', offset + 4, offset + 8);
    const nextOffset = offset + 12 + length;
    if (nextOffset > bytes.length) return null;
    if (offset === 8) {
      if (type !== 'IHDR' || length !== 13) return null;
      dimensions = { width: bytes.readUInt32BE(offset + 8), height: bytes.readUInt32BE(offset + 12) };
    }
    if (type === 'IEND') return length === 0 && nextOffset === bytes.length ? dimensions : null;
    offset = nextOffset;
  }
  return null;
}

function webpDimensions(bytes: Buffer) {
  if (
    bytes.length < 30
    || bytes.toString('ascii', 0, 4) !== 'RIFF'
    || bytes.toString('ascii', 8, 12) !== 'WEBP'
    || bytes.readUInt32LE(4) + 8 !== bytes.length
  ) return null;
  const chunk = bytes.toString('ascii', 12, 16);
  if (chunk === 'VP8X') {
    return { width: 1 + bytes.readUIntLE(24, 3), height: 1 + bytes.readUIntLE(27, 3) };
  }
  if (chunk === 'VP8L' && bytes[20] === 0x2f) {
    return {
      width: 1 + bytes[21] + ((bytes[22] & 0x3f) << 8),
      height: 1 + (bytes[22] >> 6) + (bytes[23] << 2) + ((bytes[24] & 0x0f) << 10),
    };
  }
  if (chunk === 'VP8 ' && bytes[23] === 0x9d && bytes[24] === 0x01 && bytes[25] === 0x2a) {
    return { width: bytes.readUInt16LE(26) & 0x3fff, height: bytes.readUInt16LE(28) & 0x3fff };
  }
  return null;
}

async function fingerprint() {
  const requestHeaders = await headers();
  const configuredHeader = process.env.FORUM_IP_HEADER?.trim().toLowerCase();
  const fallbackHeader = process.env.NODE_ENV === 'production' ? null : 'x-forwarded-for';
  const headerName = configuredHeader || fallbackHeader;
  const rawIp = headerName ? requestHeaders.get(headerName) : null;
  const ip = rawIp?.split(',')[0]?.trim().slice(0, 128) || 'shared-client';
  return createHash('sha256').update(`${forumSecuritySalt()}:${ip}`).digest('hex');
}

export async function acquireTransactionLock(tx: Prisma.TransactionClient, key: string) {
  await tx.$queryRaw<{ lock: string }[]>`
    SELECT pg_advisory_xact_lock(hashtext(${key}))::text AS lock
  `;
}

export async function enforceRateLimit(action: string, limit: number, windowSeconds: number) {
  const key = await fingerprint();
  const since = new Date(Date.now() - windowSeconds * 1000);
  return prisma.$transaction(async (tx) => {
    await acquireTransactionLock(tx, `${key}:${action}`);
    const count = await tx.rateLimitEvent.count({
      where: { fingerprint: key, action, created_at: { gte: since } },
    });
    if (count >= limit) return false;
    await tx.rateLimitEvent.create({ data: { fingerprint: key, action } });
    await tx.rateLimitEvent.deleteMany({
      where: { created_at: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
    });
    return true;
  });
}
