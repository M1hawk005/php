import { prisma } from '@/lib/prisma';
import { isForumAdmin } from '@/lib/forum-auth';
import ThreadCard from '@/components/forum/ThreadCard';
import CreateThreadForm from '@/components/forum/CreateThreadForm';
import ForumAdminBar from '@/components/forum/ForumAdminBar';

export const dynamic = 'force-dynamic';

export default async function ForumPage() {
  const admin = await isForumAdmin();
  let threads: Awaited<ReturnType<typeof prisma.thread.findMany>> = [];
  let unavailable = false;
  try {
    threads = await prisma.thread.findMany({
      where: admin ? undefined : { is_archived: false },
      orderBy: [{ is_pinned: 'desc' }, { bumped_at: 'desc' }],
    });
  } catch (error) {
    unavailable = true;
    console.error('Error fetching threads:', error);
  }

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 pb-12 pt-28 md:px-8">
      <header className="mb-8 text-center">
        <h1 className="mb-2 font-mono text-4xl font-bold">/forum/</h1>
        <p className="text-muted-foreground">Anonymous discussion board. Vote thoughtfully; the strongest active threads remain visible.</p>
      </header>
      <ForumAdminBar isAdmin={admin} />
      <div className="mb-12"><CreateThreadForm /></div>
      {unavailable ? (
        <div className="border border-red-500/30 bg-red-500/5 p-8 text-center text-red-300">The board is temporarily unavailable. Please try again shortly.</div>
      ) : threads.length ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {threads.map((thread) => (
            <ThreadCard
              key={thread.id}
              id={thread.id}
              title={thread.title}
              content={thread.content}
              imageUrl={thread.image_url}
              createdAt={thread.created_at.toISOString()}
              replyCount={thread.reply_count}
              upvotes={thread.upvotes}
              downvotes={thread.downvotes}
              authorIsAdmin={thread.is_admin}
              pinned={thread.is_pinned}
              archived={thread.is_archived}
              viewerIsAdmin={admin}
            />
          ))}
        </div>
      ) : (
        <div className="border border-dashed border-border py-12 text-center text-muted-foreground">No threads yet. Be the first to post.</div>
      )}
    </main>
  );
}
