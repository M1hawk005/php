import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { isForumAdmin } from '@/lib/forum-auth';
import Post from '@/components/forum/Post';
import ReplyForm from '@/components/forum/ReplyForm';
import { FORUM_LIMITS } from '@/lib/forum-limits';
import { isUuid } from '@/lib/forum-security';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ threadId: string; postId: string }>;
};

export default async function CommentDiscussionPage({ params }: Props) {
  const { threadId, postId } = await params;
  if (!isUuid(threadId) || !isUuid(postId)) notFound();
  const admin = await isForumAdmin();
  const thread = await prisma.thread.findUnique({
    where: { id: threadId },
    select: { id: true, title: true, is_archived: true },
  });
  if (!thread || (thread.is_archived && !admin)) notFound();

  const comment = await prisma.post.findFirst({
    where: { id: postId, thread_id: threadId, parent_post_id: null },
    include: { replies: { orderBy: { created_at: 'asc' }, take: FORUM_LIMITS.repliesPerComment } },
  });
  if (!comment) notFound();

  const threadHref = `/forum/${threadId}`;

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 pb-12 pt-24 md:px-8">
      <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Link href="/forum" className="flex items-center gap-1 hover:text-primary"><ArrowLeft size={15} /> Board</Link>
        <ChevronRight size={14} />
        <Link href={threadHref} className="max-w-xs truncate hover:text-primary">{thread.title}</Link>
        <ChevronRight size={14} />
        <span className="text-foreground">Comment {comment.id.slice(0, 8)}</span>
      </nav>

      <header className="mb-4">
        <p className="font-mono text-xs uppercase tracking-wider text-primary">Comment discussion</p>
        <h1 className="mt-1 text-2xl font-bold">Replies to this comment</h1>
      </header>

      <Post
        id={comment.id}
        threadId={threadId}
        content={comment.content}
        imageUrl={comment.image_url}
        createdAt={comment.created_at.toISOString()}
        authorIsAdmin={comment.is_admin}
        viewerIsAdmin={admin}
        upvotes={comment.upvotes}
        downvotes={comment.downvotes}
        replyCount={comment.reply_count}
        allowDiscussion={false}
        deleteRedirectTo={threadHref}
      />

      <section className="ml-4 border-l border-border pl-4 md:ml-8 md:pl-8">
        <h2 className="mb-4 text-lg font-bold">Direct replies</h2>
        {comment.replies.length ? (
          comment.replies.map((reply, index) => (
            <Post
              key={reply.id}
              id={reply.id}
              threadId={threadId}
              content={reply.content}
              imageUrl={reply.image_url}
              createdAt={reply.created_at.toISOString()}
              index={index}
              authorIsAdmin={reply.is_admin}
              viewerIsAdmin={admin}
              upvotes={reply.upvotes}
              downvotes={reply.downvotes}
              allowDiscussion={false}
            />
          ))
        ) : (
          <div className="border border-dashed border-border p-6 text-center text-sm text-muted-foreground">No replies to this comment yet.</div>
        )}
      </section>

      {(!thread.is_archived || admin) && <ReplyForm threadId={threadId} parentPostId={comment.id} />}
    </main>
  );
}
