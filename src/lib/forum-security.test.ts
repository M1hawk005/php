import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
vi.mock('next/headers', () => ({ headers: vi.fn() }));
vi.mock('@/lib/prisma', () => ({ prisma: {} }));

import type { Prisma } from '@prisma/client';
import { acquireTransactionLock, isUuid, validateAsciiImage } from './forum-security';

function pngDataUrl(width: number, height: number) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(25);
  ihdr.writeUInt32BE(13, 0);
  ihdr.write('IHDR', 4, 'ascii');
  ihdr.writeUInt32BE(width, 8);
  ihdr.writeUInt32BE(height, 12);
  ihdr[16] = 8;
  ihdr[17] = 6;
  const iend = Buffer.alloc(12);
  iend.write('IEND', 4, 'ascii');
  return `data:image/png;base64,${Buffer.concat([signature, ihdr, iend]).toString('base64')}`;
}

describe('forum security validation', () => {
  beforeEach(() => vi.clearAllMocks());

  it('accepts canonical UUIDs and rejects loose UUID-like strings', () => {
    expect(isUuid('123e4567-e89b-42d3-a456-426614174000')).toBe(true);
    expect(isUuid('------------------------------------')).toBe(false);
    expect(isUuid('123e4567e89b42d3a456426614174000')).toBe(false);
  });

  it('accepts an in-bounds PNG structure', () => {
    expect(validateAsciiImage(pngDataUrl(432, 320))).toEqual({ imageUrl: pngDataUrl(432, 320) });
  });

  it('rejects spoofed image data and oversized dimensions', () => {
    const spoofed = `data:image/png;base64,${Buffer.from('not an image').toString('base64')}`;
    expect(validateAsciiImage(spoofed)).toEqual({ error: 'Attachment data is not a valid PNG or WebP image.' });
    expect(validateAsciiImage(pngDataUrl(20_000, 20_000))).toEqual({ error: 'Generated ASCII image dimensions are too large.' });
  });

  it('casts PostgreSQL advisory-lock results to a Prisma-supported type', async () => {
    const queryRaw = vi.fn().mockResolvedValue([{ lock: '' }]);
    const transaction = { $queryRaw: queryRaw } as unknown as Prisma.TransactionClient;

    await acquireTransactionLock(transaction, 'forum-test-lock');

    expect(queryRaw).toHaveBeenCalledOnce();
    const sql = (queryRaw.mock.calls[0][0] as TemplateStringsArray).join('?');
    expect(sql).toContain('pg_advisory_xact_lock');
    expect(sql).toContain('::text AS lock');
    expect(queryRaw.mock.calls[0][1]).toBe('forum-test-lock');
  });
});
