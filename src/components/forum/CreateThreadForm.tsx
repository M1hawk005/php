/* eslint-disable @next/next/no-img-element -- previews are local generated data URLs */
'use client';

import { useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { createThread } from '@/actions/forum';
import { FORUM_LIMITS } from '@/lib/forum-limits';
import { getForumVisitorId, rememberForumItem } from '@/lib/forum-visitor';
import AsciiArtGenerator from './AsciiArtGenerator';

export default function CreateThreadForm() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [asciiImage, setAsciiImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!content.trim()) return;
    setIsSubmitting(true);
    setError(null);
    const data = new FormData();
    data.set('title', title);
    data.set('content', content);
    data.set('ownerId', getForumVisitorId());
    if (asciiImage) data.set('imageUrl', asciiImage);
    const result = await createThread(data);
    setIsSubmitting(false);
    if (result.error) return setError(result.error);
    if ('thread' in result && result.thread) rememberForumItem(result.thread.id);
    setTitle('');
    setContent('');
    setAsciiImage(null);
    setIsOpen(false);
  }

  if (!isOpen) {
    return <button onClick={() => setIsOpen(true)} className="w-full border border-dashed border-border p-4 text-center text-muted-foreground transition-colors hover:border-primary hover:text-primary">+ Start a New Thread</button>;
  }

  return (
    <section className="border border-border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold">New Thread</h2>
        <button onClick={() => setIsOpen(false)} aria-label="Close thread form"><X size={20} /></button>
      </div>
      {error && <p className="mb-4 border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-400">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={FORUM_LIMITS.title} placeholder="Subject (optional)" className="w-full border border-border bg-background p-3 outline-none focus:border-primary" />
        <textarea value={content} onChange={(event) => setContent(event.target.value)} maxLength={FORUM_LIMITS.content} required rows={6} placeholder="Comment. Lines beginning with > become greentext." className="w-full resize-y border border-border bg-background p-3 font-mono text-sm outline-none focus:border-primary" />
        {asciiImage ? (
          <div className="relative inline-block border border-border bg-[#09090b] p-2">
            <img src={asciiImage} alt="Attached ASCII art" className="max-h-40 object-contain" />
            <button type="button" onClick={() => setAsciiImage(null)} className="absolute right-1 top-1 bg-black/70 p-1 text-white" aria-label="Remove attachment"><X size={12} /></button>
          </div>
        ) : <AsciiArtGenerator onAsciiGenerated={setAsciiImage} />}
        <div className="flex justify-end border-t border-border pt-4">
          <button disabled={isSubmitting} className="flex items-center gap-2 bg-primary px-8 py-2 font-bold text-primary-foreground disabled:opacity-50">
            {isSubmitting && <Loader2 size={16} className="animate-spin" />} Post Thread
          </button>
        </div>
      </form>
    </section>
  );
}
