import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Archive, Pin } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { isForumAdmin } from '@/lib/forum-auth';
import Post from '@/components/forum/Post';
import ReplyForm from '@/components/forum/ReplyForm';
import AdminControls from '@/components/forum/AdminControls';

export const dynamic = 'force-dynamic';

export default async function ThreadPage({ params }: { params: Promise<{ threadId: string }> }) {
  const { threadId } = await params;
  const admin = await isForumAdmin();
  const thread = await prisma.thread.findUnique({
    where: { id: threadId },
    include: {
      posts: {
        where: { parent_post_id: null },
        orderBy: { created_at: 'asc' },
      },
    },
  });
  if (!thread || (thread.is_archived && !admin)) notFound();

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 pb-12 pt-24 md:px-8">
      <Link href="/forum" className="mb-4 flex items-center gap-2 text-muted-foreground transition-colors hover:text-primary"><ArrowLeft size={16} /> Back to Board</Link>
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            {thread.is_pinned && <Pin size={18} className="text-primary" />}
            <h1 className="break-words text-2xl font-bold md:text-3xl">{thread.title}</h1>
          </div>
          {thread.is_archived && <p className="mt-2 flex items-center gap-1 text-sm text-amber-400"><Archive size={14} /> Archived — visible to administrators only</p>}
        </div>
        {admin && <AdminControls targetType="thread" targetId={thread.id} pinned={thread.is_pinned} archived={thread.is_archived} />}
      </header>

      <Post
        id={thread.id}
        threadId={thread.id}
        content={thread.content}
        imageUrl={thread.image_url}
        createdAt={thread.created_at.toISOString()}
        isOp
        index={0}
        authorIsAdmin={thread.is_admin}
        viewerIsAdmin={admin}
        upvotes={thread.upvotes}
        downvotes={thread.downvotes}
      />

      <section className="mt-8">
        <h2 className="mb-4 text-xl font-bold">Comments</h2>
        {thread.posts.length ? (
          thread.posts.map((post, index) => (
            <Post
              key={post.id}
              id={post.id}
              threadId={thread.id}
              content={post.content}
              imageUrl={post.image_url}
              createdAt={post.created_at.toISOString()}
              index={index + 1}
              authorIsAdmin={post.is_admin}
              viewerIsAdmin={admin}
              upvotes={post.upvotes}
              downvotes={post.downvotes}
              replyCount={post.reply_count}
            />
          ))
        ) : (
          <div className="border border-dashed border-border p-8 text-center text-muted-foreground">No comments yet.</div>
        )}
      </section>

      {(!thread.is_archived || admin) && <ReplyForm threadId={threadId} />}
    </main>
  );
}
