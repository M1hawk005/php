'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { Loader2, Image as ImageIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CreateThreadForm() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false);
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

            const secretKey = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

            const { data: threadData, error: insertError } = await supabase
                .from('threads')
                .insert({
                    title: title.trim() || null,
                    content: content.trim(),
                    image_url: imageUrl,
                    secret_key: secretKey,
                })
                .select()
                .single();

            if (insertError) throw insertError;

            // Save secret key to localStorage
            if (threadData) {
                const storedKeys = JSON.parse(localStorage.getItem('php_forum_keys') || '{}');
                storedKeys[threadData.id] = secretKey;
                localStorage.setItem('php_forum_keys', JSON.stringify(storedKeys));
            }

            setTitle('');
            setContent('');
            setImage(null);
            setIsOpen(false);
            router.refresh();
        } catch (err: any) {
            console.error('Error creating thread:', err);
            setError(err.message || 'Failed to create thread');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="w-full p-4 border border-dashed border-border rounded-md text-muted-foreground hover:text-primary hover:border-primary transition-colors text-center"
            >
                + Start a New Thread
            </button>
        );
    }

    return (
        <div className="bg-card border border-border rounded-md p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-primary">New Thread</h3>
                <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
                    <X size={20} />
                </button>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded mb-4 text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <input
                        type="text"
                        placeholder="Subject (Optional)"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-background border border-border rounded p-2 focus:border-primary focus:outline-none"
                    />
                </div>

                <div>
                    <textarea
                        placeholder="Content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                        rows={5}
                        className="w-full bg-background border border-border rounded p-2 focus:border-primary focus:outline-none font-mono text-sm"
                    />
                </div>

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

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-primary text-primary-foreground px-6 py-2 rounded font-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                    >
                        {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                        Post
                    </button>
                </div>
            </form>
        </div>
    );
}
