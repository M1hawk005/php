'use server';

import { createHash } from 'crypto';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { clearForumAdminSession, isForumAdmin, setForumAdminSession, verifyAdminPassword } from '@/lib/forum-auth';
import { enforceRateLimit, validateAsciiImage, validateForumText } from '@/lib/forum-security';

type ForumTarget = 'thread' | 'post';
type ModerationAction = 'delete' | 'pin' | 'unpin' | 'archive' | 'restore';

function refresh(threadId?: string, postId?: string) {
  revalidatePath('/forum');
  if (threadId) revalidatePath(`/forum/${threadId}`);
  if (threadId && postId) revalidatePath(`/forum/${threadId}/comments/${postId}`);
}

function identityHash(value: string) {
  if (!/^[0-9a-f-]{36}$/i.test(value)) return null;
  const salt = process.env.RATE_LIMIT_SALT || process.env.FORUM_ADMIN_SESSION_SECRET || 'local-development';
  return createHash('sha256').update(`${salt}:${value}`).digest('hex');
}

async function enforceThreadRetention() {
  const configured = Number(process.env.FORUM_MAX_THREADS || 50);
  const maximum = Math.min(200, Math.max(10, Number.isFinite(configured) ? configured : 50));
  const threads = await prisma.thread.findMany({
    where: { is_archived: false, is_pinned: false },
    select: { id: true, reply_count: true, upvotes: true, downvotes: true, bumped_at: true },
  });
  if (threads.length <= maximum) return;
  const now = Date.now();
  const ranked = threads.sort((a, b) => {
    const score = (item: typeof a) => {
      const ageDays = Math.max(0, (now - item.bumped_at.getTime()) / 86_400_000);
      return (item.upvotes - item.downvotes) * 4 + item.reply_count * 2 + Math.max(0, 30 - ageDays) / 4;
    };
    return score(b) - score(a);
  });
  await prisma.thread.updateMany({
    where: { id: { in: ranked.slice(maximum).map((item) => item.id) } },
    data: { is_archived: true },
  });
}

async function deleteForumRecord(targetType: ForumTarget, targetId: string) {
  if (targetType === 'thread') {
    await prisma.$transaction(async (tx) => {
      const posts = await tx.post.findMany({ where: { thread_id: targetId }, select: { id: true } });
      await tx.forumVote.deleteMany({
        where: { target_id: { in: [targetId, ...posts.map((post) => post.id)] } },
      });
      await tx.thread.delete({ where: { id: targetId } });
    });
    refresh(targetId);
    return;
  }

  const affected = await prisma.$transaction(async (tx) => {
    const post = await tx.post.findUnique({
      where: { id: targetId },
      select: { thread_id: true, parent_post_id: true },
    });
    if (!post) throw new Error('NOT_FOUND');
    const children = await tx.post.findMany({ where: { parent_post_id: targetId }, select: { id: true } });
    await tx.forumVote.deleteMany({
      where: { target_id: { in: [targetId, ...children.map((child) => child.id)] } },
    });
    await tx.post.delete({ where: { id: targetId } });

    const threadCount = await tx.post.count({ where: { thread_id: post.thread_id } });
    await tx.thread.update({ where: { id: post.thread_id }, data: { reply_count: threadCount } });

    if (post.parent_post_id) {
      const childCount = await tx.post.count({ where: { parent_post_id: post.parent_post_id } });
      await tx.post.update({ where: { id: post.parent_post_id }, data: { reply_count: childCount } });
    }
    return { threadId: post.thread_id, parentId: post.parent_post_id || targetId };
  });
  refresh(affected.threadId, affected.parentId);
}

export async function loginForumAdmin(formData: FormData) {
  const password = String(formData.get('password') || '');
  if (!(await enforceRateLimit('admin-login', 5, 15 * 60))) return { error: 'Too many login attempts. Try again later.' };
  if (!verifyAdminPassword(password)) return { error: 'Invalid admin password.' };
  try {
    await setForumAdminSession();
    refresh();
    return { success: true };
  } catch {
    return { error: 'Forum admin credentials are not configured.' };
  }
}

export async function logoutForumAdmin() {
  await clearForumAdminSession();
  refresh();
  return { success: true };
}

export async function createThread(formData: FormData) {
  const admin = await isForumAdmin();
  if (!admin && !(await enforceRateLimit('create-thread', 3, 10 * 60))) {
    return { error: 'Thread limit reached. Please wait before posting again.' };
  }
  const ownerHash = identityHash(String(formData.get('ownerId') || ''));
  if (!ownerHash) return { error: 'Unable to establish post ownership. Refresh and try again.' };
  const text = validateForumText(String(formData.get('title') || ''), String(formData.get('content') || ''));
  if ('error' in text) return text;
  const image = validateAsciiImage(formData.get('imageUrl'));
  if ('error' in image) return image;

  try {
    const thread = await prisma.thread.create({
      data: {
        title: text.title,
        content: text.content,
        image_url: image.imageUrl,
        owner_hash: ownerHash,
        is_admin: admin,
      },
      select: { id: true },
    });
    await enforceThreadRetention();
    refresh(thread.id);
    return { success: true, thread };
  } catch (error) {
    console.error('Error creating thread:', error);
    return { error: 'Failed to create thread.' };
  }
}

export async function createReply(formData: FormData) {
  const admin = await isForumAdmin();
  if (!admin && !(await enforceRateLimit('create-reply', 10, 10 * 60))) {
    return { error: 'Reply limit reached. Please wait before posting again.' };
  }

  const ownerHash = identityHash(String(formData.get('ownerId') || ''));
  if (!ownerHash) return { error: 'Unable to establish comment ownership. Refresh and try again.' };
  const threadId = String(formData.get('threadId') || '');
  const parentPostId = String(formData.get('parentPostId') || '') || null;
  const text = validateForumText('', String(formData.get('content') || ''));
  if (!threadId || 'error' in text) return 'error' in text ? text : { error: 'Missing thread.' };
  const image = validateAsciiImage(formData.get('imageUrl'));
  if ('error' in image) return image;

  try {
    const post = await prisma.$transaction(async (tx) => {
      const thread = await tx.thread.findUnique({ where: { id: threadId }, select: { is_archived: true } });
      if (!thread || (thread.is_archived && !admin)) throw new Error('THREAD_UNAVAILABLE');

      if (parentPostId) {
        const parent = await tx.post.findUnique({
          where: { id: parentPostId },
          select: { thread_id: true, parent_post_id: true },
        });
        if (!parent || parent.thread_id !== threadId) throw new Error('COMMENT_UNAVAILABLE');
        if (parent.parent_post_id) throw new Error('MAX_DEPTH');
      }

      const created = await tx.post.create({
        data: {
          thread_id: threadId,
          parent_post_id: parentPostId,
          content: text.content,
          image_url: image.imageUrl,
          owner_hash: ownerHash,
          is_admin: admin,
        },
        select: { id: true },
      });

      if (parentPostId) {
        await tx.post.update({
          where: { id: parentPostId },
          data: { reply_count: { increment: 1 } },
        });
      }
      await tx.thread.update({
        where: { id: threadId },
        data: { reply_count: { increment: 1 }, bumped_at: new Date() },
      });
      return created;
    });

    await enforceThreadRetention();
    refresh(threadId, parentPostId || undefined);
    return { success: true, post };
  } catch (error) {
    if (error instanceof Error && error.message === 'THREAD_UNAVAILABLE') return { error: 'This thread is unavailable or archived.' };
    if (error instanceof Error && error.message === 'COMMENT_UNAVAILABLE') return { error: 'This comment is unavailable.' };
    if (error instanceof Error && error.message === 'MAX_DEPTH') return { error: 'Comment discussions are limited to one reply level.' };
    console.error('Error creating reply:', error);
    return { error: 'Failed to post reply.' };
  }
}

export async function voteForumItem(targetType: ForumTarget, targetId: string, direction: 1 | -1, voterId: string) {
  if (!/^[0-9a-f-]{36}$/i.test(targetId) || !/^[0-9a-f-]{36}$/i.test(voterId)) return { error: 'Invalid vote.' };
  if (!(await enforceRateLimit('forum-vote', 60, 60))) return { error: 'Voting too quickly.' };
  const voterHash = identityHash(voterId);
  if (!voterHash) return { error: 'Invalid vote.' };

  try {
    const counts = await prisma.$transaction(async (tx) => {
      const key = { target_type: targetType, target_id: targetId, voter_hash: voterHash };
      const existing = await tx.forumVote.findUnique({ where: { target_type_target_id_voter_hash: key } });
      const selectedDirection: 1 | -1 | 0 = existing?.direction === direction ? 0 : direction;
      let upDelta = 0;
      let downDelta = 0;
      if (existing?.direction === direction) {
        await tx.forumVote.delete({ where: { id: existing.id } });
        if (direction === 1) upDelta = -1;
        else downDelta = -1;
      } else {
        await tx.forumVote.upsert({
          where: { target_type_target_id_voter_hash: key },
          update: { direction },
          create: { ...key, direction },
        });
        if (!existing) {
          if (direction === 1) upDelta = 1;
          else downDelta = 1;
        } else if (direction === 1) {
          upDelta = 1;
          downDelta = -1;
        } else {
          upDelta = -1;
          downDelta = 1;
        }
      }
      const data = { upvotes: { increment: upDelta }, downvotes: { increment: downDelta } };
      const updated = targetType === 'thread'
        ? tx.thread.update({ where: { id: targetId }, data, select: { upvotes: true, downvotes: true } })
        : tx.post.update({ where: { id: targetId }, data, select: { upvotes: true, downvotes: true } });
      return { ...(await updated), direction: selectedDirection };
    });
    refresh(targetType === 'thread' ? targetId : undefined);
    return { success: true, ...counts };
  } catch {
    return { error: 'Unable to record vote.' };
  }
}

export async function getForumVote(targetType: ForumTarget, targetId: string, voterId: string) {
  const voterHash = identityHash(voterId);
  if (!/^[0-9a-f-]{36}$/i.test(targetId) || !voterHash) return { direction: 0 as const };
  const vote = await prisma.forumVote.findUnique({
    where: {
      target_type_target_id_voter_hash: {
        target_type: targetType,
        target_id: targetId,
        voter_hash: voterHash,
      },
    },
    select: { direction: true },
  });
  const direction: 1 | -1 | 0 = vote?.direction === 1 || vote?.direction === -1 ? vote.direction : 0;
  return { direction };
}

export async function deleteForumItem(targetType: ForumTarget, targetId: string, ownerId: string) {
  const admin = await isForumAdmin();
  const ownerHash = identityHash(ownerId);
  if (!admin && !ownerHash) return { error: 'Unable to verify ownership.' };

  const record = targetType === 'thread'
    ? await prisma.thread.findUnique({ where: { id: targetId }, select: { owner_hash: true } })
    : await prisma.post.findUnique({ where: { id: targetId }, select: { owner_hash: true } });
  if (!record) return { error: 'Content not found.' };
  if (!admin && record.owner_hash !== ownerHash) return { error: 'You can only delete your own content.' };

  try {
    await deleteForumRecord(targetType, targetId);
    return { success: true };
  } catch {
    return { error: 'Delete failed.' };
  }
}

export async function moderateForumItem(targetType: ForumTarget, targetId: string, action: ModerationAction) {
  if (!(await isForumAdmin())) return { error: 'Administrator access required.' };
  try {
    if (action === 'delete') {
      await deleteForumRecord(targetType, targetId);
      return { success: true };
    }
    if (targetType !== 'thread') return { error: 'Unsupported moderation action.' };

    const data =
      action === 'pin' ? { is_pinned: true, is_archived: false }
      : action === 'unpin' ? { is_pinned: false }
      : action === 'archive' ? { is_archived: true, is_pinned: false }
      : { is_archived: false };
    await prisma.thread.update({ where: { id: targetId }, data });
    await enforceThreadRetention();
    refresh(targetId);
    return { success: true };
  } catch {
    return { error: 'Moderation action failed.' };
  }
}
