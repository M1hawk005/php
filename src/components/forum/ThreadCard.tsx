'use client';

import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Pin } from 'lucide-react';
import AdminControls from './AdminControls';
import OwnerDeleteButton from './OwnerDeleteButton';
import VoteControls from './VoteControls';

interface ThreadCardProps {
  id: string;
  title?: string | null;
  content: string;
  imageUrl?: string | null;
  createdAt: string;
  replyCount: number;
  upvotes?: number;
  downvotes?: number;
  authorIsAdmin?: boolean;
  pinned?: boolean;
  archived?: boolean;
  viewerIsAdmin?: boolean;
}

export default function ThreadCard({
  id, title, content, imageUrl, createdAt, replyCount,
  upvotes = 0, downvotes = 0, authorIsAdmin = false,
  pinned = false, archived = false, viewerIsAdmin = false,
}: ThreadCardProps) {
  const formattedContent = content.split('\n').map((line, index) => (
    <span key={index} className={`block ${line.trim().startsWith('>') ? 'text-green-500' : ''}`}>
      {line || '\u00a0'}
    </span>
  ));

  return (
    <article className={`flex h-full flex-col border bg-card p-4 transition-colors ${pinned ? 'border-primary/60' : 'border-border hover:border-primary/50'} ${archived ? 'opacity-60' : ''}`}>
      <Link href={`/forum/${id}`} className="group block">
        <div className="mb-3 flex items-start gap-4">
          {imageUrl ? (
            <div className="relative h-24 w-24 flex-none overflow-hidden border border-border bg-[#09090b]">
              <Image src={imageUrl} alt="Generated ASCII attachment" fill unoptimized className="object-contain transition-transform duration-300 group-hover:scale-105" />
            </div>
          ) : (
            <div className="flex h-24 w-24 flex-none items-center justify-center bg-muted/20 p-2 text-center text-xs text-muted-foreground">No Image</div>
          )}
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              {pinned && <Pin size={14} className="text-primary" aria-label="Pinned" />}
              <h2 className="truncate text-lg font-bold text-foreground transition-colors group-hover:text-primary">{title || 'Untitled Thread'}</h2>
            </div>
            <div className="mb-2 text-xs text-muted-foreground">
              <span className={authorIsAdmin ? 'font-bold text-primary' : ''}>{authorIsAdmin ? 'Admin ◆' : 'Anonymous'}</span>
              {' • '}{formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
              {archived && <span className="ml-2 text-amber-400">Archived</span>}
            </div>
            <div className="line-clamp-4 whitespace-pre-wrap break-words font-mono text-sm text-muted-foreground">{formattedContent}</div>
          </div>
        </div>
      </Link>
      <div className="mt-auto flex items-center justify-between border-t border-border/50 pt-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><MessageSquare size={14} />{replyCount} Comments</span>
        <div className="flex items-center gap-3">
          <VoteControls targetType="thread" targetId={id} upvotes={upvotes} downvotes={downvotes} />
          {viewerIsAdmin ? (
            <AdminControls targetType="thread" targetId={id} pinned={pinned} archived={archived} />
          ) : (
            <OwnerDeleteButton targetType="thread" targetId={id} />
          )}
          <Link href={`/forum/${id}`} className="hover:text-primary">View →</Link>
        </div>
      </div>
    </article>
  );
}
