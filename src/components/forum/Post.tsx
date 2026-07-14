'use client';

import Image from 'next/image';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare } from 'lucide-react';
import AdminControls from './AdminControls';
import OwnerDeleteButton from './OwnerDeleteButton';
import VoteControls from './VoteControls';

interface PostProps {
  id: string;
  threadId: string;
  content: string;
  imageUrl?: string | null;
  createdAt: string;
  isOp?: boolean;
  index?: number;
  authorIsAdmin?: boolean;
  viewerIsAdmin?: boolean;
  upvotes?: number;
  downvotes?: number;
  replyCount?: number;
  allowDiscussion?: boolean;
  deleteRedirectTo?: string;
}

export default function Post({
  id, threadId, content, imageUrl, createdAt, isOp = false, index,
  authorIsAdmin = false, viewerIsAdmin = false, upvotes = 0, downvotes = 0,
  replyCount = 0, allowDiscussion = true, deleteRedirectTo,
}: PostProps) {
  const discussionHref = !isOp && allowDiscussion ? `/forum/${threadId}/comments/${id}` : null;
  const formatted = content.split('\n').map((line, lineIndex) => (
    <span key={lineIndex} className={`block ${line.trim().startsWith('>') ? 'text-green-500' : ''}`}>{line || '\u00a0'}</span>
  ));

  return (
    <article className={`relative mb-4 overflow-hidden border p-4 transition-colors ${isOp ? 'border-primary/50 bg-primary/5' : 'border-border bg-card'} ${discussionHref ? 'hover:border-primary/50' : ''}`}>
      {discussionHref && <Link href={discussionHref} className="absolute inset-0 z-0" aria-label={`Open discussion for comment ${id.slice(0, 8)}`} />}
      <div className={discussionHref ? 'pointer-events-none relative z-[1]' : ''}>
        <header className="mb-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span className={`font-bold ${authorIsAdmin ? 'text-primary' : 'text-foreground'}`}>{authorIsAdmin ? 'Admin ◆' : 'Anonymous'}</span>
          <span>{formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</span>
          <span className="text-xs opacity-50">No. {id.slice(0, 8)}</span>
          {index !== undefined && <span className="ml-auto">#{index + 1}</span>}
        </header>
        <div className="flex flex-col gap-4 md:flex-row">
          {imageUrl && (
            <div className="relative h-48 w-full flex-none overflow-hidden border border-border bg-[#09090b] md:w-64">
              <Image src={imageUrl} alt="Generated ASCII attachment" fill unoptimized className="object-contain" />
            </div>
          )}
          <div className="min-w-0 flex-1 break-words font-mono text-sm md:text-base">{formatted}</div>
        </div>
      </div>
      <footer className="relative z-10 mt-3 flex items-center justify-end gap-3 border-t border-border/40 pt-2 text-muted-foreground">
        {discussionHref && (
          <Link href={discussionHref} className="mr-auto flex items-center gap-1 text-xs hover:text-primary">
            <MessageSquare size={14} /> {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
          </Link>
        )}
        <VoteControls targetType={isOp ? 'thread' : 'post'} targetId={id} upvotes={upvotes} downvotes={downvotes} />
        {viewerIsAdmin ? (
          <AdminControls targetType={isOp ? 'thread' : 'post'} targetId={id} redirectTo={deleteRedirectTo} />
        ) : (
          <OwnerDeleteButton targetType={isOp ? 'thread' : 'post'} targetId={id} redirectTo={deleteRedirectTo} />
        )}
      </footer>
    </article>
  );
}
