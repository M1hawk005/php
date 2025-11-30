'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { Loader2, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReplyFormProps {
    threadId: string;
}

export default function ReplyForm({ threadId }: ReplyFormProps) {
    const [content, setContent] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        setIsSubmitting(true);
        setError(null);

        try {
            let imageUrl = null;

            if (image) {
                const fileExt = image.name.split('.').pop();
                const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
                const filePath = `${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('forum-images')
                    .upload(filePath, image);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('forum-images')
                    .getPublicUrl(filePath);

                imageUrl = publicUrl;
            }

            // Insert the reply
            const secretKey = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

            const { data: postData, error: insertError } = await supabase
                .from('posts')
                .insert({
                    thread_id: threadId,
                    content: content.trim(),
                    image_url: imageUrl,
                    secret_key: secretKey,
                })
                .select()
                .single();

            if (insertError) throw insertError;

            // Bump the thread
            await supabase
                .from('threads')
                .update({
                    bumped_at: new Date().toISOString(),
                    // We can't increment easily without a function, but we can trigger a re-fetch or use a trigger
                    // For now, let's just update the timestamp. The count is handled by a separate query or trigger ideally.
                    // Let's manually increment for now if we want, but simpler to just update timestamp.
                })
                .eq('id', threadId);

            // Increment reply count (best effort)
            // Ideally this should be a database trigger or RPC
            const { data: thread } = await supabase.from('threads').select('reply_count').eq('id', threadId).single();
            if (thread) {
                await supabase.from('threads').update({ reply_count: (thread.reply_count || 0) + 1 }).eq('id', threadId);
            }

            // Save secret key to localStorage
            if (postData) {
                const storedKeys = JSON.parse(localStorage.getItem('php_forum_keys') || '{}');
                storedKeys[postData.id] = secretKey;
                localStorage.setItem('php_forum_keys', JSON.stringify(storedKeys));
            }

            setContent('');
            setImage(null);
            router.refresh();
        } catch (err: any) {
            console.error('Error creating reply:', err);
            setError(err.message || 'Failed to post reply');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-card border border-border rounded-md p-6 mt-8">
            <h3 className="text-lg font-bold text-primary mb-4">Post a Reply</h3>

            {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded mb-4 text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <textarea
                        placeholder="Comment"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                        rows={4}
                        className="w-full bg-background border border-border rounded p-2 focus:border-primary focus:outline-none font-mono text-sm"
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <label className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded border cursor-pointer transition-colors text-sm",
                            image ? "bg-primary/10 border-primary text-primary" : "bg-background border-border hover:border-primary/50"
                        )}>
                            <ImageIcon size={16} />
                            {image ? 'Image Selected' : 'Upload Image'}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setImage(e.target.files?.[0] || null)}
                                className="hidden"
                            />
                        </label>
                        {image && (
                            <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                                {image.name}
                            </span>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-primary text-primary-foreground px-6 py-2 rounded font-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                    >
                        {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                        Reply
                    </button>
                </div>
            </form>
        </div>
    );
}
