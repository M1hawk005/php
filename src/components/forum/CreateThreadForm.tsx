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
    return <button onClick={() => setIsOpen(true)} className="min-h-12 w-full border border-dashed border-border p-3 text-center text-muted-foreground transition-colors hover:border-primary hover:text-primary sm:p-4">+ Start a New Thread</button>;
  }

  return (
    <section className="border border-border bg-card p-4 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold">New Thread</h2>
        <button type="button" onClick={() => setIsOpen(false)} className="flex min-h-11 min-w-11 items-center justify-center" aria-label="Close thread form"><X size={20} /></button>
      </div>
      {error && <p className="mb-4 border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-400" role="alert">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="thread-subject" className="text-sm font-medium text-muted-foreground">Subject (optional)</label>
          <input id="thread-subject" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={FORUM_LIMITS.title} placeholder="Enter a subject..." className="min-h-12 w-full border border-border bg-background p-3 outline-none focus:border-primary" />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="thread-comment" className="text-sm font-medium text-muted-foreground">Comment <span className="text-primary" aria-label="required">*</span></label>
          <textarea id="thread-comment" value={content} onChange={(event) => setContent(event.target.value)} maxLength={FORUM_LIMITS.content} required rows={6} placeholder="Lines beginning with > become greentext." className="w-full resize-y border border-border bg-background p-3 font-mono text-base outline-none focus:border-primary sm:text-sm" />
        </div>
        {asciiImage ? (
          <div className="relative inline-block border border-border bg-[#09090b] p-2">
            <img src={asciiImage} alt="Attached ASCII art" className="max-h-40 object-contain" />
            <button type="button" onClick={() => setAsciiImage(null)} className="absolute right-1 top-1 flex min-h-11 min-w-11 items-center justify-center bg-black/70 text-white" aria-label="Remove attachment"><X size={16} /></button>
          </div>
        ) : <AsciiArtGenerator onAsciiGenerated={setAsciiImage} />}
        <div className="flex justify-end border-t border-border pt-4">
          <button disabled={isSubmitting} className="flex min-h-12 w-full items-center justify-center gap-2 bg-primary px-8 py-2 font-bold text-primary-foreground disabled:opacity-50 sm:w-auto">
            {isSubmitting && <Loader2 size={16} className="animate-spin" />} Post Thread
          </button>
        </div>
      </form>
    </section>
  );
}
