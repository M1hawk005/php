/* eslint-disable @next/next/no-img-element -- previews are local generated data URLs */
'use client';

import { useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { createReply } from '@/actions/forum';
import { FORUM_LIMITS } from '@/lib/forum-limits';
import { getForumVisitorId, rememberForumItem } from '@/lib/forum-visitor';
import AsciiArtGenerator from './AsciiArtGenerator';

type Props = {
  threadId: string;
  parentPostId?: string;
};

export default function ReplyForm({ threadId, parentPostId }: Props) {
  const [content, setContent] = useState('');
  const [asciiImage, setAsciiImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!content.trim()) return;
    setIsSubmitting(true);
    setError(null);
    const data = new FormData();
    data.set('threadId', threadId);
    data.set('content', content);
    data.set('ownerId', getForumVisitorId());
    if (parentPostId) data.set('parentPostId', parentPostId);
    if (asciiImage) data.set('imageUrl', asciiImage);
    const result = await createReply(data);
    setIsSubmitting(false);
    if (result.error) return setError(result.error);
    if ('post' in result && result.post) rememberForumItem(result.post.id);
    setContent('');
    setAsciiImage(null);
  }

  return (
    <section className="mt-8 border border-border bg-card p-6 shadow-sm">
      <h2 className="mb-1 text-lg font-bold">{parentPostId ? 'Reply to this comment' : 'Post a Comment'}</h2>
      {parentPostId && <p className="mb-4 text-xs text-muted-foreground">Replies stop at this level; they do not open additional discussion pages.</p>}
      {error && <p className="mb-4 border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-400">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea value={content} onChange={(event) => setContent(event.target.value)} maxLength={FORUM_LIMITS.content} required rows={4} placeholder="Comment. Lines beginning with > become greentext." className="w-full resize-y border border-border bg-background p-3 font-mono text-sm outline-none focus:border-primary" />
        {asciiImage ? (
          <div className="relative inline-block border border-border bg-[#09090b] p-2">
            <img src={asciiImage} alt="Attached ASCII art" className="max-h-40 object-contain" />
            <button type="button" onClick={() => setAsciiImage(null)} className="absolute right-1 top-1 bg-black/70 p-1 text-white" aria-label="Remove attachment"><X size={12} /></button>
          </div>
        ) : <AsciiArtGenerator onAsciiGenerated={setAsciiImage} />}
        <div className="flex justify-end border-t border-border pt-4">
          <button disabled={isSubmitting} className="flex items-center gap-2 bg-primary px-8 py-2 font-bold text-primary-foreground disabled:opacity-50">
            {isSubmitting && <Loader2 size={16} className="animate-spin" />} {parentPostId ? 'Reply to Comment' : 'Post Comment'}
          </button>
        </div>
      </form>
    </section>
  );
}
